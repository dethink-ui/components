import {
  forwardRef,
  useRef,
  useState,
  useId,
  type FocusEventHandler,
  type HTMLAttributes,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import {
  motion as motionElement,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import {
  Avatar,
  type AvatarMotion,
  type AvatarProps,
  type AvatarRing,
  type AvatarShape,
  type AvatarSize,
} from "../avatar";
import { cn } from "../../utils/cn";

export type AvatarGroupOverlap = "none" | "sm" | "md" | "lg";
export type AvatarGroupReveal = "none" | "spread" | "names";
export type AvatarGroupMotion = AvatarMotion;
export type AvatarGroupRevealLabelVisibility = "hover" | "always";

export interface AvatarGroupMember extends Pick<
  AvatarProps,
  | "alt"
  | "crossOrigin"
  | "decoding"
  | "fallbackIcon"
  | "fetchPriority"
  | "imageProps"
  | "initials"
  | "loading"
  | "motion"
  | "name"
  | "onImageError"
  | "onImageLoad"
  | "reducedMotion"
  | "referrerPolicy"
  | "ring"
  | "shape"
  | "size"
  | "sizes"
  | "src"
  | "srcSet"
  | "tone"
> {
  avatarClassName?: string;
  id?: string | number;
  label?: string;
  metadata?: ReactNode;
}

export interface AvatarGroupOverflowLabelContext {
  count: number;
  hiddenMembers: readonly AvatarGroupMember[];
  label?: string;
  members: readonly AvatarGroupMember[];
  totalCount: number;
  visibleCount: number;
}

export type AvatarGroupOverflowLabel =
  string | ((context: AvatarGroupOverflowLabelContext) => string);

export type AvatarGroupVisibleMemberLabel =
  string | ((member: AvatarGroupMember, index: number) => string);

export interface AvatarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "role"
> {
  label?: string;
  max?: number;
  members: readonly AvatarGroupMember[];
  motion?: AvatarGroupMotion;
  overlap?: AvatarGroupOverlap;
  overflowLabel?: AvatarGroupOverflowLabel;
  reducedMotion?: boolean;
  reveal?: AvatarGroupReveal;
  revealLabelVisibility?: AvatarGroupRevealLabelVisibility;
  ring?: AvatarRing;
  shape?: AvatarShape;
  size?: AvatarSize;
  visibleMemberLabel?: AvatarGroupVisibleMemberLabel;
}

const avatarGroupBaseClasses =
  "relative inline-flex max-w-full items-center align-middle outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[reduced-motion=true]:will-change-auto";

const avatarGroupOverlapClasses: Record<AvatarGroupOverlap, string> = {
  none: "[--avatar-group-overlap:0rem]",
  sm: "[--avatar-group-overlap:calc(var(--dt-density-control)*0.16)]",
  md: "[--avatar-group-overlap:calc(var(--dt-density-control)*0.28)]",
  lg: "[--avatar-group-overlap:calc(var(--dt-density-control)*0.4)]",
};

const avatarGroupStackClasses =
  "isolate flex list-none items-center p-0 [margin-block:0] [margin-inline:0]";

const avatarGroupItemClasses =
  "relative flex shrink-0 transform-gpu [margin-inline-start:calc(var(--avatar-group-overlap)*-1)] [rotate:0deg] [scale:1] [translate:0_0] first:[margin-inline-start:0]";

const avatarGroupOverflowClasses = "bg-background text-muted-foreground";

const avatarGroupRevealLabelClasses =
  "pointer-events-none absolute start-1/2 top-full z-50 mt-[var(--dt-space-2)] max-w-48 -translate-x-1/2 truncate rounded-md border border-border bg-background px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-xs font-medium text-foreground shadow-lg rtl:translate-x-1/2";

const avatarGroupRevealSummaryClasses =
  "pointer-events-none absolute start-1/2 top-full z-50 mt-[var(--dt-space-2)] max-w-[min(20rem,calc(100vw-var(--dt-space-4)))] -translate-x-1/2 truncate rounded-md border border-border bg-background px-[var(--dt-space-3)] py-[var(--dt-space-1)] text-xs font-medium text-foreground shadow-lg rtl:translate-x-1/2";

// Per-step translate that fans the overlapped stack apart on hover so the
// avatars separate cleanly and the zoomed one never collides with a neighbor.
const avatarGroupRevealSpread: Record<AvatarSize, number> = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
  "2xl": 38,
};

const avatarGroupLabelTransitions: Record<AvatarGroupMotion, Transition> = {
  none: { duration: 0 },
  subtle: { duration: 0.12, ease: "easeOut" },
  standard: { duration: 0.16, ease: "easeOut" },
};

// Hovering the group expands the stack; only the avatar under the pointer zooms,
// and moving to another avatar returns the previous one to its resting size.
const avatarGroupZoomScale: Record<AvatarGroupMotion, number> = {
  none: 1,
  subtle: 1.22,
  standard: 1.3,
};

const avatarGroupExpandTransitions: Record<AvatarGroupMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 420, damping: 34, mass: 0.8 },
  standard: { type: "spring", stiffness: 380, damping: 30, mass: 0.8 },
};

