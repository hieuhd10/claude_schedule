import type { Comment, IssueDetailResponse, Stage } from "../api/types";
import { Button, Card } from "../design-system/lift-tailux";
import type { LifecycleSignals } from "../lib/lifecycle-progress";
import { ActivityTimeline } from "./activity-timeline";
import { CompletionFlow } from "./completion-flow";
import { CurrentStepWorkspace } from "./current-step-workspace";

const RECENT_ACTIVITY_COUNT = 5;

interface OverviewTabProps {
  owner: string;
  repository: string;
  issueNumber: number;
  data: IssueDetailResponse;
  signals: LifecycleSignals;
  selectedStage: Stage;
  onSelectStage: (stage: Stage) => void;
  onPosted: (comment: Comment, startedClaudeCommand: boolean) => void;
  onCheckpointPosted: () => void;
}

/** The API returns activity oldest-first; the panel shows the most recent work. */
function recentActivity(items: IssueDetailResponse["activity"]) {
  return [...items].reverse().slice(0, RECENT_ACTIVITY_COUNT);
}

export function OverviewTab({
  owner,
  repository,
  issueNumber,
  data,
  signals,
  selectedStage,
  onSelectStage,
  onPosted,
  onCheckpointPosted,
}: OverviewTabProps) {
  const commentCount = data.comments.length + data.pr_comments.length;

  return (
    <div className="tab-layout">
      <div className="tab-layout__main">
        <CompletionFlow
          signals={signals}
          prCommits={data.pr_commits}
          selectedStage={selectedStage}
          onSelectStage={onSelectStage}
        />

        {!data.linked_pull_request && (
          <div className="inline-notice">
            No Pull Request linked yet. The Fix step must produce a Pull Request before Review and Test
            actions become available.
          </div>
        )}

        <CurrentStepWorkspace
          owner={owner}
          repository={repository}
          issueNumber={issueNumber}
          signals={signals}
          prCommits={data.pr_commits}
          onPosted={onPosted}
          onCheckpointPosted={onCheckpointPosted}
        />

        <div className="stat-cards">
          <Card className="stat-card">
            <span className="t-overline">Pull Request</span>
            <strong className="t-metric">
              {data.linked_pull_request ? `#${data.linked_pull_request.number}` : "—"}
            </strong>
            <span className="t-tiny">
              {data.linked_pull_request
                ? data.linked_pull_request.merged
                  ? "Merged"
                  : data.linked_pull_request.state
                : "Not linked yet"}
            </span>
          </Card>
          <Card className="stat-card">
            <span className="t-overline">Commits</span>
            <strong className="t-metric">{data.pr_commits.length}</strong>
            <span className="t-tiny">On the fix branch</span>
          </Card>
          <Card className="stat-card">
            <span className="t-overline">Comments</span>
            <strong className="t-metric">{commentCount}</strong>
            <span className="t-tiny">
              {data.comments.length} on issue · {data.pr_comments.length} on Pull Request
            </span>
          </Card>
        </div>
      </div>

      <aside className="tab-layout__aside">
        <Card className="ds-card">
          <div className="ds-card__head">
            <h2 className="t-card-title">Activity</h2>
            <Button
              component="a"
              variant="flat"
              color="primary"
              href={data.issue.html_url}
              target="_blank"
              rel="noreferrer"
            >
              Full History
            </Button>
          </div>
          <div className="ds-card__body">
            <ActivityTimeline items={recentActivity(data.activity)} />
          </div>
        </Card>
      </aside>
    </div>
  );
}
