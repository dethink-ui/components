"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ColorMode = "light" | "dark" | "system";

const STORAGE_KEY = "dethink-theme";
const MODE_CHANGE_EVENT = "dethink-theme-change";

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

function applyDocumentMode(next: ColorMode) {
  const colorScheme = next === "system" ? "light dark" : next;
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = colorScheme;
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", colorScheme);
}

function subscribeToMode(onStoreChange: () => void) {
  window.addEventListener(MODE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(MODE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function ThemeToggle() {
  const mode = useSyncExternalStore<ColorMode | null>(
    subscribeToMode,
    readStoredMode,
    () => null,
  );

  useEffect(() => {
    if (mode) applyDocumentMode(mode);
  }, [mode]);

  function applyMode(next: ColorMode) {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyDocumentMode(next);
    window.dispatchEvent(new Event(MODE_CHANGE_EVENT));
  }

  return (
    <div
      role="group"
      aria-label="Color mode"
      className="border-border bg-muted/40 flex h-8 shrink-0 items-center gap-0.5 rounded-lg border p-0.5"
    >
      {modes.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            onClick={() => applyMode(value)}
            className={`focus-visible:ring-ring grid size-6 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)] ${
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
