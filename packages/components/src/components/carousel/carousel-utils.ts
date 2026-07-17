// Pure math for the Carousel offset engine. Everything here is framework-free
// and deterministic so it can be tested in isolation and reused by the drag,
// button, keyboard, and controlled-sync paths without touching the DOM.

export type CarouselDragDirection = 1 | -1;

/**
 * Center-to-center distance between two adjacent slides, in pixels. Falls back
 * to a safe positive number so a zero-width measurement (SSR, hidden, or
 * pre-layout) can never divide the drag math by zero.
 */
export function getSlideStep(itemWidth: number, gap: number): number {
  const step = itemWidth + gap;
  return Number.isFinite(step) && step > 0 ? step : 1;
}

/**
 * Convert a pointer displacement in pixels into a delta in float index units.
 * `direction` carries the writing direction (1 for LTR, -1 for RTL) so a
 * right-drag always advances toward higher indices visually.
 */
export function pxToIndexDelta(
  px: number,
  step: number,
  direction: CarouselDragDirection,
): number {
  return (px / getSlideStep(step, 0)) * direction;
}

/** Drag sign for the current writing direction. */
export function getDragDirection(rtl: boolean): CarouselDragDirection {
  return rtl ? -1 : 1;
}

/** Clamp an index into `[0, count - 1]`, collapsing an empty carousel to 0. */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  if (index < 0) return 0;
  if (index > count - 1) return count - 1;
  return index;
}

/**
 * Rubber-band a value that has been dragged past its bounds. Inside the range
 * the value is returned untouched; beyond it the overshoot is scaled down by
 * `resistance` so the ends feel elastic rather than hard.
 */
export function clampWithRubberBand(
  value: number,
  min: number,
  max: number,
  resistance = 0.35,
): number {
  if (min > max) return min;
  if (value < min) return min - (min - value) * resistance;
  if (value > max) return max + (value - max) * resistance;
  return value;
}

export interface SnapTargetOptions {
  /** Current continuous offset in index units. */
  offset: number;
  /** Release velocity in index units per second. */
  velocity: number;
  /** Lowest selectable index (usually 0). */
  min: number;
  /** Highest selectable index (usually count - 1). */
  max: number;
  /** Seconds of velocity to project forward before snapping. */
  projection?: number;
}

/**
 * Project the release velocity forward, then snap to the nearest whole slide
 * and clamp into range. With zero velocity this is just "round to the nearest
 * slide"; a flick biases the result toward the direction of travel.
 */
export function getSnapTarget({
  offset,
  velocity,
  min,
  max,
  projection = 0.18,
}: SnapTargetOptions): number {
  const projected = offset + velocity * projection;
  const snapped = Math.round(projected);
  return Math.min(max, Math.max(min, snapped));
}
