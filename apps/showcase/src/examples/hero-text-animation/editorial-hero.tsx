"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function HeroTextAnimationEditorialHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="editorial-hero-heading"
        className="bg-muted/30 text-foreground @container/hero overflow-hidden"
      >
        <header className="border-border flex justify-between gap-4 border-b px-6 py-5 font-mono text-[10px] tracking-[0.18em] uppercase">
          <span>Form &amp; Feeling®</span>
          <span>Independent by design</span>
        </header>
        <div className="grid gap-10 px-6 py-14 @min-[800px]/hero:grid-cols-[1.3fr_1fr] @min-[800px]/hero:px-12 @min-[800px]/hero:py-20">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              Objects, spaces, and the moments between.
            </p>
            {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
            <HeroTextAnimation
              as="h2"
              id="editorial-hero-heading"
              animation="masked-curtain"
              trigger="in-view"
              reducedMotionStrategy="static"
              stagger={0.18}
              text={"Make space\nfor the\nunexpected."}
              className="mt-8 font-serif text-[clamp(2rem,6cqi,4.5rem)] leading-[1.12] tracking-tight"
            />
            <div className="mt-9">
              <Button asChild variant="outline" rightIcon={<ArrowUpRight />}>
                <a href="#installation-heading">Explore the collection</a>
              </Button>
            </div>
          </div>
          <div className="relative min-w-0">
            <div
              aria-hidden="true"
              className="bg-primary/10 relative flex aspect-[4/5] max-h-[420px] items-end justify-center overflow-hidden rounded-t-full"
            >
              <div className="bg-primary/15 absolute inset-x-8 bottom-0 h-3/4 rounded-t-full" />
              <div className="bg-primary/30 absolute bottom-0 h-2/3 w-2/3 rounded-t-full" />
              <div className="bg-background absolute bottom-0 h-1/2 w-1/3 rounded-t-full shadow-2xl" />
            </div>
            <span
              aria-hidden="true"
              className="text-primary pointer-events-none absolute top-8 right-8"
            >
              <ArrowDownRight className="size-10" />
            </span>
            <div className="border-border mt-5 flex justify-between gap-3 border-t pt-4 text-xs">
              <span>Study No. 04 — Soft structure</span>
              <span className="text-muted-foreground">2026</span>
            </div>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-6">
              Considered forms. Unexpected details. Everyday things that invite
              you to look a little closer.
            </p>
          </div>
        </div>
        <footer className="border-border flex flex-wrap justify-between gap-3 border-t px-6 py-5 text-[10px] tracking-[0.16em] uppercase">
          <span>Thoughtfully made, slowly enjoyed.</span>
          <span className="text-muted-foreground">
            Edition 004 / An ongoing practice
          </span>
        </footer>
      </section>
    </HeroTextAnimationProvider>
  );
}
