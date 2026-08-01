from claude_schedule.api.schemas import CreateIssueRequest


def build_bug_report_body(request: CreateIssueRequest) -> str:
    sections = [
        "## Environment",
        request.environment or "Not specified",
        "",
        "## Steps to Reproduce",
        request.steps_to_reproduce,
        "",
        "## Expected Result",
        request.expected_result,
        "",
        "## Actual Result",
        request.actual_result,
    ]
    if request.additional_notes:
        sections += ["", "## Additional Notes", request.additional_notes]
    return "\n".join(sections)


def build_labels_from_metadata(request: CreateIssueRequest) -> list[str]:
    labels = []
    if request.environment:
        labels.append(f"env:{request.environment}")
    if request.base_branch:
        labels.append(f"base:{request.base_branch}")
    if request.severity:
        labels.append(f"severity:{request.severity}")
    return labels
