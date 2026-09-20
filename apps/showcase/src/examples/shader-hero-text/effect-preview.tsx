"use client";

import { useState } from "react";
import {
  ShaderHeroText,
  type ShaderHeroTextAnimation,
} from "@dethink/components";

const copy: Record<
  ShaderHeroTextAnimation,
  { label: string; text: string; description: string }
> = {
  "liquid-ripple": {
    label: "01 / Liquid ripple",
    text: "Make waves.\nLeave an impression.",
    description:
      "A ripple travels through the letters and settles into clarity.",
  },
  "chromatic-refraction": {
    label: "02 / Chromatic refraction",
    text: "A different\npoint of view.",
    description:
      "Prismatic edges separate, bend, and find their way back together.",
  },
  "noise-dissolve": {
    label: "03 / Noise dissolve",
    text: "Ideas take shape.",
    description:
      "An organic field of fragments resolves into a complete thought.",
  },
  "wave-distortion": {
    label: "04 / Wave distortion",
    text: "Nothing stands still.",
    description:
      "One broad wave passes through the headline before it comes to rest.",
  },
  "liquid-metal": {
    label: "05 / Liquid metal",
    text: "Forged in motion.",
    description:
      "Reflective bands move through the letterforms like polished metal.",
  },
  "particle-follow": {
    label: "06 / Particle follow",
    text: "A thousand points.\nOne idea.",
    description:
      "Move your mouse over the words. Nearby particles form a soft tail behind your pointer; the dots you leave behind return to their letters.",
  },
};

export function ShaderHeroTextPreview({
  animation = "particle-follow",
}: {
  animation?: ShaderHeroTextAnimation;
}) {
  const [replay, setReplay] = useState(0);
  const [staticText, setStaticText] = useState(false);
  const [dark, setDark] = useState(false);
  const [editing, setEditing] = useState(false);
  const [customText, setCustomText] = useState<string | null>(null);
  const item = copy[animation];
  return (
    <section
      data-preview={animation}
      data-theme={dark ? "dark" : "light"}
      className="border-border bg-background text-foreground relative w-full overflow-hidden rounded-2xl border"
    >
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {item.label}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            aria-expanded={editing}
            className="border-border focus-visible:outline-ring rounded-md border px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            Edit text
          </button>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-pressed={dark}
            className="border-border focus-visible:outline-ring rounded-md border px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setStaticText(!staticText)}
            aria-pressed={staticText}
            className="border-border focus-visible:outline-ring rounded-md border px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            Static
          </button>
          <button
            type="button"
            onClick={() => setReplay(replay + 1)}
            className="bg-primary text-primary-foreground focus-visible:outline-ring rounded-md px-3 py-1.5 text-xs focus-visible:outline-2"
          >
            {animation === "particle-follow" ? "Reset" : "Replay"}
          </button>
        </div>
      </div>
      {editing && (
        <label className="border-border text-muted-foreground block border-b px-6 py-4 text-xs">
          Headline text
          <textarea
            aria-label="Headline text"
            value={customText ?? item.text}
            maxLength={300}
            onChange={(event) => setCustomText(event.target.value)}
            className="border-border bg-background text-foreground focus-visible:outline-ring mt-2 block w-full rounded-md border p-3 text-sm focus-visible:outline-2"
          />
        </label>
      )}
      <div className="px-6 py-16 sm:px-12 sm:py-24">
        {/* The text prop supplies the semantic heading content. */}
        {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
        <ShaderHeroText
          as="h2"
          animation={animation}
          text={customText ?? item.text}
          replayKey={replay}
          reducedMotion={staticText ? "always" : "user"}
          intensity={0.85}
          className="text-[clamp(2.25rem,5vw,5.5rem)] leading-[1.1] font-semibold tracking-[-0.045em] text-balance [font-size-adjust:none]"
        />
        <p className="text-muted-foreground mt-8 max-w-lg text-sm leading-relaxed">
          {item.description}
        </p>
      </div>
      <div className="border-border text-muted-foreground flex justify-between border-t px-6 py-3 font-mono text-[10px] tracking-widest uppercase">
        <span>Typography in motion</span>
        <span>Dethink / Experiments</span>
      </div>
    </section>
  );
}
