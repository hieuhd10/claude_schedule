import type { Checkpoint } from "../api/types";

export interface CheckpointAction {
  checkpoint: Checkpoint;
  label: string;
  requiresPullRequest: boolean;
}

export const CHECKPOINT_ACTIONS: CheckpointAction[] = [
  { checkpoint: "DEBUG_APPROVED", label: "Debug result approved", requiresPullRequest: false },
  {
    checkpoint: "PR_READY_FOR_REVIEW",
    label: "Pull Request ready for review",
    requiresPullRequest: true,
  },
  { checkpoint: "REVIEW_CONFIRMED", label: "Review confirmed", requiresPullRequest: true },
  { checkpoint: "TEST_CONFIRMED", label: "Test result confirmed", requiresPullRequest: true },
  { checkpoint: "PR_MERGED", label: "Pull Request merged", requiresPullRequest: true },
];
