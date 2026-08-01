from claude_schedule.api.issue_template import build_bug_report_body, build_labels_from_metadata
from claude_schedule.api.schemas import CreateIssueRequest


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


def test_build_labels_from_metadata_empty_when_no_fields():
    labels = build_labels_from_metadata(_request(environment=None, base_branch=None, severity=None))
    assert labels == []
