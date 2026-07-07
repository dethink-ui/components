# SlotPlanner Component Spec

Status: Complete. Implemented through issues #243-#250 with registry item,
Storybook coverage, playground smoke, SSR tests, docs (`docs.md`), and
package export.

Parent PRD: https://github.com/parveshh/dethink-components/issues/242

Package target: `@dethink/components`.

Supporting documents: `research.md` (feature research), `prd.md` (PRD
mirror), `issues.md` (tracer-bullet issue breakdown), `docs.md` (component
documentation: overview, installation, anatomy, examples, API,
accessibility, theming, recipes, testing, migration notes).

## Branch Workflow

Branch names follow the repository workflow in `CLAUDE.md`:

1. `feature/prd-242-slot-planner`
2. `feature/issue-243-slot-planner-contract-docs`
3. `feature/issue-244-slot-planner-core-week-view`
4. `feature/issue-245-slot-planner-editor-crud`
5. `feature/issue-246-slot-planner-constraints-copy`
6. `feature/issue-247-slot-planner-renderers-headless`
7. `feature/issue-248-slot-planner-motion`
8. `feature/issue-249-slot-planner-book-mode`
9. `feature/issue-250-slot-planner-registry-storybook`

Create the PRD branch from the current integration base. Create Issue 1 from
the PRD branch, then stack each later issue branch from the previous issue
branch. The final implementation PR targets the PRD branch, not the
repository default branch, unless explicitly requested.

## Summary

SlotPlanner is a pure, data-driven time-slot availability management and
booking surface. A provider defines bookable slots in a weekly planner
(manage mode); a consumer browses and requests them (book mode, SlotPicker).
It manages a constrained inventory of slots with lifecycle states, daily
caps, buffers, and weekly/biweekly recurrence — distinct from the planned
Scheduler/EventCalendar, which renders arbitrary events on a time grid.

The component is driven entirely by plain in-memory objects, typically
deserialized API payloads. The contract requires shapes to be
JSON-serializable (ISO 8601 date/time strings, IANA zone strings, plain
objects) so data round-trips losslessly through any transport, but the
component never parses or emits JSON text itself. Internal date math uses
`@internationalized/date`; those values never leak into the public contract.

## Use Cases

- Mentoring platforms: mentors publish requestable session slots with
  session-type tags, daily caps, and recurring weekly availability.
- Clinics and services: staff manage open appointment slots with buffers,
  notice periods, and blackout dates.
- Interview scheduling: coordinators publish interview slots with candidate
  metadata bound through the open payload bag and custom renderers.
- Facility reservations: rooms or equipment expose capacity-bearing slots
  with taxonomy adapted to "reservations".
- AI-native scheduling flows: assistants read and mutate the same JSON slot
  collection the component renders.

## Public API

Contract-first exports (published by issue #243, from
`packages/components/src/components/slot-planner/`):

- `SlotPlannerSlotData<TData>` with `SlotPlannerSlotPayload`,
  `SlotPlannerConventionalSlotData`, `SlotPlannerSlotState`,
  `SlotPlannerOccurrenceStatus`, and the runtime consts
  `slotPlannerSlotStates` / `slotPlannerOccurrenceStatuses`
- `SlotPlannerRecurrence`, `SlotPlannerRecurrenceFrequency`,
  `SlotPlannerOccurrenceOverride`, `SlotPlannerOccurrenceRef`
- `SlotPlannerConstraints`, `SlotPlannerViolation`,
  `SlotPlannerViolationCode`, `slotPlannerViolationCodes`
- `SlotPlannerTaxonomy`, `SlotPlannerTaxonomyInput`,
  `SlotPlannerCountTemplate`, `defaultSlotPlannerTaxonomy`
- Callback payloads: `SlotPlannerCreatePayload`, `SlotPlannerUpdatePayload`,
  `SlotPlannerDeleteOccurrencePayload`, `SlotPlannerDeleteSeriesPayload`,
  `SlotPlannerBookRequestPayload`, `SlotPlannerBatchChangePayload`

Canonical fixtures (`slotPlannerSampleSlots`, `slotPlannerSampleConstraints`,
`slotPlannerMentoringTaxonomy`, `slotPlannerClinicTaxonomy`) live in the
component's fixtures module for tests, Storybook, and the registry item; they
are deliberately not exported from the package entry so demo data never
becomes public API or consumer bundle weight.

