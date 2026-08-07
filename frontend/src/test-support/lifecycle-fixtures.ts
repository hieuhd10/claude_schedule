import type { LifecycleResult, ParsedClaudeResponse, Stage, StageReport } from "../api/types";

/** Shared builders so a new lifecycle field only has to be defaulted in one place. */

export function claudeResponse(overrides: Partial<ParsedClaudeResponse> = {}): ParsedClaudeResponse {
  return {
    raw_body: "",
    is_structured: false,
    root_cause: null,
    solution: null,
    findings: [],
    test_result: null,
    remaining_risk: null,
    summary: null,
    html_url: null,
    ...overrides,
  };
}

export function stageReport(stage: Stage, response: Partial<ParsedClaudeResponse>): StageReport {
  return {
    stage,
    actor: "claude[bot]",
    recorded_at: "2026-08-02T00:30:00Z",
    response: claudeResponse({ is_structured: true, ...response }),
  };
}

export function lifecycleResult(overrides: Partial<LifecycleResult> = {}): LifecycleResult {
  return {
    stage: "debug",
    reasoning: [],
    last_command: null,
    last_claude_response: null,
    next_recommended_action: "",
    review_findings: [],
    review_result: null,
    test_result: null,
    debug_approved: false,
    checks_green: false,
    stage_owners: [],
    stage_reports: [],
    ...overrides,
  };
}
