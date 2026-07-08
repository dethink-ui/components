import { Modal } from "react-aria-components";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type DragControls,
  type PanInfo,
  type Transition,
} from "motion/react";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
} from "react";
import {
  clampSnapPointFraction,
  drawerDragAxis,
  drawerDragClosingSign,
  findNearestDrawerSnapStop,
  resolveDrawerActiveSnapStop,
  resolveDrawerDragReleaseStop,
  resolveDrawerSnapStops,
  shouldDismissDrawerFromVelocity,
  type DrawerSnapPoint,
} from "./drawer-snap";
import type { DrawerDirection, DrawerMotionPreset } from "./drawer-types";
import { cn } from "../../utils/cn";

/**
 * Only this module imports `motion/react`. The DOM layer in drawer.tsx
 * takes a `motionEnabled` boolean and falls back to plain elements with no
 * drag/spring behavior, matching SlotPlanner's motion-isolation convention.
 */

export type { DragControls } from "motion/react";

/**
 * Explicitly typed (rather than inferred) so the package's declaration
 * output does not need to name react-aria-components' internal,
 * non-exported prop-helper types. Prop safety for the drag/motion props
 * spread onto this component is enforced at the `getMotionProps` call
 * site instead.
 */
export const MotionModal: ComponentType<Record<string, unknown>> =
  motion.create(Modal);
export const MotionDiv = motion.div;

interface DrawerMotionPresetSettings {
  contentDurationClass: string;
  overlayDurationClass: string;
  recedeScale: number;
  springTransition: Transition;
}

/**
 * The single source of spring/duration tuning per `motionPreset`. `drag`,
 * snap-point settling, and nested-drawer recede all `animate()` through
 * `springTransition` from this table — "reuse the same spring primitives"
 * means literally the same transition object, not merely a similar feel.
 * `standard` matches the fixed spring this component shipped with before
 * motion presets existed, so the default look is unchanged.
 */
const drawerMotionPresetSettings: Record<
  DrawerMotionPreset,
  DrawerMotionPresetSettings
> = {
  none: {
    contentDurationClass: "motion-safe:duration-0",
    overlayDurationClass: "motion-safe:duration-0",
    recedeScale: 1,
    springTransition: { duration: 0 },
  },
  subtle: {
    contentDurationClass: "motion-safe:duration-[180ms]",
    overlayDurationClass: "motion-safe:duration-150",
    recedeScale: 0.98,
    springTransition: {
      damping: 36,
      mass: 0.82,
      stiffness: 310,
      type: "spring",
    },
  },
  standard: {
    contentDurationClass: "motion-safe:duration-[240ms]",
    overlayDurationClass: "motion-safe:duration-150",
    recedeScale: 0.96,
    springTransition: {
      damping: 30,
      mass: 0.92,
      stiffness: 360,
      type: "spring",
    },
  },
  expressive: {
    contentDurationClass: "motion-safe:duration-[320ms]",
    overlayDurationClass: "motion-safe:duration-200",
    recedeScale: 0.92,
    springTransition: {
      damping: 23,
      mass: 0.96,
      stiffness: 420,
      type: "spring",
    },
  },
};

export function getDrawerMotionPresetSettings(
  motionPreset: DrawerMotionPreset,
): DrawerMotionPresetSettings {
  return drawerMotionPresetSettings[motionPreset];
}

export function shouldEnableDrawerMotion({
  motionPreset,
  reducedMotion,
}: {
  motionPreset: DrawerMotionPreset;
  reducedMotion: boolean;
}): boolean {
  return motionPreset !== "none" && !reducedMotion;
}

const DRAWER_DRAG_ELASTIC = 0.12;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useDrawerReducedMotion(): boolean {
  return useReducedMotion() === true;
}

