import type { ReactNode } from "react";
import type {
  SlotPlannerOccurrenceStatus,
  SlotPlannerSlotPayload,
  SlotPlannerTaxonomy,
  SlotPlannerViolation,
} from "./slot-planner-contract";
import type { SlotPlannerView } from "./use-slot-planner";
import type {
  SlotPlannerEditorResult,
  SlotPlannerEditorSeriesValues,
} from "./slot-planner-crud";
import type { SlotPlannerOccurrence } from "./slot-planner-utils";

/**
 * SlotPlanner render-prop contexts.
 *
 * Every context is serializable except for its functions: the data fields
 * are the same plain JSON shapes the public contract uses, and each context
 * carries the resolved taxonomy plus a `renderDefault()` escape hatch that
 * returns the shipped default for the surface — so a renderer can decorate
 * (wrap or augment) the default instead of rebuilding it.
 *
 * Structural invariants stay outside the render slots: the component keeps
 * ownership of the day-rail tablist/tab/tabpanel semantics (roving tabindex,
 * arrow keys), the slot-card `<li>` wrapper and its data attributes, the
 * polite live region, dialog focus containment and labelling, and
 * post-delete focus recovery. Renderers fill the content inside those
 * structural elements.
 */

/**
 * Context of one slot card. The renderer output becomes the children of the
 * structural `<li data-slot="slot-planner-slot-card">` wrapper; the wrapper
 * keeps its `data-status` / `data-locked` / `data-pending` / `data-error`
 * attributes. `occurrence.slot.data` is the raw payload bag with unknown
 * keys untouched.
 */
export type SlotPlannerSlotCardRenderContext<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  /** Renders the shipped default card content for decoration. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** The fully resolved occurrence, including the raw slot definition. */
  occurrence: SlotPlannerOccurrence<TData>;
  /** Locked occurrences expose no edit/remove dispatchers. */
  locked: boolean;
  /** True while this occurrence's mutation callback promise is pending. */
  pending: boolean;
  /** True while the last mutation for this occurrence failed. */
  error: boolean;
  /** Re-fires the failed mutation's identical payload. Present on error. */
  retry?: () => void;
  /** Opens the structural editor dialog. Absent on locked occurrences. */
  edit?: () => void;
  /** Opens the structural delete confirm. Absent on locked occurrences. */
  remove?: () => void;
};

/**
 * Context of one day-rail card. The renderer output becomes the children of
 * the structural `role="tab"` button; selection, roving tabindex, and
 * arrow-key navigation stay with the component.
 */
export type SlotPlannerDayCardRenderContext<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  /** Renders the shipped default tab content (weekday, date, summaries). */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** ISO date (`YYYY-MM-DD`) of this day. */
  date: string;
  /** Whether this day is the focused (selected) day. */
  selected: boolean;
  isToday: boolean;
  isPast: boolean;
  /** Occurrence counts per derived status for this day. */
  summary: Record<SlotPlannerOccurrenceStatus, number>;
  /** This day's occurrences, sorted by wall-clock start. */
  occurrences: SlotPlannerOccurrence<TData>[];
};

/**
 * Context of the day-panel heading area. The renderer replaces the default
 * `<h3>` region; the panel's accessible name comes from the selected tab,
 * so a custom heading cannot break the tabpanel labelling.
 */
export type SlotPlannerDayHeaderRenderContext<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  /** Renders the shipped default heading. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** ISO date (`YYYY-MM-DD`) of the focused day. */
  date: string;
  /** The default long-format label, e.g. "Monday, July 6, 2026". */
  formattedDate: string;
  isToday: boolean;
  isPast: boolean;
  /** The focused day's occurrences, sorted by wall-clock start. */
  occurrences: SlotPlannerOccurrence<TData>[];
};

/**
 * Context of the toolbar region (week view only). The renderer output
 * becomes the children of the structural toolbar wrapper. Besides the week
 * navigation the context exposes the day-level batch dispatchers, which
 * open the same structural confirm dialogs as the default day-action row,
 * so a custom toolbar can host copy/clear controls.
 */
export type SlotPlannerToolbarRenderContext = {
  /** Renders the shipped default title and week-navigation controls. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** The `title` prop, untouched. */
  title?: ReactNode;
  /** Local ISO date (`YYYY-MM-DD`) derived from `now`. */
  todayIso: string;
  /** ISO date of the focused day. */
  focusedDate: string;
  /** The focused week's 7 ISO dates, Monday first. */
  weekDays: string[];
  /** Current projection of the same slot collection. */
  view: SlotPlannerView;
  setView: (view: SlotPlannerView) => void;
  setFocusedDate: (dateIso: string) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToThisWeek: () => void;
  /** Opens the structural copy-day target dialog for the focused day. */
  copyDay: () => void;
  /** Opens the structural copy-week confirm dialog. */
  copyWeek: () => void;
  /** Opens the structural clear-day confirm dialog for the focused day. */
  clearDay: () => void;
};

