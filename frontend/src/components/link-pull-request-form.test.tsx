// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LinkPullRequestForm } from "./link-pull-request-form";

const postPullRequestComment = vi.fn();
vi.mock("../api/client", () => ({
  postIssueComment: vi.fn(),
  postCheckpoint: vi.fn(),
  postPullRequestComment: (...args: unknown[]) => postPullRequestComment(...args),
}));

// The suite runs without auto-cleanup; two forms in one document would collide on the input id.
afterEach(() => {
  cleanup();
  postPullRequestComment.mockReset();
});

function renderForm(onLinked = vi.fn()) {
  const { container } = render(
    <LinkPullRequestForm owner="acme" repository="app" issueNumber={24} onLinked={onLinked} />,
  );
  return { view: within(container), onLinked };
}

describe("LinkPullRequestForm", () => {
  it("keeps the action disabled until a Pull Request number is entered", () => {
    const { view } = renderForm();

    expect(view.getByRole("button", { name: "Link" }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(view.getByLabelText("Link An Existing Pull Request"), {
      target: { value: "25" },
    });
    expect(view.getByRole("button", { name: "Link" }).hasAttribute("disabled")).toBe(false);
  });

  it("comments on the Pull Request naming the issue, which is what GitHub links on", async () => {
    postPullRequestComment.mockResolvedValue({ comment: { id: 1, html_url: "https://gh.test/c/1" } });
    const { view, onLinked } = renderForm();

    fireEvent.change(view.getByLabelText("Link An Existing Pull Request"), {
      target: { value: "#25" },
    });
    fireEvent.click(view.getByRole("button", { name: "Link" }));

    await waitFor(() => expect(postPullRequestComment).toHaveBeenCalledTimes(1));
    // A leading "#" is accepted, and the comment has to reference the issue.
    expect(postPullRequestComment).toHaveBeenCalledWith("acme", "app", 25, "Linked to #24.");
    await waitFor(() => expect(onLinked).toHaveBeenCalled());
  });
});