export interface UseDrawerDragOptions {
  activeSnapPoint?: number;
  closeThreshold: number;
  contentRef: RefObject<HTMLElement | null>;
  defaultSnapPoint?: number;
  direction: DrawerDirection;
  fallbackContentSize?: number;
  motionPreset: DrawerMotionPreset;
  onActiveSnapPointChange?: (snapPoint: number) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  receded?: boolean;
  snapPoints?: DrawerSnapPoint[];
  velocityThreshold: number;
}

export interface DrawerDragMotionProps {
  drag: "x" | "y" | false;
  dragControls: DragControls;
  dragConstraints: Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  dragElastic: number;
  dragListener: boolean;
  dragMomentum: false;
  onDragEnd: (event: PointerEvent, info: PanInfo) => void;
  style: { x: number; scale: number } | { y: number; scale: number };
}

export interface UseDrawerDragResult {
  activeSnapPoint: number;
  dragControls: DragControls;
  getMotionProps: (dragHandleOnly: boolean) => DrawerDragMotionProps;
  hasSnapPoints: boolean;
}

function measureContentSize(
  contentRef: RefObject<HTMLElement | null>,
  axis: "x" | "y",
  fallbackContentSize?: number,
): number {
  const rect = contentRef.current?.getBoundingClientRect();

  if (!rect) {
    return (
      fallbackContentSize ??
      (typeof window === "undefined"
        ? 0
        : axis === "x"
          ? window.innerWidth
          : window.innerHeight)
    );
  }

  const measuredSize = axis === "x" ? rect.width : rect.height;

  if (measuredSize > 0 || typeof window === "undefined") {
    return measuredSize;
  }

  return (
    fallbackContentSize ??
    (axis === "x" ? window.innerWidth : window.innerHeight)
  );
}

/**
 * Wires spring-driven drag-to-dismiss and snap-point settling onto whatever
 * element the caller renders with the returned motion props (a
 * `MotionModal` in modal mode, a `motion.div` in push mode). The drag
 * mechanic is a translate offset layered on top of the element's existing
 * static size/position — dragging never changes the box's actual
 * width/height, only how far it is shifted toward its closed edge.
 */
