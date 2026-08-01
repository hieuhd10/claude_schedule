import { useState } from "react";

import type { Comment, PullRequest } from "../api/types";
import { usePostComment } from "../hooks/use-post-comment";
import { CHECKPOINT_ACTIONS } from "../lib/checkpoints";

interface CheckpointPanelProps {
  owner: string;
  repository: string;
  issueNumber: number;
  linkedPullRequest: PullRequest | null;
  onPosted: (comment: Comment) => void;
}

export function CheckpointPanel({
  owner,
  repository,
  issueNumber,
  linkedPullRequest,
  onPosted,
}: CheckpointPanelProps) {
  const { submitCheckpoint, submitting, error } = usePostComment();
  const [lastPostedUrl, setLastPostedUrl] = useState<string | null>(null);

  return (
    <section className="checkpoint-panel">
      <h2>Human Checkpoints</h2>
      <p className="checkpoint-panel__hint">
        Recording a checkpoint posts a standardized comment to GitHub so the confirmation stays
        the source of truth across devices.
      </p>
      <div className="checkpoint-panel__actions">
        {CHECKPOINT_ACTIONS.map((action) => {
          const disabled = action.requiresPullRequest && !linkedPullRequest;
          return (
            <button
              key={action.checkpoint}
              type="button"
              disabled={disabled || submitting}
              title={disabled ? "Requires a linked Pull Request" : undefined}
              onClick={async () => {
                const comment = await submitCheckpoint(
                  owner,
                  repository,
                  issueNumber,
                  action.checkpoint,
                );
                if (comment) {
                  setLastPostedUrl(comment.html_url);
                  onPosted(comment);
                }
              }}
            >
              {action.label}
            </button>
          );
        })}
      </div>
      {error && <div className="status-banner status-banner--error">{error.message}</div>}
      {lastPostedUrl && (
        <div className="command-composer__success">
          Checkpoint posted:{" "}
          <a href={lastPostedUrl} target="_blank" rel="noreferrer">
            {lastPostedUrl}
          </a>
        </div>
      )}
    </section>
  );
}
