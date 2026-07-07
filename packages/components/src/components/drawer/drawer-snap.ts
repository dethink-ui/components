import type { DrawerDirection } from "./drawer-types";

export type DrawerSnapPoint = number;

export const DRAWER_DEFAULT_CLOSE_THRESHOLD = 0.25;
export const DRAWER_DEFAULT_VELOCITY_THRESHOLD = 500;

export function clampSnapPointFraction(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

export function drawerDragAxis(direction: DrawerDirection): "x" | "y" {
  return direction === "left" || direction === "right" ? "x" : "y";
}

export function drawerDragClosingSign(direction: DrawerDirection): 1 | -1 {
  return direction === "bottom" || direction === "right" ? 1 : -1;
}

/**
 * Stops are fractions of the drawer's open size, always including `0`
 * (closed). Snap points above `0` are deduped, clamped, and sorted; the
 * largest configured value is the maximum reachable open position, not an
 * implicit full-size stop — a drawer configured with `snapPoints={[0.3,
 * 0.6]}` cannot rest fully open by dragging past `0.6`.
 */
export function resolveDrawerSnapStops(
  snapPoints: DrawerSnapPoint[] | undefined,
): number[] {
  const source = snapPoints && snapPoints.length > 0 ? snapPoints : [1];
  const openStops = source.map(clampSnapPointFraction).filter((value) => value > 0);
  const unique = Array.from(new Set([0, ...openStops]));

  return unique.sort((a, b) => a - b);
}

export function findNearestDrawerSnapStop(value: number, stops: number[]): number {
  let nearest = stops[0] ?? 1;
  let smallestDiff = Number.POSITIVE_INFINITY;

  for (const stop of stops) {
    const diff = Math.abs(stop - value);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearest = stop;
    }
  }

  return nearest;
}

export function resolveDrawerActiveSnapStop({
  activeSnapPoint,
  defaultSnapPoint,
  stops,
}: {
  activeSnapPoint?: number;
  defaultSnapPoint?: number;
  stops: number[];
}): number {
  const openStops = stops.filter((stop) => stop > 0);
  const fallback = openStops[openStops.length - 1] ?? 1;
  const candidate = activeSnapPoint ?? defaultSnapPoint ?? fallback;

  return findNearestDrawerSnapStop(
    clampSnapPointFraction(candidate),
    openStops.length > 0 ? openStops : [fallback],
  );
}

export function shouldDismissDrawerFromVelocity({
  velocity,
  velocityThreshold,
}: {
  velocity: number;
  velocityThreshold: number;
}): boolean {
  return velocity >= velocityThreshold;
}

/**
 * Resolves which stop a drag release should settle at, given the fraction
 * dragged relative to the stop active when the drag began. Distance is
 * measured from the starting stop (not the nearest stop overall), so
 * `closeThreshold` behaves as "how far past your current rest position
 * before the next stop commits" rather than pure nearest-neighbor snapping.
 * A returned stop of `0` means the drawer should close.
 */
export function resolveDrawerDragReleaseStop({
  closeThreshold,
  draggedOpenFraction,
  startOpenFraction,
  stops,
}: {
  closeThreshold: number;
  draggedOpenFraction: number;
  startOpenFraction: number;
  stops: number[];
}): number {
  const sortedStops = [...stops].sort((a, b) => a - b);
  const clampedDragged = clampSnapPointFraction(draggedOpenFraction);

  if (clampedDragged === startOpenFraction) {
    return startOpenFraction;
  }

  const distance = Math.abs(clampedDragged - startOpenFraction);

  if (distance < closeThreshold) {
    return startOpenFraction;
  }

  const startIndex = sortedStops.indexOf(startOpenFraction);
  const movingToward = clampedDragged < startOpenFraction ? -1 : 1;
  const nextIndex = startIndex + movingToward;

  if (startIndex === -1) {
    return findNearestDrawerSnapStop(clampedDragged, sortedStops);
  }

  if (nextIndex < 0) {
    return sortedStops[0] ?? 0;
  }

  if (nextIndex >= sortedStops.length) {
    return sortedStops[sortedStops.length - 1] ?? startOpenFraction;
  }

  return sortedStops[nextIndex]!;
}
