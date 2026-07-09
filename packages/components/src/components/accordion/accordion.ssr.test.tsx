import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Accordion,
  AccordionBlade,
  AccordionBladeIcon,
  AccordionBladeText,
  AccordionContent,
  AccordionItem,
} from ".";

function Icon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M5 3h6v10H5z" />
    </svg>
  );
}

describe("Accordion SSR", () => {
  it("renders closed accordion markup on the server", () => {
    const markup = renderToString(
      <Accordion aria-label="Sections" motionPreset="none">
        <AccordionItem value="one">
          <AccordionBlade>
            <AccordionBladeText>One</AccordionBladeText>
          </AccordionBlade>
          <AccordionContent>One panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(markup).toContain('data-slot="accordion"');
    expect(markup).toContain('data-orientation="vertical"');
    expect(markup).toContain('data-slot="accordion-blade"');
    expect(markup).toContain('data-state="closed"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("hidden");
  });

  it("renders default open content and icon state on the server", () => {
    const markup = renderToString(
      <Accordion defaultValue="two" motionPreset="none">
        <AccordionItem value="one">
          <AccordionBlade>One</AccordionBlade>
          <AccordionContent>One panel</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionBlade>
            <AccordionBladeIcon>
              <Icon />
            </AccordionBladeIcon>
            <AccordionBladeText>Two</AccordionBladeText>
          </AccordionBlade>
          <AccordionContent>Two panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('data-slot="accordion-blade-icon"');
    expect(markup).toContain('data-state="open"');
    expect(markup).toContain("Two panel");
  });
});
