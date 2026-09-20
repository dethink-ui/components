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
    "Arrange items with control over alignment, wrapping, and available space.",
};

export default function FlexPage() {
  return (
    <DocsPage
      name="Flex"
      description="Arrange items with control over alignment, wrapping, and available space."
    >
      <InstallationSection
        registryName="flex"
        importCode={`import { Flex, FlexItem } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
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
        description="Combine the layout components to build a dashboard."
      >
        <ExampleBlock
          file="layout/recipe-dashboard.tsx"
          title="Dashboard skeleton"
          description="Container centers, Flex lays out the header, Grid places the tiles, Stack handles rhythm, Separator divides, and Box provides every surface."
        >
          <LayoutRecipeDashboard />
        </ExampleBlock>
      </DocsSection>

      <DocsSection id="props" title="Props">
        <PropsTable caption="Flex and FlexItem props" rows={flexProps} />
      </DocsSection>
    </DocsPage>
  );
}
