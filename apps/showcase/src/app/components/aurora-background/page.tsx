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
  description:
    "Frame hero content with flowing aurora ribbons of blurred, hue-shifted gradient light that drift and breathe on slow seeded loops, SSR-stable and reduced-motion safe.",
};

export default function AuroraBackgroundPage() {
  return (
    <DocsPage
      name="AuroraBackground"
      description="Flowing ribbons of heavily blurred gradient light drift, sway, and breathe behind your hero. Every ribbon's hue is rotated in OKLCH from the active tone token via CSS relative color syntax, so one semantic token yields a multi-hue aurora that follows your theme in light and dark mode — with a designed mono-hue fallback where relative color syntax is unavailable. It wraps your hero content, keeps the decorative layer aria-hidden and non-interactive, renders deterministic SSR markup from a seed, pauses offscreen, and falls back to a designed static frame under reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The background fills its container; these previews bound it with a height utility."
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

      <InstallationSection
        registryName="aurora-background"
        importCode={`import { AuroraBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="AuroraBackground accepts div props plus the shared background contract — animate, density, intensity, speed, tone, and seed."
      >
        <PropsTable caption="AuroraBackground props" rows={auroraBackgroundProps} />
      </DocsSection>
    </DocsPage>
  );
}
