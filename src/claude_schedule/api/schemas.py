from pydantic import BaseModel

from claude_schedule.github.models import CheckRun, Comment, Commit, Issue, PullRequest
from claude_schedule.lifecycle.models import ActivityItem, Checkpoint, LifecycleResult


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


class CreateIssueResponse(BaseModel):
    issue: Issue
