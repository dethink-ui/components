import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { StackBasic } from "@/examples/stack/basic";
import { stackProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "Space children along one axis with tokenized gaps, alignment, and wrapping.",
};

export default function StackPage() {
  return (
    <DocsPage
      name="Stack"
      description="The rhythm primitive: children flow vertically or horizontally with a tokenized gap, alignment, and optional wrapping — the 90% case of flexbox without touching flex properties."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <ExampleBlock
          file="stack/basic.tsx"
          title="Direction, gap, and alignment"
          description="Vertical rhythm on the left; a horizontal row with space-between on the right."
        >
          <StackBasic />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="One recipe shared by all six layout primitives: a dashboard skeleton with no custom CSS."
      >
        <ExampleBlock
          file="layout/recipe-dashboard.tsx"
          title="Dashboard skeleton"
          description="Container centers, Flex lays out the header, Grid places the tiles, Stack handles rhythm, Separator divides, and Box provides every surface."
        >
          <LayoutRecipeDashboard />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="stack"
        importCode={`import { Stack } from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <PropsTable caption="Stack props" rows={stackProps} />
      </DocsSection>
    </DocsPage>
  );
}
