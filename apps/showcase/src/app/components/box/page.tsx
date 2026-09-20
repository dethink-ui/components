import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { BoxBasic } from "@/examples/box/basic";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { boxProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Box",
  description:
    "Wrap content with spacing, a background, a border, or rounded corners.",
};

export default function BoxPage() {
  return (
    <DocsPage
      name="Box"
      description="Wrap content with spacing, a background, a border, or rounded corners."
    >
      <InstallationSection
        registryName="box"
        importCode={`import { Box } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <ExampleBlock
          file="box/basic.tsx"
          title="Surfaces, borders, and radius"
          description="Every surface pairs a background with a readable foreground from the token system."
        >
          <BoxBasic />
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
        <PropsTable caption="Box props" rows={boxProps} />
      </DocsSection>
    </DocsPage>
  );
}
