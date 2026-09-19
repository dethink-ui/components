import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  if (listeners.size === 0)
    document.addEventListener("visibilitychange", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0)
      document.removeEventListener("visibilitychange", notify);
  };
}

const getSnapshot = () => document.visibilityState !== "hidden";
const getServerSnapshot = () => true;

/** A shared document subscription for decorative animation lifetimes. */
export function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
