from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from claude_schedule.api.deps import get_github_service
from claude_schedule.github.models import Comment, Issue, IssueState
from claude_schedule.main import app


def _dt() -> datetime:
    return datetime(2026, 7, 1, tzinfo=timezone.utc)


def _issue() -> Issue:
    return Issue(
        number=128,
        title="Bug",
        body="steps",
        state=IssueState.OPEN,
        labels=["env:dev"],
        assignee="hieuhd10",
        author="hieuhd10",
        created_at=_dt(),
        updated_at=_dt(),
        closed_at=None,
        html_url="https://github.com/hieuhd10/claude_schedule/issues/128",
    )


def _comment(body: str) -> Comment:
    return Comment(
        id=1,
        body=body,
        author="hieuhd10",
        created_at=_dt(),
        updated_at=_dt(),
        html_url="https://github.com/hieuhd10/claude_schedule/issues/128#issuecomment-1",
    )


class FakeGitHubService:
    def __init__(self) -> None:
        self.posted_issue_comments: list[str] = []
        self.posted_pr_comments: list[tuple[int, str]] = []
        self.linked_pull_request = None
        self.created_issues: list[tuple] = []

    async def get_issue(self, owner, repository, issue_number):
        return _issue()

    async def get_issue_comments(self, owner, repository, issue_number):
        return []

    async def get_issue_timeline(self, owner, repository, issue_number):
        return []

    async def find_linked_pull_request(self, owner, repository, issue_number):
        return self.linked_pull_request

    async def get_pull_request_comments(self, owner, repository, pr_number):
        return []

    async def get_pull_request_commits(self, owner, repository, pr_number):
        return []

    async def get_pull_request_checks(self, owner, repository, pr_number):
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


def test_checkpoint_review_confirmed_without_pr_returns_pr_not_found(client, fake_service):
    fake_service.linked_pull_request = None
    response = client.post(
        "/api/issues/hieuhd10/claude_schedule/128/checkpoints",
        json={"checkpoint": "REVIEW_CONFIRMED"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "PR_NOT_FOUND"


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
