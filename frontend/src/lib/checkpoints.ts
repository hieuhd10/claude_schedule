import type { Checkpoint, Stage } from "../api/types";

export interface CheckpointAction {
  checkpoint: Checkpoint;
  label: string;
  requiresPullRequest: boolean;
  /** Stage this checkpoint moves the issue past; used only to highlight the
   * most relevant action for the current stage, not to imply it is enforced. */
  relevantForStage: Stage;
}

export const CHECKPOINT_ACTIONS: CheckpointAction[] = [
  {
    checkpoint: "DEBUG_APPROVED",
    label: "Debug result approved",
    requiresPullRequest: false,
    relevantForStage: "debug",
  },
  {
    checkpoint: "PR_READY_FOR_REVIEW",
    label: "Pull Request ready for review",
    requiresPullRequest: true,
    relevantForStage: "fix",
  },
  {
    checkpoint: "REVIEW_CONFIRMED",
    label: "Review confirmed",
    requiresPullRequest: true,
    relevantForStage: "review",
  },
  {
    checkpoint: "TEST_CONFIRMED",
    label: "Test result confirmed",
    requiresPullRequest: true,
    relevantForStage: "test",
  },
  {
    checkpoint: "PR_MERGED",
    label: "Pull Request merged",
    requiresPullRequest: true,
    relevantForStage: "ready_to_merge",
  },
];
