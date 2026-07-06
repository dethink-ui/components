# Feedback States Component Spec

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/255.

Package target: `@dethink/components`.

## Branch Workflow

1. `feature/prd-255-feedback-states`
2. `feature/issue-257-feedback-states-contract-docs`
3. `feature/issue-258-live-region-announcer`
4. `feature/issue-259-loading-primitives`
5. `feature/issue-260-alert-callout`
6. `feature/issue-261-empty-state`
7. `feature/issue-262-toast-workflow`
8. `feature/issue-263-feedback-states-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch unless the GitHub issue dependency graph says otherwise.

## Research Notes

Context7 documentation was fetched for current shadcn/ui and Motion behavior.
Modern Web Guidance was fetched for persistent toast notifications and
accessibility.

Relevant decisions:

- Centralize live regions into a polite channel and an assertive channel.
- Debounce high-frequency live-region updates.
- Use assertive announcements only for critical, time-sensitive, or blocking
  states.
- Toasts need explicit dismiss controls and JavaScript-owned auto-dismiss
  timers.
- Toast interactions should not light-dismiss when the rest of the page is
  used.
- Reduced motion must disable transform-heavy movement and never hide state.
- Motion layout/presence is appropriate for Toast stack compaction and exit
  animation; simple color, opacity, border, and loading state transitions stay
  CSS-first.

## Component Family

Planned public exports:

- `LiveRegionProvider`
- `LiveRegion`
- `Announcer`
- `useAnnouncer`
- `Spinner`
- `Progress`
- `ProgressCircle`
- `Skeleton`
- `SkeletonText`
- `SkeletonAvatar`
- `SkeletonButton`
- `Alert`
- `Callout`
- `EmptyState`
- `ToastProvider`
- `ToastViewport`
- `Toast`
- `useToast`
- `ToastRender`
- `ToastRenderContext`

Public helper exports should include class-name helpers and public prop/state
types where they improve registry/open-code ergonomics.

## Accessibility Contract

- Use native buttons and links for actions.
- Keep focus indicators visible and token-backed.
- Spinner and Skeleton are decorative by default.
- Spinner can become a named `role="status"` element when labelled.
- Progress and ProgressCircle use `role="progressbar"` and expose determinate
  value attributes only when the current value is known.
- Alert uses `status` or `alert` roles only when its urgency requires it.
- Callout defaults to non-urgent semantics.
- Toasts are reachable when they contain actions, dismissible with an explicit
  button, and keyboard dismissible from within the toast.
- `ToastRecord.render` may replace the default title, description, and action
  layout with a custom `ReactNode` or `({ toast, dismiss }) => ReactNode` while
  retaining the toast shell, timer, dismiss control, and announcement behavior.
  Custom-rendered toasts should pass `announcement` when title/description text
  is not available for the live region.
- Announcements route through one provider-scoped polite and assertive channel.
- No component may rely on color or animation alone to communicate state.

## Motion Contract

- CSS utilities handle simple transition, pulse, shimmer, and indeterminate
  progress behavior.
- Toast may import `motion/react` for `AnimatePresence`, `motion.div`, layout
  compaction, and `useReducedMotion`.
- Toast supports `motion="none" | "subtle" | "standard" | "expressive"`.
- Reduced motion disables transform-heavy movement and layout choreography while
  preserving visual state.
- Registry metadata declares `motion` only for the Toast item.

## Styling Contract

- Use Tailwind v4 utilities and static class maps.
- Use token-backed colors: background, foreground, muted, border, ring, primary,
  destructive, success, warning, and info.
- Use density-aware spacing and sizing where controls or status rows have fixed
  dimensions.
- Support light, dark, compact/default/comfortable density, RTL, responsive
  layouts, and custom provider tokens.
- Expose stable `data-slot`, `data-tone`, `data-variant`, `data-size`,
  `data-state`, and `data-motion` attributes where useful.

## Testing Seams

- Unit: announcer queue/debounce/coalesce, progress clamping/formatting, toast
  reducer/timers, class helper output.
- Rendered behavior: accessible names, roles, dismiss actions, action callbacks,
  controlled and uncontrolled toast state, pause-on-hover/focus, keyboard
  dismiss.
- Accessibility: axe coverage for every primitive and actionable toasts.
- SSR: every primitive and provider surface renders without hydration mismatch.
- Storybook/showcase: core states, async workflows, long content, dark mode,
  density, RTL, and reduced motion.
- Registry: validate metadata and smoke install dependency closure.
