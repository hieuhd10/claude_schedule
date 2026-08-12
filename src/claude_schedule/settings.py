from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    github_owner: str = ""
    github_repository: str = ""
    github_token: str = ""

    claude_bot_login: str = "claude[bot]"
    operator_github_username: str = ""

    cors_origins: str = "http://localhost:5173"
    github_api_timeout_seconds: float = 15.0
    restrict_to_configured_repository: bool = True
    repo_token_map_json: str = "{}"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def repository_is_allowed(self, owner: str, repository: str) -> bool:
        if not self.restrict_to_configured_repository:
            return True
        if not self.github_owner or not self.github_repository:
            return True
        return (
            owner.casefold() == self.github_owner.casefold()
            and repository.casefold() == self.github_repository.casefold()
        )

    def get_token_for_repository(self, owner: str, repository: str) -> str:
        import json

        repo_key = f"{owner}/{repository}".casefold()
        try:
            mapping: dict[str, str] = json.loads(self.repo_token_map_json or "{}")
            lowered_mapping = {k.casefold(): v for k, v in mapping.items()}
            if repo_key in lowered_mapping:
                return lowered_mapping[repo_key]
        except (json.JSONDecodeError, TypeError, AttributeError):
            return self.github_token
        return self.github_token


@lru_cache
def get_settings() -> Settings:
    return Settings()
