import type { PropRow } from "@/components/props-table";

export const feedbackStateProps: PropRow[] = [
  {
    prop: "LiveRegionProvider",
    type: "{ renderRegions, politeClassName, assertiveClassName }",
    defaultValue: "{ renderRegions: true }",
    description:
      "Provides one polite and one assertive live-region channel for announcements.",
  },
  {
    prop: "useAnnouncer",
    type: "() => { announce, announcePolite, announceAssertive, clear }",
    description:
      "Imperative announcement API with debounce and coalescing options.",
  },
  {
    prop: "Spinner",
    type: "{ size, tone, variant, label }",
    defaultValue: '{ size: "md", tone: "current", variant: "ring" }',
    description:
      "Decorative loading indicator by default; labelled instances expose role=status.",
  },
  {
    prop: "Spinner.variant",
    type: '"ring" | "dots" | "bouncing-dot" | "moving-rings"',
    defaultValue: '"ring"',
    description:
      "Indeterminate loading style. Use Skeleton for content placeholders and Progress for measured completion.",
  },
  {
    prop: "Progress",
    type: "{ value, min, max, indeterminate, label, status, showValue, tone }",
    defaultValue: "{ min: 0, max: 100 }",
    description:
      "Linear progressbar with determinate, indeterminate, value label, and status text support.",
  },
  {
    prop: "ProgressCircle",
    type: "ProgressProps & { thickness }",
    defaultValue: "{ thickness: 8 }",
    description:
      "Circular progress visual with the same value semantics as Progress.",
  },
  {
    prop: "Skeleton",
    type: '{ animation: "pulse" | "shimmer" | "none", radius }',
    defaultValue: '{ animation: "pulse", radius: "md" }',
    description:
      "Decorative layout-preserving placeholder with reduced-motion-safe animation.",
  },
  {
    prop: "Alert",
    type: "{ tone, variant, urgency, title, description, icon, actions, onDismiss }",
    defaultValue: '{ tone: "info", variant: "soft", urgency: "polite" }',
    description:
      "Inline status surface with optional urgent announcement semantics and action slots.",
  },
  {
    prop: "Callout",
    type: "AlertProps",
    defaultValue: '{ tone: "neutral", variant: "outline", urgency: "none" }',
    description:
      "Contextual guidance surface that stays non-urgent unless explicitly configured.",
  },
  {
    prop: "EmptyState",
    type: "{ variant, tone, visual, title, description, primaryAction, secondaryAction }",
    defaultValue: '{ variant: "card", tone: "neutral" }',
    description:
      "Composable empty, no-results, no-access, onboarding, and recovery state layout.",
  },
  {
    prop: "ToastProvider",
    type: "{ toasts, defaultToasts, placement, motion, maxToasts, defaultDuration }",
    defaultValue: '{ placement: "bottom-end", motion: "standard" }',
    description:
      "Owns toast state, announcements, timers, and the imperative useToast API.",
  },
  {
    prop: "ToastRecord.render",
    type: "ReactNode | ({ toast, dismiss }) => ReactNode",
    description:
      "Overrides default title, description, and action layout; pair with announcement for live-region copy.",
  },
  {
    prop: "ToastViewport",
    type: "{ placement, motion }",
    description:
      "Fixed, safe-area-aware stack surface for actionable and dismissible toasts.",
  },
];
