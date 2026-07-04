import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { FlexBasic } from "@/examples/flex/basic";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { flexProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Flex",
  description:
    "Full flexbox control with tokenized gaps and per-item grow, shrink, and basis through FlexItem.",
};

export default function FlexPage() {
  return (
    <DocsPage
      name="Flex"
      description="When Stack isn't enough: the full flexbox axis — direction, wrap, alignment, distribution — with tokenized gaps, plus FlexItem for per-child grow, shrink, and basis without arbitrary classes."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <ExampleBlock
          file="flex/basic.tsx"
          title="Grow"
          description="Two fixed items around a FlexItem with grow=1 taking the remaining space."
        >
          <FlexBasic />
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
        registryName="flex"
        importCode={`import { Flex, FlexItem } from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <PropsTable caption="Flex and FlexItem props" rows={flexProps} />
      </DocsSection>
    </DocsPage>
  );
}
