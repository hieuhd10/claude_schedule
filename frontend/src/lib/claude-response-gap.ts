import type { ParsedClaudeResponse } from "../api/types";

/**
 * Why a field is empty. "Nothing was posted" and "Claude answered but did not
 * use the heading the lifecycle reads" are different problems, and only the
 * second one is fixed by re-running the command with the expected format.
 */
export function rootCauseGap(response: ParsedClaudeResponse | null): string {
  if (!response) return "No root cause recorded yet.";
  return "Claude replied without a Root Cause heading — open the raw response below.";
}
