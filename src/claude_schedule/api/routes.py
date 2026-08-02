import asyncio

from fastapi import APIRouter, Depends

from claude_schedule.api.deps import ensure_repository_allowed, get_github_service
from claude_schedule.api.issue_template import build_bug_report_body, build_labels_from_metadata
from claude_schedule.api.schemas import (
    CheckpointRequest,
    CommentResponse,
    ConfigResponse,
    CreateIssueRequest,
    CreateIssueResponse,
    IssueDetailResponse,
    ParseUrlRequest,
    ParseUrlResponse,
    PostCommentRequest,
)
from claude_schedule.github.errors import PullRequestNotFoundError
from claude_schedule.github.models import CheckRun, Comment, Commit
from claude_schedule.github.service import GitHubService
from claude_schedule.github.url_parser import parse_issue_url
from claude_schedule.lifecycle.engine import infer_stage
from claude_schedule.lifecycle.models import CHECKPOINT_TARGET, build_checkpoint_comment
from claude_schedule.lifecycle.timeline import merge_and_categorize
from claude_schedule.settings import Settings, get_settings

router = APIRouter(prefix="/api")


@router.post("/issues/parse-url", response_model=ParseUrlResponse)
async def parse_url(payload: ParseUrlRequest) -> ParseUrlResponse:
    owner, repository, issue_number = parse_issue_url(payload.url)
    return ParseUrlResponse(owner=owner, repository=repository, issue_number=issue_number)


@router.get("/config", response_model=ConfigResponse)
async def get_config(settings: Settings = Depends(get_settings)) -> ConfigResponse:
    return ConfigResponse(owner=settings.github_owner, repository=settings.github_repository)


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
        pr_comments, pr_commits, pr_checks = await asyncio.gather(
            service.get_pull_request_comments(owner, repository, linked_pull_request.number),
            service.get_pull_request_commits(owner, repository, linked_pull_request.number),
            service.get_pull_request_checks(
                owner,
                repository,
                linked_pull_request.number,
                head_sha=linked_pull_request.head_sha,
            ),
        )

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
    target = CHECKPOINT_TARGET[payload.checkpoint]

    if target == "issue":
        comment = await service.post_issue_comment(owner, repository, issue_number, body)
    else:
        linked_pull_request = await service.find_linked_pull_request(owner, repository, issue_number)
        if linked_pull_request is None:
            raise PullRequestNotFoundError("No linked Pull Request found to post this checkpoint to")
        comment = await service.post_pull_request_comment(owner, repository, linked_pull_request.number, body)

    return CommentResponse(comment=comment)
