import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { GridBeamsBackground } from ".";

expect.extend(toHaveNoViolations);

describe("GridBeamsBackground accessibility", () => {
  it("has no axe violations for a hero composition", async () => {
    const { container } = render(
      <main aria-label="GridBeamsBackground smoke">
        <GridBeamsBackground tone="primary">
          <div>
            <h1>Ship dashboards your team trusts</h1>
            <p>Production-grade components for SaaS and AI products.</p>
            <Button>Get started</Button>
          </div>
        </GridBeamsBackground>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("hides the decorative layer from assistive technology", () => {
    const { container } = render(
      <GridBeamsBackground>
        <h1>Readable hero</h1>
      </GridBeamsBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="grid-beams-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("keeps children reachable by role", () => {
    render(
      <GridBeamsBackground>
        <h1>Reachable heading</h1>
        <Button>Reachable action</Button>
      </GridBeamsBackground>,
    );

    expect(
      screen.getByRole("heading", { name: "Reachable heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reachable action" }),
    ).toBeInTheDocument();
  });
});
