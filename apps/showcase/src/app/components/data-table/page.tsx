import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DataTableBasic } from "@/examples/data-table/basic";
import { DataTableRecipeOpsDashboard } from "@/examples/data-table/recipe-ops-dashboard";
import { DataTableStates } from "@/examples/data-table/states";
import { dataTableProps } from "@/lib/props/data-table";

export const metadata: Metadata = {
  title: "DataTable",
  description:
    "Display rows of data with sorting, filtering, selection, and pagination.",
};

export default function DataTablePage() {
  return (
    <DocsPage
      name="DataTable"
      description="Display rows of data with sorting, filtering, selection, and pagination."
    >
      <InstallationSection
        registryName="data-table"
        importCode={`import {
  DataTable,
  type DataTableColumnDef,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Headers are real buttons — sort with Enter or Space."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="data-table/basic.tsx"
            title="Sorting and filtering"
            description="Column defs with a custom status cell, default sort, and the global filter toolbar."
          >
            <DataTableBasic />
          </ExampleBlock>
          <ExampleBlock
            file="data-table/states.tsx"
            title="Empty, loading, and error states"
            description="The three non-data states render inside the table region and announce to assistive tech."
          >
            <DataTableStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="data-table/recipe-ops-dashboard.tsx"
          title="Incident dashboard with bulk actions"
          description="Sorting, filtering, multi-select, and pagination working together: select incidents across the filtered set, acknowledge them in bulk, and a live region confirms the change."
        >
          <DataTableRecipeOpsDashboard />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Every stateful feature is controllable (value + onChange) or uncontrolled (default value), and manual modes hand the work to your server."
      >
        <PropsTable caption="DataTable props" rows={dataTableProps} />
      </DocsSection>
    </DocsPage>
  );
}
