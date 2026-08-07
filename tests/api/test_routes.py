from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from claude_schedule.api.deps import get_github_service
from claude_schedule.github.models import Comment, Issue, IssueState, PullRequest
from claude_schedule.main import app
from claude_schedule.settings import Settings, get_settings


def _dt() -> datetime:
    return datetime(2026, 7, 1, tzinfo=timezone.utc)


def _issue(labels: list[str] | None = None) -> Issue:
    return Issue(
        number=128,
        title="Bug",
        body="steps",
        state=IssueState.OPEN,
        labels=["env:dev"] if labels is None else labels,
        assignee="hieuhd10",
        author="hieuhd10",
        created_at=_dt(),
        updated_at=_dt(),
        closed_at=None,
        html_url="https://github.com/hieuhd10/claude_schedule/issues/128",
    )


def _comment(body: str, author: str = "hieuhd10", comment_id: int = 1) -> Comment:
    return Comment(
        id=comment_id,
        body=body,
        author=author,
        created_at=_dt(),
        updated_at=_dt(),
        html_url=f"https://github.com/hieuhd10/claude_schedule/issues/128#issuecomment-{comment_id}",
    )


def _issue_closed() -> Issue:
    issue = _issue()
    return issue.model_copy(update={"state": IssueState.CLOSED, "closed_at": _dt()})


class FakeGitHubService:
    def __init__(self) -> None:
        self.posted_issue_comments: list[str] = []
        self.posted_pr_comments: list[tuple[int, str]] = []
        self.linked_pull_request = None
        self.issue_comments: list[Comment] = []
        self.pr_comments: list[Comment] = []
        self.pr_reviews: list[Comment] = []
        self.created_issues: list[tuple] = []
        self.created_pull_requests: list[dict] = []
        self.closed_issues: list[int] = []
        self.merged_pull_requests: list[tuple[int, str]] = []
        self.issue_labels: list[str] | None = None
        self.branches = [
            "feature/test-routine",
            "docs/unrelated",
            "claude/issue-128-20260806-1017",
        ]

    async def get_issue(self, owner, repository, issue_number):
        return _issue(self.issue_labels)

    async def get_issue_comments(self, owner, repository, issue_number):
        return self.issue_comments

    async def get_issue_timeline(self, owner, repository, issue_number):
        return []

    async def find_linked_pull_request(self, owner, repository, issue_number, timeline=None):
        return self.linked_pull_request

    async def get_pull_request_comments(self, owner, repository, pr_number):
        return self.pr_comments

    async def get_pull_request_reviews(self, owner, repository, pr_number):
        return self.pr_reviews

    async def get_pull_request_commits(self, owner, repository, pr_number):
        return []

    async def get_pull_request_checks(self, owner, repository, pr_number, head_sha=None):
        return []

    async def post_issue_comment(self, owner, repository, issue_number, body):
        self.posted_issue_comments.append(body)
        return _comment(body)

    async def post_pull_request_comment(self, owner, repository, pr_number, body):
        self.posted_pr_comments.append((pr_number, body))
        return _comment(body)

    async def create_issue(self, owner, repository, title, body, labels, assignee):
        self.created_issues.append((title, body, labels, assignee))
        return _issue()

    async def get_default_branch(self, owner, repository):
        return "feature/test-routine"

    async def list_branches(self, owner, repository):
        return self.branches

    async def close_issue(self, owner, repository, issue_number):
        self.closed_issues.append(issue_number)
        return _issue_closed()

    async def merge_pull_request(self, owner, repository, pr_number, merge_method):
        self.merged_pull_requests.append((pr_number, merge_method))
        return PullRequest(
            number=pr_number,
            title="Fix",
            state=IssueState.CLOSED,
            merged=True,
            head_branch="claude/issue-128",
            base_branch="main",
            head_sha="abc1234",
            author="hieuhd10",
            created_at=_dt(),
            updated_at=_dt(),
            merged_at=_dt(),
            closed_at=_dt(),
            html_url="https://github.com/hieuhd10/claude_schedule/pull/77",
        )

    async def create_pull_request(self, owner, repository, title, head, base, body):
        self.created_pull_requests.append(
            {"title": title, "head": head, "base": base, "body": body}
        )
        return PullRequest(
            number=77,
            title=title,
            state=IssueState.OPEN,
            merged=False,
            head_branch=head,
            base_branch=base,
            head_sha="abc1234",
            author="hieuhd10",
            created_at=_dt(),
            updated_at=_dt(),
            merged_at=None,
            closed_at=None,
            html_url="https://github.com/hieuhd10/claude_schedule/pull/77",
        )


@pytest.fixture
def fake_service():
    return FakeGitHubService()


