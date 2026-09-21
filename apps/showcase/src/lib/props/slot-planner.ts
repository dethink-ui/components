import type { PropRow } from "@/components/props-table";

export const slotPlannerProps: PropRow[] = [
  {
    prop: "weekLayout",
    type: '"calendar" | "agenda"',
    defaultValue: '"calendar"',
    description:
      "Calendar shows a time grid from 620px container width and a daily agenda below it. Agenda retains the original weekday rail. Custom renderers automatically use the agenda to preserve their structural contract.",
  },
  {
    prop: "slots / defaultSlots",
    type: "SlotPlannerSlotData[]",
    defaultValue: "uncontrolled",
    description:
      "Controlled or uncontrolled slot collection. Recurring slots repeat weekly or biweekly with per-occurrence overrides.",
  },
  {
    prop: "focusedDate / defaultFocusedDate / onFocusedDateChange",
    type: "string / string / (dateIso) => void",
    defaultValue: "uncontrolled / today / undefined",
    description:
      "Controls the focused ISO date (`YYYY-MM-DD`) driving the visible week and selected day.",
  },
  {
    prop: "view / defaultView / onViewChange",
    type: '"week" | "day" / "week" | "day" / (view) => void',
    defaultValue: 'uncontrolled / "week" / undefined',
    description:
      "Controls the visible projection. Day view hides the rail while keeping toolbar navigation and the view switcher.",
  },
  {
    prop: "timeZone",
    type: "string",
    defaultValue: "environment zone",
    description:
      "IANA zone used for the weekly calendar, planner today, and new slots. Pass explicitly for deterministic renders and SSR. Existing slot edits retain their original zone.",
  },
  {
    prop: "constraints",
    type: "SlotPlannerConstraints",
    defaultValue: "undefined",
    description:
      "Declarative rules — daily/weekly caps, duration bounds, notice period, booking horizon, blackout dates, working days — validated on editor saves and batch operations, and surfaced by the cap meter.",
  },
  {
    prop: "taxonomy",
    type: "SlotPlannerTaxonomyInput",
    defaultValue: "neutral slot language",
    description:
      'Overrides any subset of the noun, verb, and announcement vocabulary, e.g. renaming "slot" to "session" or "appointment".',
  },
  {
    prop: "onCreateSlot / onUpdateSlot",
    type: "(payload) => void | Promise<void>",
    defaultValue: "undefined",
    description:
      "Mutation callbacks fired from the editor dialog. A returned promise drives per-key pending/error/retry affordances.",
  },
  {
    prop: "onDeleteOccurrence / onDeleteSeries",
    type: "(payload) => void | Promise<void>",
    defaultValue: "undefined",
    description:
      "Fired for single-occurrence and whole-series deletion, after the structural delete confirm dialog.",
  },
  {
    prop: "onBatchChange",
    type: "(payload: SlotPlannerBatchChangePayload) => void | Promise<void>",
    defaultValue: "undefined",
    description:
      "Fired for copy-day, copy-week, and clear-day operations with created/deleted/updated slots and per-slot violations.",
  },
  {
    prop: "now / locale",
    type: "string / string",
    defaultValue: "current time / environment locale",
    description:
      'Injectable "now" instant and locale for deterministic renders, including SSR.',
  },
  {
    prop: "loading / error",
    type: "boolean / ReactNode",
    defaultValue: "false / undefined",
    description:
      "External async states for app-owned fetching. The day panel shows status text and hides mutation affordances while active.",
  },
  {
    prop: "title",
    type: "ReactNode",
    defaultValue: "undefined",
    description: "Heading rendered above the toolbar.",
  },
  {
    prop: "reducedMotion",
    type: "boolean",
    defaultValue: "prefers-reduced-motion",
    description:
      "Forces the reduced-motion rendering path; every animation collapses to an instant state change either way.",
  },
  {
    prop: "renderers",
    type: "SlotPlannerRenderers",
    defaultValue: "undefined",
    description:
      "Render props for the toolbar, day card, day header, cap meter, empty day, and slot card, each with a renderDefault() escape hatch for decoration.",
  },
];

export const slotPickerProps: PropRow[] = [
  {
    prop: "slots",
    type: "SlotPlannerSlotData[]",
    defaultValue: "required",
    description:
      "Read-only slot collection to browse. SlotPicker never mutates it — a request only fires onBookRequest.",
  },
  {
    prop: "viewerTimeZone",
    type: "string",
    defaultValue: "environment zone",
    description:
      "IANA zone the occurrences are projected into for display and day grouping. Pass explicitly for deterministic renders and SSR.",
  },
  {
    prop: "onBookRequest",
    type: "(payload: SlotPlannerBookRequestPayload) => void | Promise<void>",
    defaultValue: "undefined",
    description:
      "Fires when the viewer requests an available occurrence. occurrenceDate stays the provider-zone date; a returned promise drives pending/error/retry.",
  },
  {
    prop: "taxonomy",
    type: "SlotPlannerTaxonomyInput",
    defaultValue: "neutral slot language",
    description:
      "Same vocabulary override as SlotPlanner, phrased for book mode.",
  },
  {
    prop: "view / defaultView / onViewChange",
    type: '"week" | "day" / "week" | "day" / (view) => void',
    defaultValue: 'uncontrolled / "week" / undefined',
    description:
      "Controls the visible projection. Day view hides the rail while keeping toolbar navigation and the view switcher.",
  },
  {
    prop: "focusedDate / defaultFocusedDate / onFocusedDateChange",
    type: "string / string / (dateIso) => void",
    defaultValue: "uncontrolled / viewer-zone today / undefined",
    description:
      "Controls the focused viewer-zone ISO date driving the visible week and selected day.",
  },
  {
    prop: "now / locale",
    type: "string / string",
    defaultValue: "current time / environment locale",
    description:
      'Injectable "now" instant and locale for deterministic renders.',
  },
  {
    prop: "loading / error",
    type: "boolean / ReactNode",
    defaultValue: "false / undefined",
    description:
      "External async states for app-owned fetching. The day panel shows status text and hides the slot list while active.",
  },
  {
    prop: "title",
    type: "ReactNode",
    defaultValue: "undefined",
    description: "Heading rendered above the toolbar.",
  },
  {
    prop: "reducedMotion",
    type: "boolean",
    defaultValue: "prefers-reduced-motion",
    description: "Forces the reduced-motion rendering path.",
  },
  {
    prop: "renderers",
    type: "SlotPickerRenderers",
    defaultValue: "undefined",
    description:
      "Render props for the slot card and empty day, each with a renderDefault() escape hatch for decoration.",
  },
];
