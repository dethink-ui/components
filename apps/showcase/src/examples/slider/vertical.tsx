"use client";

import { useState } from "react";
import { Slider, ExpressiveSlider } from "@dethink/components";

export function SliderVertical() {
  const [levels, setLevels] = useState([72, 48, 64]);
  return (
    <div className="w-full space-y-8">
      <div className="border-border bg-background rounded-2xl border p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Studio / 01
            </p>
            <h3 className="mt-2 text-lg font-semibold">Find your balance</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Three channels. One quieter workspace.
            </p>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            onClick={() => setLevels([72, 48, 64])}
          >
            Reset mix
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-8">
          {["Voice", "Music", "Ambience"].map((label, index) => (
            <Slider
              key={label}
              label={label}
              orientation="vertical"
              size="xl"
              value={levels[index]}
              onValueChange={(next) =>
                setLevels((current) =>
                  current.map((value, i) => (i === index ? next : value)),
                )
              }
              className="[--dt-slider-track-length:10rem] [&_[data-slot=slider-output]]:hidden"
            />
          ))}
        </div>
        <p className="text-muted-foreground mt-5 text-center text-xs tabular-nums">
          Voice {levels[0]} · Music {levels[1]} · Ambience {levels[2]}
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Slider<[number, number]>
          label="Comfort zone"
          orientation="vertical"
          defaultValue={[18, 26]}
          min={10}
          max={35}
          formatOptions={{ style: "unit", unit: "celsius" }}
          description="Set a lower and upper temperature."
        />
        <ExpressiveSlider
          label="Focus level"
          orientation="vertical"
          mode="stepper"
          defaultValue={1}
          steps={[
            { value: 0, label: "Quiet" },
            { value: 1, label: "Balanced" },
            { value: 4, label: "Deep" },
          ]}
          description="Named presets keep the choice simple."
        />
      </div>
    </div>
  );
}
