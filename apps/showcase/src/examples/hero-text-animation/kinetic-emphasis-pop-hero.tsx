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
        className="bg-background text-foreground border-border overflow-hidden rounded-md border"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-20">
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

          <HeroTextAnimation
            animation="kinetic-emphasis-pop"
            duration={0.5}
            stagger={0.07}
            emphasisWords={["revenue", "faster"]}
            id="hero-text-kinetic-emphasis-heading"
            repeat
            repeatDelay={2}
            text="Turn more visitors into revenue, faster."
            className="font-heading text-foreground mx-auto mt-6 max-w-2xl text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          />

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg">
            Run experiments on every headline, offer, and CTA — then let the
            winners ship themselves. Built for teams that grow on evidence, not
            opinions.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" rightIcon={<ArrowRight />}>
              <a href="#installation">Start free trial</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#examples">Book a demo</a>
            </Button>
          </div>
        </div>

        <dl className="border-border grid border-t sm:grid-cols-3">
          {metrics.map(({ value, label }, position) => (
            <div
              key={label}
              className={`px-5 py-8 text-center sm:px-8 ${
                position > 0
                  ? "border-border border-t sm:border-t-0 sm:border-l"
                  : ""
              }`}
            >
              <dt className="text-primary font-heading inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
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
