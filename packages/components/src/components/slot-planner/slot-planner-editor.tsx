import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { parseDateTime, toZoned } from "@internationalized/date";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "../form-field";
import { Input } from "../input";
import { NumberInput } from "../number-input";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Select, SelectItem, type SelectItemData } from "../select";
import { TagInput } from "../tag-input";
import { Textarea } from "../textarea";
import type {
  SlotPlannerTaxonomy,
  SlotPlannerViolation,
  SlotPlannerConstraints,
} from "./slot-planner-contract";
import type {
  SlotPlannerEditorRecurrence,
  SlotPlannerEditorResult,
  SlotPlannerEditorSeriesValues,
} from "./slot-planner-crud";
import type { SlotPlannerSlotEditorRenderContext } from "./slot-planner-renderers";
import {
  formatSlotPlannerTemplate,
  formatSlotPlannerCountTemplate,
} from "./slot-planner-utils";

type SlotPlannerEditorScope = SlotPlannerEditorResult["scope"];

const editorFormClasses = "grid gap-[var(--dt-space-2)]";

const editorFieldsClasses =
  "grid gap-[var(--dt-space-4)] px-[var(--dt-space-6)]";

const editorFieldRowClasses = "grid gap-[var(--dt-space-4)] sm:grid-cols-2";

const editorRadioOptionClasses = "flex items-center gap-[var(--dt-space-2)]";

const editorRadioLabelClasses = "text-sm leading-none text-foreground";

const editorViolationsClasses =
  "mx-[var(--dt-space-6)] flex flex-col gap-[var(--dt-space-1)] rounded-md border border-destructive/40 bg-destructive/10 p-[var(--dt-space-3)] text-sm text-destructive";

/**
 * Renders structured violations as taxonomy-phrased text inside a dialog.
 * `role="alert"` so assistive tech announces a blocked save immediately;
 * text-only communication, never color alone.
 */
