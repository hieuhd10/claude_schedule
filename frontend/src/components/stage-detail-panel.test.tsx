import { describe, expect, it } from "vitest";

import { claudeResponseStatus } from "../lib/claude-response-status";

describe("claudeResponseStatus", () => {
  it("recognizes a result marker only when it occupies its own line", () => {
    expect(claudeResponseStatus("Review complete\n\nREVIEW PASSED\n\nNo findings."))
      .toBe("passed");
    expect(claudeResponseStatus("Please report REVIEW PASSED or REVIEW FAILED."))
      .toBe("responded");
    expect(claudeResponseStatus("TEST FAILED — one scenario failed"))
      .toBe("responded");
  });
});
