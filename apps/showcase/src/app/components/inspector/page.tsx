import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { InspectorBasic } from "@/examples/inspector/basic";
import { InspectorShapePanel } from "@/examples/inspector/shape-panel";
import {
  inspectorControlProps,
  inspectorProps,
  inspectorPropertyProps,
  inspectorSectionProps,
} from "@/lib/props/inspector";

export const metadata: Metadata = {
  title: "Inspector",
  description:
    "A compact, sectioned property panel for editing the current selection.",
};

export default function InspectorPage() {
  return (
    <DocsPage
      name="Inspector"
      description="Edit whatever is selected in a dense side panel. Grouped sections, compact rows, and honest validation that keeps the last good value."
    >
      <InstallationSection
        registryName="inspector"
        importCode={
          'import { Inspector, InspectorSection, InspectorProperty, InspectorNumber } from "@dethink/components";'
        }
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Controlled values, dot paths, and controls that commit when you press Enter or leave the field."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="inspector/shape-panel.tsx"
            title="Selected shape"
            description="Edit the selected card. Lock the layer to see disabled reasons, or click the card to clear the selection."
          >
            <InspectorShapePanel />
          </ExampleBlock>
          <ExampleBlock
            file="inspector/basic.tsx"
            title="Widget settings"
            description="A small panel with validation, units, and a description."
          >
            <InspectorBasic />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable caption="Inspector props" rows={inspectorProps} />
          <PropsTable
            caption="InspectorSection props"
            rows={inspectorSectionProps}
          />
          <PropsTable
            caption="InspectorProperty props"
            rows={inspectorPropertyProps}
          />
          <PropsTable
            caption="Property controls"
            rows={inspectorControlProps}
          />
        </div>
      </DocsSection>
      <DocsSection id="behavior" title="Values and commits">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Inspector is controlled and keeps no copy of your data. Each property
          reads its dot path from value. Committing a change calls onValueChange
          with an immutable copy, leaving untouched branches as they are. Text
          and number fields keep a draft while you type and commit on Enter or
          blur. Escape reverts. Invalid drafts show a message next to the field
          and never overwrite the last good value. Rows stack into one column
          when the panel is narrower than 17rem.
        </p>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Each section is a heading with a disclosure button, and its content is
          a group named by that heading. Collapsed content is inert. Property
          labels name their controls even when visually truncated, and
          descriptions, disabled reasons, and errors are wired as accessible
          descriptions. Numbers are spinbuttons that announce their unit. Give
          the panel an accessible name, for example with role=&quot;region&quot;
          and aria-label.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
