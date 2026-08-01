import { useCallback, useState } from "react";

import { postCheckpoint, postIssueComment, postPullRequestComment } from "../api/client";
import type { Checkpoint, Comment } from "../api/types";

export interface PostTarget {
  kind: "issue" | "pull_request";
  owner: string;
  repository: string;
  number: number;
}

export function usePostComment() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(async (target: PostTarget, body: string): Promise<Comment | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const response =
        target.kind === "issue"
          ? await postIssueComment(target.owner, target.repository, target.number, body)
          : await postPullRequestComment(target.owner, target.repository, target.number, body);
      return response.comment;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitCheckpoint = useCallback(
    async (
      owner: string,
      repository: string,
      issueNumber: number,
      checkpoint: Checkpoint,
    ): Promise<Comment | null> => {
      setSubmitting(true);
      setError(null);
      try {
        const response = await postCheckpoint(owner, repository, issueNumber, checkpoint);
        return response.comment;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submit, submitCheckpoint, submitting, error };
}
