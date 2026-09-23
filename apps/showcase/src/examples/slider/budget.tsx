"use client";
import { useState } from "react";
import { Slider } from "@dethink/components";

export function SliderBudget() {
  const [budget, setBudget] = useState<[number, number]>([1200, 3600]);
  return (
    <div className="border-border bg-background mx-auto w-full max-w-md rounded-2xl border p-6 shadow-sm">
      <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
        Make room for what matters
      </p>
      <h3 className="mt-2 mb-6 text-xl font-semibold tracking-tight">
        Find your sweet spot.
      </h3>
      <Slider<[number, number]>
        label="Monthly budget"
        valueDisplay="floating"
        min={0}
        max={5000}
        step={100}
        value={budget}
        onValueChange={setBudget}
        name={["budgetMin", "budgetMax"]}
        formatOptions={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
      />
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        Explore plans between{" "}
        <strong className="text-foreground font-medium">
          ${budget[0].toLocaleString("en-US")}
        </strong>{" "}
        and{" "}
        <strong className="text-foreground font-medium">
          ${budget[1].toLocaleString("en-US")}
        </strong>{" "}
        per month.
      </p>
    </div>
  );
}
