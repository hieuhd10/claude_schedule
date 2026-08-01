import { STAGE_LABELS } from "../api/types";
import type { CheckRun, Commit, LifecycleResult, PullRequest } from "../api/types";

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

export function StageDetailPanel({
  lifecycle,
  linkedPullRequest,
  prChecks,
  prCommits,
}: StageDetailPanelProps) {
  const commit = latestCommit(prCommits);

  return (
    <section className="stage-detail-panel">
      <h2>Current Stage: {STAGE_LABELS[lifecycle.stage]}</h2>

      <div className="stage-detail-panel__grid">
        <div>
          <strong>Last command</strong>
          <p>{lifecycle.last_command ?? "—"}</p>
        </div>

        <div>
          <strong>Last Claude response</strong>
          {lifecycle.last_claude_response ? (
            lifecycle.last_claude_response.is_structured ? (
              <div>
                {lifecycle.last_claude_response.root_cause && (
                  <p>
                    <em>Root cause:</em> {lifecycle.last_claude_response.root_cause}
                  </p>
                )}
                {lifecycle.last_claude_response.findings.length > 0 && (
                  <ul>
                    {lifecycle.last_claude_response.findings.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                )}
                {lifecycle.last_claude_response.test_result && (
                  <p>
                    <em>Test result:</em> {lifecycle.last_claude_response.test_result}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="badge badge--unstructured">Unstructured response</span>
                <p className="stage-detail-panel__raw-body">
                  {lifecycle.last_claude_response.raw_body}
                </p>
              </div>
            )
          ) : (
            <p>—</p>
          )}
        </div>

        <div>
          <strong>Pull Request</strong>
          {linkedPullRequest ? (
            <p>
              <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
                #{linkedPullRequest.number} {linkedPullRequest.title}
              </a>
              <br />
              {linkedPullRequest.head_branch} → {linkedPullRequest.base_branch}
              <br />
              {linkedPullRequest.merged ? "Merged" : linkedPullRequest.state}
            </p>
          ) : (
            <p>No linked Pull Request yet.</p>
          )}
        </div>

        <div>
          <strong>Latest commit</strong>
          {commit ? (
            <p>
              <a href={commit.html_url} target="_blank" rel="noreferrer">
                {commit.sha.slice(0, 7)}
              </a>{" "}
              {commit.message}
            </p>
          ) : (
            <p>—</p>
          )}
        </div>

        <div>
          <strong>CI / check status</strong>
          {prChecks.length > 0 ? (
            <ul>
              {prChecks.map((check) => (
                <li key={check.name}>
                  {check.name}: {check.status}
                  {check.conclusion ? ` / ${check.conclusion}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p>No checks reported.</p>
          )}
        </div>

        <div>
          <strong>Review findings</strong>
          {lifecycle.review_findings.length > 0 ? (
            <ul>
              {lifecycle.review_findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          ) : (
            <p>—</p>
          )}
        </div>

        <div>
          <strong>Test result</strong>
          <p>{lifecycle.test_result ?? "—"}</p>
        </div>
      </div>

      <div className="stage-detail-panel__reasoning">
        <strong>Why this stage:</strong>
        <ul>
          {lifecycle.reasoning.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="stage-detail-panel__next-action">
        <strong>Next recommended action:</strong> {lifecycle.next_recommended_action}
      </div>
    </section>
  );
}
