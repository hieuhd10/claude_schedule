import re
from datetime import datetime

from claude_schedule.github.models import CheckRun, Comment, Issue, IssueState, PullRequest
from claude_schedule.lifecycle.models import (
    LifecycleResult,
    ParsedClaudeResponse,
    Stage,
    StageOwner,
    StageReport,
)
from claude_schedule.lifecycle.timeline import parse_claude_response

_REVIEW_PASSED_RE = re.compile(r"^\s*REVIEW PASSED\s*$", re.IGNORECASE | re.MULTILINE)
_REVIEW_FAILED_RE = re.compile(r"^\s*REVIEW FAILED\s*$", re.IGNORECASE | re.MULTILINE)
_TEST_PASSED_RE = re.compile(r"^\s*TEST PASSED\s*$", re.IGNORECASE | re.MULTILINE)
_TEST_FAILED_RE = re.compile(r"^\s*TEST FAILED\s*$", re.IGNORECASE | re.MULTILINE)
_DEBUG_APPROVED_RE = re.compile(r"\[LIFECYCLE:DEBUG_APPROVED\]", re.IGNORECASE)
_HUMAN_COMMAND_RE = re.compile(r"^\s*@claude\b", re.IGNORECASE)
_REVIEW_COMMAND_RE = re.compile(r"\breview\b", re.IGNORECASE)
_TEST_COMMAND_RE = re.compile(r"\b(?:test|tests|testing|ci)\b", re.IGNORECASE)
_REVIEW_MARKER_REQUEST_RE = re.compile(r"\bREVIEW (?:PASSED|FAILED)\b", re.IGNORECASE)
_TEST_MARKER_REQUEST_RE = re.compile(r"\bTEST (?:PASSED|FAILED)\b", re.IGNORECASE)


def _command_stage(body: str) -> Stage | None:
    """
    The stage a human command asks to redo, or None if it asks for neither.

    Neither stage owns its keyword: the Review prompt this app sends asks about
    "test coverage", and a test request can name the review it follows. So the
    marker the command asks for decides first, because that names the stage
    outright. The bare keywords only speak for commands that ask for no marker.
    """
    asks_review = bool(_REVIEW_MARKER_REQUEST_RE.search(body))
    asks_test = bool(_TEST_MARKER_REQUEST_RE.search(body))
    if asks_review != asks_test:
        return Stage.REVIEW if asks_review else Stage.TEST

    if _REVIEW_COMMAND_RE.search(body):
        return Stage.REVIEW
    if _TEST_COMMAND_RE.search(body):
        return Stage.TEST
    return None


def _latest_match(
    comments: list[Comment],
    patterns: dict[str, re.Pattern],
    stage: Stage,
) -> tuple[str, Comment] | None:
    """Latest result marker plus the comment that carries it, so its author is known."""
    for comment in sorted(comments, key=lambda item: item.created_at, reverse=True):
        if _HUMAN_COMMAND_RE.match(comment.body):
            # A newer command for this stage starts a fresh attempt and invalidates
            # the previous result. A command aimed at another stage leaves this
            # stage's result alone.
            if _command_stage(comment.body) is stage:
                return None
            continue
        for label, pattern in patterns.items():
            if pattern.search(comment.body):
                return label, comment
    return None


def _find_latest(comments: list[Comment], predicate) -> Comment | None:
    for comment in reversed(comments):
        if predicate(comment):
            return comment
    return None


def _report_stage(body: str, parsed: ParsedClaudeResponse, *, posted_after_close: bool) -> Stage | None:
    """
    Which stage a Claude comment reports on, decided by what the comment itself
    declares. Result markers win over headings because a review or test verdict
    is the stronger statement.
    """
    if _REVIEW_PASSED_RE.search(body) or _REVIEW_FAILED_RE.search(body):
        return Stage.REVIEW
    if _TEST_PASSED_RE.search(body) or _TEST_FAILED_RE.search(body):
        return Stage.TEST
    if parsed.root_cause:
        return Stage.DEBUG
    if parsed.solution:
        return Stage.FIX
    if parsed.summary or parsed.remaining_risk:
        # A merge-readiness check and a closing note carry the same headings, so
        # the headings cannot tell them apart. Whether the issue was already
        # closed when the comment was written can.
        return Stage.COMPLETED if posted_after_close else Stage.READY_TO_MERGE
    return None


