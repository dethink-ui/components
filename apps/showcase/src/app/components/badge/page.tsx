import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { BadgeIcons } from "@/examples/badge/icons";
import { BadgeStatusList } from "@/examples/badge/recipe-status-list";
import { BadgeSizes } from "@/examples/badge/sizes";
import { BadgeVariants } from "@/examples/badge/variants";
import { badgeProps } from "@/lib/props/badge";

export const metadata: Metadata = {
  title: "Badge",
  description:
    "Label statuses, counts, and metadata with tokenized variants, tones, sizes, and decorative icon slots.",
};

export default function BadgePage() {
  return (
    <DocsPage
      name="Badge"
      description="Badge gives short metadata a consistent visual grammar across tables, cards, headers, and identity rows with tokenized variants, semantic tones, compact sizes, and decorative icon slots."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="badge/variants.tsx"
            title="Variants and tones"
            description="Combine emphasis and semantic tone without hard-coding product colors."
            wide
          >
            <BadgeVariants />
          </ExampleBlock>
          <ExampleBlock
            file="badge/sizes.tsx"
            title="Sizes"
            description="Choose xs for dense tables, sm and md for routine metadata, and lg for higher emphasis."
          >
            <BadgeSizes />
          </ExampleBlock>
          <ExampleBlock
            file="badge/icons.tsx"
            title="Icons"
            description="Icons are decorative, so the text label carries the accessible meaning."
          >
            <BadgeIcons />
          </ExampleBlock>
          <ExampleBlock
            file="badge/recipe-status-list.tsx"
            title="Status list recipe"
            description="Badges keep repeated operational states compact and easy to scan."
            wide
          >
            <BadgeStatusList />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="badge"
        importCode={`import { Badge } from "@dethink/components";

export function Example() {
  return <Badge tone="success">Healthy</Badge>;
}`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="BadgeProps extends span attributes for routine metadata and status labels."
      >
        <PropsTable caption="Badge props" rows={badgeProps} />
      </DocsSection>
    </DocsPage>
  );
}
