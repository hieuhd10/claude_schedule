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

    # Comma-separated allowlist of check-run names (e.g. "test, integration")
    # that actually represent test execution. When unset, any check whose name
    # looks like Claude's own automation (e.g. "claude-review") is excluded
    # from CI verification instead of being trusted as a test result.
    test_check_names: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def test_check_name_list(self) -> list[str]:
        return [name.strip() for name in self.test_check_names.split(",") if name.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
