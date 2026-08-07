import { useState } from "react";

import { Button } from "../design-system/lift-tailux";

import type { Comment, Stage } from "../api/types";
import { usePostComment } from "../hooks/use-post-comment";
import { DEBUG_APPROVAL_ACTION } from "../lib/checkpoints";

interface CheckpointPanelProps {
  owner: string;
  repository: string;
  issueNumber: number;
  currentStage: Stage;
  onPosted: (comment: Comment) => void;
}

export function CheckpointPanel({
  owner,
  repository,
  issueNumber,
  currentStage,
  onPosted,
}: CheckpointPanelProps) {
  const { submitCheckpoint, submitting, error } = usePostComment();
  const [lastPostedUrl, setLastPostedUrl] = useState<string | null>(null);

  if (currentStage !== "debug") return null;

  return (
    <section className="checkpoint-panel">
      <h2>Ready to move forward?</h2>
      <p className="checkpoint-panel__hint">
        Once the investigation is accepted, record approval to move this issue into Fix.
      </p>
      <div className="checkpoint-panel__actions">
        <Button
          color="primary"
          disabled={submitting}
          onClick={async () => {
            const comment = await submitCheckpoint(
              owner,
              repository,
              issueNumber,
              DEBUG_APPROVAL_ACTION.checkpoint,
            );
            if (comment) {
              setLastPostedUrl(comment.html_url);
              onPosted(comment);
            }
          }}
        >
          {submitting ? "Recording…" : "Approve Debug And Start Fix"}
        </Button>
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
