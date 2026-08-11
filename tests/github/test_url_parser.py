import pytest

from claude_schedule.github.url_parser import InvalidIssueUrlError, parse_issue_url


def test_parse_issue_url_valid():
    owner, repo, number = parse_issue_url("https://github.com/hieuhd10/claude_schedule/issues/128")
    assert (owner, repo, number) == ("hieuhd10", "claude_schedule", 128)


def test_parse_pull_request_url_valid():
    owner, repo, number = parse_issue_url("https://github.com/hieuhd10/claude_schedule/pull/27")
    assert (owner, repo, number) == ("hieuhd10", "claude_schedule", 27)


def test_parse_issue_url_trailing_slash():
    owner, repo, number = parse_issue_url("https://github.com/owner/repo/issues/1/")
    assert (owner, repo, number) == ("owner", "repo", 1)


@pytest.mark.parametrize(
    "url",
    [
        "https://gitlab.com/owner/repo/issues/1",
        "not-a-url",
        "https://github.com/owner/repo/issues/not-a-number",
    ],
)
def test_parse_issue_url_invalid(url):
    with pytest.raises(InvalidIssueUrlError):
        parse_issue_url(url)
