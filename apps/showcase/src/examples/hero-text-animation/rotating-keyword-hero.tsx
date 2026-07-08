"use client";

import { useEffect, useState } from "react";
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
const rotatingKeywords = ["startups.", "agencies.", "product teams.", "founders."];
const rotateIntervalMs = 2000;

const teamAvatars = [
  { initials: "SO", tone: "bg-primary/15 text-primary" },
  { initials: "CS", tone: "bg-info/15 text-info" },
  { initials: "FL", tone: "bg-success/15 text-success" },
  { initials: "PM", tone: "bg-warning/20 text-warning" },
  { initials: "OP", tone: "bg-muted text-muted-foreground" },
];

export function HeroTextAnimationRotatingKeywordHero() {
  const [keywordIndex, setKeywordIndex] = useState(0);

  // Loop the keyword indefinitely for the showcase. The component's built-in
  // autoRotateKeywords stops after ~5s (a WCAG 2.2.2 guard against text that
  // moves forever), so we drive the index ourselves in controlled mode to keep
  // the demo playing — while still honoring prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setKeywordIndex((index) => (index + 1) % rotatingKeywords.length);
    }, rotateIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-rotating-keyword-heading"
        className="bg-background text-foreground border-border overflow-hidden rounded-md border"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span aria-hidden="true" className="bg-primary size-1.5 rounded-full" />
            One builder · every team
          </span>

          <HeroTextAnimation
            animation="rotating-keyword"
            ariaLabel="Launch pages for startups, agencies, product teams, and founders."
            duration={0.34}
            id="hero-text-rotating-keyword-heading"
            rotatingKeywordIndex={keywordIndex}
            rotatingKeywordOptions={rotatingKeywords}
            rotatingKeywordPrefix="Launch pages for "
            text="Launch pages for startups, agencies, product teams, and founders."
            className="font-heading text-foreground mx-auto mt-7 max-w-2xl text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl [&_[data-slot=hero-text-animation-motion]]:justify-center [&_[data-slot=hero-text-animation-rotating-keyword]]:text-primary"
          />

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg">
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

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" rightIcon={<ArrowRight />}>
              <a href="#installation">Start building free</a>
            </Button>
            <Button asChild size="lg" variant="ghost" leftIcon={<Play />}>
              <a href="#examples">Watch the tour</a>
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
