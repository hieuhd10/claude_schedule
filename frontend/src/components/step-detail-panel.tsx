import type { ReactNode } from "react";

import type { CheckRun, Commit, ParsedClaudeResponse, Stage } from "../api/types";
import { rootCauseGap } from "../lib/claude-response-gap";
import { formatDateTime } from "../lib/format-time";
import {
  stageOwner,
  stageResponse,
  stepState,
  transitionConditions,
  type LifecycleSignals,
} from "../lib/lifecycle-progress";
import { CheckRunList } from "./check-run-list";
import { ClaudeResponseSummary } from "./claude-response-summary";
import { ExpandableText } from "./expandable-text";
import { FindingsList } from "./findings-list";
import { StageOwnerChip } from "./stage-owner-chip";
import { StepSection } from "./step-section";
import { TransitionChecklist } from "./transition-checklist";

interface StepDetailPanelProps {
  stage: Stage;
  signals: LifecycleSignals;
  prCommits: Commit[];
}

/**
 * What a step has to say, assembled before rendering so empty fields disappear
 * instead of turning into a column of "not recorded yet" lines.
 */
interface StepContent {
  /** The one sentence that answers "what happened at this step". */
  headline: { label: string; text: string } | null;
  risk: string | null;
  lists: { label: string; items: string[] }[];
  records: { label: string; value: ReactNode }[];
  checks: CheckRun[];
  /** Shown only when the step has nothing else at all. */
  waitingFor: string;
  /** Offered as a raw fallback when the step is empty but Claude did reply. */
  fallback: ParsedClaudeResponse | null;
}

function isEmpty(content: StepContent): boolean {
  return (
    !content.headline &&
    !content.risk &&
    content.lists.every((list) => list.items.length === 0) &&
    content.records.length === 0 &&
    content.checks.length === 0
  );
}

function latestCommit(commits: Commit[]): Commit | null {
  return commits.length > 0 ? commits[commits.length - 1] : null;
}

