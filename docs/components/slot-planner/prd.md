# SlotPlanner Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/242.

Package target: `@dethink/components`.

Last amended: 2026-07-06.

## Problem Statement

Products that offer bookable time — mentoring platforms, clinics, interview
scheduling, consulting, facility reservations, AI-assisted scheduling flows —
need a surface where a provider defines available time slots and a consumer
views and requests them. The repository has date-suite foundations (Calendar,
DatePicker, DateRangePicker, DateTimePicker), Dialog, Badge, IconButton, and
Timeline, but nothing that manages a constrained inventory of bookable slots
with lifecycle states, daily caps, buffers, recurrence, and locked bookings.

Without SlotPlanner, teams hand-roll availability editors from Calendar plus
forms, embed a third-party booking widget that cannot match the design system,
or misuse an event-calendar component for slot inventory. That leads to
inconsistent timezone/DST handling, broken recurring-slot semantics, missing
cap/buffer/overlap validation, inaccessible day/slot navigation, and booking
copy that cannot adapt to each product's domain language.

SlotPlanner is deliberately not the planned Scheduler/EventCalendar. That
component renders arbitrary events on a time grid; SlotPlanner manages a
bookable slot inventory with states, constraints, and configurable taxonomy.

## Solution

Ship a SlotPlanner component family that is a pure, JSON-driven client
component with two personas over one data model:

- Manage mode: a weekly planner with a day-card rail and a selected-day panel
  where providers add, edit, and delete slots, set recurrence and buffers, see
  daily-cap progress and booked counts, navigate weeks, and copy days/weeks.
  Booked slots stay locked.
- Book mode: a `SlotPicker` surface where consumers browse available slots in
  their own timezone and request/select one, honoring capacity.

Everything visible speaks a configurable taxonomy (slot/session/appointment/
booking vocabulary) so the same component fits any booking domain. Every
meaningful surface is replaceable through render props with polished defaults,
and slot records carry an open `data` bag so the JSON contract extends without
component changes. A headless hook and an exported constraints utility support
fully custom layouts. Motion is built in where it clarifies interaction.

## User Stories

1. As a provider, I want a weekly planner with a day rail and day detail panel, so that I can manage my availability one day at a time.
2. As a provider, I want per-day summaries of requestable and booked slot counts, so that I can scan my week at a glance.
3. As a provider, I want to add a slot to a day with start time, duration, and buffers, so that I can publish availability quickly.
4. As a provider, I want to edit an existing slot, so that I can correct times without deleting and recreating it.
5. As a provider, I want to delete a single occurrence or a whole series, so that recurring availability stays manageable.
6. As a provider, I want booked slots locked from editing and deleting, so that I cannot accidentally break a confirmed booking.
7. As a provider, I want weekly and biweekly recurrence with per-occurrence overrides, so that my standard week repeats without manual re-entry.
8. As a provider, I want a daily cap meter, so that I can see how many requestable slots remain against my limit.
9. As a provider, I want overlap prevention that accounts for buffers, so that I cannot publish conflicting slots.
10. As a provider, I want min-notice and booking-horizon constraints surfaced inline, so that invalid slots are caught before publishing.
11. As a provider, I want blackout dates and non-working days respected, so that slots cannot land on days I have excluded.
12. As a provider, I want week navigation with previous, next, and this-week controls, so that I can plan ahead quickly.
13. As a provider, I want to copy a day to other days and copy a week forward, so that repeating patterns take seconds to build.
14. As a provider, I want to clear a day, so that I can restart a day's availability quickly.
15. As a provider, I want slots tagged with session types, so that different offerings are distinguishable on each slot card.
16. As a provider, I want slot capacity greater than one, so that group sessions can accept multiple attendees.
17. As a consumer, I want to browse available slots in my own timezone, so that I can pick a time without converting mentally.
18. As a consumer, I want to select a slot and trigger a booking request, so that the app can confirm my booking.
19. As a consumer, I want full slots and expired slots clearly unavailable, so that I only attempt bookable times.
20. As a consumer, I want remaining-seat information on multi-capacity slots, so that I know whether a group session has space.
21. As a keyboard user, I want arrow-key navigation across the day rail and slot actions reachable by Tab, so that the planner works without a pointer.
22. As a keyboard user, I want focus to move to a sensible neighbor after deleting a slot, so that I am not dropped out of the page flow.
23. As a screen-reader user, I want slot creation, updates, deletion, week changes, and cap-reached states announced politely, so that changes are perceivable.
24. As a screen-reader user, I want day summaries, slot states, and locked states conveyed in text, so that meaning never depends on color or motion alone.
25. As a screen-reader user, I want the slot editor dialog labelled and focus-managed, so that editing is understandable.
26. As a product engineer, I want the component driven entirely by JSON-serializable props, so that slots round-trip through my own state and APIs losslessly.
27. As a product engineer, I want controlled and uncontrolled slot collections, so that I can own state or let the component manage a working copy.
28. As a product engineer, I want create, update, delete, series-delete, and book-request callbacks with plain JSON payloads, so that persistence stays entirely app-owned.
29. As a product engineer, I want callbacks to optionally return promises, so that pending and error affordances render while my app saves.
30. As a product engineer, I want a typed slot record with a small required core and an open data bag, so that I can attach domain fields without forking the component.
31. As a product engineer, I want a taxonomy prop covering every visible string including announcements, so that the component speaks my product's booking vocabulary and localizes cleanly.
32. As a product engineer, I want render props for slot cards, day cards, day headers, toolbar, empty states, cap meter, tags, and the editor, so that I can customize any surface.
33. As a product engineer, I want each renderer context to expose the default renderer, so that I can decorate defaults instead of rebuilding them.
34. As a product engineer, I want a headless hook exposing planner state and action dispatchers, so that I can build fully custom layouts.
35. As a product engineer, I want an exported JSON-in/JSON-out constraints utility, so that I can validate slots in my own forms and services.
36. As a product engineer, I want recurring slots stored as wall-clock time plus IANA zone, so that recurring availability survives DST transitions predictably.
37. As a product engineer, I want DST-gap slot times detected and surfaced, so that impossible times are flagged instead of silently shifted.
38. As a product engineer, I want day and week views plus a controlled focused date, so that the planner embeds in pages, drawers, and mobile layouts.
39. As a product engineer, I want empty, loading, error, past-day, and pending states on the day panel and slot cards, so that async app flows render coherently.
40. As a design-system consumer, I want token-backed styling with dark mode, density, and RTL support, so that SlotPlanner matches the rest of the library.
41. As a design-system consumer, I want week-change transitions, a selection indicator that travels the day rail, and slot enter/exit animation, so that the planner feels responsive and spatial.
42. As a motion-sensitive user, I want all animation to collapse under reduced motion with no information carried by motion alone, so that the planner stays comfortable.
43. As a registry user, I want accurate registry metadata including the Motion dependency, so that installation copies working files with correct dependencies.
44. As a maintainer, I want SlotPlanner to reuse date-suite value conventions and Dialog behavior, so that foundations stay consistent across the library.
45. As a maintainer, I want the headless layer and constraints utility Motion-free, so that custom builds do not inherit the animation dependency.
46. As a docs reader, I want examples for mentoring sessions, clinic appointments, and facility reservations via taxonomy, so that adapting the vocabulary is obvious.
47. As an AI coding tool user, I want canonical JSON fixtures and realistic examples, so that generated booking UIs use the library's patterns.

