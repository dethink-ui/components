"use client";

import { useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@dethink/components";

const plans = [
  {
    value: "starter",
    name: "Starter",
    price: "$0",
    blurb: "Two projects, community support.",
  },
  {
    value: "team",
    name: "Team",
    price: "$29",
    blurb: "Unlimited projects, shared themes.",
  },
  {
    value: "scale",
    name: "Scale",
    price: "$99",
    blurb: "SSO, audit log, priority support.",
  },
];

/**
 * The radio stays a real, focusable input — the surrounding label just grows
 * into a card. Selection styling hangs off the same state via peer classes,
 * so keyboard behavior is native RadioGroup behavior.
 */
export function RadioGroupRecipePlanPicker() {
  const id = useId();
  const [plan, setPlan] = useState("team");

  return (
    <div className="mx-auto max-w-md space-y-3">
      <RadioGroup
        name="plan"
        aria-label="Pricing plan"
        value={plan}
        onValueChange={setPlan}
        className="grid gap-3"
      >
        {plans.map((entry) => (
          <label
            key={entry.value}
            htmlFor={`${id}-${entry.value}`}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              plan === entry.value
                ? "border-primary bg-primary/[0.06]"
                : "border-border hover:border-primary/40"
            }`}
          >
            <RadioGroupItem
              id={`${id}-${entry.value}`}
              value={entry.value}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="flex items-baseline justify-between">
                <span className="font-heading font-semibold">{entry.name}</span>
                <span className="text-muted-foreground text-sm">
                  {entry.price}/mo
                </span>
              </span>
              <span className="text-muted-foreground mt-1 block text-sm">
                {entry.blurb}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>
      <p className="text-muted-foreground text-sm">
        Selected: {plans.find((entry) => entry.value === plan)?.name}
      </p>
    </div>
  );
}
