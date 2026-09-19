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
  description:
    "Navigate bounded and unbounded result sets with accessible page controls, route-backed links, compact layout, and RTL-safe icons.",
};

export default function PaginationPage() {
  return (
    <DocsPage
      name="Pagination"
      description="A labelled navigation landmark for result sets, audit logs, tables, and search pages. It owns deterministic page windows, current-page semantics, disabled boundaries, route-backed links, and compact responsive layout without owning data fetching or page-size controls."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
            description="Real page URLs with in-place navigation: the selected page follows the URL, browser Back/Forward works, and changing pages preserves your scroll position."
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
        description="Production-shaped compositions that go beyond exercising props."
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

      <InstallationSection
        registryName="pagination"
        importCode={`import {
  Pagination,
  getPaginationRenderItems,
} from "@dethink/components";`}
      />

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
              "Use hrefForPage for real URLs. Integrate your router to avoid document reloads. This local-state demo uses Next.js history integration; server-backed results should navigate through the router with scrolling disabled.",
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
