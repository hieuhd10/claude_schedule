export type IssueState = "open" | "closed";

export interface Comment {
  id: number;
  body: string;
  author: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: IssueState;
  labels: string[];
  assignee: string | null;
  author: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

export interface PullRequest {
  number: number;
  title: string;
  state: IssueState;
  merged: boolean;
  head_branch: string;
  base_branch: string;
  head_sha: string;
  author: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  html_url: string;
}

export interface CheckRun {
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface Commit {
  sha: string;
  message: string;
  author: string | null;
  committed_at: string | null;
  html_url: string;
}

export type Stage = "debug" | "fix" | "review" | "test" | "ready_to_merge" | "completed";

export const STAGES: Stage[] = ["debug", "fix", "review", "test", "ready_to_merge", "completed"];

export const STAGE_LABELS: Record<Stage, string> = {
  debug: "Debug",
  fix: "Fix",
  review: "Review",
  test: "Test",
  ready_to_merge: "Ready to Merge",
  completed: "Completed",
};

export interface ParsedClaudeResponse {
  raw_body: string;
  is_structured: boolean;
  root_cause: string | null;
  findings: string[];
  test_result: string | null;
}

export interface LifecycleResult {
  stage: Stage;
  reasoning: string[];
  last_command: string | null;
  last_claude_response: ParsedClaudeResponse | null;
  next_recommended_action: string;
  review_findings: string[];
  test_result: string | null;
}

export type ActivityCategory =
  | "human_command"
  | "claude_response"
  | "github_system"
  | "ci_workflow";

export interface ActivityItem {
  category: ActivityCategory;
  source: string;
  actor: string | null;
  summary: string;
  created_at: string | null;
  html_url: string | null;
}

export interface IssueDetailResponse {
  issue: Issue;
  comments: Comment[];
  linked_pull_request: PullRequest | null;
  pr_comments: Comment[];
  pr_commits: Commit[];
  pr_checks: CheckRun[];
  activity: ActivityItem[];
  lifecycle: LifecycleResult;
}

export type Checkpoint =
  | "DEBUG_APPROVED"
  | "PR_READY_FOR_REVIEW"
  | "REVIEW_CONFIRMED"
  | "TEST_CONFIRMED"
  | "PR_MERGED";

export interface ConfigResponse {
  owner: string;
  repository: string;
}

export interface CreateIssueRequest {
  title: string;
  environment: string | null;
  base_branch: string | null;
  severity: string | null;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  additional_notes: string | null;
  assignee: string | null;
}

export interface CreateIssueResponse {
  issue: Issue;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    retry_after?: number;
  };
}

export class ApiError extends Error {
  code: string;
  status: number;
  retryAfter?: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.code = body.error.code;
    this.status = status;
    this.retryAfter = body.error.retry_after;
  }
}
