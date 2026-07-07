# SlotPlanner

Status: Complete. Registry item, Storybook coverage, playground smoke, SSR
tests, and package export shipped with issue #250.

SlotPlanner manages a bookable time-slot inventory: a provider-facing
manage mode (`SlotPlanner`) with week/day views, an editor dialog,
recurrence, constraints, and batch operations; and a consumer-facing book
mode (`SlotPicker`) that projects the same slot collection into the
viewer's time zone. A headless `useSlotPlanner` hook exposes all non-visual
state for fully custom layouts.

## Overview

- Slots are plain JSON-serializable definitions (`SlotPlannerSlotData`):
  ISO dates, wall-clock `HH:mm` times bound to an IANA zone, a stored
  lifecycle `state`, optional weekly/biweekly recurrence with
  per-occurrence overrides, capacity, and an open `data` payload bag.
- Occurrence availability (`requested`, `booked`, `expired`) is derived at
  render time (`SlotPlannerOccurrenceStatus`), never stored.
- Every noun, verb, and announcement is phrased through a configurable
  taxonomy, so the same component speaks "slots", "sessions", or
  "appointments".
- Constraints (`SlotPlannerConstraints`) are declarative and surfaced
  inline (editor violation list, cap meters, blocked batch copies).
  Enforcement authority stays with the app: SlotPlanner blocks its own
  affordances only, and the pure `validateSlotPlannerSlots` utility can run
  the exact same checks on a server before persisting.
- Motion (week slides, day-tab indicator, slot enter/exit, copy stagger,
  cap-meter fill) is transform/opacity only and collapses to instant state
  changes under reduced motion.

## Installation

Registry (recommended):

```sh
npx shadcn@latest add <registry-url>/slot-planner.json
```

The `slot-planner` registry item copies the full family — manage-mode
planner, book-mode picker, editor, motion layer, headless hook, constraints
engine, contract types, and the canonical fixtures module
(`slot-planner-fixtures.ts`) so the documented demos work immediately after
install. It declares:

- npm dependencies: `motion`, `@internationalized/date`
- registry dependencies: `dethink-base`, `button`, `checkbox`, `dialog`,
  `form-field`, `input`, `number-input`, `radio-group`, `select`,
  `tag-input`, `textarea`

Package:

```tsx
import {
  SlotPicker,
  SlotPlanner,
  useSlotPlanner,
  validateSlotPlannerSlots,
  type SlotPlannerConstraints,
  type SlotPlannerSlotData,
} from "@dethink/components";
```

The fixtures module is deliberately not part of the package's public entry;
it ships only through the registry item (and is used by tests and
Storybook inside this repo).

## Anatomy

Manage mode (`data-slot` attributes are the stable styling contract):

```
slot-planner                      root; data-view, data-reduced-motion, data-week-direction
├── slot-planner-toolbar          title + period controls + Week/Day switcher
├── slot-planner-week-layout      week view only; desktop split inspector, mobile stacked strip
│   ├── slot-planner-day-rail     role="tablist"; horizontal strip on mobile, side list on desktop
│   │   └── slot-planner-day-tab  data-selected, data-today, data-past
│   │       └── slot-planner-day-summary  per-status count chips
│   └── slot-planner-day-panel    role="tabpanel" in week view; data-past, data-loading, data-error
│       ├── slot-planner-day-heading
│       ├── slot-planner-cap-meter    daily/weekly entries; data-cap-reached; text + decorative fill bar
│       ├── slot-planner-day-actions  copy-day / copy-week / clear-day buttons
│       ├── slot-planner-slot-list    role="list"
│       │   └── slot-planner-slot-card  <li>; data-status, data-locked, data-pending, data-error
│       │       ├── slot-planner-slot-time / status-badge / duration-chip / recurrence-chip / tag-chip
│       │       ├── slot-planner-slot-note / slot-meta
│       │       └── slot-planner-slot-actions  edit / delete buttons
│       └── slot-planner-add-slot
├── slot-planner-day-panel        day view only; focused-day inspector without the day rail
├── editor / delete / batch dialogs (structural, via Dialog)
└── slot-planner-live-region      aria-live="polite"
```

Book mode mirrors the same shell with `slot-picker-*` slots plus
`slot-picker-request`, `slot-picker-provider-time`,
`slot-picker-remaining-seats`, and `data-viewer-time-zone` on the root.

## Examples

Manage mode (uncontrolled collection, constraints, custom vocabulary):

