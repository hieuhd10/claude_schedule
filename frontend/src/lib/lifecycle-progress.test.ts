import { describe, expect, it } from "vitest";

import { STAGES, type CheckRun, type Issue, type LifecycleResult, type PullRequest } from "../api/types";
import { lifecycleResult, stageReport } from "../test-support/lifecycle-fixtures";
import { stepState, summarizeChecks, transitionConditions, type LifecycleSignals } from "./lifecycle-progress";

const issue: Issue = {
  number: 12,
  title: "Session expires",
  body: "",
  state: "open",
  labels: [],
  assignee: null,
  author: "qa",
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  closed_at: null,
  html_url: "https://github.test/issues/12",
};

const pullRequest: PullRequest = {
  number: 34,
  title: "Fix session refresh",
  state: "open",
  merged: false,
  head_branch: "fix/session",
  base_branch: "main",
  head_sha: "abc1234",
  author: "dev",
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  merged_at: null,
  closed_at: null,
  html_url: "https://github.test/pull/34",
};

function lifecycle(overrides: Partial<LifecycleResult> = {}): LifecycleResult {
  return lifecycleResult({ stage: "fix", ...overrides });
}

function signals(overrides: Partial<LifecycleSignals> = {}): LifecycleSignals {
  return {
    lifecycle: lifecycle(),
    issue,
    linkedPullRequest: null,
    prChecks: [],
    prCommitCount: 0,
    ...overrides,
  };
}

function check(name: string, conclusion: string | null): CheckRun {
  return { name, status: conclusion ? "completed" : "in_progress", conclusion, html_url: null, started_at: null, completed_at: null };
}

describe("stepState", () => {
  it("splits steps around the current stage", () => {
    const reviewing = signals({ lifecycle: lifecycle({ stage: "review" }) });
    expect(stepState("debug", reviewing)).toBe("done");
    expect(stepState("review", reviewing)).toBe("current");
    expect(stepState("test", reviewing)).toBe("waiting");
  });

  it("marks a completed issue done only on the steps that actually happened", () => {
    const closedEarly = signals({
      lifecycle: lifecycle({ stage: "completed" }),
      issue: { ...issue, state: "closed", closed_at: "2026-08-03T00:00:00Z" },
    });
    expect(stepState("completed", closedEarly)).toBe("done");
    expect(stepState("debug", closedEarly)).toBe("waiting");
    expect(stepState("review", closedEarly)).toBe("waiting");
  });

  it("marks every step done when the whole flow left a record", () => {
    const shipped = signals({
      lifecycle: lifecycle({
        stage: "completed",
        debug_approved: true,
        review_result: "PASSED",
        test_result: "PASSED",
      }),
      issue: { ...issue, state: "closed", closed_at: "2026-08-03T00:00:00Z" },
      linkedPullRequest: { ...pullRequest, state: "closed", merged: true },
    });
    expect(STAGES.filter((stage) => stepState(stage, shipped) === "done")).toEqual(STAGES);
  });
});

describe("summarizeChecks", () => {
  it("counts neutral and skipped checks as passed, matching the backend verdict", () => {
    const summary = summarizeChecks([
      check("build", "success"),
      check("optional", "skipped"),
      check("flaky", "failure"),
      check("slow", null),
    ]);
    expect(summary).toEqual({ total: 4, passed: 2, failed: 1, pending: 1 });
  });
});

describe("transitionConditions", () => {
  it("derives fix conditions from the linked Pull Request", () => {
    const withoutPr = transitionConditions("fix", signals());
    expect(withoutPr.every((condition) => !condition.met)).toBe(true);

    const withPr = transitionConditions("fix", signals({ linkedPullRequest: pullRequest, prCommitCount: 3 }));
    expect(withPr.every((condition) => condition.met)).toBe(true);
  });

  it("reads the debug conditions from the recorded approval, not the stage position", () => {
    const movedOn = transitionConditions("debug", signals({ lifecycle: lifecycle({ stage: "review" }) }));
    expect(movedOn.every((condition) => condition.met)).toBe(false);

    const approved = transitionConditions(
      "debug",
      signals({
        lifecycle: lifecycle({
          stage: "review",
          debug_approved: true,
          stage_reports: [stageReport("debug", { root_cause: "Token refresh races the retry" })],
        }),
      }),
    );
    expect(approved.every((condition) => condition.met)).toBe(true);
  });

  it("gates review on the verdict alone, leaving the checks to test", () => {
    const conditions = transitionConditions(
      "review",
      signals({ lifecycle: lifecycle({ stage: "review", review_result: "FAILED" }) }),
    );
    expect(conditions).toHaveLength(1);
    expect(conditions[0].met).toBe(false);
    expect(conditions[0].detail).toContain("REVIEW FAILED");
  });

  it("requires a recorded TEST PASSED marker and green checks before test can hand over", () => {
    const failing = transitionConditions(
      "test",
      signals({
        lifecycle: lifecycle({ stage: "test", test_result: "FAILED", checks_green: true }),
        prChecks: [check("build", "success")],
      }),
    );
    expect(failing[0].met).toBe(false);

    const passing = transitionConditions(
      "test",
      signals({
        lifecycle: lifecycle({ stage: "test", test_result: "PASSED", checks_green: true }),
        prChecks: [check("build", "success")],
      }),
    );
    expect(passing.every((condition) => condition.met)).toBe(true);
  });
});
