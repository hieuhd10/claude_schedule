import { STAGES, STAGE_LABELS, type Issue, type LifecycleResult, type PullRequest } from "../api/types";
import { Avatar, Badge, Card } from "../design-system/lift-tailux";
import { formatDateTime, relativeTime } from "../lib/format-time";
import { issueSummary } from "../lib/parse-issue-body";
import { parseLabelMetadata } from "../lib/parse-labels";
import { SEVERITY_COLORS } from "../lib/ds-colors";

interface IssueHeaderProps {
  issue: Issue;
  lifecycle: LifecycleResult;
  linkedPullRequest: PullRequest | null;
}

export function IssueHeader({ issue, lifecycle, linkedPullRequest }: IssueHeaderProps) {
  const { severity, status, otherLabels } = parseLabelMetadata(issue.labels);
  const summary = issueSummary(issue.body);
  const stepNumber = STAGES.indexOf(lifecycle.stage) + 1;

  return (
    <Card className="issue-summary-card">
      <div className="issue-summary-card__main">
        <div className="issue-summary-card__badges">
          <span className="issue-summary-card__id">#{issue.number}</span>
          <Badge component="span" variant="soft" color={issue.state === "open" ? "info" : "success"}>
            {issue.state === "open" ? "Open" : "Closed"}
          </Badge>
          <Badge component="span" variant="soft" color="primary">
            {STAGE_LABELS[lifecycle.stage]}
          </Badge>
          {severity && (
            <Badge component="span" variant="soft" color={SEVERITY_COLORS[severity] ?? "warning"}>
              {severity} severity
            </Badge>
          )}
          {status && (
            <Badge component="span" variant="soft">
              {status}
            </Badge>
          )}
          {otherLabels.map((label) => (
            <Badge component="span" variant="soft" key={label}>
              {label}
            </Badge>
          ))}
        </div>

        <h1 className="issue-summary-card__title">{issue.title}</h1>
        {summary && <p className="issue-summary-card__summary">{summary}</p>}
      </div>

      <dl className="issue-summary-card__facts">
        <div>
          <dt className="t-overline">Assignee</dt>
          <dd>
            {issue.assignee ? (
              <span className="owner-chip">
                <Avatar name={issue.assignee} size={7} initialColor="primary" />
                <span className="owner-chip__name">{issue.assignee}</span>
              </span>
            ) : (
              <span className="t-caption">Unassigned</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="t-overline">Current Step</dt>
          <dd>
            <strong>{STAGE_LABELS[lifecycle.stage]}</strong>
            <span className="t-tiny">
              Step {stepNumber} of {STAGES.length}
            </span>
          </dd>
        </div>
        <div>
          <dt className="t-overline">Pull Request</dt>
          <dd>
            {linkedPullRequest ? (
              <>
                <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
                  #{linkedPullRequest.number}
                </a>
                <span className="t-tiny">
                  {linkedPullRequest.merged ? "Merged" : linkedPullRequest.state}
                </span>
              </>
            ) : (
              <>
                <strong>—</strong>
                <span className="t-tiny">Not linked yet</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="t-overline">Last Update</dt>
          <dd>
            <strong>{relativeTime(issue.updated_at)}</strong>
            <span className="t-tiny">{formatDateTime(issue.updated_at)}</span>
          </dd>
        </div>
      </dl>
    </Card>
  );
}
