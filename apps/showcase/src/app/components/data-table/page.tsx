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
    "Sort, filter, select, and paginate row data with column definitions, empty/loading/error states, and server-driven modes.",
};

export default function DataTablePage() {
  return (
    <DocsPage
      name="DataTable"
      description="The data-heavy workhorse: TanStack-style column definitions drive sortable headers, global and per-column filtering, row selection with select-all, pagination, and loading/empty/error states — all controllable for server-driven data, all rendered on the semantic Table foundation."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Headers are real buttons — sort with Enter or Space."
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="data-table/recipe-ops-dashboard.tsx"
          title="Incident dashboard with bulk actions"
          description="Sorting, filtering, multi-select, and pagination working together: select incidents across the filtered set, acknowledge them in bulk, and a live region confirms the change."
        >
          <DataTableRecipeOpsDashboard />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="data-table"
        importCode={`import {
  DataTable,
  type DataTableColumnDef,
} from "@dethink/components";`}
      />

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