export function SlotPlannerViolationList({
  taxonomy,
  violations,
}: {
  taxonomy: SlotPlannerTaxonomy;
  violations: SlotPlannerViolation[];
}) {
  return (
    <div
      role="alert"
      data-slot="slot-planner-violations"
      className={editorViolationsClasses}
    >
      <p className="font-medium">{taxonomy.violationsHeading}</p>
      <ul
        data-slot="slot-planner-violation-list"
        className="m-[var(--dt-space-0)] flex list-none flex-col gap-[var(--dt-space-1)] p-[var(--dt-space-0)]"
      >
        {violations.map((violation, index) => (
          <li
            key={`${violation.code}-${index}`}
            data-violation={violation.code}
          >
            {formatSlotPlannerTemplate(
              taxonomy.violationMessages[violation.code],
              {
                slot: taxonomy.slot,
                slotPlural: taxonomy.slotPlural,
                ...violation.params,
              },
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Cached because Intl.supportedValuesOf builds a fresh ~400-entry array per
// call; null means the platform lacks the API and a free-text zone input is
// rendered instead.
let cachedTimeZoneOptions: string[] | null | undefined;

function getTimeZoneOptions(): string[] | null {
  if (cachedTimeZoneOptions === undefined) {
    cachedTimeZoneOptions =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : null;
  }

  return cachedTimeZoneOptions;
}

function parseMinutes(text: string, fallback: number, minimum: number) {
  const parsed = Number.parseInt(text, 10);

  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
}

export interface SlotPlannerEditorDialogProps {
  mode: "create" | "edit";
  /** Fixed ISO date: the focused day (create) or the occurrence (edit). */
  date: string;
  /** Whether the edited slot recurs; enables the scope choice. */
  isRecurring: boolean;
  /** Series-level initial values (create defaults or the slot definition). */
  seriesValues: SlotPlannerEditorSeriesValues;
  /** Override-resolved values of the edited occurrence. */
  occurrenceValues: { startTime: string; durationMinutes: number };
  taxonomy: SlotPlannerTaxonomy;
  /** Violations from the last blocked submit; saving again revalidates. */
  violations?: SlotPlannerViolation[];
  onDismiss: () => void;
  onSubmit: (result: SlotPlannerEditorResult) => void;
  /**
   * Custom editor content (the `slotEditor` render prop). Replaces the form
   * area only; the Dialog shell, its title, and focus containment stay
   * structural.
   */
  renderContent?: (context: SlotPlannerSlotEditorRenderContext) => ReactNode;
  constraints?: SlotPlannerConstraints;
}

export function SlotPlannerEditorDialog({
  mode,
  date,
  isRecurring,
  seriesValues,
  occurrenceValues,
  taxonomy,
  violations,
  onDismiss,
  onSubmit,
  renderContent,
  constraints,
}: SlotPlannerEditorDialogProps) {
  const baseId = useId();
  const advancedRef = useRef<HTMLDetailsElement>(null);
  const asksScope = mode === "edit" && isRecurring;
  const [scope, setScope] = useState<SlotPlannerEditorScope>(
    asksScope ? "occurrence" : "series",
  );
  const scopedInitial = asksScope ? occurrenceValues : seriesValues;
  const [startTime, setStartTime] = useState(scopedInitial.startTime);
  const [durationText, setDurationText] = useState(
    String(scopedInitial.durationMinutes),
  );
  const [capacityText, setCapacityText] = useState(
    String(seriesValues.capacity),
  );
  const [bufferBeforeText, setBufferBeforeText] = useState(
    String(seriesValues.bufferBeforeMinutes),
  );
  const [bufferAfterText, setBufferAfterText] = useState(
    String(seriesValues.bufferAfterMinutes),
  );
  const [timeZone, setTimeZone] = useState(seriesValues.timeZone);
  const [tags, setTags] = useState(seriesValues.tags);
  const [note, setNote] = useState(seriesValues.note);
  const [recurrence, setRecurrence] = useState(seriesValues.recurrence);
  const [recurrenceUntil, setRecurrenceUntil] = useState(
    seriesValues.recurrenceUntil,
  );
  const timeZoneItems = useMemo<SelectItemData[] | null>(() => {
    const options = getTimeZoneOptions();

    if (!options) {
      return null;
    }

    const withCurrent = options.includes(timeZone)
      ? options
      : [timeZone, ...options];

    return withCurrent.map((zone) => ({
      label: zone,
      textValue: zone,
      value: zone,
    }));
  }, [timeZone]);

  // Per-scope drafts of the two shared fields (start time and duration) so
  // toggling occurrence → series → occurrence restores what the user typed
  // instead of resetting to the untouched base values.
  const scopeDraftsRef = useRef<
    Record<SlotPlannerEditorScope, { startTime: string; durationText: string }>
  >({
    occurrence: {
      durationText: String(occurrenceValues.durationMinutes),
      startTime: occurrenceValues.startTime,
    },
    series: {
      durationText: String(seriesValues.durationMinutes),
      startTime: seriesValues.startTime,
    },
  });

  const handleScopeChange = (value: string) => {
    const nextScope: SlotPlannerEditorScope =
      value === "series" ? "series" : "occurrence";

    if (nextScope === scope) {
      return;
    }

    // Stash the current scope's in-progress edits before restoring the
    // target scope's stashed draft.
    scopeDraftsRef.current[scope] = { durationText, startTime };

    const restored = scopeDraftsRef.current[nextScope];

    setScope(nextScope);
    setStartTime(restored.startTime);
    setDurationText(restored.durationText);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Cleared or out-of-range numeric fields (duration, capacity, buffers)
    // must not silently coerce to fallback values; the native `required`/`min`
    // constraints surface the problem and block the save instead.
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      if (advancedRef.current) advancedRef.current.open = true;
      form.reportValidity();

      return;
    }

    if (scope === "occurrence") {
      onSubmit({
        scope: "occurrence",
        startTime,
        durationMinutes: parseMinutes(
          durationText,
          occurrenceValues.durationMinutes,
          1,
        ),
      });

      return;
    }

    onSubmit({
      scope: "series",
      values: {
        startTime,
        durationMinutes: parseMinutes(
          durationText,
          seriesValues.durationMinutes,
          1,
        ),
        capacity: parseMinutes(capacityText, seriesValues.capacity, 1),
        bufferBeforeMinutes: parseMinutes(bufferBeforeText, 0, 0),
        bufferAfterMinutes: parseMinutes(bufferAfterText, 0, 0),
        timeZone,
        tags,
        note,
        recurrence,
        recurrenceUntil,
      },
    });
  };

  const title = formatSlotPlannerTemplate(
    mode === "create" ? taxonomy.editorCreateTitle : taxonomy.editorEditTitle,
    { slot: taxonomy.slot },
  );
  const recurrenceOptions: Array<{
    label: string;
    value: SlotPlannerEditorRecurrence;
  }> = [
    { label: taxonomy.recurrenceNone, value: "none" },
    { label: taxonomy.recurringWeekly, value: "weekly" },
    { label: taxonomy.recurringBiweekly, value: "biweekly" },
  ];
  let endTime = "";
  try {
    if (startTime && Number(durationText) > 0) {
      const end = toZoned(parseDateTime(`${date}T${startTime}`), timeZone).add({
        minutes: Number(durationText),
      });
      endTime = `${String(end.hour).padStart(2, "0")}:${String(end.minute).padStart(2, "0")}${end.toString().slice(0, 10) !== date ? ` (${end.toString().slice(0, 10)})` : ""}`;
    }
  } catch {
    /* The constraint engine reports invalid wall-clock values on submit. */
  }

  const defaultContent = (
    <form
      data-slot="slot-planner-editor-form"
      className={editorFormClasses}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className={editorFieldsClasses}>
        {asksScope ? (
          <FieldSet data-slot="slot-planner-edit-scope">
            <FieldLegend>{taxonomy.editScopeLegend}</FieldLegend>
            <RadioGroup
              aria-label={taxonomy.editScopeLegend}
              value={scope}
              onValueChange={handleScopeChange}
            >
              <div className={editorRadioOptionClasses}>
                <RadioGroupItem
                  id={`${baseId}-scope-occurrence`}
                  value="occurrence"
                />
                <label
                  htmlFor={`${baseId}-scope-occurrence`}
                  className={editorRadioLabelClasses}
                >
                  {taxonomy.editScopeOccurrence}
                </label>
              </div>
              <div className={editorRadioOptionClasses}>
                <RadioGroupItem id={`${baseId}-scope-series`} value="series" />
                <label
                  htmlFor={`${baseId}-scope-series`}
                  className={editorRadioLabelClasses}
                >
                  {taxonomy.editScopeSeries}
                </label>
              </div>
            </RadioGroup>
          </FieldSet>
        ) : null}
        <Field>
          <FieldLabel>{taxonomy.fieldDate}</FieldLabel>
          <FieldControl asChild>
            <Input readOnly value={date} />
          </FieldControl>
        </Field>
        <div className={editorFieldRowClasses}>
          <Field>
            <FieldLabel>{taxonomy.fieldStartTime}</FieldLabel>
            <FieldControl asChild>
              <Input
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </FieldControl>
          </Field>
          <Field>
            <FieldLabel>{taxonomy.fieldDurationMinutes}</FieldLabel>
            <FieldControl asChild>
              <NumberInput
                type="number"
                numberMode="numeric"
                min={1}
                required
                value={durationText}
                onChange={(event) => setDurationText(event.target.value)}
              />
            </FieldControl>
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {[30, 45, 60].map((minutes) => (
            <Button
              key={minutes}
              type="button"
              size="sm"
              variant={Number(durationText) === minutes ? "soft" : "outline"}
              aria-pressed={Number(durationText) === minutes}
              disabled={
                minutes < (constraints?.minDurationMinutes ?? 1) ||
                minutes > (constraints?.maxDurationMinutes ?? Infinity) ||
                minutes % (constraints?.durationIncrementMinutes ?? 1) !== 0
              }
              onClick={() => setDurationText(String(minutes))}
            >
              {formatSlotPlannerCountTemplate(
                taxonomy.durationSummary,
                minutes,
              )}
            </Button>
          ))}
        </div>
        {endTime ? (
          <p
            className="text-muted-foreground text-sm"
            data-slot="slot-planner-end-preview"
          >
            {formatSlotPlannerTemplate(taxonomy.endTimePreview, {
              time: endTime,
              timeZone,
            })}
          </p>
        ) : null}
        {scope === "series" ? (
          <>
            <Select
              data-slot="slot-planner-recurrence"
              label={taxonomy.fieldRecurrence}
              value={recurrence}
              onValueChange={(value) =>
                setRecurrence(value as SlotPlannerEditorRecurrence)
              }
            >
              {recurrenceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <details
              ref={advancedRef}
              className="border-border rounded-md border p-3"
              open={violations?.length ? true : undefined}
            >
              <summary className="min-h-6 cursor-pointer text-sm font-medium">
                {taxonomy.moreOptions}
              </summary>
              <div className="mt-4 grid gap-4">
                <Field>
                  <FieldLabel>{taxonomy.fieldCapacity}</FieldLabel>
                  <FieldControl asChild>
                    <NumberInput
                      type="number"
                      numberMode="numeric"
                      min={1}
                      required
                      value={capacityText}
                      onChange={(event) => setCapacityText(event.target.value)}
                    />
                  </FieldControl>
                </Field>
                <div className={editorFieldRowClasses}>
                  <Field>
                    <FieldLabel>{taxonomy.fieldBufferBeforeMinutes}</FieldLabel>
                    <FieldControl asChild>
                      <NumberInput
                        type="number"
                        numberMode="numeric"
                        min={0}
                        required
                        value={bufferBeforeText}
                        onChange={(event) =>
                          setBufferBeforeText(event.target.value)
                        }
                      />
                    </FieldControl>
                  </Field>
                  <Field>
                    <FieldLabel>{taxonomy.fieldBufferAfterMinutes}</FieldLabel>
                    <FieldControl asChild>
                      <NumberInput
                        type="number"
                        numberMode="numeric"
                        min={0}
                        required
                        value={bufferAfterText}
                        onChange={(event) =>
                          setBufferAfterText(event.target.value)
                        }
                      />
                    </FieldControl>
                  </Field>
                </div>
                {timeZoneItems ? (
                  <Select
                    data-slot="slot-planner-time-zone-select"
                    label={taxonomy.fieldTimeZone}
                    items={timeZoneItems}
                    value={timeZone}
                    onValueChange={setTimeZone}
                  >
                    {(item) => (
                      <SelectItem value={item.value}>{item.label}</SelectItem>
                    )}
                  </Select>
                ) : (
                  <Field>
                    <FieldLabel>{taxonomy.fieldTimeZone}</FieldLabel>
                    <FieldControl asChild>
                      <Input
                        value={timeZone}
                        onChange={(event) => setTimeZone(event.target.value)}
                      />
                    </FieldControl>
                  </Field>
                )}
                <TagInput
                  label={taxonomy.fieldTags}
                  value={tags}
                  onValueChange={setTags}
                />
                <Field>
                  <FieldLabel>{taxonomy.fieldNote}</FieldLabel>
                  <FieldControl asChild>
                    <Textarea
                      rows={2}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </FieldControl>
                </Field>
              </div>
            </details>
            {recurrence !== "none" ? (
              <Field>
                <FieldLabel>{taxonomy.recurrenceUntil}</FieldLabel>
                <FieldControl asChild>
                  <Input
                    type="date"
                    value={recurrenceUntil}
                    onChange={(event) => setRecurrenceUntil(event.target.value)}
                  />
                </FieldControl>
              </Field>
            ) : null}
          </>
        ) : null}
      </div>
      {violations && violations.length > 0 ? (
        <SlotPlannerViolationList taxonomy={taxonomy} violations={violations} />
      ) : null}
      <DialogFooter className="border-border bg-background sticky bottom-0 z-10 border-t pt-4">
        <Button type="button" variant="outline" onClick={onDismiss}>
          {taxonomy.cancel}
        </Button>
        <Button type="submit">{taxonomy.save}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog
      data-slot="slot-planner-editor"
      open
      onOpenChange={(open) => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {renderContent
          ? renderContent({
              date,
              dismiss: onDismiss,
              isRecurring,
              mode,
              occurrenceValues,
              renderDefault: () => defaultContent,
              seriesValues,
              submit: onSubmit,
              taxonomy,
              violations: violations ?? [],
            })
          : defaultContent}
      </DialogContent>
    </Dialog>
  );
}

export interface SlotPlannerDeleteDialogProps {
  /** Recurring targets choose occurrence-versus-series before confirming. */
  isRecurring: boolean;
  taxonomy: SlotPlannerTaxonomy;
  onDismiss: () => void;
  onDeleteOccurrence: () => void;
  onDeleteSeries: () => void;
}

export function SlotPlannerDeleteDialog({
  isRecurring,
  taxonomy,
  onDismiss,
  onDeleteOccurrence,
  onDeleteSeries,
}: SlotPlannerDeleteDialogProps) {
  const [confirmingSeries, setConfirmingSeries] = useState(false);
  const tokens = { slot: taxonomy.slot, slotPlural: taxonomy.slotPlural };
  // Advancing to the series-confirm step unmounts the button that triggered
  // it, so focus is moved onto the destructive confirm button instead of
  // dropping to the document body.
  const confirmSeriesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (confirmingSeries) {
      confirmSeriesRef.current?.focus();
    }
  }, [confirmingSeries]);

  return (
    <AlertDialog
      data-slot="slot-planner-delete-dialog"
      open
      onOpenChange={(open) => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {formatSlotPlannerTemplate(
              confirmingSeries
                ? taxonomy.deleteSeriesConfirmTitle
                : taxonomy.deleteOccurrenceConfirmTitle,
              tokens,
            )}
          </AlertDialogTitle>
          {confirmingSeries ? (
            <AlertDialogDescription>
              {formatSlotPlannerTemplate(
                taxonomy.deleteSeriesConfirmBody,
                tokens,
              )}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={onDismiss}>
            {taxonomy.cancel}
          </Button>
          {confirmingSeries ? (
            <Button
              ref={confirmSeriesRef}
              type="button"
              variant="destructive"
              onClick={onDeleteSeries}
            >
              {taxonomy.confirmDelete}
            </Button>
          ) : isRecurring ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmingSeries(true)}
              >
                {taxonomy.deleteSeries}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onDeleteOccurrence}
              >
                {taxonomy.deleteOccurrence}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteOccurrence}
            >
              {taxonomy.confirmDelete}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** One selectable copy-day target: an ISO date plus its rail-style label. */
export type SlotPlannerCopyTarget = {
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
  /** Visible label, e.g. "Tue 7 Jul" (weekday + date, like the day rail). */
  label: string;
};

export interface SlotPlannerCopyDayDialogProps {
  /** The focused week's other days, in rail order. */
  targets: SlotPlannerCopyTarget[];
  taxonomy: SlotPlannerTaxonomy;
  onDismiss: () => void;
  /** Fires with the checked ISO dates, in rail order. */
  onApply: (targetDates: string[]) => void;
}

export function SlotPlannerCopyDayDialog({
  targets,
  taxonomy,
  onDismiss,
  onApply,
}: SlotPlannerCopyDayDialogProps) {
  const baseId = useId();
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Applying with no targets is a no-op batch; the disabled Apply button is
    // the primary guard, and this early return backs it up.
    if (selected.size === 0) {
      return;
    }

    onApply(
      targets.map(({ date }) => date).filter((date) => selected.has(date)),
    );
  };

  return (
    <Dialog
      data-slot="slot-planner-copy-day-dialog"
      open
      onOpenChange={(open) => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{taxonomy.copyDay}</DialogTitle>
        </DialogHeader>
        <form className={editorFormClasses} onSubmit={handleSubmit}>
          <div className={editorFieldsClasses}>
            <FieldSet data-slot="slot-planner-copy-day-targets">
              <FieldLegend>{taxonomy.copyDayTargetsLegend}</FieldLegend>
              {targets.map((target) => (
                <div key={target.date} className={editorRadioOptionClasses}>
                  <Checkbox
                    id={`${baseId}-target-${target.date}`}
                    checked={selected.has(target.date)}
                    onCheckedChange={(checked) => {
                      setSelected((previous) => {
                        const next = new Set(previous);

                        if (checked === true) {
                          next.add(target.date);
                        } else {
                          next.delete(target.date);
                        }

                        return next;
                      });
                    }}
                  />
                  <label
                    htmlFor={`${baseId}-target-${target.date}`}
                    className={editorRadioLabelClasses}
                  >
                    {target.label}
                  </label>
                </div>
              ))}
            </FieldSet>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDismiss}>
              {taxonomy.cancel}
            </Button>
            <Button type="submit" disabled={selected.size === 0}>
              {taxonomy.apply}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface SlotPlannerBatchConfirmDialogProps {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  /** Renders the confirm action as destructive (clear day). */
  destructive?: boolean;
  taxonomy: SlotPlannerTaxonomy;
  onDismiss: () => void;
  onConfirm: () => void;
}

/** Shared confirm step for copy-week and clear-day batch operations. */
export function SlotPlannerBatchConfirmDialog({
  title,
  body,
  confirmLabel,
  destructive = false,
  taxonomy,
  onDismiss,
  onConfirm,
}: SlotPlannerBatchConfirmDialogProps) {
  return (
    <AlertDialog
      data-slot="slot-planner-batch-confirm-dialog"
      open
      onOpenChange={(open) => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={onDismiss}>
            {taxonomy.cancel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "solid"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
