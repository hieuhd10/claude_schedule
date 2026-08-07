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
        closed_at=_dt(8) if state == IssueState.CLOSED else None,
        html_url="https://github.com/o/r/issues/1",
    )


def _check(name: str, conclusion: str | None) -> CheckRun:
    return CheckRun(
        name=name,
        status="completed" if conclusion else "in_progress",
        conclusion=conclusion,
        html_url=None,
        started_at=_dt(6),
        completed_at=_dt(7) if conclusion else None,
    )


def _debug_approved_comment(hour: int = 1) -> Comment:
    return _comment(100, "[LIFECYCLE:DEBUG_APPROVED]\n\nDebug result approved by @hieuhd10.", "hieuhd10", hour)


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


def test_review_stage_pr_exists_no_result_yet():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(4, "@claude review this PR", "hieuhd10", 4)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.REVIEW


def test_open_pr_without_debug_approval_stays_in_debug():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(4, "REVIEW PASSED", CLAUDE_LOGIN, 4)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.DEBUG


def test_review_command_that_mentions_result_markers_does_not_advance_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
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
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(4, "Review complete.\n\nREVIEW PASSED\n\nLooks good.", "hieuhd10", 4)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST


def test_new_review_command_invalidates_an_older_pass_result():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
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
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(4, "@claude review this PR", "hieuhd10", 4),
            _comment(5, "REVIEW FAILED\n\nFindings:\n- missing test", CLAUDE_LOGIN, 5),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.REVIEW
    assert result.review_result == "FAILED"
    assert "Fix review findings" in result.next_recommended_action
    assert result.review_findings == ["missing test"]


def test_test_stage_after_review_passed():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST


def test_test_failed_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
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
        issue_comments=[_debug_approved_comment()],
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


def test_test_passed_and_checks_green_without_review_passed_does_not_reach_ready_to_merge():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(6, "TEST PASSED", CLAUDE_LOGIN, 6)],
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
    assert result.stage == Stage.REVIEW


def test_test_command_that_mentions_result_markers_does_not_advance_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
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
        issue_comments=[_debug_approved_comment()],
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


def test_recorded_test_pass_is_reported_while_checks_are_still_running():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST PASSED", CLAUDE_LOGIN, 6),
        ],
        checks=[_check("build", None)],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.TEST
    assert result.review_result == "PASSED"
    assert result.test_result == "PASSED"
    assert result.checks_green is False
    assert "checks" in result.next_recommended_action


def test_neutral_and_skipped_checks_count_as_green():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST PASSED", CLAUDE_LOGIN, 6),
        ],
        checks=[
            _check("build", "success"),
            _check("optional", "skipped"),
        ],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.READY_TO_MERGE
    assert result.checks_green is True


def test_merged_pull_request_with_an_open_issue_waits_on_the_close():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(state=IssueState.CLOSED, merged=True),
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.READY_TO_MERGE
    assert "Close the issue" in result.next_recommended_action


def test_pull_request_closed_without_a_merge_returns_to_fix():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment()],
        linked_pull_request=_pull_request(state=IssueState.CLOSED),
        pr_comments=[_comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )
    assert result.stage == Stage.FIX
    assert "Open a new Pull Request" in result.next_recommended_action


