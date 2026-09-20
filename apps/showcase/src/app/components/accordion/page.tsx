import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { AccordionBasic } from "@/examples/accordion/basic";
import { AccordionControlled } from "@/examples/accordion/controlled";
import { AccordionMultiple } from "@/examples/accordion/multiple";
import { accordionPartProps, accordionProps } from "@/lib/props/accordion";

export const metadata: Metadata = {
  title: "Accordion",
  description: "Let users expand and collapse sections of content.",
};

export default function AccordionPage() {
  return (
    <DocsPage
      name="Accordion"
      description="Let users expand and collapse sections of content."
    >
      <InstallationSection
        registryName="accordion"
        importCode={`import { Accordion } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Use Tab to reach blades, Enter or Space to toggle, and ArrowUp/ArrowDown/Home/End to move through enabled blades."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="accordion/basic.tsx"
            title="Basic"
            description="Single mode opens one rounded blade at a time. Clicking the open blade closes it because collapsible defaults to true."
            wide
          >
            <AccordionBasic />
          </ExampleBlock>
          <ExampleBlock
            file="accordion/multiple.tsx"
            title="Multiple open"
            description="Multiple mode keeps opened blades open until each blade is clicked again."
            wide
          >
            <AccordionMultiple />
          </ExampleBlock>
          <ExampleBlock
            file="accordion/controlled.tsx"
            title="Controlled"
            description="Drive the open value from external state and use forceMount to preserve content state while closed."
            wide
          >
            <AccordionControlled />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Accordion renders a div root. Items render rounded blade containers, blades render native buttons, and content renders labelled regions. Every part accepts className and exposes data-slot, data-state, data-disabled, data-motion-preset, and data-orientation attributes."
      >
        <div className="space-y-8">
          <PropsTable caption="Accordion props" rows={accordionProps} />
          <PropsTable caption="Part props" rows={accordionPartProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
