"use client";

import {
  ChartNoAxesCombined,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@dethink/components";

const features = [
  {
    eyebrow: "Plan with context",
    icon: Layers3,
    metric: "8 active initiatives",
    summary:
      "Bring strategy, customer evidence, and the next decision into the same view.",
    title: "A roadmap that keeps its signal",
  },
  {
    eyebrow: "Ship with focus",
    icon: Sparkles,
    metric: "42% less status churn",
    summary:
      "Turn updates into shared momentum with a clear owner, timeline, and outcome.",
    title: "Progress everyone can trust",
  },
  {
    eyebrow: "Learn in the flow",
    icon: ChartNoAxesCombined,
    metric: "Weekly decision review",
    summary:
      "Connect the moments that changed the metric with the work that made them happen.",
    title: "From signal to a sharper next move",
  },
  {
    eyebrow: "Scale with care",
    icon: ShieldCheck,
    metric: "Built for complex teams",
    summary:
      "Give every handoff lasting context while keeping roles, policies, and ownership explicit.",
    title: "A calmer operating system",
  },
] as const;

export function CarouselFeatureHighlights() {
  return (
    <div className="space-y-7">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Product storytelling
        </p>
        <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Make a feature feel like a destination.
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          Give every capability a focused moment, then let the surrounding cards
          suggest the bigger system behind it.
        </p>
      </div>

      <Carousel
        aria-label="Product capabilities"
        defaultIndex={1}
        staging="tilt"
        className="mx-auto max-w-5xl"
      >
        <CarouselContent>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <CarouselItem key={feature.title}>
                <article className="border-border bg-card flex h-[23rem] w-full flex-col overflow-hidden rounded-2xl border shadow-xl shadow-black/5">
                  <div className="from-primary/20 via-primary/5 to-background relative min-h-40 overflow-hidden bg-gradient-to-br p-6">
                    <div className="bg-primary/15 absolute -top-12 -right-10 size-44 rounded-full blur-3xl" />
                    <div className="border-primary/15 bg-background/75 text-primary relative flex size-12 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <p className="text-muted-foreground relative mt-8 text-xs font-semibold tracking-[0.16em] uppercase">
                      {feature.eyebrow}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-6 pt-5">
                    <h4 className="font-heading text-xl font-semibold tracking-tight">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {feature.summary}
                    </p>
                    <p className="text-primary mt-auto border-t pt-4 text-xs font-semibold">
                      {feature.metric}
                    </p>
                  </div>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="mt-7 flex items-center justify-center gap-3">
          <CarouselPrevious />
          <CarouselDots label={(index) => `Show ${features[index].title}`} />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
