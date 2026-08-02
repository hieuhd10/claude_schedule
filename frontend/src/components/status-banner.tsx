import { ApiError } from "../api/types";

interface StatusBannerProps {
  loading?: boolean;
  error?: Error | null;
  isWaitingForClaude?: boolean;
  pollAttempts?: number;
  empty?: boolean;
}

function describeError(error: Error): { title: string; detail: string } {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "REPO_NOT_FOUND":
        return { title: "Repository not found", detail: error.message };
      case "ISSUE_NOT_FOUND":
        return { title: "Issue not found", detail: error.message };
      case "PR_NOT_FOUND":
        return { title: "Pull Request not found", detail: error.message };
      case "TOKEN_INVALID":
        return { title: "GitHub token invalid or expired", detail: error.message };
      case "PRIVATE_OR_NO_SCOPE":
        return {
          title: "Permission denied",
          detail: "Repository is private or the token lacks the required scope.",
        };
      case "REPOSITORY_NOT_ALLOWED":
        return { title: "Repository not enabled", detail: error.message };
      case "RATE_LIMITED":
        return {
          title: "GitHub rate limit exceeded",
          detail: error.retryAfter
            ? `Retry after ${error.retryAfter}s.`
            : "Please wait and retry.",
        };
      case "COMMENT_REJECTED":
        return { title: "Comment rejected by GitHub", detail: error.message };
      case "GITHUB_TIMEOUT":
        return { title: "GitHub API timed out", detail: error.message };
      case "INVALID_URL":
        return { title: "Invalid Issue URL", detail: error.message };
      case "VALIDATION_ERROR":
        return { title: "Please check the form", detail: error.message };
      default:
        return { title: "GitHub API error", detail: error.message };
    }
  }
  return { title: "Something went wrong", detail: error.message };
}

export function StatusBanner({
  loading,
  error,
  isWaitingForClaude,
  pollAttempts,
  empty,
}: StatusBannerProps) {
  if (loading) {
    return <div className="status-banner status-banner--loading">Loading from GitHub…</div>;
  }

  if (error) {
    const { title, detail } = describeError(error);
    return (
      <div className="status-banner status-banner--error">
        <strong>{title}</strong>
        <div>{detail}</div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="status-banner status-banner--empty">
        Enter a GitHub Issue URL above to get started.
      </div>
    );
  }

  if (isWaitingForClaude) {
    return (
      <div className="status-banner status-banner--waiting">
        Waiting for Claude GitHub Action{pollAttempts ? ` (attempt ${pollAttempts})` : ""}…
      </div>
    );
  }

  return null;
}