@pytest.fixture
def client(fake_service):
    app.dependency_overrides[get_github_service] = lambda: fake_service
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_parse_url_valid(client):
    response = client.post(
        "/api/issues/parse-url",
        json={"url": "https://github.com/hieuhd10/claude_schedule/issues/128"},
    )
    assert response.status_code == 200
    assert response.json() == {"owner": "hieuhd10", "repository": "claude_schedule", "issue_number": 128}


def test_parse_url_invalid(client):
    response = client.post("/api/issues/parse-url", json={"url": "not-a-url"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_URL"


def test_get_issue_detail_no_pr(client):
    response = client.get("/api/issues/hieuhd10/claude_schedule/128")
    assert response.status_code == 200
    body = response.json()
    assert body["issue"]["number"] == 128
    assert body["linked_pull_request"] is None
    assert body["lifecycle"]["stage"] == "debug"


def test_review_verdict_submitted_through_the_review_ui_advances_the_stage(client, fake_service):
    fake_service.linked_pull_request = PullRequest(
        number=77,
        title="Fix",
        state=IssueState.OPEN,
        merged=False,
        head_branch="claude/issue-128",
        base_branch="main",
        head_sha="abc1234",
        author="hieuhd10",
        created_at=_dt(),
        updated_at=_dt(),
        merged_at=None,
        closed_at=None,
        html_url="https://github.com/hieuhd10/claude_schedule/pull/77",
    )
    fake_service.issue_comments = [_comment("[LIFECYCLE:DEBUG_APPROVED]")]
    fake_service.pr_reviews = [_comment("Looks correct.\n\nREVIEW PASSED", comment_id=9)]

    response = client.get("/api/issues/hieuhd10/claude_schedule/128")

    assert response.status_code == 200
    lifecycle = response.json()["lifecycle"]
    assert lifecycle["review_result"] == "PASSED"
    assert lifecycle["stage"] == "test"


def test_recorded_test_verdict_is_reported_while_checks_are_not_green(client, fake_service):
    fake_service.linked_pull_request = PullRequest(
        number=77,
        title="Fix",
        state=IssueState.OPEN,
        merged=False,
        head_branch="claude/issue-128",
        base_branch="main",
        head_sha="abc1234",
        author="hieuhd10",
        created_at=_dt(),
        updated_at=_dt(),
        merged_at=None,
        closed_at=None,
        html_url="https://github.com/hieuhd10/claude_schedule/pull/77",
    )
    fake_service.issue_comments = [_comment("[LIFECYCLE:DEBUG_APPROVED]")]
    fake_service.pr_comments = [
        _comment("REVIEW PASSED", comment_id=8),
        _comment("TEST PASSED", comment_id=9),
    ]

    response = client.get("/api/issues/hieuhd10/claude_schedule/128")

    assert response.status_code == 200
    lifecycle = response.json()["lifecycle"]
    assert lifecycle["stage"] == "test"
    assert lifecycle["test_result"] == "PASSED"
    assert lifecycle["checks_green"] is False


def test_merge_pull_request_defaults_to_squash(client, fake_service):
    response = client.post("/api/pull-requests/hieuhd10/claude_schedule/77/merge", json={})

    assert response.status_code == 200
    assert response.json()["pull_request"]["merged"] is True
    assert fake_service.merged_pull_requests == [(77, "squash")]


def test_merge_pull_request_honours_the_requested_method(client, fake_service):
    response = client.post(
        "/api/pull-requests/hieuhd10/claude_schedule/77/merge",
        json={"merge_method": "rebase"},
    )

    assert response.status_code == 200
    assert fake_service.merged_pull_requests == [(77, "rebase")]


def test_merge_pull_request_rejects_an_unknown_method(client, fake_service):
    response = client.post(
        "/api/pull-requests/hieuhd10/claude_schedule/77/merge",
        json={"merge_method": "fast-forward"},
    )

    assert response.status_code == 422
    assert fake_service.merged_pull_requests == []


def test_close_issue_completes_the_flow(client, fake_service):
    response = client.post("/api/issues/hieuhd10/claude_schedule/128/close")

    assert response.status_code == 200
    assert response.json()["issue"]["state"] == "closed"
    assert fake_service.closed_issues == [128]


def test_merge_and_close_are_refused_for_a_repository_that_is_not_allowed(client):
    settings = Settings(github_owner="hieuhd10", github_repository="claude_schedule")
    app.dependency_overrides[get_settings] = lambda: settings
    try:
        merge = client.post("/api/pull-requests/other/other-repo/77/merge", json={})
        close = client.post("/api/issues/other/other-repo/128/close")
    finally:
        app.dependency_overrides.pop(get_settings, None)

    assert merge.status_code == 403
    assert close.status_code == 403


def test_repository_guard_rejects_mismatched_repository(client):
    settings = Settings(github_owner="hieuhd10", github_repository="claude_schedule")
    app.dependency_overrides[get_settings] = lambda: settings
    try:
        response = client.get("/api/issues/another-owner/another-repository/128")
    finally:
        app.dependency_overrides.pop(get_settings, None)

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "REPOSITORY_NOT_ALLOWED"


def test_repository_guard_allows_configured_repository_case_insensitively(client):
    settings = Settings(github_owner="HieuHD10", github_repository="Claude_Schedule")
    app.dependency_overrides[get_settings] = lambda: settings
    try:
        response = client.get("/api/issues/hieuhd10/claude_schedule/128")
    finally:
        app.dependency_overrides.pop(get_settings, None)

    assert response.status_code == 200


def test_post_issue_comment(client, fake_service):
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule/128/comments",
        json={"body": "@claude debug this"},
    )
    assert response.status_code == 200
    assert fake_service.posted_issue_comments == ["@claude debug this"]


def test_post_pull_request_comment(client, fake_service):
    response = client.post(
        "/api/pull-requests/hieuhd10/claude_schedule/5/comments",
        json={"body": "@claude review this"},
    )
    assert response.status_code == 200
    assert fake_service.posted_pr_comments == [(5, "@claude review this")]


def test_checkpoint_debug_approved_posts_to_issue(client, fake_service):
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule/128/checkpoints",
        json={"checkpoint": "DEBUG_APPROVED"},
    )
    assert response.status_code == 200
    assert len(fake_service.posted_issue_comments) == 1
    assert "[LIFECYCLE:DEBUG_APPROVED]" in fake_service.posted_issue_comments[0]