def _stage_reports(
    comments: list[Comment],
    claude_bot_login: str,
    closed_at: datetime | None,
) -> list[StageReport]:
    """
    Latest Claude report per stage. Keeping one report per stage is what lets the
    Debug analysis stay on screen after the flow has moved on to Review or Test.
    """
    latest: dict[Stage, StageReport] = {}

    for comment in sorted(comments, key=lambda item: item.created_at):
        if comment.author != claude_bot_login:
            continue
        parsed = parse_claude_response(comment.body, html_url=comment.html_url)
        stage = _report_stage(
            comment.body,
            parsed,
            posted_after_close=closed_at is not None and comment.created_at >= closed_at,
        )
        if stage is None:
            continue
        latest[stage] = StageReport(
            stage=stage,
            actor=comment.author,
            recorded_at=comment.created_at.isoformat(),
            response=parsed,
        )

    return [latest[stage] for stage in Stage if stage in latest]


def _stage_owners(
    *,
    debug_analysis: Comment | None,
    debug_approval: Comment | None,
    linked_pull_request: PullRequest | None,
    review_match: tuple[str, Comment] | None,
    test_match: tuple[str, Comment] | None,
) -> list[StageOwner]:
    """
    Owner of each stage, taken from the record that stage is based on. Stages with no
    provable actor are left out rather than attributed to a guess - GitHub does not
    report who closed an issue or who merged a Pull Request in the data we fetch.
    """
    owners: list[StageOwner] = []

    if debug_approval is not None:
        owners.append(
            StageOwner(
                stage=Stage.DEBUG,
                actor=debug_approval.author,
                role="Approved the debug result",
                recorded_at=debug_approval.created_at.isoformat(),
                source_url=debug_approval.html_url,
            )
        )
    elif debug_analysis is not None:
        owners.append(
            StageOwner(
                stage=Stage.DEBUG,
                actor=debug_analysis.author,
                role="Reported the debug analysis",
                recorded_at=debug_analysis.created_at.isoformat(),
                source_url=debug_analysis.html_url,
            )
        )

    if linked_pull_request is not None:
        owners.append(
            StageOwner(
                stage=Stage.FIX,
                actor=linked_pull_request.author,
                role="Opened the Pull Request",
                recorded_at=linked_pull_request.created_at.isoformat(),
                source_url=linked_pull_request.html_url,
            )
        )

    if review_match is not None:
        label, comment = review_match
        owners.append(
            StageOwner(
                stage=Stage.REVIEW,
                actor=comment.author,
                role=f"Recorded REVIEW {label}",
                recorded_at=comment.created_at.isoformat(),
                source_url=comment.html_url,
            )
        )

    if test_match is not None:
        label, comment = test_match
        owners.append(
            StageOwner(
                stage=Stage.TEST,
                actor=comment.author,
                role=f"Recorded TEST {label}",
                recorded_at=comment.created_at.isoformat(),
                source_url=comment.html_url,
            )
        )

    return owners


def _checks_green(checks: list[CheckRun]) -> bool:
    if not checks:
        return False
    return all(check.conclusion in {"success", "neutral", "skipped"} for check in checks)


