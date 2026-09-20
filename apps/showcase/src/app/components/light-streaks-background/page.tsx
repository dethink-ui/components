import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { LightStreaksBackgroundBasic } from "@/examples/light-streaks-background/basic";
import { LightStreaksBackgroundStatic } from "@/examples/light-streaks-background/static";
import { LightStreaksBackgroundTones } from "@/examples/light-streaks-background/tones";
import { lightStreaksBackgroundProps } from "@/lib/props/light-streaks-background";

export const metadata: Metadata = {
  title: "LightStreaksBackground",
  description: "Add moving diagonal streaks of light behind your content.",
};

export default function LightStreaksBackgroundPage() {
  return (
    <DocsPage
      name="LightStreaksBackground"
      description="Add moving diagonal streaks of light behind your content."
    >
      <InstallationSection
        registryName="light-streaks-background"
        importCode={`import { LightStreaksBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The background fills its container; these previews bound it with a height utility."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="light-streaks-background/basic.tsx"
            title="Hero composition"
            description="The default composition: hero copy and actions render in the content slot above the animated layer, which never intercepts pointer events."
          >
            <LightStreaksBackgroundBasic />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="light-streaks-background/tones.tsx"
            title="Tones, density, and speed"
            description="Every visual axis is a literal token-backed variant. Different seeds reshuffle streak placement deterministically."
          >
            <LightStreaksBackgroundTones />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="light-streaks-background/static.tsx"
            title="Static frame"
            description="animate={false} — and any user with a reduced-motion preference — gets this composition: no loops mounted, still designed."
          >
            <LightStreaksBackgroundStatic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="LightStreaksBackground accepts div props plus the shared background contract: animate, density, intensity, speed, tone, and seed."
      >
        <PropsTable
          caption="LightStreaksBackground props"
          rows={lightStreaksBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
