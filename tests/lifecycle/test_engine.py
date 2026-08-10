from datetime import datetime, timezone

from claude_schedule.github.models import CheckRun, Comment, Issue, IssueState, PullRequest
from claude_schedule.lifecycle.engine import infer_stage
from claude_schedule.lifecycle.models import Stage

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


def _issue(state: IssueState = IssueState.OPEN) -> Issue:
    return Issue(
        number=1,
        title="Bug",
        body="steps",
        state=state,
        labels=[],
        assignee=None,
        author="hieuhd10",
        created_at=_dt(0),
        updated_at=_dt(0),
        closed_at=None,
        html_url="https://github.com/o/r/issues/1",
    )


def _pull_request(state: IssueState = IssueState.OPEN, merged: bool = False) -> PullRequest:
    return PullRequest(
        number=5,
        title="Fix",
        state=state,
        merged=merged,
        head_branch="fix/1",
        base_branch="main",
        head_sha="abc123",
        author=CLAUDE_LOGIN,
        created_at=_dt(2),
        updated_at=_dt(3),
        merged_at=_dt(9) if merged else None,
        closed_at=_dt(9) if merged else None,
        html_url="https://github.com/o/r/pull/5",
    )


def test_debug_stage_no_command_yet():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.DEBUG
    assert "Post a @claude debug command" in result.next_recommended_action


def test_debug_in_progress_command_no_response():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_comment(1, "@claude debug this", "hieuhd10", 1)],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.DEBUG
    assert result.last_command is not None
    assert result.last_claude_response is None


def test_debug_completed_awaiting_approval():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "Root Cause:\nNull check missing", CLAUDE_LOGIN, 2),
        ],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.DEBUG
    assert result.last_claude_response.root_cause == "Null check missing"
    assert "approve" in result.next_recommended_action.lower()


def test_fix_stage_after_debug_approved_no_pr():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "Root Cause:\nx", CLAUDE_LOGIN, 2),
            _comment(3, "[LIFECYCLE:DEBUG_APPROVED]\n\nDebug result approved by @hieuhd10.", "hieuhd10", 3),
        ],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.FIX


def test_debug_approved_marker_mentioned_mid_sentence_does_not_advance_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "Root Cause:\nx", CLAUDE_LOGIN, 2),
            _comment(
                3,
                "Note: don't write [LIFECYCLE:DEBUG_APPROVED] in the description comment.",
                "hieuhd10",
                3,
            ),
        ],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.DEBUG
    assert "approve" in result.next_recommended_action.lower()


def test_review_stage_pr_exists_no_result_yet():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(4, "@claude review this PR", "hieuhd10", 4)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.REVIEW


def test_review_command_that_mentions_result_markers_does_not_advance_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(
                4,
                "@claude Please review and report REVIEW PASSED or REVIEW FAILED.",
                "hieuhd10",
                4,
            )
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.REVIEW


def test_manual_review_marker_on_own_line_advances_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(4, "Review complete.\n\nREVIEW PASSED\n\nLooks good.", "hieuhd10", 4)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST


def test_new_review_command_invalidates_an_older_pass_result():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(4, "REVIEW PASSED", CLAUDE_LOGIN, 4),
            _comment(5, "@claude Please review the latest changes.", "hieuhd10", 5),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.REVIEW


def test_review_failed_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(4, "@claude review this PR", "hieuhd10", 4),
            _comment(5, "REVIEW FAILED\n\nFindings:\n- missing test", CLAUDE_LOGIN, 5),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.REVIEW
    assert "Fix review findings" in result.next_recommended_action


def test_test_stage_after_review_passed():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST


def test_test_failed_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST FAILED\n\nassertion error", CLAUDE_LOGIN, 6),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST
    assert result.test_result == "FAILED"
    assert "Fix test failure" in result.next_recommended_action


def test_ready_to_merge_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST PASSED", CLAUDE_LOGIN, 6),
        ],
        checks=[
            CheckRun(
                name="ci",
                status="completed",
                conclusion="success",
                html_url=None,
                started_at=_dt(6),
                completed_at=_dt(7),
            )
        ],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.READY_TO_MERGE


def test_test_command_that_mentions_result_markers_does_not_advance_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(
                6,
                "@claude Please test and report TEST PASSED or TEST FAILED.",
                "hieuhd10",
                6,
            ),
        ],
        checks=[
            CheckRun(
                name="ci",
                status="completed",
                conclusion="success",
                html_url=None,
                started_at=_dt(6),
                completed_at=_dt(7),
            )
        ],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST


def test_test_passed_with_no_checks_configured_does_not_reach_ready_to_merge():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST PASSED", CLAUDE_LOGIN, 6),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage != Stage.READY_TO_MERGE
    assert result.stage == Stage.TEST


def test_completed_stage():
    result = infer_stage(
        issue=_issue(state=IssueState.CLOSED),
        issue_comments=[],
        linked_pull_request=_pull_request(state=IssueState.CLOSED, merged=True),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST PASSED", CLAUDE_LOGIN, 6),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.COMPLETED
    assert result.test_result == "PASSED"


def test_completed_stage_when_issue_closed_without_pull_request():
    result = infer_stage(
        issue=_issue(state=IssueState.CLOSED),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "Root Cause:\nnot a real bug", CLAUDE_LOGIN, 2),
        ],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.COMPLETED
    assert "not a bug" in result.reasoning[0]
