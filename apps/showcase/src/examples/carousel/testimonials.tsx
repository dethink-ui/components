"use client";

import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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

      <Carousel
        aria-label="Customer testimonials"
        defaultIndex={1}
        intensity="subtle"
        staging="floor"
        className="mx-auto max-w-5xl"
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.name}>
              <figure className="border-border bg-card flex h-[23rem] w-full flex-col rounded-2xl border p-7 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between">
                  <Quote aria-hidden="true" className="text-primary size-6" />
                  <span className="text-muted-foreground text-xs font-medium">
                    Customer story
                  </span>
                </div>
                <blockquote className="font-heading mt-7 text-xl leading-8 font-medium tracking-tight">
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
          <CarouselPrevious />
          <CarouselDots
            label={(index) =>
              `Show testimonial from ${testimonials[index].name}`
            }
          />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