## Implementation Decisions

- Build a SlotPlanner family: root, provider/headless hook, toolbar (title,
  week navigation, this-week, copy-week, view switch), day list and day cards,
  day panel (header, cap meter, slot list, add-slot affordance), slot card
  (time range, duration chip, recurrence chip, tags, buffer/timezone line,
  edit/delete/delete-series actions), slot editor dialog, live announcer, and
  a book-mode SlotPicker.
- The component is presentation and interaction only: no fetching, no
  persistence, no backend assumptions. All inputs and callback payloads are
  JSON-serializable (ISO 8601 date/time strings, IANA zone strings, plain
  objects). Internal date math uses `@internationalized/date`; those values
  never leak into the public contract.
- Slot records use a generic shape: required core (stable id, date or
  recurrence rule, start time, duration minutes, time zone, state) plus
  optional capacity, booked/requested counts, buffer fields, and an open
  `data` bag that the component treats as opaque. Default renderers
  understand a small set of conventional `data` keys (tags, note) and ignore
  unknown keys; buffers are first-class slot fields, not `data` keys.
- Stored slot state covers the definition lifecycle only: draft,
  requestable, blocked, cancelled. Time- and booking-dependent conditions
  (requested, booked, expired) are derived per occurrence at render time
  from booked/requested counts, capacity, and the clock, with a documented
  precedence; occurrence-level counts live on per-occurrence overrides and
  slot-level counts apply only to the slot's own date. Booked and locked
  occurrences render without destructive actions. An occurrence is removed
  from a series only via its override's cancelled flag; whole-series
  cancellation uses the slot-level state.
- Recurrence v1 is none, weekly, or biweekly, with per-occurrence overrides
  and a series end date. The JSON model must not preclude richer rules later.
- Constraints are an exported headless utility (JSON-in/JSON-out): daily and
  weekly caps on requestable slots, overlap detection including buffers,
  min/max duration and allowed increments, min notice, booking horizon, and
  blackout dates. Violations are structured (machine-readable code plus
  params), rendered to text through the taxonomy; the component surfaces
  them inline and enforcement authority stays with the app.
- Recurring slots are stored as wall-clock time plus IANA zone. DST-gap or
  ambiguous times are detected and surfaced rather than silently resolved.
  Book mode converts display times to a viewer timezone.
- Controlled (`slots`/change callback) and uncontrolled (`defaultSlots`)
  collections; controlled focused date and visible range; view switching
  between week and day projections of the same collection.