Core slot shape:

```ts
export type SlotPlannerSlotData<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  id: string;
  /** ISO date (`YYYY-MM-DD`) of the first or only occurrence. */
  date: string;
  /** Wall-clock start time (`HH:mm`, 24-hour). */
  startTime: string;
  durationMinutes: number;
  /** IANA zone (e.g. `Europe/London`) the wall-clock times are bound to. */
  timeZone: string;
  /** Stored definition lifecycle; occurrence availability is derived. */
  state: SlotPlannerSlotState;
  recurrence?: SlotPlannerRecurrence;
  capacity?: number;
  bookedCount?: number;
  requestedCount?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  /** Open, JSON-serializable payload for custom renderers. */
  data?: TData;
};
```

Stored state covers the definition lifecycle only; everything time- or
booking-dependent is derived per occurrence, never stored:

```ts
/** Stored definition lifecycle of a slot. */
export type SlotPlannerSlotState =
  | "draft"
  | "requestable"
  | "blocked"
  | "cancelled";

/** Derived render-time status of one occurrence. */
export type SlotPlannerOccurrenceStatus =
  | "draft"
  | "requestable"
  | "requested"
  | "booked"
  | "blocked"
  | "expired"
  | "cancelled";
```

Occurrence status derivation precedence: cancelled (series state or override
`cancelled: true`) → blocked → draft → expired (occurrence end in the past)
→ booked (booked count reached `capacity`) → requested (requested count > 0)
→ requestable. Booking counts resolve per occurrence: an override's
`bookedCount`/`requestedCount` wins; otherwise slot-level counts apply only
to the occurrence on the slot's own `date`; every other occurrence defaults
to 0. An occurrence is removed from a series only via its override's
`cancelled` flag; whole-series cancellation uses slot-level
`state: "cancelled"`.

Constraint violations are structured, and rendered to text through the
taxonomy:

```ts
export type SlotPlannerViolation = {
  code: SlotPlannerViolationCode; // "daily-cap" | "overlap" | ...
  params?: Record<string, string | number>;
};
```

Recurring slots bind wall-clock time to an IANA zone so series survive DST
transitions predictably; per-occurrence overrides are keyed by occurrence
date:

```ts
export type SlotPlannerRecurrence = {
  frequency: "weekly" | "biweekly";
  until?: string;
  overrides?: SlotPlannerOccurrenceOverride[];
};
```

The `data` bag is opaque to SlotPlanner. Default renderers read only the
conventional keys (`tags`, `note`) and ignore everything else; custom
renderers receive the full bag untouched. Binding a generic gives typed
payload access:

```ts
type InterviewPayload = { candidateId: string; round: number; tags?: string[] };
const slot: SlotPlannerSlotData<InterviewPayload> = { /* ... */ };
```

