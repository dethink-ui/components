"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
} from "@dethink/components";

const plans = [
  {
    value: "launch",
    name: "Launch",
    description: "For solo builders shipping their first product.",
    price: "$19",
    eyebrow: null,
    features: ["3 projects", "10 GB storage", "Community support"],
  },
  {
    value: "grow",
    name: "Grow",
    description: "For teams building a repeatable growth engine.",
    price: "$49",
    eyebrow: "Most popular",
    features: ["Unlimited projects", "100 GB storage", "Priority support"],
  },
  {
    value: "scale",
    name: "Scale",
    description: "For companies standardizing how work gets shipped.",
    price: "$99",
    eyebrow: null,
    features: ["Advanced roles", "500 GB storage", "SAML SSO"],
  },
  {
    value: "enterprise",
    name: "Enterprise",
    description: "For regulated organizations with custom needs.",
    price: "Custom",
    eyebrow: null,
    features: ["Custom controls", "Dedicated region", "24/7 support"],
  },
] as const;

export function CardScrollerPricing() {
  const [selectedPlan, setSelectedPlan] = useState("grow");
  const plan = plans.find((entry) => entry.value === selectedPlan) ?? plans[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Choose your plan
          </p>
          <h3 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
            Start small. Upgrade when you need to.
          </h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Billed monthly · cancel anytime
        </p>
      </div>

      <CardScroller
        aria-label="Choose a subscription plan"
        maxVisibleCards={3}
        overlap
        value={selectedPlan}
        onValueChange={setSelectedPlan}
      >
        {plans.map((entry) => (
          <CardScrollerItem
            key={entry.value}
            value={entry.value}
            label={`Select the ${entry.name} plan`}
          >
            <Card as="article" className="min-h-[22rem]" shadow="none">
              <CardHeader>
                <div className="min-h-5">
                  {entry.eyebrow ? (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase">
                      {entry.eyebrow}
                    </span>
                  ) : null}
                </div>
                <CardTitle className="mt-2 text-xl">{entry.name}</CardTitle>
                <CardDescription>{entry.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                <p className="font-heading text-3xl font-bold tracking-tight">
                  {entry.price}
                  {entry.price.startsWith("$") ? (
                    <span className="text-muted-foreground ml-1 text-sm font-normal">
                      / month
                    </span>
                  ) : null}
                </p>
                <ul
                  className="space-y-3 text-sm"
                  aria-label={`${entry.name} features`}
                >
                  {entry.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        aria-hidden="true"
                        className="text-primary mt-0.5 size-4 shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <span className="text-muted-foreground text-xs">
                  Select anywhere on this card
                </span>
              </CardFooter>
            </Card>
          </CardScrollerItem>
        ))}
      </CardScroller>

      <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm" aria-live="polite">
          <span className="font-medium">{plan.name}</span>
          <span className="text-muted-foreground"> is selected</span>
        </p>
        <Button size="sm">Continue with {plan.name}</Button>
      </div>
    </div>
  );
}
