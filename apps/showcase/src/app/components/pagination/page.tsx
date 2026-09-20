import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { PaginationBasic } from "@/examples/pagination/basic";
import { PaginationLinkMode } from "@/examples/pagination/link-mode";
import { PaginationResponsiveCard } from "@/examples/pagination/responsive-card";
import { PaginationTableFooter } from "@/examples/pagination/table-footer";
import { paginationProps } from "@/lib/props/pagination";

export const metadata: Metadata = {
  title: "Pagination",
  description: "Let users move between pages of results.",
};

export default function PaginationPage() {
  return (
    <DocsPage
      name="Pagination"
      description="Let users move between pages of results."
    >
      <InstallationSection
        registryName="pagination"
        importCode={`import {
  Pagination,
  getPaginationRenderItems,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="pagination/basic.tsx"
            title="Bounded callback controls"
            description="Known totals expose previous, next, first, last, current-page state, and deterministic ellipses."
          >
            <PaginationBasic />
          </ExampleBlock>
          <ExampleBlock
            file="pagination/link-mode.tsx"
            title="Route-backed links"
            description="When pages have stable URLs, generated controls render native anchors."
          >
            <PaginationLinkMode />
          </ExampleBlock>
          <ExampleBlock
            file="pagination/responsive-card.tsx"
            title="Narrow and RTL"
            description="Small hosts collapse to Back/Next controls while preserving logical RTL placement for the page summary."
          >
            <PaginationResponsiveCard />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          wide
          file="pagination/table-footer.tsx"
          title="Table footer"
          description="Pagination composes beside row-count copy without owning table state, page size, or fetching."
        >
          <PaginationTableFooter />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="guides"
        title="Guides"
        description="Choose the mode that matches the data source and route model."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [
              "Callback mode",
              "Use onPageChange when the current page lives in client state, a table model, or a server action wrapper.",
            ],
            [
              "Link mode",
              "Use hrefForPage for route-backed results so browser navigation, copy-link, and server rendering keep native anchor behavior.",
            ],
            [
              "Unbounded mode",
              "Omit pageCount and pass hasNextPage for cursor-backed APIs that can page forward but do not know the final page.",
            ],
            [
              "Responsive layout",
              "Pagination adapts to its own container width: small hosts use a Back/Next fallback, and larger hosts restore the normal page window.",
            ],
          ].map(([title, body]) => (
            <section
              key={title}
              className="border-border bg-muted/30 rounded-lg border p-4"
            >
              <h3 className="text-foreground text-sm font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {body}
              </p>
            </section>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Pagination renders a nav landmark and generated controls by default, with compound anatomy available for custom composition."
      >
        <PropsTable caption="Pagination props" rows={paginationProps} />
      </DocsSection>
    </DocsPage>
  );
}
