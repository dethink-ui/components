import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  HorizontalAccordion,
  HorizontalAccordionBlade,
  HorizontalAccordionBladeIcon,
  HorizontalAccordionBladeLabel,
  HorizontalAccordionItem,
  HorizontalAccordionPanel,
} from ".";

function Icon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M2 8h12" />
    </svg>
  );
}

describe("HorizontalAccordion SSR", () => {
  it("renders collapsed accordion markup on the server", () => {
    const markup = renderToString(
      <HorizontalAccordion aria-label="Sections">
        <HorizontalAccordionItem value="one">
          <HorizontalAccordionBlade>
            <HorizontalAccordionBladeLabel>One</HorizontalAccordionBladeLabel>
          </HorizontalAccordionBlade>
          <HorizontalAccordionPanel>One panel</HorizontalAccordionPanel>
        </HorizontalAccordionItem>
      </HorizontalAccordion>,
    );

    expect(markup).toContain('data-slot="horizontal-accordion"');
    expect(markup).toContain('data-slot="horizontal-accordion-blade"');
    expect(markup).toContain('data-layout="default"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("hidden");
  });

  it("renders the default active item and active layer on the server", () => {
    const markup = renderToString(
      <HorizontalAccordion defaultValue="two">
        <HorizontalAccordionItem value="one">
          <HorizontalAccordionBlade>
            <HorizontalAccordionBladeIcon>
              <Icon />
            </HorizontalAccordionBladeIcon>
            <HorizontalAccordionBladeLabel>One</HorizontalAccordionBladeLabel>
          </HorizontalAccordionBlade>
          <HorizontalAccordionPanel>One panel</HorizontalAccordionPanel>
        </HorizontalAccordionItem>
        <HorizontalAccordionItem value="two">
          <HorizontalAccordionBlade>
            <HorizontalAccordionBladeLabel>Two</HorizontalAccordionBladeLabel>
          </HorizontalAccordionBlade>
          <HorizontalAccordionPanel>Two panel</HorizontalAccordionPanel>
        </HorizontalAccordionItem>
      </HorizontalAccordion>,
    );

    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain(
      'data-slot="horizontal-accordion-blade-active-layer"',
    );
    expect(markup).toContain("Two panel");
  });
});