def test_a_closing_note_is_filed_under_completed_not_ready_to_merge():
    result = infer_stage(
        issue=_issue(state=IssueState.CLOSED),
        issue_comments=[
            _comment(7, "## Summary\nready to ship\n\n## Remaining Risk\nNone", CLAUDE_LOGIN, 7),
            _comment(10, "## Summary\nshipped in #5\n\n## Remaining Risk\nNone", CLAUDE_LOGIN, 10),
        ],
        linked_pull_request=_pull_request(state=IssueState.CLOSED, merged=True),
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    reports = _reports_by_stage(result)
    assert reports[Stage.READY_TO_MERGE].summary == "ready to ship"
    assert reports[Stage.COMPLETED].summary == "shipped in #5"


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


def _reports_by_stage(result):
    return {report.stage: report.response for report in result.stage_reports}


def test_each_stage_keeps_its_own_report_after_the_flow_moves_on():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "## Root Cause\nRace in the refresh handler.", CLAUDE_LOGIN, 2),
            _debug_approved_comment(hour=3),
            _comment(4, "## Solution\nSingle-flight guard.\n\n## Remaining Risk\niOS untested.", CLAUDE_LOGIN, 4),
        ],
        linked_pull_request=_pull_request(),
        pr_comments=[_comment(5, "REVIEW PASSED\n\n## Findings\n- covered by tests", CLAUDE_LOGIN, 5)],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    reports = _reports_by_stage(result)
    # The Debug analysis has to survive the Fix and Review comments posted after it.
    assert reports[Stage.DEBUG].root_cause == "Race in the refresh handler."
    assert reports[Stage.FIX].solution == "Single-flight guard."
    assert reports[Stage.FIX].remaining_risk == "iOS untested."
    assert reports[Stage.REVIEW].findings == ["covered by tests"]


def test_a_result_marker_decides_the_stage_over_any_heading():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_debug_approved_comment(hour=1)],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", CLAUDE_LOGIN, 5),
            _comment(6, "TEST FAILED\n\n## Root Cause\nflaky fixture", CLAUDE_LOGIN, 6),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    reports = _reports_by_stage(result)
    assert Stage.TEST in reports
    assert reports[Stage.TEST].root_cause == "flaky fixture"
    assert Stage.DEBUG not in reports


def test_a_newer_report_replaces_the_previous_one_for_the_same_stage():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "## Root Cause\nfirst guess", CLAUDE_LOGIN, 1),
            _comment(2, "## Root Cause\ncorrected diagnosis", CLAUDE_LOGIN, 2),
        ],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    reports = _reports_by_stage(result)
    assert reports[Stage.DEBUG].root_cause == "corrected diagnosis"


def test_unstructured_claude_comments_produce_no_stage_report():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[_comment(1, "Looking into it, will follow up.", CLAUDE_LOGIN, 1)],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    assert result.stage_reports == []


def test_stage_owners_come_from_the_records_each_stage_is_based_on():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "Root Cause:\nrace condition", CLAUDE_LOGIN, 2),
            _debug_approved_comment(hour=3),
        ],
        linked_pull_request=_pull_request(),
        pr_comments=[
            _comment(5, "REVIEW PASSED", "reviewer", 5),
            _comment(6, "TEST FAILED", "tester", 6),
        ],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    owners = {owner.stage: owner for owner in result.stage_owners}
    assert owners[Stage.DEBUG].actor == "hieuhd10"
    assert owners[Stage.DEBUG].role == "Approved the debug result"
    assert owners[Stage.FIX].actor == CLAUDE_LOGIN
    assert owners[Stage.REVIEW].actor == "reviewer"
    assert owners[Stage.REVIEW].role == "Recorded REVIEW PASSED"
    assert owners[Stage.TEST].actor == "tester"
    assert owners[Stage.TEST].role == "Recorded TEST FAILED"
    # Nothing in the fetched data says who closed the issue or merged the Pull Request.
    assert Stage.READY_TO_MERGE not in owners
    assert Stage.COMPLETED not in owners


def test_debug_owner_falls_back_to_the_analysis_author_before_approval():
    result = infer_stage(
        issue=_issue(),
        issue_comments=[
            _comment(1, "@claude debug this", "hieuhd10", 1),
            _comment(2, "Root Cause:\nrace condition", CLAUDE_LOGIN, 2),
        ],
        linked_pull_request=None,
        pr_comments=[],
        checks=[],
        claude_bot_login=CLAUDE_LOGIN,
    )

    owners = {owner.stage: owner for owner in result.stage_owners}
    assert owners[Stage.DEBUG].actor == CLAUDE_LOGIN
    assert owners[Stage.DEBUG].role == "Reported the debug analysis"
    assert Stage.FIX not in owners
