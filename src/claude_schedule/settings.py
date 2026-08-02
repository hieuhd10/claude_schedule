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


@lru_cache
def get_settings() -> Settings:
    return Settings()
