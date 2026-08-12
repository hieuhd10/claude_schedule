import asyncio

from fastapi import APIRouter, Depends

from claude_schedule.api.deps import ensure_repository_allowed, get_github_service
from claude_schedule.api.issue_template import build_bug_report_body, build_labels_from_metadata
from claude_schedule.api.schemas import (
    LABEL_PREFIXES,
    CheckpointRequest,
    CloseIssueResponse,
    CommentResponse,
    ConfigResponse,
    CreateIssueRequest,
    CreateIssueResponse,
    CreatePullRequestRequest,
    CreatePullRequestResponse,
    FixBranchesResponse,
    IssueDetailResponse,
    MergePullRequestRequest,
    MergePullRequestResponse,
    MultiRepoConfigResponse,
    ParseUrlRequest,
    ParseUrlResponse,
    PostCommentRequest,
    RepoTokenMapping,
    ValidateRepoTokenRequest,
    ValidateRepoTokenResponse,
)
from claude_schedule.github.models import CheckRun, Comment, Commit
from claude_schedule.github.service import GitHubService
from claude_schedule.github.url_parser import parse_issue_url
from claude_schedule.lifecycle.engine import infer_stage
from claude_schedule.lifecycle.models import build_checkpoint_comment
from claude_schedule.lifecycle.timeline import merge_and_categorize
from claude_schedule.settings import Settings, get_settings

router = APIRouter(prefix="/api")


def _base_branch_from_labels(labels: list[str]) -> str | None:
    prefix = LABEL_PREFIXES["base_branch"]
    for label in labels:
        if label.startswith(prefix):
            return label[len(prefix) :] or None
    return None


def _rank_fix_branches(branches: list[str], issue_number: int, base_branch: str) -> list[str]:
    """Branches naming this issue first - that is what the Claude workflow pushes."""
    marker = f"issue-{issue_number}"
    named = [name for name in branches if marker in name]
    others = [name for name in branches if marker not in name and name != base_branch]
    return named + others


@router.post("/issues/parse-url", response_model=ParseUrlResponse)
async def parse_url(payload: ParseUrlRequest) -> ParseUrlResponse:
    owner, repository, issue_number = parse_issue_url(payload.url)
    return ParseUrlResponse(owner=owner, repository=repository, issue_number=issue_number)


@router.get("/config", response_model=ConfigResponse)
async def get_config(settings: Settings = Depends(get_settings)) -> ConfigResponse:
    return ConfigResponse(owner=settings.github_owner, repository=settings.github_repository)


@router.get("/config/multi-repo", response_model=MultiRepoConfigResponse)
async def get_multi_repo_config(
    settings: Settings = Depends(get_settings),
) -> MultiRepoConfigResponse:
    import json

    configured: list[RepoTokenMapping] = []
    try:
        mapping: dict[str, str] = json.loads(settings.repo_token_map_json or "{}")
        for repo_key, token_val in mapping.items():
            configured.append(
                RepoTokenMapping(
                    repository_full_name=repo_key,
                    has_custom_token=bool(token_val),
                )
            )
    except (json.JSONDecodeError, TypeError, AttributeError):
        pass

    return MultiRepoConfigResponse(
        default_owner=settings.github_owner,
        default_repository=settings.github_repository,
        restrict_to_configured_repository=settings.restrict_to_configured_repository,
        configured_repositories=configured,
    )


@router.post("/config/repo-tokens/validate", response_model=ValidateRepoTokenResponse)
async def validate_repo_token(payload: ValidateRepoTokenRequest) -> ValidateRepoTokenResponse:
    token = payload.token.strip()
    if not token.startswith(("ghp_", "github_pat_", "gho_")):
        return ValidateRepoTokenResponse(
            valid=False,
            message="Token format should begin with ghp_, github_pat_, or gho_",
        )
    return ValidateRepoTokenResponse(
        valid=True,
        message="Token format is valid and recognized as a GitHub Personal Access Token",
    )


