import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { AuroraBackground } from ".";

expect.extend(toHaveNoViolations);

describe("AuroraBackground accessibility", () => {
  it("has no axe violations for a hero composition", async () => {
    const { container } = render(
      <main aria-label="AuroraBackground smoke">
        <AuroraBackground tone="primary">
          <div>
            <h1>Soft light for bold launches</h1>
            <p>Flowing gradient ribbons that follow your theme.</p>
            <Button>Get started</Button>
          </div>
        </AuroraBackground>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("hides the decorative layer from assistive technology", () => {
    const { container } = render(
      <AuroraBackground>
        <h1>Readable hero</h1>
      </AuroraBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="aurora-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("keeps children reachable by role", () => {
    render(
      <AuroraBackground>
        <h1>Reachable heading</h1>
        <Button>Reachable action</Button>
      </AuroraBackground>,
    );

    expect(
      screen.getByRole("heading", { name: "Reachable heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reachable action" }),
    ).toBeInTheDocument();
  });
});
