import type { Stage } from "../api/types";

export type QuickActionTarget = "issue" | "pull_request";

/**
 * The lifecycle reads Claude's reply by heading, and it files each reply under
 * the stage whose sections it carries. Every prompt that feeds a field on the
 * screen therefore has to name the headings it expects - without them the reply
 * parses as unstructured and the panel stays empty.
 */
function reportFormat(...sections: [heading: string, guidance: string][]): string {
  return [
    "Report the result using these exact headings:",
    "",
    ...sections.flatMap(([heading, guidance]) => [heading, guidance, ""]),
  ]
    .join("\n")
    .trimEnd();
}

const ROOT_CAUSE_SECTION: [string, string] = [
  "## Root Cause",
  "One paragraph naming the component at fault and why it fails.",
];
const SOLUTION_SECTION: [string, string] = [
  "## Solution",
  "One paragraph describing the change you made and why it fixes the root cause.",
];
const FINDINGS_SECTION: [string, string] = [
  "## Findings",
  "- One bullet per piece of evidence, each with the file path it came from.",
];
const TEST_RESULT_SECTION: [string, string] = [
  "## Test Result",
  "Which suites ran and how many cases passed, failed or were skipped.",
];
const REMAINING_RISK_SECTION: [string, string] = [
  "## Remaining Risk",
  "Anything still unverified, or the single word None.",
];
const SUMMARY_SECTION: [string, string] = [
  "## Summary",
  "Two sentences: what was wrong and what shipped.",
];

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
    claudePrompt: `@claude Please investigate this issue and identify the root cause.\n\n${reportFormat(
      ROOT_CAUSE_SECTION,
      FINDINGS_SECTION,
    )}`,
  },
  fix: {
    title: "Implement the fix",
    description: "Track implementation manually, or ask Claude to make the change and open a Pull Request.",
    target: "issue",
    manualPlaceholder: "Add implementation progress, decisions, or a link to the work in progress…",
    claudePrompt: `@claude The debug analysis is approved. Please implement the fix, add appropriate tests, and open a Pull Request linked to this issue.\n\n${reportFormat(
      SOLUTION_SECTION,
      REMAINING_RISK_SECTION,
    )}`,
  },
  review: {
    title: "Review the Pull Request",
    description: "Post review findings yourself, or ask Claude to review the linked Pull Request.",
    target: "pull_request",
    manualPlaceholder:
      "Add review findings. Put REVIEW PASSED or REVIEW FAILED on its own line to update the lifecycle…",
    claudePrompt: `@claude Please review this Pull Request for correctness, regressions, and test coverage.\n\nPut REVIEW PASSED or REVIEW FAILED on its own line.\n\n${reportFormat(
      FINDINGS_SECTION,
    )}`,
  },
  test: {
    title: "Verify the fix",
    description: "Record test evidence manually, or ask Claude to run and assess the relevant tests.",
    target: "pull_request",
    manualPlaceholder:
      "Add test evidence. Put TEST PASSED or TEST FAILED on its own line to update the lifecycle…",
    claudePrompt: `@claude Please run the relevant tests for this Pull Request and inspect the CI results.\n\nPut TEST PASSED or TEST FAILED on its own line.\n\n${reportFormat(
      TEST_RESULT_SECTION,
      FINDINGS_SECTION,
    )}`,
  },
  ready_to_merge: {
    title: "Prepare to complete",
    description: "Record the merge decision manually, or ask Claude for a final readiness check.",
    target: "pull_request",
    manualPlaceholder: "Add the merge decision, rollout notes, or any final verification…",
    claudePrompt: `@claude Please perform a final merge-readiness check. Do not merge.\n\n${reportFormat(
      SUMMARY_SECTION,
      REMAINING_RISK_SECTION,
    )}`,
  },
  completed: {
    title: "Document the outcome",
    description: "Leave a closing note manually, or ask Claude to summarize the completed work.",
    target: "issue",
    manualPlaceholder: "Add a closing summary, deployment note, or follow-up item…",
    claudePrompt: `@claude Please summarize the final resolution and any follow-up work for this completed issue.\n\n${reportFormat(
      SUMMARY_SECTION,
      REMAINING_RISK_SECTION,
    )}`,
  },
};
