import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { HorizontalAccordionBasic } from "@/examples/horizontal-accordion/basic";
import { HorizontalAccordionBladeContent } from "@/examples/horizontal-accordion/blade-content";
import { HorizontalAccordionCompact } from "@/examples/horizontal-accordion/compact";
import { HorizontalAccordionControlled } from "@/examples/horizontal-accordion/controlled";
import {
  horizontalAccordionPartProps,
  horizontalAccordionProps,
} from "@/lib/props/horizontal-accordion";

export const metadata: Metadata = {
  title: "HorizontalAccordion",
  description: "Expand one panel at a time in a horizontal row.",
};

export default function HorizontalAccordionPage() {
  return (
    <DocsPage
      name="HorizontalAccordion"
      description="Expand one panel at a time in a horizontal row."
    >
      <InstallationSection
        registryName="horizontal-accordion"
        importCode={`import { HorizontalAccordion } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Focus a blade and use Arrow, Home, and End keys to navigate; Enter or Space activates."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="horizontal-accordion/basic.tsx"
            wide
            title="Basic"
            description="Uncontrolled with defaultValue. Clicking the active blade collapses it because collapsible defaults to true."
          >
            <HorizontalAccordionBasic />
          </ExampleBlock>
          <ExampleBlock
            file="horizontal-accordion/controlled.tsx"
            wide
            title="Controlled"
            description="Drive the active section from external state with value and onValueChange; pass undefined to collapse everything."
          >
            <HorizontalAccordionControlled />
          </ExampleBlock>
          <ExampleBlock
            file="horizontal-accordion/blade-content.tsx"
            wide
            title="Blade content"
            description="Blades compose freely: rotated or vertical labels, icon-only blades with an aria-label, and icon-plus-label mixes with iconPosition."
          >
            <HorizontalAccordionBladeContent />
          </ExampleBlock>
          <ExampleBlock
            file="horizontal-accordion/compact.tsx"
            title="Compact layout"
            description="Below compactBreakpoint (measured on the container, not the viewport) the active panel moves above a horizontal blade tray and labels flatten."
          >
            <HorizontalAccordionCompact />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="HorizontalAccordion renders a div and accepts all native div attributes. Blades render real buttons with aria-expanded and aria-controls; panels are labelled regions hidden when inactive. Every part accepts className and exposes data-slot, data-state, and data-layout attributes for styling."
      >
        <div className="space-y-8">
          <PropsTable
            caption="HorizontalAccordion props"
            rows={horizontalAccordionProps}
          />
          <PropsTable
            caption="Part props"
            rows={horizontalAccordionPartProps}
          />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
