import { useState } from "react";

import { closeIssue, mergePullRequest } from "../api/client";
import {
  MERGE_METHODS,
  MERGE_METHOD_LABELS,
  type Issue,
  type MergeMethod,
  type PullRequest,
} from "../api/types";
import { Button } from "../design-system/lift-tailux";

interface CompletionActionsProps {
  owner: string;
  repository: string;
  issue: Issue;
  linkedPullRequest: PullRequest | null;
  onCompleted: () => void;
}

/**
 * The last two steps of the flow, which until now had to be done on GitHub.
 * Merging a Pull Request that closes the issue does both at once, so the close
 * action only appears when the merge left the issue open.
 */
export function CompletionActions({
  owner,
  repository,
  issue,
  linkedPullRequest,
  onCompleted,
}: CompletionActionsProps) {
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>("squash");
  const [confirming, setConfirming] = useState<"merge" | "close" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const canMerge = linkedPullRequest !== null && !linkedPullRequest.merged;
  const canClose = issue.state === "open";

  if (!canMerge && !canClose) return null;

  async function run(action: () => Promise<unknown>) {
    setSubmitting(true);
    setError(null);
    try {
      await action();
      setConfirming(null);
      onCompleted();
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="completion-actions">
      <span className="t-overline">Complete This Issue</span>

      {canMerge && linkedPullRequest && (
        <div className="completion-actions__row">
          <select
            className="form-input-base form-input"
            aria-label="Merge method"
            value={mergeMethod}
            disabled={submitting}
            onChange={(event) => {
              setMergeMethod(event.target.value as MergeMethod);
              setConfirming(null);
            }}
          >
            {MERGE_METHODS.map((method) => (
              <option key={method} value={method}>
                {MERGE_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
          {confirming === "merge" ? (
            <>
              <span className="t-tiny">
                Merge #{linkedPullRequest.number} into <code>{linkedPullRequest.base_branch}</code>?
              </span>
              <Button
                color="primary"
                disabled={submitting}
                onClick={() =>
                  run(() => mergePullRequest(owner, repository, linkedPullRequest.number, mergeMethod))
                }
              >
                {submitting ? "Merging…" : "Confirm Merge"}
              </Button>
              <Button variant="flat" disabled={submitting} onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button color="primary" disabled={submitting} onClick={() => setConfirming("merge")}>
              Merge Pull Request
            </Button>
          )}
        </div>
      )}

      {canClose && (
        <div className="completion-actions__row">
          <p className="t-tiny">
            {linkedPullRequest?.merged
              ? "The Pull Request is merged but the issue is still open."
              : "Closing the issue moves this flow to Completed."}
          </p>
          {confirming === "close" ? (
            <>
              <Button
                color="primary"
                disabled={submitting}
                onClick={() => run(() => closeIssue(owner, repository, issue.number))}
              >
                {submitting ? "Closing…" : `Confirm Close #${issue.number}`}
              </Button>
              <Button variant="flat" disabled={submitting} onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outlined" disabled={submitting} onClick={() => setConfirming("close")}>
              Close Issue
            </Button>
          )}
        </div>
      )}

      {error && <div className="status-banner status-banner--error">{error.message}</div>}
    </section>
  );
}
