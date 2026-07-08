import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { HeroTextAnimation, HeroTextAnimationProvider } from ".";

expect.extend(toHaveNoViolations);

describe("HeroTextAnimation accessibility", () => {
  it("has no axe violations for semantic heading and reduced-motion states", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <HeroTextAnimationProvider reducedMotion="always">
          <main aria-label="Hero text animation accessibility smoke">
            <HeroTextAnimation text="Build production-ready landing pages faster." />
            <HeroTextAnimation
              as="h2"
              splitBy="line"
              text={"Launch faster.\nLearn from every release."}
            />
          </main>
        </HeroTextAnimationProvider>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
