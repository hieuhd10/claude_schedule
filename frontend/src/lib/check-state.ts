import type { CheckRun } from "../api/types";

export type CheckState = "success" | "failure" | "pending";

export function checkState(check: CheckRun): CheckState {
  if (check.conclusion === "success") return "success";
  if (check.conclusion) return "failure";
  return "pending";
}
