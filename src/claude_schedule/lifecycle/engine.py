import re

from claude_schedule.github.models import CheckRun, Comment, Issue, IssueState, PullRequest
from claude_schedule.lifecycle.models import LifecycleResult, ParsedClaudeResponse, Stage
from claude_schedule.lifecycle.timeline import parse_claude_response

_REVIEW_PASSED_RE = re.compile(r"^\s*REVIEW PASSED\s*$", re.IGNORECASE | re.MULTILINE)
_REVIEW_FAILED_RE = re.compile(r"^\s*REVIEW FAILED\s*$", re.IGNORECASE | re.MULTILINE)
_TEST_PASSED_RE = re.compile(r"^\s*TEST PASSED\s*$", re.IGNORECASE | re.MULTILINE)
_TEST_FAILED_RE = re.compile(r"^\s*TEST FAILED\s*$", re.IGNORECASE | re.MULTILINE)
_DEBUG_APPROVED_RE = re.compile(r"\[LIFECYCLE:DEBUG_APPROVED\]", re.IGNORECASE)
_HUMAN_COMMAND_RE = re.compile(r"^\s*@claude\b", re.IGNORECASE)
_REVIEW_COMMAND_RE = re.compile(r"\breview\b", re.IGNORECASE)
_TEST_COMMAND_RE = re.compile(r"\b(?:test|tests|testing|ci)\b", re.IGNORECASE)


def _latest_match(
    comments: list[Comment],
    patterns: dict[str, re.Pattern],
    command_pattern: re.Pattern,
) -> str | None:
    for comment in sorted(comments, key=lambda item: item.created_at, reverse=True):
        if _HUMAN_COMMAND_RE.match(comment.body):
            # A newer command starts a fresh attempt and invalidates the previous result.
            if command_pattern.search(comment.body):
                return None
            continue
        for label, pattern in patterns.items():
            if pattern.search(comment.body):
                return label
    return None


def _find_latest(comments: list[Comment], predicate) -> Comment | None:
    for comment in reversed(comments):
        if predicate(comment):
            return comment
    return None


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
        parse_claude_response(last_claude_comment.body) if last_claude_comment else None
    )

    debug_approved = any(_DEBUG_APPROVED_RE.search(c.body) for c in issue_comments)
    review_marker = _latest_match(
        pr_comments,
        {"PASSED": _REVIEW_PASSED_RE, "FAILED": _REVIEW_FAILED_RE},
        _REVIEW_COMMAND_RE,
    )
    test_marker = _latest_match(
        pr_comments,
        {"PASSED": _TEST_PASSED_RE, "FAILED": _TEST_FAILED_RE},
        _TEST_COMMAND_RE,
    )

    reasoning: list[str] = []
    review_findings: list[str] = []
    test_result: str | None = None

    if issue.state == IssueState.CLOSED:
        test_result = test_marker
        if linked_pull_request and linked_pull_request.merged:
            reasoning.append("Issue is closed and the linked Pull Request is merged.")
        elif linked_pull_request:
            reasoning.append("Issue is closed without the linked Pull Request being merged.")
        else:
            reasoning.append("Issue is closed without a linked Pull Request (e.g. closed as not a bug).")
        return LifecycleResult(
            stage=Stage.COMPLETED,
            reasoning=reasoning,
            last_command=last_command,
            last_claude_response=last_claude_response,
            next_recommended_action="No action needed - issue is closed.",
            review_findings=review_findings,
            test_result=test_result,
        )

    if linked_pull_request is not None and linked_pull_request.state == IssueState.OPEN:
        if test_marker == "PASSED" and _checks_green(checks):
            reasoning.append("Test comment reports TEST PASSED and checks are green.")
            return LifecycleResult(
                stage=Stage.READY_TO_MERGE,
                reasoning=reasoning,
                last_command=last_command,
                last_claude_response=last_claude_response,
                next_recommended_action="Merge the Pull Request on GitHub.",
                review_findings=review_findings,
                test_result=test_marker,
            )

        if review_marker == "PASSED":
            if test_marker == "FAILED":
                reasoning.append("Review passed but the latest test comment reports TEST FAILED.")
                test_result = "FAILED"
                next_action = "Fix test failure."
            else:
                reasoning.append("Review passed; no test result recorded yet.")
                next_action = "Run tests on the Pull Request."
            return LifecycleResult(
                stage=Stage.TEST,
                reasoning=reasoning,
                last_command=last_command,
                last_claude_response=last_claude_response,
                next_recommended_action=next_action,
                review_findings=review_findings,
                test_result=test_result,
            )

        if review_marker == "FAILED":
            reasoning.append("Latest review comment reports REVIEW FAILED.")
            if last_claude_response and last_claude_response.is_structured:
                review_findings = last_claude_response.findings
            next_action = "Fix review findings."
        else:
            reasoning.append("Pull Request exists; no review result recorded yet.")
            next_action = "Post a @claude review command to the Pull Request."

        return LifecycleResult(
            stage=Stage.REVIEW,
            reasoning=reasoning,
            last_command=last_command,
            last_claude_response=last_claude_response,
            next_recommended_action=next_action,
            review_findings=review_findings,
            test_result=test_result,
        )

    if debug_approved:
        reasoning.append("A DEBUG_APPROVED checkpoint was posted and no Pull Request exists yet.")
        return LifecycleResult(
            stage=Stage.FIX,
            reasoning=reasoning,
            last_command=last_command,
            last_claude_response=last_claude_response,
            next_recommended_action="Waiting for Claude to open a Pull Request.",
            review_findings=review_findings,
            test_result=test_result,
        )

    if last_claude_response is not None:
        reasoning.append("Claude has responded to the debug command; awaiting approval.")
        next_action = "Review Claude's debug result and approve it to start Fix."
    elif last_command is not None:
        reasoning.append("A @claude debug command was posted; awaiting Claude's response.")
        next_action = "Waiting for Claude GitHub Action to respond."
    else:
        reasoning.append("No @claude command has been posted yet.")
        next_action = "Post a @claude debug command to the Issue."

    return LifecycleResult(
        stage=Stage.DEBUG,
        reasoning=reasoning,
        last_command=last_command,
        last_claude_response=last_claude_response,
        next_recommended_action=next_action,
        review_findings=review_findings,
        test_result=test_result,
    )
