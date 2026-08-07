from datetime import datetime, timezone

from claude_schedule.github.client import GitHubClient
from claude_schedule.github.errors import (
    IssueNotFoundError,
    PullRequestNotFoundError,
    RepoNotFoundError,
)
from claude_schedule.github.models import (
    CheckRun,
    Comment,
    Commit,
    Issue,
    IssueState,
    PullRequest,
    TimelineEvent,
)

_TIMELINE_ACCEPT_HEADER = {
    "Accept": "application/vnd.github+json,application/vnd.github.mockingbird-preview+json"
}


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _parse_required_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _map_issue(raw: dict) -> Issue:
    return Issue(
        number=raw["number"],
        title=raw["title"],
        body=raw.get("body") or "",
        state=IssueState(raw["state"]),
        labels=[label["name"] for label in raw.get("labels", [])],
        assignee=(raw.get("assignee") or {}).get("login"),
        author=raw["user"]["login"],
        created_at=_parse_required_datetime(raw["created_at"]),
        updated_at=_parse_required_datetime(raw["updated_at"]),
        closed_at=_parse_datetime(raw.get("closed_at")),
        html_url=raw["html_url"],
    )


def _map_comment(raw: dict) -> Comment:
    return Comment(
        id=raw["id"],
        body=raw.get("body") or "",
        author=raw["user"]["login"],
        created_at=_parse_required_datetime(raw["created_at"]),
        updated_at=_parse_required_datetime(raw["updated_at"]),
        html_url=raw["html_url"],
    )


def _map_review(raw: dict) -> Comment:
    """A submitted review carries a submission time only, so it stands in for both timestamps."""
    submitted_at = _parse_required_datetime(raw["submitted_at"])
    return Comment(
        id=raw["id"],
        body=raw.get("body") or "",
        author=raw["user"]["login"],
        created_at=submitted_at,
        updated_at=submitted_at,
        html_url=raw["html_url"],
    )


def _map_pull_request(raw: dict) -> PullRequest:
    return PullRequest(
        number=raw["number"],
        title=raw["title"],
        state=IssueState(raw["state"]),
        merged=bool(raw.get("merged")),
        head_branch=raw["head"]["ref"],
        base_branch=raw["base"]["ref"],
        head_sha=raw["head"]["sha"],
        author=raw["user"]["login"],
        created_at=_parse_required_datetime(raw["created_at"]),
        updated_at=_parse_required_datetime(raw["updated_at"]),
        merged_at=_parse_datetime(raw.get("merged_at")),
        closed_at=_parse_datetime(raw.get("closed_at")),
        html_url=raw["html_url"],
    )


def _map_timeline_event(raw: dict) -> TimelineEvent:
    actor = None
    if raw.get("actor"):
        actor = raw["actor"].get("login")
    else:
        source_user = raw.get("source", {}).get("issue", {}).get("user")
        if source_user:
            actor = source_user.get("login")

    html_url = raw.get("html_url")
    if not html_url:
        source_issue = raw.get("source", {}).get("issue")
        if source_issue:
            html_url = source_issue.get("html_url")

    return TimelineEvent(
        event=raw.get("event", "unknown"),
        actor=actor,
        created_at=_parse_datetime(raw.get("created_at")),
        html_url=html_url,
        raw=raw,
    )


def _map_check_run(raw: dict) -> CheckRun:
    return CheckRun(
        name=raw["name"],
        status=raw["status"],
        conclusion=raw.get("conclusion"),
        html_url=raw.get("html_url"),
        started_at=_parse_datetime(raw.get("started_at")),
        completed_at=_parse_datetime(raw.get("completed_at")),
    )


def _map_commit(raw: dict) -> Commit:
    commit = raw["commit"]
    return Commit(
        sha=raw["sha"],
        message=commit["message"],
        author=(commit.get("author") or {}).get("name"),
        committed_at=_parse_datetime((commit.get("author") or {}).get("date")),
        html_url=raw["html_url"],
    )