export function StepDetailPanel({ stage, signals, prCommits }: StepDetailPanelProps) {
  const { lifecycle, issue, linkedPullRequest, prChecks } = signals;
  const state = stepState(stage, signals);
  const owner = stageOwner(lifecycle, stage);
  // Each step reads the report filed under it, so it keeps its content after the flow moves on.
  const report = stageResponse(lifecycle, stage);
  const isCurrent = stage === lifecycle.stage;
  const content = buildContent();
  // The workspace card below owns the live checklist, so it is not repeated here.
  const conditions = isCurrent ? [] : transitionConditions(stage, signals);
  const hasAside = Boolean(owner?.actor) || conditions.length > 0;

  return (
    <div className={`step-detail step-detail--${state}${hasAside ? "" : " step-detail--wide"}`}>
      <div className="step-detail__content">
        {isEmpty(content) ? (
          <div className="step-detail__waiting">
            <p className="t-body">{content.waitingFor}</p>
            {content.fallback && <ClaudeResponseSummary response={content.fallback} />}
          </div>
        ) : (
          <>
            {content.headline && (
              <StepSection label={content.headline.label} panel>
                <ExpandableText text={content.headline.text} />
              </StepSection>
            )}

            {content.risk && (
              <StepSection label="Remaining Risk" panel tone="risk">
                <ExpandableText text={content.risk} lines={3} />
              </StepSection>
            )}

            {content.lists
              .filter((list) => list.items.length > 0)
              .map((list) => (
                <StepSection key={list.label} label={list.label} meta={list.items.length}>
                  <FindingsList findings={list.items} />
                </StepSection>
              ))}

            {content.records.length > 0 && (
              <StepSection label="Records">
                <dl className="step-detail__records">
                  {content.records.map((record) => (
                    <div key={record.label}>
                      <dt className="t-tiny">{record.label}</dt>
                      <dd className="t-body">{record.value}</dd>
                    </div>
                  ))}
                </dl>
              </StepSection>
            )}

            {content.checks.length > 0 && (
              <StepSection label="Checks" meta={content.checks.length}>
                <CheckRunList checks={content.checks} />
              </StepSection>
            )}
          </>
        )}
      </div>

      {hasAside && (
        <aside className="step-detail__aside">
          {owner?.actor && (
            <StepSection label="Owner">
              <StageOwnerChip owner={owner} />
            </StepSection>
          )}
          {conditions.length > 0 && (
            <StepSection label="Conditions">
              <TransitionChecklist conditions={conditions} />
            </StepSection>
          )}
        </aside>
      )}
    </div>
  );

  function prRecords(): { label: string; value: ReactNode }[] {
    if (!linkedPullRequest) return [];
    const commit = latestCommit(prCommits);
    const records: { label: string; value: ReactNode }[] = [
      {
        label: "Pull Request",
        value: (
          <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
            #{linkedPullRequest.number}
          </a>
        ),
      },
      {
        label: "Branch",
        value: (
          <>
            <code>{linkedPullRequest.head_branch}</code> → <code>{linkedPullRequest.base_branch}</code>
          </>
        ),
      },
    ];
    if (commit) {
      records.push({
        label: "Commit",
        value: (
          <>
            <a href={commit.html_url} target="_blank" rel="noreferrer">
              <code>{commit.sha.slice(0, 7)}</code>
            </a>{" "}
            {commit.message.split("\n")[0]}
          </>
        ),
      });
    }
    return records;
  }

  function buildContent(): StepContent {
    const findings = report?.findings ?? [];

    switch (stage) {
      case "debug":
        return {
          headline: report?.root_cause ? { label: "Root Cause", text: report.root_cause } : null,
          risk: null,
          lists: [{ label: "Findings", items: findings }],
          records: [],
          checks: [],
          waitingFor: rootCauseGap(report ?? lifecycle.last_claude_response),
          fallback: report ?? lifecycle.last_claude_response,
        };

      case "fix":
        return {
          headline: report?.solution ? { label: "Solution", text: report.solution } : null,
          risk: report?.remaining_risk ?? null,
          lists: [],
          records: prRecords(),
          checks: [],
          waitingFor: "Waiting for the fix and a Pull Request.",
          fallback: report,
        };

      case "review":
        return {
          headline: null,
          risk: null,
          lists: [
            { label: "Findings", items: findings.length > 0 ? findings : lifecycle.review_findings },
          ],
          records: [],
          checks: prChecks,
          waitingFor: "Waiting for a review verdict on the Pull Request.",
          fallback: report,
        };

      case "test":
        return {
          headline: report?.test_result ? { label: "Runs", text: report.test_result } : null,
          risk: null,
          lists: [{ label: "Evidence", items: findings }],
          records: [],
          checks: prChecks,
          waitingFor: "Waiting for a test verdict on the Pull Request.",
          fallback: report,
        };

      case "ready_to_merge":
        return {
          headline: report?.summary ? { label: "Summary", text: report.summary } : null,
          risk: report?.remaining_risk ?? null,
          lists: [],
          records: prRecords(),
          checks: [],
          waitingFor: "Waiting for the merge-readiness check.",
          fallback: report,
        };

      case "completed":
        return {
          headline: report?.summary
            ? { label: "Summary", text: report.summary }
            : issue.closed_at
              ? { label: "Outcome", text: `Closed ${formatDateTime(issue.closed_at)}` }
              : null,
          risk: report?.remaining_risk ?? null,
          lists: [],
          records: linkedPullRequest?.merged_at
            ? [
                {
                  label: "Merged",
                  value: (
                    <>
                      <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
                        #{linkedPullRequest.number}
                      </a>{" "}
                      {formatDateTime(linkedPullRequest.merged_at)}
                    </>
                  ),
                },
              ]
            : [],
          checks: [],
          waitingFor: "Waiting for the issue to be closed.",
          fallback: report,
        };
    }
  }
}
