import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { FilterBarIssueTable } from "@/examples/filter-bar/issue-table";
import { FilterBarOneModel } from "@/examples/filter-bar/one-model";
import {
  filterBarProps,
  filterCoreProps,
  filterFieldProps,
} from "@/lib/props/filter-bar";

export const metadata: Metadata = {
  title: "FilterBar",
  description:
    "Filter chips with typed operators, built on one serializable filter model that plugs into DataTable.",
};

export default function FilterBarPage() {
  return (
    <DocsPage
      name="FilterBar"
      description="Narrow a list with filters that read as sentences. Each chip is field, operator, and value, and every part can be edited in place. The chips edit one plain-JSON filter model, so the same filter can drive a table, a URL, or a server query."
    >
      <InstallationSection
        registryName="filter-bar"
        importCode={`import {
  FilterBar,
  createFilterPredicate,
  defineFilterFields,
  useFilterState,
} from "@dethink/components";`}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Add a filter, then click any part of a chip to change it."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="filter-bar/issue-table.tsx"
            title="Filtering a DataTable"
            description="The bar sits in the table's toolbar and createFilterPredicate filters the rows. Press F to add a filter, use the arrow keys to move between chip parts, Backspace to remove a chip, and Ctrl or Cmd+Z to undo."
          >
            <FilterBarIssueTable />
          </ExampleBlock>
          <ExampleBlock
            file="filter-bar/one-model.tsx"
            title="One filter model"
            description="The chips edit a plain JSON tree. describeFilter turns it into the sentence screen readers hear."
          >
            <FilterBarOneModel />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable caption="FilterBar props" rows={filterBarProps} />
          <PropsTable caption="FilterField" rows={filterFieldProps} />
          <PropsTable caption="Filter core" rows={filterCoreProps} />
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The chips sit in a toolbar with a single tab stop. Arrow keys move
            between chip parts, Home and End jump to the ends, and the direction
            flips in right-to-left layouts. Backspace or Delete removes the
            focused chip and moves focus to the next one. Cmd or Ctrl+Z undoes
            and Shift+Cmd or Ctrl+Z redoes.
          </p>
          <p>
            Each chip is a group named with its full sentence, such as
            &ldquo;Status is any of Open, Blocked&rdquo;, and the toolbar is
            described by the sentence for the whole filter. Editors open in
            popovers that take focus, close with Escape, and return focus to the
            part that opened them. Pass resultCount to announce the number of
            matches politely.
          </p>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
