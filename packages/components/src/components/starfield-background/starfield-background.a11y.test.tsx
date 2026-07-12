import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { StarfieldBackground } from ".";

expect.extend(toHaveNoViolations);

describe("StarfieldBackground accessibility", () => {
  it("has no axe violations for a hero composition", async () => {
    const { container } = render(
      <main aria-label="StarfieldBackground smoke">
        <StarfieldBackground tone="primary">
          <div>
            <h1>Built for what ships next</h1>
            <p>An expansive launch surface with calm parallax depth.</p>
            <Button>Reserve access</Button>
          </div>
        </StarfieldBackground>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("hides the decorative layer from assistive technology", () => {
    const { container } = render(
      <StarfieldBackground>
        <h1>Readable hero</h1>
      </StarfieldBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="starfield-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("marks the star SVGs as unfocusable", () => {
    const { container } = render(<StarfieldBackground />);

    for (const svg of container.querySelectorAll("svg")) {
      expect(svg).toHaveAttribute("focusable", "false");
    }
  });

  it("keeps children reachable by role", () => {
    render(
      <StarfieldBackground>
        <h1>Reachable heading</h1>
        <Button>Reachable action</Button>
      </StarfieldBackground>,
    );

    expect(
      screen.getByRole("heading", { name: "Reachable heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reachable action" }),
    ).toBeInTheDocument();
  });
});