```tsx
<SlotPlanner
  title="Mentoring availability"
  defaultSlots={initialSlots}
  timeZone="Europe/London"
  constraints={{ dailyRequestableCap: 3, minNoticeMinutes: 720 }}
  taxonomy={{ slot: "session", slotPlural: "sessions" }}
  onCreateSlot={async ({ slot }) => api.createSlot(slot)}
  onUpdateSlot={async ({ slot }) => api.updateSlot(slot)}
  onDeleteOccurrence={async (ref) => api.deleteOccurrence(ref)}
  onDeleteSeries={async ({ slotId }) => api.deleteSeries(slotId)}
  onBatchChange={async (batch) => api.applyBatch(batch)}
/>
```

Book mode (controlled by the app; a request never mutates the collection):

```tsx
const [slots, setSlots] = useState(initialSlots);

<SlotPicker
  title="Book a session"
  slots={slots}
  viewerTimeZone="America/New_York"
  onBookRequest={async (payload) => {
    await api.requestSlot(payload); // payload.occurrenceDate stays provider-zone
    setSlots(await api.fetchSlots());
  }}
/>;
```

Custom renderer decoration (every surface exposes `renderDefault()`):

```tsx
<SlotPlanner
  renderers={{
    slotCard: ({ occurrence, renderDefault }) => (
      <div className="grid gap-2">
        {renderDefault()}
        {typeof occurrence.slot.data?.priceUsd === "number" ? (
          <p>${occurrence.slot.data.priceUsd} per seat</p>
        ) : null}
      </div>
    ),
  }}
/>
```

Headless hook (no shipped DOM, no Motion):

```tsx
const planner = useSlotPlanner({ defaultSlots, constraints });
// planner.weekDays, planner.selectedOccurrences, planner.summarizeDay(date),
// planner.dailyCap, planner.weeklyCap, planner.createSlot(values),
// planner.deleteOccurrence(...),
// planner.copyDay(dates), planner.announcement, ...
```

See `apps/storybook/src/SlotPlanner.stories.tsx` for runnable versions of
each of these, including taxonomy variants, cap-reached, editor violations,
viewer-zone comparison, dark/density/RTL, and reduced motion.

## API Summary

- `SlotPlanner` (`SlotPlannerProps<TData>`): `slots`/`defaultSlots`,
  `focusedDate`/`defaultFocusedDate`/`onFocusedDateChange`,
  `view`/`defaultView`/`onViewChange` (`"week" | "day"`), `timeZone`,
  `constraints`, `taxonomy`, `now`, `locale`, `title`, `loading`, `error`,
  `reducedMotion`, `renderers`, `generateSlotId`, and the mutation callbacks
  `onCreateSlot`, `onUpdateSlot`, `onDeleteOccurrence`, `onDeleteSeries`,
  `onBatchChange`. Callbacks may return promises to drive per-key
  pending/error/retry affordances.
- `SlotPicker` (`SlotPickerProps<TData>`): read-only `slots`,
  `viewerTimeZone`, `onBookRequest`, plus the shared focus/view/taxonomy/
  async-state/motion props. Draft and cancelled occurrences never surface in
  book mode.
- `useSlotPlanner` (`UseSlotPlannerOptions` → `UseSlotPlannerReturn`): the
  non-visual subset of `SlotPlannerProps` in; resolved state, expansion,
  validation, CRUD/batch dispatchers, pending/retry maps, and the
  taxonomy-phrased `announcement` out.
- Pure utilities: `validateSlotPlannerSlot(s)`,
  `countSlotPlannerPublishedOccurrences`, `expandSlotOccurrences`,
  `expandSlotsForRange`, `expandSlotsForViewerZone`,
  `projectSlotPlannerOccurrenceToZone`, `summarizeSlotPlannerDay`,
  `resolveSlotPlannerTaxonomy`, `applySlotPlannerMutation`,
  `applySlotPlannerBatch`, `createSlotFromEditorValues`,
  `updateSlotFromEditorValues`, `upsertSlotPlannerOccurrenceOverride`,
  template formatters, and the contract types/consts.

Full prop and type documentation lives in the source JSDoc
(`packages/components/src/components/slot-planner/`), which is part of the
open-code contract copied by the registry.

## Accessibility

- The day rail is a `tablist` with roving tabindex; the day panel is its
  `tabpanel`, labelled by the selected tab.
- All actions are real buttons; there are no drag-only interactions.
- The editor and confirm dialogs reuse the Dialog primitive's focus
  containment and restoration; after a deletion, focus recovers to the
  nearest remaining slot card (edit button, then card, then add-slot, then
  panel).
- Create/update/delete, week changes, cap-reached, batch results, and book
  requests are announced through a polite live region, phrased via the
  taxonomy.
- Caps, locked states, and violations are stated in text — never by color
  or motion alone. Violation lists render with `role="alert"`.

