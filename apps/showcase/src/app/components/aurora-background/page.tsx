import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { AuroraBackgroundBasic } from "@/examples/aurora-background/basic";
import { AuroraBackgroundStatic } from "@/examples/aurora-background/static";
import { AuroraBackgroundVariants } from "@/examples/aurora-background/variants";
import { auroraBackgroundProps } from "@/lib/props/aurora-background";

export const metadata: Metadata = {
  title: "AuroraBackground",
  description: "Add soft, flowing bands of color behind your content.",
};

export default function AuroraBackgroundPage() {
  return (
    <DocsPage
      name="AuroraBackground"
      description="Add soft, flowing bands of color behind your content."
    >
      <InstallationSection
        registryName="aurora-background"
        importCode={`import { AuroraBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The background fills its container; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="aurora-background/basic.tsx"
            title="Hero composition"
            description="The default primary tone. Ribbons drift on mirrored loops at seeded offsets, each slot hue-rotated from the tone token."
          >
            <AuroraBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="aurora-background/variants.tsx"
            title="Tones, densities, intensities, and speeds"
            description="Every visual axis is a literal token-backed variant. Density sets the ribbon count, intensity the opacity tier, speed the drift cycle, and tone the base color every hue derives from."
          >
            <AuroraBackgroundVariants />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="aurora-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: every ribbon frozen at its seeded offset, still designed."
          >
            <AuroraBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="AuroraBackground accepts div props plus the shared background contract — animate, density, intensity, speed, tone, and seed."
      >
        <PropsTable
          caption="AuroraBackground props"
          rows={auroraBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
