from typing import Any

import httpx

from claude_schedule.github.errors import (
    CommentRejectedError,
    GitHubError,
    GitHubTimeoutError,
    MergeNotAllowedError,
    PrivateOrNoScopeError,
    RateLimitedError,
    RepoNotFoundError,
    TokenInvalidError,
)

_GITHUB_API_BASE = "https://api.github.com"


class GitHubClient:
    def __init__(self, token: str, timeout_seconds: float) -> None:
        self._client = httpx.AsyncClient(
            base_url=_GITHUB_API_BASE,
            timeout=timeout_seconds,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    async def get(
        self,
        path: str,
        *,
        not_found_error: type[GitHubError] = RepoNotFoundError,
        headers: dict[str, str] | None = None,
    ) -> Any:
        return await self._request("GET", path, not_found_error=not_found_error, headers=headers)

    async def get_paginated(
        self,
        path: str,
        *,
        list_key: str | None = None,
        not_found_error: type[GitHubError] = RepoNotFoundError,
        headers: dict[str, str] | None = None,
    ) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        next_url: str | None = path
        seen_urls: set[str] = set()

        while next_url:
            if next_url in seen_urls:
                raise GitHubError(f"GitHub API returned a pagination loop: {path}")
            seen_urls.add(next_url)
            response = await self._request_response(
                "GET",
                next_url,
                not_found_error=not_found_error,
                headers=headers,
            )
            payload = response.json()
            page = payload.get(list_key, []) if list_key else payload
            if not isinstance(page, list):
                raise GitHubError(f"GitHub API returned an invalid paginated response: {path}")
            items.extend(page)
            next_link = response.links.get("next")
            next_url = next_link.get("url") if next_link else None

        return items

    async def post(
        self,
        path: str,
        *,
        json: dict,
        not_found_error: type[GitHubError] = RepoNotFoundError,
    ) -> Any:
        return await self._request("POST", path, not_found_error=not_found_error, json=json)

    async def patch(
        self,
        path: str,
        *,
        json: dict,
        not_found_error: type[GitHubError] = RepoNotFoundError,
    ) -> Any:
        return await self._request("PATCH", path, not_found_error=not_found_error, json=json)

    async def put(
        self,
        path: str,
        *,
        json: dict,
        not_found_error: type[GitHubError] = RepoNotFoundError,
    ) -> Any:
        return await self._request("PUT", path, not_found_error=not_found_error, json=json)

    async def _request(
        self,
        method: str,
        path: str,
        *,
        not_found_error: type[GitHubError],
        **kwargs: Any,
    ) -> Any:
        response = await self._request_response(
            method,
            path,
            not_found_error=not_found_error,
            **kwargs,
        )
        return response.json()

    async def _request_response(
        self,
        method: str,
        path: str,
        *,
        not_found_error: type[GitHubError],
        **kwargs: Any,
    ) -> httpx.Response:
        try:
            response = await self._client.request(method, path, **kwargs)
        except httpx.TimeoutException as exc:
            raise GitHubTimeoutError(f"GitHub API request timed out: {method} {path}") from exc
        except httpx.HTTPError as exc:
            raise GitHubError(f"GitHub API request failed: {method} {path}") from exc

        if response.status_code == 401:
            raise TokenInvalidError("GitHub token is invalid or expired")
        if response.status_code == 403:
            if response.headers.get("X-RateLimit-Remaining") == "0":
                retry_after = int(response.headers.get("Retry-After", "60"))
                raise RateLimitedError("GitHub API rate limit exceeded", retry_after=retry_after)
            raise PrivateOrNoScopeError(
                "Repository is private or the token lacks the required scope"
            )
        if response.status_code == 404:
            raise not_found_error("The requested GitHub resource was not found")
        # A merge GitHub will not perform: 405 for an unmergeable Pull Request,
        # 409 when the head moved on. Both are the operator's to resolve, not a bug.
        if response.status_code in (405, 409):
            message = response.json().get("message", "GitHub refused the merge")
            raise MergeNotAllowedError(message)
        if response.status_code == 422:
            message = response.json().get("message", "GitHub rejected the request")
            raise CommentRejectedError(message)
        if response.status_code >= 400:
            raise GitHubError(f"GitHub API error {response.status_code}: {response.text}")

        return response
