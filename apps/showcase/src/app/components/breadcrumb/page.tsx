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
  description: "Show where the current page sits in the site hierarchy.",
};

export default function BreadcrumbPage() {
  return (
    <DocsPage
      name="Breadcrumb"
      description="Show where the current page sits in the site hierarchy."
    >
      <InstallationSection
        registryName="breadcrumb"
        importCode={`import { Breadcrumb } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
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
        description="Examples that combine components for common tasks."
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
