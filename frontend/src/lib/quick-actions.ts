import type { Stage } from "../api/types";

export type QuickActionTarget = "issue" | "pull_request";

export interface StageAction {
  title: string;
  description: string;
  target: QuickActionTarget;
  manualPlaceholder: string;
  claudePrompt: string;
}

export const STAGE_ACTIONS: Record<Stage, StageAction> = {
  debug: {
    title: "Investigate the issue",
    description: "Add your own investigation, or ask Claude to inspect the issue and report the root cause.",
    target: "issue",
    manualPlaceholder: "Add investigation notes, reproduction details, or the suspected root cause…",
    claudePrompt:
      "@claude Please investigate this issue, identify the root cause, and report your findings with evidence.",
  },
  fix: {
    title: "Implement the fix",
    description: "Track implementation manually, or ask Claude to make the change and open a Pull Request.",
    target: "issue",
    manualPlaceholder: "Add implementation progress, decisions, or a link to the work in progress…",
    claudePrompt:
      "@claude The debug analysis is approved. Please implement the fix, add appropriate tests, and open a Pull Request linked to this issue.",
  },
  review: {
    title: "Review the Pull Request",
    description: "Post review findings yourself, or ask Claude to review the linked Pull Request.",
    target: "pull_request",
    manualPlaceholder:
      "Add review findings. Put REVIEW PASSED or REVIEW FAILED on its own line to update the lifecycle…",
    claudePrompt:
      "@claude Please review this Pull Request for correctness, regressions, and test coverage. Report the final result on its own line as REVIEW PASSED or REVIEW FAILED, followed by any findings.",
  },
  test: {
    title: "Verify the fix",
    description: "Record test evidence manually, or ask Claude to run and assess the relevant tests.",
    target: "pull_request",
    manualPlaceholder:
      "Add test evidence. Put TEST PASSED or TEST FAILED on its own line to update the lifecycle…",
    claudePrompt:
      "@claude Please run the relevant tests for this Pull Request and inspect the CI results. Report the final result on its own line as TEST PASSED or TEST FAILED, followed by evidence.",
  },
  ready_to_merge: {
    title: "Prepare to complete",
    description: "Record the merge decision manually, or ask Claude for a final readiness check.",
    target: "pull_request",
    manualPlaceholder: "Add the merge decision, rollout notes, or any final verification…",
    claudePrompt:
      "@claude Please perform a final merge-readiness check and summarize any remaining risks. Do not merge; report whether the Pull Request is ready.",
  },
  completed: {
    title: "Document the outcome",
    description: "Leave a closing note manually, or ask Claude to summarize the completed work.",
    target: "issue",
    manualPlaceholder: "Add a closing summary, deployment note, or follow-up item…",
    claudePrompt:
      "@claude Please summarize the final resolution, tests performed, and any follow-up work for this completed issue.",
  },
};
