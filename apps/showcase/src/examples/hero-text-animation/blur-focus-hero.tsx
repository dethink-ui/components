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
        className="bg-background text-foreground border-border relative overflow-hidden rounded-md border"
      >
        <span
          aria-hidden="true"
          style={backdropStyle}
          className="pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-5 py-20 text-center sm:px-8 lg:py-28">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.32em] uppercase">
            Introducing
          </p>
          <p className="font-heading text-foreground mt-3 text-sm font-semibold tracking-[0.4em] uppercase">
            Aura · Series 02
          </p>

          <HeroTextAnimation
            animation="blur-focus"
            duration={1.2}
            id="hero-text-blur-focus-heading"
            repeat
            repeatDelay={2.4}
            text="Designed to disappear into your day."
            className="font-heading text-foreground mt-9 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          />

          <p className="text-muted-foreground mt-7 max-w-md text-base leading-7 sm:text-lg">
            Ambient light that reads the room and fades from view. Nothing to
            configure. Nothing to notice — until you would miss it.
          </p>

          <div className="mt-9">
            <Button asChild size="lg" variant="outline" leftIcon={<Play />}>
              <a href="#examples">Watch the film</a>
            </Button>
          </div>
        </div>

        <div className="border-border relative flex flex-col items-center justify-between gap-3 border-t px-5 py-5 text-sm sm:flex-row sm:px-8 lg:px-12">
          <span className="text-muted-foreground tracking-wide">
            Available Fall 2026
          </span>
          <a
            href="#installation"
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
