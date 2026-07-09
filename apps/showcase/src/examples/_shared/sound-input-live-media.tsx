"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Restores the genuine `navigator.mediaDevices` before a real-microphone
 * example activates.
 *
 * The fake-stream demos on the same page swap `navigator.mediaDevices` for a
 * stub on pointerdown and never put it back, which would otherwise stop a
 * real-mic recipe from ever calling `getUserMedia`. This wrapper snapshots the
 * real object at mount (before any interaction can clobber it) and reinstalls
 * it in the capture phase, so `SoundInput` reads the real API on activation.
 */
export function SoundInputLiveMedia({ children }: { children: ReactNode }) {
  const realRef = useRef<MediaDevices | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      realRef.current = navigator.mediaDevices;
    }
  }, []);

  const restore = () => {
    const real = realRef.current;

    if (
      typeof navigator === "undefined" ||
      !real ||
      navigator.mediaDevices === real
    ) {
      return;
    }

    try {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: real,
      });
    } catch {
      // The genuine object was never replaced; nothing to restore.
    }
  };

  return (
    <span
      className="inline-flex"
      onPointerDownCapture={restore}
      onKeyDownCapture={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          restore();
        }
      }}
    >
      {children}
    </span>
  );
}
