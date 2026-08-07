import { useState } from "react";

import type { Comment } from "../api/types";
import { Button } from "../design-system/lift-tailux";
import { usePostComment } from "../hooks/use-post-comment";

interface LinkPullRequestFormProps {
  owner: string;
  repository: string;
  issueNumber: number;
  onLinked: (comment: Comment) => void;
}

/**
 * Fix hands over to Review only once a Pull Request is linked to the issue, and
 * the link is a GitHub cross-reference rather than anything this app stores. A
 * comment posted on the Pull Request naming the issue creates exactly that
 * reference, so a Pull Request opened outside the flow can still be picked up.
 */
export function LinkPullRequestForm({
  owner,
  repository,
  issueNumber,
  onLinked,
}: LinkPullRequestFormProps) {
  const [value, setValue] = useState("");
  const { submit, submitting, error } = usePostComment();

  const prNumber = Number.parseInt(value.replace(/^#/, ""), 10);
  const canSubmit = Number.isInteger(prNumber) && prNumber > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    const comment = await submit(
      { kind: "pull_request", owner, repository, number: prNumber },
      `Linked to #${issueNumber}.`,
    );
    if (comment) {
      setValue("");
      onLinked(comment);
    }
  }

  return (
    <form className="link-pr-form" onSubmit={handleSubmit}>
      <label className="t-overline" htmlFor="link-pr-number">
        Link An Existing Pull Request
      </label>
      <p className="t-tiny">
        Use this when the Pull Request was opened outside the flow, so GitHub has no reference back
        to this issue yet.
      </p>
      <div className="link-pr-form__row">
        <input
          id="link-pr-number"
          className="form-input-base form-input"
          inputMode="numeric"
          placeholder="Pull Request number, e.g. 25"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit" color="primary" disabled={!canSubmit || submitting}>
          {submitting ? "Linking…" : "Link"}
        </Button>
      </div>
      {error && <div className="status-banner status-banner--error">{error.message}</div>}
    </form>
  );
}
