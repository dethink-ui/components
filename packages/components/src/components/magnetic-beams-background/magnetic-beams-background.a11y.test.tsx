import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { MagneticBeamsBackground } from ".";

expect.extend(toHaveNoViolations);

describe("MagneticBeamsBackground accessibility", () => {
  it("has no axe violations for a hero composition", async () => {
    const { container } = render(
      <main aria-label="MagneticBeamsBackground smoke">
        <MagneticBeamsBackground tone="primary">
          <div>
            <h1>Ship dashboards your team trusts</h1>
            <p>Production-grade components for SaaS and AI products.</p>
            <Button>Get started</Button>
          </div>
        </MagneticBeamsBackground>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("hides the decorative layer from assistive technology", () => {
    const { container } = render(
      <MagneticBeamsBackground>
        <h1>Readable hero</h1>
      </MagneticBeamsBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="magnetic-beams-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("adds no focusable or announced elements when interactive", () => {
    const { container } = render(
      <MagneticBeamsBackground interactive>
        <h1>Interactive hero</h1>
      </MagneticBeamsBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="magnetic-beams-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(
      container.querySelectorAll('[data-slot="magnetic-beams-background"] a'),
    ).toHaveLength(0);
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("keeps children reachable by role", () => {
    render(
      <MagneticBeamsBackground>
        <h1>Reachable heading</h1>
        <Button>Reachable action</Button>
      </MagneticBeamsBackground>,
    );

    expect(
      screen.getByRole("heading", { name: "Reachable heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reachable action" }),
    ).toBeInTheDocument();
  });
});
