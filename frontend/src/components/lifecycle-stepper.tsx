import { STAGE_LABELS, STAGES, type Stage } from "../api/types";

interface LifecycleStepperProps {
  currentStage: Stage;
}

type StepState = "done" | "current" | "upcoming";

const STEP_ICON: Record<StepState, string> = {
  done: "✓",
  current: "●",
  upcoming: "○",
};

const STEP_CAPTION: Record<StepState, string> = {
  done: "Completed",
  current: "In progress",
  upcoming: "Waiting",
};

export function LifecycleStepper({ currentStage }: LifecycleStepperProps) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <ol className="lifecycle-stepper">
      {STAGES.map((stage, index) => {
        let state: StepState = "upcoming";
        if (index < currentIndex) state = "done";
        if (index === currentIndex) state = "current";

        return (
          <li key={stage} className={`lifecycle-stepper__step lifecycle-stepper__step--${state}`}>
            <span className="lifecycle-stepper__icon" aria-hidden="true">
              {STEP_ICON[state]}
            </span>
            <span className="lifecycle-stepper__text">
              <span className="lifecycle-stepper__label">{STAGE_LABELS[stage]}</span>
              <span className="lifecycle-stepper__caption">{STEP_CAPTION[state]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
