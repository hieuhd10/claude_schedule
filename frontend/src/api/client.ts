import {
  ApiError,
  type ApiErrorBody,
  type Checkpoint,
  type Comment,
  type ConfigResponse,
  type CreateIssueRequest,
  type CreateIssueResponse,
  type IssueDetailResponse,
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
    const body = (await response.json()) as ApiErrorBody;
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
  return request<IssueDetailResponse>(`/api/issues/${owner}/${repository}/${issueNumber}`, {
    signal,
  });
}

export function postIssueComment(
  owner: string,
  repository: string,
  issueNumber: number,
  body: string,
): Promise<CommentResponse> {
  return request<CommentResponse>(`/api/issues/${owner}/${repository}/${issueNumber}/comments`, {
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
    `/api/pull-requests/${owner}/${repository}/${prNumber}/comments`,
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
  return request<CreateIssueResponse>(`/api/issues/${owner}/${repository}`, {
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
  return request<CommentResponse>(`/api/issues/${owner}/${repository}/${issueNumber}/checkpoints`, {
    method: "POST",
    body: JSON.stringify({ checkpoint }),
  });
}
