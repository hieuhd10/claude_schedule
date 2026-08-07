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


def build_checkpoint_comment(checkpoint: Checkpoint, username: str) -> str:
    actor = f"@{username.strip()}" if username.strip() else "the operator"
    return f"[LIFECYCLE:{checkpoint.value}]\n\nDebug result has been reviewed and accepted by {actor}."


class ParsedClaudeResponse(BaseModel):
    raw_body: str
    is_structured: bool
    root_cause: str | None = None
    solution: str | None = None
    findings: list[str] = []
    test_result: str | None = None
    remaining_risk: str | None = None
    summary: str | None = None
    html_url: str | None = None


class StageReport(BaseModel):
    """The latest Claude report that belongs to one stage of the flow."""

    stage: Stage
    actor: str | None = None
    recorded_at: str | None = None  # ISO 8601 string, kept as-is from the underlying model
    response: ParsedClaudeResponse


class StageOwner(BaseModel):
    """Who produced the record that a stage is based on."""

    stage: Stage
    actor: str | None = None
    role: str
    recorded_at: str | None = None  # ISO 8601 string, kept as-is from the underlying model
    source_url: str | None = None


class LifecycleResult(BaseModel):
    stage: Stage
    reasoning: list[str]
    last_command: str | None
    last_claude_response: ParsedClaudeResponse | None
    next_recommended_action: str
    review_findings: list[str] = []
    review_result: str | None = None
    test_result: str | None = None
    # The signals the stage was inferred from, published so the UI states the same
    # conditions the engine gated on instead of recomputing them from raw data.
    debug_approved: bool = False
    checks_green: bool = False
    stage_owners: list[StageOwner] = []
    stage_reports: list[StageReport] = []


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
