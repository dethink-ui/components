// Canonical sample data lives in ./slot-planner-fixtures and is deliberately
// not re-exported here: it is shared by tests, Storybook, and the registry
// item without becoming public package API.
export {
  defaultSlotPlannerTaxonomy,
  slotPlannerOccurrenceStatuses,
  slotPlannerSlotStates,
  slotPlannerViolationCodes,
  type SlotPlannerBatchChangePayload,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerConstraints,
  type SlotPlannerConventionalSlotData,
  type SlotPlannerCountTemplate,
  type SlotPlannerCreatePayload,
  type SlotPlannerDeleteOccurrencePayload,
  type SlotPlannerDeleteSeriesPayload,
  type SlotPlannerOccurrenceOverride,
  type SlotPlannerOccurrenceRef,
  type SlotPlannerOccurrenceStatus,
  type SlotPlannerRecurrence,
  type SlotPlannerRecurrenceFrequency,
  type SlotPlannerSlotData,
  type SlotPlannerSlotPayload,
  type SlotPlannerSlotState,
  type SlotPlannerTaxonomy,
  type SlotPlannerTaxonomyInput,
  type SlotPlannerUpdatePayload,
  type SlotPlannerViolation,
  type SlotPlannerViolationCode,
} from "./slot-planner-contract";
// The constraints engine is pure and React-free so apps can run the exact
// same checks on a server before persisting.
export {
  countSlotPlannerPublishedOccurrences,
  validateSlotPlannerSlot,
  validateSlotPlannerSlots,
  type SlotPlannerValidationContext,
} from "./slot-planner-constraints";
// The editor and delete dialogs are internal building blocks of SlotPlanner
// and deliberately not exported; the pure CRUD helpers are public so apps can
// mirror the uncontrolled mutation rules on their own state.
export {
  applySlotPlannerBatch,
  applySlotPlannerMutation,
  createSlotFromEditorValues,
  updateSlotFromEditorValues,
  upsertSlotPlannerOccurrenceOverride,
  type SlotPlannerEditorRecurrence,
  type SlotPlannerEditorResult,
  type SlotPlannerEditorSeriesValues,
  type SlotPlannerMutation,
} from "./slot-planner-crud";
// Render-prop contexts: one per surface, each with a `renderDefault()`
// escape hatch so consumers can decorate the shipped default.
export type {
  SlotPlannerCapMeterRenderContext,
  SlotPlannerDayCardRenderContext,
  SlotPlannerDayHeaderRenderContext,
  SlotPlannerEmptyDayRenderContext,
  SlotPlannerRenderers,
  SlotPlannerSlotCardRenderContext,
  SlotPlannerSlotEditorRenderContext,
  SlotPlannerTagRenderContext,
  SlotPlannerToolbarRenderContext,
} from "./slot-planner-renderers";
export { SlotPlanner, type SlotPlannerProps } from "./slot-planner";
// Book mode: the consumer-facing picker over the same slot collection model,
// projecting occurrences into the viewer's time zone.
export {
  SlotPicker,
  type SlotPickerProps,
  type SlotPickerRenderers,
  type SlotPickerSlotCardRenderContext,
} from "./slot-picker";
// The headless hook: all non-visual SlotPlanner state and dispatch, no JSX
// and no Motion, for fully custom layouts.
export {
  useSlotPlanner,
  type SlotPlannerDailyCapInfo,
  type SlotPlannerWeeklyCapInfo,
  type SlotPlannerView,
  type UseSlotPlannerActionOptions,
  type UseSlotPlannerOptions,
  type UseSlotPlannerReturn,
} from "./use-slot-planner";
export {
  deriveOccurrenceStatus,
  expandSlotOccurrences,
  expandSlotsForRange,
  expandSlotsForViewerZone,
  formatSlotPlannerCountTemplate,
  formatSlotPlannerTemplate,
  getSlotPlannerIsoDateInZone,
  getSlotPlannerWeekDays,
  projectSlotPlannerOccurrenceToZone,
  resolveSlotPlannerTaxonomy,
  summarizeSlotPlannerDay,
  type SlotPickerOccurrence,
  type SlotPickerOccurrencesByDate,
  type SlotPlannerOccurrence,
  type SlotPlannerOccurrencesByDate,
} from "./slot-planner-utils";
