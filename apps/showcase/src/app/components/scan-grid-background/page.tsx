import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ScanGridBackgroundBasic } from "@/examples/scan-grid-background/basic";
import { ScanGridBackgroundDirections } from "@/examples/scan-grid-background/directions";
import { ScanGridBackgroundStatic } from "@/examples/scan-grid-background/static";
import { scanGridBackgroundProps } from "@/lib/props/scan-grid-background";

export const metadata: Metadata = {
  title: "ScanGridBackground",
  description:
    "Sweep a scanning highlight band across a token-colored line grid, vertically or horizontally, SSR-stable and reduced-motion safe.",
};

export default function ScanGridBackgroundPage() {
  return (
    <DocsPage
      name="ScanGridBackground"
      description="An animated landing-page background that reads as continuous monitoring: a faint line grid with one soft highlight band sweeping across it on a calm linear loop. It wraps your hero content, keeps the decorative layer aria-hidden and non-interactive, renders deterministic SSR markup from a seed, pauses offscreen, and falls back to a designed static frame under reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The background fills its container; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="scan-grid-background/basic.tsx"
            title="Hero composition"
            description="The default composition: hero copy and actions render in the content slot above the animated layer, which never intercepts pointer events."
          >
            <ScanGridBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="scan-grid-background/directions.tsx"
            title="Directions, density, and speed"
            description="direction switches the sweep axis; every other visual axis is a literal token-backed variant."
          >
            <ScanGridBackgroundDirections />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="scan-grid-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: no loops mounted, still designed."
          >
            <ScanGridBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="scan-grid-background"
        importCode={`import { ScanGridBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="ScanGridBackground accepts div props plus the shared background contract — animate, density, intensity, speed, tone, seed — and its own direction axis."
      >
        <PropsTable
          caption="ScanGridBackground props"
          rows={scanGridBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
