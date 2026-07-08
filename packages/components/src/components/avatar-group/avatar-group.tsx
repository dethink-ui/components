import {
  forwardRef,
  useState,
  useId,
  type CSSProperties,
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
  type AvatarTone,
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

const avatarGroupRevealSpread: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 22,
  "2xl": 26,
};

const avatarGroupTransitions: Record<AvatarGroupMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 360, damping: 34, mass: 0.9 },
  standard: { type: "spring", stiffness: 440, damping: 34, mass: 0.85 },
};

const avatarGroupLabelTransitions: Record<AvatarGroupMotion, Transition> = {
  none: { duration: 0 },
  subtle: { duration: 0.12, ease: "easeOut" },
  standard: { duration: 0.16, ease: "easeOut" },
};

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

function getItemStyle(index: number): CSSProperties {
  return { zIndex: index + 1 };
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
    const transition = reducedMotion
      ? avatarGroupTransitions.none
      : avatarGroupTransitions[motion];
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

    const handlePointerLeave: PointerEventHandler<HTMLDivElement> = (event) => {
      setHovered(false);
      onPointerLeave?.(event);
    };

    const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
      if (canReveal && canRevealForHover()) {
        setHovered(true);
      }

      onMouseEnter?.(event);
    };

    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
      setHovered(false);
      onMouseLeave?.(event);
    };

    const labelVariants = {
      collapsed: { opacity: revealLabelVisibility === "always" ? 1 : 0 },
      revealed: { opacity: 1 },
    };

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
        data-slot="avatar-group"
        data-state={revealState}
        data-visible-count={visibleMembers.length}
        dir={dir}
        role="group"
        tabIndex={resolvedTabIndex}
        className={avatarGroupClassNames({ className, overlap })}
        variants={{ collapsed: {}, revealed: {} }}
        initial={false}
        animate={revealState}
        whileHover={canReveal ? "revealed" : undefined}
        whileFocus={canReveal ? "revealed" : undefined}
        transition={transition}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
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
          aria-hidden="true"
          data-slot="avatar-group-stack"
          className={avatarGroupStackClasses}
        >
          {visibleMembers.map((member, index) => {
            const revealOffset = getRevealOffset({
              count: visualItems,
              direction,
              index,
              motionBehavior,
              reveal,
              size,
            });

            return (
              <motionElement.li
                key={getMemberKey(member, index)}
                data-member-index={index}
                data-motion-behavior={motionBehavior}
                data-reveal-offset={revealOffset}
                data-slot="avatar-group-item"
                data-stack-index={index + 1}
                data-state={revealState}
                style={getItemStyle(index)}
                className={avatarGroupItemClasses}
                variants={{
                  collapsed: { x: 0 },
                  revealed: { x: revealOffset },
                }}
                transition={transition}
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
                {reveal === "spread" ? (
                  <motionElement.span
                    aria-hidden="true"
                    data-slot="avatar-group-reveal-label"
                    data-state={revealState}
                    className={avatarGroupRevealLabelClasses}
                    variants={labelVariants}
                    transition={labelTransition}
                  >
                    {getMemberLabel({
                      index,
                      member,
                      visibleMemberLabel,
                    })}
                  </motionElement.span>
                ) : null}
              </motionElement.li>
            );
          })}
          {overflowCount > 0 ? (
            <motionElement.li
              data-overflow-item="true"
              data-motion-behavior={motionBehavior}
              data-reveal-offset={getRevealOffset({
                count: visualItems,
                direction,
                index: visualItems - 1,
                motionBehavior,
                reveal,
                size,
              })}
              data-slot="avatar-group-overflow"
              data-stack-index={visualItems}
              data-state={revealState}
              style={getItemStyle(visualItems - 1)}
              className={avatarGroupItemClasses}
              variants={{
                collapsed: { x: 0 },
                revealed: {
                  x: getRevealOffset({
                    count: visualItems,
                    direction,
                    index: visualItems - 1,
                    motionBehavior,
                    reveal,
                    size,
                  }),
                },
              }}
              transition={transition}
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
              {reveal === "spread" && overflowAccessibleLabel ? (
                <motionElement.span
                  aria-hidden="true"
                  data-slot="avatar-group-reveal-label"
                  data-state={revealState}
                  className={avatarGroupRevealLabelClasses}
                  variants={labelVariants}
                  transition={labelTransition}
                >
                  {overflowAccessibleLabel}
                </motionElement.span>
              ) : null}
            </motionElement.li>
          ) : null}
        </ul>
        {reveal === "names" ? (
          <motionElement.span
            aria-hidden="true"
            data-slot="avatar-group-reveal-summary"
            data-state={revealState}
            className={avatarGroupRevealSummaryClasses}
            variants={labelVariants}
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
