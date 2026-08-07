import { STAGE_LABELS, type Comment, type Commit } from "../api/types";
import { Badge, Card } from "../design-system/lift-tailux";
import { stageOwner, transitionConditions, type LifecycleSignals } from "../lib/lifecycle-progress";
import { CheckpointPanel } from "./checkpoint-panel";
import { ClaudeResponseSummary } from "./claude-response-summary";
import { CommandComposer } from "./command-composer";
import { CompletionActions } from "./completion-actions";
import { CreatePullRequestForm } from "./create-pull-request-form";
import { LinkPullRequestForm } from "./link-pull-request-form";
import { StageOwnerChip } from "./stage-owner-chip";
import { TransitionChecklist } from "./transition-checklist";

interface CurrentStepWorkspaceProps {
  owner: string;
  repository: string;
  issueNumber: number;
  signals: LifecycleSignals;
  prCommits: Commit[];
  onPosted: (comment: Comment, startedClaudeCommand: boolean) => void;
  onCheckpointPosted: () => void;
}

export function CurrentStepWorkspace({
  owner,
  repository,
  issueNumber,
  signals,
  prCommits,
  onPosted,
  onCheckpointPosted,
}: CurrentStepWorkspaceProps) {
  const { lifecycle, linkedPullRequest } = signals;
  const conditions = transitionConditions(lifecycle.stage, signals);
  const remaining = conditions.filter((condition) => !condition.met).length;
  const stepOwner = stageOwner(lifecycle, lifecycle.stage);

  return (
    <Card className="ds-card">
      <div className="ds-card__head">
        <div className="ds-card__head-group">
          <h2 className="t-card-title">Current Step Workspace</h2>
          <Badge component="span" variant="soft" color="primary">
            {STAGE_LABELS[lifecycle.stage]}
          </Badge>
        </div>
        <span className="t-caption">
          {remaining > 0
            ? `${remaining} of ${conditions.length} conditions remaining`
            : "All conditions for this step are complete"}
        </span>
      </div>

      <div className="ds-card__body current-step__columns">
        <div className="current-step__main">
          <h3 className="t-overline">Conditions To Move On</h3>
          <TransitionChecklist conditions={conditions} />

          <div className="current-step__next-action">
            <span className="t-overline">Next Recommended Action</span>
            <p className="t-body">{lifecycle.next_recommended_action}</p>
          </div>

          <details className="current-step__reasoning">
            <summary className="t-body">Why this step</summary>
            <ul>
              {lifecycle.reasoning.map((reason, index) => (
                <li key={index} className="t-body">
                  {reason}
                </li>
              ))}
            </ul>
          </details>
        </div>

        <aside className="current-step__aside">
          <h3 className="t-overline">Step Owner</h3>
          <StageOwnerChip owner={stepOwner} fallback="Nobody has recorded this step yet." />

          <h3 className="t-overline">Latest Claude Response</h3>
          <ClaudeResponseSummary response={lifecycle.last_claude_response} />
          {lifecycle.last_command && (
            // Prompts carry a multi-line format block; only the ask is worth showing.
            <p className="current-step__last-command t-tiny">
              Last command: <code>{lifecycle.last_command.split("\n")[0]}</code>
            </p>
          )}

          <h3 className="t-overline">Technical Links</h3>
          <ul className="link-list">
            {linkedPullRequest ? (
              <>
                <li>
                  <a href={linkedPullRequest.html_url} target="_blank" rel="noreferrer">
                    Pull Request #{linkedPullRequest.number}
                  </a>
                  <span className="t-tiny">
                    {linkedPullRequest.merged ? "merged" : linkedPullRequest.state}
                  </span>
                </li>
                <li>
                  <code>{linkedPullRequest.head_branch}</code>
                  <span className="t-tiny">{prCommits.length} commit(s)</span>
                </li>
              </>
            ) : (
              <li>
                <span className="t-caption">No Pull Request linked</span>
              </li>
            )}
          </ul>
        </aside>
      </div>

      <div className="ds-card__section">
        <CommandComposer
          owner={owner}
          repository={repository}
          issueNumber={issueNumber}
          linkedPullRequest={linkedPullRequest}
          currentStage={lifecycle.stage}
          onPosted={onPosted}
        />
        <CheckpointPanel
          owner={owner}
          repository={repository}
          issueNumber={issueNumber}
          currentStage={lifecycle.stage}
          onPosted={onCheckpointPosted}
        />
        {/* Fix hands over on a Pull Request, so both ways of producing one live here. */}
        {lifecycle.stage === "fix" && !linkedPullRequest && (
          <>
            <CreatePullRequestForm
              owner={owner}
              repository={repository}
              issueNumber={issueNumber}
              onCreated={onCheckpointPosted}
            />
            <LinkPullRequestForm
              owner={owner}
              repository={repository}
              issueNumber={issueNumber}
              onLinked={onCheckpointPosted}
            />
          </>
        )}
        {lifecycle.stage === "ready_to_merge" && (
          <CompletionActions
            owner={owner}
            repository={repository}
            issue={signals.issue}
            linkedPullRequest={linkedPullRequest}
            onCompleted={onCheckpointPosted}
          />
        )}
      </div>
    </Card>
  );
}
