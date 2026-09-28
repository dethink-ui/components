import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils/cn";
import { Popover, PopoverContent } from "../popover";
import {
  describeFilterCondition,
  formatFilterValue,
  getDefaultFilterOperator,
  getFilterField,
  getFilterOperator,
  isFilterConditionActive,
} from "./filter-core";
import {
  FilterFieldPicker,
  FilterOperatorPicker,
  FilterValueEditor,
} from "./filter-editors";
import type { FilterCondition } from "./filter-types";
import {
  CloseIcon,
  editorPopoverClasses,
  filterChipClassNames,
  formatChipValue,
  getNeighborItem,
  isRemoveKey,
  negationClasses,
  segmentClasses,
  segmentFieldClasses,
  segmentOperatorClasses,
  segmentRemoveClasses,
  segmentValueClasses,
  useEditorFocusReturn,
  useFilterBarContext,
} from "./filter-bar-parts";

type ChipSegment = "field" | "operator" | "value";

export interface FilterChipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  condition: FilterCondition;
  /** Position among the root chips, used for narrow-width collapsing. */
  index?: number;
}

/** A condition rendered as `Field | operator | value | ×` segments. */
export function FilterChip({
  className,
  condition,
  index = 0,
  onKeyDown,
  ...props
}: FilterChipProps) {
  const {
    collapseAfter,
    describeOptions,
    expanded,
    fields,
    labels,
    requestFocus,
    size,
    state,
  } = useFilterBarContext("FilterChip");
  const [editing, setEditing] = useState<ChipSegment | null>(null);
  const [session, setSession] = useState(0);
  // The same condition can render in the bar and in a group editor at once,
  // so each chip instance keeps its own undo sessions.
  const instanceId = useId();
  const chipRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useEditorFocusReturn(editing !== null);
  const field = getFilterField(fields, condition.field);
  const operator = field
    ? getFilterOperator(field, condition.operator)
    : undefined;
  const description = describeFilterCondition(
    condition,
    fields,
    describeOptions,
  );
  const active = isFilterConditionActive(condition, fields);
  const coalesceKey = `${instanceId}:${condition.id}:${session}`;
  const overflow = index >= collapseAfter && !expanded;

  const open = (segment: ChipSegment, trigger: HTMLElement) => {
    returnFocusRef.current = trigger;
    setSession((current) => current + 1);
    setEditing(segment);
  };

  const remove = () => {
    requestFocus(getNeighborItem(chipRef.current));
    state.removeNode(condition.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (isRemoveKey(event)) {
      event.preventDefault();
      remove();
    }
  };

  if (!field || !operator) {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Keys delegate to the chip's roving segment buttons.
      <div
        {...props}
        ref={chipRef}
        role="group"
        aria-label={description}
        data-slot="filter-chip"
        data-invalid=""
        data-overflow={overflow ? "" : undefined}
        className={filterChipClassNames({
          size,
          className: cn("border-destructive/60", className),
        })}
        onKeyDown={handleKeyDown}
      >
        <span className={cn(segmentClasses, "hover:bg-transparent")}>
          {labels.unknownField(condition.field)}
        </span>
        <button
          type="button"
          data-filter-bar-item="remove"
          data-slot="filter-chip-remove"
          aria-label={labels.remove(description)}
          className={cn(segmentClasses, segmentRemoveClasses)}
          onClick={remove}
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  const values = formatFilterValue(field, condition.value);
  const valueText = formatChipValue(values, labels.selectValue);
  const operatorLabel = labels.operator(operator, condition.value);

  const update = (patch: Partial<Omit<FilterCondition, "id" | "type">>) => {
    state.updateCondition(condition.id, patch, { coalesceKey });
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Keys delegate to the chip's roving segment buttons.
    <div
      {...props}
      ref={chipRef}
      role="group"
      aria-label={description}
      data-slot="filter-chip"
      data-active={active ? "" : undefined}
      data-incomplete={active ? undefined : ""}
      data-negated={condition.not ? "" : undefined}
      data-overflow={overflow ? "" : undefined}
      className={filterChipClassNames({ size, className })}
      onKeyDown={handleKeyDown}
    >
      {condition.not ? (
        <span
          data-slot="filter-chip-not"
          className={cn(negationClasses, "rounded-none")}
        >
          {labels.not}
        </span>
      ) : null}
      <button
        type="button"
        data-filter-bar-item="field"
        data-slot="filter-chip-field"
        aria-label={labels.changeField(field.label)}
        aria-haspopup="dialog"
        aria-expanded={editing === "field"}
        className={cn(segmentClasses, segmentFieldClasses)}
        onClick={(event) => {
          open("field", event.currentTarget);
        }}
      >
        {field.label}
      </button>
      <button
        type="button"
        data-filter-bar-item="operator"
        data-slot="filter-chip-operator"
        aria-label={labels.changeOperator(operatorLabel)}
        aria-haspopup="dialog"
        aria-expanded={editing === "operator"}
        className={cn(segmentClasses, segmentOperatorClasses)}
        onClick={(event) => {
          open("operator", event.currentTarget);
        }}
      >
        {operatorLabel}
      </button>
      {operator.arity === "none" ? null : (
        <button
          type="button"
          data-filter-bar-item="value"
          data-slot="filter-chip-value"
          data-incomplete={values.length === 0 ? "" : undefined}
          aria-label={labels.changeValue(
            values.length > 0 ? values.join(", ") : labels.selectValue,
          )}
          aria-haspopup="dialog"
          aria-expanded={editing === "value"}
          className={cn(segmentClasses, segmentValueClasses)}
          onClick={(event) => {
            open("value", event.currentTarget);
          }}
        >
          <span className="min-w-0 truncate">{valueText}</span>
        </button>
      )}
      <button
        type="button"
        data-filter-bar-item="remove"
        data-slot="filter-chip-remove"
        aria-label={labels.remove(description)}
        className={cn(segmentClasses, segmentRemoveClasses)}
        onClick={remove}
      >
        <CloseIcon />
      </button>
      <Popover
        anchorRef={chipRef}
        open={editing !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEditing(null);
          }
        }}
      >
        <PopoverContent
          aria-label={labels.editor(description)}
          placement="bottom start"
          className={editorPopoverClasses}
        >
          {editing === "field" ? (
            <FilterFieldPicker
              fields={fields}
              selectedKey={field.key}
              searchLabel={labels.searchFields}
              listLabel={labels.fieldList}
              emptyLabel={labels.noResults}
              onClose={() => {
                setEditing(null);
              }}
              onSelect={(fieldKey) => {
                const nextField = getFilterField(fields, fieldKey);

                if (!nextField || nextField.key === field.key) {
                  setEditing(null);
                  return;
                }

                const nextOperator = getDefaultFilterOperator(nextField);

                update({
                  field: nextField.key,
                  operator: nextOperator?.id ?? condition.operator,
                  value: undefined,
                });
                setEditing(nextOperator?.arity === "none" ? null : "value");
              }}
            />
          ) : null}
          {editing === "operator" ? (
            <FilterOperatorPicker
              field={field}
              selectedKey={operator.id}
              value={condition.value}
              listLabel={labels.operatorList}
              getOperatorLabel={labels.operator}
              onSelect={(operatorId) => {
                if (operatorId !== operator.id) {
                  update({ operator: operatorId });
                }

                setEditing(null);
              }}
            />
          ) : null}
          {editing === "value" ? (
            <FilterValueEditor
              field={field}
              value={condition.value}
              searchLabel={labels.searchOptions(field.label)}
              emptyLabel={labels.noResults}
              textLabel={labels.textValue(field.label)}
              textPlaceholder={field.placeholder ?? labels.textPlaceholder}
              onValueChange={(value) => {
                update({ value });
              }}
              onCommit={() => {
                setEditing(null);
              }}
              onClose={() => {
                setEditing(null);
              }}
            />
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
