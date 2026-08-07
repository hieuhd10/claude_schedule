import type { IssueDetailResponse } from "../api/types";
import {
  Badge,
  Button,
  Card,
  Progress,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
} from "../design-system/lift-tailux";
import { checkState } from "../lib/check-state";
import { rootCauseGap } from "../lib/claude-response-gap";
import { CHECK_STATE_COLORS } from "../lib/ds-colors";
import { formatDateTime } from "../lib/format-time";
import {
  reportReadiness,
  stageOwner,
  stageResponse,
  summarizeChecks,
  type LifecycleSignals,
} from "../lib/lifecycle-progress";
import { parseIssueBody, splitSteps } from "../lib/parse-issue-body";
import { ClaudeResponseSummary } from "./claude-response-summary";
import { FindingsList } from "./findings-list";
import { StageOwnerChip } from "./stage-owner-chip";

interface QaReportTabProps {
  data: IssueDetailResponse;
  signals: LifecycleSignals;
}

export function QaReportTab({ data, signals }: QaReportTabProps) {
  const {
    issue,
    lifecycle,
    linked_pull_request: linkedPullRequest,
    pr_checks: prChecks,
    pr_commits: prCommits,
  } = data;
  const body = parseIssueBody(issue.body);
  const checks = summarizeChecks(prChecks);
  const hasBugDescription = Boolean(body.stepsToReproduce && body.expectedResult && body.actualResult);
  const readiness = reportReadiness(signals, hasBugDescription);
  const completeGroups = readiness.filter((group) => group.complete).length;
  const readinessPercent = Math.round((completeGroups / readiness.length) * 100);
  const latestCommit = prCommits.length > 0 ? prCommits[prCommits.length - 1] : null;
  const debugReport = stageResponse(lifecycle, "debug");
  const fixReport = stageResponse(lifecycle, "fix");
  const testReport = stageResponse(lifecycle, "test");
  const rootCause = debugReport?.root_cause ?? null;

  return (
    <div className="tab-layout">
      <div className="tab-layout__main">
        <Card className="ds-card">
          <div className="ds-card__head">
            <span className="ds-card__index">01</span>
            <h2 className="t-card-title">Bug Description</h2>
            <span className="t-caption">From the reported issue</span>
          </div>
          <div className="ds-card__body">
            {hasBugDescription || body.preamble ? (
              <>
                <div className="report-grid">
                  <div>
                    <h3 className="t-overline report-grid__label--error">Actual Result</h3>
                    <p className="t-body">{body.actualResult ?? "Not recorded"}</p>
                  </div>
                  <div>
                    <h3 className="t-overline report-grid__label--success">Expected Result</h3>
                    <p className="t-body">{body.expectedResult ?? "Not recorded"}</p>
                  </div>
                </div>

                <div className="report-grid">
                  <div>
                    <h3 className="t-overline">Steps To Reproduce</h3>
                    {body.stepsToReproduce ? (
                      <ol className="report-steps t-body">
                        {splitSteps(body.stepsToReproduce).map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="t-caption">Not recorded</p>
                    )}
                  </div>
                  <div>
                    <h3 className="t-overline">Additional Notes</h3>
                    <p className="t-body">{body.additionalNotes ?? body.preamble ?? "None"}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="t-caption">
                This issue was not created with the bug report template, so no structured description is
                available.{" "}
                <a href={issue.html_url} target="_blank" rel="noreferrer">
                  Read it on GitHub ↗
                </a>
              </p>
            )}
          </div>
        </Card>

        <Card className="ds-card">
          <div className="ds-card__head">
            <span className="ds-card__index">02</span>
            <h2 className="t-card-title">Debug &amp; Root Cause</h2>
            <Badge component="span" variant="soft" color={rootCause ? "success" : "warning"}>
              {rootCause ? "Recorded" : "Missing"}
            </Badge>
          </div>
          <div className="ds-card__body report-split">
            <div>
              {rootCause ? (
                <p className="callout">{rootCause}</p>
              ) : (
                <>
                  <p className="t-caption">{rootCauseGap(debugReport ?? lifecycle.last_claude_response)}</p>
                  <ClaudeResponseSummary response={debugReport ?? lifecycle.last_claude_response} />
                </>
              )}

              {(debugReport?.findings.length ?? 0) > 0 && (
                <>
                  <h3 className="t-overline">Findings</h3>
                  <FindingsList findings={debugReport?.findings ?? []} />
                </>
              )}
            </div>
            <div>
              <h3 className="t-overline">Recorded By</h3>
              <StageOwnerChip owner={stageOwner(lifecycle, "debug")} />
            </div>
          </div>
        </Card>

        <Card className="ds-card">
          <div className="ds-card__head">
            <span className="ds-card__index">03</span>
            <h2 className="t-card-title">Fix Information</h2>
            <Badge component="span" variant="soft" color={linkedPullRequest ? "primary" : "warning"}>
              {linkedPullRequest
                ? linkedPullRequest.merged
                  ? "Merged"
                  : linkedPullRequest.state
                : "Not started"}
            </Badge>
          </div>
          <div className="ds-card__body report-split">
            {linkedPullRequest ? (
              <>
                <div>
                  <h3 className="t-overline">Implemented Solution</h3>
                  {fixReport?.solution ? (
                    <p className="t-body">{fixReport.solution}</p>
                  ) : (
                    <p className="t-caption">No solution description reported for the fix.</p>
                  )}
                  {fixReport?.remaining_risk && (
                    <>
                      <h3 className="t-overline">Remaining Risk</h3>
                      <p className="callout callout--risk">{fixReport.remaining_risk}</p>
                    </>
                  )}
                </div>
                <dl className="record-list">
                  <div>
                    <dt className="t-overline">Pull Request</dt>
                    <dd className="t-body">
                      <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
                        #{linkedPullRequest.number} {linkedPullRequest.title}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="t-overline">Branch</dt>
                    <dd className="t-body">
                      <code>{linkedPullRequest.head_branch}</code> → <code>{linkedPullRequest.base_branch}</code>
                    </dd>
                  </div>
                  <div>
                    <dt className="t-overline">Latest Commit</dt>
                    <dd className="t-body">
                      {latestCommit ? (
                        <>
                          <a href={latestCommit.html_url} target="_blank" rel="noreferrer">
                            <code>{latestCommit.sha.slice(0, 7)}</code>
                          </a>{" "}
                          {latestCommit.message.split("\n")[0]}
                        </>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="t-overline">Opened</dt>
                    <dd className="t-body">{formatDateTime(linkedPullRequest.created_at)}</dd>
                  </div>
                </dl>
                <div>
                  <h3 className="t-overline">Implemented By</h3>
                  <StageOwnerChip owner={stageOwner(lifecycle, "fix")} />
                </div>
              </>
            ) : (
              <p className="t-caption">No Pull Request has been linked to this issue.</p>
            )}
          </div>
        </Card>

        <Card className="ds-card">
          <div className="ds-card__head">
            <span className="ds-card__index">04</span>
            <h2 className="t-card-title">Test Verification</h2>
            <Badge
              component="span"
              variant="soft"
              color={lifecycle.test_result === "PASSED" ? "success" : "warning"}
            >
              {lifecycle.test_result ?? "Not recorded"}
            </Badge>
          </div>
          <div className="ds-card__body">
            <div className="stat-cards stat-cards--inset">
              <div className="stat-card stat-card--flat">
                <span className="t-overline">Total Checks</span>
                <strong className="t-metric">{checks.total}</strong>
              </div>
              <div className="stat-card stat-card--flat" data-color="success">
                <span className="t-overline">Passed</span>
                <strong className="t-metric">{checks.passed}</strong>
              </div>
              <div className="stat-card stat-card--flat" data-color="warning">
                <span className="t-overline">Pending</span>
                <strong className="t-metric">{checks.pending}</strong>
              </div>
              <div className="stat-card stat-card--flat" data-color="error">
                <span className="t-overline">Failed</span>
                <strong className="t-metric">{checks.failed}</strong>
              </div>
            </div>

            {testReport?.test_result && (
              <>
                <h3 className="t-overline">Reported Runs</h3>
                <p className="t-body">{testReport.test_result}</p>
              </>
            )}
            {(testReport?.findings.length ?? 0) > 0 && (
              <>
                <h3 className="t-overline">Evidence</h3>
                <FindingsList findings={testReport?.findings ?? []} />
              </>
            )}

            <h3 className="t-overline">Verified By</h3>
            <StageOwnerChip owner={stageOwner(lifecycle, "test")} />

            {prChecks.length > 0 ? (
              <Table hoverable className="report-table">
                <THead>
                  <Tr>
                    <Th>Check</Th>
                    <Th>Status</Th>
                    <Th>Result</Th>
                    <Th>Completed</Th>
                  </Tr>
                </THead>
                <TBody>
                  {prChecks.map((check) => (
                    <Tr key={check.name}>
                      <Td>
                        {check.html_url ? (
                          <a href={check.html_url} target="_blank" rel="noreferrer">
                            {check.name}
                          </a>
                        ) : (
                          check.name
                        )}
                      </Td>
                      <Td>{check.status}</Td>
                      <Td>
                        <Badge component="span" variant="soft" color={CHECK_STATE_COLORS[checkState(check)]}>
                          {check.conclusion ?? "pending"}
                        </Badge>
                      </Td>
                      <Td>{formatDateTime(check.completed_at)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <p className="t-caption">No checks have been reported for this issue.</p>
            )}
          </div>
        </Card>
      </div>

      <aside className="tab-layout__aside">
        <Card className="ds-card">
          <div className="ds-card__head">
            <h2 className="t-card-title">Report Readiness</h2>
          </div>
          <div className="ds-card__body">
            <div className="readiness__score">
              <strong className="t-display">{readinessPercent}%</strong>
              <span className="t-caption">
                {completeGroups} of {readiness.length} groups complete
              </span>
            </div>
            <Progress
              value={readinessPercent}
              color={readinessPercent === 100 ? "success" : "warning"}
            />

            <ul className="readiness__list">
              {readiness.map((group) => (
                <li key={group.label}>
                  <span className="readiness__label">
                    <span className="t-body">{group.label}</span>
                    <span className="t-tiny">{group.detail}</span>
                  </span>
                  <Badge component="span" variant="soft" color={group.complete ? "success" : "warning"}>
                    {group.complete ? "Complete" : "Incomplete"}
                  </Badge>
                </li>
              ))}
            </ul>

            <p className="readiness__note t-tiny">
              The report is only conclusive when the root cause, the fix record and a passing test result
              are all present.
            </p>
          </div>
          <div className="ds-card__section readiness__actions">
            <Button component="a" variant="outlined" href={issue.html_url} target="_blank" rel="noreferrer">
              Open Issue On GitHub
            </Button>
            {linkedPullRequest && (
              <Button
                component="a"
                variant="flat"
                href={linkedPullRequest.html_url}
                target="_blank"
                rel="noreferrer"
              >
                Open Pull Request
              </Button>
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}
