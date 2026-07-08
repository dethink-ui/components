import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { HeroTextAnimationBlurFocusHero } from "@/examples/hero-text-animation/blur-focus-hero";
import { HeroTextAnimationGradientHighlightHero } from "@/examples/hero-text-animation/gradient-highlight-hero";
import { HeroTextAnimationKineticEmphasisPopHero } from "@/examples/hero-text-animation/kinetic-emphasis-pop-hero";
import { HeroTextAnimationMaskedCurtainHero } from "@/examples/hero-text-animation/masked-curtain-hero";
import { HeroTextAnimationProductionHero } from "@/examples/hero-text-animation/production-hero";
import { HeroTextAnimationRotatingKeywordHero } from "@/examples/hero-text-animation/rotating-keyword-hero";
import { HeroTextAnimationScrollResponsiveHero } from "@/examples/hero-text-animation/scroll-responsive-hero";
import { HeroTextAnimationScrambleDecryptHero } from "@/examples/hero-text-animation/scramble-decrypt-hero";
import { HeroTextAnimationTypewriterHero } from "@/examples/hero-text-animation/typewriter-hero";
import { heroTextAnimationProps } from "@/lib/props/hero-text-animation";

export const metadata: Metadata = {
  title: "HeroTextAnimation",
  description:
    "Accessible, SSR-safe hero text animation with reduced-motion fallbacks.",
};

export default function HeroTextAnimationPage() {
  return (
    <DocsPage
      name="HeroTextAnimation"
      description="A production hero text animation primitive for landing pages. It keeps final text in server-rendered HTML, hides decorative fragments from assistive technology, and falls back cleanly when users prefer reduced motion."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Production hero previews are shown first so animation behavior is easy to compare. Expand a source panel when you need the implementation."
      >
        <div className="space-y-8">
          <ExampleBlock
            file="hero-text-animation/production-hero.tsx"
            title="Staggered production hero section"
            description="A focused staggered reveal recipe with animated semantic copy, navbar composition, CTAs, and icon-led proof points."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationProductionHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/masked-curtain-hero.tsx"
            title="Masked curtain hero section"
            description="A separate production hero recipe for the masked curtain reveal with the same navbar, action, and proof-point expectations."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationMaskedCurtainHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/typewriter-hero.tsx"
            title="Typewriter hero section"
            description="A separate production hero recipe for short typewriter copy with final text available up front, stable actions, and reduced-motion-safe output."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationTypewriterHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/scramble-decrypt-hero.tsx"
            title="Scramble decrypt hero section"
            description="A separate production hero recipe for deterministic decrypt copy with bounded glyph updates, navbar composition, CTAs, and reduced-motion-safe output."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationScrambleDecryptHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/rotating-keyword-hero.tsx"
            title="Rotating keyword hero section"
            description="A separate production hero recipe for a stable accessible sentence with a decorative keyword slot, bounded auto rotation, navbar composition, CTAs, and icon-led proof points."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationRotatingKeywordHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/gradient-highlight-hero.tsx"
            title="Gradient highlight hero section"
            description="A separate production hero recipe for a one-shot gradient highlight sweep with tokenized contrast, navbar composition, CTAs, icon-led proof points, and reduced-motion-safe final copy."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationGradientHighlightHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/blur-focus-hero.tsx"
            title="Blur focus hero section"
            description="A separate production hero recipe for a short cinematic blur-to-focus heading that resolves quickly to crisp text, avoids scale/parallax/rotation, and includes reduced-motion-safe final copy."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationBlurFocusHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/kinetic-emphasis-pop-hero.tsx"
            title="Kinetic emphasis pop hero section"
            description="A separate production hero recipe for one-shot word emphasis with static color, weight, and underline styling, navbar composition, CTAs, icon-led proof points, and reduced-motion-safe final copy."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationKineticEmphasisPopHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/scroll-responsive-hero.tsx"
            title="Scroll responsive hero section"
            description="A separate production hero recipe for subtle first-scroll text response with normal document flow, navbar composition, CTAs, icon-led proof points, and reduced-motion-safe final copy."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationScrollResponsiveHero />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="hero-text-animation"
        importCode={`import {
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";

export function Example() {
  return (
    <HeroTextAnimationProvider>
      <HeroTextAnimation text="Build production-ready landing pages faster." />
    </HeroTextAnimationProvider>
  );
}`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="HeroTextAnimation renders real text and uses a decorative visual layer only for the animation."
      >
        <p className="text-muted-foreground mb-6 max-w-3xl text-sm leading-6">
          Avoid scramble and decrypt effects for legal, medical, pricing, or
          compliance-critical wording. Use static text for copy where every
          character must be immediately reviewable. Limit blur focus to short
          cinematic hero headings that can finish resolving before users need to
          read the copy. Use scroll-responsive text only when the full heading
          is readable before the first scroll and the next content remains in
          normal document flow.
        </p>
        <PropsTable
          caption="HeroTextAnimation props"
          rows={heroTextAnimationProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
