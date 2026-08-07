// @vitest-environment jsdom

import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Issue, PullRequest, Stage } from "../api/types";
import type { LifecycleSignals } from "../lib/lifecycle-progress";
import { claudeResponse, lifecycleResult, stageReport } from "../test-support/lifecycle-fixtures";
import { StepDetailPanel } from "./step-detail-panel";

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
  author: "claude[bot]",
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  merged_at: null,
  closed_at: null,
  html_url: "https://github.test/pull/34",
};

/** Flow has reached Test; the newest comment is the Test verdict. */
const signals: LifecycleSignals = {
  lifecycle: lifecycleResult({
    stage: "test",
    last_claude_response: claudeResponse({
      raw_body: "TEST PASSED",
      is_structured: true,
      test_result: "12 cases, 12 passed",
    }),
    stage_reports: [
      stageReport("debug", {
        root_cause: "Race between the refresh handler and the idle timer.",
        findings: ["Timer reset sits outside the refresh transaction"],
      }),
      stageReport("fix", {
        solution: "Single-flight guard around the refresh call.",
        remaining_risk: "iOS Safari background tab is untested.",
      }),
      stageReport("test", {
        test_result: "12 cases, 12 passed",
        findings: ["session-30min.mp4"],
      }),
    ],
  }),
  issue,
  linkedPullRequest: pullRequest,
  prChecks: [],
  prCommitCount: 3,
};

function renderStep(stage: Stage) {
  const { container } = render(<StepDetailPanel stage={stage} signals={signals} prCommits={[]} />);
  return within(container);
}

describe("StepDetailPanel", () => {
  it("keeps the Debug report on screen after the flow reached Test", () => {
    const view = renderStep("debug");

    expect(view.getByText("Race between the refresh handler and the idle timer.")).toBeTruthy();
    expect(view.getByText("Timer reset sits outside the refresh transaction")).toBeTruthy();
  });

  it("shows the Fix solution and its remaining risk", () => {
    const view = renderStep("fix");

    expect(view.getByText("Single-flight guard around the refresh call.")).toBeTruthy();
    expect(view.getByText("iOS Safari background tab is untested.")).toBeTruthy();
  });

  it("shows the reported runs and evidence on the Test step", () => {
    const view = renderStep("test");

    expect(view.getAllByText("12 cases, 12 passed").length).toBeGreaterThan(0);
    expect(view.getByText("session-30min.mp4")).toBeTruthy();
  });

  it("collapses an empty step to a single line instead of a column of placeholders", () => {
    const { container } = render(
      <StepDetailPanel stage="completed" signals={signals} prCommits={[]} />,
    );
    const view = within(container);

    expect(view.getByText("Waiting for the issue to be closed.")).toBeTruthy();
    // Nothing is reported for this step, so the content area renders no field labels.
    expect(container.querySelectorAll(".step-detail__content .t-overline")).toHaveLength(0);
    expect(container.querySelector(".step-detail__headline")).toBeNull();
  });

  it("drops the conditions column on the current step, which the workspace owns", () => {
    const { container } = render(<StepDetailPanel stage="test" signals={signals} prCommits={[]} />);

    expect(container.querySelector(".transition-checklist")).toBeNull();
  });

  it("collapses a long findings list behind a toggle", () => {
    const many = Array.from({ length: 7 }, (_, i) => `finding ${i + 1}`);
    const { container } = render(
      <StepDetailPanel
        stage="debug"
        signals={{
          ...signals,
          lifecycle: lifecycleResult({
            stage: "test",
            stage_reports: [stageReport("debug", { root_cause: "A cause.", findings: many })],
          }),
        }}
        prCommits={[]}
      />,
    );
    const view = within(container);

    expect(container.querySelectorAll(".step-detail__findings li")).toHaveLength(3);
    fireEvent.click(view.getByRole("button", { name: "Show all 7" }));
    expect(container.querySelectorAll(".step-detail__findings li")).toHaveLength(7);
  });

  it("separates every section label from its body with its own rule", () => {
    const { container } = render(<StepDetailPanel stage="debug" signals={signals} prCommits={[]} />);

    const heads = container.querySelectorAll(".step-section__head");
    expect(heads.length).toBeGreaterThan(0);
    // Labels live in the head, content in the body - never in the same element.
    heads.forEach((head) => expect(head.querySelector(".t-overline")).toBeTruthy());
  });

  it("marks a met condition without rendering an input the user could mistake for a control", () => {
    const { container } = render(<StepDetailPanel stage="debug" signals={signals} prCommits={[]} />);

    expect(container.querySelectorAll("input")).toHaveLength(0);
    expect(container.querySelectorAll(".transition-checklist__item--met").length).toBeGreaterThan(0);
  });
});
