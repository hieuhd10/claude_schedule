class GitHubError(Exception):
    """Base class for all GitHub integration errors."""


class RepoNotFoundError(GitHubError):
    pass


class IssueNotFoundError(GitHubError):
    pass


class PullRequestNotFoundError(GitHubError):
    pass


class TokenInvalidError(GitHubError):
    pass


class PrivateOrNoScopeError(GitHubError):
    pass


class RateLimitedError(GitHubError):
    def __init__(self, message: str, retry_after: int | None = None) -> None:
        super().__init__(message)
        self.retry_after = retry_after


class CommentRejectedError(GitHubError):
    pass


class GitHubTimeoutError(GitHubError):
    pass