export function useDrawerDrag({
  activeSnapPoint,
  closeThreshold,
  contentRef,
  defaultSnapPoint,
  direction,
  fallbackContentSize,
  motionPreset,
  onActiveSnapPointChange,
  onOpenChange,
  open,
  receded = false,
  snapPoints,
  velocityThreshold,
}: UseDrawerDragOptions): UseDrawerDragResult {
  const axis = drawerDragAxis(direction);
  const closingSign = drawerDragClosingSign(direction);
  const hasSnapPoints = Boolean(snapPoints && snapPoints.length > 0);
  const stops = useMemo(() => resolveDrawerSnapStops(snapPoints), [snapPoints]);
  const openStops = useMemo(() => stops.filter((stop) => stop > 0), [stops]);
  const isControlled = activeSnapPoint !== undefined;
  const [uncontrolledSnapPoint, setUncontrolledSnapPoint] = useState(() =>
    resolveDrawerActiveSnapStop({ activeSnapPoint, defaultSnapPoint, stops }),
  );
  const resolvedSnapPoint = isControlled
    ? findNearestDrawerSnapStop(
        clampSnapPointFraction(activeSnapPoint!),
        openStops,
      )
    : uncontrolledSnapPoint;
  const { recedeScale, springTransition } =
    getDrawerMotionPresetSettings(motionPreset);

  const translateMotionValue = useMotionValue(0);
  const scaleMotionValue = useMotionValue(1);
  const dragControls = useDragControls();
  const startSnapPointRef = useRef(resolvedSnapPoint);
  const hasMountedRef = useRef(false);
  const wasOpenRef = useRef(open);

  useIsomorphicLayoutEffect(() => {
    const wasOpen = wasOpenRef.current;

    wasOpenRef.current = open;
    startSnapPointRef.current = resolvedSnapPoint;

    const contentSize = measureContentSize(
      contentRef,
      axis,
      fallbackContentSize,
    );
    if (contentSize <= 0) {
      return undefined;
    }

    const openTarget = (1 - resolvedSnapPoint) * contentSize * closingSign;
    const closedTarget = contentSize * closingSign;
    const target = open ? openTarget : closedTarget;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      translateMotionValue.set(open ? closedTarget : target);

      if (!open) {
        return undefined;
      }
    } else if (open && !wasOpen) {
      translateMotionValue.set(closedTarget);
    } else if (!open && !wasOpen) {
      translateMotionValue.set(closedTarget);
      return undefined;
    }

    const controls = animate(translateMotionValue, target, springTransition);

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    resolvedSnapPoint,
    axis,
    closingSign,
    fallbackContentSize,
    springTransition,
  ]);

  useEffect(() => {
    const controls = animate(
      scaleMotionValue,
      receded ? recedeScale : 1,
      springTransition,
    );

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receded, recedeScale]);

  function commitSnapPoint(nextSnapPoint: number) {
    if (!isControlled) {
      setUncontrolledSnapPoint(nextSnapPoint);
    }

    onActiveSnapPointChange?.(nextSnapPoint);

    if (nextSnapPoint === resolvedSnapPoint) {
      const contentSize = measureContentSize(
        contentRef,
        axis,
        fallbackContentSize,
      );
      const target = (1 - nextSnapPoint) * contentSize * closingSign;

      animate(translateMotionValue, target, springTransition);
    }
  }

  function handleDragEnd(_event: PointerEvent, info: PanInfo) {
    const rawVelocity = axis === "x" ? info.velocity.x : info.velocity.y;
    const signedVelocity = rawVelocity * closingSign;
    const contentSize = measureContentSize(contentRef, axis);

    if (contentSize <= 0) {
      return;
    }

    if (
      shouldDismissDrawerFromVelocity({
        velocity: signedVelocity,
        velocityThreshold,
      })
    ) {
      onOpenChange(false);
      return;
    }

    const currentTranslate = translateMotionValue.get();
    const draggedOpenFraction = clampSnapPointFraction(
      1 - (currentTranslate * closingSign) / contentSize,
    );
    const targetStop = resolveDrawerDragReleaseStop({
      closeThreshold,
      draggedOpenFraction,
      startOpenFraction: startSnapPointRef.current,
      stops,
    });

    if (targetStop <= 0) {
      onOpenChange(false);
      return;
    }

    commitSnapPoint(targetStop);
  }

  function getMotionProps(dragHandleOnly: boolean): DrawerDragMotionProps {
    const openSide: "top" | "left" = axis === "x" ? "left" : "top";
    const closeSide: "bottom" | "right" = axis === "x" ? "right" : "bottom";
    const constraintSide = closingSign > 0 ? openSide : closeSide;

    return {
      drag: open ? axis : false,
      dragConstraints: { [constraintSide]: 0 },
      dragControls,
      dragElastic: DRAWER_DRAG_ELASTIC,
      dragListener: !dragHandleOnly,
      dragMomentum: false,
      onDragEnd: handleDragEnd,
      style:
        axis === "x"
          ? { scale: scaleMotionValue, x: translateMotionValue }
          : { scale: scaleMotionValue, y: translateMotionValue },
    } as unknown as DrawerDragMotionProps;
  }

  return {
    activeSnapPoint: resolvedSnapPoint,
    dragControls,
    getMotionProps,
    hasSnapPoints,
  };
}

const drawerHandleBaseClasses =
  "relative mx-auto flex h-8 w-full shrink-0 touch-none cursor-grab items-center justify-center data-[direction=left]:absolute data-[direction=left]:inset-y-0 data-[direction=left]:right-0 data-[direction=left]:z-10 data-[direction=left]:mx-0 data-[direction=left]:my-auto data-[direction=left]:h-full data-[direction=left]:w-8 data-[direction=right]:absolute data-[direction=right]:inset-y-0 data-[direction=right]:left-0 data-[direction=right]:z-10 data-[direction=right]:mx-0 data-[direction=right]:my-auto data-[direction=right]:h-full data-[direction=right]:w-8 active:cursor-grabbing after:block after:h-1.5 after:w-12 after:rounded-full after:bg-muted-foreground/40 after:shadow-sm after:transition-[width,height,background-color,opacity] hover:after:bg-muted-foreground/55 active:after:w-14 data-[direction=left]:after:h-12 data-[direction=left]:after:w-1.5 data-[direction=left]:active:after:h-14 data-[direction=left]:active:after:w-1.5 data-[direction=right]:after:h-12 data-[direction=right]:after:w-1.5 data-[direction=right]:active:after:h-14 data-[direction=right]:active:after:w-1.5 motion-reduce:after:transition-none";

