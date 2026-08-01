import { useState } from "react";

import type { Comment, PullRequest } from "../api/types";
import { usePostComment } from "../hooks/use-post-comment";
import { QUICK_ACTIONS, type QuickAction } from "../lib/quick-actions";

interface CommandComposerProps {
  owner: string;
  repository: string;
  issueNumber: number;
  linkedPullRequest: PullRequest | null;
  onPosted: (comment: Comment, startedClaudeCommand: boolean) => void;
}

export function CommandComposer({
  owner,
  repository,
  issueNumber,
  linkedPullRequest,
  onPosted,
}: CommandComposerProps) {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [prompt, setPrompt] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [lastPostedUrl, setLastPostedUrl] = useState<string | null>(null);
  const { submit, submitting, error } = usePostComment();

  const target = selectedAction?.target ?? "issue";
  const targetNumber = target === "pull_request" ? linkedPullRequest?.number : issueNumber;
  const canPost = target === "issue" || linkedPullRequest != null;

  function selectAction(action: QuickAction) {
    setSelectedAction(action);
    setPrompt(action.buildPrompt());
    setConfirming(false);
    setLastPostedUrl(null);
  }

  async function handleConfirmPost() {
    if (!targetNumber || !prompt.trim()) return;
    const comment = await submit(
      { kind: target, owner, repository, number: targetNumber },
      prompt.trim(),
    );
    setConfirming(false);
    if (comment) {
      setLastPostedUrl(comment.html_url);
      setPrompt("");
      onPosted(comment, prompt.trim().toLowerCase().startsWith("@claude"));
    }
  }

  return (
    <section className="command-composer">
      <h2>AI Command Composer</h2>

      <div className="command-composer__quick-actions">
        {QUICK_ACTIONS.map((action) => {
          const disabled = action.target === "pull_request" && !linkedPullRequest;
          return (
            <button
              key={action.key}
              type="button"
              disabled={disabled}
              title={disabled ? "Requires a linked Pull Request" : undefined}
              onClick={() => selectAction(action)}
              className={selectedAction?.key === action.key ? "active" : ""}
            >
              {action.label}
            </button>
          );
        })}
      </div>

      {selectedAction && (
        <div className="command-composer__editor">
          <div className="command-composer__destination">
            {canPost
              ? `Posting to ${target === "issue" ? `GitHub Issue #${issueNumber}` : `Pull Request #${targetNumber}`}`
              : "No linked Pull Request available to post to."}
          </div>

          <textarea
            rows={5}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />

          {!confirming ? (
            <button
              type="button"
              disabled={!canPost || submitting || !prompt.trim()}
              onClick={() => setConfirming(true)}
            >
              {target === "issue" ? "Post to GitHub Issue" : "Post to Pull Request"}
            </button>
          ) : (
            <div className="command-composer__confirm">
              <span>
                Confirm posting to {target === "issue" ? `Issue #${issueNumber}` : `Pull Request #${targetNumber}`}?
              </span>
              <button type="button" onClick={handleConfirmPost} disabled={submitting}>
                {submitting ? "Posting…" : "Yes, post"}
              </button>
              <button type="button" onClick={() => setConfirming(false)} disabled={submitting}>
                Cancel
              </button>
            </div>
          )}

          {error && <div className="status-banner status-banner--error">{error.message}</div>}
          {lastPostedUrl && (
            <div className="command-composer__success">
              Comment posted:{" "}
              <a href={lastPostedUrl} target="_blank" rel="noreferrer">
                {lastPostedUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
