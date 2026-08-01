import { STAGE_LABELS, STAGES, type Stage } from "../api/types";

interface LifecycleStepperProps {
  currentStage: Stage;
}

export function LifecycleStepper({ currentStage }: LifecycleStepperProps) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <ol className="lifecycle-stepper">
      {STAGES.map((stage, index) => {
        let state: "done" | "current" | "upcoming" = "upcoming";
        if (index < currentIndex) state = "done";
        if (index === currentIndex) state = "current";

        return (
          <li key={stage} className={`lifecycle-stepper__step lifecycle-stepper__step--${state}`}>
            <span className="lifecycle-stepper__dot" />
            {STAGE_LABELS[stage]}
          </li>
        );
      })}
    </ol>
  );
}
