import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { GridBeamsBackgroundBasic } from "@/examples/grid-beams-background/basic";
import { GridBeamsBackgroundStatic } from "@/examples/grid-beams-background/static";
import { GridBeamsBackgroundTones } from "@/examples/grid-beams-background/tones";
import { gridBeamsBackgroundProps } from "@/lib/props/grid-beams-background";

export const metadata: Metadata = {
  title: "GridBeamsBackground",
  description:
    "Frame hero content over a subtle token-colored line grid with seeded light beams tracing along grid lines, SSR-stable and reduced-motion safe.",
};

export default function GridBeamsBackgroundPage() {
  return (
    <DocsPage
      name="GridBeamsBackground"
      description="An animated landing-page background with a technical, engineered feel: a faint line grid plus light beams that trace along grid lines. It wraps your hero content, keeps the decorative layer aria-hidden and non-interactive, renders deterministic SSR markup from a seed, pauses offscreen, and falls back to a designed static frame under reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The background fills its container; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="grid-beams-background/basic.tsx"
            title="Hero composition"
            description="The default composition: hero copy and actions render in the content slot above the animated layer, which never intercepts pointer events."
          >
            <GridBeamsBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="grid-beams-background/tones.tsx"
            title="Tones, density, and speed"
            description="Every visual axis is a literal token-backed variant. Different seeds reshuffle beam placement deterministically."
          >
            <GridBeamsBackgroundTones />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="grid-beams-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: no loops mounted, still designed."
          >
            <GridBeamsBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="grid-beams-background"
        importCode={`import { GridBeamsBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="GridBeamsBackground accepts div props plus the shared background contract: animate, density, intensity, speed, tone, and seed."
      >
        <PropsTable
          caption="GridBeamsBackground props"
          rows={gridBeamsBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
