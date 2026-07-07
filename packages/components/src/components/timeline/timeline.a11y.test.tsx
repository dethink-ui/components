import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { Timeline } from ".";

expect.extend(toHaveNoViolations);

describe("Timeline accessibility", () => {
  it("has no axe violations for event and progress timelines", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <main aria-label="Timeline accessibility smoke">
          <Timeline
            aria-label="Launch history"
            items={[
              {
                id: "kickoff",
                title: "Kickoff",
                description: "Project kickoff with stakeholders.",
                datetime: "2026-01-01T09:00:00Z",
                dateLabel: "Jan 1, 2026",
                status: "complete",
                image: {
                  src: "https://example.com/kickoff.jpg",
                  alt: "Stakeholder kickoff notes",
                },
              },
              {
                id: "beta",
                title: "Beta",
                description: "Invite design partners.",
                datetime: "2026-02-01T09:00:00Z",
                dateLabel: "Feb 1, 2026",
                status: "current",
              },
            ]}
          />
          <Timeline
            aria-label="Workflow progress"
            mode="progress"
            interactive={false}
            items={[
              { id: "done", title: "Done", status: "complete" },
              { id: "active", title: "Active", status: "current" },
              { id: "next", title: "Next", status: "upcoming" },
            ]}
          />
          <Timeline
            aria-label="Company story"
            mode="story"
            items={[
              {
                id: "founded",
                title: "Two people, one repo",
                description: "Started as a side project.",
                datetime: "2018-01-01T00:00:00Z",
                dateLabel: "2018",
                status: "complete",
              },
              {
                id: "platform",
                title: "A platform, not a package",
                description: "Teams ship with blocks and templates.",
                datetime: "2026-01-01T00:00:00Z",
                dateLabel: "2026",
                status: "current",
              },
            ]}
          />
        </main>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
