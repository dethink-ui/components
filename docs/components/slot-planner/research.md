# SlotPlanner Component Research

Status: PRD and issues published to GitHub.

Parent PRD: https://github.com/parveshh/dethink-components/issues/242
(implementation issues #243–#250; see `issues.md`).

Package target: `@dethink/components`.

## Purpose

SlotPlanner is a time-slot availability management and booking surface for
SaaS dashboards, internal tools, marketplaces, and AI-native scheduling flows.
A provider (mentor, doctor, interviewer, consultant, facility admin) defines
when they are available in configurable slots; a consumer (candidate, patient,
customer) views and requests/books those slots.

It is deliberately not an event calendar. The planned `Scheduler/EventCalendar`
(P2 in the inventory) renders arbitrary events on a time grid; SlotPlanner
manages a constrained inventory of bookable time slots with lifecycle states,
caps, buffers, and recurrence. The two share date foundations but solve
different jobs.

Reference starting point: the "Weekly planner" mock (mentor session
availability) showing a 7-day card rail, a selected-day panel with a daily cap
("2 / 3 requestable sessions"), slot cards with time range, duration chip,
"Recurring weekly" chip, session-type tags, buffer and timezone metadata,
edit/delete/delete-series actions, an "Add slot to this day" affordance,
week navigation, and a "Copy week" action. Booked slots stay locked.

## Naming And Configurable Taxonomy

Working name: `SlotPlanner` (folder `slot-planner`). Alternatives considered:
`TimeSlotScheduler` (collides with planned Scheduler), `AvailabilityPlanner`
(excludes the booking persona), `BookingPlanner` (too domain-specific).

Taxonomy is a first-class prop, not baked-in copy. A `taxonomy` (labels)
object maps every visible noun/verb so the same component reads correctly as:

- Booking: slot → "booking slot", requestable → "available", booked → "booked"
- Mentoring: slot → "session", requestable → "requestable", booked → "confirmed"
- Clinics: slot → "appointment", book → "schedule"
- Facilities: slot → "reservation", provider → "room"

Design direction:

- `taxonomy` prop with typed keys (`slot`, `slotPlural`, `requestable`,
  `booked`, `blocked`, `addSlot`, `copyWeek`, `dailyCap`, ...), defaults in
  neutral "slot" language.
- All strings flow through taxonomy, including live-region announcements and
  empty states, so i18n and white-labeling are the same mechanism.
- Follow the LocaleProvider direction from the inventory for date/number
  formatting; taxonomy handles domain nouns only.

## Personas And Modes

Two personas, one shared data model:

1. **Manage mode (v1 core)** — the provider view in the reference image.
   Create, edit, delete slots; set recurrence, caps, buffers; copy days/weeks;
   see booked-vs-requestable status. Booked slots are locked from editing.
2. **Book mode (v1.x / fast-follow)** — the consumer view. Browse available
   slots (converted to the viewer's timezone), select one, request/confirm.
   Read-only inventory plus a selection interaction; shares slot records,
   states, and taxonomy with manage mode.

Shipping manage mode first matches the image and keeps the tracer bullet thin;
book mode reuses the model and most rendering. Decision: both modes ship under
the same PRD, with book mode as the final stacked issues.

## Views

- **Week view (v1, default)** — day-card rail (or top strip on narrow
  viewports) + selected-day detail panel, as in the mock. Day cards summarize
  `N requestable · N booked` with a status dot.
- **Day view (v1)** — the detail panel standalone, for embedding in drawers or
  mobile.
- **Month overview (v2)** — density heatmap of availability per day; tap
  through to day view. Reuses the date-suite `Calendar` surface with custom
  day cell content.
- **Agenda/list view (v2)** — flat chronological list of upcoming slots across
  days, useful for "my upcoming bookings".
- **Time-grid paint view (v2/v3)** — drag-to-paint availability on a
  vertical time grid (Calendly-style). Powerful but gesture-heavy; explicitly
  deferred so v1 stays form-driven and accessible.

All views are projections of the same controlled slot collection; view
switching is a prop and/or built-in toolbar control.

## Feature Map

### v1 (tracer bullet scope candidates)

- Slot CRUD: add slot to a day, edit, delete single occurrence, delete series.
- Slot record: start time, duration, buffer before/after, timezone, tags
  (session types), recurrence, state, capacity + bookedCount (capacity is
  modeled in v1; default renderers show single-seat UI when capacity is 1),
  and open metadata passthrough.
- Lifecycle states: `draft`, `requestable` (open), `requested` (pending),
  `booked` (locked), `blocked`, `expired` (past), `cancelled`. Booked/locked
  slots render locked with no destructive actions.
- Recurrence: none / weekly / biweekly, with per-occurrence overrides and
  series end date. (Full RRULE support deferred; model should not preclude it.)
- Constraints engine (validation surfaced inline, app-enforced on the server):
  - daily cap and weekly cap on requestable slots (image: "2 / 3")
  - overlap prevention including buffers
  - min/max slot duration, allowed increments (5/10/15/30/60 min, matching
    the date-suite time increments)
  - min notice period and max advance-booking horizon
  - blackout dates / non-working days
- Week navigation: prev/next week, "This week" reset, controlled focused date.
- Copy operations: copy day → other days, copy week → next week, clear day.
- Timezone: slots bound to an IANA zone; recurring slots stored as wall-clock
  time + zone (DST-safe); viewer-timezone display conversion in book mode.
- Event callbacks: `onSlotCreate/Update/Delete/SeriesDelete/BookRequest` fire
  with plain JSON payloads. The component is presentation + interaction only:
  no fetching, no persistence, no backend assumptions. Callbacks may return
  promises so the component can show per-slot pending/error affordances, but
  the source of truth is always the JSON the app passes back in.
- Empty, loading, error, and past-day states for the day panel.

## Data Contract (JSON-First)

Decision: SlotPlanner is a pure client component driven entirely by
JSON-serializable data. No backend, no adapters, no data-fetching layer.
"JSON" means plain in-memory objects — typically deserialized API payloads —
never JSON text: the component neither parses nor emits JSON strings; the
shape is merely required to survive `JSON.stringify`/`JSON.parse` unchanged.

- The component accepts a `slots` array (plus `constraints` and `taxonomy`
  objects) of plain JSON: ISO 8601 date/time strings, IANA zone strings,
  numbers, strings, booleans, nested plain objects. Everything that goes in or
  comes out of a callback round-trips through `JSON.stringify` losslessly.
- Internally the component parses ISO strings into `@internationalized/date`
  values; those never leak into the public contract.
- Controlled and uncontrolled modes: `slots`/`onSlotsChange` for controlled
  usage; `defaultSlots` for demo/uncontrolled usage where the component owns
  the working copy.
- **Dynamic contract via generics + passthrough**: the public slot type is
  `SlotRecord<TData = Record<string, unknown>>` — a small required core
  (`id`, `date` or recurrence rule, `startTime`, `durationMinutes`,
  `timeZone`, `state`) plus an open `data: TData` bag. Core fields drive
  layout, constraints, and state machines; `data` is opaque to the component
  and exists for custom renderers (tags, prices, attendee info, links,
  anything). Default renderers understand a small set of conventional `data`
  keys (`tags`, `note`) and ignore the rest; buffers are first-class slot
  fields (`bufferBeforeMinutes`/`bufferAfterMinutes`), not `data` keys.
- A typed sample-data module ships with the registry item so Storybook,
  playground smoke tests, and consumer demos share one canonical JSON fixture.

## Custom Renderers With Defaults

Decision: every meaningful surface is replaceable via render props, with
polished defaults when no renderer is supplied. This is how the "dynamic JSON
contract" stays useful — unknown `data` fields are meaningless to the default
UI but fully available to custom renderers.

- Renderer slots (all optional, all receive typed context including the raw
  slot JSON, resolved taxonomy strings, state flags, and default-action
  handlers): `renderSlotCard`, `renderDayCard`, `renderDayHeader`,
  `renderToolbar`, `renderEmptyDay`, `renderCapMeter`, `renderSlotEditor`,
  `renderTag`.
- Each renderer's context exposes the default renderer itself
  (`ctx.renderDefault()`), so consumers can wrap/decorate rather than rebuild.
- Headless escape hatch: `useSlotPlanner` exposes the full state machine
  (visible range, focused day, derived per-day summaries, constraint results,
  action dispatchers) for fully custom layouts that skip the shipped views.
- Renderer overrides must not be able to break accessibility invariants that
  the component owns (day rail semantics, live announcements, focus recovery
  after delete); those live in the structural layer around the render slots.

## Motion

Motion (Framer Motion) is justified here per repo rules: the surfaces are
stateful, sequenced, and layout-aware. Direction, honoring
transform/opacity-only animation and `prefers-reduced-motion`:

- **Week navigation**: directional slide + fade of the day panel (and day rail
  summaries) when moving between weeks, via `AnimatePresence mode="popLayout"`
  with direction-aware variants; reverses correctly in RTL.
- **Day selection**: shared-layout indicator on the selected day card
  (`layoutId`), so selection visibly travels along the rail.
- **Slot list changes**: `AnimatePresence` with stable slot ids for
  add/remove; `layout` animation so remaining cards settle smoothly after a
  delete; a brief highlight pulse (opacity) on a newly created or just-edited
  slot so the result of "Add slot" is findable.
- **Copy week/day**: staggered entrance of the copied slot cards to
  communicate "these were just created in bulk".
- **Cap meter**: animate the fill on value change; state changes (cap reached)
  also communicated in text, never motion/color alone.
- **Editor dialog**: inherits Dialog's existing motion presets; no bespoke
  overlay animation.
- Reduced motion: all of the above collapse to instant transitions or simple
  fades via `MotionConfig reducedMotion="user"` / the repo's established
  pattern; no information is carried by animation alone.
- Registry hygiene: Motion is a real dependency of SlotPlanner's registry
  item, but the headless `useSlotPlanner` layer and constraint utilities stay
  Motion-free so custom builds don't inherit the dependency implicitly.

### v2+ (documented, deferred)

- Book-mode confirmation flow (attendee form handoff), multi-seat capacity UI.
- Month overview and agenda views; time-grid paint view.
- Templates ("standard week"), bulk multi-select operations.
- Slot filters by tag/session type; per-tag colors.
- Multi-resource columns (staff/rooms) — likely a separate block, not core.
- External calendar sync, payments, notifications, reminders, persistence —
  permanently out of scope for the component; apps react to the JSON event
  callbacks and own everything server-side.

## Component Family (direction)

- `SlotPlanner` — root, data-driven usage plus composable children.
- `SlotPlannerProvider` / `useSlotPlanner` — headless state (focused date,
  visible range, selection, pending ops) for custom layouts.
- `SlotPlannerToolbar` — title, week nav, "This week", copy-week, view switch.
- `SlotPlannerDayList` / `SlotPlannerDayCard` — the day rail with summaries.
- `SlotPlannerDayPanel` — selected-day header, cap meter, slot list, add CTA.
- `SlotPlannerSlotCard` — time range, chips (duration, recurrence), tags,
  buffer/timezone line, actions (edit, delete occurrence, delete series).
- `SlotPlannerSlotEditor` — Dialog/Drawer form for create/edit (composes
  date-suite time controls, Input, Select, TagInput).
- `SlotPicker` (book mode) — consumer-facing selectable slot list/grid.

## Composition With Existing Components

- date-suite foundations: `@internationalized/date` value model
  (`ZonedDateTime`/`Time`), `Calendar` for month overview, time-increment
  conventions from DateTimePicker. Prefer `@internationalized/date` over raw
  `Temporal` (Temporal is still unsupported in Safari per current guidance).
- `Dialog`/`Drawer` for the slot editor; `AlertDialog` for series deletion.
- `Badge` for chips/tags, `IconButton` for actions, `Popover`/`Tooltip` for
  metadata, `EmptyState`, `Skeleton`, `Toast` for async feedback.
- Provider tokens, density modes, RTL, dark mode, reduced motion per repo
  standards.

## Research Notes

Modern Web Guidance search (`accessible weekly schedule time slot picker grid
keyboard navigation`, skill-version 2026_05_16-c5e7870) surfaced:

- `coordinate-global-events` (retrieved): bind recurring events to an IANA
  zone; use zoned date-times so DST skipped/repeated hours resolve
  predictably; detect DST-gap slot times and warn (`disambiguation: 'reject'`
  semantics) or auto-resolve (`'compatible'`). Temporal itself lacks Safari
  support — use `@internationalized/date` equivalents, already a date-suite
  dependency.
- `manage-recurring-intervals`: recurring-interval math must handle month-end
  and DST edge cases; relevant to biweekly/monthly recurrence later.
- `accessibility`: semantic HTML first, buttons for actions, logical focus
  order, polite live regions for state feedback.

External prior art reviewed from domain knowledge (verify against current
products during PRD work): Calendly availability editor (weekly hours +
date-specific overrides, paint grid), Cal.com availability schedules
(open-source, wall-clock + timezone model, buffers/notice/horizon settings),
Google Calendar appointment schedules (caps, buffers, co-existence with
events), Microsoft Bookings (services ≈ session-type tags, staff resources).
Common denominators adopted above: weekly template + per-date exceptions,
buffers, notice/horizon limits, daily caps, locked booked slots.

## Accessibility Direction

- Day rail as a listbox or radiogroup pattern (single selected day) with
  arrow-key navigation and `aria-current="date"` for today.
- Slot list as a plain list of cards; every action is a real button; no
  drag-only interactions in v1.
- Live announcements (polite) for slot create/update/delete, week changes,
  cap reached, and async errors — all phrased through taxonomy.
- Editor dialog follows Dialog focus containment/restoration; deleting a slot
  moves focus to a sensible neighbor (next slot or add-slot CTA).
- Caps and locked state communicated in text, never color/icon alone.
- Manual keyboard acceptance criteria documented per repo testing rules.

## Resolved Decisions

1. Book mode (consumer `SlotPicker`) ships in the same PRD as manage mode, as
   the final stacked issues.
2. Capacity > 1 is modeled in the v1 JSON contract (`capacity`,
   `bookedCount`); default renderers show single-seat UI when capacity is 1.
3. Pure reusable component: JSON-first data contract, no backend, no
   data-fetching layer (see Data Contract section).
4. Generic rendering: custom render props over every meaningful surface with
   shipped defaults; open `data` bag on slot records feeds custom renderers
   (see Custom Renderers section).
5. Motion is in scope where it clarifies interaction (see Motion section).
6. Recurrence ceiling for v1 is weekly + biweekly with per-occurrence
   overrides; the JSON model must not preclude richer rules later.
7. The constraints engine is an exported headless utility (JSON-in/JSON-out,
   testable, reusable outside the component).
8. The time-grid paint view stays unscheduled (documented as a possible
   future direction, not committed to v2).

## Next Steps

1. Done: PRD published as GitHub issue #242 (`prd.md` mirror).
2. Done: tracer-bullet issues #243–#250 published (`issues.md` mirror,
   branch plan in `spec.md`).
3. Done: SlotPlanner added to `docs/component-inventory.md` and
   `docs/development-path.md` in the issue #243 slice.
4. Remaining: implement issues #244–#250 in stack order on
   `feature/prd-242-slot-planner`.
