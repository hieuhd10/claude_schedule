// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { claudeResponseStatus } from "../lib/claude-response-status";
import { claudeResponse } from "../test-support/lifecycle-fixtures";
import { ClaudeResponseSummary } from "./claude-response-summary";

describe("claudeResponseStatus", () => {
  it("recognizes a result marker only when it occupies its own line", () => {
    expect(claudeResponseStatus("Review complete\n\nREVIEW PASSED\n\nNo findings.")).toBe("passed");
    expect(claudeResponseStatus("Please report REVIEW PASSED or REVIEW FAILED.")).toBe("responded");
    expect(claudeResponseStatus("TEST FAILED — one scenario failed")).toBe("responded");
  });
});

describe("ClaudeResponseSummary", () => {
  it("keeps long structured response details collapsed by default", () => {
    render(
      <ClaudeResponseSummary
        response={claudeResponse({
          raw_body: "A long response",
          is_structured: true,
          root_cause: "Long root cause content",
          findings: ["Finding one"],
          html_url: "https://github.test/issues/12#issuecomment-1",
        })}
      />,
    );

    const details = screen.getByText("View response details").closest("details");
    expect(details?.open).toBe(false);
  });

  it("offers the raw comment when nothing could be parsed out of the reply", () => {
    const { container } = render(
      <ClaudeResponseSummary
        response={claudeResponse({
          raw_body: "### Investigation complete\n\nNo heading the lifecycle reads.",
          html_url: "https://github.test/issues/12#issuecomment-2",
        })}
      />,
    );
    const view = within(container);

    expect(view.getByText("View raw response")).toBeTruthy();
    expect(container.querySelector(".claude-response__raw")?.textContent).toContain(
      "Investigation complete",
    );
    expect(view.getByRole("link", { name: /View on GitHub/ }).getAttribute("href")).toBe(
      "https://github.test/issues/12#issuecomment-2",
    );
  });
});
