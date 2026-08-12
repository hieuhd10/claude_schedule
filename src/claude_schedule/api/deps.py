from functools import lru_cache

from fastapi import Depends

from claude_schedule.github.client import GitHubClient
from claude_schedule.github.errors import RepositoryNotAllowedError
from claude_schedule.github.service import GitHubService
from claude_schedule.settings import Settings, get_settings


@lru_cache
def _get_client(token: str, timeout_seconds: float) -> GitHubClient:
    return GitHubClient(token=token, timeout_seconds=timeout_seconds)


def get_github_service(settings: Settings = Depends(get_settings)) -> GitHubService:
    client = _get_client(settings.github_token, settings.github_api_timeout_seconds)
    return GitHubService(client)


def get_github_service_for_repo(
    owner: str, repository: str, settings: Settings = Depends(get_settings)
) -> GitHubService:
    token = settings.get_token_for_repository(owner, repository)
    client = _get_client(token, settings.github_api_timeout_seconds)
    return GitHubService(client)


def ensure_repository_allowed(owner: str, repository: str, settings: Settings) -> None:
    if not settings.repository_is_allowed(owner, repository):
        raise RepositoryNotAllowedError(
            f"Repository {owner}/{repository} is not enabled for this application"
        )


async def close_github_client(settings: Settings) -> None:
    if _get_client.cache_info().currsize == 0:
        return
    client = _get_client(settings.github_token, settings.github_api_timeout_seconds)
    await client.aclose()
    _get_client.cache_clear()