const avatarGroupItemScaleClasses =
  "inline-flex origin-bottom transform-gpu will-change-transform data-[reduced-motion=true]:will-change-auto";

export function avatarGroupClassNames({
  className,
  overlap = "md",
}: Pick<AvatarGroupProps, "className" | "overlap"> = {}) {
  return cn(
    avatarGroupBaseClasses,
    avatarGroupOverlapClasses[overlap],
    className,
  );
}

function normalizeMax(max: number | undefined, totalCount: number) {
  if (max === undefined || !Number.isFinite(max)) {
    return totalCount;
  }

  return Math.max(0, Math.floor(max));
}

function getDirectionDataAttribute(dir: AvatarGroupProps["dir"]) {
  if (dir === "ltr" || dir === "rtl") {
    return dir;
  }

  return "inherit";
}

function getMemberKey(member: AvatarGroupMember, index: number) {
  return `${member.id ?? member.name ?? member.label ?? "member"}-${index}`;
}

function getMemberLabel({
  fallback,
  index,
  member,
  visibleMemberLabel,
}: {
  fallback?: string;
  index: number;
  member: AvatarGroupMember;
  visibleMemberLabel?: AvatarGroupVisibleMemberLabel;
}) {
  if (typeof visibleMemberLabel === "function") {
    return visibleMemberLabel(member, index);
  }

  if (typeof visibleMemberLabel === "string") {
    return visibleMemberLabel;
  }

  if (member.label) {
    return member.label;
  }

  if (member.name) {
    return member.name;
  }

  if (member.alt) {
    return member.alt;
  }

  if (member.initials) {
    return member.initials;
  }

  return fallback ?? `Member ${index + 1}`;
}

function getAvatarName(member: AvatarGroupMember, index: number) {
  return (
    member.name ||
    member.label ||
    (member.alt && member.alt.length > 0 ? member.alt : undefined) ||
    member.initials ||
    `Member ${index + 1}`
  );
}

function getOverflowDisplay(count: number) {
  if (count > 99) {
    return "99+";
  }

  return `+${count}`;
}

function getOverflowLabel({
  context,
  overflowLabel,
}: {
  context: AvatarGroupOverflowLabelContext;
  overflowLabel?: AvatarGroupOverflowLabel;
}) {
  if (context.count <= 0) {
    return undefined;
  }

  if (typeof overflowLabel === "function") {
    return overflowLabel(context);
  }

  if (typeof overflowLabel === "string") {
    return overflowLabel;
  }

  const noun = context.label ? context.label.toLowerCase() : "members";
  const normalizedNoun =
    context.count === 1 && noun.endsWith("s") ? noun.slice(0, -1) : noun;

  return `${context.count} more ${normalizedNoun}`;
}

function canRevealForHover() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }

  return window.matchMedia("(hover: hover)").matches;
}

