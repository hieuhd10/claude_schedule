// @vitest-environment jsdom

import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, Button, Card, Timeline, TimelineItem } from "./lift-tailux";

describe("LIFT Tailux bundle", () => {
  it("renders design system components with their own class contracts", () => {
    const { container } = render(
      <Card skin="shadow">
        <Badge color="info" variant="soft">
          In Progress
        </Badge>
        <Button variant="outlined" color="primary">
          Copy Link
        </Button>
        <Timeline lineSpace>
          <TimelineItem color="success" title="Root cause identified" />
        </Timeline>
      </Card>,
    );

    expect(container.querySelector(".card.skin-shadow")).toBeTruthy();

    const badge = within(container).getByText("In Progress");
    expect(badge.className).toBe("badge-base badge badge-soft");
    expect(badge.getAttribute("data-color")).toBe("info");

    const button = within(container).getByRole("button", { name: "Copy Link" });
    expect(button.className).toBe("btn-base btn btn-outlined");
    expect(button.getAttribute("data-color")).toBe("primary");

    expect(container.querySelector(".timeline.line-space")).toBeTruthy();
    expect(container.querySelector(".timeline-item[data-color='success']")).toBeTruthy();
  });
});
