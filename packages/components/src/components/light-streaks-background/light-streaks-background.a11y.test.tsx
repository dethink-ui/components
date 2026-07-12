import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { LightStreaksBackground } from ".";

expect.extend(toHaveNoViolations);

describe("LightStreaksBackground accessibility", () => {
  it("has no axe violations for a hero composition", async () => {
    const { container } = render(
      <main aria-label="LightStreaksBackground smoke">
        <LightStreaksBackground tone="primary">
          <div>
            <h1>Make launch day feel like launch day</h1>
            <p>Depth and motion for dark heroes without patterned geometry.</p>
            <Button>Join the waitlist</Button>
          </div>
        </LightStreaksBackground>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("hides the decorative layer from assistive technology", () => {
    const { container } = render(
      <LightStreaksBackground>
        <h1>Readable hero</h1>
      </LightStreaksBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="light-streaks-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("keeps children reachable by role", () => {
    render(
      <LightStreaksBackground>
        <h1>Reachable heading</h1>
        <Button>Reachable action</Button>
      </LightStreaksBackground>,
    );

    expect(
      screen.getByRole("heading", { name: "Reachable heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reachable action" }),
    ).toBeInTheDocument();
  });
});
