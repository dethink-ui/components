import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { BarListCountries } from "@/examples/bar-list/countries";
import { BarListSources } from "@/examples/bar-list/sources";
import { BarListTopPages } from "@/examples/bar-list/top-pages";
import { barListProps } from "@/lib/props/bar-list";

export const metadata: Metadata = {
  title: "Bar List",
  description:
    "Ranked horizontal bars for top pages, sources, countries and other categories.",
};

export default function BarListPage() {
  return (
    <DocsPage
      name="Bar List"
      description="The fastest way to answer “which ones matter most?”. Labels sit on the bars, values align on the right, and long lists fold behind Show more."
    >
      <InstallationSection
        registryName="bar-list"
        importCode={'import { BarList } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Linked top pages with a limit, clickable sources on a shared percent scale, and currency values with icons."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="bar-list/top-pages.tsx"
            title="Top pages"
            description="Rows link to detail views. Long paths truncate with the full text available on hover and to assistive technology."
          >
            <BarListTopPages />
          </ExampleBlock>
          <ExampleBlock
            file="bar-list/sources.tsx"
            title="Filter by source"
            description="onItemClick turns rows into buttons. The selected source takes its own palette slot, and max={1} puts shares on a common scale."
          >
            <BarListSources />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="bar-list/countries.tsx"
            title="Currency, icons and sort order"
            description="Values format compactly as currency. Ascending sort surfaces the smallest markets first."
          >
            <BarListCountries />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="BarList props" rows={barListProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          BarList is a list: each row reads its label and value, and the bar is
          decorative because the value is always visible as text. Name the list
          with aria-label or aria-labelledby. Link and button rows are single
          tab stops with a visible focus ring. The Show more button reports its
          state with aria-expanded and controls the list. Values stay
          left-to-right in right-to-left layouts, and bars grow from the start
          edge.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
