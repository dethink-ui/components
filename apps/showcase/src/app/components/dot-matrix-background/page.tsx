import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DotMatrixBackgroundBasic } from "@/examples/dot-matrix-background/basic";
import { DotMatrixBackgroundFollow } from "@/examples/dot-matrix-background/follow";
import { DotMatrixBackgroundStatic } from "@/examples/dot-matrix-background/static";
import { DotMatrixBackgroundTones } from "@/examples/dot-matrix-background/tones";
import { dotMatrixBackgroundProps } from "@/lib/props/dot-matrix-background";

export const metadata: Metadata = {
  title: "DotMatrixBackground",
  description: "Add gentle pulses of light to a dot grid.",
};

export default function DotMatrixBackgroundPage() {
  return (
    <DocsPage
      name="DotMatrixBackground"
      description="Add gentle pulses of light to a dot grid."
    >
      <InstallationSection
        registryName="dot-matrix-background"
        importCode={`import { DotMatrixBackground } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. The background fills its container; these previews bound it with a height utility."
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
            file="dot-matrix-background/follow.tsx"
            title="Pointer-following glow"
            description='Set mode="follow" to brighten an aligned patch of dots beneath the mouse. The enhancement is mouse-only and automatically disabled for touch, reduced motion, and offscreen content.'
          >
            <DotMatrixBackgroundFollow />
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

      <DocsSection
        id="props"
        title="Props"
        description="DotMatrixBackground accepts div props plus the shared background contract: animate, density, intensity, speed, tone, and seed — plus interactive and mode for pointer-following glow behavior."
      >
        <PropsTable
          caption="DotMatrixBackground props"
          rows={dotMatrixBackgroundProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
