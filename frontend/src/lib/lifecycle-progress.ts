import {
  STAGES,
  type CheckRun,
  type Issue,
  type LifecycleResult,
  type PullRequest,
  type ParsedClaudeResponse,
  type Stage,
  type StageOwner,
} from "../api/types";

export type StepState = "done" | "current" | "waiting";

export function stageOwner(lifecycle: LifecycleResult, stage: Stage): StageOwner | null {
  return lifecycle.stage_owners.find((owner) => owner.stage === stage) ?? null;
}

/** The Claude report filed under a stage, which survives later comments on other stages. */
export function stageResponse(lifecycle: LifecycleResult, stage: Stage): ParsedClaudeResponse | null {
  return lifecycle.stage_reports.find((report) => report.stage === stage)?.response ?? null;
}

export interface TransitionCondition {
  label: string;
  met: boolean;
  detail: string;
}

export interface LifecycleSignals {
  lifecycle: LifecycleResult;
  issue: Issue;
  linkedPullRequest: PullRequest | null;
  prChecks: CheckRun[];
  prCommitCount: number;
}

/**
 * Whether a step actually happened, judged only by what is recorded on GitHub.
 * Closing an issue sends the lifecycle straight to Completed from wherever it
 * stood, so a step's position in the list proves nothing about it.
 */
function stepReached(stage: Stage, signals: LifecycleSignals): boolean {
  const { lifecycle, issue, linkedPullRequest } = signals;
  switch (stage) {
    case "debug":
      return lifecycle.debug_approved;
    case "fix":
      return linkedPullRequest !== null;
    case "review":
      return lifecycle.review_result === "PASSED";
    case "test":
      return lifecycle.test_result === "PASSED";
    case "ready_to_merge":
      return linkedPullRequest?.merged === true;
    case "completed":
      return issue.state === "closed";
  }
}

export function stepState(stage: Stage, signals: LifecycleSignals): StepState {
  const currentStage = signals.lifecycle.stage;
  if (currentStage === "completed") {
    return stepReached(stage, signals) ? "done" : "waiting";
  }
  const index = STAGES.indexOf(stage);
  const currentIndex = STAGES.indexOf(currentStage);
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  return "waiting";
}

export interface CheckSummary {
  total: number;
  passed: number;
  failed: number;
  pending: number;
}

// The same conclusions the backend treats as green, so the counts on screen
// cannot contradict the verdict the lifecycle was inferred from.
const PASSING_CONCLUSIONS = new Set(["success", "neutral", "skipped"]);

export function summarizeChecks(checks: CheckRun[]): CheckSummary {
  let passed = 0;
  let failed = 0;
  let pending = 0;
  for (const check of checks) {
    if (check.conclusion === null) pending += 1;
    else if (PASSING_CONCLUSIONS.has(check.conclusion)) passed += 1;
    else failed += 1;
  }
  return { total: checks.length, passed, failed, pending };
}

/**
 * Conditions that must hold before the given stage can hand over to the next one.
 * Every condition is derived from GitHub state or a recorded lifecycle marker, so
 * the checklist reflects what actually happened instead of manual ticking.
 */
export function transitionConditions(stage: Stage, signals: LifecycleSignals): TransitionCondition[] {
  const { lifecycle, issue, linkedPullRequest, prChecks, prCommitCount } = signals;
  const checks = summarizeChecks(prChecks);
  // The Debug report, not the newest comment, so this stays true once the flow moves on.
  const rootCause = stageResponse(lifecycle, "debug")?.root_cause ?? null;
  const checksDetail = checks.total > 0
    ? `${checks.passed} of ${checks.total} checks passed`
    : "No checks reported for the Pull Request";

  switch (stage) {
    case "debug":
      return [
        {
          label: "Root cause identified",
          met: Boolean(rootCause),
          detail: rootCause ? "Reported in the Debug analysis" : "No root cause recorded yet",
        },
        {
          label: "Debug result approved",
          met: lifecycle.debug_approved,
          detail: lifecycle.debug_approved
            ? "Approval checkpoint recorded on the issue"
            : "Record the debug approval checkpoint to start Fix",
        },
      ];
    case "fix":
      return [
        {
          label: "Pull Request opened",
          met: linkedPullRequest !== null,
          detail: linkedPullRequest
            ? `#${linkedPullRequest.number} · ${linkedPullRequest.head_branch}`
            : "No Pull Request linked to this issue yet",
        },
        {
          label: "Commits pushed",
          met: prCommitCount > 0,
          detail: prCommitCount > 0 ? `${prCommitCount} commit(s) on the fix branch` : "No commits on the fix branch",
        },
      ];
    // Review hands over on the verdict alone; the checks are what Test gates on.
    case "review":
      return [
        {
          label: "Review result recorded",
          met: lifecycle.review_result === "PASSED",
          detail: lifecycle.review_result
            ? `Latest review reports REVIEW ${lifecycle.review_result}`
            : "Post REVIEW PASSED or REVIEW FAILED on the Pull Request",
        },
      ];
    case "test":
      return [
        {
          label: "Test result recorded",
          met: lifecycle.test_result === "PASSED",
          detail: lifecycle.test_result
            ? `Latest test comment reports TEST ${lifecycle.test_result}`
            : "Post TEST PASSED or TEST FAILED on the Pull Request",
        },
        {
          label: "CI checks green",
          met: lifecycle.checks_green,
          detail: checksDetail,
        },
      ];
    case "ready_to_merge":
      return [
        {
          label: "Pull Request merged",
          met: linkedPullRequest?.merged === true,
          detail: linkedPullRequest?.merged ? "Merge recorded on GitHub" : "Merge the Pull Request from this step",
        },
        {
          label: "Issue closed",
          met: issue.state === "closed",
          detail: issue.state === "closed" ? "Issue is closed" : "Close the issue after the merge",
        },
      ];
    case "completed":
      return [
        {
          label: "Issue closed",
          met: issue.state === "closed",
          detail: issue.closed_at ? `Closed ${new Date(issue.closed_at).toLocaleString()}` : "Issue is still open",
        },
      ];
  }
}

export interface ReadinessGroup {
  label: string;
  complete: boolean;
  detail: string;
}

/** Completeness of each QA report section, used by the report readiness panel. */
export function reportReadiness(signals: LifecycleSignals, hasBugDescription: boolean): ReadinessGroup[] {
  const { lifecycle, linkedPullRequest, prChecks } = signals;
  const checks = summarizeChecks(prChecks);
  const checksGreen = lifecycle.checks_green;
  const rootCause = stageResponse(lifecycle, "debug")?.root_cause ?? null;

  return [
    {
      label: "Issue information",
      complete: hasBugDescription,
      detail: hasBugDescription ? "Reported with the bug report template" : "Steps, expected and actual result missing",
    },
    {
      label: "Root cause",
      complete: Boolean(rootCause),
      detail: rootCause ? "Recorded from the debug analysis" : "No root cause recorded",
    },
    {
      label: "Fix record",
      complete: linkedPullRequest !== null,
      detail: linkedPullRequest ? `Pull Request #${linkedPullRequest.number}` : "No Pull Request linked",
    },
    {
      label: "Test verification",
      complete: lifecycle.test_result === "PASSED" && checksGreen,
      detail: lifecycle.test_result
        ? `Test ${lifecycle.test_result.toLowerCase()} · ${checks.passed}/${checks.total || 0} checks passed`
        : "No test result recorded",
    },
  ];
}
