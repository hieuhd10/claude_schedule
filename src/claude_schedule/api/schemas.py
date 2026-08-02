from pydantic import BaseModel, ValidationInfo, field_validator

from claude_schedule.github.models import CheckRun, Comment, Commit, Issue, PullRequest
from claude_schedule.lifecycle.models import ActivityItem, Checkpoint, LifecycleResult

# GitHub rejects label names longer than this many characters.
GITHUB_LABEL_MAX_LENGTH = 50

# Prefixes applied by build_labels_from_metadata() when turning these fields into labels.
LABEL_PREFIXES = {
    "environment": "env:",
    "base_branch": "base:",
    "severity": "severity:",
}


class ParseUrlRequest(BaseModel):
    url: str


class ParseUrlResponse(BaseModel):
    owner: str
    repository: str
    issue_number: int


class PostCommentRequest(BaseModel):
    body: str


class CommentResponse(BaseModel):
    comment: Comment


class CheckpointRequest(BaseModel):
    checkpoint: Checkpoint


class IssueDetailResponse(BaseModel):
    issue: Issue
    comments: list[Comment]
    linked_pull_request: PullRequest | None
    pr_comments: list[Comment]
    pr_commits: list[Commit]
    pr_checks: list[CheckRun]
    activity: list[ActivityItem]
    lifecycle: LifecycleResult


class ConfigResponse(BaseModel):
    owner: str
    repository: str


class CreateIssueRequest(BaseModel):
    title: str
    environment: str | None = None
    base_branch: str | None = None
    severity: str | None = None
    steps_to_reproduce: str
    expected_result: str
    actual_result: str
    additional_notes: str | None = None
    assignee: str | None = None

    @field_validator("environment", "base_branch", "severity")
    @classmethod
    def _validate_label_length(cls, value: str | None, info: ValidationInfo) -> str | None:
        if value is None:
            return value
        prefix = LABEL_PREFIXES[info.field_name]
        max_value_length = GITHUB_LABEL_MAX_LENGTH - len(prefix)
        if len(value) > max_value_length:
            raise ValueError(
                f"{info.field_name} must be at most {max_value_length} characters long "
                f"(GitHub labels are capped at {GITHUB_LABEL_MAX_LENGTH} characters, "
                f"and this value is prefixed with {prefix!r})"
            )
        return value


class CreateIssueResponse(BaseModel):
    issue: Issue
