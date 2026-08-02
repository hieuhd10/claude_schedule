import json

import httpx
import respx

from claude_schedule.github.client import GitHubClient
from claude_schedule.github.service import GitHubService

OWNER = "hieuhd10"
REPO = "claude_schedule"


def _issue_json(number=128, state="open"):
    return {
        "number": number,
        "title": "Something is broken",
        "body": "steps to reproduce...",
        "state": state,
        "labels": [{"name": "env:dev"}, {"name": "base:develop"}],
        "assignee": {"login": "hieuhd10"},
        "user": {"login": "hieuhd10"},
        "created_at": "2026-07-01T00:00:00Z",
        "updated_at": "2026-07-02T00:00:00Z",
        "closed_at": None,
        "html_url": f"https://github.com/{OWNER}/{REPO}/issues/{number}",
    }


def _comment_json(comment_id=1, body="@claude debug this"):
    return {
        "id": comment_id,
        "body": body,
        "user": {"login": "hieuhd10"},
        "created_at": "2026-07-01T01:00:00Z",
        "updated_at": "2026-07-01T01:00:00Z",
        "html_url": f"https://github.com/{OWNER}/{REPO}/issues/128#issuecomment-{comment_id}",
    }


def _pull_request_json(number=5, state="open", merged=False):
    return {
        "number": number,
        "title": "Fix the bug",
        "state": state,
        "merged": merged,
        "head": {"ref": "fix/issue-128", "sha": "abc123"},
        "base": {"ref": "main"},
        "user": {"login": "claude[bot]"},
        "created_at": "2026-07-01T02:00:00Z",
        "updated_at": "2026-07-01T03:00:00Z",
        "merged_at": None,
        "closed_at": None,
        "html_url": f"https://github.com/{OWNER}/{REPO}/pull/{number}",
    }


def _service() -> GitHubService:
    client = GitHubClient(token="fake-token", timeout_seconds=5.0)
    return GitHubService(client)


@respx.mock
async def test_get_issue():
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/128").mock(
        return_value=httpx.Response(200, json=_issue_json())
    )
    issue = await _service().get_issue(OWNER, REPO, 128)
    assert issue.number == 128
    assert issue.state.value == "open"
    assert issue.labels == ["env:dev", "base:develop"]
    assert issue.assignee == "hieuhd10"


@respx.mock
async def test_get_issue_comments():
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/128/comments").mock(
        return_value=httpx.Response(200, json=[_comment_json(1), _comment_json(2)])
    )
    comments = await _service().get_issue_comments(OWNER, REPO, 128)
    assert len(comments) == 2
    assert comments[0].id == 1


@respx.mock
async def test_get_issue_comments_paginates_across_multiple_pages():
    route = respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/128/comments").mock(
        side_effect=[
            httpx.Response(200, json=[_comment_json(i) for i in range(1, 101)]),
            httpx.Response(200, json=[_comment_json(101)]),
        ]
    )
    comments = await _service().get_issue_comments(OWNER, REPO, 128)
    assert len(comments) == 101
    assert route.call_count == 2


@respx.mock
async def test_find_linked_pull_request_found():
    timeline_json = [
        {
            "event": "cross-referenced",
            "created_at": "2026-07-01T04:00:00Z",
            "source": {
                "issue": {
                    "number": 5,
                    "pull_request": {},
                    "repository": {"full_name": f"{OWNER}/{REPO}"},
                    "user": {"login": "claude[bot]"},
                    "html_url": f"https://github.com/{OWNER}/{REPO}/pull/5",
                }
            },
        }
    ]
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/128/timeline").mock(
        return_value=httpx.Response(200, json=timeline_json)
    )
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/pulls/5").mock(
        return_value=httpx.Response(200, json=_pull_request_json(5))
    )
    pr = await _service().find_linked_pull_request(OWNER, REPO, 128)
    assert pr is not None
    assert pr.number == 5


