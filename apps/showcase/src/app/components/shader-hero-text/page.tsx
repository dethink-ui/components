import type { Metadata } from "next";
import Link from "next/link";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ShaderHeroTextPreview } from "@/examples/shader-hero-text/effect-preview";
import { shaderHeroTextProps } from "@/lib/props/shader-hero-text";

export const metadata: Metadata = {
  title: "ShaderHeroText",
  description:
    "Six WebGL text effects, including particle lettering that follows your mouse and reforms.",
};

const effects = [
  [
    "particle-follow",
    "Particle follow",
    "Letters made from individual particles. Follow the mouse, then return home.",
  ],
  [
    "liquid-ripple",
    "Liquid ripple",
    "A radial ripple bends the letterforms and settles.",
  ],
  [
    "chromatic-refraction",
    "Chromatic refraction",
    "Prismatic fringes separate and reunite around the letters.",
  ],
  [
    "noise-dissolve",
    "Noise dissolve",
    "A seeded organic mask reveals the complete headline.",
  ],
  [
    "wave-distortion",
    "Wave distortion",
    "A coherent wave passes through the text.",
  ],
  [
    "liquid-metal",
    "Liquid metal",
    "Reflective lighting bands travel across the letter interiors.",
  ],
] as const;

export default function ShaderHeroTextPage() {
  return (
    <DocsPage
      name="ShaderHeroText"
      description="Expressive headlines rendered with WebGL. Real HTML keeps the message accessible, while shaders add fluid motion, reflective materials, and particles you can move with your mouse."
    >
      <DocsSection
        id="examples"
        title="Six ways to move type"
        description="Try particle follow first. Every preview supports static text and theme switching; one-shot effects also have replay controls."
      >
        <div className="space-y-10">
          {effects.map(([animation, title, description]) => (
            <ExampleBlock
              key={animation}
              file="shader-hero-text/effect-preview.tsx"
              title={title}
              description={description}
              wide
              codeCollapsible
              codeDefaultOpen={false}
            >
              <ShaderHeroTextPreview animation={animation} />
            </ExampleBlock>
          ))}
        </div>
      </DocsSection>
      <InstallationSection
        registryName="shader-hero-text"
        importCode={`import { ShaderHeroText } from "@dethink/components";

<ShaderHeroText
  animation="particle-follow"
  text="Ideas come together."
  className="text-6xl font-semibold"
/>`}
      />
      <DocsSection
        id="props"
        title="Props"
        description="The shader component accepts native heading attributes and a forwarded ref."
      >
        <PropsTable caption="ShaderHeroText props" rows={shaderHeroTextProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility and fallbacks">
        <p className="text-muted-foreground text-sm leading-relaxed">
          The complete heading is present before JavaScript runs. Canvas output
          is decorative and never receives focus. Reduced motion, forced colors,
          missing WebGL, unsupported typography, and touch devices using
          particle follow receive static HTML. Select text to reveal the HTML
          copy. Animations stop when hidden or offscreen.
        </p>
      </DocsSection>
      <DocsSection id="theming" title="Typography and theming">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Use your own loaded font, font size, line height, alignment,
          direction, and explicit line breaks. The component measures browser
          line wrapping and uses HTML when it cannot reproduce a text layout
          reliably. Set --shader-hero-text-base, --shader-hero-text-accent, and
          --shader-hero-text-sheen to theme the effect. Use short headings;
          vertical writing and transformed text are not supported.
        </p>
        <p className="text-muted-foreground mt-4 text-sm">
          For staggered words, typewriter, and other DOM/SVG effects, see{" "}
          <Link
            className="text-primary underline"
            href="/components/hero-text-animation"
          >
            HeroTextAnimation
          </Link>
          .
        </p>
      </DocsSection>
    </DocsPage>
  );
}
