import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type SkeletonAnimation = "pulse" | "shimmer" | "none";
export type SkeletonRadius = "sm" | "md" | "lg" | "full";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animation?: SkeletonAnimation;
  radius?: SkeletonRadius;
  slotName?: string;
}

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  animation?: SkeletonAnimation;
}

export interface SkeletonAvatarProps extends SkeletonProps {
  size?: "sm" | "md" | "lg" | "xl";
}

export interface SkeletonButtonProps extends SkeletonProps {
  size?: "sm" | "md" | "lg";
}

const skeletonBaseClasses =
  "relative isolate overflow-hidden bg-muted text-transparent select-none";

const skeletonAnimationClasses: Record<SkeletonAnimation, string> = {
  none: "",
  pulse: "animate-pulse motion-reduce:animate-none",
  shimmer:
    "before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-background/55 before:to-transparent before:animate-[dt-skeleton-shimmer_1.45s_ease-in-out_infinite] motion-reduce:before:animate-none",
};

const skeletonRadiusClasses: Record<SkeletonRadius, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const skeletonAvatarSizeClasses: Record<
  NonNullable<SkeletonAvatarProps["size"]>,
  string
> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
};

const skeletonButtonSizeClasses: Record<
  NonNullable<SkeletonButtonProps["size"]>,
  string
> = {
  sm: "h-8 w-24",
  md: "h-density-control w-32",
  lg: "h-11 w-40",
};

export function skeletonClassNames({
  animation = "pulse",
  className,
  radius = "md",
}: Pick<SkeletonProps, "animation" | "className" | "radius"> = {}) {
  return cn(
    skeletonBaseClasses,
    skeletonRadiusClasses[radius],
    skeletonAnimationClasses[animation],
    className,
  );
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      animation = "pulse",
      className,
      radius = "md",
      slotName = "skeleton",
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      data-slot={slotName}
      data-animation={animation}
      data-radius={radius}
      className={skeletonClassNames({ animation, className, radius })}
    />
  ),
);

Skeleton.displayName = "Skeleton";

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ animation = "pulse", className, lines = 3, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      data-slot="skeleton-text"
      data-lines={lines}
      className={cn("grid gap-[var(--dt-space-2)]", className)}
    >
      {Array.from({ length: Math.max(1, lines) }).map((_, index) => (
        <Skeleton
          key={index}
          animation={animation}
          className={cn("h-3.5", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  ),
);

SkeletonText.displayName = "SkeletonText";

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <Skeleton
      {...props}
      ref={ref}
      slotName="skeleton-avatar"
      radius="full"
      className={cn(skeletonAvatarSizeClasses[size], className)}
    />
  ),
);

SkeletonAvatar.displayName = "SkeletonAvatar";

export const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, size = "md", ...props }, ref) => (
    <Skeleton
      {...props}
      ref={ref}
      slotName="skeleton-button"
      radius="md"
      className={cn(skeletonButtonSizeClasses[size], className)}
    />
  ),
);

SkeletonButton.displayName = "SkeletonButton";
