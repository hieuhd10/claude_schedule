import json

from fastapi.testclient import TestClient

from claude_schedule.main import app
from claude_schedule.settings import Settings, get_settings

client = TestClient(app)


def test_settings_get_token_for_repository():
    mapping = {
        "orgA/repoA": "ghp_token_a",
        "orgB/repoB": "ghp_token_b",
    }
    settings = Settings(
        github_token="ghp_default_token",
        repo_token_map_json=json.dumps(mapping),
    )

    assert settings.get_token_for_repository("orgA", "repoA") == "ghp_token_a"
    assert settings.get_token_for_repository("ORGA", "REPOA") == "ghp_token_a"
    assert settings.get_token_for_repository("orgB", "repoB") == "ghp_token_b"
    assert settings.get_token_for_repository("other", "repo") == "ghp_default_token"


def test_get_multi_repo_config_endpoint():
    mapping = {"orgA/repoA": "ghp_token_a"}
    override_settings = Settings(
        github_owner="default_owner",
        github_repository="default_repo",
        restrict_to_configured_repository=False,
        repo_token_map_json=json.dumps(mapping),
    )
    app.dependency_overrides[get_settings] = lambda: override_settings

    try:
        response = client.get("/api/config/multi-repo")
        assert response.status_code == 200
        data = response.json()
        assert data["default_owner"] == "default_owner"
        assert data["default_repository"] == "default_repo"
        assert data["restrict_to_configured_repository"] is False
        assert len(data["configured_repositories"]) == 1
        assert data["configured_repositories"][0]["repository_full_name"] == "orgA/repoA"
        assert data["configured_repositories"][0]["has_custom_token"] is True
    finally:
        app.dependency_overrides.clear()


def test_validate_repo_token_endpoint():
    res1 = client.post("/api/config/repo-tokens/validate", json={"token": "ghp_1234567890"})
    assert res1.status_code == 200
    assert res1.json()["valid"] is True

    res2 = client.post("/api/config/repo-tokens/validate", json={"token": "invalid_prefix"})
    assert res2.status_code == 200
    assert res2.json()["valid"] is False
