import pytest
from pydantic import ValidationError

from claude_schedule.api.issue_template import build_bug_report_body, build_labels_from_metadata
from claude_schedule.api.schemas import LABEL_PREFIXES, CreateIssueRequest


def _request(**overrides) -> CreateIssueRequest:
    defaults = {
        "title": "Bug: sky is blue",
        "environment": "dev",
        "base_branch": "develop",
        "severity": "high",
        "steps_to_reproduce": "1. Look up",
        "expected_result": "Sky should be transparent",
        "actual_result": "Sky is blue",
        "additional_notes": None,
        "assignee": None,
    }
    defaults.update(overrides)
    return CreateIssueRequest(**defaults)


def test_build_bug_report_body_includes_all_sections():
    body = build_bug_report_body(_request())
    assert "## Steps to Reproduce" in body
    assert "1. Look up" in body
    assert "## Expected Result" in body
    assert "Sky should be transparent" in body
    assert "## Actual Result" in body
    assert "Sky is blue" in body


def test_build_bug_report_body_pairs_each_value_with_its_own_heading():
    # Guards against the Expected/Actual sections silently swapping: each
    # value must sit directly under its own heading, not just appear
    # somewhere in the body.
    body = build_bug_report_body(_request())
    expected_heading_index = body.index("## Expected Result")
    expected_value_index = body.index("Sky should be transparent")
    actual_heading_index = body.index("## Actual Result")
    actual_value_index = body.index("Sky is blue")

    assert (
        expected_heading_index
        < expected_value_index
        < actual_heading_index
        < actual_value_index
    )


def test_build_bug_report_body_omits_additional_notes_when_absent():
    body = build_bug_report_body(_request(additional_notes=None))
    assert "Additional Notes" not in body


def test_build_bug_report_body_includes_additional_notes_when_present():
    body = build_bug_report_body(_request(additional_notes="Only happens on Safari"))
    assert "## Additional Notes" in body
    assert "Only happens on Safari" in body


def test_build_labels_from_metadata():
    labels = build_labels_from_metadata(_request())
    assert labels == ["env:dev", "base:develop", "severity:high"]


def test_build_labels_from_metadata_uses_shared_label_prefixes_constant():
    labels = build_labels_from_metadata(_request())
    assert labels == [
        f"{LABEL_PREFIXES['environment']}dev",
        f"{LABEL_PREFIXES['base_branch']}develop",
        f"{LABEL_PREFIXES['severity']}high",
    ]


def test_build_labels_from_metadata_empty_when_no_fields():
    labels = build_labels_from_metadata(_request(environment=None, base_branch=None, severity=None))
    assert labels == []


def test_build_labels_from_metadata_accepts_max_length_values():
    labels = build_labels_from_metadata(
        _request(environment="e" * 46, base_branch="b" * 45, severity="s" * 41)
    )
    assert labels == [f"env:{'e' * 46}", f"base:{'b' * 45}", f"severity:{'s' * 41}"]


def test_environment_longer_than_github_label_limit_is_rejected():
    with pytest.raises(ValidationError, match="environment"):
        _request(environment="staging-eu-west-1-canary-deploy-slot-42-blue-green")


def test_base_branch_longer_than_github_label_limit_is_rejected():
    with pytest.raises(ValidationError, match="base_branch"):
        _request(base_branch="b" * 46)


def test_severity_longer_than_github_label_limit_is_rejected():
    with pytest.raises(ValidationError, match="severity"):
        _request(severity="s" * 42)
