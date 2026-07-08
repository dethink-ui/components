import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { HorizontalAccordion } from "./horizontal-accordion";

expect.extend(toHaveNoViolations);

function StarIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 16 16" width="16">
      <path d="m8 1 2.06 4.17L14.7 5.8l-3.35 3.27.79 4.61L8 11.51l-4.14 2.17.79-4.61L1.3 5.8l4.64-.63L8 1Z" />
    </svg>
  );
}

describe("HorizontalAccordion accessibility", () => {
  it("has no axe violations with mixed blade content", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <HorizontalAccordion
          aria-label="Product sections"
          defaultValue="overview"
        >
          <HorizontalAccordion.Item value="overview">
            <HorizontalAccordion.Blade>
              <HorizontalAccordion.BladeLabel>
                Overview
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <p>Overview panel content.</p>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
          <HorizontalAccordion.Item value="details">
            <HorizontalAccordion.Blade aria-label="Details">
              <HorizontalAccordion.BladeIcon>
                <StarIcon />
              </HorizontalAccordion.BladeIcon>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <p>Details panel content.</p>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
          <HorizontalAccordion.Item value="pricing">
            <HorizontalAccordion.Blade disabled>
              <HorizontalAccordion.BladeIcon>
                <StarIcon />
              </HorizontalAccordion.BladeIcon>
              <HorizontalAccordion.BladeLabel orientation="vertical">
                Pricing
              </HorizontalAccordion.BladeLabel>
            </HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <p>Pricing panel content.</p>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        </HorizontalAccordion>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations with no active item", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <HorizontalAccordion aria-label="Collapsed sections">
          <HorizontalAccordion.Item value="one">
            <HorizontalAccordion.Blade>One</HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <p>One panel content.</p>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
          <HorizontalAccordion.Item value="two">
            <HorizontalAccordion.Blade>Two</HorizontalAccordion.Blade>
            <HorizontalAccordion.Panel>
              <p>Two panel content.</p>
            </HorizontalAccordion.Panel>
          </HorizontalAccordion.Item>
        </HorizontalAccordion>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
