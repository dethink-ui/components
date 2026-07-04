import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TableBasic } from "@/examples/table/basic";
import { TableDensity } from "@/examples/table/density";
import { TableRecipeInvoice } from "@/examples/table/recipe-invoice";
import { tableProps } from "@/lib/props/table";

export const metadata: Metadata = {
  title: "Table",
  description:
    "Present static data with composable, semantic table anatomy: alignment, density, tones, caption, and footer.",
};

export default function TablePage() {
  return (
    <DocsPage
      name="Table"
      description="Real table elements with tokenized styling: header, body, footer, rows, cells, and caption compose freely, with alignment and density props where they matter. For sorting, filtering, selection, and pagination, reach for DataTable — this is the presentational foundation it builds on."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="table/basic.tsx"
            title="Basic"
            description="Caption, header, and body with an end-aligned numeric column."
          >
            <TableBasic />
          </ExampleBlock>
          <ExampleBlock
            file="table/density.tsx"
            title="Density"
            description="compact for dashboards, comfortable for reading-heavy tables."
          >
            <TableDensity />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="table/recipe-invoice.tsx"
          title="Invoice"
          description="Numeric columns right-aligned with tabular numerals, a muted tone for the secondary usage line, and the computed total in a real TableFooter."
        >
          <TableRecipeInvoice />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="table"
        importCode={`import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Every part renders its native table element, so standard table attributes apply throughout."
      >
        <PropsTable caption="Table anatomy" rows={tableProps} />
      </DocsSection>
    </DocsPage>
  );
}
