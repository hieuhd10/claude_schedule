from functools import lru_cache

from fastapi import Depends

from claude_schedule.github.client import GitHubClient
from claude_schedule.github.service import GitHubService
from claude_schedule.settings import Settings, get_settings


@lru_cache
def _get_client(token: str, timeout_seconds: float) -> GitHubClient:
    return GitHubClient(token=token, timeout_seconds=timeout_seconds)


def get_github_service(settings: Settings = Depends(get_settings)) -> GitHubService:
    client = _get_client(settings.github_token, settings.github_api_timeout_seconds)
    return GitHubService(client)
