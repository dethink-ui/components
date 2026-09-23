"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import {
  ArrowUpRight,
  AudioLines,
  Command,
  Globe2,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function HeroTextAnimationOrbitHero() {
  const reducedMotion = useReducedMotion();
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="orbit-hero-heading"
        className="bg-background text-foreground @container/hero relative isolate overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="bg-primary/10 pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full blur-3xl"
        />
        <header className="border-border flex items-center justify-between border-b px-6 py-5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Command className="text-primary size-5" aria-hidden="true" /> Orbit
          </span>
          <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
            A little less friction
          </span>
        </header>
        <div className="grid items-center gap-8 px-6 py-14 @min-[800px]/hero:grid-cols-2 @min-[800px]/hero:px-12 @min-[800px]/hero:py-20">
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium tracking-[0.18em] uppercase">
              Your ideas, connected
            </p>
            {/* eslint-disable-next-line jsx-a11y/heading-has-content -- The component renders its text prop as accessible heading content. */}
            <HeroTextAnimation
              as="h2"
              id="orbit-hero-heading"
              animation="blur-focus"
              splitBy="word"
              trigger="in-view"
              reducedMotionStrategy="static"
              stagger={0.12}
              text="Less busywork. More possibility."
              className="font-heading mt-6 text-[clamp(2rem,5.5cqi,4rem)] leading-[1.08] font-semibold tracking-tight"
            />
            <p className="text-muted-foreground mt-6 max-w-md text-base leading-7">
              Bring your notes, conversations, and next big idea into one
              beautifully connected workspace.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8"
              rightIcon={<ArrowUpRight />}
            >
              <a href="#installation-heading">Find your flow</a>
            </Button>
            <p className="text-muted-foreground mt-5 text-xs">
              One space. Room for everything.
            </p>
          </div>
          <motion.div
            aria-hidden="true"
            initial={false}
            whileInView={
              reducedMotion ? {} : { rotate: [-12, 0], scale: [0.94, 1] }
            }
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto aspect-square w-full max-w-96 motion-reduce:transform-none!"
          >
            <div className="border-primary/20 absolute inset-2 rounded-full border" />
            <div className="border-primary/15 absolute inset-12 rounded-full border border-dashed" />
            <div className="bg-primary/5 border-primary/20 absolute inset-24 rounded-full border" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="bg-primary text-primary-foreground grid size-20 place-items-center rounded-3xl shadow-xl">
                <Command className="size-9" />
              </span>
            </div>
            {[
              {
                Icon: Sparkles,
                label: "Ideas",
                position: "top-4 left-1/2 -translate-x-1/2",
              },
              {
                Icon: AudioLines,
                label: "Conversations",
                position: "bottom-16 left-0",
              },
              {
                Icon: Globe2,
                label: "Your world",
                position: "right-0 top-1/2",
              },
            ].map(({ Icon, label, position }) => (
              <div
                key={label}
                className={`bg-background border-border absolute flex items-center gap-2 rounded-xl border p-3 shadow-sm ${position}`}
              >
                <Icon className="text-primary size-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
