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
    "The base layout primitive: tokenized spacing, surfaces, borders, and radius on any semantic element.",
};

export default function BoxPage() {
  return (
    <DocsPage
      name="Box"
      description="The primitive under everything: logical-property spacing (RTL-safe), tokenized surfaces with matched foregrounds, border tones, and radius — on any semantic element via as, or merged onto a child via asChild."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        registryName="box"
        importCode={`import { Box } from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <PropsTable caption="Box props" rows={boxProps} />
      </DocsSection>
    </DocsPage>
  );
}
