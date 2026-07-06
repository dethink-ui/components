import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { BreadcrumbBasic } from "@/examples/breadcrumb/basic";
import { BreadcrumbOverflowExample } from "@/examples/breadcrumb/overflow";
import { BreadcrumbRecipePageHeader } from "@/examples/breadcrumb/recipe-page-header";
import { BreadcrumbRouter } from "@/examples/breadcrumb/router";
import { breadcrumbProps } from "@/lib/props/breadcrumb";

export const metadata: Metadata = {
  title: "Breadcrumb",
  description:
    "Location hierarchy navigation with current-page semantics, overflow, and router composition.",
};

export default function BreadcrumbPage() {
  return (
    <DocsPage
      name="Breadcrumb"
      description="A labelled navigation landmark for page hierarchy. Use it to show where a user is, expose parent-page links, and keep long object paths reachable through overflow."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="breadcrumb/basic.tsx"
            title="Sizes and separators"
            description="Use chevrons, slashes, dots, and size variants to match headers and compact toolbars."
          >
            <BreadcrumbBasic />
          </ExampleBlock>
          <ExampleBlock
            file="breadcrumb/overflow.tsx"
            title="Collapsed overflow"
            description="Long data-driven paths collapse hidden ancestors behind a labelled Popover trigger."
          >
            <BreadcrumbOverflowExample />
          </ExampleBlock>
          <ExampleBlock
            file="breadcrumb/router.tsx"
            title="Router composition"
            description="asChild merges BreadcrumbLink styling onto framework router links."
          >
            <BreadcrumbRouter />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="breadcrumb/recipe-page-header.tsx"
          title="Object detail header"
          description="Breadcrumb fits above a detail title and actions without owning page-header layout."
          wide
        >
          <BreadcrumbRecipePageHeader />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="breadcrumb"
        importCode={`import { Breadcrumb } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Breadcrumb renders a nav landmark and either data-driven items or compound children."
      >
        <PropsTable caption="Breadcrumb props" rows={breadcrumbProps} />
      </DocsSection>
    </DocsPage>
  );
}
