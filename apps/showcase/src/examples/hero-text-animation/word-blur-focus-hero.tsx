"use client";

import type { CSSProperties } from "react";
import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight, Aperture } from "lucide-react";

const backdropStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(120% 80% at 15% 0%, color-mix(in oklab, var(--dt-color-primary) 12%, transparent), transparent 60%), linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 6%, transparent), transparent 45%)",
};

export function HeroTextAnimationWordBlurFocusHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-word-blur-focus-heading"
        className="bg-background text-foreground border-border relative overflow-hidden rounded-md border"
      >
        <span
          aria-hidden="true"
          style={backdropStyle}
          className="pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col px-5 py-20 sm:px-8 lg:py-28">
          <p className="text-muted-foreground inline-flex items-center gap-2 text-xs font-medium tracking-[0.32em] uppercase">
            <Aperture aria-hidden="true" className="text-primary size-4" />
            Aperture Studio
          </p>

          <HeroTextAnimation
            animation="blur-focus"
            splitBy="word"
            duration={0.7}
            stagger={0.09}
            id="hero-text-word-blur-focus-heading"
            repeat
            repeatDelay={2.2}
            text="Every frame pulled into perfect focus."
            className="font-heading text-foreground mt-8 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          />

          <p className="text-muted-foreground mt-7 max-w-lg text-base leading-7 sm:text-lg">
            A photography practice for brands that sweat the details. Each word
            racks into focus the way our lenses do — deliberately, one plane at a
            time, until the whole picture is sharp.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" rightIcon={<ArrowRight />}>
              <a href="#installation">Book a session</a>
            </Button>
            <a
              href="#examples"
              className="text-foreground focus-visible:ring-ring focus-visible:ring-offset-background group inline-flex items-center gap-1.5 rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              View the portfolio
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>

        <div className="border-border text-muted-foreground relative flex items-center justify-between border-t px-5 py-3.5 text-xs tracking-[0.18em] uppercase sm:px-8">
          <span>Word-by-word focus</span>
          <span aria-hidden="true">Soft → sharp</span>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
