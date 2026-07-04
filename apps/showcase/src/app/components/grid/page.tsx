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
  description:
    "Two-dimensional layouts with tokenized tracks and gaps, plus per-cell spans through GridItem.",
};

export default function GridPage() {
  return (
    <DocsPage
      name="Grid"
      description="CSS grid with tokens: column and row counts, tokenized gaps, alignment, and GridItem for column and row spans — the tile-layout workhorse for dashboards and galleries."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        registryName="grid"
        importCode={`import { Grid, GridItem } from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <PropsTable caption="Grid and GridItem props" rows={gridProps} />
      </DocsSection>
    </DocsPage>
  );
}
