import { useCallback, useEffect, useRef, useState } from "react";

import { getIssueDetail } from "../api/client";
import type { IssueDetailResponse } from "../api/types";

const POLL_INTERVAL_MS = 15_000;
const MAX_POLL_ATTEMPTS = 20; // ~5 minutes of polling before falling back to manual refresh

export interface UseIssueDetailResult {
  data: IssueDetailResponse | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isWaitingForClaude: boolean;
  pollAttempts: number;
  startWaitingForClaude: () => void;
}

export function useIssueDetail(
  owner: string | null,
  repository: string | null,
  issueNumber: number | null,
): UseIssueDetailResult {
  const [data, setData] = useState<IssueDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isWaitingForClaude, setIsWaitingForClaude] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const postedAtRef = useRef<string | null>(null);

  const load = useCallback(async (): Promise<IssueDetailResponse | null> => {
    if (!owner || !repository || issueNumber === null) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await getIssueDetail(owner, repository, issueNumber);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [owner, repository, issueNumber]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const startWaitingForClaude = useCallback(() => {
    postedAtRef.current = new Date().toISOString();
    setPollAttempts(0);
    setIsWaitingForClaude(true);
  }, []);

  useEffect(() => {
    if (!isWaitingForClaude) return;
    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      setIsWaitingForClaude(false);
      return;
    }

    const hadPullRequest = data?.linked_pull_request != null;

    const timer = setTimeout(async () => {
      const result = await load();
      setPollAttempts((count) => count + 1);
      if (!result) return;

      const postedAt = postedAtRef.current;
      const hasNewClaudeActivity =
        !!postedAt &&
        result.activity.some(
          (item) => item.category === "claude_response" && (item.created_at ?? "") > postedAt,
        );
      const gotNewPullRequest = !hadPullRequest && result.linked_pull_request != null;

      if (hasNewClaudeActivity || gotNewPullRequest) {
        setIsWaitingForClaude(false);
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [isWaitingForClaude, pollAttempts, load, data?.linked_pull_request]);

  return { data, loading, error, refresh, isWaitingForClaude, pollAttempts, startWaitingForClaude };
}
