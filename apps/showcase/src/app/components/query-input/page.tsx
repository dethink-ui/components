import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { QueryInputIssueQuery } from "@/examples/query-input/issue-query";
import {
  filterQueryCoreProps,
  filterQuerySyntax,
  queryInputProps,
} from "@/lib/props/query-input";

export const metadata: Metadata = {
  title: "QueryInput",
  description:
    "A one-line filter query with autocomplete, token colors and exact error ranges, in sync with FilterBar chips.",
};

export default function QueryInputPage() {
  return (
    <DocsPage
      name="QueryInput"
      description="Type a filter instead of clicking it: status:open created:>-7d (assignee:ada OR labels:bug). The text and the chips edit the same filter, so people can switch between them without losing anything. Invalid text is underlined where it goes wrong and never changes the filter."
    >
      <InstallationSection
        registryName="query-input"
        importCode={`import {
  FilterBar,
  QueryInput,
  useFilterState,
} from "@dethink/components";`}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Type in the box, or edit a chip. Press Enter or leave the box to apply."
      >
        <ExampleBlock
          wide
          file="query-input/issue-query.tsx"
          title="Text and chips on one filter"
          description="Start typing a field name for suggestions, then pick a value. Try labels:bug estimate:>=5, or customer:yes OR assignee:lin. Remove a chip and the text follows; press Escape twice to throw away an edit."
        >
          <QueryInputIssueQuery />
        </ExampleBlock>
      </DocsSection>
      <DocsSection
        id="syntax"
        title="Syntax"
        description="Field keys go before the colon, then an optional operator token, then the value. Quote values with spaces or punctuation."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Query
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Means
                </th>
              </tr>
            </thead>
            <tbody>
              {filterQuerySyntax.map((row) => (
                <tr key={row.syntax} className="border-t">
                  <td className="px-4 py-2 font-mono whitespace-nowrap">
                    {row.syntax}
                  </td>
                  <td className="text-muted-foreground px-4 py-2">
                    {row.meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable caption="QueryInput props" rows={queryInputProps} />
          <PropsTable caption="Text query core" rows={filterQueryCoreProps} />
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The box is an ARIA combobox with a list of suggestions. ArrowDown
            and ArrowUp move through suggestions, Enter picks one (or applies
            the query when none is active), and Escape closes the list, then
            throws away the edit. Suggestions keep focus in the box.
          </p>
          <p>
            Colors come from an overlay that is hidden from assistive tech;
            screen readers read the plain text. When a query can&rsquo;t be
            applied the box is marked invalid, the message is announced and
            linked as its description, and the problem range is underlined.
          </p>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