@respx.mock
async def test_find_linked_pull_request_none():
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/128/timeline").mock(
        return_value=httpx.Response(200, json=[{"event": "labeled", "created_at": "2026-07-01T00:00:00Z"}])
    )
    pr = await _service().find_linked_pull_request(OWNER, REPO, 128)
    assert pr is None


@respx.mock
async def test_get_pull_request_checks_uses_head_sha():
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/pulls/5").mock(
        return_value=httpx.Response(200, json=_pull_request_json(5))
    )
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/commits/abc123/check-runs").mock(
        return_value=httpx.Response(
            200,
            json={
                "check_runs": [
                    {
                        "name": "tests",
                        "status": "completed",
                        "conclusion": "success",
                        "html_url": "https://github.com/checks/1",
                        "started_at": "2026-07-01T00:00:00Z",
                        "completed_at": "2026-07-01T00:05:00Z",
                    }
                ]
            },
        )
    )
    checks = await _service().get_pull_request_checks(OWNER, REPO, 5)
    assert len(checks) == 1
    assert checks[0].conclusion == "success"


@respx.mock
async def test_get_pull_request_checks_paginates():
    respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/pulls/5").mock(
        return_value=httpx.Response(200, json=_pull_request_json(5))
    )

    def _check_run(index):
        return {
            "name": f"check-{index}",
            "status": "completed",
            "conclusion": "success",
            "html_url": None,
            "started_at": None,
            "completed_at": None,
        }

    route = respx.get(f"https://api.github.com/repos/{OWNER}/{REPO}/commits/abc123/check-runs").mock(
        side_effect=[
            httpx.Response(
                200,
                json={"total_count": 101, "check_runs": [_check_run(i) for i in range(100)]},
            ),
            httpx.Response(200, json={"total_count": 101, "check_runs": [_check_run(100)]}),
        ]
    )
    checks = await _service().get_pull_request_checks(OWNER, REPO, 5)
    assert len(checks) == 101
    assert route.call_count == 2


@respx.mock
async def test_post_issue_comment():
    route = respx.post(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/128/comments").mock(
        return_value=httpx.Response(201, json=_comment_json(99, "@claude debug"))
    )
    comment = await _service().post_issue_comment(OWNER, REPO, 128, "@claude debug")
    assert route.called
    assert comment.id == 99


@respx.mock
async def test_post_pull_request_comment_uses_issues_endpoint():
    route = respx.post(f"https://api.github.com/repos/{OWNER}/{REPO}/issues/5/comments").mock(
        return_value=httpx.Response(201, json=_comment_json(100, "@claude test"))
    )
    comment = await _service().post_pull_request_comment(OWNER, REPO, 5, "@claude test")
    assert route.called
    assert comment.id == 100


@respx.mock
async def test_create_issue_sends_title_body_labels_assignee():
    route = respx.post(f"https://api.github.com/repos/{OWNER}/{REPO}/issues").mock(
        return_value=httpx.Response(201, json=_issue_json(200))
    )
    issue = await _service().create_issue(
        OWNER,
        REPO,
        "Bug: sky is blue",
        "## Steps to Reproduce\n1. Look up",
        ["env:dev", "severity:high"],
        "hieuhd10",
    )
    assert issue.number == 200
    payload = json.loads(route.calls.last.request.content)
    assert payload["title"] == "Bug: sky is blue"
    assert payload["labels"] == ["env:dev", "severity:high"]
    assert payload["assignees"] == ["hieuhd10"]


@respx.mock
async def test_create_issue_without_assignee_omits_assignees_field():
    route = respx.post(f"https://api.github.com/repos/{OWNER}/{REPO}/issues").mock(
        return_value=httpx.Response(201, json=_issue_json(201))
    )
    await _service().create_issue(OWNER, REPO, "Bug", "body", [], None)
    payload = json.loads(route.calls.last.request.content)
    assert "assignees" not in payload
