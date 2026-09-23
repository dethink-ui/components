"use client";

import { Quote } from "lucide-react";
import { useId, useState } from "react";
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

const testimonials = [
  {
    initials: "AL",
    name: "Avery Lin",
    quote:
      "The carousel gave our case studies a real sense of pace. Every customer story feels focused, but never isolated from the rest.",
    role: "Design Director, Northstar",
    tone: "bg-primary text-primary-foreground",
  },
  {
    initials: "JM",
    name: "Jordan Mendez",
    quote:
      "We now show the evidence behind a release without burying someone in tabs, accordions, and a dozen tiny cards.",
    role: "Product Lead, Meridian",
    tone: "bg-info text-info-foreground",
  },
  {
    initials: "SP",
    name: "Samira Patel",
    quote:
      "It has the energy of a presentation, with the accessibility and control model our application teams expect from a real component.",
    role: "Staff Engineer, Fieldwork",
    tone: "bg-success text-success-foreground",
  },
] as const;

export function CarouselTestimonials() {
  const [staging, setStaging] = useState<CarouselStaging>("fan");
  return (
    <div className="space-y-7">
      <div className="mx-auto max-w-xl space-y-2 text-center">
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          Customer voice
        </p>
        <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Let the proof take the stage.
        </h3>
      </div>

      <CarouselModeControls value={staging} onChange={setStaging} />
      <Carousel
        aria-label="Customer testimonials"
        defaultIndex={1}
        staging={staging}
        className="[&_[data-active=true]_figure]:border-primary/60 mx-auto max-w-5xl"
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.name}>
              <figure className="border-border bg-background shadow-foreground/5 flex min-h-[23rem] w-full flex-col rounded-2xl border p-5 shadow-xl sm:p-7">
                <div className="flex items-center justify-between">
                  <Quote aria-hidden="true" className="text-primary size-6" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Customer story
                  </span>
                </div>
                <blockquote className="font-heading my-7 text-lg leading-relaxed font-medium tracking-tight sm:text-xl">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t pt-5">
                  <span
                    aria-hidden="true"
                    className={`${testimonial.tone} flex size-10 items-center justify-center rounded-full text-xs font-bold`}
                  >
                    {testimonial.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {testimonial.name}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {testimonial.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-8 flex items-center justify-center gap-3">
          <CarouselPrevious size="lg" />
          <CarouselDots
            label={(index) =>
              `Show testimonial from ${testimonials[index].name}`
            }
          />
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