function getMotionBehavior({
  motion,
  reducedMotion,
  reveal,
}: {
  motion: AvatarGroupMotion;
  reducedMotion: boolean;
  reveal: AvatarGroupReveal;
}) {
  if (reveal === "none" || motion === "none") {
    return "disabled";
  }

  if (reducedMotion || reveal === "names") {
    return "opacity";
  }

  return "transform-opacity";
}

function getRevealOffset({
  count,
  direction,
  index,
  motionBehavior,
  reveal,
  size,
}: {
  count: number;
  direction: ReturnType<typeof getDirectionDataAttribute>;
  index: number;
  motionBehavior: ReturnType<typeof getMotionBehavior>;
  reveal: AvatarGroupReveal;
  size: AvatarSize;
}) {
  if (reveal !== "spread" || motionBehavior !== "transform-opacity") {
    return 0;
  }

  const center = (count - 1) / 2;
  const directionMultiplier = direction === "rtl" ? -1 : 1;

  return (
    Math.round((index - center) * avatarGroupRevealSpread[size]) *
    directionMultiplier
  );
}

function getRevealSummary({
  hiddenMembers,
  overflowAccessibleLabel,
  visibleMemberLabel,
  visibleMembers,
}: {
  hiddenMembers: readonly AvatarGroupMember[];
  overflowAccessibleLabel?: string;
  visibleMemberLabel?: AvatarGroupVisibleMemberLabel;
  visibleMembers: readonly AvatarGroupMember[];
}) {
  const visibleLabels = visibleMembers.map((member, index) =>
    getMemberLabel({ index, member, visibleMemberLabel }),
  );

  if (overflowAccessibleLabel && hiddenMembers.length > 0) {
    visibleLabels.push(overflowAccessibleLabel);
  }

  return visibleLabels.length > 0 ? visibleLabels.join(", ") : "No members";
}

function renderMemberMetadata(metadata: ReactNode) {
  if (metadata === null || metadata === undefined || metadata === false) {
    return null;
  }

  return <> - {metadata}</>;
}

type AvatarGroupActiveKey = number | "overflow";

interface AvatarGroupItemProps {
  active: boolean;
  children: ReactNode;
  expandTransition: Transition;
  label?: string;
  labelActive: boolean;
  labelTransition: Transition;
  motionBehavior: ReturnType<typeof getMotionBehavior>;
  reducedMotion: boolean;
  revealOffset: number;
  revealState: "revealed" | "collapsed";
  showLabel: boolean;
  slot: "item" | "overflow";
  stackIndex: number;
  xTarget: number;
  zIndex: number;
  zoomScale: number;
  itemIndex?: number;
}

