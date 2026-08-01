import re

_ISSUE_URL_RE = re.compile(
    r"^https?://github\.com/(?P<owner>[^/]+)/(?P<repo>[^/]+)/issues/(?P<number>\d+)/?$"
)


class InvalidIssueUrlError(ValueError):
    pass


def parse_issue_url(url: str) -> tuple[str, str, int]:
    match = _ISSUE_URL_RE.match(url.strip())
    if not match:
        raise InvalidIssueUrlError(f"Not a valid GitHub issue URL: {url}")
    return match.group("owner"), match.group("repo"), int(match.group("number"))
