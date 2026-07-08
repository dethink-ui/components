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
            <HeroTextAnimation
              animation="masked-curtain"
              as="h2"
              text={"Reveal clearly.\nStay readable."}
            />
            <HeroTextAnimation
              animation="typewriter"
              as="h2"
              text="Type concise launch copy once."
            />
            <HeroTextAnimation
              animation="scramble-decrypt"
              as="p"
              text="Decrypt concise launch copy once."
            />
            <HeroTextAnimation
              animation="rotating-keyword"
              as="h2"
              rotatingKeywordOptions={["finance", "support", "sales"]}
              rotatingKeywordPrefix="Build dashboards for "
              rotatingKeywordSuffix=" teams."
              text="Build dashboards for every revenue team."
            />
            <HeroTextAnimation
              animation="gradient-highlight"
              as="h2"
              text="Highlight the most important launch promise."
            />
            <HeroTextAnimation
              animation="blur-focus"
              as="h2"
              text="Bring the launch promise into focus."
            />
          </main>
        </HeroTextAnimationProvider>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for gradient highlight in dark theme", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <HeroTextAnimationProvider>
          <main aria-label="Gradient highlight dark accessibility smoke">
            <HeroTextAnimation
              animation="gradient-highlight"
              text="Keep highlighted hero copy readable in dark mode."
            />
          </main>
        </HeroTextAnimationProvider>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for blur focus in dark theme", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <HeroTextAnimationProvider>
          <main aria-label="Blur focus dark accessibility smoke">
            <HeroTextAnimation
              animation="blur-focus"
              text="Keep focused hero copy readable in dark mode."
            />
          </main>
        </HeroTextAnimationProvider>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
