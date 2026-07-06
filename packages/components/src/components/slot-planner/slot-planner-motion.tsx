import { forwardRef, useRef, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type Transition,
  type Variants,
} from "motion/react";

/**
 * SlotPlanner motion layer: shared transition constants and the motion
 * wrapper components the DOM layer composes around its structural elements.
 *
 * Everything here animates transform and opacity only, and every component
 * takes a `motionEnabled` flag so the DOM layer can collapse the whole layer
 * to plain elements under reduced motion. This module is the only
 * SlotPlanner module allowed to import from Motion — the headless hook,
 * constraints, CRUD, and contract modules stay Motion-free.
 *
 * The wrappers are structural: they sit outside/around the render-slot
 * output, so custom renderers are animated identically to the defaults and
 * cannot break the animation invariants.
 */

const slotPlannerMotionEase: [number, number, number, number] = [0.2, 0, 0, 1];

/** Directional week slide of the day panel and day-tab contents. */
export const slotPlannerWeekTransition: Transition = {
  duration: 0.22,
  ease: slotPlannerMotionEase,
};

/** Slot-card entrance (also delayed per item for copy staggering). */
export const slotPlannerSlotEnterTransition: Transition = {
  duration: 0.18,
  ease: slotPlannerMotionEase,
};

/** Slot-card exit after deletion. */
export const slotPlannerSlotExitTransition: Transition = {
  duration: 0.16,
  ease: slotPlannerMotionEase,
};

/** Layout settling of the remaining cards after a deletion. */
export const slotPlannerLayoutTransition: Transition = {
  duration: 0.2,
  ease: slotPlannerMotionEase,
};

/** Shared-layout travel of the day-tab selection indicator. */
export const slotPlannerIndicatorTransition: Transition = {
  duration: 0.2,
  ease: slotPlannerMotionEase,
};

/** Cap-meter fill scaleX. */
export const slotPlannerCapFillTransition: Transition = {
  duration: 0.3,
  ease: slotPlannerMotionEase,
};

/** Opacity pulse on just-created/just-edited slot cards. */
export const slotPlannerHighlightTransition: Transition = {
  duration: 1.2,
  ease: "easeInOut",
  times: [0, 0.2, 1],
};

/** Entrance delay per item for slots created by one copy batch. */
export const slotPlannerStaggerSeconds = 0.04;

const WEEK_SLIDE_OFFSET = 24;
const DAY_TAB_SLIDE_OFFSET = 12;
const SLOT_SLIDE_OFFSET = 8;

// `custom` is the RTL-resolved slide factor: +1 slides in from the reading
// end (next week), -1 from the opposite end, 0 falls back to a pure fade.
const slotPlannerWeekSlideVariants: Variants = {
  enter: (slideFactor: number) => ({
    opacity: 0,
    x: slideFactor * WEEK_SLIDE_OFFSET,
  }),
  center: { opacity: 1, x: 0 },
  exit: (slideFactor: number) => ({
    opacity: 0,
    x: slideFactor * -WEEK_SLIDE_OFFSET,
  }),
};

// `custom` is the per-item stagger index of one copy batch.
const slotPlannerSlotItemVariants: Variants = {
  enter: { opacity: 0, y: SLOT_SLIDE_OFFSET },
  visible: (staggerIndex: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...slotPlannerSlotEnterTransition,
      delay: staggerIndex * slotPlannerStaggerSeconds,
    },
  }),
  exit: {
    opacity: 0,
    y: -SLOT_SLIDE_OFFSET,
    transition: slotPlannerSlotExitTransition,
  },
};

function SlotPlannerWeekSlideItem({
  children,
  className,
  slideFactor,
}: {
  children: ReactNode;
  className: string;
  slideFactor: number;
}) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      // Exiting week content is decorative while it fades out.
      aria-hidden={isPresent ? undefined : true}
      data-slot="slot-planner-week-panel"
      data-exiting={isPresent ? undefined : "true"}
      className={className}
      custom={slideFactor}
      variants={slotPlannerWeekSlideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slotPlannerWeekTransition}
    >
      {children}
    </motion.div>
  );
}

/**
 * Direction-aware slide of the day-panel content, keyed by the focused week
 * start. `mode="popLayout"` pops exiting content out of the flow, so rapid
 * repeated navigation never stacks panels in layout, and `custom` keeps
 * updating in-flight exits when the direction flips mid-animation.
 */
