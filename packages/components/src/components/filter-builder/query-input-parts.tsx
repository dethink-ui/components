import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import type { InputControlSize } from "../input";
import type {
  FilterQueryError,
  FilterQuerySegment,
  FilterQuerySegmentKind,
  FilterQuerySuggestion,
} from "./filter-core";

export interface QueryInputLabels {
  /** Accessible name of the input. */
  input: string;
  placeholder: string;
  /** Accessible name of the suggestion list. */
  suggestions: string;
  /** Kind shown beside a suggestion. */
  suggestionKind: Record<FilterQuerySuggestion["kind"], string>;
  /** Error text. Defaults to the parser's English message. */
  error: (error: FilterQueryError) => string;
}

export const defaultQueryInputLabels: QueryInputLabels = {
  input: "Filter query",
  placeholder: "Filter, e.g. status:open created:>-7d",
  suggestions: "Suggestions",
  suggestionKind: { field: "Field", operator: "Operator", value: "Value" },
  error: (error) => error.message,
};

/** Padding and type size shared by the input and its highlight overlay. */
export const queryInputSizeClasses: Record<InputControlSize, string> = {
  sm: "h-8 px-[var(--dt-space-2-5)] text-base sm:text-sm",
  md: "h-density-control px-[var(--dt-space-3)] text-base sm:text-sm",
  lg: "h-11 px-[var(--dt-space-4)] text-base",
};

// The input's own text is transparent; the overlay draws it in color. Only
// color and decoration change per token, never width, so glyphs line up.
export const queryInputFieldClasses =
  "font-mono text-transparent caret-foreground selection:bg-primary/25 selection:text-transparent";

export const queryInputOverlayClasses =
  "pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre border border-transparent font-mono text-foreground";

const segmentClasses: Record<FilterQuerySegmentKind, string> = {
  field: "text-primary",
  operator: "text-muted-foreground",
  value: "text-foreground",
  keyword: "text-info",
  negation: "text-destructive",
  paren: "text-muted-foreground",
  text: "text-foreground",
};

const errorClasses =
  "underline decoration-destructive decoration-wavy decoration-from-font underline-offset-4";

export const queryInputListClasses =
  "absolute inset-x-0 top-full z-50 mt-[var(--dt-space-1)] max-h-64 overflow-auto overscroll-contain rounded-md border border-border bg-background p-[var(--dt-space-1)] text-foreground shadow-lg";

export const queryInputOptionClasses =
  "grid cursor-default grid-cols-[minmax(0,1fr)_auto] items-baseline gap-[var(--dt-space-3)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm outline-none data-[active]:bg-muted motion-safe:transition-[background-color] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control";

export const queryInputErrorClasses =
  "mt-[var(--dt-space-1-5)] text-xs text-destructive";

export function queryInputClassNames({
  className,
}: { className?: string } = {}) {
  return cn("relative w-full min-w-0", className);
}

/**
 * The query text as colored runs, split at segment and error boundaries.
 * An empty error range (e.g. a missing filter at the end) marks the last
 * character, so there is always something to underline.
 */
export function renderQueryHighlight(
  text: string,
  segments: FilterQuerySegment[],
  error: FilterQueryError | undefined,
): ReactNode[] {
  const errorRange = error
    ? error.start === error.end
      ? { start: Math.max(0, error.start - 1), end: Math.max(1, error.end) }
      : error
    : undefined;
  const bounds = new Set([0, text.length]);

  for (const segment of segments) {
    bounds.add(segment.start);
    bounds.add(segment.end);
  }

  if (errorRange) {
    bounds.add(Math.min(errorRange.start, text.length));
    bounds.add(Math.min(errorRange.end, text.length));
  }

  const points = [...bounds].sort((a, b) => a - b);
  const runs: ReactNode[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index] ?? 0;
    const end = points[index + 1] ?? 0;

    if (end <= start) {
      continue;
    }

    const segment = segments.find(
      (candidate) => candidate.start <= start && end <= candidate.end,
    );
    const inError =
      errorRange !== undefined &&
      errorRange.start <= start &&
      end <= errorRange.end;

    runs.push(
      <span
        key={start}
        data-kind={segment?.kind}
        data-error={inError ? "" : undefined}
        className={cn(
          segment ? segmentClasses[segment.kind] : undefined,
          inError && errorClasses,
        )}
      >
        {text.slice(start, end)}
      </span>,
    );
  }

  return runs;
}