- Callbacks fire with plain JSON payloads for create, update, delete
  occurrence, delete series, and book request; they may return promises to
  drive per-slot pending and error affordances.
- Taxonomy is a typed prop mapping every visible noun/verb, including live
  announcements and empty states, with neutral slot-language defaults.
- Every meaningful surface accepts an optional render prop receiving typed
  context (raw slot JSON, resolved taxonomy, state flags, default action
  handlers) plus a way to invoke the default renderer. Renderer overrides
  cannot break structural accessibility invariants (day-rail semantics, live
  announcements, focus recovery), which live outside the render slots.
- A headless hook exposes visible range, focused day, per-day summaries,
  constraint results, and action dispatchers for fully custom layouts.
- Day rail uses a single-selection pattern with arrow-key navigation and
  today marked. Slot actions are real buttons; no drag-only interactions.
- Motion is built in: direction-aware week transitions (RTL-correct),
  shared-layout selection indicator on the day rail, slot enter/exit and
  layout settling, new-slot highlight, copy-week stagger, and animated cap
  meter. Transform/opacity only; all collapse under reduced motion; the
  headless layer and constraints utility stay Motion-free.
- Reuse Dialog for the slot editor and AlertDialog semantics for series
  deletion. Reuse provider tokens, density modes, dark mode, and RTL support.
- Ship a canonical JSON fixture module with the registry item so Storybook,
  playground smoke tests, and consumer demos share one dataset.

## Testing Decisions

- Test public behavior at the highest practical seam: JSON props in, rendered
  output and JSON callback payloads out. Do not assert internal parsing,
  reducer shapes, or private state.
- Unit tests cover the constraints utility (caps, overlap with buffers,
  duration rules, notice, horizon, blackout dates), recurrence expansion
  across DST transitions and month boundaries, wall-clock-plus-zone
  resolution, DST-gap detection, per-day summary derivation, and JSON
  round-trip integrity of callback payloads.
- Rendered tests cover week and day views, day selection, week navigation,
  slot CRUD flows through the editor, occurrence-versus-series deletion,
  locked booked slots, copy day/week, clear day, cap meter states, taxonomy
  overrides applied everywhere including announcements, custom renderers
  (override, decorate-via-default, unknown `data` keys reaching renderers),
  controlled and uncontrolled collections, promise-returning callbacks with
  pending and error affordances, and book-mode selection with viewer-timezone
  display and capacity states.
- Keyboard tests cover day-rail arrow navigation, Tab order through slot
  actions, editor focus containment and restoration, focus recovery after
  slot deletion, and RTL-safe directional expectations.
- Accessibility automation with axe covers manage and book modes across
  populated, empty, loading, error, and locked states; live-region tests
  cover create/update/delete, week change, and cap-reached announcements.
- Motion tests verify reduced-motion collapse and that no state is
  communicated by animation alone.
- SSR smoke tests cover week view and book mode without hydration mismatches.
- Storybook covers manage mode, book mode, taxonomy variants (mentoring,
  clinic, facility), custom renderer recipes, headless-hook recipe, dark
  mode, density, RTL, reduced motion, and constraint violation states.
- Registry smoke verifies dependency metadata (including Motion), copied
  source portability, CSS variables, and clean consumer imports.
- Prior art: date-suite calendar and time-value tests, Dialog focus tests,
  DataTable async/empty coverage, NavDock and NavigationMenu Motion tests,
  CommandPalette live-announcement and taxonomy-like contract tests.

## Out of Scope

- Backend integration, persistence, fetching, API clients, or server-side
  enforcement of constraints.
- External calendar sync (Google/Outlook/iCal), payments, notifications,
  reminders, and attendee management flows.
- Full RRULE support, monthly/custom recurrence, and timezone-spanning
  series editing beyond the weekly/biweekly model.
- Drag-to-paint time-grid editing (documented as a possible future
  direction, not committed).
- Multi-resource scheduling matrices (staff/rooms columns) — a potential
  later block, not core.
- Month heatmap overview and agenda/list views (deferred to a later PRD).
- The general-purpose Scheduler/EventCalendar component from the inventory.
- Virtualization for very large slot collections.

## Further Notes

Research inputs are documented in `docs/components/slot-planner/research.md`:

- Reference design: a weekly planner mock with a 7-day card rail, selected-day
  panel, daily-cap meter, slot cards with duration/recurrence chips, tags,
  buffer and timezone metadata, edit/delete/delete-series actions, add-slot
  affordance, week navigation, copy-week, and locked booked slots.
- Modern Web Guidance: bind recurring events to an IANA zone and resolve DST
  skipped/repeated hours explicitly; Temporal lacks Safari support, so use
  `@internationalized/date` (already a date-suite dependency); accessibility
  guidance on semantic HTML, buttons for actions, and polite live regions.
- External prior art: Calendly availability editor, Cal.com availability
  schedules, Google Calendar appointment schedules, Microsoft Bookings. The
  adopted common denominator is weekly template plus per-date exceptions,
  buffers, notice/horizon limits, daily caps, and locked booked slots.
