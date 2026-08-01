export type QuickActionTarget = "issue" | "pull_request";

export interface QuickAction {
  key: string;
  label: string;
  target: QuickActionTarget;
  buildPrompt: () => string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "debug-issue",
    label: "Debug issue",
    target: "issue",
    buildPrompt: () =>
      "@claude Please debug this issue: investigate the root cause and report back your findings.",
  },
  {
    key: "accept-debug-start-fix",
    label: "Accept debug and start fix",
    target: "issue",
    buildPrompt: () =>
      "@claude The debug analysis looks correct. Please proceed to fix the issue and open a Pull Request.",
  },
  {
    key: "review-pull-request",
    label: "Review Pull Request",
    target: "pull_request",
    buildPrompt: () =>
      "@claude Please review this Pull Request and report REVIEW PASSED or REVIEW FAILED with findings.",
  },
  {
    key: "fix-review-findings",
    label: "Fix review findings",
    target: "pull_request",
    buildPrompt: () => "@claude Please fix the review findings reported above.",
  },
  {
    key: "run-tests",
    label: "Run tests",
    target: "pull_request",
    buildPrompt: () =>
      "@claude Please run the tests for this Pull Request and report TEST PASSED or TEST FAILED.",
  },
  {
    key: "fix-test-failure",
    label: "Fix test failure",
    target: "pull_request",
    buildPrompt: () => "@claude Please fix the failing test(s) reported above.",
  },
  {
    key: "prepare-for-merge",
    label: "Prepare for merge",
    target: "pull_request",
    buildPrompt: () =>
      "@claude Please confirm this Pull Request is ready to merge (all checks green, tests passing).",
  },
];