Issue #247 ships the customization layer on this contract: renderer props
with a `renderDefault` escape hatch and the `useSlotPlanner` headless hook.
Every surface has a default; renderers, taxonomy, and constraints are all
optional. Later issues add Motion (#248), book mode / SlotPicker (#249), and
the registry item (#250).

### Custom Renderers

`SlotPlannerProps` accepts a single optional `renderers` prop with one render
prop per surface:

```ts
renderers?: SlotPlannerRenderers<TData>;

interface SlotPlannerRenderers<TData> {
  slotCard?: (context: SlotPlannerSlotCardRenderContext<TData>) => ReactNode;
  dayCard?: (context: SlotPlannerDayCardRenderContext<TData>) => ReactNode;
  dayHeader?: (context: SlotPlannerDayHeaderRenderContext<TData>) => ReactNode;
  toolbar?: (context: SlotPlannerToolbarRenderContext) => ReactNode;
  emptyDay?: (context: SlotPlannerEmptyDayRenderContext) => ReactNode;
  capMeter?: (context: SlotPlannerCapMeterRenderContext) => ReactNode;
  tag?: (context: SlotPlannerTagRenderContext<TData>) => ReactNode;
  slotEditor?: (context: SlotPlannerSlotEditorRenderContext) => ReactNode;
}
```

Every context type is exported, is serializable except for its functions,
and carries the resolved `taxonomy` plus a `renderDefault(): ReactNode`
escape hatch that returns the shipped default for that surface, plus
surface-specific data:

- `slotCard`: the full `occurrence` (raw slot JSON), `locked`, `pending`,
  `error`, `retry?()`, and the default action dispatchers `edit?()` /
  `remove?()` (absent on locked occurrences). Renders inside the structural
  `<li>` wrapper.
- `dayCard`: `date`, `selected`, `isToday`, `isPast`, per-status `summary`,
  and the day's `occurrences`. Renders inside the structural `role="tab"`
  button.
- `dayHeader`: `date`, `formattedDate`, `isToday`, `isPast`, `occurrences`.
- `toolbar`: `title`, `view`, `setView`, `todayIso`, `focusedDate`,
  `weekDays`, `setFocusedDate`, week navigation, and the batch dispatchers
  `copyDay()` / `copyWeek()` / `clearDay()`, which open the structural
  confirm dialogs.
- `emptyDay`: `date`, `isPast`.
- `capMeter` (only when daily or weekly cap constraints are set): `date`,
  primary `used`, `cap`, `reached`, formatted `text`, `reachedMessage?`, and
  optional `daily` / `weekly` entries.
- `tag`: one conventional `data.tags` chip — `tag` and its `occurrence`.
- `slotEditor`: the editor dialog content only — `mode`, `date`,
  `isRecurring`, `seriesValues`, `occurrenceValues`, `violations`, and
  `submit(result)` / `dismiss()`. The Dialog shell, its labelling, and focus
  containment stay structural.

Decorate the default instead of rebuilding it via `renderDefault`:

```tsx
<SlotPlanner
  renderers={{
    slotCard: ({ occurrence, renderDefault }) => (
      <>
        {renderDefault()}
        {typeof occurrence.slot.data?.priceUsd === "number" ? (
          <span className="text-xs">{`$${occurrence.slot.data.priceUsd}`}</span>
        ) : null}
      </>
    ),
  }}
/>
```

Unknown `data` keys are guaranteed to reach custom renderers untouched: the
`occurrence.slot.data` bag is passed by reference, never cloned or filtered,
so keys outside the conventional contract (like `priceUsd` above) are always
available with their original values.

### Headless Hook

`useSlotPlanner(options)` exposes everything non-visual — week navigation,
occurrence expansion, cap info, validation, CRUD/batch dispatchers with
pending/error/retry tracking, and taxonomy-phrased announcements — with no
JSX and no Motion. Its options are the non-visual subset of
`SlotPlannerProps` (`UseSlotPlannerOptions`); its return shape is
`UseSlotPlannerReturn`. The shipped component is a renderer over this hook,
so a fully custom layout keeps identical payloads and controlled /
uncontrolled semantics:

```tsx
function MyPlanner() {
  const planner = useSlotPlanner({ defaultSlots, constraints });

  return (
    <div>
      {planner.weekDays.map((day) => (
        <button key={day} onClick={() => planner.setFocusedDate(day)}>
          {day}
        </button>
      ))}
      {planner.selectedOccurrences.map((occurrence) => (
        <div key={planner.occurrenceKey(occurrence)}>
          {occurrence.startTime}
          <button onClick={() => planner.deleteOccurrence(occurrence)}>
            Delete
          </button>
        </div>
      ))}
      <output>{planner.announcement}</output>
    </div>
  );
}
```

## Taxonomy

`SlotPlannerTaxonomy` maps every visible noun, verb, and announcement across
manage and book modes, including pending/error affordances and violation
messages. Consumers pass a partial `taxonomy` prop merged over
`defaultSlotPlannerTaxonomy` (neutral slot language). `{tokens}` in
templates are replaced at render time; summaries interpolate resolved
`statusLabels` entries (`{statusLabel}`, `{requestableLabel}`) so counts can
never drift from the labels, and count-bearing templates are
`SlotPlannerCountTemplate` objects keyed by CLDR plural categories
(`Intl.PluralRules`) with a required `other` fallback:

```ts
export type SlotPlannerCountTemplate = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string; // e.g. "{count} {statusLabel}"
};
```

Booking vocabulary:

```ts
const bookingTaxonomy: SlotPlannerTaxonomyInput = {
  slot: "booking slot",
  slotPlural: "booking slots",
  statusLabels: { requestable: "available", booked: "booked" },
  addSlot: "Add booking slot",
};
```

Mentoring vocabulary (ships as `slotPlannerMentoringTaxonomy`):

```ts
const mentoringTaxonomy: SlotPlannerTaxonomyInput = {
  slot: "session",
  slotPlural: "sessions",
  addSlot: "Add session to this day",
};
```

Clinic vocabulary (ships as `slotPlannerClinicTaxonomy`):

```ts
const clinicTaxonomy: SlotPlannerTaxonomyInput = {
  slot: "appointment",
  slotPlural: "appointments",
  statusLabels: { requestable: "open", booked: "scheduled" },
};
```

## Behavior

- Manage mode: week view with a day-card rail (per-day requestable/booked
  summaries, arrow-key selection, today marked) and a selected-day panel
  (header, daily/weekly cap meter, slot cards, add-slot affordance). Day
  view is the panel without the rail/tablist but keeps the toolbar and view
  switcher. Week navigation: previous, next, this-week, controlled focused
  date.
- Slot CRUD through a Dialog editor with occurrence-versus-series semantics
  and per-occurrence overrides. Booked/blocked/expired/cancelled occurrences
  expose no destructive actions; requested occurrences stay mutable. Copy
  day, copy week, and clear day emit one
  `SlotPlannerBatchChangePayload` each: accepted copies in `createdSlots`,
  removed single slots in `deletedSlotIds`, recurring occurrences cleared
  via `cancelled: true` override upserts in the optional `updatedSlots`, and
  rejected candidates reported (never silently dropped) in the structured
  `violations` map.
- Constraints (daily/weekly caps, buffer-aware overlap, duration rules,
  notice, horizon, blackout dates) are validated by an exported pure utility
  and surfaced inline; enforcement authority stays with the app.
- All mutations fire callbacks with JSON-serializable payloads; callbacks
  may return promises to drive per-slot pending/error affordances. The
  source of truth is always the collection the app passes back in controlled
  mode; `defaultSlots` supports uncontrolled usage.
- Book mode: SlotPicker renders the same collection in a viewer timezone,
  fires book-request payloads, and renders unavailable/full/expired states
  as non-interactive.
- DST: recurring expansion resolves wall-clock times per occurrence in the
  slot's zone; DST-gap or ambiguous times are detected and surfaced rather
  than silently shifted.

## Accessibility

- Day rail uses a single-selection pattern with arrow-key navigation and
  `aria-current="date"` for today; slot actions are real buttons; no
  drag-only interactions.
- Editor dialog reuses Dialog focus containment and restoration; focus moves
  to a sensible neighbor after deletion.
- Polite live announcements for create/update/delete, week changes, and
  cap-reached, phrased through taxonomy.
- Caps, locked states, and violations are communicated in text, never by
  color or motion alone.
- Structural invariants (rail semantics, announcements, focus recovery) live
  outside the render slots so custom renderers cannot break them.

## Styling And Theming

- Tailwind CSS v4 utilities over provider tokens; no hard-coded brand
  colors. Light, dark, density, and RTL supported through tokens and
  variants.
- Data attributes expose state (`data-state`, `data-selected`,
  `data-locked`, `data-past`, `data-violation`) for styling hooks.
- Motion (Framer Motion) drives week transitions, the day-selection
  indicator, slot enter/exit, copy stagger, and the cap meter —
  transform/opacity only, collapsing under reduced motion. The headless hook
  and constraints utility stay Motion-free.

## Registry

- Registry item `slot-planner` (issue #250) with accurate files,
  dependencies (`motion`, `@internationalized/date`), registryDependencies
  (`dethink-base`), and the fixture module included so demos work after
  install.
- Copied source must remain portable: no hidden global styles beyond the
  documented base setup.

## Test Requirements

- Contract tests (issue #243, shipped): JSON round-trip of fixtures,
  taxonomies, and payload shapes; generic payload typing; default-taxonomy
  completeness; fixture coverage of states, zones, recurrence, capacity, and
  a DST-adjacent series.
- Unit tests: constraints utility, recurrence expansion across DST and month
  boundaries, per-day summary derivation.
- Rendered tests: views, navigation, CRUD flows, occurrence-versus-series
  deletion, locked slots, copy operations, taxonomy overrides everywhere,
  custom renderers (override, decorate, unknown `data` keys), controlled and
  uncontrolled collections, promise-driven pending/error affordances, book
  mode.
- Keyboard, axe, live-region, reduced-motion, SSR smoke, Storybook
  interaction, visual regression, and registry install smoke per the
  repository component definition of done.
