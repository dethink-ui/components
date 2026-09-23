"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const bars = [28, 42, 35, 56, 48, 63, 54, 76, 68, 86, 79, 98];

export function HeroTextAnimationAnalyticsHero() {
  const reducedMotion = useReducedMotion();
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="analytics-hero-heading"
        className="bg-background text-foreground @container/hero relative overflow-hidden px-6 pt-12 @min-[600px]/hero:px-12 @min-[600px]/hero:pt-16"
      >
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="border-border bg-muted/40 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
            <ChartNoAxesCombined
              aria-hidden="true"
              className="text-primary size-4"
            />{" "}
            Clarity for your next chapter
          </span>
          {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
          <HeroTextAnimation
            as="h2"
            id="analytics-hero-heading"
            animation="kinetic-emphasis-pop"
            emphasisWords={["signal."]}
            trigger="in-view"
            reducedMotionStrategy="static"
            text="Big ambition. Clear signal."
            className="font-heading mt-7 text-[clamp(2rem,6cqi,4rem)] leading-[1.1] font-semibold tracking-tight"
          />
          <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-base leading-7">
            Every metric tells a story. See what is working, find your next
            opportunity, and move forward with confidence.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild rightIcon={<ArrowRight />}>
              <a href="#installation-heading">Build your dashboard</a>
            </Button>
            <Button asChild variant="outline">
              <a href="#props-heading">Explore the API</a>
            </Button>
          </div>
        </div>
        <div className="border-border bg-muted/20 relative mx-auto mt-12 max-w-3xl rounded-t-2xl border border-b-0 p-4 shadow-xl @min-[600px]/hero:p-7">
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-5">
            <span className="text-sm font-medium">Growth overview</span>
            <span className="text-muted-foreground text-xs">
              Illustrative data · Last 12 months
            </span>
          </div>
          <div className="grid gap-6 pt-6 @min-[600px]/hero:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-muted-foreground text-xs">
                Annual recurring revenue
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                $128,400
              </p>
              <p className="text-primary mt-3 inline-flex items-center gap-1 text-xs">
                <ArrowUpRight aria-hidden="true" className="size-3.5" /> 32.8%
                this year
              </p>
            </div>
            <div
              role="img"
              aria-label="Illustrative monthly growth chart trending upward over twelve months"
              className="flex h-40 items-end gap-2"
            >
              {bars.map((height, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  whileInView={
                    reducedMotion
                      ? {}
                      : { scaleY: [0.05, 1], opacity: [0.4, 1] }
                  }
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.045,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ height: `${height}%` }}
                  className="bg-primary/65 last:bg-primary min-w-0 flex-1 origin-bottom rounded-t motion-reduce:transform-none! motion-reduce:opacity-100!"
                />
              ))}
            </div>
          </div>
          <div className="text-muted-foreground border-border mt-4 flex justify-between border-t border-dashed pt-3 font-mono text-[10px]">
            <span>JAN</span>
            <span>DEC</span>
          </div>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
