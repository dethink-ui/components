"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight, Star, TrendingUp } from "lucide-react";

const metrics = [
  { value: "2.4×", label: "more pipeline from the same traffic" },
  { value: "−38%", label: "wasted ad spend in 60 days" },
  { value: "6 min", label: "to launch your first test" },
];

export function HeroTextAnimationKineticEmphasisPopHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-kinetic-emphasis-heading"
        className="bg-background text-foreground border-border @container/hero overflow-hidden rounded-md border"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 text-center @min-[480px]/hero:px-8 @min-[900px]/hero:py-20">
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="fill-warning text-warning size-4"
                />
              ))}
            </span>
            <span>
              Rated <span className="text-foreground font-semibold">4.9/5</span>{" "}
              by 4,000+ growth teams
            </span>
          </div>

          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            trigger="in-view"
            reducedMotionStrategy="static"
            animation="kinetic-emphasis-pop"
            duration={0.5}
            stagger={0.07}
            emphasisWords={["revenue", "faster"]}
            id="hero-text-kinetic-emphasis-heading"
            text="Turn more visitors into revenue, faster."
            className="font-heading text-foreground mx-auto mt-6 max-w-2xl text-[clamp(1.875rem,5.5cqi,3.75rem)] leading-[1.06] font-semibold tracking-tight text-balance"
          />

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-7 @min-[480px]/hero:text-lg">
            Run experiments on every headline, offer, and CTA — then let the
            winners ship themselves. Built for teams that grow on evidence, not
            opinions.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 @min-[480px]/hero:flex-row">
            <Button asChild size="lg" rightIcon={<ArrowRight />}>
              <a href="#installation-heading">Start free trial</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#examples-heading">Book a demo</a>
            </Button>
          </div>
        </div>

        <dl className="border-border grid border-t @min-[480px]/hero:grid-cols-3">
          {metrics.map(({ value, label }, position) => (
            <div
              key={label}
              className={`px-5 py-8 text-center @min-[480px]/hero:px-8 ${
                position > 0
                  ? "border-border border-t @min-[480px]/hero:border-t-0 @min-[480px]/hero:border-l"
                  : ""
              }`}
            >
              <dt className="text-primary font-heading inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight @min-[480px]/hero:text-4xl">
                {position === 0 ? (
                  <TrendingUp aria-hidden="true" className="size-6" />
                ) : null}
                {value}
              </dt>
              <dd className="text-muted-foreground mx-auto mt-2 max-w-[16rem] text-sm leading-6">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </HeroTextAnimationProvider>
  );
}
