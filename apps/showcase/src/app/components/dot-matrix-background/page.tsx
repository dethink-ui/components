import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DotMatrixBackgroundBasic } from "@/examples/dot-matrix-background/basic";
import { DotMatrixBackgroundStatic } from "@/examples/dot-matrix-background/static";
import { DotMatrixBackgroundTones } from "@/examples/dot-matrix-background/tones";
import { dotMatrixBackgroundProps } from "@/lib/props/dot-matrix-background";

export const metadata: Metadata = {
  title: "DotMatrixBackground",
  description:
    "Roll soft brightness pulses through a token-colored dot grid at seeded origins, SSR-stable and reduced-motion safe.",
};

export default function DotMatrixBackgroundPage() {
  return (
    <DocsPage
      name="DotMatrixBackground"
      description="An animated landing-page background that suggests ambient computation: a faint dot grid with soft brightness pulses rolling through it at seeded origins. The pulses are masked copies of the same dot pattern, so dots brighten in place — no blob floating over the field. It wraps your hero content, keeps the decorative layer aria-hidden and non-interactive, renders deterministic SSR markup from a seed, pauses offscreen, and falls back to a designed static frame under reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The background fills its container; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="dot-matrix-background/basic.tsx"
            title="Hero composition"
            description="The default composition: hero copy and actions render in the content slot above the animated layer, which never intercepts pointer events."
          >
            <DotMatrixBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="dot-matrix-background/tones.tsx"
            title="Tones, density, and speed"
            description="Every visual axis is a literal token-backed variant. Different seeds reshuffle the pulse origins deterministically."
          >
            <DotMatrixBackgroundTones />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="dot-matrix-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: no loops mounted, still designed."
          >
            <DotMatrixBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="dot-matrix-background"
        importCode={`import { DotMatrixBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="DotMatrixBackground accepts div props plus the shared background contract: animate, density, intensity, speed, tone, and seed."
      >
        <PropsTable
          caption="DotMatrixBackground props"
          rows={dotMatrixBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
