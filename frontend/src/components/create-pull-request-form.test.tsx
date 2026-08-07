// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreatePullRequestForm } from "./create-pull-request-form";

const getFixBranches = vi.fn();
const createPullRequest = vi.fn();
vi.mock("../api/client", () => ({
  getFixBranches: (...args: unknown[]) => getFixBranches(...args),
  createPullRequest: (...args: unknown[]) => createPullRequest(...args),
}));

afterEach(() => {
  cleanup();
  getFixBranches.mockReset();
  createPullRequest.mockReset();
});

function renderForm(onCreated = vi.fn()) {
  const { container } = render(
    <CreatePullRequestForm owner="acme" repository="app" issueNumber={24} onCreated={onCreated} />,
  );
  return { view: within(container), container, onCreated };
}

describe("CreatePullRequestForm", () => {
  it("preselects the branch the API ranked first and opens the Pull Request from it", async () => {
    getFixBranches.mockResolvedValue({
      base_branch: "feature/test-routine",
      branches: ["claude/issue-24-20260806-1017", "docs/other"],
    });
    createPullRequest.mockResolvedValue({ pull_request: { number: 77 } });
    const { view, onCreated } = renderForm();

    await waitFor(() =>
      expect((view.getByLabelText("Fix branch") as HTMLInputElement).value).toBe(
        "claude/issue-24-20260806-1017",
      ),
    );

    fireEvent.click(view.getByRole("button", { name: "Create Pull Request" }));

    await waitFor(() => expect(createPullRequest).toHaveBeenCalledTimes(1));
    expect(createPullRequest).toHaveBeenCalledWith("acme", "app", 24, {
      head: "claude/issue-24-20260806-1017",
    });
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith({ number: 77 }));
  });

  it("still accepts a branch typed by hand when the API returns no suggestions", async () => {
    getFixBranches.mockResolvedValue({ base_branch: "main", branches: [] });
    createPullRequest.mockResolvedValue({ pull_request: { number: 78 } });
    const { view } = renderForm();

    await waitFor(() => expect(getFixBranches).toHaveBeenCalled());
    expect(view.getByRole("button", { name: "Create Pull Request" }).hasAttribute("disabled")).toBe(
      true,
    );

    fireEvent.change(view.getByLabelText("Fix branch"), { target: { value: "fix/manual" } });
    fireEvent.click(view.getByRole("button", { name: "Create Pull Request" }));

    await waitFor(() =>
      expect(createPullRequest).toHaveBeenCalledWith("acme", "app", 24, { head: "fix/manual" }),
    );
  });

  it("surfaces a failure from GitHub instead of pretending the Pull Request exists", async () => {
    getFixBranches.mockResolvedValue({ base_branch: "main", branches: ["fix/a"] });
    createPullRequest.mockRejectedValue(new Error("No commits between main and fix/a"));
    const { view, onCreated } = renderForm();

    await waitFor(() => expect(getFixBranches).toHaveBeenCalled());
    fireEvent.click(view.getByRole("button", { name: "Create Pull Request" }));

    await waitFor(() =>
      expect(view.getByText("No commits between main and fix/a")).toBeTruthy(),
    );
    expect(onCreated).not.toHaveBeenCalled();
  });
});
