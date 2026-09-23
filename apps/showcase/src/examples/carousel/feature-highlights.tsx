"use client";

import { useId, useState } from "react";

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
  useCarousel,
  type CarouselStaging,
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
  const [staging, setStaging] = useState<CarouselStaging>("ribbon");
  return (
    <div className="space-y-7">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Product storytelling
        </p>
        <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Good ideas never stand still.
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          Give every capability a focused moment, then let the surrounding cards
          suggest the bigger system behind it.
        </p>
      </div>

      <CarouselModeControls value={staging} onChange={setStaging} />
      <Carousel
        aria-label="Product capabilities"
        defaultIndex={1}
        staging={staging}
        className="[&_[data-active=true]_article]:border-primary/60 mx-auto max-w-5xl"
      >
        <CarouselContent>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <CarouselItem key={feature.title}>
                <article className="border-border bg-background shadow-foreground/5 flex min-h-[23rem] w-full flex-col rounded-2xl border p-5 shadow-xl sm:p-6">
                  <div>
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <p className="text-primary mt-6 text-xs font-semibold tracking-[0.12em] uppercase">
                      {feature.eyebrow}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col pt-4">
                    <h4 className="font-heading text-xl font-semibold tracking-tight">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground mt-3 mb-7 text-sm leading-6">
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
          <CarouselPrevious size="lg" />
          <CarouselDots label={(index) => `Show ${features[index].title}`} />
          <CarouselNext size="lg" />
        </div>
        <CarouselPosition />
      </Carousel>
    </div>
  );
}

function CarouselModeControls({
  value,
  onChange,
}: {
  value: CarouselStaging;
  onChange: (value: CarouselStaging) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <label htmlFor={id} className="text-muted-foreground text-sm">
        Presentation
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as CarouselStaging)}
        className="border-border bg-background text-foreground focus-visible:outline-ring min-h-11 rounded-lg border px-3 text-sm focus-visible:outline-2"
      >
        <option value="fan">Fanned deck</option>
        <option value="arc">Curved gallery</option>
        <option value="ribbon">Kinetic ribbon</option>
        <option value="flat">Flat</option>
        <option value="tilt">Tilt</option>
        <option value="floor">Floor</option>
      </select>
    </div>
  );
}

function CarouselPosition() {
  const { index, count } = useCarousel();
  return (
    <p
      className="text-muted-foreground mt-3 text-center text-xs tabular-nums"
      aria-hidden="true"
    >
      {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
    </p>
  );
}
