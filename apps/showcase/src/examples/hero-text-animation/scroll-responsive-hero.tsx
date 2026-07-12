"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight, ChevronDown } from "lucide-react";

const chapters = [
  { index: "01", title: "The quiet idea", active: true },
  { index: "02", title: "The stubborn build" },
  { index: "03", title: "The first believer" },
];

export function HeroTextAnimationScrollResponsiveHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-scroll-responsive-heading"
        className="bg-background text-foreground border-border overflow-hidden rounded-md border"
      >
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:px-10 lg:py-24">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
              A field guide · Chapter 01
            </p>

            <HeroTextAnimation
              animation="scroll-responsive"
              id="hero-text-scroll-responsive-heading"
              text="Every product starts as a quiet, stubborn idea."
              className="font-heading text-foreground mt-6 max-w-2xl text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            />

            <p className="text-muted-foreground mt-7 max-w-lg text-base leading-7 sm:text-lg">
              Scroll and the opening line steps back, making room for the story.
              Nothing essential moves out of reach — the heading stays readable
              the whole way down.
            </p>

            <div className="mt-8">
              <Button
                asChild
                size="lg"
                variant="outline"
                rightIcon={<ArrowRight />}
              >
                <a href="#examples">Read the story</a>
              </Button>
            </div>

            <p className="text-muted-foreground mt-12 inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase">
              <ChevronDown
                aria-hidden="true"
                className="size-4 animate-bounce motion-reduce:animate-none"
              />
              Scroll to begin
            </p>
          </div>

          <nav
            aria-label="Chapters"
            className="border-border lg:border-l lg:pl-8"
          >
            <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
              In this story
            </p>
            <ol className="mt-4 space-y-4">
              {chapters.map(({ index, title, active }) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      active ? "bg-primary" : "bg-border"
                    }`}
                  />
                  <span className="min-w-0">
                    <span
                      className={`font-mono text-xs ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {index}
                    </span>
                    <span
                      className={`mt-0.5 block text-sm font-medium ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {title}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="border-border bg-muted/30 border-t px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <p className="text-muted-foreground font-mono text-xs tracking-widest">
              01 — The quiet idea
            </p>
            <p className="text-foreground mt-3 text-lg leading-8">
              It rarely arrives as a plan. It shows up as a small, nagging sense
              that something could be better — and refuses to leave until you
              build it.
            </p>
          </div>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
