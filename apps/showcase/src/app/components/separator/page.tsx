import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { LayoutRecipeDashboard } from "@/examples/layout/recipe-dashboard";
import { SeparatorBasic } from "@/examples/separator/basic";
import { separatorProps } from "@/lib/props/layout";

export const metadata: Metadata = {
  title: "Separator",
  description: "Add a horizontal or vertical line between sections.",
};

export default function SeparatorPage() {
  return (
    <DocsPage
      name="Separator"
      description="Add a horizontal or vertical line between sections."
    >
      <InstallationSection
        registryName="separator"
        importCode={`import { Separator } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <ExampleBlock
          file="separator/basic.tsx"
          title="Orientations and tones"
          description="Horizontal rules with spacing, vertical dividers in a row of links, and a strong two-pixel variant."
        >
          <SeparatorBasic />
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
        <PropsTable caption="Separator props" rows={separatorProps} />
      </DocsSection>
    </DocsPage>
  );
}