/**
 * Context of the empty-day message, rendered when the focused day has no
 * occurrences. The renderer replaces the default paragraph; the structural
 * add-slot affordance stays outside this slot.
 */
export type SlotPlannerEmptyDayRenderContext = {
  /** Renders the shipped default empty-day message. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** ISO date (`YYYY-MM-DD`) of the focused day. */
  date: string;
  isPast: boolean;
};

/**
 * Context of the daily cap meter, rendered only when
 * `constraints.dailyRequestableCap` is set. The renderer replaces the
 * default meter region. Cap-reached must stay communicated in text, never
 * by color alone.
 */
export type SlotPlannerCapMeterRenderContext = {
  /** Renders the shipped default cap meter. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** ISO date (`YYYY-MM-DD`) of the focused day. */
  date: string;
  /** Published (requestable/requested/booked) occurrences for the primary cap. */
  used: number;
  cap: number;
  reached: boolean;
  /** The formatted primary cap text, e.g. "Daily cap: 2 / 3 …". */
  text: string;
  /** The formatted primary cap-reached violation message; set only when reached. */
  reachedMessage?: string;
  /** Focused-day cap info, present when `dailyRequestableCap` is configured. */
  daily?: {
    used: number;
    cap: number;
    reached: boolean;
    text: string;
    reachedMessage?: string;
  };
  /** Focused-week cap info, present when `weeklyRequestableCap` is configured. */
  weekly?: {
    used: number;
    cap: number;
    reached: boolean;
    text: string;
    reachedMessage?: string;
  };
};

/**
 * Context of one tag chip on the default slot card. The renderer replaces
 * the default chip for each conventional `data.tags` entry; it is invoked by
 * the default card content, including via a custom slot card's
 * `renderDefault()`.
 */
export type SlotPlannerTagRenderContext<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> = {
  /** Renders the shipped default chip. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  /** The tag string from the occurrence's conventional `data.tags`. */
  tag: string;
  /** The occurrence the chip belongs to. */
  occurrence: SlotPlannerOccurrence<TData>;
};

/**
 * Context of the slot editor dialog content. The Dialog shell, its
 * labelling (title), and focus containment stay structural; the renderer
 * replaces the form area inside the dialog. Custom content owns its own
 * field state and submits a `SlotPlannerEditorResult` through `submit`,
 * which runs the same validate → callback → apply → announce pipeline as
 * the default form (violations returned by a blocked submit re-render
 * through this context on the next open state).
 */
export type SlotPlannerSlotEditorRenderContext = {
  /** Renders the shipped default editor form. */
  renderDefault: () => ReactNode;
  taxonomy: SlotPlannerTaxonomy;
  mode: "create" | "edit";
  /** Fixed ISO date: the focused day (create) or the occurrence (edit). */
  date: string;
  /** Whether the edited slot recurs; enables occurrence/series scope. */
  isRecurring: boolean;
  /** Series-level initial values (create defaults or the slot definition). */
  seriesValues: SlotPlannerEditorSeriesValues;
  /** Override-resolved values of the edited occurrence. */
  occurrenceValues: { startTime: string; durationMinutes: number };
  /** Violations from the last blocked submit; empty otherwise. */
  violations: SlotPlannerViolation[];
  /** Validates and dispatches the result; keeps the dialog open on block. */
  submit: (result: SlotPlannerEditorResult) => void;
  /** Closes the dialog without saving. */
  dismiss: () => void;
};

/**
 * Optional render props, one per SlotPlanner surface. Omitted surfaces keep
 * their shipped defaults; every context exposes `renderDefault()` so a
 * renderer can decorate the default instead of rebuilding it.
 */
export interface SlotPlannerRenderers<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> {
  slotCard?: (context: SlotPlannerSlotCardRenderContext<TData>) => ReactNode;
  dayCard?: (context: SlotPlannerDayCardRenderContext<TData>) => ReactNode;
  dayHeader?: (context: SlotPlannerDayHeaderRenderContext<TData>) => ReactNode;
  toolbar?: (context: SlotPlannerToolbarRenderContext) => ReactNode;
  emptyDay?: (context: SlotPlannerEmptyDayRenderContext) => ReactNode;
  capMeter?: (context: SlotPlannerCapMeterRenderContext) => ReactNode;
  tag?: (context: SlotPlannerTagRenderContext<TData>) => ReactNode;
  slotEditor?: (context: SlotPlannerSlotEditorRenderContext) => ReactNode;
}
