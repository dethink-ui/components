import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { StackBasic } from "@/examples/stack/basic";
import { stackProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Stack",
  description: "Arrange content in a row or column with even spacing.",
};

export default function StackPage() {
  return (
    <DocsPage
      name="Stack"
      description="Arrange content in a row or column with even spacing."
    >
      <InstallationSection
        registryName="stack"
        importCode={`import { Stack } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <ExampleBlock
          file="stack/basic.tsx"
          title="Direction, gap, and alignment"
          description="Vertical rhythm on the left; a horizontal row with space-between on the right."
        >
          <StackBasic />
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
        <PropsTable caption="Stack props" rows={stackProps} />
      </DocsSection>
    </DocsPage>
  );
}
