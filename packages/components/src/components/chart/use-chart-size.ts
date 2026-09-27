import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export interface ChartSize {
  width: number;
  height: number;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Measure an element's content box and keep it current. Returns `undefined`
 * until the first client measurement, so server output can fall back to a
 * `viewBox`-scaled render without a layout jump (the container owns its size).
 */
export function useChartSize<Element extends HTMLElement = HTMLDivElement>(): [
  RefObject<Element | null>,
  ChartSize | undefined,
] {
  const ref = useRef<Element | null>(null);
  const [size, setSize] = useState<ChartSize>();

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = (width: number, height: number) => {
      const next = { width: Math.round(width), height: Math.round(height) };
      setSize((previous) =>
        previous &&
        previous.width === next.width &&
        previous.height === next.height
          ? previous
          : next,
      );
    };

    const rect = element.getBoundingClientRect();
    update(rect.width, rect.height);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
