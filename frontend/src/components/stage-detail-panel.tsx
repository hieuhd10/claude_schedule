import { STAGE_LABELS } from "../api/types";
import type { CheckRun, Commit, LifecycleResult, PullRequest } from "../api/types";
import {
  claudeResponseStatus,
  type ClaudeResponseStatus,
} from "../lib/claude-response-status";

interface StageDetailPanelProps {
  lifecycle: LifecycleResult;
  linkedPullRequest: PullRequest | null;
  prChecks: CheckRun[];
  prCommits: Commit[];
}

function latestCommit(commits: Commit[]): Commit | null {
  if (commits.length === 0) return null;
  return commits[commits.length - 1];
}

type CheckState = "success" | "failure" | "pending";

function checkState(check: CheckRun): CheckState {
  if (check.conclusion === "success") return "success";
  if (check.conclusion) return "failure";
  return "pending";
}

const CHECK_ICON: Record<CheckState, string> = {
  success: "✓",
  failure: "✕",
  pending: "●",
};

const CLAUDE_RESPONSE_LABEL: Record<ClaudeResponseStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  responded: "Responded",
};

export function StageDetailPanel({
  lifecycle,
  linkedPullRequest,
  prChecks,
  prCommits,
}: StageDetailPanelProps) {
  const commit = latestCommit(prCommits);

  return (
    <section className="stage-detail-panel">
      <div className="stage-detail-panel__head">
        <h2>Workspace · {STAGE_LABELS[lifecycle.stage]}</h2>
        {lifecycle.last_command && (
          <p className="stage-detail-panel__last-command">
            Last command: <code>{lifecycle.last_command}</code>
          </p>
        )}
      </div>

      <div className="stage-detail-panel__sections">
        <div className="stage-detail-panel__section">
          <h3>Pull Request</h3>
          {linkedPullRequest ? (
            <p>
              <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
                #{linkedPullRequest.number} {linkedPullRequest.title}
              </a>
              <br />
              <span className="stage-detail-panel__muted">
                {linkedPullRequest.head_branch} → {linkedPullRequest.base_branch}
              </span>
              <br />
              <span
                className={`badge badge--${linkedPullRequest.merged ? "closed" : linkedPullRequest.state}`}
              >
                {linkedPullRequest.merged ? "Merged" : linkedPullRequest.state}
              </span>
            </p>
          ) : (
            <p className="stage-detail-panel__muted">No linked Pull Request yet.</p>
          )}
        </div>

        <div className="stage-detail-panel__section">
          <h3>Latest commit</h3>
          {commit ? (
            <p>
              <a href={commit.html_url} target="_blank" rel="noreferrer">
                {commit.sha.slice(0, 7)}
              </a>{" "}
              {commit.message}
            </p>
          ) : (
            <p className="stage-detail-panel__muted">—</p>
          )}
        </div>

        <div className="stage-detail-panel__section">
          <h3>CI / Checks</h3>
          {prChecks.length > 0 ? (
            <ul className="check-list">
              {prChecks.map((check) => {
                const state = checkState(check);
                return (
                  <li key={check.name} className="check-list__item">
                    <span className={`check-list__icon check-list__icon--${state}`}>
                      {CHECK_ICON[state]}
                    </span>
                    <span className="check-list__name">{check.name}</span>
                    <span className={`check-list__status check-list__status--${state}`}>
                      {check.conclusion ?? check.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="stage-detail-panel__muted">No checks reported.</p>
          )}
        </div>

        <div className="stage-detail-panel__section">
          <h3>Claude response</h3>
          {lifecycle.last_claude_response ? (
            (() => {
              const response = lifecycle.last_claude_response;
              const status = claudeResponseStatus(response.raw_body);
              const hasDetails = Boolean(response.root_cause || response.findings.length > 0);
              return (
                <div className="stage-detail-panel__response">
                  <span className={`badge badge--${status}`}>{CLAUDE_RESPONSE_LABEL[status]}</span>
                  {hasDetails && (
                    <details className="stage-detail-panel__response-details">
                      <summary>View response details</summary>
                      <div className="stage-detail-panel__response-details-body">
                        {response.root_cause && (
                          <p>
                            <strong>Root cause:</strong> {response.root_cause}
                          </p>
                        )}
                        {response.findings.length > 0 && (
                          <ul>
                            {response.findings.map((finding, index) => (
                              <li key={index}>{finding}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="stage-detail-panel__muted">—</p>
          )}
        </div>

        <div className="stage-detail-panel__section">
          <h3>Review findings</h3>
          {lifecycle.review_findings.length > 0 ? (
            <ul>
              {lifecycle.review_findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          ) : (
            <p className="stage-detail-panel__muted">—</p>
          )}
        </div>

        <div className="stage-detail-panel__section">
          <h3>Test result</h3>
          <p className="stage-detail-panel__muted">{lifecycle.test_result ?? "—"}</p>
        </div>
      </div>

      <details className="stage-detail-panel__reasoning">
        <summary>Why this stage</summary>
        <ul>
          {lifecycle.reasoning.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </details>

      <div className="stage-detail-panel__next-action">
        <span className="stage-detail-panel__next-action-label">Next recommended action</span>
        <p>{lifecycle.next_recommended_action}</p>
      </div>
    </section>
  );
}
