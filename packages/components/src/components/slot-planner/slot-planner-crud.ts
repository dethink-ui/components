import type {
  SlotPlannerBatchChangePayload,
  SlotPlannerOccurrenceOverride,
  SlotPlannerRecurrenceFrequency,
  SlotPlannerSlotData,
  SlotPlannerSlotPayload,
} from "./slot-planner-contract";

/**
 * Internal mutation applied to an uncontrolled slot collection after the
 * matching callback succeeds. Mirrors the callback payloads: create appends,
 * update replaces by id, delete-occurrence cancels one occurrence of a
 * recurring slot (or removes a single slot entirely), delete-series removes
 * the slot.
 */
export type SlotPlannerMutation<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
> =
  | { type: "create"; slot: SlotPlannerSlotData<TData> }
  | { type: "update"; slot: SlotPlannerSlotData<TData> }
  | { type: "delete-occurrence"; slotId: string; occurrenceDate: string }
  | { type: "delete-series"; slotId: string };

/** Editor recurrence choice; `"none"` maps to an omitted `recurrence`. */
export type SlotPlannerEditorRecurrence =
  | "none"
  | SlotPlannerRecurrenceFrequency;

/**
 * Normalized values submitted by the slot editor when creating a slot or
 * editing an entire series. Empty strings and empty arrays mean "unset" and
 * are omitted from the built slot.
 */
export type SlotPlannerEditorSeriesValues = {
  startTime: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  timeZone: string;
  tags: string[];
  note: string;
  recurrence: SlotPlannerEditorRecurrence;
  /** ISO date (`YYYY-MM-DD`); ignored when `recurrence` is `"none"`. */
  recurrenceUntil: string;
};

/**
 * Result of a successful editor submit; the scope decides payload shape.
 * Series results carry the full editor values; occurrence results carry only
 * the per-occurrence override fields.
 */
export type SlotPlannerEditorResult =
  | { scope: "series"; values: SlotPlannerEditorSeriesValues }
  | { scope: "occurrence"; startTime: string; durationMinutes: number };

/**
 * Returns a copy of `slot` with `override` merged over any existing override
 * for the same occurrence date, or appended when none exists. Never mutates
 * its inputs. Slots without recurrence are returned unchanged — single slots
 * have no per-occurrence overrides.
 */
export function upsertSlotPlannerOccurrenceOverride<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slot: SlotPlannerSlotData<TData>,
  override: SlotPlannerOccurrenceOverride,
): SlotPlannerSlotData<TData> {
  const recurrence = slot.recurrence;

  if (!recurrence) {
    return slot;
  }

  const overrides = recurrence.overrides ?? [];
  const existingIndex = overrides.findIndex(
    (candidate) => candidate.occurrenceDate === override.occurrenceDate,
  );
  const nextOverrides =
    existingIndex === -1
      ? [...overrides, override]
      : overrides.map((candidate, index) =>
          index === existingIndex ? { ...candidate, ...override } : candidate,
        );

  return { ...slot, recurrence: { ...recurrence, overrides: nextOverrides } };
}

/**
 * Applies one mutation to a slot collection, returning a new array without
 * mutating the input. Deleting an occurrence of a recurring slot upserts a
 * `cancelled: true` override; deleting a single slot's occurrence removes
 * the slot.
 */
export function applySlotPlannerMutation<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slots: SlotPlannerSlotData<TData>[],
  mutation: SlotPlannerMutation<TData>,
): SlotPlannerSlotData<TData>[] {
  switch (mutation.type) {
    case "create":
      return [...slots, mutation.slot];
    case "update":
      return slots.map((slot) =>
        slot.id === mutation.slot.id ? mutation.slot : slot,
      );
    case "delete-occurrence":
      return slots.flatMap((slot) => {
        if (slot.id !== mutation.slotId) {
          return [slot];
        }

        if (!slot.recurrence) {
          return [];
        }

        return [
          upsertSlotPlannerOccurrenceOverride(slot, {
            occurrenceDate: mutation.occurrenceDate,
            cancelled: true,
          }),
        ];
      });
    case "delete-series":
      return slots.filter((slot) => slot.id !== mutation.slotId);
  }
}

/**
 * Applies one batch payload to a slot collection, returning a new array
 * without mutating the input: `updatedSlots` replace by id, `deletedSlotIds`
 * are removed, and `createdSlots` are appended. Rejected slots (the
 * `violations` map) never touch the collection.
 */