class GitHubService:
    def __init__(self, client: GitHubClient) -> None:
        self._client = client

    async def get_issue(self, owner: str, repository: str, issue_number: int) -> Issue:
        raw = await self._client.get(
            f"/repos/{owner}/{repository}/issues/{issue_number}",
            not_found_error=IssueNotFoundError,
        )
        return _map_issue(raw)

    async def create_issue(
        self,
        owner: str,
        repository: str,
        title: str,
        body: str,
        labels: list[str],
        assignee: str | None,
    ) -> Issue:
        payload: dict = {"title": title, "body": body, "labels": labels}
        if assignee:
            payload["assignees"] = [assignee]
        raw = await self._client.post(
            f"/repos/{owner}/{repository}/issues",
            json=payload,
            not_found_error=RepoNotFoundError,
        )
        return _map_issue(raw)

    async def get_default_branch(self, owner: str, repository: str) -> str:
        raw = await self._client.get(
            f"/repos/{owner}/{repository}",
            not_found_error=RepoNotFoundError,
        )
        return raw["default_branch"]

    async def list_branches(self, owner: str, repository: str) -> list[str]:
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/branches",
            not_found_error=RepoNotFoundError,
        )
        return [item["name"] for item in raw]

    async def create_pull_request(
        self,
        owner: str,
        repository: str,
        title: str,
        head: str,
        base: str,
        body: str,
    ) -> PullRequest:
        raw = await self._client.post(
            f"/repos/{owner}/{repository}/pulls",
            json={"title": title, "head": head, "base": base, "body": body},
            not_found_error=RepoNotFoundError,
        )
        return _map_pull_request(raw)

    async def close_issue(self, owner: str, repository: str, issue_number: int) -> Issue:
        raw = await self._client.patch(
            f"/repos/{owner}/{repository}/issues/{issue_number}",
            json={"state": "closed", "state_reason": "completed"},
            not_found_error=IssueNotFoundError,
        )
        return _map_issue(raw)

    async def merge_pull_request(
        self,
        owner: str,
        repository: str,
        pr_number: int,
        merge_method: str,
    ) -> PullRequest:
        """
        Merge, then read the Pull Request back. The merge response carries only the
        resulting commit, and the caller needs the merged Pull Request itself.
        """
        await self._client.put(
            f"/repos/{owner}/{repository}/pulls/{pr_number}/merge",
            json={"merge_method": merge_method},
            not_found_error=PullRequestNotFoundError,
        )
        return await self.get_pull_request(owner, repository, pr_number)

    async def get_issue_comments(self, owner: str, repository: str, issue_number: int) -> list[Comment]:
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/issues/{issue_number}/comments",
            not_found_error=IssueNotFoundError,
        )
        return [_map_comment(item) for item in raw]

    async def get_issue_timeline(
        self, owner: str, repository: str, issue_number: int
    ) -> list[TimelineEvent]:
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/issues/{issue_number}/timeline",
            not_found_error=IssueNotFoundError,
            headers=_TIMELINE_ACCEPT_HEADER,
        )
        return [_map_timeline_event(item) for item in raw]

    async def find_linked_pull_request(
        self,
        owner: str,
        repository: str,
        issue_number: int,
        timeline: list[TimelineEvent] | None = None,
    ) -> PullRequest | None:
        if timeline is None:
            timeline = await self.get_issue_timeline(owner, repository, issue_number)

        candidates: list[tuple[datetime, int]] = []
        for event in timeline:
            source_issue = event.raw.get("source", {}).get("issue")
            if not source_issue or "pull_request" not in source_issue:
                continue
            source_repo = source_issue.get("repository", {}).get("full_name")
            if source_repo and source_repo != f"{owner}/{repository}":
                continue
            created_at = event.created_at or datetime.min.replace(tzinfo=timezone.utc)
            candidates.append((created_at, source_issue["number"]))

        if not candidates:
            return None

        candidates.sort(key=lambda pair: pair[0])
        _, pr_number = candidates[-1]
        return await self.get_pull_request(owner, repository, pr_number)

    async def get_pull_request(self, owner: str, repository: str, pr_number: int) -> PullRequest:
        raw = await self._client.get(
            f"/repos/{owner}/{repository}/pulls/{pr_number}",
            not_found_error=PullRequestNotFoundError,
        )
        return _map_pull_request(raw)

    async def get_pull_request_comments(
        self, owner: str, repository: str, pr_number: int
    ) -> list[Comment]:
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/issues/{pr_number}/comments",
            not_found_error=PullRequestNotFoundError,
        )
        return [_map_comment(item) for item in raw]

    async def get_pull_request_reviews(
        self, owner: str, repository: str, pr_number: int
    ) -> list[Comment]:
        """
        Submitted reviews, read as comments because that is what they are to the
        lifecycle: a REVIEW PASSED written through the GitHub review UI has to
        count the same as one written in a plain comment.
        """
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/pulls/{pr_number}/reviews",
            not_found_error=PullRequestNotFoundError,
        )
        reviews = []
        for item in raw:
            # A review still being drafted has no submission time and no verdict yet.
            if not item.get("submitted_at") or not (item.get("body") or "").strip():
                continue
            reviews.append(_map_review(item))
        return reviews

    async def get_pull_request_commits(
        self, owner: str, repository: str, pr_number: int
    ) -> list[Commit]:
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/pulls/{pr_number}/commits",
            not_found_error=PullRequestNotFoundError,
        )
        return [_map_commit(item) for item in raw]

    async def get_pull_request_checks(
        self,
        owner: str,
        repository: str,
        pr_number: int,
        head_sha: str | None = None,
    ) -> list[CheckRun]:
        if head_sha is None:
            pull_request = await self.get_pull_request(owner, repository, pr_number)
            head_sha = pull_request.head_sha
        raw = await self._client.get_paginated(
            f"/repos/{owner}/{repository}/commits/{head_sha}/check-runs",
            list_key="check_runs",
            not_found_error=PullRequestNotFoundError,
        )
        return [_map_check_run(item) for item in raw]

    async def post_issue_comment(
        self, owner: str, repository: str, issue_number: int, body: str
    ) -> Comment:
        raw = await self._client.post(
            f"/repos/{owner}/{repository}/issues/{issue_number}/comments",
            json={"body": body},
            not_found_error=IssueNotFoundError,
        )
        return _map_comment(raw)

    async def post_pull_request_comment(
        self, owner: str, repository: str, pr_number: int, body: str
    ) -> Comment:
        raw = await self._client.post(
            f"/repos/{owner}/{repository}/issues/{pr_number}/comments",
            json={"body": body},
            not_found_error=PullRequestNotFoundError,
        )
        return _map_comment(raw)
