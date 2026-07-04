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
  description:
    "Divide content horizontally or vertically with tone, thickness, spacing, and correct semantics.",
};

export default function SeparatorPage() {
  return (
    <DocsPage
      name="Separator"
      description="A rule with intent: horizontal or vertical, three tones, two thicknesses, tokenized spacing — and decorative by default so purely visual rules stay out of the accessibility tree. Divider is an alias."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        registryName="separator"
        importCode={`import { Separator } from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <PropsTable caption="Separator props" rows={separatorProps} />
      </DocsSection>
    </DocsPage>
  );
}
