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
      </div>

      <div className="issue-header__people">
        <span>Author: {issue.author}</span>
        <span>Assignee: {issue.assignee ?? "unassigned"}</span>
        <span>Created: {new Date(issue.created_at).toLocaleString()}</span>
        <span>Updated: {new Date(issue.updated_at).toLocaleString()}</span>
      </div>

      <a href={issue.html_url} target="_blank" rel="noreferrer">
        View on GitHub ↗
      </a>
    </header>
  );
}
