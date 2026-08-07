import { useEffect, useState } from "react";

import type { Stage } from "../api/types";
import { IssueHeader } from "../components/issue-header";
import { IssueInformation } from "../components/issue-information";
import { IssueTabs, type IssueTab } from "../components/issue-tabs";
import { IssueToolbar } from "../components/issue-toolbar";
import { OverviewTab } from "../components/overview-tab";
import { QaReportTab } from "../components/qa-report-tab";
import { StatusBanner } from "../components/status-banner";
import { formatDateTime } from "../lib/format-time";
import type { LifecycleSignals } from "../lib/lifecycle-progress";
import { useIssueDetail } from "../hooks/use-issue-detail";

interface IssueDetailPageProps {
  owner: string;
  repository: string;
  issueNumber: number;
}

export function IssueDetailPage({ owner, repository, issueNumber }: IssueDetailPageProps) {
  const { data, loading, error, refresh, isWaitingForClaude, pollAttempts, startWaitingForClaude } =
    useIssueDetail(owner, repository, issueNumber);
  const [tab, setTab] = useState<IssueTab>("overview");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  // Follow the lifecycle whenever the issue changes; an explicit step pick wins until then.
  useEffect(() => {
    setSelectedStage(null);
    setTab("overview");
  }, [owner, repository, issueNumber]);

  if (loading && !data) {
    return <StatusBanner loading />;
  }

  if (error && !data) {
    return <StatusBanner error={error} />;
  }

  if (!data) {
    return null;
  }

  const signals: LifecycleSignals = {
    lifecycle: data.lifecycle,
    issue: data.issue,
    linkedPullRequest: data.linked_pull_request,
    prChecks: data.pr_checks,
    prCommitCount: data.pr_commits.length,
  };

  return (
    <div className="issue-detail-page">
      <IssueToolbar
        owner={owner}
        repository={repository}
        issue={data.issue}
        onRefresh={refresh}
        refreshing={loading}
      />

      <IssueHeader
        issue={data.issue}
        lifecycle={data.lifecycle}
        linkedPullRequest={data.linked_pull_request}
      />

      <StatusBanner error={error} isWaitingForClaude={isWaitingForClaude} pollAttempts={pollAttempts} />

      <IssueInformation issue={data.issue} linkedPullRequest={data.linked_pull_request} />

      <IssueTabs
        active={tab}
        onChange={setTab}
        updatedLabel={`Updated ${formatDateTime(data.issue.updated_at)}`}
      />

      <div id={`issue-panel-${tab}`} role="tabpanel" aria-labelledby={`issue-tab-${tab}`}>
        {tab === "overview" && (
          <OverviewTab
            owner={owner}
            repository={repository}
            issueNumber={issueNumber}
            data={data}
            signals={signals}
            selectedStage={selectedStage ?? data.lifecycle.stage}
            onSelectStage={setSelectedStage}
            onPosted={(_comment, startedClaudeCommand) => {
              void refresh();
              if (startedClaudeCommand) startWaitingForClaude();
            }}
            onCheckpointPosted={() => void refresh()}
          />
        )}

        {tab === "qa-report" && <QaReportTab data={data} signals={signals} />}
      </div>
    </div>
  );
}
