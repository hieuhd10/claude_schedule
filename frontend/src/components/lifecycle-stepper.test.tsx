// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STAGES } from "../api/types";
import { LifecycleStepper } from "./lifecycle-stepper";

describe("LifecycleStepper", () => {
  it("renders every step as completed when the lifecycle is complete", () => {
    render(<LifecycleStepper currentStage="completed" />);

    expect(screen.getAllByText("Completed")).toHaveLength(STAGES.length + 1);
    expect(screen.queryByText("In progress")).toBeNull();
  });
});
