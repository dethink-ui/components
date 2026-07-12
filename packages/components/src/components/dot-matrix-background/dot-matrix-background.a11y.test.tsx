import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { DotMatrixBackground } from ".";

expect.extend(toHaveNoViolations);

describe("DotMatrixBackground accessibility", () => {
  it("has no axe violations for a hero composition", async () => {
    const { container } = render(
      <main aria-label="DotMatrixBackground smoke">
        <DotMatrixBackground tone="primary">
          <div>
            <h1>Feel the compute behind every answer</h1>
            <p>AI-native surfaces with calm, ambient activity.</p>
            <Button>Try the model</Button>
          </div>
        </DotMatrixBackground>
      </main>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("hides the decorative layer from assistive technology", () => {
    const { container } = render(
      <DotMatrixBackground>
        <h1>Readable hero</h1>
      </DotMatrixBackground>,
    );

    const layer = container.querySelector(
      '[data-slot="dot-matrix-background-layer"]',
    );
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
    expect(
      layer?.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
    ).toHaveLength(0);
  });

  it("keeps children reachable by role", () => {
    render(
      <DotMatrixBackground>
        <h1>Reachable heading</h1>
        <Button>Reachable action</Button>
      </DotMatrixBackground>,
    );

    expect(
      screen.getByRole("heading", { name: "Reachable heading" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reachable action" }),
    ).toBeInTheDocument();
  });
});
