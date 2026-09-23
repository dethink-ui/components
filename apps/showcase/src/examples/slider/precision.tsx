"use client";
import { useState } from "react";
import { Slider } from "@dethink/components";

export function SliderPrecision() {
  const [value, setValue] = useState(1.25);
  const [committed, setCommitted] = useState(1.25);
  return (
    <div className="border-border bg-background mx-auto w-full max-w-md rounded-2xl border p-6 shadow-sm">
      <p className="text-muted-foreground mb-5 text-xs font-medium tracking-widest uppercase">
        Fine tuning
      </p>
      <Slider
        label="Playback speed"
        min={0.25}
        max={3}
        step={0.25}
        value={value}
        onValueChange={setValue}
        onValueCommit={setCommitted}
        formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        description="Adjust in quarter-speed increments. Release to apply."
      />
      <p className="border-border text-muted-foreground mt-5 border-t pt-4 text-xs">
        Applied speed{" "}
        <span className="text-foreground float-end font-medium tabular-nums">
          {committed.toFixed(2)}×
        </span>
      </p>
    </div>
  );
}