export function applySlotPlannerBatch<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  slots: SlotPlannerSlotData<TData>[],
  batch: Pick<
    SlotPlannerBatchChangePayload<TData>,
    "createdSlots" | "deletedSlotIds" | "updatedSlots"
  >,
): SlotPlannerSlotData<TData>[] {
  const updatedById = new Map(
    (batch.updatedSlots ?? []).map((slot) => [slot.id, slot]),
  );
  const deletedIds = new Set(batch.deletedSlotIds);

  return [
    ...slots
      .filter((slot) => !deletedIds.has(slot.id))
      .map((slot) => updatedById.get(slot.id) ?? slot),
    ...batch.createdSlots,
  ];
}

function buildEditorRecurrence(values: SlotPlannerEditorSeriesValues) {
  if (values.recurrence === "none") {
    return undefined;
  }

  return {
    frequency: values.recurrence,
    ...(values.recurrenceUntil ? { until: values.recurrenceUntil } : {}),
  };
}

function buildEditorData<TData extends SlotPlannerSlotPayload>(
  values: SlotPlannerEditorSeriesValues,
  previousData?: TData,
): TData | undefined {
  const data: Record<string, unknown> = { ...previousData };

  if (values.tags.length > 0) {
    data.tags = values.tags;
  } else {
    delete data.tags;
  }

  if (values.note.trim() !== "") {
    data.note = values.note;
  } else {
    delete data.note;
  }

  // The editor only writes the conventional keys, so the cast is sound for
  // any payload type that follows the conventional-data contract.
  return Object.keys(data).length > 0 ? (data as TData) : undefined;
}

/**
 * Builds the slot for a `SlotPlannerCreatePayload` from editor values. Keys
 * the user left empty (buffers, recurrence, tags, note) are omitted so the
 * payload stays minimal.
 */
export function createSlotFromEditorValues<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  values: SlotPlannerEditorSeriesValues,
  target: { id: string; date: string },
): SlotPlannerSlotData<TData> {
  const recurrence = buildEditorRecurrence(values);
  const data = buildEditorData<TData>(values);

  return {
    id: target.id,
    date: target.date,
    startTime: values.startTime,
    durationMinutes: values.durationMinutes,
    timeZone: values.timeZone,
    state: "requestable",
    ...(recurrence ? { recurrence } : {}),
    ...(values.bufferBeforeMinutes > 0
      ? { bufferBeforeMinutes: values.bufferBeforeMinutes }
      : {}),
    ...(values.bufferAfterMinutes > 0
      ? { bufferAfterMinutes: values.bufferAfterMinutes }
      : {}),
    ...(data ? { data } : {}),
  };
}

/**
 * Builds the updated slot for a series-scope edit. Unknown `data` keys and
 * existing per-occurrence overrides are preserved; cleared buffers, tags,
 * and note drop their keys; switching recurrence to `"none"` removes the
 * series definition (and its overrides). Never mutates `previous`.
 */
export function updateSlotFromEditorValues<
  TData extends SlotPlannerSlotPayload = SlotPlannerSlotPayload,
>(
  previous: SlotPlannerSlotData<TData>,
  values: SlotPlannerEditorSeriesValues,
): SlotPlannerSlotData<TData> {
  const next: SlotPlannerSlotData<TData> = {
    ...previous,
    startTime: values.startTime,
    durationMinutes: values.durationMinutes,
    timeZone: values.timeZone,
  };
  const recurrence = buildEditorRecurrence(values);
  const previousOverrides = previous.recurrence?.overrides;

  if (recurrence) {
    next.recurrence = {
      ...recurrence,
      ...(previousOverrides ? { overrides: previousOverrides } : {}),
    };
  } else {
    delete next.recurrence;
  }

  if (values.bufferBeforeMinutes > 0) {
    next.bufferBeforeMinutes = values.bufferBeforeMinutes;
  } else {
    delete next.bufferBeforeMinutes;
  }

  if (values.bufferAfterMinutes > 0) {
    next.bufferAfterMinutes = values.bufferAfterMinutes;
  } else {
    delete next.bufferAfterMinutes;
  }

  const data = buildEditorData(values, previous.data);

  if (data) {
    next.data = data;
  } else {
    delete next.data;
  }

  return next;
}
