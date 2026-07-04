import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ContainerBasic } from "@/examples/container/basic";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { containerProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Container",
  description:
    "Center page content at tokenized max widths with responsive gutters.",
};

export default function ContainerPage() {
  return (
    <DocsPage
      name="Container"
      description="The page-width primitive: a centered max-width with gutter control, on any semantic element. Every docs page you are reading sits inside one."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <ExampleBlock
          file="container/basic.tsx"
          title="Sizes"
          description="Each size is a tokenized max width; gutters keep content off the viewport edges."
        >
          <ContainerBasic />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="One recipe shared by all six layout primitives: a dashboard skeleton with no custom CSS."
      >
        <ExampleBlock
          file="layout/recipe-dashboard.tsx"
          title="Dashboard skeleton"
          description="Container centers, Flex lays out the header, Grid places the tiles, Stack handles rhythm, Separator divides, and Box provides every surface."
        >
          <LayoutRecipeDashboard />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="container"
        importCode={`import { Container } from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <PropsTable caption="Container props" rows={containerProps} />
      </DocsSection>
    </DocsPage>
  );
}