function AvatarGroupItem({
  active,
  children,
  expandTransition,
  itemIndex,
  label,
  labelActive,
  labelTransition,
  motionBehavior,
  reducedMotion,
  revealOffset,
  revealState,
  showLabel,
  slot,
  stackIndex,
  xTarget,
  zIndex,
  zoomScale,
}: AvatarGroupItemProps) {
  const slotProps =
    slot === "overflow"
      ? { "data-overflow-item": "true", "data-slot": "avatar-group-overflow" }
      : { "data-member-index": itemIndex, "data-slot": "avatar-group-item" };
  // Only the hovered avatar zooms; the stack fans apart via `x` so nothing
  // overlaps while it is enlarged.
  const scaleTarget = active && !reducedMotion ? zoomScale : 1;

  return (
    <motionElement.li
      {...slotProps}
      data-active={active ? "true" : undefined}
      data-motion-behavior={motionBehavior}
      data-reveal-offset={revealOffset}
      data-stack-index={stackIndex}
      data-state={revealState}
      className={avatarGroupItemClasses}
      style={{ zIndex }}
      initial={false}
      animate={{ x: xTarget }}
      transition={expandTransition}
    >
      <motionElement.span
        aria-hidden="true"
        data-slot="avatar-group-item-scale"
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={avatarGroupItemScaleClasses}
        initial={false}
        animate={{ scale: scaleTarget }}
        transition={expandTransition}
      >
        {children}
      </motionElement.span>
      {showLabel && label ? (
        <motionElement.span
          aria-hidden="true"
          data-slot="avatar-group-reveal-label"
          data-state={labelActive ? "revealed" : "collapsed"}
          className={avatarGroupRevealLabelClasses}
          initial={false}
          animate={{
            opacity: labelActive ? 1 : 0,
            y: labelActive || reducedMotion ? 0 : -2,
          }}
          transition={labelTransition}
        >
          {label}
        </motionElement.span>
      ) : null}
    </motionElement.li>
  );
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      className,
      dir,
      label = "Avatar group",
      max = 5,
      members,
      motion = "standard",
      onBlur,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
      overlap = "md",
      overflowLabel,
      reducedMotion: reducedMotionProp,
      reveal = "none",
      revealLabelVisibility = "hover",
      ring = "border",
      shape = "circle",
      size = "md",
      tabIndex,
      visibleMemberLabel,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const descriptionId = useId();
    const memberListId = useId();
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [activeKey, setActiveKey] = useState<AvatarGroupActiveKey | null>(
      null,
    );
    const stackRef = useRef<HTMLUListElement>(null);
    const totalCount = members.length;
    const visibleLimit = Math.min(normalizeMax(max, totalCount), totalCount);
    const visibleMembers = members.slice(0, visibleLimit);
    const hiddenMembers = members.slice(visibleLimit);
    const overflowCount = hiddenMembers.length;
    const overflowContext: AvatarGroupOverflowLabelContext = {
      count: overflowCount,
      hiddenMembers,
      label,
      members,
      totalCount,
      visibleCount: visibleMembers.length,
    };
    const overflowAccessibleLabel = getOverflowLabel({
      context: overflowContext,
      overflowLabel,
    });
    const describedBy = [descriptionId, ariaDescribedBy]
      .filter(Boolean)
      .join(" ");
    const visualItems =
      overflowCount > 0 ? visibleMembers.length + 1 : visibleMembers.length;
    const direction = getDirectionDataAttribute(dir);
    const reducedMotion =
      motion === "none" ||
      reducedMotionProp === true ||
      prefersReducedMotion === true;
    const motionBehavior = getMotionBehavior({
      motion,
      reducedMotion,
      reveal,
    });
    const canReveal = reveal !== "none";
    const revealActive =
      canReveal && (revealLabelVisibility === "always" || hovered || focused);
    const revealState = revealActive ? "revealed" : "collapsed";
    // Hovering a spread group fans the stack apart and zooms only the avatar
    // under the pointer, revealing its label. The static spread (all labels,
    // permanently fanned apart) is kept for the always/reduced/no-motion paths
    // where there is no pointer to follow.
    // `reducedMotion` already folds in `motion === "none"`, so excluding it here
    // also covers the no-motion path.
    const magnifyMode =
      reveal === "spread" &&
      revealLabelVisibility === "hover" &&
      !reducedMotion;
    const zoomScale = avatarGroupZoomScale[motion];
    const expandTransition = reducedMotion
      ? avatarGroupExpandTransitions.none
      : avatarGroupExpandTransitions[motion];
    const labelTransition = reducedMotion
      ? avatarGroupLabelTransitions.none
      : avatarGroupLabelTransitions[motion];
    const resolvedTabIndex =
      canReveal && revealLabelVisibility !== "always" && tabIndex === undefined
        ? 0
        : tabIndex;
    const revealSummary = getRevealSummary({
      hiddenMembers,
      overflowAccessibleLabel,
      visibleMemberLabel,
      visibleMembers,
    });

    const resetPointerState = () => {
      setHovered(false);
      setActiveKey(null);
    };

    // Track the avatar nearest the pointer so only it zooms and surfaces its
    // label; moving the pointer resets the previously active avatar.
    const updateActiveKeyFromPointer = (clientX: number) => {
      const stack = stackRef.current;

      if (!stack) {
        return;
      }

      const nodes = stack.querySelectorAll<HTMLElement>(
        '[data-slot="avatar-group-item"], [data-slot="avatar-group-overflow"]',
      );
      let nearest: AvatarGroupActiveKey | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      nodes.forEach((node) => {
        const bounds = node.getBoundingClientRect();

        if (bounds.width <= 0) {
          return;
        }

        const distance = Math.abs(clientX - (bounds.left + bounds.width / 2));

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = node.hasAttribute("data-overflow-item")
            ? "overflow"
            : Number(node.getAttribute("data-member-index"));
        }
      });

      if (nearest !== null) {
        setActiveKey((current) => (current === nearest ? current : nearest));
      }
    };

    const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
      if (canReveal) {
        setFocused(true);
      }

      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
      setFocused(false);
      onBlur?.(event);
    };

    const handlePointerEnter: PointerEventHandler<HTMLDivElement> = (event) => {
      if (canReveal && event.pointerType !== "touch" && canRevealForHover()) {
        setHovered(true);
      }

      onPointerEnter?.(event);
    };

    const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
      onPointerMove?.(event);

      if (!magnifyMode || event.pointerType === "touch") {
        return;
      }

      updateActiveKeyFromPointer(event.clientX);
    };

    const handlePointerLeave: PointerEventHandler<HTMLDivElement> = (event) => {
      resetPointerState();
      onPointerLeave?.(event);
    };

    const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
      if (canReveal && canRevealForHover()) {
        setHovered(true);
      }

      onMouseEnter?.(event);
    };

    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
      resetPointerState();
      onMouseLeave?.(event);
    };

    // The names summary (and the spread summary shown on keyboard focus, where
    // there is no pointer to drive the wave) fades as a single element.
    const showSummary =
      reveal === "names" || (reveal === "spread" && magnifyMode);
    const summaryVisible = reveal === "names" ? revealActive : focused;

    return (
      <motionElement.div
        {...(props as HTMLMotionProps<"div">)}
        ref={ref}
        aria-describedby={describedBy || undefined}
        aria-label={label}
        data-count={totalCount}
        data-direction={direction}
        data-motion={motion}
        data-motion-behavior={motionBehavior}
        data-overflow={overflowCount > 0 ? "true" : undefined}
        data-overflow-count={overflowCount}
        data-overlap={overlap}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        data-reveal={reveal}
        data-reveal-label-visibility={revealLabelVisibility}
        data-ring={ring}
        data-shape={shape}
        data-size={size}
        data-magnify={magnifyMode ? "true" : undefined}
        data-slot="avatar-group"
        data-state={revealState}
        data-visible-count={visibleMembers.length}
        dir={dir}
        role="group"
        tabIndex={resolvedTabIndex}
        className={avatarGroupClassNames({ className, overlap })}
        initial={false}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        <span
          id={descriptionId}
          data-slot="avatar-group-description"
          className="sr-only"
        >
          {members.length > 0
            ? members.map((member, index) => (
                <span key={getMemberKey(member, index)}>
                  {getMemberLabel({
                    index,
                    member,
                    visibleMemberLabel,
                  })}
                  {renderMemberMetadata(member.metadata)}
                  {index < members.length - 1 ? "; " : "."}
                </span>
              ))
            : "No members."}
          {overflowAccessibleLabel ? <> {overflowAccessibleLabel}.</> : null}
        </span>
        <ul
          ref={stackRef}
          aria-hidden="true"
          data-slot="avatar-group-stack"
          className={avatarGroupStackClasses}
        >
          {visibleMembers.map((member, index) => {
            // Non-zero for spread (transform-opacity); zero for reduced/no-motion.
            const spreadOffset = getRevealOffset({
              count: visualItems,
              direction,
              index,
              motionBehavior,
              reveal,
              size,
            });
            const itemActive = magnifyMode && hovered && activeKey === index;

            return (
              <AvatarGroupItem
                key={getMemberKey(member, index)}
                active={itemActive}
                expandTransition={expandTransition}
                itemIndex={index}
                label={getMemberLabel({ index, member, visibleMemberLabel })}
                labelActive={magnifyMode ? itemActive : revealActive}
                labelTransition={labelTransition}
                motionBehavior={motionBehavior}
                reducedMotion={reducedMotion}
                revealOffset={magnifyMode ? 0 : spreadOffset}
                revealState={revealState}
                showLabel={reveal === "spread"}
                slot="item"
                stackIndex={index + 1}
                xTarget={
                  magnifyMode ? (hovered ? spreadOffset : 0) : spreadOffset
                }
                zIndex={itemActive ? visualItems + 10 : index + 1}
                zoomScale={zoomScale}
              >
                <Avatar
                  alt=""
                  className={member.avatarClassName}
                  crossOrigin={member.crossOrigin}
                  decoding={member.decoding}
                  decorative
                  fallbackIcon={member.fallbackIcon}
                  fetchPriority={member.fetchPriority}
                  imageProps={member.imageProps}
                  initials={member.initials}
                  loading={member.loading}
                  motion={member.motion ?? "none"}
                  name={getAvatarName(member, index)}
                  onImageError={member.onImageError}
                  onImageLoad={member.onImageLoad}
                  reducedMotion={member.reducedMotion}
                  referrerPolicy={member.referrerPolicy}
                  ring={member.ring ?? ring}
                  shape={member.shape ?? shape}
                  size={member.size ?? size}
                  sizes={member.sizes}
                  src={member.src}
                  srcSet={member.srcSet}
                  tone={member.tone}
                />
              </AvatarGroupItem>
            );
          })}
          {overflowCount > 0
            ? (() => {
                const spreadOffset = getRevealOffset({
                  count: visualItems,
                  direction,
                  index: visualItems - 1,
                  motionBehavior,
                  reveal,
                  size,
                });
                const overflowActive =
                  magnifyMode && hovered && activeKey === "overflow";

                return (
                  <AvatarGroupItem
                    active={overflowActive}
                    expandTransition={expandTransition}
                    label={overflowAccessibleLabel}
                    labelActive={magnifyMode ? overflowActive : revealActive}
                    labelTransition={labelTransition}
                    motionBehavior={motionBehavior}
                    reducedMotion={reducedMotion}
                    revealOffset={magnifyMode ? 0 : spreadOffset}
                    revealState={revealState}
                    showLabel={
                      reveal === "spread" && Boolean(overflowAccessibleLabel)
                    }
                    slot="overflow"
                    stackIndex={visualItems}
                    xTarget={
                      magnifyMode ? (hovered ? spreadOffset : 0) : spreadOffset
                    }
                    zIndex={overflowActive ? visualItems + 10 : visualItems}
                    zoomScale={zoomScale}
                  >
                    <Avatar
                      decorative
                      className={avatarGroupOverflowClasses}
                      initials={getOverflowDisplay(overflowCount)}
                      motion="none"
                      name={overflowAccessibleLabel}
                      ring={ring}
                      shape={shape}
                      size={size}
                      tone="neutral"
                    />
                  </AvatarGroupItem>
                );
              })()
            : null}
        </ul>
        {showSummary ? (
          <motionElement.span
            aria-hidden="true"
            data-slot="avatar-group-reveal-summary"
            data-state={summaryVisible ? "revealed" : "collapsed"}
            className={avatarGroupRevealSummaryClasses}
            initial={false}
            animate={{ opacity: summaryVisible ? 1 : 0 }}
            transition={labelTransition}
          >
            {revealSummary}
          </motionElement.span>
        ) : null}
        <ol
          id={memberListId}
          aria-label={`${label} members`}
          data-slot="avatar-group-member-list"
          className="sr-only"
        >
          {members.length > 0 ? (
            members.map((member, index) => (
              <li
                key={getMemberKey(member, index)}
                data-slot="avatar-group-member"
              >
                {getMemberLabel({
                  index,
                  member,
                  visibleMemberLabel,
                })}
                {renderMemberMetadata(member.metadata)}
              </li>
            ))
          ) : (
            <li data-slot="avatar-group-empty">No members</li>
          )}
          {overflowAccessibleLabel ? (
            <li data-slot="avatar-group-overflow-label">
              {overflowAccessibleLabel}
            </li>
          ) : null}
        </ol>
      </motionElement.div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";
