from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from claude_schedule.github.errors import (
    CommentRejectedError,
    GitHubError,
    GitHubTimeoutError,
    IssueNotFoundError,
    PrivateOrNoScopeError,
    PullRequestNotFoundError,
    RateLimitedError,
    RepoNotFoundError,
    RepositoryNotAllowedError,
    TokenInvalidError,
)
from claude_schedule.github.url_parser import InvalidIssueUrlError

_ERROR_STATUS_AND_CODE: dict[type[GitHubError], tuple[int, str]] = {
    RepoNotFoundError: (404, "REPO_NOT_FOUND"),
    RepositoryNotAllowedError: (403, "REPOSITORY_NOT_ALLOWED"),
    IssueNotFoundError: (404, "ISSUE_NOT_FOUND"),
    PullRequestNotFoundError: (404, "PR_NOT_FOUND"),
    TokenInvalidError: (401, "TOKEN_INVALID"),
    PrivateOrNoScopeError: (403, "PRIVATE_OR_NO_SCOPE"),
    RateLimitedError: (429, "RATE_LIMITED"),
    CommentRejectedError: (422, "COMMENT_REJECTED"),
    GitHubTimeoutError: (504, "GITHUB_TIMEOUT"),
}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(GitHubError)
    async def handle_github_error(request: Request, exc: GitHubError) -> JSONResponse:
        status_code, code = _ERROR_STATUS_AND_CODE.get(type(exc), (502, "GITHUB_ERROR"))
        error_body: dict[str, object] = {"code": code, "message": str(exc)}
        if isinstance(exc, RateLimitedError) and exc.retry_after is not None:
            error_body["retry_after"] = exc.retry_after
        return JSONResponse(status_code=status_code, content={"error": error_body})

    @app.exception_handler(InvalidIssueUrlError)
    async def handle_invalid_url(request: Request, exc: InvalidIssueUrlError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"error": {"code": "INVALID_URL", "message": str(exc)}},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        message = "; ".join(error.get("msg", "Invalid request") for error in errors)
        return JSONResponse(
            status_code=422,
            content={"error": {"code": "VALIDATION_ERROR", "message": message}},
        )
