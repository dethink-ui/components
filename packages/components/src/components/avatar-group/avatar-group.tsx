import {
  forwardRef,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  Avatar,
  type AvatarProps,
  type AvatarRing,
  type AvatarShape,
  type AvatarSize,
  type AvatarTone,
} from "../avatar";
import { cn } from "../../utils/cn";

export type AvatarGroupOverlap = "none" | "sm" | "md" | "lg";

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
  overlap?: AvatarGroupOverlap;
  overflowLabel?: AvatarGroupOverflowLabel;
  ring?: AvatarRing;
  shape?: AvatarShape;
  size?: AvatarSize;
  visibleMemberLabel?: AvatarGroupVisibleMemberLabel;
}

const avatarGroupBaseClasses =
  "inline-flex max-w-full items-center align-middle";

const avatarGroupOverlapClasses: Record<AvatarGroupOverlap, string> = {
  none: "[--avatar-group-overlap:0rem]",
  sm: "[--avatar-group-overlap:calc(var(--dt-density-control)*0.16)]",
  md: "[--avatar-group-overlap:calc(var(--dt-density-control)*0.28)]",
  lg: "[--avatar-group-overlap:calc(var(--dt-density-control)*0.4)]",
};

const avatarGroupStackClasses =
  "isolate flex list-none items-center p-0 [margin-block:0] [margin-inline:0]";

const avatarGroupItemClasses =
  "relative flex shrink-0 [margin-inline-start:calc(var(--avatar-group-overlap)*-1)] first:[margin-inline-start:0]";

const avatarGroupOverflowClasses = "bg-background text-muted-foreground";

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
      overlap = "md",
      overflowLabel,
      ring = "border",
      shape = "circle",
      size = "md",
      visibleMemberLabel,
      ...props
    },
    ref,
  ) => {
    const descriptionId = useId();
    const memberListId = useId();
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

    return (
      <div
        {...props}
        ref={ref}
        aria-describedby={describedBy || undefined}
        aria-label={label}
        data-count={totalCount}
        data-direction={getDirectionDataAttribute(dir)}
        data-overflow={overflowCount > 0 ? "true" : undefined}
        data-overflow-count={overflowCount}
        data-overlap={overlap}
        data-ring={ring}
        data-shape={shape}
        data-size={size}
        data-slot="avatar-group"
        data-visible-count={visibleMembers.length}
        dir={dir}
        role="group"
        className={avatarGroupClassNames({ className, overlap })}
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
          {visibleMembers.map((member, index) => (
            <li
              key={getMemberKey(member, index)}
              data-member-index={index}
              data-slot="avatar-group-item"
              data-stack-index={index + 1}
              style={getItemStyle(index)}
              className={avatarGroupItemClasses}
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
            </li>
          ))}
          {overflowCount > 0 ? (
            <li
              data-overflow-item="true"
              data-slot="avatar-group-overflow"
              data-stack-index={visualItems}
              style={getItemStyle(visualItems - 1)}
              className={avatarGroupItemClasses}
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
            </li>
          ) : null}
        </ul>
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
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";
