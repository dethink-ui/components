"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LiquidMeshBackground,
  SilkFlowBackground,
  CausticLightBackground,
  ContourFieldBackground,
  OrbitalGlowBackground,
  type ShaderBackgroundEffect,
  type ShaderBackgroundProps,
} from "@dethink/components";

const backgrounds = {
  "liquid-mesh": {
    Component: LiquidMeshBackground,
    name: "Liquid Mesh",
    eyebrow: "COLOR IN MOTION",
    headline: "Let your ideas flow.",
    description: "Soft gradients that make room for something new.",
  },
  "silk-flow": {
    Component: SilkFlowBackground,
    name: "Silk Flow",
    eyebrow: "A DIFFERENT TEXTURE",
    headline: "Made to feel different.",
    description: "Light catches every fold. Details make the difference.",
  },
  "caustic-light": {
    Component: CausticLightBackground,
    name: "Caustic Light",
    eyebrow: "BENEATH THE SURFACE",
    headline: "See things in a new light.",
    description: "A quieter kind of energy, moving just below the surface.",
  },
  "contour-field": {
    Component: ContourFieldBackground,
    name: "Contour Field",
    eyebrow: "EXPLORE THE POSSIBILITIES",
    headline: "Find your next direction.",
    description: "A changing landscape for ideas that keep moving.",
  },
  "orbital-glow": {
    Component: OrbitalGlowBackground,
    name: "Orbital Glow",
    eyebrow: "YOUR NEXT CHAPTER",
    headline: "A world around your work.",
    description:
      "Bring your ideas into focus. Let everything else fall into place.",
  },
};

export function ShaderBackgroundPreview({
  effect,
  compact = false,
}: {
  effect: ShaderBackgroundEffect;
  compact?: boolean;
}) {
  const [paused, setPaused] = useState(false),
    [dark, setDark] = useState(true),
    [interactive, setInteractive] = useState(false);
  const [speed, setSpeed] = useState<ShaderBackgroundProps["speed"]>("normal"),
    [intensity, setIntensity] =
      useState<ShaderBackgroundProps["intensity"]>("bold");
  const [seed, setSeed] = useState(1),
    [joined, setJoined] = useState(false);
  const { Component, name, eyebrow, headline, description } =
    backgrounds[effect];
  return (
    <section
      data-preview={effect}
      data-theme={dark ? "dark" : "light"}
      className="border-border bg-background text-foreground overflow-hidden rounded-2xl border"
    >
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {name}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            className="border-border focus-visible:outline-ring rounded-md border px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            {paused ? "Resume animation" : "Pause animation"}
          </button>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-pressed={dark}
            className="border-border focus-visible:outline-ring rounded-md border px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            Dark theme
          </button>
          <button
            type="button"
            onClick={() => setInteractive(!interactive)}
            aria-pressed={interactive}
            className="border-border focus-visible:outline-ring rounded-md border px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            Mouse parallax
          </button>
        </div>
      </div>
      <Component
        animate={!paused}
        interactive={interactive}
        speed={speed}
        intensity={intensity}
        seed={seed}
        className="min-h-[420px]"
      >
        <div className="from-background/80 via-background/30 relative flex min-h-[420px] items-center bg-linear-to-r to-transparent px-6 py-16 sm:px-12">
          <div className="max-w-xl">
            <p className="text-foreground/70 mb-6 font-mono text-[10px] tracking-[0.2em]">
              {eyebrow}
            </p>
            <h2 className="text-foreground max-w-lg text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl">
              {headline}
            </h2>
            <p className="text-foreground/75 mt-5 max-w-sm text-sm leading-relaxed">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setJoined(!joined)}
                className="bg-foreground text-background focus-visible:outline-ring rounded-full px-5 py-2.5 text-sm font-medium focus-visible:outline-2"
              >
                {joined ? "You're on the list" : "Join the preview"}
              </button>
              <Link
                href={`/components/${effect}-background#installation`}
                className="text-foreground focus-visible:outline-ring rounded px-1 py-2 text-xs underline underline-offset-4 focus-visible:outline-2"
              >
                Use this background
              </Link>
            </div>
            <p
              role="status"
              className="text-foreground/70 mt-3 min-h-5 text-xs"
            >
              {joined ? "Demo confirmed. No information was sent." : ""}
            </p>
          </div>
        </div>
      </Component>
      {!compact && (
        <div className="border-border text-muted-foreground flex flex-wrap items-center gap-5 border-t px-5 py-4 text-xs">
          <label className="flex items-center gap-2">
            Speed{" "}
            <select
              aria-label="Animation speed"
              value={speed}
              onChange={(e) =>
                setSpeed(e.target.value as ShaderBackgroundProps["speed"])
              }
              className="border-border bg-background text-foreground rounded border px-2 py-1"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Intensity{" "}
            <select
              aria-label="Effect intensity"
              value={intensity}
              onChange={(e) =>
                setIntensity(
                  e.target.value as ShaderBackgroundProps["intensity"],
                )
              }
              className="border-border bg-background text-foreground rounded border px-2 py-1"
            >
              <option value="faint">Faint</option>
              <option value="subtle">Subtle</option>
              <option value="bold">Bold</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setSeed(seed + 1)}
            className="border-border focus-visible:outline-ring rounded border px-3 py-1.5 focus-visible:outline-2"
          >
            New composition
          </button>
        </div>
      )}
    </section>
  );
}
