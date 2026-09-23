"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { Check, Sparkles } from "lucide-react";

const reassurances = ["No credit card", "2-minute setup", "Cancel anytime"];

export function HeroTextAnimationGradientHighlightHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-gradient-highlight-heading"
        className="bg-background text-foreground border-border @container/hero relative isolate overflow-hidden rounded-md border"
      >
        <span
          aria-hidden="true"
          className="bg-primary/20 pointer-events-none absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full blur-3xl"
        />
        <span
          aria-hidden="true"
          className="bg-info/20 pointer-events-none absolute -top-10 right-10 -z-10 size-56 rounded-full blur-3xl"
        />

        <div className="mx-auto max-w-3xl px-5 py-16 text-center @min-[480px]/hero:px-8 @min-[900px]/hero:py-24">
          <span className="border-border bg-background/70 text-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles aria-hidden="true" className="text-primary size-3.5" />
            New — AI that writes in your voice
          </span>

          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            trigger="in-view"
            reducedMotionStrategy="static"
            animation="gradient-highlight"
            duration={1.8}
            id="hero-text-gradient-highlight-heading"
            text="Write copy that sounds unmistakably you."
            className="font-heading text-foreground mx-auto mt-7 max-w-2xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance"
          />

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-7 @min-[480px]/hero:text-lg">
            Trained on your best pages, our model drafts launch copy, ads, and
            emails that stay on-brand — then hands you the edit, never the other
            way around.
          </p>

          <div className="mx-auto mt-9 flex max-w-md flex-col gap-2.5 @min-[480px]/hero:flex-row">
            <label htmlFor="gradient-hero-email" className="sr-only">
              Work email
            </label>
            <input
              id="gradient-hero-email"
              type="email"
              inputMode="email"
              placeholder="you@company.com"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background h-11 min-w-0 flex-1 rounded-md border px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
            <Button size="lg" className="shrink-0">
              Get early access
            </Button>
          </div>

          <ul className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {reassurances.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="text-success size-4" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
