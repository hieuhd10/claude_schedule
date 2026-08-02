from enum import Enum

from pydantic import BaseModel


class Stage(str, Enum):
    DEBUG = "debug"
    FIX = "fix"
    REVIEW = "review"
    TEST = "test"
    READY_TO_MERGE = "ready_to_merge"
    COMPLETED = "completed"


class Checkpoint(str, Enum):
    DEBUG_APPROVED = "DEBUG_APPROVED"
    PR_READY_FOR_REVIEW = "PR_READY_FOR_REVIEW"
    REVIEW_CONFIRMED = "REVIEW_CONFIRMED"
    TEST_CONFIRMED = "TEST_CONFIRMED"
    PR_MERGED = "PR_MERGED"


# Which real GitHub thread a checkpoint marker comment gets posted to.
CHECKPOINT_TARGET: dict[Checkpoint, str] = {
    Checkpoint.DEBUG_APPROVED: "issue",
    Checkpoint.PR_READY_FOR_REVIEW: "pull_request",
    Checkpoint.REVIEW_CONFIRMED: "pull_request",
    Checkpoint.TEST_CONFIRMED: "pull_request",
    Checkpoint.PR_MERGED: "pull_request",
}

CHECKPOINT_DESCRIPTIONS: dict[Checkpoint, str] = {
    Checkpoint.DEBUG_APPROVED: "Debug result has been reviewed and accepted",
    Checkpoint.PR_READY_FOR_REVIEW: "Pull Request has been marked ready for review",
    Checkpoint.REVIEW_CONFIRMED: "Review result has been confirmed",
    Checkpoint.TEST_CONFIRMED: "Test result has been confirmed",
    Checkpoint.PR_MERGED: "Pull Request merge has been confirmed",
}


def build_checkpoint_comment(checkpoint: Checkpoint, username: str) -> str:
    description = CHECKPOINT_DESCRIPTIONS[checkpoint]
    actor = f"@{username.strip()}" if username.strip() else "the operator"
    return f"[LIFECYCLE:{checkpoint.value}]\n\n{description} by {actor}."


class ParsedClaudeResponse(BaseModel):
    raw_body: str
    is_structured: bool
    root_cause: str | None = None
    findings: list[str] = []
    test_result: str | None = None


class LifecycleResult(BaseModel):
    stage: Stage
    reasoning: list[str]
    last_command: str | None
    last_claude_response: ParsedClaudeResponse | None
    next_recommended_action: str
    review_findings: list[str] = []
    test_result: str | None = None


class ActivityCategory(str, Enum):
    HUMAN_COMMAND = "human_command"
    CLAUDE_RESPONSE = "claude_response"
    GITHUB_SYSTEM = "github_system"
    CI_WORKFLOW = "ci_workflow"


class ActivityItem(BaseModel):
    category: ActivityCategory
    source: str  # e.g. "Issue #128", "Pull Request #5", "Check: tests"
    actor: str | None
    summary: str
    created_at: str | None  # ISO 8601 string, kept as-is from the underlying model
    html_url: str | None
