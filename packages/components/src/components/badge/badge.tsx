import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = "solid" | "soft" | "outline" | "subtle";
export type BadgeTone =
  "neutral" | "primary" | "success" | "warning" | "destructive" | "info";
export type BadgeSize = "xs" | "sm" | "md" | "lg";
export type BadgeIconPlacement = "leading" | "trailing";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: ReactNode;
  iconPlacement?: BadgeIconPlacement;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const badgeBaseClasses =
  "inline-flex max-w-full shrink-0 items-center justify-center rounded-full border font-medium leading-none whitespace-nowrap align-baseline transition-colors contrast-more:border-current";

const badgeVariantToneClasses: Record<
  BadgeVariant,
  Record<BadgeTone, string>
> = {
  solid: {
    neutral: "border-foreground bg-foreground text-background",
    primary: "border-primary bg-primary text-primary-foreground",
    success: "border-success bg-success text-success-foreground",
    warning: "border-warning bg-warning text-warning-foreground",
    destructive:
      "border-destructive bg-destructive text-destructive-foreground",
    info: "border-info bg-info text-info-foreground",
  },
  soft: {
    neutral: "border-border bg-muted/70 text-foreground",
    primary: "border-primary/20 bg-primary/10 text-foreground",
    success: "border-success/25 bg-success/10 text-foreground",
    warning: "border-warning/35 bg-warning/15 text-foreground",
    destructive: "border-destructive/25 bg-destructive/10 text-foreground",
    info: "border-info/25 bg-info/10 text-foreground",
  },
  outline: {
    neutral: "border-border bg-background text-foreground",
    primary: "border-primary/45 bg-background text-foreground",
    success: "border-success/45 bg-background text-foreground",
    warning: "border-warning/60 bg-background text-foreground",
    destructive: "border-destructive/50 bg-background text-foreground",
    info: "border-info/45 bg-background text-foreground",
  },
  subtle: {
    neutral: "border-transparent bg-muted/35 text-foreground",
    primary: "border-transparent bg-primary/5 text-foreground",
    success: "border-transparent bg-success/10 text-foreground",
    warning: "border-transparent bg-warning/10 text-foreground",
    destructive: "border-transparent bg-destructive/10 text-foreground",
    info: "border-transparent bg-info/10 text-foreground",
  },
};

const badgeSizeClasses: Record<BadgeSize, string> = {
  xs: "[--badge-gap:var(--dt-space-1)] [--badge-min-height:calc(var(--dt-density-control)*0.52)] [--badge-px:var(--dt-space-1-5)] [--badge-py:0rem] text-[0.6875rem]",
  sm: "[--badge-gap:var(--dt-space-1)] [--badge-min-height:calc(var(--dt-density-control)*0.6)] [--badge-px:var(--dt-space-2)] [--badge-py:var(--dt-space-0-5)] text-xs",
  md: "[--badge-gap:var(--dt-space-1-5)] [--badge-min-height:calc(var(--dt-density-control)*0.72)] [--badge-px:var(--dt-space-2-5)] [--badge-py:var(--dt-space-1)] text-sm",
  lg: "[--badge-gap:var(--dt-space-2)] [--badge-min-height:calc(var(--dt-density-control)*0.82)] [--badge-px:var(--dt-space-3)] [--badge-py:var(--dt-space-1)] text-sm",
};

const badgeIconBaseClasses =
  "pointer-events-none inline-flex shrink-0 items-center justify-center opacity-85";

const badgeIconSizeClasses: Record<BadgeSize, string> = {
  xs: "size-3 [&>svg]:size-3",
  sm: "size-3.5 [&>svg]:size-3.5",
  md: "size-4 [&>svg]:size-4",
  lg: "size-4 [&>svg]:size-4",
};

export function badgeClassNames({
  className,
  size = "md",
  tone = "neutral",
  variant = "soft",
}: Pick<BadgeProps, "className" | "size" | "tone" | "variant"> = {}) {
  return cn(
    badgeBaseClasses,
    badgeSizeClasses[size],
    "min-h-[var(--badge-min-height)] gap-[var(--badge-gap)] px-[var(--badge-px)] py-[var(--badge-py)]",
    badgeVariantToneClasses[variant][tone],
    className,
  );
}

function renderBadgeIcon(
  icon: ReactNode,
  slot: "badge-leading-icon" | "badge-trailing-icon",
  size: BadgeSize,
) {
  if (!icon) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      data-slot={slot}
      className={cn(badgeIconBaseClasses, badgeIconSizeClasses[size])}
    >
      {icon}
    </span>
  );
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      className,
      icon,
      iconPlacement = "leading",
      leadingIcon,
      size = "md",
      tone = "neutral",
      trailingIcon,
      variant = "soft",
      ...props
    },
    ref,
  ) => {
    const placedLeadingIcon =
      icon && iconPlacement === "leading" ? icon : leadingIcon;
    const placedTrailingIcon =
      icon && iconPlacement === "trailing" ? icon : trailingIcon;

    return (
      <span
        {...props}
        ref={ref}
        data-slot="badge"
        data-tone={tone}
        data-variant={variant}
        data-size={size}
        data-icon-placement={icon ? iconPlacement : undefined}
        className={badgeClassNames({ className, size, tone, variant })}
      >
        {renderBadgeIcon(placedLeadingIcon, "badge-leading-icon", size)}
        {children}
        {renderBadgeIcon(placedTrailingIcon, "badge-trailing-icon", size)}
      </span>
    );
  },
);

Badge.displayName = "Badge";