### Manual Keyboard Acceptance Criteria

Verified manually against the shipped component; re-check after structural
changes:

1. Day rail: `Tab` reaches the selected day tab; `ArrowRight`/`ArrowLeft`
   move day focus and selection (reversed under RTL, wrapping at week
   edges); `Home` selects Monday; `End` selects Sunday. `Tab` from the rail
   lands on the day panel.
2. Editor dialog: opening "Add slot to this day" (Enter/Space) moves focus
   into the dialog; `Tab` cycles within the dialog only; `Escape` closes it
   without saving and restores focus to the opener. Saving with violations
   keeps the dialog open and announces the `role="alert"` violation list.
3. Delete confirm: "Delete slot" opens the confirm dialog; for recurring
   slots it offers "Delete this occurrence" and "Delete series"; `Escape`
   cancels; confirming moves focus to the nearest remaining card.
4. SlotPicker: each available occurrence exposes a "Request {slot}" button
   activated with Enter or Space; unavailable occurrences expose no
   interactive control and state availability in text; the request outcome
   (pending, success, failure with Retry) is announced politely.

## Theming And Tokens

Styling uses provider tokens exclusively (`background`, `foreground`,
`border`, `ring`, `primary`, `destructive`, `muted`, `success`, `warning`,
`info`, spacing via `--dt-space-*`, density via the provider's density
scale). No component-specific `cssVars` are added by the registry item.
Light/dark, density (`compact`/`comfortable`), and RTL are driven by
`DethinkProvider`; state hooks for custom styling are the documented
`data-*` attributes.

## Recipes

- Mentoring: `taxonomy={{ slot: "session", slotPlural: "sessions", addSlot:
  "Add session to this day", ... }}` (shipped as
  `slotPlannerMentoringTaxonomy` in the fixtures module).
- Clinic: override `statusLabels` too, e.g. `{ requestable: "open", booked:
  "scheduled" }` (`slotPlannerClinicTaxonomy`).
- Facility/room letting: set `capacity` per slot, use `remainingSeats`
  taxonomy templates, and a `slotCard` renderer for room metadata carried
  in `data`.
- Custom renderer decoration and fully headless layouts: see Examples
  above; structural invariants (tab semantics, `<li>` wrappers, live
  region, dialog focus, delete-focus recovery) stay outside the render
  slots so custom renderers cannot break them.
- Server-side validation: run `validateSlotPlannerSlots(slots, constraints,
  now)` in the API handler with the same constraint object you pass to the
  component.

## Testing

- Package: `pnpm --filter @dethink/components vitest run
  src/components/slot-planner/` — contract round-trips, constraints,
  CRUD/mutation rules, utils (DST expansion, viewer-zone projection),
  rendered planner/picker behavior, headless hook, motion/reduced-motion,
  axe accessibility, and SSR hydration for both `SlotPlanner` and
  `SlotPicker`.
- Storybook interaction tests cover week navigation, day selection, editor
  open/create, constraint violations, cap-reached, custom renderers, the
  headless recipe, and the book-request flow.
- Registry: `pnpm registry:validate` and `pnpm registry:smoke` assert item
  shape, file existence, dependency metadata, relative-import resolution,
  anatomy slots, and package exports.
- Visual regression: no visual-regression runner is configured in this
  repository yet; the variant/theme/density/RTL/reduced-motion stories in
  `SlotPlanner.stories.tsx` are the intended capture set once one exists.

## Migration And Limitations

- Ambiguous or skipped wall-clock times around DST transitions report the
  `invalid-wall-clock-time` violation; valid series occurrences keep their
  wall-clock time across transitions while the UTC offset changes.
- Enforcement authority stays with the app: constraints gate SlotPlanner's
  own affordances and editor saves, but nothing prevents an app from
  persisting an invalid slot. Re-validate on the server.
- Capacity, booked, and requested counts are data-driven inputs; requested
  multi-seat occurrences remain requestable while unclaimed seats remain.
  SlotPicker never mutates counts. Concurrent-booking races are the app's
  concern.
- Book-request payloads identify occurrences by provider-zone
  `occurrenceDate`; viewer-zone dates are presentation only.
- Recurrence supports weekly and biweekly frequencies with `until` and
  per-occurrence overrides; other RRULE features (monthly, exclusion dates
  beyond `cancelled: true` overrides) are out of scope.
- Week and day views only; no month grid or multi-provider resource lanes
  (see the separate Scheduler/EventCalendar plan).
- `SlotPlanner` day view renders without the rail/tablist; keyboard week
  paging in day view relies on the toolbar buttons.
