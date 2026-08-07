// @vitest-environment jsdom

import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { STAGES, type Issue, type PullRequest, type Stage } from "../api/types";
import type { LifecycleSignals } from "../lib/lifecycle-progress";
import { lifecycleResult } from "../test-support/lifecycle-fixtures";
import { LifecycleStepper } from "./lifecycle-stepper";

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

const mergedPullRequest: PullRequest = {
  number: 34,
  title: "Fix session refresh",
  state: "closed",
  merged: true,
  head_branch: "fix/session",
  base_branch: "main",
  head_sha: "abc1234",
  author: "claude[bot]",
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-03T00:00:00Z",
  merged_at: "2026-08-03T00:00:00Z",
  closed_at: "2026-08-03T00:00:00Z",
  html_url: "https://github.test/pull/34",
};

function signals(stage: Stage, overrides: Partial<LifecycleSignals> = {}): LifecycleSignals {
  return {
    lifecycle: lifecycleResult({ stage }),
    issue,
    linkedPullRequest: null,
    prChecks: [],
    prCommitCount: 0,
    ...overrides,
  };
}

/** Every step left a record behind, which is what the whole flow having run looks like. */
const shipped = signals("completed", {
  lifecycle: lifecycleResult({
    stage: "completed",
    debug_approved: true,
    review_result: "PASSED",
    test_result: "PASSED",
  }),
  issue: { ...issue, state: "closed", closed_at: "2026-08-03T00:00:00Z" },
  linkedPullRequest: mergedPullRequest,
});

describe("LifecycleStepper", () => {
  it("renders every step as completed when the whole flow left a record", () => {
    const { container } = render(
      <LifecycleStepper signals={shipped} selectedStage="completed" onSelect={vi.fn()} />,
    );

    expect(within(container).getAllByText("Completed")).toHaveLength(STAGES.length + 1);
    expect(within(container).queryByText("In Progress")).toBeNull();
  });

  it("leaves the skipped steps waiting when an issue is closed early", () => {
    const closedEarly = signals("completed", {
      issue: { ...issue, state: "closed", closed_at: "2026-08-03T00:00:00Z" },
    });
    const { container } = render(
      <LifecycleStepper signals={closedEarly} selectedStage="completed" onSelect={vi.fn()} />,
    );

    // Only the Completed step is done: the label plus its own badge.
    expect(within(container).getAllByText("Completed")).toHaveLength(2);
    expect(within(container).getAllByText("Waiting")).toHaveLength(STAGES.length - 1);
  });

  it("marks the selected step so its detail panel is identifiable", () => {
    // Scoped to this render: the suite runs without Testing Library auto-cleanup.
    const { container } = render(
      <LifecycleStepper signals={signals("fix")} selectedStage="review" onSelect={vi.fn()} />,
    );

    const selected = within(container).getAllByRole("button", { pressed: true });
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain("Review");
  });

  it("shows the owner recorded for a step and says so when there is none", () => {
    const withOwner = signals("fix", {
      lifecycle: lifecycleResult({
        stage: "fix",
        stage_owners: [
          {
            stage: "debug",
            actor: "hieuhd10",
            role: "Approved the debug result",
            recorded_at: "2026-08-01T10:00:00Z",
            source_url: null,
          },
        ],
      }),
    });
    const { container } = render(
      <LifecycleStepper signals={withOwner} selectedStage="fix" onSelect={vi.fn()} />,
    );
    const view = within(container);

    expect(view.getByText("hieuhd10")).toBeTruthy();
    // Only Debug has a recorded owner; the other five steps say so.
    expect(view.getAllByText("No owner yet")).toHaveLength(STAGES.length - 1);
  });
});
