import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { StarfieldBackgroundBasic } from "@/examples/starfield-background/basic";
import { StarfieldBackgroundStatic } from "@/examples/starfield-background/static";
import { StarfieldBackgroundVariants } from "@/examples/starfield-background/variants";
import { starfieldBackgroundProps } from "@/lib/props/starfield-background";

export const metadata: Metadata = {
  title: "StarfieldBackground",
  description:
    "Drift a three-layer parallax starfield with twinkle and optional pointer parallax behind hero content, SSR-stable and reduced-motion safe.",
};

export default function StarfieldBackgroundPage() {
  return (
    <DocsPage
      name="StarfieldBackground"
      description="An animated landing-page background that makes a hero feel expansive: three SVG star layers drifting at different speeds for depth, a bounded set of twinkling stars, and optional spring-smoothed pointer parallax. It wraps your hero content, keeps the decorative layer aria-hidden and non-interactive, renders deterministic SSR markup from a seed, pauses offscreen, and falls back to a fully still field under reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. The background fills its container; these previews bound it with a height utility. Move your cursor over the first example to feel the parallax."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="starfield-background/basic.tsx"
            title="Hero composition"
            description="The default composition: hero copy and actions render in the content slot above the animated layer, which never intercepts pointer events."
          >
            <StarfieldBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="starfield-background/variants.tsx"
            title="Density, interactivity, and speed"
            description="Every visual axis is a literal token-backed variant; interactive={false} keeps the drift but drops the pointer response."
          >
            <StarfieldBackgroundVariants />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="starfield-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: no loops or pointer handlers mounted, still designed."
          >
            <StarfieldBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="starfield-background"
        importCode={`import { StarfieldBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="StarfieldBackground accepts div props plus the shared background contract — animate, density, intensity, speed, tone, seed — and its own interactive axis."
      >
        <PropsTable
          caption="StarfieldBackground props"
          rows={starfieldBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
