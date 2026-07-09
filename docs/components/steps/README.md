# Steps

Steps is a data-driven process indicator for workflows whose next and future
steps can change. Consumers own the branch logic and panel content; Steps owns
the ordered-list semantics, current-step state, optional navigation, progress,
responsive presentation, and high-level Motion choreography.

The component is tracked by [PRD #349](https://github.com/parveshh/dethink-components/issues/349).

## Installation

Package import:

```tsx
import { Steps, type StepItemData } from "@dethink/components";
import "@dethink/components/styles.css";
```

Registry item:

```sh
steps
```

The registry item installs `dethink-base` and declares `motion` as a runtime
dependency. A copied component therefore receives the shared tokens, `cn`
helper, and animation dependency it imports.

## Basic Usage

```tsx
const items = [
  { id: "account", label: "Account" },
  { id: "profile", label: "Profile" },
  { id: "review", label: "Review", optional: true },
];

<Steps
  showProgress
  aria-label="Workspace setup"
  value="profile"
  items={items}
/>;
```

Every `id` must be stable and unique. With no `value` or `defaultValue`, the
first visible item is current. Use a controlled value when the active step is
synchronized with application state.

## Conditional Branching

The consumer calculates the visible branch. When an answer changes, preserve
the current item and replace only its next and future items:

```tsx
const items = requiresApproval
  ? [
      { id: "account", label: "Account" },
      { id: "details", label: "Details" },
      { id: "approval", label: "Manager approval" },
      { id: "launch", label: "Launch" },
    ]
  : [
      { id: "account", label: "Account" },
      { id: "details", label: "Details" },
      { id: "confirmation", label: "Confirmation" },
    ];

<Steps value="details" items={items} />;
```

Removing the current ID is unsupported. In development, Steps warns and keeps
the missing value instead of silently selecting a fallback. Change the current
value before removing that item from the active branch.

## Navigation

Navigation is opt-in. Interactive items are native buttons, so Enter and Space
activation, tab order, disabled behavior, and form safety come from the
platform.

```tsx
<Steps
  interactive
  value={currentStep}
  items={items}
  onValueChange={setCurrentStep}
/>
```

Any enabled visible item can request navigation. Mark destinations unavailable
with `disabled`; validation and navigation policy remain consumer-owned.

## Layout, Size, and Overflow

`orientation="horizontal" | "vertical"` is explicit and defaults to
`horizontal`. Horizontal Steps stays horizontal in narrow containers and uses
safe inline overflow. Vertical Steps uses a logical inline-start rail. Both
orientations support RTL without changing item order.

`size="sm" | "md" | "lg"` controls indicator and type scale. Shared density
tokens continue to control surrounding spacing through `DethinkProvider`.

## Statuses

Steps derives `complete`, `current`, and `upcoming` from the current ID and
visible array order. An item can override its visual/domain status with
`complete`, `upcoming`, `error`, or `skipped`:

```tsx
const items = [
  { id: "brief", label: "Brief", status: "complete" },
  { id: "approval", label: "Approval", status: "error" },
  { id: "security", label: "Security", status: "skipped" },
];
```

The current relationship is independent of a status override. A current item
with `status="error"` remains the sole element with `aria-current="step"` and
announces both its error and current-step state.

## Progress

`showProgress` renders a named progressbar. By default, the percentage is the
current ordinal divided by the visible branch length, so branch replacement
recalculates progress.

Use `progressValue` for product-specific progress and `formatProgress` for
display text:

```tsx
<Steps
  showProgress
  value="profile"
  items={items}
  progressValue={82}
  formatProgress={(percentage) => `${percentage}% migrated`}
/>
```

Explicit values are clamped to 0–100. A string or number returned by
`formatProgress` is also exposed as `aria-valuetext`; a React element remains
visible but cannot be converted into accessible text automatically.

## Custom Rendering

Use `renderItem(item, state)` to replace the visible label body while retaining
the component-owned list item, activation surface, indicator, status text, and
current-step semantics.

```tsx
type ReviewData = { owner: string };

const items: StepItemData<ReviewData>[] = [
  { id: "design", label: "Design", data: { owner: "Mina" } },
  { id: "review", label: "Review", data: { owner: "Arun" } },
];

<Steps<ReviewData>
  items={items}
  renderItem={(item, state) => (
    <span>
      {item.label} · {item.data?.owner} · {state.status}
    </span>
  )}
/>;
```

Keep the custom content readable as the button or static surface's accessible
name. Do not add nested interactive controls inside an interactive step.

## Motion

`motionPreset="none" | "subtle" | "standard" | "expressive"` defaults to
`standard`.

- `AnimatePresence` handles keyed future-step insertion and removal.
- Position-only layout animations move surviving steps after a branch change.
- A namespaced shared-layout marker follows the current ID.
- The progress indicator animates with `scaleX`, not width.
- Stable step IDs are animation identity.
- Initial presence animation is disabled for server-rendering stability.

Steps uses `MotionConfig` and `useReducedMotion`. A reduced-motion preference or
the `none` preset applies the completed visual state immediately without
removing status, progress, or current-step information. Hover, focus, and color
feedback remain tokenized CSS transitions.

## Anatomy

Stable `data-slot` hooks are provided for documentation, testing, and advanced
theme selectors:

- `steps`
- `steps-progress`, `steps-progress-track`, `steps-progress-indicator`, and
  `steps-progress-value`
- `steps-viewport` and `steps-list`
- `steps-item`, `steps-connector`, and `steps-surface`
- `steps-indicator`, `steps-current-marker`, `steps-body`, `steps-label`,
  `steps-description`, `steps-optional`, and `steps-status`

Prefer semantic tokens and documented data attributes over DOM-position
selectors. The internal element hierarchy can evolve while the public slots
remain stable.

## API

### StepsProps<TData>

| Prop             | Type                                               | Default         | Notes                                                 |
| ---------------- | -------------------------------------------------- | --------------- | ----------------------------------------------------- |
| `items`          | `StepItemData<TData>[]`                            | required        | Consumer-owned visible branch with stable unique IDs. |
| `value`          | `string`                                           | —               | Controlled current ID.                                |
| `defaultValue`   | `string`                                           | first item      | Initial uncontrolled current ID.                      |
| `onValueChange`  | `(value: string) => void`                          | —               | Called after enabled interactive activation.          |
| `interactive`    | `boolean`                                          | `false`         | Uses native buttons for enabled navigation.           |
| `orientation`    | `"horizontal" \| "vertical"`                       | `"horizontal"`  | Explicit visual orientation.                          |
| `size`           | `"sm" \| "md" \| "lg"`                             | `"md"`          | Indicator and type scale.                             |
| `motionPreset`   | `"none" \| "subtle" \| "standard" \| "expressive"` | `"standard"`    | High-level branch choreography.                       |
| `showProgress`   | `boolean`                                          | `false`         | Renders the progressbar.                              |
| `progressValue`  | `number`                                           | derived         | Explicit 0–100 product progress.                      |
| `formatProgress` | `(percentage, context) => ReactNode`               | rounded percent | Formats visible progress.                             |
| `renderItem`     | `(item, state) => ReactNode`                       | default body    | Replaces visible content inside owned semantics.      |

The root also accepts standard `HTMLAttributes<HTMLDivElement>`, excluding the
native `defaultValue` and `onChange` names that conflict with component state.

### StepItemData<TData>

| Field         | Type                                               | Notes                                           |
| ------------- | -------------------------------------------------- | ----------------------------------------------- |
| `id`          | `string`                                           | Required stable unique identity.                |
| `label`       | `ReactNode`                                        | Required readable label.                        |
| `description` | `ReactNode`                                        | Optional supporting copy.                       |
| `icon`        | `ReactNode`                                        | Optional decorative indicator content.          |
| `disabled`    | `boolean`                                          | Blocks interactive activation.                  |
| `optional`    | `boolean`                                          | Adds an optional affordance.                    |
| `status`      | `"complete" \| "upcoming" \| "error" \| "skipped"` | Explicit status override.                       |
| `data`        | `TData`                                            | Consumer domain payload passed to `renderItem`. |

`StepRenderState` exposes `index`, `count`, `current`, `disabled`,
`interactive`, `optional`, `orientation`, `size`, `status`, and `percentage`.

## Accessibility

- The visible process is an ordered list with restored `role="list"` semantics
  for Safari when flex/list-reset styling is present.
- Exactly one surface exposes `aria-current="step"` while the current ID is in
  the branch.
- Interactive surfaces are native `button type="button"` elements with visible
  focus and native disabled behavior.
- Status text is readable to assistive technology and never relies on color or
  motion alone.
- The progressbar exposes a name, `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow`, and text when it can be represented as a string.
- Horizontal overflow, zoom, high contrast, dark mode, RTL, and reduced motion
  do not remove information.

Manual acceptance should cover tabbing every enabled interactive step, Enter
and Space activation, focus visibility in both themes, 200% zoom, narrow
horizontal overflow, RTL placement, and the operating system's reduced-motion
setting.

## Theming

Steps uses shared semantic utilities including `background`, `foreground`,
`muted`, `border`, `ring`, `primary`, `success`, and `destructive`. It does not
hard-code brand colors. Configure these through the `dethink-base` CSS
variables or `DethinkProvider`; light, dark, high-contrast, and density modes
then flow through the component.

## Testing Guidance

Prefer public behavior checks:

- controlled and uncontrolled current state
- conditional future-branch replacement while preserving the current ID
- enabled and disabled native-button navigation
- empty and single-step arrays
- ordinal progress recalculation, explicit override, clamping, and formatting
- status overrides and custom content inside owned semantics
- exactly one current step, readable status, progressbar values, focus, and axe
- horizontal, vertical, RTL, theme, density, overflow, and reduced-motion
  Storybook states
- static SSR output, hydration, declarations, package build, and clean registry
  installation

## Migration Notes

Steps is a new public export. Existing products can migrate from hand-built
steppers by moving branch computation into a stable `items` array and mapping
their active route or workflow ID to `value`. Keep panels and Next/Back controls
outside Steps. Replace index keys with domain IDs before enabling Motion, and
translate any status-only current styling into a separate `value` plus optional
status override.

## Out of Scope

Steps does not render wizard panels, validate answers, provide Next/Back or
Complete controls, calculate branches, persist state, synchronize routers,
orchestrate async work, support drag reordering, or recover automatically when
the current item is removed.
