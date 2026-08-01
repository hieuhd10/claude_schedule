import re

from claude_schedule.github.models import CheckRun, Comment, Commit, PullRequest, TimelineEvent
from claude_schedule.lifecycle.models import ActivityCategory, ActivityItem, ParsedClaudeResponse

_FIELD_HEADINGS = {
    "root_cause": {"root cause"},
    "findings": {"finding", "findings"},
    "test_result": {"test result", "test results"},
}
_HEADING_LINE_RE = re.compile(r"^[#*\s]*([A-Za-z][A-Za-z ]*?)[:*]*\s*$")

# Timeline event types that duplicate data already surfaced via comments/commits
# elsewhere in the merged activity feed.
_SKIPPED_TIMELINE_EVENTS = {"commented", "committed", "line-commented", "mentioned", "subscribed"}

_SUMMARY_LIMIT = 140


def parse_claude_response(body: str) -> ParsedClaudeResponse:
    sections: dict[str, list[str]] = {}
    current_field: str | None = None

    for line in body.splitlines():
        heading_match = _HEADING_LINE_RE.match(line.strip())
        matched_field = None
        if heading_match:
            heading_text = heading_match.group(1).strip().lower()
            for field, aliases in _FIELD_HEADINGS.items():
                if heading_text in aliases:
                    matched_field = field
                    break
        if matched_field:
            current_field = matched_field
            sections.setdefault(current_field, [])
            continue
        if current_field:
            sections[current_field].append(line)

    if not sections:
        return ParsedClaudeResponse(raw_body=body, is_structured=False)

    root_cause = "\n".join(sections.get("root_cause", [])).strip() or None
    findings_text = "\n".join(sections.get("findings", [])).strip()
    findings = (
        [item.strip("- ").strip() for item in findings_text.splitlines() if item.strip()]
        if findings_text
        else []
    )
    test_result = "\n".join(sections.get("test_result", [])).strip() or None

    return ParsedClaudeResponse(
        raw_body=body,
        is_structured=True,
        root_cause=root_cause,
        findings=findings,
        test_result=test_result,
    )


def _summarize(body: str) -> str:
    first_line = next((line.strip() for line in body.splitlines() if line.strip()), "")
    if len(first_line) <= _SUMMARY_LIMIT:
        return first_line
    return first_line[: _SUMMARY_LIMIT - 1].rstrip() + "…"


def _comment_category(comment: Comment, claude_bot_login: str) -> ActivityCategory:
    if comment.author == claude_bot_login:
        return ActivityCategory.CLAUDE_RESPONSE
    return ActivityCategory.HUMAN_COMMAND


def merge_and_categorize(
    *,
    issue_number: int,
    issue_comments: list[Comment],
    pull_request: PullRequest | None,
    pr_comments: list[Comment],
    pr_commits: list[Commit],
    checks: list[CheckRun],
    timeline_events: list[TimelineEvent],
    claude_bot_login: str,
) -> list[ActivityItem]:
    items: list[ActivityItem] = []

    for comment in issue_comments:
        items.append(
            ActivityItem(
                category=_comment_category(comment, claude_bot_login),
                source=f"Issue #{issue_number}",
                actor=comment.author,
                summary=_summarize(comment.body),
                created_at=comment.created_at.isoformat(),
                html_url=comment.html_url,
            )
        )

    if pull_request is not None:
        for comment in pr_comments:
            items.append(
                ActivityItem(
                    category=_comment_category(comment, claude_bot_login),
                    source=f"Pull Request #{pull_request.number}",
                    actor=comment.author,
                    summary=_summarize(comment.body),
                    created_at=comment.created_at.isoformat(),
                    html_url=comment.html_url,
                )
            )
        for commit in pr_commits:
            items.append(
                ActivityItem(
                    category=ActivityCategory.GITHUB_SYSTEM,
                    source=f"Pull Request #{pull_request.number}",
                    actor=commit.author,
                    summary=_summarize(commit.message),
                    created_at=commit.committed_at.isoformat() if commit.committed_at else None,
                    html_url=commit.html_url,
                )
            )
        for check in checks:
            timestamp = check.completed_at or check.started_at
            items.append(
                ActivityItem(
                    category=ActivityCategory.CI_WORKFLOW,
                    source=f"Check: {check.name}",
                    actor=None,
                    summary=f"{check.status}" + (f" / {check.conclusion}" if check.conclusion else ""),
                    created_at=timestamp.isoformat() if timestamp else None,
                    html_url=check.html_url,
                )
            )

    for event in timeline_events:
        if event.event in _SKIPPED_TIMELINE_EVENTS:
            continue
        items.append(
            ActivityItem(
                category=ActivityCategory.GITHUB_SYSTEM,
                source=f"Issue #{issue_number}",
                actor=event.actor,
                summary=event.event.replace("-", " "),
                created_at=event.created_at.isoformat() if event.created_at else None,
                html_url=event.html_url,
            )
        )

    items.sort(key=lambda item: item.created_at or "")
    return items
