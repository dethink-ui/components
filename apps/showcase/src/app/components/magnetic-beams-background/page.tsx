import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { MagneticBeamsBackgroundBasic } from "@/examples/magnetic-beams-background/basic";
import { MagneticBeamsBackgroundStatic } from "@/examples/magnetic-beams-background/static";
import { MagneticBeamsBackgroundVariants } from "@/examples/magnetic-beams-background/variants";
import { magneticBeamsBackgroundProps } from "@/lib/props/magnetic-beams-background";

export const metadata: Metadata = {
  title: "MagneticBeamsBackground",
  description: "Add grid beams that follow the pointer.",
};

export default function MagneticBeamsBackgroundPage() {
  return (
    <DocsPage
      name="MagneticBeamsBackground"
      description="Add grid beams that follow the pointer."
    >
      <InstallationSection
        registryName="magnetic-beams-background"
        importCode={`import { MagneticBeamsBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The background fills its container; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="magnetic-beams-background/basic.tsx"
            title="Hero composition"
            description="Move the pointer over the preview: beams converge toward it along their rails, and resume their traversal from that point when the pointer leaves."
          >
            <MagneticBeamsBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="magnetic-beams-background/variants.tsx"
            title="Modes, variants, and interactive={false}"
            description="Every visual axis is a literal token-backed variant. mode switches how beams approach the pointer: magnetic springs onto it, follow travels there at the normal loop speed. interactive={false} keeps the plain traversal loop."
          >
            <MagneticBeamsBackgroundVariants />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="magnetic-beams-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: no loops or attraction mounted, still designed."
          >
            <MagneticBeamsBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="MagneticBeamsBackground accepts div props plus the shared background contract — animate, density, intensity, speed, tone, and seed — and adds interactive and mode for the pointer attraction."
      >
        <PropsTable
          caption="MagneticBeamsBackground props"
          rows={magneticBeamsBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
