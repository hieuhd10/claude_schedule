import { STAGES, type Commit, type Stage } from "../api/types";
import { Card, Progress } from "../design-system/lift-tailux";
import { stepState, type LifecycleSignals } from "../lib/lifecycle-progress";
import { LifecycleStepper } from "./lifecycle-stepper";
import { StepDetailPanel } from "./step-detail-panel";

interface CompletionFlowProps {
  signals: LifecycleSignals;
  prCommits: Commit[];
  selectedStage: Stage;
  onSelectStage: (stage: Stage) => void;
}

export function CompletionFlow({ signals, prCommits, selectedStage, onSelectStage }: CompletionFlowProps) {
  const completed = STAGES.filter((stage) => stepState(stage, signals) === "done").length;
  const percent = Math.round((completed / STAGES.length) * 100);

  return (
    <Card className="ds-card">
      <div className="ds-card__head">
        <h2 className="t-card-title">Completion Flow</h2>
        <div className="completion-flow__progress">
          <span className="t-caption">
            {completed} of {STAGES.length} steps completed
          </span>
          <Progress value={percent} color="primary" className="completion-flow__rail" />
        </div>
      </div>

      <div className="ds-card__body">
        <LifecycleStepper signals={signals} selectedStage={selectedStage} onSelect={onSelectStage} />
      </div>

      <div className="ds-card__section">
        <StepDetailPanel stage={selectedStage} signals={signals} prCommits={prCommits} />
      </div>
    </Card>
  );
}
