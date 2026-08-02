export type ClaudeResponseStatus = "passed" | "failed" | "responded";

const PASSED_RE = /^\s*(REVIEW|TEST) PASSED\s*$/im;
const FAILED_RE = /^\s*(REVIEW|TEST) FAILED\s*$/im;

export function claudeResponseStatus(rawBody: string): ClaudeResponseStatus {
  if (FAILED_RE.test(rawBody)) return "failed";
  if (PASSED_RE.test(rawBody)) return "passed";
  return "responded";
}
