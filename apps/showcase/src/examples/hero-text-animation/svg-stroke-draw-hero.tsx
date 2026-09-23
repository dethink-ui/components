"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight } from "lucide-react";

export function HeroTextAnimationSvgStrokeDrawHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-svg-stroke-draw-heading"
        className="bg-background text-foreground border-border @container/hero overflow-hidden rounded-md border"
      >
        <div className="border-border text-muted-foreground grid grid-cols-2 border-b text-xs font-medium tracking-[0.22em] uppercase @min-[480px]/hero:grid-cols-3">
          <span className="px-5 py-3.5 @min-[480px]/hero:px-8">Dethink</span>
          <span className="border-border hidden border-x px-5 py-3.5 text-center @min-[480px]/hero:block">
            Campaign · 2026
          </span>
          <span className="px-5 py-3.5 text-right @min-[480px]/hero:px-8">
            № 01
          </span>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-20 text-center @min-[480px]/hero:px-8 @min-[900px]/hero:py-28">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
            The 2026 brand refresh
          </p>

          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            trigger="in-view"
            reducedMotionStrategy="static"
            animation="svg-stroke-draw"
            duration={1.4}
            id="hero-text-svg-stroke-draw-heading"
            text={"Make it\nunforgettable."}
            className="font-heading text-foreground mx-auto mt-8 max-w-2xl font-semibold tracking-tight"
          />

          <p className="text-muted-foreground mx-auto mt-10 max-w-md text-base leading-7 @min-[480px]/hero:text-lg">
            A wordmark that draws itself, a palette that shifts with the light,
            and a system built to carry a brand across every surface.
          </p>

          <div className="mt-9">
            <Button asChild size="lg" rightIcon={<ArrowRight />}>
              <a href="#installation-heading">Explore the identity</a>
            </Button>
          </div>
        </div>

        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-5 py-3.5 text-xs tracking-[0.18em] uppercase @min-[480px]/hero:px-8">
          <span>Design-forward hero</span>
          <span aria-hidden="true">Outline → fill</span>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
