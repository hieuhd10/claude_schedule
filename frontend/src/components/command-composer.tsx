import { useEffect, useState } from "react";

import type { Comment, PullRequest, Stage } from "../api/types";
import { usePostComment } from "../hooks/use-post-comment";
import { STAGE_ACTIONS } from "../lib/quick-actions";

interface CommandComposerProps {
  owner: string;
  repository: string;
  issueNumber: number;
  linkedPullRequest: PullRequest | null;
  currentStage: Stage;
  onPosted: (comment: Comment, startedClaudeCommand: boolean) => void;
}

type ComposerMode = "manual" | "claude";

export function CommandComposer({
  owner,
  repository,
  issueNumber,
  linkedPullRequest,
  currentStage,
  onPosted,
}: CommandComposerProps) {
  const action = STAGE_ACTIONS[currentStage];
  const [mode, setMode] = useState<ComposerMode>("manual");
  const [body, setBody] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [lastPostedUrl, setLastPostedUrl] = useState<string | null>(null);
  const { submit, submitting, error } = usePostComment();

  useEffect(() => {
    setMode("manual");
    setBody("");
    setConfirming(false);
    setLastPostedUrl(null);
  }, [currentStage, issueNumber]);

  const targetNumber =
    action.target === "pull_request" ? linkedPullRequest?.number ?? null : issueNumber;
  const canPost = targetNumber !== null;

  function changeMode(nextMode: ComposerMode) {
    setMode(nextMode);
    setBody(nextMode === "claude" ? action.claudePrompt : "");
    setConfirming(false);
    setLastPostedUrl(null);
  }

  async function handleConfirmPost() {
    if (targetNumber === null || !body.trim()) return;
    const comment = await submit(
      { kind: action.target, owner, repository, number: targetNumber },
      body.trim(),
    );
    setConfirming(false);
    if (comment) {
      setLastPostedUrl(comment.html_url);
      setBody(mode === "claude" ? action.claudePrompt : "");
      onPosted(comment, body.trim().toLowerCase().startsWith("@claude"));
    }
  }

  const destination =
    action.target === "issue" ? `Issue #${issueNumber}` : `Pull Request #${targetNumber ?? "—"}`;

  return (
    <section className="command-composer">
      <div className="command-composer__heading">
        <div>
          <span className="eyebrow">Current stage action</span>
          <h2>{action.title}</h2>
          <p>{action.description}</p>
        </div>
        <span className="command-composer__destination">Posts to {destination}</span>
      </div>

      <div className="command-composer__mode-tabs" role="tablist" aria-label="Comment mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "manual"}
          className={mode === "manual" ? "active" : ""}
          onClick={() => changeMode("manual")}
        >
          <span aria-hidden="true">✎</span>
          <strong>Manual comment</strong>
          <small>Write and post your own update</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "claude"}
          className={mode === "claude" ? "active" : ""}
          onClick={() => changeMode("claude")}
        >
          <span aria-hidden="true">✦</span>
          <strong>Ask Claude</strong>
          <small>Send an editable @claude prompt</small>
        </button>
      </div>

      {!canPost && (
        <div className="inline-notice inline-notice--warning">
          This stage needs a linked Pull Request before comments can be posted.
        </div>
      )}

      <div className="command-composer__editor" role="tabpanel">
        <label htmlFor="stage-comment">
          {mode === "manual" ? "Your comment" : "Claude prompt"}
        </label>
        <textarea
          id="stage-comment"
          rows={5}
          value={body}
          placeholder={mode === "manual" ? action.manualPlaceholder : undefined}
          onChange={(event) => {
            setBody(event.target.value);
            setConfirming(false);
          }}
          disabled={!canPost || submitting}
        />

        {!confirming ? (
          <button
            className="button button--primary"
            type="button"
            disabled={!canPost || submitting || !body.trim()}
            onClick={() => setConfirming(true)}
          >
            {mode === "manual" ? "Review manual comment" : "Review Claude prompt"}
          </button>
        ) : (
          <div className="command-composer__confirm">
            <span>Post this comment to {destination}?</span>
            <button className="button button--primary" type="button" onClick={handleConfirmPost} disabled={submitting}>
              {submitting ? "Posting…" : "Confirm and post"}
            </button>
            <button className="button button--ghost" type="button" onClick={() => setConfirming(false)} disabled={submitting}>
              Cancel
            </button>
          </div>
        )}

        {error && <div className="status-banner status-banner--error">{error.message}</div>}
        {lastPostedUrl && (
          <div className="command-composer__success">
            Comment posted successfully. <a href={lastPostedUrl} target="_blank" rel="noreferrer">Open on GitHub ↗</a>
          </div>
        )}
      </div>
    </section>
  );
}
