import { describe, expect, it } from "vitest";

import { issueSummary, parseIssueBody, splitSteps } from "./parse-issue-body";

const TEMPLATE_BODY = [
  "## Environment",
  "staging",
  "",
  "## Steps to Reproduce",
  "1. Sign in",
  "2. Wait 12 minutes",
  "",
  "## Expected Result",
  "Session stays alive",
  "",
  "## Actual Result",
  "User is signed out",
].join("\n");

describe("parseIssueBody", () => {
  it("splits the bug report template into its sections", () => {
    const sections = parseIssueBody(TEMPLATE_BODY);

    expect(sections.environment).toBe("staging");
    expect(sections.stepsToReproduce).toBe("1. Sign in\n2. Wait 12 minutes");
    expect(sections.expectedResult).toBe("Session stays alive");
    expect(sections.actualResult).toBe("User is signed out");
    expect(sections.additionalNotes).toBeNull();
  });

  it("keeps free-form bodies as the preamble instead of losing them", () => {
    const sections = parseIssueBody("Plain report written by hand.\n\n## Notes\nignored heading");

    expect(sections.preamble).toBe("Plain report written by hand.");
    expect(sections.actualResult).toBeNull();
  });
});

describe("issueSummary", () => {
  it("prefers the actual result of a templated report", () => {
    expect(issueSummary(TEMPLATE_BODY)).toBe("User is signed out");
  });

  it("falls back to the first paragraph of a free-form body", () => {
    expect(issueSummary("First paragraph.\n\nSecond paragraph.")).toBe("First paragraph.");
  });
});

describe("splitSteps", () => {
  it("drops ordered and unordered list markers", () => {
    expect(splitSteps("1. Sign in\n- Open orders\n* Wait")).toEqual(["Sign in", "Open orders", "Wait"]);
  });
});
