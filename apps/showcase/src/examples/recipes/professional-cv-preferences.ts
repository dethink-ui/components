import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => true;
export function useCvReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
