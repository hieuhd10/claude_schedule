import { parseLabelMetadata } from "../lib/parse-labels";
import type { Issue, PullRequest } from "../api/types";

interface IssueHeaderProps {
  owner: string;
  repository: string;
  issue: Issue;
  linkedPullRequest: PullRequest | null;
  onRefresh: () => void;
  refreshing: boolean;
}

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function IssueHeader({
  owner,
  repository,
  issue,
  linkedPullRequest,
  onRefresh,
  refreshing,
}: IssueHeaderProps) {
  const { environment, baseBranch, status, otherLabels } = parseLabelMetadata(issue.labels);
  const effectiveBaseBranch = baseBranch ?? linkedPullRequest?.base_branch ?? null;

  return (
    <header className="issue-header">
      <div className="issue-header__top">
        <div>
          <div className="issue-header__repo">
            {owner}/{repository}
          </div>
          <h1>
            {issue.title} <span className="issue-header__number">#{issue.number}</span>
          </h1>
        </div>
        <button type="button" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh from GitHub"}
        </button>
      </div>

      <div className="issue-header__meta">
        <span className={`badge badge--${issue.state}`}>{issue.state}</span>
        {environment && <span className="badge">env: {environment}</span>}
        {effectiveBaseBranch && <span className="badge">base: {effectiveBaseBranch}</span>}
        {status && <span className="badge">status: {status}</span>}
        {otherLabels.map((label) => (
          <span className="badge" key={label}>
            {label}
          </span>
        ))}
        {linkedPullRequest && (
          <a
            className={`badge badge--link badge--${linkedPullRequest.merged ? "closed" : linkedPullRequest.state}`}
            href={linkedPullRequest.html_url}
            target="_blank"
            rel="noreferrer"
          >
            PR #{linkedPullRequest.number}
          </a>
        )}
      </div>

      <div className="issue-header__people">
        <span className="person-chip">
          <span className="person-chip__avatar">{initials(issue.author)}</span>
          <span className="person-chip__label">
            Author <strong>{issue.author}</strong>
          </span>
        </span>
        <span className="person-chip">
          <span className="person-chip__avatar">{initials(issue.assignee ?? "—")}</span>
          <span className="person-chip__label">
            Assignee <strong>{issue.assignee ?? "unassigned"}</strong>
          </span>
        </span>
        <span className="issue-header__timestamp">
          Created: {new Date(issue.created_at).toLocaleString()}
        </span>
        <span className="issue-header__timestamp">
          Updated: {new Date(issue.updated_at).toLocaleString()}
        </span>
      </div>

      <a href={issue.html_url} target="_blank" rel="noreferrer">
        View on GitHub ↗
      </a>
    </header>
  );
}
