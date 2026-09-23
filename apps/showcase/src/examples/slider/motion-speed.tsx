"use client";
import { useState, useSyncExternalStore } from "react";
import { Button, ExpressiveSlider } from "@dethink/components";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Pause, Play } from "lucide-react";
import { speedSteps } from "./speed-steps";

const subscribe = () => () => {};
const client = () => true;
const server = () => false;

export function SliderMotionSpeed() {
  const [speed, setSpeed] = useState(1);
  const [pauseOverride, setPauseOverride] = useState<boolean | null>(null);
  const hydrated = useSyncExternalStore(subscribe, client, server);
  const reduced = useReducedMotion();
  const paused = pauseOverride ?? (!hydrated || reduced !== false);
  const rotation = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (!paused && speed > 0)
      rotation.set((rotation.get() + Math.min(delta, 50) * speed * 0.03) % 360);
  });
  const selected = speedSteps.find((step) => step.value === speed)!;
  return (
    <div className="border-border bg-background mx-auto w-full max-w-lg overflow-hidden rounded-3xl border shadow-sm">
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase">
            A little momentum
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            Find your rhythm
          </h3>
        </div>
        <Button
          size="sm"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap"
          leftIcon={
            paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />
          }
          variant="outline"
          onClick={() => setPauseOverride(!paused)}
          aria-label={paused ? "Play motion preview" : "Pause motion preview"}
        >
          {paused ? "Play" : "Pause"}
        </Button>
      </div>
      <div
        className="relative isolate flex h-64 items-center justify-center overflow-hidden"
        data-slot="motion-preview"
        data-paused={paused}
        data-speed={speed}
      >
        <div
          aria-hidden="true"
          className="bg-primary/10 absolute size-40 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="border-primary/10 absolute size-56 rounded-full border border-dashed"
        />
        <div
          aria-hidden="true"
          className="border-primary/20 absolute size-40 rounded-full border"
        />
        <motion.div
          aria-hidden="true"
          data-slot="motion-orbit"
          style={{ rotate: rotation }}
          className="pointer-events-none absolute size-40 rounded-full"
        >
          <span className="border-background bg-primary absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border-[3px] shadow-[0_0_18px_color-mix(in_srgb,var(--dt-color-primary)_45%,transparent)]" />
          <span className="bg-primary/30 absolute top-1/2 -right-1 size-2 -translate-y-1/2 rounded-full" />
        </motion.div>
        <div className="relative text-center">
          <p className="text-3xl font-semibold tracking-tight">
            {selected.label}
          </p>
          <p className="text-muted-foreground mt-1 text-xs tabular-nums">
            {speed === 0 ? "Room to breathe" : `${speed.toFixed(1)}× your pace`}
          </p>
        </div>
      </div>
      <div className="border-border bg-muted/20 border-t px-6 pt-6 pb-7">
        <ExpressiveSlider
          label="Motion speed"
          mode="stepper"
          steps={speedSteps}
          value={speed}
          onValueChange={setSpeed}
          size="xl"
          valueDisplay="inline"
          description="Five stops. A rhythm for every moment."
        />
        <p className="text-muted-foreground mt-4 text-[11px]">
          {paused
            ? "Preview paused — adjust freely, then press Play."
            : speed === 0
              ? "Stillness is a setting, too."
              : "Drag slowly. Feel each milestone settle into place."}
        </p>
      </div>
    </div>
  );
}
