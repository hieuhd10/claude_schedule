// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getIssueDetail } from "../api/client";
import type { IssueDetailResponse } from "../api/types";
import { useIssueDetail } from "./use-issue-detail";

vi.mock("../api/client", () => ({ getIssueDetail: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

function issueDetail(number: number): IssueDetailResponse {
  const timestamp = "2026-08-02T00:00:00Z";
  return {
    issue: {
      number,
      title: `Issue ${number}`,
      body: "",
      state: "open",
      labels: [],
      assignee: null,
      author: "tester",
      created_at: timestamp,
      updated_at: timestamp,
      closed_at: null,
      html_url: `https://github.com/example/repo/issues/${number}`,
    },
    comments: [],
    linked_pull_request: null,
    pr_comments: [],
    pr_commits: [],
    pr_checks: [],
    activity: [],
    lifecycle: {
      stage: "debug",
      reasoning: [],
      last_command: null,
      last_claude_response: null,
      next_recommended_action: "Investigate",
      review_findings: [],
      test_result: null,
    },
  };
}

describe("useIssueDetail", () => {
  beforeEach(() => {
    vi.mocked(getIssueDetail).mockReset();
  });

  it("does not let a stale request overwrite a newer issue", async () => {
    const first = deferred<IssueDetailResponse>();
    const second = deferred<IssueDetailResponse>();
    vi.mocked(getIssueDetail)
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);

    const { result, rerender } = renderHook(
      ({ issueNumber }) => useIssueDetail("example", "repo", issueNumber),
      { initialProps: { issueNumber: 1 } },
    );

    rerender({ issueNumber: 2 });
    await waitFor(() => expect(getIssueDetail).toHaveBeenCalledTimes(2));

    await act(async () => second.resolve(issueDetail(2)));
    await waitFor(() => expect(result.current.data?.issue.number).toBe(2));

    await act(async () => first.resolve(issueDetail(1)));
    expect(result.current.data?.issue.number).toBe(2);
  });
});
