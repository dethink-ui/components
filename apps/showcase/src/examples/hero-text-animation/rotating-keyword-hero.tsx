"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight, Play } from "lucide-react";

const audiences = ["Startups", "Agencies", "Product teams", "Founders"];

// The trailing period is baked into each keyword (rather than a separate
// rotatingKeywordSuffix) so it rides the keyword's own text baseline instead of
// the overflow-clipped rotating slot's synthesized baseline, which otherwise
// dropped the "." below the line with an odd gap.
const rotatingKeywords = [
  "startups.",
  "agencies.",
  "product teams.",
  "founders.",
];

const teamAvatars = [
  { initials: "SO", tone: "bg-primary/15 text-foreground" },
  { initials: "CS", tone: "bg-info/15 text-foreground" },
  { initials: "FL", tone: "bg-success/15 text-foreground" },
  { initials: "PM", tone: "bg-warning/20 text-foreground" },
  { initials: "OP", tone: "bg-muted text-muted-foreground" },
];

export function HeroTextAnimationRotatingKeywordHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-rotating-keyword-heading"
        className="bg-background text-foreground border-border @container/hero overflow-hidden rounded-md border"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 text-center @min-[480px]/hero:px-8 @min-[900px]/hero:py-20">
          <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span
              aria-hidden="true"
              className="bg-primary size-1.5 rounded-full"
            />
            One builder · every team
          </span>

          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            trigger="in-view"
            reducedMotionStrategy="static"
            animation="rotating-keyword"
            ariaLabel="Launch pages for startups, agencies, product teams, and founders."
            duration={0.34}
            id="hero-text-rotating-keyword-heading"
            autoRotateKeywords
            rotatingKeywordInterval={1.4}
            rotatingKeywordOptions={rotatingKeywords}
            rotatingKeywordPrefix="Launch pages for "
            text="Launch pages for startups, agencies, product teams, and founders."
            className="font-heading text-foreground [&_[data-slot=hero-text-animation-rotating-keyword]]:text-primary mx-auto mt-7 max-w-2xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.06] font-semibold tracking-tight text-balance [&_[data-slot=hero-text-animation-motion]]:justify-center"
          />

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-7 @min-[480px]/hero:text-lg">
            One flexible page builder that speaks every team&apos;s language.
            Ship a launch that fits the audience — without a redesign for each
            one.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
            aria-hidden="true"
          >
            <span className="text-muted-foreground mr-1 text-xs font-medium tracking-wide uppercase">
              Built for
            </span>
            {audiences.map((audience) => (
              <span
                key={audience}
                className="border-border bg-background text-foreground inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium"
              >
                {audience}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 @min-[480px]/hero:flex-row">
            <Button asChild size="lg" rightIcon={<ArrowRight />}>
              <a href="#installation-heading">Start building free</a>
            </Button>
            <Button asChild size="lg" variant="ghost" leftIcon={<Play />}>
              <a href="#examples-heading">Watch the tour</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <ul className="flex -space-x-2" aria-hidden="true">
              {teamAvatars.map(({ initials, tone }) => (
                <li
                  key={initials}
                  className={`border-background grid size-8 place-items-center rounded-full border-2 text-[11px] font-semibold ${tone}`}
                >
                  {initials}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-sm">
              Trusted across 12 departments at 4,000+ companies
            </p>
          </div>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
