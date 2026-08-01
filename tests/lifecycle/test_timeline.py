from datetime import datetime, timezone

from claude_schedule.github.models import CheckRun, Comment
from claude_schedule.lifecycle.timeline import merge_and_categorize, parse_claude_response

CLAUDE_LOGIN = "claude[bot]"


def _dt(hour: int) -> datetime:
    return datetime(2026, 7, 1, hour, tzinfo=timezone.utc)


def _comment(comment_id: int, body: str, author: str, hour: int) -> Comment:
    return Comment(
        id=comment_id,
        body=body,
        author=author,
        created_at=_dt(hour),
        updated_at=_dt(hour),
        html_url=f"https://github.com/o/r/issues/1#issuecomment-{comment_id}",
    )


def test_parse_claude_response_structured():
    body = "Root Cause:\nNull pointer in handler.\n\nFindings:\n- missing null check\n- no test coverage\n\nTest Result:\nPASSED"
    parsed = parse_claude_response(body)
    assert parsed.is_structured is True
    assert parsed.root_cause == "Null pointer in handler."
    assert parsed.findings == ["missing null check", "no test coverage"]
    assert parsed.test_result == "PASSED"


def test_parse_claude_response_unstructured():
    parsed = parse_claude_response("Looked into it, seems fine, will follow up later.")
    assert parsed.is_structured is False
    assert parsed.root_cause is None
    assert parsed.findings == []


def test_merge_and_categorize_sorted_and_categorized():
    issue_comments = [
        _comment(1, "@claude debug this", "hieuhd10", 1),
        _comment(2, "Root Cause:\nbad state", CLAUDE_LOGIN, 2),
    ]
    checks = [
        CheckRun(
            name="tests",
            status="completed",
            conclusion="success",
            html_url="https://github.com/checks/1",
            started_at=_dt(3),
            completed_at=_dt(4),
        )
    ]
    items = merge_and_categorize(
        issue_number=1,
        issue_comments=issue_comments,
        pull_request=None,
        pr_comments=[],
        pr_commits=[],
        checks=checks,
        timeline_events=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert len(items) == 2
    assert items[0].category.value == "human_command"
    assert items[1].category.value == "claude_response"
    # Checks are only attached when a linked PR is present (per merge_and_categorize contract).
