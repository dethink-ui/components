"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(onChange: () => void) {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}
const snapshot = () => window.matchMedia(query).matches;
// Start with semantic, static content on the server and during hydration.
const serverSnapshot = () => true;

export function useAutomationReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
