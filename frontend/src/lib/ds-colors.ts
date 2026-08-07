import type { ActivityCategory } from "../api/types";
import type { DsColor } from "../design-system/lift-tailux";
import type { CheckState } from "./check-state";
import type { StepState } from "./lifecycle-progress";

export const SEVERITY_COLORS: Record<string, DsColor> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const STEP_STATE_COLORS: Record<StepState, DsColor> = {
  done: "success",
  current: "primary",
  waiting: "neutral",
};

export const CHECK_STATE_COLORS: Record<CheckState, DsColor> = {
  success: "success",
  failure: "error",
  pending: "warning",
};

export const ACTIVITY_COLORS: Record<ActivityCategory, DsColor> = {
  human_command: "info",
  claude_response: "primary",
  github_system: "neutral",
  ci_workflow: "success",
};
