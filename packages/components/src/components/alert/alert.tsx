import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type FeedbackTone =
  "neutral" | "info" | "success" | "warning" | "destructive";
export type FeedbackVariant = "soft" | "outline" | "solid" | "subtle";
export type AlertUrgency = "none" | "polite" | "assertive";

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  tone?: FeedbackTone;
  variant?: FeedbackVariant;
  urgency?: AlertUrgency;
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export interface CalloutProps extends Omit<AlertProps, "urgency"> {
  urgency?: AlertUrgency;
}

interface FeedbackSurfaceProps extends AlertProps {
  slotName?: "alert" | "callout";
}

const feedbackBaseClasses =
  "relative grid min-w-0 gap-[var(--dt-space-3)] rounded-lg border p-[var(--dt-space-4)] text-sm leading-6 shadow-sm";

const feedbackWithIconClasses = "grid-cols-[auto_minmax(0,1fr)]";

const feedbackVariantToneClasses: Record<
  FeedbackVariant,
  Record<FeedbackTone, string>
> = {
  outline: {
    neutral: "border-border bg-background text-foreground",
    info: "border-info/40 bg-background text-foreground",
    success: "border-success/40 bg-background text-foreground",
    warning: "border-warning/55 bg-background text-foreground",
    destructive: "border-destructive/45 bg-background text-foreground",
  },
  soft: {
    neutral: "border-border bg-muted/45 text-foreground",
    info: "border-info/20 bg-info/10 text-foreground",
    success: "border-success/20 bg-success/10 text-foreground",
    warning: "border-warning/30 bg-warning/15 text-foreground",
    destructive: "border-destructive/25 bg-destructive/10 text-foreground",
  },
  solid: {
    neutral: "border-foreground bg-foreground text-background",
    info: "border-info bg-info text-info-foreground",
    success: "border-success bg-success text-success-foreground",
    warning: "border-warning bg-warning text-warning-foreground",
    destructive:
      "border-destructive bg-destructive text-destructive-foreground",
  },
  subtle: {
    neutral: "border-transparent bg-transparent text-foreground shadow-none",
    info: "border-transparent bg-transparent text-foreground shadow-none",
    success: "border-transparent bg-transparent text-foreground shadow-none",
    warning: "border-transparent bg-transparent text-foreground shadow-none",
    destructive:
      "border-transparent bg-transparent text-foreground shadow-none",
  },
};

const feedbackIconToneClasses: Record<FeedbackTone, string> = {
  neutral: "text-muted-foreground",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const feedbackSolidIconClasses: Record<FeedbackTone, string> = {
  neutral: "text-background",
  info: "text-info-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive-foreground",
};

const feedbackTitleClasses = "font-medium text-current";
const feedbackDescriptionClasses = "text-current/78";
const feedbackActionsClasses =
  "flex flex-wrap items-center gap-[var(--dt-space-2)]";
const feedbackDismissClasses =
  "absolute end-[var(--dt-space-2)] top-[var(--dt-space-2)] inline-flex size-7 items-center justify-center rounded-md text-current/70 outline-none motion-safe:transition-colors motion-safe:duration-150 hover:bg-current/10 hover:text-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function alertClassNames({
  className,
  hasIcon,
  tone = "info",
  variant = "soft",
}: Pick<AlertProps, "className" | "tone" | "variant"> & {
  hasIcon?: boolean;
} = {}) {
  return cn(
    feedbackBaseClasses,
    hasIcon ? feedbackWithIconClasses : undefined,
    feedbackVariantToneClasses[variant][tone],
    className,
  );
}

function getRole(urgency: AlertUrgency) {
  if (urgency === "assertive") {
    return "alert";
  }

  if (urgency === "polite") {
    return "status";
  }

  return undefined;
}

const FeedbackSurface = forwardRef<HTMLDivElement, FeedbackSurfaceProps>(
  (
    {
      actions,
      children,
      className,
      description,
      dismissLabel = "Dismiss",
      icon,
      onDismiss,
      role,
      slotName = "alert",
      title,
      tone = "info",
      urgency = "polite",
      variant = "soft",
      ...props
    },
    ref,
  ) => {
    const resolvedRole = role ?? getRole(urgency);

    return (
      <div
        {...props}
        ref={ref}
        role={resolvedRole}
        data-slot={slotName}
        data-tone={tone}
        data-urgency={urgency}
        data-variant={variant}
        className={alertClassNames({
          className,
          hasIcon: Boolean(icon),
          tone,
          variant,
        })}
      >
        {icon ? (
          <span
            aria-hidden="true"
            data-slot="feedback-icon"
            className={cn(
              "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center",
              variant === "solid"
                ? feedbackSolidIconClasses[tone]
                : feedbackIconToneClasses[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
        <div
          data-slot="feedback-content"
          className="grid min-w-0 gap-[var(--dt-space-2)]"
        >
          {title ? (
            <div data-slot="feedback-title" className={feedbackTitleClasses}>
              {title}
            </div>
          ) : null}
          {description ? (
            <div
              data-slot="feedback-description"
              className={feedbackDescriptionClasses}
            >
              {description}
            </div>
          ) : null}
          {children}
          {actions ? (
            <div
              data-slot="feedback-actions"
              className={feedbackActionsClasses}
            >
              {actions}
            </div>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label={dismissLabel}
            data-slot="feedback-dismiss"
            className={feedbackDismissClasses}
            onClick={onDismiss}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
    );
  },
);

FeedbackSurface.displayName = "FeedbackSurface";

export const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <FeedbackSurface {...props} ref={ref} />
));

Alert.displayName = "Alert";

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  (
    { tone = "neutral", urgency = "none", variant = "outline", ...props },
    ref,
  ) => (
    <FeedbackSurface
      {...props}
      ref={ref}
      slotName="callout"
      tone={tone}
      urgency={urgency}
      variant={variant}
    />
  ),
);

Callout.displayName = "Callout";
