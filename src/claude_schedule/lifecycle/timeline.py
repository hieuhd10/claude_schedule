import re

from claude_schedule.github.models import CheckRun, Comment, Commit, PullRequest, TimelineEvent
from claude_schedule.lifecycle.models import ActivityCategory, ActivityItem, ParsedClaudeResponse

# One shared vocabulary across every stage of the flow: a comment declares which
# stage it reports on by the sections it carries, so nothing has to be guessed
# from the order comments arrive in.
_FIELD_HEADINGS = {
    "root cause": "root_cause",
    "root causes": "root_cause",
    "solution": "solution",
    "implemented solution": "solution",
    "finding": "findings",
    "findings": "findings",
    "key findings": "findings",
    "test result": "test_result",
    "test results": "test_result",
    "remaining risk": "remaining_risk",
    "remaining risks": "remaining_risk",
    "summary": "summary",
}

_MD_HEADING_RE = re.compile(r"^#{1,6}\s")
_DECORATION_RE = re.compile(r"^#{1,6}\s*|\*\*")
_NAME_RE = re.compile(r"^(?P<name>[A-Za-z][A-Za-z ]*?)\s*(?::\s*(?P<inline>.*))?$")
_CODE_FENCE_RE = re.compile(r"^\s*```")


def _match_heading(line: str) -> tuple[str, str] | None:
    """
    Heading name (lower-cased) and any content written on the same line.

    A line only counts as a heading when it is marked up as one - a markdown
    heading, a bold label, or a name followed by a colon. Plain prose must never
    match, or a section would be cut short by its own first sentence.
    """
    stripped = line.strip()
    plain = _DECORATION_RE.sub("", stripped).strip()
    match = _NAME_RE.match(plain)
    if not match:
        return None

    is_marked_up = bool(_MD_HEADING_RE.match(stripped)) or stripped.startswith("**") or ":" in plain
    if not is_marked_up:
        return None

    return match.group("name").strip().lower(), (match.group("inline") or "").strip()

# Timeline event types that duplicate data already surfaced via comments/commits
# elsewhere in the merged activity feed.
_SKIPPED_TIMELINE_EVENTS = {"commented", "committed", "line-commented", "mentioned", "subscribed"}

_SUMMARY_LIMIT = 140


def parse_claude_response(body: str, html_url: str | None = None) -> ParsedClaudeResponse:
    sections: dict[str, list[str]] = {}
    current_field: str | None = None
    in_code_block = False

    for line in body.splitlines():
        if _CODE_FENCE_RE.match(line):
            in_code_block = not in_code_block
        elif not in_code_block:
            heading = _match_heading(line)
            if heading is not None:
                name, inline = heading
                # An unrecognized heading still ends the section it follows,
                # otherwise the rest of the comment lands in the previous field.
                current_field = _FIELD_HEADINGS.get(name)
                if current_field is not None:
                    bucket = sections.setdefault(current_field, [])
                    if inline:
                        bucket.append(inline)
                continue

        if current_field:
            sections[current_field].append(line)

    if not sections:
        return ParsedClaudeResponse(raw_body=body, is_structured=False, html_url=html_url)

    def text(field: str) -> str | None:
        return "\n".join(sections.get(field, [])).strip() or None

    findings_text = text("findings")
    findings = (
        [item.strip("-*• ").strip() for item in findings_text.splitlines() if item.strip()]
        if findings_text
        else []
    )

    return ParsedClaudeResponse(
        raw_body=body,
        is_structured=True,
        root_cause=text("root_cause"),
        solution=text("solution"),
        findings=findings,
        test_result=text("test_result"),
        remaining_risk=text("remaining_risk"),
        summary=text("summary"),
        html_url=html_url,
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
