import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { HeroTextAnimationMaskedCurtainHero } from "@/examples/hero-text-animation/masked-curtain-hero";
import { HeroTextAnimationProductionHero } from "@/examples/hero-text-animation/production-hero";
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
        description="Live previews rendered by the exact code shown below each one."
      >
        <ExampleBlock
          file="hero-text-animation/production-hero.tsx"
          title="Staggered production hero section"
          description="A focused staggered reveal recipe with animated semantic copy, navbar composition, CTAs, and icon-led proof points."
          wide
        >
          <HeroTextAnimationProductionHero />
        </ExampleBlock>
        <ExampleBlock
          file="hero-text-animation/masked-curtain-hero.tsx"
          title="Masked curtain hero section"
          description="A separate production hero recipe for the masked curtain reveal with the same navbar, action, and proof-point expectations."
          wide
        >
          <HeroTextAnimationMaskedCurtainHero />
        </ExampleBlock>
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
        <PropsTable
          caption="HeroTextAnimation props"
          rows={heroTextAnimationProps}
        />
      </DocsSection>
    </DocsPage>
  );
}
