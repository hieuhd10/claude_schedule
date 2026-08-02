import { ActivityTimeline } from "../components/activity-timeline";
import { CheckpointPanel } from "../components/checkpoint-panel";
import { CommandComposer } from "../components/command-composer";
import { IssueHeader } from "../components/issue-header";
import { LifecycleStepper } from "../components/lifecycle-stepper";
import { StageDetailPanel } from "../components/stage-detail-panel";
import { StatusBanner } from "../components/status-banner";
import { useIssueDetail } from "../hooks/use-issue-detail";

interface IssueDetailPageProps {
  owner: string;
  repository: string;
  issueNumber: number;
}

export function IssueDetailPage({ owner, repository, issueNumber }: IssueDetailPageProps) {
  const { data, loading, error, refresh, isWaitingForClaude, pollAttempts, startWaitingForClaude } =
    useIssueDetail(owner, repository, issueNumber);

  if (loading && !data) {
    return <StatusBanner loading />;
  }

  if (error && !data) {
    return <StatusBanner error={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="issue-detail-page">
      <IssueHeader
        owner={owner}
        repository={repository}
        issue={data.issue}
        linkedPullRequest={data.linked_pull_request}
        onRefresh={refresh}
        refreshing={loading}
      />

      <StatusBanner
        error={error}
        isWaitingForClaude={isWaitingForClaude}
        pollAttempts={pollAttempts}
      />

      <section className="completion-flow">
        <h2 className="completion-flow__title">Completion Flow</h2>
        <LifecycleStepper currentStage={data.lifecycle.stage} />

        {!data.linked_pull_request && (
          <p className="issue-detail-page__no-pr-note">
            No Pull Request linked yet. Claude needs to complete the Fix step and open a Pull
            Request before Review and Test actions become available.
          </p>
        )}
      </section>

      <div className="issue-detail-page__columns">
        <div className="issue-detail-page__main">
          <StageDetailPanel
            lifecycle={data.lifecycle}
            linkedPullRequest={data.linked_pull_request}
            prChecks={data.pr_checks}
            prCommits={data.pr_commits}
          />

          <CommandComposer
            owner={owner}
            repository={repository}
            issueNumber={issueNumber}
            linkedPullRequest={data.linked_pull_request}
            currentStage={data.lifecycle.stage}
            onPosted={(_comment, startedClaudeCommand) => {
              void refresh();
              if (startedClaudeCommand) startWaitingForClaude();
            }}
          />

          <CheckpointPanel
            owner={owner}
            repository={repository}
            issueNumber={issueNumber}
            currentStage={data.lifecycle.stage}
            onPosted={() => void refresh()}
          />
        </div>

        <div className="issue-detail-page__sidebar">
          <h2>Activity Timeline</h2>
          <ActivityTimeline items={data.activity} />
        </div>
      </div>
    </div>
  );
}
