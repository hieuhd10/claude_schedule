import type { Issue, PullRequest } from "../api/types";
import { Avatar, Badge, Card } from "../design-system/lift-tailux";
import { SEVERITY_COLORS } from "../lib/ds-colors";
import { formatDateTime, relativeTime } from "../lib/format-time";
import { parseIssueBody } from "../lib/parse-issue-body";
import { parseLabelMetadata } from "../lib/parse-labels";

interface IssueInformationProps {
  issue: Issue;
  linkedPullRequest: PullRequest | null;
}

/**
 * Classification and context shared by every tab, so the same facts are never
 * repeated inside Overview, QA report or History.
 */
export function IssueInformation({ issue, linkedPullRequest }: IssueInformationProps) {
  const { environment, baseBranch, severity } = parseLabelMetadata(issue.labels);
  const body = parseIssueBody(issue.body);
  const effectiveEnvironment = environment ?? body.environment;
  const effectiveBaseBranch = baseBranch ?? linkedPullRequest?.base_branch ?? null;

  return (
    <Card className="issue-information">
      <div className="ds-card__head">
        <h2 className="t-card-title">Issue Information</h2>
        <span className="t-caption">Shared across all tabs</span>
      </div>

      <dl className="issue-information__grid">
        <div>
          <dt className="t-overline">Severity</dt>
          <dd>
            {severity ? (
              <Badge component="span" variant="soft" color={SEVERITY_COLORS[severity] ?? "warning"}>
                {severity}
              </Badge>
            ) : (
              <span className="t-caption">Not specified</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="t-overline">Environment</dt>
          <dd>{effectiveEnvironment ?? <span className="t-caption">Not specified</span>}</dd>
        </div>
        <div>
          <dt className="t-overline">Base Branch</dt>
          <dd>
            {effectiveBaseBranch ? <code>{effectiveBaseBranch}</code> : <span className="t-caption">Not specified</span>}
          </dd>
        </div>
        <div>
          <dt className="t-overline">Fix Branch</dt>
          <dd>
            {linkedPullRequest ? (
              <code>{linkedPullRequest.head_branch}</code>
            ) : (
              <span className="t-caption">Not created yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="t-overline">Reporter</dt>
          <dd>
            <span className="owner-chip">
              <Avatar name={issue.author} size={6} initialColor="auto" initialVariant="soft" />
              <span className="owner-chip__name">{issue.author}</span>
            </span>
          </dd>
        </div>
        <div>
          <dt className="t-overline">Reported</dt>
          <dd>
            {formatDateTime(issue.created_at)}
            <span className="t-tiny">{relativeTime(issue.created_at)}</span>
          </dd>
        </div>
        <div>
          <dt className="t-overline">Closed</dt>
          <dd>
            {issue.closed_at ? formatDateTime(issue.closed_at) : <span className="t-caption">Still open</span>}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
