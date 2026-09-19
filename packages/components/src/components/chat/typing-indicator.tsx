"use client";

import { useEffect, useRef, useState } from "react";
import { useHydrated } from "../../utils/use-hydrated";
import { usePageVisible } from "../../utils/use-page-visible";
import { cn } from "../../utils/cn";

export interface TypingIndicatorProps {
  label?: string;
  className?: string;
  active?: boolean;
}
export function TypingIndicator({
  label = "Thinking…",
  className,
  active = true,
}: TypingIndicatorProps) {
  const hydrated = useHydrated();
  const visible = usePageVisible();
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setInView(!!entry?.isIntersecting),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const animate =
    active &&
    hydrated &&
    visible &&
    (inView || typeof IntersectionObserver === "undefined");
  return (
    <span
      ref={ref}
      data-slot="typing-indicator"
      data-animating={animate || undefined}
      className={cn(
        "text-muted-foreground inline-flex items-center gap-2.5 text-sm",
        className,
      )}
    >
      <span aria-hidden="true" className="text-primary flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className={cn(
              "size-1.5 rounded-full bg-current",
              animate && "motion-safe:animate-pulse",
            )}
            style={{
              animationDelay: `${dot * 160}ms`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </span>
      <span>{label}</span>
    </span>
  );
}
