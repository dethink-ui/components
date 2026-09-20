import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { GridBasic } from "@/examples/grid/basic";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { gridProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Grid",
  description: "Arrange content in rows and columns.",
};

export default function GridPage() {
  return (
    <DocsPage name="Grid" description="Arrange content in rows and columns.">
      <InstallationSection
        registryName="grid"
        importCode={`import { Grid, GridItem } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <ExampleBlock
          file="grid/basic.tsx"
          title="Columns and spans"
          description="A three-column grid with colSpan=2 and colSpan=full cells."
        >
          <GridBasic />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Combine the layout components to build a dashboard."
      >
        <ExampleBlock
          file="layout/recipe-dashboard.tsx"
          title="Dashboard skeleton"
          description="Container centers, Flex lays out the header, Grid places the tiles, Stack handles rhythm, Separator divides, and Box provides every surface."
        >
          <LayoutRecipeDashboard />
        </ExampleBlock>
      </DocsSection>

      <DocsSection id="props" title="Props">
        <PropsTable caption="Grid and GridItem props" rows={gridProps} />
      </DocsSection>
    </DocsPage>
  );
}
