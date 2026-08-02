import httpx
import pytest
import respx

from claude_schedule.github.client import GitHubClient
from claude_schedule.github.errors import (
    CommentRejectedError,
    GitHubTimeoutError,
    PrivateOrNoScopeError,
    RateLimitedError,
    RepoNotFoundError,
    TokenInvalidError,
)


@pytest.fixture
def client():
    return GitHubClient(token="fake-token", timeout_seconds=5.0)


@respx.mock
async def test_get_success(client):
    respx.get("https://api.github.com/repos/o/r").mock(
        return_value=httpx.Response(200, json={"ok": True})
    )
    result = await client.get("/repos/o/r")
    assert result == {"ok": True}


@respx.mock
async def test_get_paginated_follows_next_link(client):
    page_two_url = "https://api.github.com/repos/o/r/issues/1/comments?page=2"
    route = respx.get("https://api.github.com/repos/o/r/issues/1/comments").mock(
        side_effect=[
            httpx.Response(
            200,
            json=[{"id": 1}],
            headers={"Link": f'<{page_two_url}>; rel="next"'},
            ),
            httpx.Response(200, json=[{"id": 2}]),
        ]
    )

    result = await client.get_paginated("/repos/o/r/issues/1/comments")

    assert [item["id"] for item in result] == [1, 2]
    assert route.call_count == 2


@respx.mock
async def test_get_401_raises_token_invalid(client):
    respx.get("https://api.github.com/repos/o/r").mock(return_value=httpx.Response(401))
    with pytest.raises(TokenInvalidError):
        await client.get("/repos/o/r")


@respx.mock
async def test_get_403_rate_limited(client):
    respx.get("https://api.github.com/repos/o/r").mock(
        return_value=httpx.Response(
            403, headers={"X-RateLimit-Remaining": "0", "Retry-After": "42"}
        )
    )
    with pytest.raises(RateLimitedError) as exc_info:
        await client.get("/repos/o/r")
    assert exc_info.value.retry_after == 42


@respx.mock
async def test_get_403_private_or_no_scope(client):
    respx.get("https://api.github.com/repos/o/r").mock(return_value=httpx.Response(403))
    with pytest.raises(PrivateOrNoScopeError):
        await client.get("/repos/o/r")


@respx.mock
async def test_get_404_raises_configured_not_found(client):
    respx.get("https://api.github.com/repos/o/r").mock(return_value=httpx.Response(404))
    with pytest.raises(RepoNotFoundError):
        await client.get("/repos/o/r", not_found_error=RepoNotFoundError)


@respx.mock
async def test_post_422_raises_comment_rejected(client):
    respx.post("https://api.github.com/repos/o/r/issues/1/comments").mock(
        return_value=httpx.Response(422, json={"message": "rejected"})
    )
    with pytest.raises(CommentRejectedError):
        await client.post("/repos/o/r/issues/1/comments", json={"body": "hi"})


@respx.mock
async def test_get_timeout_raises_github_timeout(client):
    respx.get("https://api.github.com/repos/o/r").mock(side_effect=httpx.TimeoutException("x"))
    with pytest.raises(GitHubTimeoutError):
        await client.get("/repos/o/r")
