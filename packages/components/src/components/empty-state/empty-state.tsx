import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import type { FeedbackTone } from "../alert";

export type EmptyStateVariant = "compact" | "card" | "table" | "page";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: EmptyStateVariant;
  tone?: FeedbackTone;
  visual?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  footer?: ReactNode;
}

const emptyStateBaseClasses =
  "grid min-w-0 place-items-center text-center text-sm text-muted-foreground";

const emptyStateVariantClasses: Record<EmptyStateVariant, string> = {
  compact: "gap-[var(--dt-space-2)] rounded-md p-[var(--dt-space-4)]",
  card:
    "gap-[var(--dt-space-3)] rounded-lg border border-border bg-background p-[var(--dt-space-6)] shadow-sm",
  table:
    "min-h-40 gap-[var(--dt-space-3)] rounded-md border border-dashed border-border bg-muted/20 p-[var(--dt-space-6)]",
  page:
    "min-h-80 gap-[var(--dt-space-4)] rounded-lg border border-border bg-background p-[var(--dt-space-8)] shadow-sm",
};

const emptyStateToneClasses: Record<FeedbackTone, string> = {
  neutral: "[&_[data-slot=empty-state-visual]]:text-muted-foreground",
  info: "[&_[data-slot=empty-state-visual]]:text-info",
  success: "[&_[data-slot=empty-state-visual]]:text-success",
  warning: "[&_[data-slot=empty-state-visual]]:text-warning",
  destructive: "[&_[data-slot=empty-state-visual]]:text-destructive",
};

const emptyStateVisualClasses =
  "inline-flex size-12 items-center justify-center rounded-lg border border-border bg-muted/45 [&>svg]:size-6";
const emptyStateTitleClasses = "max-w-prose text-base font-medium leading-6 text-foreground";
const emptyStateDescriptionClasses = "max-w-prose leading-6 text-muted-foreground";
const emptyStateActionsClasses =
  "flex flex-wrap items-center justify-center gap-[var(--dt-space-2)]";

export function emptyStateClassNames({
  className,
  tone = "neutral",
  variant = "card",
}: Pick<EmptyStateProps, "className" | "tone" | "variant"> = {}) {
  return cn(
    emptyStateBaseClasses,
    emptyStateVariantClasses[variant],
    emptyStateToneClasses[tone],
    className,
  );
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      children,
      className,
      description,
      footer,
      primaryAction,
      secondaryAction,
      title,
      tone = "neutral",
      variant = "card",
      visual,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      data-slot="empty-state"
      data-tone={tone}
      data-variant={variant}
      className={emptyStateClassNames({ className, tone, variant })}
    >
      {visual ? (
        <div aria-hidden="true" data-slot="empty-state-visual" className={emptyStateVisualClasses}>
          {visual}
        </div>
      ) : null}
      {title || description ? (
        <div data-slot="empty-state-copy" className="grid justify-items-center gap-[var(--dt-space-1)]">
          {title ? (
            <div data-slot="empty-state-title" className={emptyStateTitleClasses}>
              {title}
            </div>
          ) : null}
          {description ? (
            <div data-slot="empty-state-description" className={emptyStateDescriptionClasses}>
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
      {primaryAction || secondaryAction ? (
        <div data-slot="empty-state-actions" className={emptyStateActionsClasses}>
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
      {footer ? (
        <div data-slot="empty-state-footer" className="text-xs text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  ),
);

EmptyState.displayName = "EmptyState";
