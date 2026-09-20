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
  description: "Move a highlight across a grid background.",
};

export default function ScanGridBackgroundPage() {
  return (
    <DocsPage
      name="ScanGridBackground"
      description="Move a highlight across a grid background."
    >
      <InstallationSection
        registryName="scan-grid-background"
        importCode={`import { ScanGridBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The background fills its container; these previews bound it with a height utility."
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
