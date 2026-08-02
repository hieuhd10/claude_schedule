import type { Checkpoint } from "../api/types";

export interface CheckpointAction {
  checkpoint: Checkpoint;
  label: string;
}

export const DEBUG_APPROVAL_ACTION: CheckpointAction = {
  checkpoint: "DEBUG_APPROVED",
  label: "Debug result approved",
};
