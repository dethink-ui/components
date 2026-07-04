"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ColorMode = "light" | "dark" | "system";

const STORAGE_KEY = "dethink-theme";

const modes: Array<{ value: ColorMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "system", label: "System theme", icon: Monitor },
  { value: "dark", label: "Dark theme", icon: Moon },
];

function readStoredMode(): ColorMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ColorMode | null>(null);

  useEffect(() => {
    setMode(readStoredMode());
  }, []);

  function applyMode(next: ColorMode) {
    setMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    const colorScheme = next === "system" ? "light dark" : next;
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = colorScheme;
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute("content", colorScheme);
  }

  return (
    <div
      role="group"
      aria-label="Color mode"
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted/60 p-0.5"
    >
      {modes.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => applyMode(value)}
            className={`grid size-7 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
