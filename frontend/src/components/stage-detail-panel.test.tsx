// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { claudeResponseStatus } from "../lib/claude-response-status";
import { StageDetailPanel } from "./stage-detail-panel";

describe("claudeResponseStatus", () => {
  it("recognizes a result marker only when it occupies its own line", () => {
    expect(claudeResponseStatus("Review complete\n\nREVIEW PASSED\n\nNo findings."))
      .toBe("passed");
    expect(claudeResponseStatus("Please report REVIEW PASSED or REVIEW FAILED."))
      .toBe("responded");
    expect(claudeResponseStatus("TEST FAILED — one scenario failed"))
      .toBe("responded");
  });

  it("keeps long structured response details collapsed by default", () => {
    render(
      <StageDetailPanel
        lifecycle={{
          stage: "completed",
          reasoning: ["Issue closed."],
          last_command: null,
          last_claude_response: {
            raw_body: "A long response",
            is_structured: true,
            root_cause: "Long root cause content",
            findings: ["Finding one"],
            test_result: null,
          },
          next_recommended_action: "No action needed.",
          review_findings: [],
          test_result: "PASSED",
        }}
        linkedPullRequest={null}
        prChecks={[]}
        prCommits={[]}
      />,
    );

    const details = screen.getByText("View response details").closest("details");
    expect(details?.open).toBe(false);
  });
});