def infer_stage(
    *,
    issue: Issue,
    issue_comments: list[Comment],
    linked_pull_request: PullRequest | None,
    pr_comments: list[Comment],
    checks: list[CheckRun],
    claude_bot_login: str,
) -> LifecycleResult:
    all_comments = sorted(issue_comments + pr_comments, key=lambda c: c.created_at)

    last_command_comment = _find_latest(all_comments, lambda c: bool(_HUMAN_COMMAND_RE.match(c.body)))
    last_command = last_command_comment.body if last_command_comment else None

    last_claude_comment = _find_latest(all_comments, lambda c: c.author == claude_bot_login)
    last_claude_response: ParsedClaudeResponse | None = (
        parse_claude_response(last_claude_comment.body, html_url=last_claude_comment.html_url)
        if last_claude_comment
        else None
    )

    debug_approval = _find_latest(issue_comments, lambda c: bool(_DEBUG_APPROVED_RE.search(c.body)))
    debug_approved = debug_approval is not None
    review_match = _latest_match(
        pr_comments,
        {"PASSED": _REVIEW_PASSED_RE, "FAILED": _REVIEW_FAILED_RE},
        Stage.REVIEW,
    )
    test_match = _latest_match(
        pr_comments,
        {"PASSED": _TEST_PASSED_RE, "FAILED": _TEST_FAILED_RE},
        Stage.TEST,
    )
    review_marker = review_match[0] if review_match else None
    test_marker = test_match[0] if test_match else None
    checks_green = _checks_green(checks)

    stage_reports = _stage_reports(all_comments, claude_bot_login, issue.closed_at)
    stage_owners = _stage_owners(
        debug_analysis=last_claude_comment,
        debug_approval=debug_approval,
        linked_pull_request=linked_pull_request,
        review_match=review_match,
        test_match=test_match,
    )

    reasoning: list[str] = []
    review_findings: list[str] = []

    def result(stage: Stage, next_action: str) -> LifecycleResult:
        """
        Every branch reports the same evidence, differing only in the stage it
        lands on. A recorded verdict in particular is reported wherever the flow
        stands - withholding it on the stages that do not gate on it would tell
        the operator to post a marker they already posted.
        """
        return LifecycleResult(
            stage=stage,
            reasoning=reasoning,
            last_command=last_command,
            last_claude_response=last_claude_response,
            next_recommended_action=next_action,
            review_findings=review_findings,
            review_result=review_marker,
            test_result=test_marker,
            debug_approved=debug_approved,
            checks_green=checks_green,
            stage_owners=stage_owners,
            stage_reports=stage_reports,
        )

    if issue.state == IssueState.CLOSED:
        if linked_pull_request and linked_pull_request.merged:
            reasoning.append("Issue is closed and the linked Pull Request is merged.")
        elif linked_pull_request:
            reasoning.append("Issue is closed without the linked Pull Request being merged.")
        else:
            reasoning.append("Issue is closed without a linked Pull Request (e.g. closed as not a bug).")
        return result(Stage.COMPLETED, "No action needed - issue is closed.")

    # A linked PR only advances the flow past Debug/Fix once Debug has been
    # explicitly approved - otherwise a stray cross-referenced PR could skip
    # the Review/Test gate straight from Debug.
    if linked_pull_request is not None and debug_approved:
        # A merged Pull Request is no longer open, so the open-PR branch below
        # would send the flow back to Fix while only the closing step is left.
        if linked_pull_request.merged:
            reasoning.append("The linked Pull Request is merged but the issue is still open.")
            return result(Stage.READY_TO_MERGE, "Close the issue to complete the flow.")

        # A Pull Request closed without a merge abandons the fix, so the flow
        # goes back to Fix rather than reviewing work that will not ship.
        if linked_pull_request.state == IssueState.OPEN:
            if review_marker == "PASSED":
                if test_marker == "PASSED" and checks_green:
                    reasoning.append("Review passed, test comment reports TEST PASSED, and checks are green.")
                    return result(Stage.READY_TO_MERGE, "Merge the Pull Request.")

                if test_marker == "PASSED":
                    reasoning.append("Review passed and TEST PASSED is recorded, but the checks are not green.")
                    next_action = "Waiting for the Pull Request checks to pass."
                elif test_marker == "FAILED":
                    reasoning.append("Review passed but the latest test comment reports TEST FAILED.")
                    next_action = "Fix test failure."
                else:
                    reasoning.append("Review passed; no test result recorded yet.")
                    next_action = "Run tests on the Pull Request."
                return result(Stage.TEST, next_action)

            if review_marker == "FAILED":
                reasoning.append("Latest review comment reports REVIEW FAILED.")
                if last_claude_response and last_claude_response.is_structured:
                    review_findings = last_claude_response.findings
                next_action = "Fix review findings."
            else:
                reasoning.append("Pull Request exists; no review result recorded yet.")
                next_action = "Post a @claude review command to the Pull Request."

            return result(Stage.REVIEW, next_action)

    if debug_approved:
        if linked_pull_request is not None:
            reasoning.append("The linked Pull Request was closed without being merged.")
            return result(Stage.FIX, "Open a new Pull Request for the fix.")
        reasoning.append("A DEBUG_APPROVED checkpoint was posted and no Pull Request exists yet.")
        return result(Stage.FIX, "Waiting for Claude to open a Pull Request.")

    if last_claude_response is not None:
        reasoning.append("Claude has responded to the debug command; awaiting approval.")
        next_action = "Review Claude's debug result and approve it to start Fix."
    elif last_command is not None:
        reasoning.append("A @claude debug command was posted; awaiting Claude's response.")
        next_action = "Waiting for Claude GitHub Action to respond."
    else:
        reasoning.append("No @claude command has been posted yet.")
        next_action = "Post a @claude debug command to the Issue."

    return result(Stage.DEBUG, next_action)
