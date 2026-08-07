import {
  ApiError,
  type Checkpoint,
  type CloseIssueResponse,
  type CreatePullRequestRequest,
  type CreatePullRequestResponse,
  type FixBranchesResponse,
  type Comment,
  type ConfigResponse,
  type CreateIssueRequest,
  type CreateIssueResponse,
  type IssueDetailResponse,
  type MergeMethod,
  type MergePullRequestResponse,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface ParseUrlResponse {
  owner: string;
  repository: string;
  issue_number: number;
}

interface CommentResponse {
  comment: Comment;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Preserve a useful status-based error when a proxy returns HTML or an empty body.
    }
    throw new ApiError(response.status, body);
  }

  return (await response.json()) as T;
}

export function parseIssueUrl(url: string): Promise<ParseUrlResponse> {
  return request<ParseUrlResponse>("/api/issues/parse-url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function getIssueDetail(
  owner: string,
  repository: string,
  issueNumber: number,
  signal?: AbortSignal,
): Promise<IssueDetailResponse> {
  return request<IssueDetailResponse>(
    `/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${issueNumber}`,
    { signal },
  );
}

export function postIssueComment(
  owner: string,
  repository: string,
  issueNumber: number,
  body: string,
): Promise<CommentResponse> {
  return request<CommentResponse>(`/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function postPullRequestComment(
  owner: string,
  repository: string,
  prNumber: number,
  body: string,
): Promise<CommentResponse> {
  return request<CommentResponse>(
    `/api/pull-requests/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${prNumber}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
}

export function getConfig(): Promise<ConfigResponse> {
  return request<ConfigResponse>("/api/config");
}

export function createIssue(
  owner: string,
  repository: string,
  payload: CreateIssueRequest,
): Promise<CreateIssueResponse> {
  return request<CreateIssueResponse>(`/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function postCheckpoint(
  owner: string,
  repository: string,
  issueNumber: number,
  checkpoint: Checkpoint,
): Promise<CommentResponse> {
  return request<CommentResponse>(`/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${issueNumber}/checkpoints`, {
    method: "POST",
    body: JSON.stringify({ checkpoint }),
  });
}

export function getFixBranches(
  owner: string,
  repository: string,
  issueNumber: number,
): Promise<FixBranchesResponse> {
  return request<FixBranchesResponse>(
    `/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${issueNumber}/fix-branches`,
  );
}

export function mergePullRequest(
  owner: string,
  repository: string,
  prNumber: number,
  mergeMethod: MergeMethod,
): Promise<MergePullRequestResponse> {
  return request<MergePullRequestResponse>(
    `/api/pull-requests/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${prNumber}/merge`,
    { method: "POST", body: JSON.stringify({ merge_method: mergeMethod }) },
  );
}

export function closeIssue(
  owner: string,
  repository: string,
  issueNumber: number,
): Promise<CloseIssueResponse> {
  return request<CloseIssueResponse>(
    `/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${issueNumber}/close`,
    { method: "POST" },
  );
}

export function createPullRequest(
  owner: string,
  repository: string,
  issueNumber: number,
  payload: CreatePullRequestRequest,
): Promise<CreatePullRequestResponse> {
  return request<CreatePullRequestResponse>(
    `/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/${issueNumber}/pull-request`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
