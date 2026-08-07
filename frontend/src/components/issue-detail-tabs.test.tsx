// @vitest-environment jsdom

import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IssueDetailResponse } from "../api/types";
import type { LifecycleSignals } from "../lib/lifecycle-progress";
import { claudeResponse, lifecycleResult, stageReport } from "../test-support/lifecycle-fixtures";
import { OverviewTab } from "./overview-tab";
import { QaReportTab } from "./qa-report-tab";

const detail: IssueDetailResponse = {
  issue: {
    number: 12,
    title: "Session expires unexpectedly",
    body: [
      "## Environment",
      "staging",
      "",
      "## Steps to Reproduce",
      "1. Sign in",
      "",
      "## Expected Result",
      "Session stays alive",
      "",
      "## Actual Result",
      "User is signed out",
    ].join("\n"),
    state: "open",
    labels: ["env:staging", "severity:high"],
    assignee: "dev",
    author: "qa",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-02T00:00:00Z",
    closed_at: null,
    html_url: "https://github.test/issues/12",
  },
  comments: [],
  linked_pull_request: {
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
  },
  pr_comments: [],
  pr_commits: [
    {
      sha: "abc1234567",
      message: "Reset the idle timer on refresh",
      author: "dev",
      committed_at: "2026-08-02T00:00:00Z",
      html_url: "https://github.test/commit/abc1234",
    },
  ],
  pr_checks: [
    {
      name: "build",
      status: "completed",
      conclusion: "success",
      html_url: null,
      started_at: null,
      completed_at: "2026-08-02T01:00:00Z",
    },
  ],
  // The API sorts activity oldest-first.
  activity: [
    {
      category: "github_system",
      source: "Issue #12",
      actor: "qa",
      summary: "Issue opened",
      created_at: "2026-08-01T00:00:00Z",
      html_url: null,
    },
    {
      category: "claude_response",
      source: "Issue #12",
      actor: "claude",
      summary: "Root cause identified",
      created_at: "2026-08-02T00:30:00Z",
      html_url: null,
    },
  ],
  lifecycle: lifecycleResult({
    stage: "fix",
    reasoning: ["A Pull Request is linked but no review result is recorded."],
    last_command: "@claude implement the fix",
    last_claude_response: claudeResponse({
      raw_body: "Root cause found",
      is_structured: true,
      root_cause: "Race between refresh and idle timer",
      findings: ["Timer reset is outside the refresh transaction"],
      html_url: "https://github.test/issues/12#issuecomment-1",
    }),
    next_recommended_action: "Ask for a review on the Pull Request.",
    review_findings: [],
    test_result: null,
    stage_reports: [
      stageReport("debug", { root_cause: "Race between refresh and idle timer" }),
      stageReport("fix", {
        solution: "Single-flight guard around the refresh call",
        remaining_risk: "iOS Safari background tab is untested",
      }),
    ],
    stage_owners: [
      {
        stage: "debug",
        actor: "claude[bot]",
        role: "Reported the debug analysis",
        recorded_at: "2026-08-02T00:30:00Z",
        source_url: null,
      },
      {
        stage: "fix",
        actor: "dev",
        role: "Opened the Pull Request",
        recorded_at: "2026-08-02T00:00:00Z",
        source_url: "https://github.test/pull/34",
      },
    ],
  }),
};

const signals: LifecycleSignals = {
  lifecycle: detail.lifecycle,
  issue: detail.issue,
  linkedPullRequest: detail.linked_pull_request,
  prChecks: detail.pr_checks,
  prCommitCount: detail.pr_commits.length,
};

describe("issue detail tabs", () => {
  it("renders the overview tab with the derived step progress", () => {
    const { container } = render(
      <OverviewTab
        owner="acme"
        repository="app"
        issueNumber={12}
        data={detail}
        signals={signals}
        selectedStage="fix"
        onSelectStage={vi.fn()}
        onPosted={vi.fn()}
        onCheckpointPosted={vi.fn()}
      />,
    );
    const view = within(container);

    expect(view.getByText("1 of 6 steps completed")).toBeTruthy();
    expect(view.getByText("Pull Request opened")).toBeTruthy();
    expect(view.getByText("Ask for a review on the Pull Request.")).toBeTruthy();
  });

  it("shows the newest activity first in the overview panel", () => {
    const { container } = render(
      <OverviewTab
        owner="acme"
        repository="app"
        issueNumber={12}
        data={detail}
        signals={signals}
        selectedStage="fix"
        onSelectStage={vi.fn()}
        onPosted={vi.fn()}
        onCheckpointPosted={vi.fn()}
      />,
    );

    const summaries = [...container.querySelectorAll(".activity-item__summary")].map(
      (node) => node.textContent,
    );
    expect(summaries).toEqual(["Root cause identified", "Issue opened"]);
  });

  it("shows the step owner recorded for the current step", () => {
    const { container } = render(
      <OverviewTab
        owner="acme"
        repository="app"
        issueNumber={12}
        data={detail}
        signals={signals}
        selectedStage="fix"
        onSelectStage={vi.fn()}
        onPosted={vi.fn()}
        onCheckpointPosted={vi.fn()}
      />,
    );
    const view = within(container);

    expect(view.getAllByText("Opened the Pull Request · 8/2/2026, 7:00:00 AM").length).toBeGreaterThan(0);
  });

  it("renders the QA report from the issue body and Pull Request records", () => {
    const { container } = render(<QaReportTab data={detail} signals={signals} />);
    const view = within(container);

    expect(view.getByText("User is signed out")).toBeTruthy();
    expect(view.getByText("Race between refresh and idle timer")).toBeTruthy();
    // Bug description, root cause and fix record are present; the test result is not.
    expect(view.getByText("75%")).toBeTruthy();
  });

});