export function SlotPlannerWeekSlide({
  children,
  className,
  motionEnabled,
  slideFactor,
  weekKey,
}: {
  children: ReactNode;
  className: string;
  motionEnabled: boolean;
  slideFactor: number;
  weekKey: string;
}) {
  if (!motionEnabled) {
    return (
      <div data-slot="slot-planner-week-panel" className={className}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence custom={slideFactor} initial={false} mode="popLayout">
      <SlotPlannerWeekSlideItem
        key={weekKey}
        className={className}
        slideFactor={slideFactor}
      >
        {children}
      </SlotPlannerWeekSlideItem>
    </AnimatePresence>
  );
}

/**
 * Entrance slide of one day-tab's content. The structural tab buttons are
 * keyed by date and remount on week change, so a mount-time entrance is the
 * week transition for the rail. `slideFactor === 0` (initial render, and any
 * render before the first navigation) renders a plain span.
 */
export function SlotPlannerDayTabContent({
  children,
  className,
  motionEnabled,
  slideFactor,
}: {
  children: ReactNode;
  className: string;
  motionEnabled: boolean;
  slideFactor: number;
}) {
  if (!motionEnabled || slideFactor === 0) {
    return (
      <span data-slot="slot-planner-day-tab-content" className={className}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      data-slot="slot-planner-day-tab-content"
      className={className}
      initial={{ opacity: 0, x: slideFactor * DAY_TAB_SLIDE_OFFSET }}
      animate={{ opacity: 1, x: 0 }}
      transition={slotPlannerWeekTransition}
    >
      {children}
    </motion.span>
  );
}

const slotPlannerDayTabIndicatorClasses =
  "pointer-events-none absolute inset-0 rounded-md border-2 border-ring";

/**
 * Shared-layout selection indicator rendered inside the selected day tab
 * only. The non-motion selection state stays on the tab itself
 * (`aria-selected`, `data-selected` styling); this border overlay is the
 * decorative layer that travels between tabs.
 */
export function SlotPlannerDayTabIndicator({
  layoutId,
  motionEnabled,
}: {
  layoutId: string;
  motionEnabled: boolean;
}) {
  if (!motionEnabled) {
    return (
      <span
        aria-hidden="true"
        data-slot="slot-planner-day-tab-indicator"
        className={slotPlannerDayTabIndicatorClasses}
      />
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      data-slot="slot-planner-day-tab-indicator"
      className={slotPlannerDayTabIndicatorClasses}
      layoutId={layoutId}
      transition={slotPlannerIndicatorTransition}
    />
  );
}

/**
 * Token-colored opacity pulse over a just-created or just-edited slot card.
 * Opacity only — no background-color animation — over a `bg-primary` layer.
 */
function SlotPlannerSlotHighlight({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.span
      aria-hidden="true"
      data-slot="slot-planner-slot-highlight"
      className="pointer-events-none absolute inset-0 rounded-md bg-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.14, 0] }}
      transition={slotPlannerHighlightTransition}
      onAnimationComplete={onComplete}
    />
  );
}

export interface SlotPlannerSlotListItemProps {
  children: ReactNode;
  className: string;
  /** Animate in on mount (just created, or arriving from a copy batch). */
  entrance: boolean;
  /** Non-zero mounts a highlight pulse; bump it to pulse again. */
  highlightNonce: number;
  motionEnabled: boolean;
  onHighlightComplete: () => void;
  /** Entrance delay index within one copy batch. */
  staggerIndex: number;
  tabIndex: number;
  "data-error"?: "true";
  "data-locked"?: "true";
  "data-pending"?: "true";
  "data-status": string;
}

/**
 * The structural slot-card `<li>` wrapper, animated. Enter/exit run under
 * the parent `AnimatePresence` with the stable `slotId::occurrenceDate` key;
 * `layout="position"` settles the remaining cards after a deletion. Exiting
 * cards turn `aria-hidden` so assistive tech ignores the fade-out.
 */
export const SlotPlannerSlotListItem = forwardRef<
  HTMLLIElement,
  SlotPlannerSlotListItemProps
>(
  (
    {
      children,
      className,
      entrance,
      highlightNonce,
      motionEnabled,
      onHighlightComplete,
      staggerIndex,
      ...liProps
    },
    ref,
  ) => {
    const isPresent = useIsPresent();
    // Entrance and stagger only apply at mount; capturing them keeps the
    // rendered stagger state stable once the parent clears its bookkeeping.
    const mountMotionRef = useRef({ entrance, staggerIndex });
    const { entrance: mountEntrance, staggerIndex: mountStaggerIndex } =
      mountMotionRef.current;

    if (!motionEnabled) {
      return (
        <li
          {...liProps}
          ref={ref}
          data-slot="slot-planner-slot-card"
          className={className}
        >
          {children}
        </li>
      );
    }

    return (
      <motion.li
        {...liProps}
        ref={ref}
        aria-hidden={isPresent ? undefined : true}
        data-slot="slot-planner-slot-card"
        data-exiting={isPresent ? undefined : "true"}
        data-motion-stagger={
          mountEntrance && mountStaggerIndex > 0 ? "true" : undefined
        }
        className={className}
        layout="position"
        custom={mountStaggerIndex}
        variants={slotPlannerSlotItemVariants}
        initial={mountEntrance ? "enter" : false}
        animate="visible"
        exit="exit"
        transition={{ layout: slotPlannerLayoutTransition }}
      >
        {highlightNonce > 0 ? (
          <SlotPlannerSlotHighlight
            key={highlightNonce}
            onComplete={onHighlightComplete}
          />
        ) : null}
        {children}
      </motion.li>
    );
  },
);

SlotPlannerSlotListItem.displayName = "SlotPlannerSlotListItem";

const slotPlannerCapMeterFillClasses =
  "h-full w-full origin-left rounded-full bg-primary rtl:origin-right";

/**
 * Cap-meter fill, animated via `scaleX` with a start-aligned, RTL-aware
 * transform origin. The meter's text stays the canonical communication; the
 * whole track is `aria-hidden` in the DOM layer.
 */
export function SlotPlannerCapMeterFill({
  motionEnabled,
  ratio,
}: {
  motionEnabled: boolean;
  ratio: number;
}) {
  const clamped = Math.min(1, Math.max(0, ratio));

  if (!motionEnabled) {
    return (
      <div
        data-slot="slot-planner-cap-meter-fill"
        className={slotPlannerCapMeterFillClasses}
        style={{ transform: `scaleX(${clamped})` }}
      />
    );
  }

  return (
    <motion.div
      data-slot="slot-planner-cap-meter-fill"
      className={slotPlannerCapMeterFillClasses}
      initial={false}
      animate={{ scaleX: clamped }}
      transition={slotPlannerCapFillTransition}
    />
  );
}
