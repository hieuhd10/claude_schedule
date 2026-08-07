// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Issue, PullRequest } from "../api/types";
import { CompletionActions } from "./completion-actions";

const mergePullRequest = vi.fn();
const closeIssue = vi.fn();
vi.mock("../api/client", () => ({
  mergePullRequest: (...args: unknown[]) => mergePullRequest(...args),
  closeIssue: (...args: unknown[]) => closeIssue(...args),
}));

afterEach(() => {
  cleanup();
  mergePullRequest.mockReset();
  closeIssue.mockReset();
});

const issue: Issue = {
  number: 24,
  title: "Session expires",
  body: "",
  state: "open",
  labels: [],
  assignee: null,
  author: "qa",
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  closed_at: null,
  html_url: "https://github.test/issues/24",
};

const openPullRequest: PullRequest = {
  number: 34,
  title: "Fix session refresh",
  state: "open",
  merged: false,
  head_branch: "fix/session",
  base_branch: "main",
  head_sha: "abc1234",
  author: "claude[bot]",
  created_at: "2026-08-02T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
  merged_at: null,
  closed_at: null,
  html_url: "https://github.test/pull/34",
};

function renderActions(overrides: Partial<Parameters<typeof CompletionActions>[0]> = {}) {
  const onCompleted = vi.fn();
  const { container } = render(
    <CompletionActions
      owner="acme"
      repository="app"
      issue={issue}
      linkedPullRequest={openPullRequest}
      onCompleted={onCompleted}
      {...overrides}
    />,
  );
  return { view: within(container), onCompleted };
}

describe("CompletionActions", () => {
  it("merges only after the confirmation step, defaulting to squash", async () => {
    mergePullRequest.mockResolvedValue({ pull_request: { ...openPullRequest, merged: true } });
    const { view, onCompleted } = renderActions();

    fireEvent.click(view.getByRole("button", { name: "Merge Pull Request" }));
    expect(mergePullRequest).not.toHaveBeenCalled();

    fireEvent.click(view.getByRole("button", { name: "Confirm Merge" }));

    await waitFor(() => expect(mergePullRequest).toHaveBeenCalledWith("acme", "app", 34, "squash"));
    await waitFor(() => expect(onCompleted).toHaveBeenCalled());
  });

  it("sends the merge method the operator picked", async () => {
    mergePullRequest.mockResolvedValue({ pull_request: { ...openPullRequest, merged: true } });
    const { view } = renderActions();

    fireEvent.change(view.getByLabelText("Merge method"), { target: { value: "rebase" } });
    fireEvent.click(view.getByRole("button", { name: "Merge Pull Request" }));
    fireEvent.click(view.getByRole("button", { name: "Confirm Merge" }));

    await waitFor(() => expect(mergePullRequest).toHaveBeenCalledWith("acme", "app", 34, "rebase"));
  });

  it("offers only the close action once the Pull Request is merged", async () => {
    closeIssue.mockResolvedValue({ issue: { ...issue, state: "closed" } });
    const { view, onCompleted } = renderActions({
      linkedPullRequest: { ...openPullRequest, state: "closed", merged: true },
    });

    expect(view.queryByRole("button", { name: "Merge Pull Request" })).toBeNull();

    fireEvent.click(view.getByRole("button", { name: "Close Issue" }));
    fireEvent.click(view.getByRole("button", { name: "Confirm Close #24" }));

    await waitFor(() => expect(closeIssue).toHaveBeenCalledWith("acme", "app", 24));
    await waitFor(() => expect(onCompleted).toHaveBeenCalled());
  });

  it("surfaces a refused merge instead of reporting success", async () => {
    mergePullRequest.mockRejectedValue(new Error("Pull Request is not mergeable"));
    const { view, onCompleted } = renderActions();

    fireEvent.click(view.getByRole("button", { name: "Merge Pull Request" }));
    fireEvent.click(view.getByRole("button", { name: "Confirm Merge" }));

    await waitFor(() => expect(view.getByText("Pull Request is not mergeable")).toBeTruthy());
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it("renders nothing once the issue is closed and the merge is recorded", () => {
    const { view } = renderActions({
      issue: { ...issue, state: "closed", closed_at: "2026-08-03T00:00:00Z" },
      linkedPullRequest: { ...openPullRequest, state: "closed", merged: true },
    });

    expect(view.queryByText("Complete This Issue")).toBeNull();
  });
});