@router.post("/issues/{owner}/{repository}", response_model=CreateIssueResponse)
async def create_issue(
    owner: str,
    repository: str,
    payload: CreateIssueRequest,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> CreateIssueResponse:
    ensure_repository_allowed(owner, repository, settings)
    body = build_bug_report_body(payload)
    labels = build_labels_from_metadata(payload)
    issue = await service.create_issue(owner, repository, payload.title, body, labels, payload.assignee)
    return CreateIssueResponse(issue=issue)


@router.get("/issues/{owner}/{repository}/{issue_number}", response_model=IssueDetailResponse)
async def get_issue_detail(
    owner: str,
    repository: str,
    issue_number: int,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> IssueDetailResponse:
    ensure_repository_allowed(owner, repository, settings)
    issue, issue_comments, timeline_events = await asyncio.gather(
        service.get_issue(owner, repository, issue_number),
        service.get_issue_comments(owner, repository, issue_number),
        service.get_issue_timeline(owner, repository, issue_number),
    )
    linked_pull_request = await service.find_linked_pull_request(
        owner,
        repository,
        issue_number,
        timeline=timeline_events,
    )

    pr_comments: list[Comment] = []
    pr_commits: list[Commit] = []
    pr_checks: list[CheckRun] = []
    if linked_pull_request is not None:
        conversation, reviews, pr_commits, pr_checks = await asyncio.gather(
            service.get_pull_request_comments(owner, repository, linked_pull_request.number),
            service.get_pull_request_reviews(owner, repository, linked_pull_request.number),
            service.get_pull_request_commits(owner, repository, linked_pull_request.number),
            service.get_pull_request_checks(
                owner,
                repository,
                linked_pull_request.number,
                head_sha=linked_pull_request.head_sha,
            ),
        )
        # Reviews and conversation comments are one record of what was said on the
        # Pull Request; result markers count from either.
        pr_comments = sorted(conversation + reviews, key=lambda comment: comment.created_at)

    lifecycle = infer_stage(
        issue=issue,
        issue_comments=issue_comments,
        linked_pull_request=linked_pull_request,
        pr_comments=pr_comments,
        checks=pr_checks,
        claude_bot_login=settings.claude_bot_login,
    )
    activity = merge_and_categorize(
        issue_number=issue_number,
        issue_comments=issue_comments,
        pull_request=linked_pull_request,
        pr_comments=pr_comments,
        pr_commits=pr_commits,
        checks=pr_checks,
        timeline_events=timeline_events,
        claude_bot_login=settings.claude_bot_login,
    )

    return IssueDetailResponse(
        issue=issue,
        comments=issue_comments,
        linked_pull_request=linked_pull_request,
        pr_comments=pr_comments,
        pr_commits=pr_commits,
        pr_checks=pr_checks,
        activity=activity,
        lifecycle=lifecycle,
    )


@router.post("/issues/{owner}/{repository}/{issue_number}/comments", response_model=CommentResponse)
async def post_issue_comment(
    owner: str,
    repository: str,
    issue_number: int,
    payload: PostCommentRequest,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> CommentResponse:
    ensure_repository_allowed(owner, repository, settings)
    comment = await service.post_issue_comment(owner, repository, issue_number, payload.body)
    return CommentResponse(comment=comment)


@router.post("/pull-requests/{owner}/{repository}/{pr_number}/comments", response_model=CommentResponse)
async def post_pull_request_comment(
    owner: str,
    repository: str,
    pr_number: int,
    payload: PostCommentRequest,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> CommentResponse:
    ensure_repository_allowed(owner, repository, settings)
    comment = await service.post_pull_request_comment(owner, repository, pr_number, payload.body)
    return CommentResponse(comment=comment)


@router.post("/issues/{owner}/{repository}/{issue_number}/checkpoints", response_model=CommentResponse)
async def post_checkpoint(
    owner: str,
    repository: str,
    issue_number: int,
    payload: CheckpointRequest,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> CommentResponse:
    ensure_repository_allowed(owner, repository, settings)
    body = build_checkpoint_comment(payload.checkpoint, settings.operator_github_username)
    comment = await service.post_issue_comment(owner, repository, issue_number, body)
    return CommentResponse(comment=comment)


@router.get(
    "/issues/{owner}/{repository}/{issue_number}/fix-branches",
    response_model=FixBranchesResponse,
)
async def get_fix_branches(
    owner: str,
    repository: str,
    issue_number: int,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> FixBranchesResponse:
    """Branches that could carry the fix, plus the branch a Pull Request would target."""
    ensure_repository_allowed(owner, repository, settings)
    issue, default_branch, branches = await asyncio.gather(
        service.get_issue(owner, repository, issue_number),
        service.get_default_branch(owner, repository),
        service.list_branches(owner, repository),
    )
    base_branch = _base_branch_from_labels(issue.labels) or default_branch
    return FixBranchesResponse(
        base_branch=base_branch,
        branches=_rank_fix_branches(branches, issue_number, base_branch),
    )


@router.post(
    "/issues/{owner}/{repository}/{issue_number}/pull-request",
    response_model=CreatePullRequestResponse,
)
async def create_pull_request(
    owner: str,
    repository: str,
    issue_number: int,
    payload: CreatePullRequestRequest,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> CreatePullRequestResponse:
    ensure_repository_allowed(owner, repository, settings)
    issue = await service.get_issue(owner, repository, issue_number)
    base = payload.base or _base_branch_from_labels(issue.labels)
    if not base:
        base = await service.get_default_branch(owner, repository)
    title = payload.title or f"Fix #{issue_number}: {issue.title}"
    # The closing keyword is what links the Pull Request back to the issue, and that
    # link is how the lifecycle finds it. Without it the flow would stay on Fix.
    pull_request = await service.create_pull_request(
        owner,
        repository,
        title=title[:256],
        head=payload.head,
        base=base,
        body=f"Closes #{issue_number}",
    )
    return CreatePullRequestResponse(pull_request=pull_request)


@router.post(
    "/pull-requests/{owner}/{repository}/{pr_number}/merge",
    response_model=MergePullRequestResponse,
)
async def merge_pull_request(
    owner: str,
    repository: str,
    pr_number: int,
    payload: MergePullRequestRequest,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> MergePullRequestResponse:
    ensure_repository_allowed(owner, repository, settings)
    pull_request = await service.merge_pull_request(
        owner,
        repository,
        pr_number,
        merge_method=payload.merge_method.value,
    )
    return MergePullRequestResponse(pull_request=pull_request)


@router.post("/issues/{owner}/{repository}/{issue_number}/close", response_model=CloseIssueResponse)
async def close_issue(
    owner: str,
    repository: str,
    issue_number: int,
    service: GitHubService = Depends(get_github_service),
    settings: Settings = Depends(get_settings),
) -> CloseIssueResponse:
    """
    Closing is what moves the flow to Completed. A merge with a closing keyword
    does it on its own, so this covers the Pull Requests that carry no keyword.
    """
    ensure_repository_allowed(owner, repository, settings)
    issue = await service.close_issue(owner, repository, issue_number)
    return CloseIssueResponse(issue=issue)
