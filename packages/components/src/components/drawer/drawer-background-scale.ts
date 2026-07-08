import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

/**
 * Consumers mark their app-root wrapper with this attribute, parallel to
 * vaul's `data-vaul-drawer-wrapper` convention. Drawer never renders or
 * owns this element itself (it usually sits far above Drawer in the tree,
 * as a sibling of the provider-aware portal container), so state is
 * communicated by toggling a second attribute on whatever element carries
 * this marker rather than through React context.
 */
export const DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE =
  "data-drawer-background-wrapper";
export const DRAWER_BACKGROUND_SCALE_ATTRIBUTE = "data-drawer-background-scale";

type DrawerBackgroundScaleValue = "scaled" | "dimmed";

/**
 * Two independent counters (not one shared set) so a reduced-motion drawer
 * closing never clears the "scaled" state contributed by another,
 * motion-enabled drawer that is still open, and vice versa.
 */
const scaledDrawers = new Set<symbol>();
const dimmedDrawers = new Set<symbol>();

function resolveBackgroundWrapper(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector<HTMLElement>(
    `[${DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE}]`,
  );
}

function syncBackgroundWrapperAttribute() {
  const wrapper = resolveBackgroundWrapper();

  if (!wrapper) {
    return;
  }

  const nextValue: DrawerBackgroundScaleValue | undefined =
    scaledDrawers.size > 0
      ? "scaled"
      : dimmedDrawers.size > 0
        ? "dimmed"
        : undefined;

  if (nextValue) {
    wrapper.setAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE, nextValue);
  } else {
    wrapper.removeAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE);
  }
}

export interface UseDrawerBackgroundScaleOptions {
  /** `backgroundScale && modal && open`, pre-combined by the caller. */
  active: boolean;
  reducedMotion: boolean;
}

/**
 * Registers this Drawer instance's contribution to the page-level
 * background-scale state while `active`, and clears it on change/unmount.
 * Reduced motion still dims the wrapper — it only drops the scale
 * transform — so it registers into a separate counter rather than skipping
 * registration entirely.
 */
export function useDrawerBackgroundScale({
  active,
  reducedMotion,
}: UseDrawerBackgroundScaleOptions): void {
  const idRef = useRef<symbol | null>(null);

  if (idRef.current === null) {
    idRef.current = Symbol("drawer-background-scale");
  }

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const id = idRef.current!;
    const set = reducedMotion ? dimmedDrawers : scaledDrawers;

    set.add(id);
    syncBackgroundWrapperAttribute();

    return () => {
      set.delete(id);
      syncBackgroundWrapperAttribute();
    };
  }, [active, reducedMotion]);
}

const drawerBackgroundWrapperBaseClasses =
  "origin-top transition-[transform,filter] duration-200 ease-out motion-reduce:transition-[filter]";

const drawerBackgroundWrapperScaledClasses =
  "data-[drawer-background-scale=scaled]:overflow-hidden data-[drawer-background-scale=scaled]:rounded-[var(--dt-radius-lg)] data-[drawer-background-scale=scaled]:scale-[0.95] data-[drawer-background-scale=scaled]:brightness-90";

const drawerBackgroundWrapperDimmedClasses =
  "data-[drawer-background-scale=dimmed]:brightness-90";

export function drawerBackgroundWrapperClassNames({
  className,
}: { className?: string } = {}) {
  return cn(
    drawerBackgroundWrapperBaseClasses,
    drawerBackgroundWrapperScaledClasses,
    drawerBackgroundWrapperDimmedClasses,
    className,
  );
}
