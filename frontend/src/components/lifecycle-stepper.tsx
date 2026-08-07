import { STAGE_LABELS, STAGES, type Stage } from "../api/types";
import { Avatar, Badge } from "../design-system/lift-tailux";
import { STEP_STATE_COLORS } from "../lib/ds-colors";
import { stageOwner, stepState, type LifecycleSignals, type StepState } from "../lib/lifecycle-progress";

interface LifecycleStepperProps {
  signals: LifecycleSignals;
  selectedStage: Stage;
  onSelect: (stage: Stage) => void;
}

const STEP_CAPTION: Record<StepState, string> = {
  done: "Completed",
  current: "In Progress",
  waiting: "Waiting",
};

export function LifecycleStepper({ signals, selectedStage, onSelect }: LifecycleStepperProps) {
  return (
    <ol className="lifecycle-stepper">
      {STAGES.map((stage, index) => {
        const state = stepState(stage, signals);
        const owner = stageOwner(signals.lifecycle, stage);
        const selected = stage === selectedStage;

        return (
          <li key={stage} className="lifecycle-stepper__item">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(stage)}
              className={`lifecycle-stepper__step${selected ? " is-selected" : ""}`}
            >
              <span className="lifecycle-stepper__head">
                <span
                  className={`lifecycle-stepper__marker lifecycle-stepper__marker--${state}`}
                  aria-hidden="true"
                >
                  {state === "done" ? "✓" : index + 1}
                  {state === "current" && <span className="animate-ping" />}
                </span>
                <span className="lifecycle-stepper__label">{STAGE_LABELS[stage]}</span>
              </span>

              <Badge component="span" variant="soft" color={STEP_STATE_COLORS[state]}>
                {STEP_CAPTION[state]}
              </Badge>

              <span className="lifecycle-stepper__owner">
                {owner?.actor ? (
                  <>
                    <Avatar name={owner.actor} size={5} initialColor="auto" initialVariant="soft" />
                    <span className="t-tiny">{owner.actor}</span>
                  </>
                ) : (
                  <span className="t-tiny">No owner yet</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
