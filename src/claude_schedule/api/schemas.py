from enum import Enum

from pydantic import BaseModel, Field, ValidationInfo, field_validator

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
    url: str = Field(min_length=1)


class ParseUrlResponse(BaseModel):
    owner: str
    repository: str
    issue_number: int


class PostCommentRequest(BaseModel):
    body: str = Field(min_length=1, max_length=65536)

    @field_validator("body")
    @classmethod
    def _strip_body(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("body must not be empty")
        return value


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
    title: str = Field(min_length=1, max_length=256)
    environment: str | None = None
    base_branch: str | None = None
    severity: str | None = None
    steps_to_reproduce: str = Field(min_length=1)
    expected_result: str = Field(min_length=1)
    actual_result: str = Field(min_length=1)
    additional_notes: str | None = None
    assignee: str | None = None

    @field_validator("environment", "base_branch", "severity")
    @classmethod
    def _validate_label_length(cls, value: str | None, info: ValidationInfo) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            return None
        field_name = info.field_name
        if field_name is None:
            return value
        prefix = LABEL_PREFIXES[field_name]
        max_value_length = GITHUB_LABEL_MAX_LENGTH - len(prefix)
        if len(value) > max_value_length:
            raise ValueError(
                f"{field_name} must be at most {max_value_length} characters long "
                f"(GitHub labels are capped at {GITHUB_LABEL_MAX_LENGTH} characters, "
                f"and this value is prefixed with {prefix!r})"
            )
        return value

    @field_validator("title", "steps_to_reproduce", "expected_result", "actual_result")
    @classmethod
    def _strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be empty")
        return value

    @field_validator("additional_notes", "assignee")
    @classmethod
    def _strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class CreateIssueResponse(BaseModel):
    issue: Issue


class FixBranchesResponse(BaseModel):
    """Branch candidates for the Pull Request that hands Fix over to Review."""

    base_branch: str
    branches: list[str]


class CreatePullRequestRequest(BaseModel):
    head: str = Field(min_length=1, max_length=255)
    base: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=256)


class CreatePullRequestResponse(BaseModel):
    pull_request: PullRequest


class MergeMethod(str, Enum):
    MERGE = "merge"
    SQUASH = "squash"
    REBASE = "rebase"


class MergePullRequestRequest(BaseModel):
    merge_method: MergeMethod = MergeMethod.SQUASH


class MergePullRequestResponse(BaseModel):
    pull_request: PullRequest


class CloseIssueResponse(BaseModel):
    issue: Issue
