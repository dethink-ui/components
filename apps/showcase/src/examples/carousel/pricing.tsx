"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@dethink/components";

const plans = [
  {
    description: "For a small crew finding its rhythm.",
    features: [
      "Up to 5 collaborators",
      "Unlimited projects",
      "Weekly snapshots",
    ],
    name: "Starter",
    price: "$0",
  },
  {
    description: "For the team connecting strategy to delivery.",
    features: [
      "Unlimited collaborators",
      "Goals and roadmaps",
      "Priority support",
    ],
    name: "Growth",
    price: "$24",
  },
  {
    description: "For an organization ready to standardize work.",
    features: [
      "Advanced permissions",
      "SAML single sign-on",
      "Success partner",
    ],
    name: "Scale",
    price: "Custom",
  },
] as const;

export function CarouselPricing() {
  const [index, setIndex] = useState(1);
  const selectedPlan = plans[index];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Plan explorer
          </p>
          <h3 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
            A price conversation with room to breathe.
          </h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Billed monthly · cancel anytime
        </p>
      </div>

      <Carousel
        aria-label="Subscription plans"
        index={index}
        intensity="standard"
        onIndexChange={setIndex}
        staging="tilt"
        className="mx-auto max-w-5xl"
      >
        <CarouselContent>
          {plans.map((plan) => (
            <CarouselItem key={plan.name}>
              <section className="border-border bg-card flex h-[27rem] w-full flex-col rounded-2xl border p-6 shadow-xl shadow-black/5">
                <div className="flex min-h-7 items-center justify-between gap-3">
                  <p className="font-heading text-lg font-semibold">
                    {plan.name}
                  </p>
                  {plan.name === "Growth" ? (
                    <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide uppercase">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-3 min-h-12 text-sm leading-6">
                  {plan.description}
                </p>
                <p className="font-heading mt-6 text-4xl font-semibold tracking-tight">
                  {plan.price}
                  {plan.price.startsWith("$") ? (
                    <span className="text-muted-foreground ml-1 text-sm font-normal">
                      / month
                    </span>
                  ) : null}
                </p>
                <ul className="mt-7 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        aria-hidden="true"
                        className="text-success mt-0.5 size-4 shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground mt-auto border-t pt-4 text-xs">
                  Use the controls, dots, or a swipe to compare.
                </p>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-7 flex items-center justify-center gap-3">
          <CarouselPrevious />
          <CarouselDots
            label={(planIndex) => `Show ${plans[planIndex].name} plan`}
          />
          <CarouselNext />
        </div>
      </Carousel>

      <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm" aria-live="polite">
          <span className="font-medium">{selectedPlan.name}</span>
          <span className="text-muted-foreground"> is in focus</span>
        </p>
        <Button size="sm">Continue with {selectedPlan.name}</Button>
      </div>
    </div>
  );
}
