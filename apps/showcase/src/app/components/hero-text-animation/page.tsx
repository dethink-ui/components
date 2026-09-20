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
import { HeroTextAnimationSvgStrokeDrawHero } from "@/examples/hero-text-animation/svg-stroke-draw-hero";
import { HeroTextAnimationTypewriterHero } from "@/examples/hero-text-animation/typewriter-hero";
import { HeroTextAnimationWordBlurFocusHero } from "@/examples/hero-text-animation/word-blur-focus-hero";
import { heroTextAnimationProps } from "@/lib/props/hero-text-animation";

export const metadata: Metadata = {
  title: "HeroTextAnimation",
  description: "Reveal a headline one word or line at a time.",
};

export default function HeroTextAnimationPage() {
  return (
    <DocsPage
      name="HeroTextAnimation"
      description="Reveal a headline one word or line at a time."
    >
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
        id="examples"
        title="Examples"
        description="Each animation is shown in a distinct, production-style hero tuned to where it fits best — SaaS, developer tools, security, editorial, luxury, and more. Expand a source panel when you need the implementation."
      >
        <div className="space-y-8">
          <ExampleBlock
            file="hero-text-animation/production-hero.tsx"
            title="SaaS product hero — staggered words"
            description="The default staggered word reveal in a conversion-focused SaaS layout: navbar, dual CTAs, and an icon-led proof grid."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationProductionHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/masked-curtain-hero.tsx"
            title="Design studio hero — masked curtain"
            description="An editorial agency layout where lines rise inside overflow masks: restrained typography, thin rules, and a numbered discipline index."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationMaskedCurtainHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/typewriter-hero.tsx"
            title="Developer tool hero — typewriter"
            description="A CLI/DX layout pairing the typed headline with a live terminal window, install command, and GitHub actions."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationTypewriterHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/scramble-decrypt-hero.tsx"
            title="Security platform hero — scramble decrypt"
            description="A zero-trust layout with a grid backdrop, compliance chips, and a live encrypted-status console beside the decrypting headline."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationScrambleDecryptHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/rotating-keyword-hero.tsx"
            title="Multi-audience hero — rotating keyword"
            description="A product-led layout that swaps the audience keyword while keeping one stable accessible sentence, audience chips, and a team avatar cloud."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationRotatingKeywordHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/gradient-highlight-hero.tsx"
            title="AI product hero — gradient highlight"
            description="A brand-forward, centered layout with soft glow backdrops, a one-shot gradient sweep, and an early-access email capture."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationGradientHighlightHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/blur-focus-hero.tsx"
            title="Luxury launch hero — blur focus"
            description="A cinematic, minimal product-launch layout with generous whitespace, a soft vignette backdrop, and a single film CTA."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationBlurFocusHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/word-blur-focus-hero.tsx"
            title="Photography studio hero — word-by-word blur focus"
            description="The same blur-focus reveal split per word: each word racks from soft focus into clarity in sequence via the splitBy word prop, in an editorial studio layout."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationWordBlurFocusHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/kinetic-emphasis-pop-hero.tsx"
            title="Conversion hero — kinetic emphasis pop"
            description="A marketing layout that pops key value words (reinforced by weight, color, and underline) above a star-rating proof line and a metric row."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationKineticEmphasisPopHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/svg-stroke-draw-hero.tsx"
            title="Campaign poster hero — SVG stroke draw"
            description="A design-forward poster layout with edition markers and a wordmark whose letterforms trace their outline and then fill, with the real heading kept available to assistive technology."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationSvgStrokeDrawHero />
          </ExampleBlock>
          <ExampleBlock
            file="hero-text-animation/scroll-responsive-hero.tsx"
            title="Storytelling hero — scroll responsive"
            description="A long-scroll narrative layout with chapter markers and a scroll cue, where the opening line subtly recedes on scroll while staying readable."
            codeCollapsible
            codeDefaultOpen={false}
            wide
          >
            <HeroTextAnimationScrollResponsiveHero />
          </ExampleBlock>
        </div>
      </DocsSection>

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
          read the copy. Use SVG stroke draw for short headings only; it renders
          scalable letterforms that trace and fill, does not auto-wrap, and
          keeps the real heading available to assistive technology. Use
          scroll-responsive text only when the full heading is readable before
          the first scroll and the next content remains in normal document flow.
        </p>
        <PropsTable
          caption="HeroTextAnimation props"
          rows={heroTextAnimationProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
