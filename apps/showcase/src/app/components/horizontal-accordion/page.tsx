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
  description: "Keep every section in reach while giving one room to shine.",
};

export default function HorizontalAccordionPage() {
  return (
    <DocsPage
      name="HorizontalAccordion"
      description="Keep every section in reach while giving one room to shine. A focused workspace for project overviews, activity, and everyday actions."
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
            title="Project command centre"
            description="Four sections, one workspace. Follow the project, filter activity, preview documents, or assign a review lead. Your choices survive switching panels. defaultValue and collapsible={false} keep the workspace open."
          >
            <HorizontalAccordionBasic />
          </ExampleBlock>
          <ExampleBlock
            file="horizontal-accordion/controlled.tsx"
            wide
            title="Controlled checklist"
            description="Move between delivery phases with external controls. Completed steps stay checked, and collapsing the checklist leaves a compact tray with a clear next step."
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
            description="A working inbox in a narrow container. Archive and restore messages; blade counts stay in sync. Below compactBreakpoint the panel moves above a touch-friendly tray, regardless of viewport size."
          >
            <HorizontalAccordionCompact />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="guidance"
        title="Choosing the right layout"
        description="Use a horizontal accordion for a small set of related sections when people benefit from seeing every destination at once."
      >
        <ul className="text-muted-foreground list-disc space-y-3 ps-5 text-sm leading-6">
          <li>
            Start persistent workspaces with defaultValue and collapsible=false.
            Keep collapse optional for supplementary information and give the
            collapsed state an intentional height or instruction.
          </li>
          <li>
            Keep blade labels short. Compose counts or status with ordinary
            elements and include their meaning in the blade's accessible name.
            Avoid nested buttons or links inside a blade.
          </li>
          <li>
            Choose compactBreakpoint for the space your content needs,
            especially with four or more blades. For long content, give Panel
            overflow-y-auto and check keyboard access to everything inside.
          </li>
          <li>
            Arrow keys move focus; Enter or Space opens the focused section.
            Home and End reach the first and last enabled blades. Inactive
            panels preserve state by default and are inert during exit.
          </li>
          <li>
            Use Tabs for frequent comparisons with short labels, or Accordion
            for long reading sections. Test translated labels, RTL, reduced
            motion, zoom, and your target screen readers.
          </li>
        </ul>
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
