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
  description:
    "Frame hero content over the GridBeams line grid with light beams that spring toward the pointer while it hovers, then resume their traversal from that point, SSR-stable and reduced-motion safe.",
};

export default function MagneticBeamsBackgroundPage() {
  return (
    <DocsPage
      name="MagneticBeamsBackground"
      description="The GridBeamsBackground aesthetic with pointer attraction: while the pointer hovers, each beam stops its traversal and springs along its rail toward the pointer — horizontal beams track x, vertical beams track y — and when the pointer leaves, every beam resumes its traversal from wherever it sits. It wraps your hero content, keeps the decorative layer aria-hidden and non-interactive, renders deterministic SSR markup from a seed, pauses offscreen, and falls back to a designed static frame under reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The background fills its container; these previews bound it with a height utility."
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

      <InstallationSection
        registryName="magnetic-beams-background"
        importCode={`import { MagneticBeamsBackground } from "@dethink/components";`}
      />

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