def test_get_config(client):
    response = client.get("/api/config")
    assert response.status_code == 200
    body = response.json()
    assert "owner" in body
    assert "repository" in body


def test_create_issue(client, fake_service):
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule",
        json={
            "title": "Bug: sky is blue",
            "environment": "dev",
            "base_branch": "develop",
            "severity": "high",
            "steps_to_reproduce": "1. Look up",
            "expected_result": "Sky should be transparent",
            "actual_result": "Sky is blue",
            "additional_notes": None,
            "assignee": "hieuhd10",
        },
    )
    assert response.status_code == 200
    assert response.json()["issue"]["number"] == 128
    assert len(fake_service.created_issues) == 1
    title, body, labels, assignee = fake_service.created_issues[0]
    assert title == "Bug: sky is blue"
    assert labels == ["env:dev", "base:develop", "severity:high"]
    assert assignee == "hieuhd10"
    assert "## Steps to Reproduce" in body


def test_create_issue_validation_error_uses_api_error_shape(client):
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule",
        json={
            "title": "Bug",
            "environment": "x" * 47,
            "steps_to_reproduce": "steps",
            "expected_result": "expected",
            "actual_result": "actual",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    assert "at most 46 characters" in response.json()["error"]["message"]


def test_fix_branches_put_branches_naming_the_issue_first(client, fake_service):
    response = client.get("/api/issues/hieuhd10/claude_schedule/128/fix-branches")

    assert response.status_code == 200
    payload = response.json()
    assert payload["branches"][0] == "claude/issue-128-20260806-1017"
    # The base branch is never offered as a source for the Pull Request.
    assert "feature/test-routine" not in payload["branches"]
    assert payload["base_branch"] == "feature/test-routine"


def test_fix_branches_prefer_the_base_label_over_the_repository_default(client, fake_service):
    fake_service.branches = ["develop", "claude/issue-128-x"]
    fake_service.issue_labels = ["base:develop"]

    response = client.get("/api/issues/hieuhd10/claude_schedule/128/fix-branches")

    assert response.json()["base_branch"] == "develop"


def test_create_pull_request_closes_the_issue_so_the_lifecycle_can_find_it(client, fake_service):
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule/128/pull-request",
        json={"head": "claude/issue-128-20260806-1017"},
    )

    assert response.status_code == 200
    assert response.json()["pull_request"]["number"] == 77
    created = fake_service.created_pull_requests[0]
    assert created["head"] == "claude/issue-128-20260806-1017"
    assert created["base"] == "feature/test-routine"
    # Without this exact keyword GitHub records no reference back to the issue.
    assert created["body"] == "Closes #128"


def test_create_pull_request_accepts_an_explicit_base_and_title(client, fake_service):
    client.post(
        "/api/issues/hieuhd10/claude_schedule/128/pull-request",
        json={"head": "fix/manual", "base": "develop", "title": "Custom title"},
    )

    created = fake_service.created_pull_requests[0]
    assert (created["base"], created["title"]) == ("develop", "Custom title")


def test_create_pull_request_rejects_a_missing_head_branch(client):
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule/128/pull-request",
        json={"head": ""},
    )

    assert response.status_code == 422
