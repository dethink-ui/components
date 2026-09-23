"use client";
import { Slider } from "@dethink/components";
import { speedSteps } from "./speed-steps";
export function SliderStepper() {
  return (
    <div className="border-border bg-background mx-auto grid w-full max-w-md gap-8 rounded-2xl border p-6">
      <Slider
        label="Movement"
        mode="stepper"
        steps={speedSteps}
        defaultValue={1}
        description="Meaningful choices, precise values underneath."
      />
      <Slider
        label="Endpoint labels"
        mode="stepper"
        steps={speedSteps.map((step, index) => ({
          ...step,
          showLabel: index === 0 || index === speedSteps.length - 1,
        }))}
        defaultValue={0.5}
      />
      <Slider<[number, number]>
        label="Allowed speed range"
        mode="stepper"
        steps={speedSteps}
        defaultValue={[0.5, 2]}
        thumbLabels={["Slowest", "Fastest"]}
      />
    </div>
  );
}
