import Link from "next/link";
import type { ShaderBackgroundEffect } from "@dethink/components";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ShaderBackgroundPreview } from "@/examples/shader-backgrounds/preview";

const rows = [
  {
    prop: "children",
    type: "ReactNode",
    defaultValue: "—",
    description: "Ordinary HTML content above the inert decorative layer.",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultValue: "true",
    description:
      "False selects static CSS and releases the WebGL context. Reduced motion always takes priority.",
  },
  {
    prop: "speed",
    type: '"slow" | "normal" | "fast"',
    defaultValue: '"normal"',
    description: "Bounded animation speed. Drawing is capped at 30 fps.",
  },
  {
    prop: "intensity",
    type: '"faint" | "subtle" | "bold"',
    defaultValue: '"subtle"',
    description: "Strength of the shader colors and static fallback.",
  },
  {
    prop: "seed",
    type: "number",
    defaultValue: "1",
    description:
      "Repeatable initial composition. Non-finite seeds use the default.",
  },
  {
    prop: "interactive",
    type: "boolean",
    defaultValue: "false",
    description:
      "Gentle mouse parallax. Disabled on coarse input and while static; never captures touch gestures.",
  },
];

export function ShaderBackgroundDocs({
  effect,
  name,
  description,
}: {
  effect: ShaderBackgroundEffect;
  name: string;
  description: string;
}) {
  return (
    <DocsPage name={name} description={description}>
      <DocsSection
        id="examples"
        title="In motion"
        description="A working hero, with ordinary HTML above the shader. Pause the animation, switch themes, or explore a new composition."
      >
        <ExampleBlock
          file="shader-backgrounds/preview.tsx"
          title="Interactive hero"
          description="The foreground controls remain usable while the background moves."
          wide
          codeCollapsible
          codeDefaultOpen={false}
        >
          <ShaderBackgroundPreview effect={effect} />
        </ExampleBlock>
      </DocsSection>
      <InstallationSection
        registryName={`${effect}-background`}
        importCode={`import { ${name} } from "@dethink/components";\n\n<${name} className="rounded-2xl p-12">\n  <h1>Your next idea starts here.</h1>\n</${name}>`}
      />
      <DocsSection
        id="props"
        title="Props"
        description="Native div attributes, events and a forwarded ref are also supported."
      >
        <PropsTable caption={`${name} props`} rows={rows} />
      </DocsSection>
      <DocsSection id="accessibility" title="Motion and accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Provide a pause control for continuous motion by toggling animate.
          Reduced motion, forced colors, print, and unavailable WebGL use static
          CSS. The decorative canvas is hidden from assistive technology and
          never intercepts a click. Foreground content is present before
          JavaScript runs. Use a foreground surface or scrim to maintain text
          contrast.
        </p>
      </DocsSection>
      <DocsSection id="theming" title="Colors and performance">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Set --shader-background-base, --shader-background-accent, and
          --shader-background-secondary with CSS color values or semantic
          tokens. The defaults follow the current background, primary, and info
          tokens. Rendering stops outside the viewport or in hidden tabs. Each
          visible instance uses one draw call, at most one million pixels, and a
          maximum device pixel ratio of 1.5.
        </p>
        <Link
          href="/components/shader-backgrounds"
          className="text-primary mt-4 inline-block text-sm underline"
        >
          Explore all five shader backgrounds
        </Link>
      </DocsSection>
    </DocsPage>
  );
}
