import { useEffect, useState } from "react";

import { createPullRequest, getFixBranches } from "../api/client";
import type { PullRequest } from "../api/types";
import { Button } from "../design-system/lift-tailux";

interface CreatePullRequestFormProps {
  owner: string;
  repository: string;
  issueNumber: number;
  onCreated: (pullRequest: PullRequest) => void;
}

/**
 * Fix hands over to Review only once a Pull Request references the issue. The
 * Claude workflow pushes a branch but leaves opening the Pull Request to a
 * human, so without this the flow has no way forward from inside the app.
 */
export function CreatePullRequestForm({
  owner,
  repository,
  issueNumber,
  onCreated,
}: CreatePullRequestFormProps) {
  const [branches, setBranches] = useState<string[]>([]);
  const [baseBranch, setBaseBranch] = useState<string | null>(null);
  const [head, setHead] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getFixBranches(owner, repository, issueNumber)
      .then((result) => {
        if (cancelled) return;
        setBranches(result.branches);
        setBaseBranch(result.base_branch);
        // The branch naming this issue is ranked first by the API.
        setHead((current) => current || result.branches[0] || "");
      })
      .catch(() => {
        // Branch suggestions are a convenience; the field still accepts any name.
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repository, issueNumber]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!head.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await createPullRequest(owner, repository, issueNumber, {
        head: head.trim(),
      });
      onCreated(response.pull_request);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="create-pr-form" onSubmit={handleSubmit}>
      <div className="create-pr-form__head">
        <span className="t-overline">Open The Pull Request</span>
        {baseBranch && (
          <span className="t-tiny">
            into <code>{baseBranch}</code>
          </span>
        )}
      </div>
      <p className="t-tiny">
        Creates the Pull Request from the fix branch and closes this issue with it, which is the
        reference the flow needs to reach Review.
      </p>

      <div className="create-pr-form__row">
        <input
          className="form-input-base form-input"
          list="fix-branch-options"
          placeholder="Fix branch name"
          value={head}
          onChange={(event) => setHead(event.target.value)}
          aria-label="Fix branch"
        />
        <datalist id="fix-branch-options">
          {branches.map((branch) => (
            <option key={branch} value={branch} />
          ))}
        </datalist>
        <Button type="submit" color="primary" disabled={!head.trim() || submitting}>
          {submitting ? "Opening…" : "Create Pull Request"}
        </Button>
      </div>

      {error && <div className="status-banner status-banner--error">{error.message}</div>}
    </form>
  );
}