export function drawerHandleClassNames({
  className,
}: { className?: string } = {}) {
  return drawerHandleBaseClasses + (className ? ` ${className}` : "");
}

export interface DrawerMotionHandleProps {
  "aria-label"?: string;
  className?: string;
  direction: DrawerDirection;
  dragControls: DragControls;
}

export const DrawerMotionHandle = forwardRef<
  HTMLDivElement,
  DrawerMotionHandleProps
>(({ className, direction, dragControls, ...props }, ref) => (
  <motion.div
    {...props}
    ref={ref}
    aria-hidden="true"
    data-direction={direction}
    data-slot="drawer-handle"
    className={drawerHandleClassNames({ className })}
    onPointerDown={(event) => {
      dragControls.start(event);
    }}
  />
));

DrawerMotionHandle.displayName = "DrawerMotionHandle";

export const DRAWER_DEFAULT_EDGE_SWIPE_HIT_REGION_SIZE = 24;

const drawerEdgeSwipeZoneSideClasses: Record<DrawerDirection, string> = {
  bottom: "inset-x-0 bottom-0",
  left: "inset-y-0 left-0",
  right: "inset-y-0 right-0",
  top: "inset-x-0 top-0",
};

const drawerEdgeSwipeZoneBaseClasses = "fixed z-40 touch-none";

export interface DrawerEdgeSwipeZoneProps {
  direction: DrawerDirection;
  hitRegionSize: number;
  onOpenChange: (open: boolean) => void;
  velocityThreshold: number;
}

/**
 * An always-mounted, invisible strip pinned to the drawer's own `direction`
 * edge. Only rendered while the drawer is closed (see drawer.tsx), it opens
 * the drawer once a pan gesture crosses `hitRegionSize` of travel toward the
 * interior, or a fast flick crosses `velocityThreshold` — the same
 * distance-or-velocity shape as the drag-to-dismiss decision in
 * `useDrawerDrag`, applied in the opposite (opening) direction. It never
 * uses `drag` (which would visually move the zone); `onPanEnd` only
 * recognizes the gesture and reports offset/velocity.
 */
export function DrawerEdgeSwipeZone({
  direction,
  hitRegionSize,
  onOpenChange,
  velocityThreshold,
}: DrawerEdgeSwipeZoneProps) {
  const axis = drawerDragAxis(direction);
  // Dragging opens the drawer from the edge opposite its closing direction.
  const openingSign = -drawerDragClosingSign(direction) as 1 | -1;

  function handlePanEnd(_event: PointerEvent, info: PanInfo) {
    const rawOffset = axis === "x" ? info.offset.x : info.offset.y;
    const rawVelocity = axis === "x" ? info.velocity.x : info.velocity.y;
    const signedOffset = rawOffset * openingSign;
    const signedVelocity = rawVelocity * openingSign;

    if (signedOffset >= hitRegionSize || signedVelocity >= velocityThreshold) {
      onOpenChange(true);
    }
  }

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        drawerEdgeSwipeZoneBaseClasses,
        drawerEdgeSwipeZoneSideClasses[direction],
      )}
      data-direction={direction}
      data-slot="drawer-edge-swipe-zone"
      onPanEnd={handlePanEnd}
      style={
        axis === "x" ? { width: hitRegionSize } : { height: hitRegionSize }
      }
    />
  );
}
