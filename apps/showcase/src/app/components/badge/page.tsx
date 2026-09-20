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
  description: "Show a short status, label, or count.",
};

export default function BadgePage() {
  return (
    <DocsPage name="Badge" description="Show a short status, label, or count.">
      <InstallationSection
        registryName="badge"
        importCode={`import { Badge } from "@dethink/components";

export function Example() {
  return <Badge tone="success">Healthy</Badge>;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
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
