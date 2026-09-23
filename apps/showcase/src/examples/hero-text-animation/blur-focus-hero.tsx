"use client";

import type { CSSProperties } from "react";
import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight, Play } from "lucide-react";

const backdropStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--dt-color-primary) 14%, transparent), transparent 70%), linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 5%, transparent), transparent 40%)",
};

export function HeroTextAnimationBlurFocusHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-blur-focus-heading"
        className="bg-background text-foreground border-border @container/hero relative overflow-hidden rounded-md border"
      >
        <span
          aria-hidden="true"
          style={backdropStyle}
          className="pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-5 py-20 text-center @min-[480px]/hero:px-8 @min-[900px]/hero:py-28">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.32em] uppercase">
            Introducing
          </p>
          <p className="font-heading text-foreground mt-3 text-sm font-semibold tracking-[0.4em] uppercase">
            Aura · Series 02
          </p>

          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            trigger="in-view"
            reducedMotionStrategy="static"
            animation="blur-focus"
            duration={1.8}
            id="hero-text-blur-focus-heading"
            text="Designed to disappear into your day."
            className="font-heading text-foreground mt-9 max-w-2xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance"
          />

          <p className="text-muted-foreground mt-7 max-w-md text-base leading-7 @min-[480px]/hero:text-lg">
            Ambient light that reads the room and fades from view. Nothing to
            configure. Nothing to notice — until you would miss it.
          </p>

          <div className="mt-9">
            <Button asChild size="lg" variant="outline" leftIcon={<Play />}>
              <a href="#examples-heading">Watch the film</a>
            </Button>
          </div>
        </div>

        <div className="border-border relative flex flex-col items-center justify-between gap-3 border-t px-5 py-5 text-sm @min-[480px]/hero:flex-row @min-[480px]/hero:px-8 @min-[900px]/hero:px-12">
          <span className="text-muted-foreground tracking-wide">
            Available Fall 2026
          </span>
          <a
            href="#installation-heading"
            className="text-foreground focus-visible:ring-ring focus-visible:ring-offset-background group inline-flex items-center gap-1.5 rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Reserve yours
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
