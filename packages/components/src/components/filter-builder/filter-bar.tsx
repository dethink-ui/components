import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { LiveRegion } from "../live-region";
import { Popover, PopoverContent } from "../popover";
import {
  createFilterCondition,
  createFilterId,
  describeFilter,
  describeFilterCondition,
  findFilterNode,
  formatFilterValue,
  getDefaultFilterOperator,
  getFilterField,
  getFilterOperator,
  getFilterOperatorLabel,
  isFilterConditionActive,
  type DescribeFilterOptions,
} from "./filter-core";
import {
  FilterFieldPicker,
  FilterOperatorPicker,
  FilterValueEditor,
} from "./filter-editors";
import type {
  Filter,
  FilterCondition,
  FilterFields,
  FilterGroup,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";
import { useFilterState, type FilterState } from "./use-filter-state";

export type FilterBarSize = "sm" | "md";

export interface FilterBarLabels {
  toolbar: string;
  add: string;
  addFirst: string;
  addMenu: string;
  back: string;
  clear: string;
  undo: string;
  searchFields: string;
  searchOptions: (fieldLabel: string) => string;
  fieldList: string;
  operatorList: string;
  noResults: string;
  selectValue: string;
  textValue: (fieldLabel: string) => string;
  textPlaceholder: string;
  changeField: (fieldLabel: string) => string;
  changeOperator: (operatorLabel: string) => string;
  changeValue: (valueText: string) => string;
  remove: (description: string) => string;
  editor: (description: string) => string;
  showMore: (hiddenCount: number) => string;
  showLess: string;
  resultCount: (count: number) => string;
  unknownField: (fieldKey: string) => string;
  and: string;
  or: string;
  not: string;
  /** Shown before the chips when the whole filter is negated. */
  notMatching: string;
  missingValue: string;
  empty: string;
  operator: (
    operator: FilterOperatorDefinition,
    value: FilterValue | undefined,
  ) => string;
}

export const defaultFilterBarLabels: FilterBarLabels = {
  toolbar: "Filters",
  add: "Filter",
  addFirst: "Add filter",
  addMenu: "Add a filter",
  back: "Back to fields",
  clear: "Clear",
  undo: "Undo filter change",
  searchFields: "Filter by…",
  searchOptions: (fieldLabel) => `Search ${fieldLabel.toLowerCase()}`,
  fieldList: "Fields",
  operatorList: "Operators",
  noResults: "No results.",
  selectValue: "Select…",
  textValue: (fieldLabel) => `${fieldLabel} value`,
  textPlaceholder: "Type a value",
  changeField: (fieldLabel) => `Change field, ${fieldLabel}`,
  changeOperator: (operatorLabel) => `Change operator, ${operatorLabel}`,
  changeValue: (valueText) => `Change value, ${valueText}`,
  remove: (description) => `Remove filter, ${description}`,
  editor: (description) => `Edit filter, ${description}`,
  showMore: (hiddenCount) => `+${hiddenCount} more`,
  showLess: "Show fewer",
  resultCount: (count) => `${count} ${count === 1 ? "result" : "results"}`,
  unknownField: (fieldKey) => `Unknown field ${fieldKey}`,
  and: "and",
  or: "or",
  not: "not",
  notMatching: "Not matching",
  missingValue: "(no value)",
  empty: "No filters",
  operator: getFilterOperatorLabel,
};

interface FilterBarContextValue {
  // A plain mutable ref: React 18's RefObject is read-only.
  addButtonRef: { current: HTMLButtonElement | null };
  addMenuOpen: boolean;
  collapseAfter: number;
  describeOptions: DescribeFilterOptions;
  expanded: boolean;
  fields: FilterFields;
  labels: FilterBarLabels;
  requestFocus: (element: HTMLElement | null | undefined) => void;
  setAddMenuOpen: (open: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  size: FilterBarSize;
  state: FilterState;
}

const FilterBarContext = createContext<FilterBarContextValue | null>(null);

function useFilterBarContext(part: string) {
  const context = useContext(FilterBarContext);

  if (!context) {
    throw new Error(`${part} must be rendered inside <FilterBar>.`);
  }

  return context;
}

/** Filter state and labels of the nearest FilterBar. */
export function useFilterBar() {
  const { fields, labels, state } = useFilterBarContext("useFilterBar");

  return { fields, labels, state };
}

const ITEM_SELECTOR = "[data-filter-bar-item]";

const filterBarClasses = "@container grid min-w-0 gap-[var(--dt-space-2)]";

const filterBarToolbarClasses =
  "flex min-w-0 flex-wrap items-center gap-[var(--dt-space-2)]";

const chipBaseClasses =
  "inline-flex min-w-0 max-w-full items-stretch overflow-hidden rounded-md border border-border bg-background text-foreground shadow-xs @max-xl:data-[overflow]:hidden data-[incomplete]:border-dashed";

const chipSizeClasses: Record<FilterBarSize, string> = {
  sm: "h-7 text-xs",
  md: "h-8 text-sm",
};

const segmentClasses =
  "inline-flex min-w-0 items-center gap-[var(--dt-space-1)] px-[var(--dt-space-2)] outline-none [&+&]:border-s [&+&]:border-border motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)] hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-expanded:bg-muted";

const segmentFieldClasses = "shrink-0 font-medium";

const segmentOperatorClasses = "shrink-0 text-muted-foreground";

const segmentValueClasses =
  "max-w-[16rem] data-[incomplete]:italic data-[incomplete]:text-muted-foreground";

const segmentRemoveClasses =
  "shrink-0 justify-center px-[var(--dt-space-1-5)] text-muted-foreground hover:text-foreground";

const groupChipTextClasses =
  "inline-flex min-w-0 items-center px-[var(--dt-space-2)] text-muted-foreground";

const actionBaseClasses =
  "inline-flex shrink-0 items-center gap-[var(--dt-space-1-5)] rounded-md px-[var(--dt-space-2-5)] font-medium outline-none motion-safe:transition-colors motion-safe:duration-[var(--dt-motion-fast)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const addButtonClasses =
  "border border-dashed border-border text-muted-foreground hover:border-solid hover:bg-muted hover:text-foreground aria-expanded:border-solid aria-expanded:bg-muted aria-expanded:text-foreground";

const ghostActionClasses =
  "text-muted-foreground hover:bg-muted hover:text-foreground";

const moreButtonClasses = `${ghostActionClasses} hidden @max-xl:inline-flex`;

const negationClasses =
  "inline-flex shrink-0 items-center self-stretch rounded-sm bg-muted px-[var(--dt-space-1-5)] text-xs font-semibold uppercase text-foreground";

const conjunctionClasses =
  "select-none text-xs font-medium uppercase text-muted-foreground";

const editorHeaderClasses =
  "flex min-w-0 items-center gap-[var(--dt-space-1)] text-sm";

const editorBackClasses =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

const editorPopoverClasses =
  "w-[var(--dt-filter-editor-width,16rem)] p-[var(--dt-space-2)]";

export function filterBarClassNames({
  className,
}: { className?: string } = {}) {
  return cn(filterBarClasses, className);
}

export function filterChipClassNames({
  className,
  size = "md",
}: { className?: string; size?: FilterBarSize } = {}) {
  return cn(chipBaseClasses, chipSizeClasses[size], className);
}

export function filterBarActionClassNames({
  className,
  size = "md",
  variant = "ghost",
}: {
  className?: string;
  size?: FilterBarSize;
  variant?: "add" | "ghost";
} = {}) {
  return cn(
    actionBaseClasses,
    chipSizeClasses[size],
    variant === "add" ? addButtonClasses : ghostActionClasses,
    className,
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M8 3.5v9M3.5 8h9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0">
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 rtl:-scale-x-100"
    >
      <path
        d="M5.5 4 2.5 7l3 3M3 7h6.5a3.5 3.5 0 0 1 0 7H8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 rtl:-scale-x-100"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function isVisible(element: HTMLElement) {
  return typeof element.checkVisibility === "function"
    ? element.checkVisibility()
    : true;
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  );
}

function formatChipValue(values: string[], placeholder: string) {
  if (values.length === 0) {
    return placeholder;
  }

  if (values.length <= 2) {
    return values.join(", ");
  }

  return `${values[0]}, ${values[1]} +${values.length - 2}`;
}

/** Restores focus to the segment that opened an editor once it closes. */
function useEditorFocusReturn(open: boolean) {
  const returnRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;

    wasOpenRef.current = open;

    if (!wasOpen || open) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const target = returnRef.current;

      if (target?.isConnected) {
        target.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  return returnRef;
}

/** The toolbar item to focus after a chip is removed: next, else previous. */
function getNeighborItem(chip: HTMLElement | null) {
  const toolbar = chip?.closest<HTMLElement>("[role=toolbar]");

  if (!chip || !toolbar) {
    return undefined;
  }

  const items = [
    ...toolbar.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
  ].filter((item) => isVisible(item) && !chip.contains(item));
  const after = items.find(
    (item) =>
      chip.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

  return (
    after ??
    [...items]
      .reverse()
      .find(
        (item) =>
          chip.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_PRECEDING,
      )
  );
}

function isRemoveKey(event: KeyboardEvent<HTMLElement>) {
  return (
    (event.key === "Backspace" || event.key === "Delete") &&
    event.target instanceof HTMLElement &&
    event.target.hasAttribute("data-filter-bar-item")
  );
}

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
  const coalesceKey = `${condition.id}:${session}`;
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

export interface FilterGroupChipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  group: FilterGroup;
  index?: number;
}

/** Read-only summary of a nested group with a remove action. */
export function FilterGroupChip({
  className,
  group,
  index = 0,
  ...props
}: FilterGroupChipProps) {
  const {
    collapseAfter,
    describeOptions,
    expanded,
    fields,
    labels,
    size,
    state,
    requestFocus,
  } = useFilterBarContext("FilterGroupChip");
  const chipRef = useRef<HTMLDivElement>(null);
  const description = describeFilter(group, fields, describeOptions);

  const remove = () => {
    requestFocus(getNeighborItem(chipRef.current));
    state.removeNode(group.id);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Keys delegate to the chip's roving segment buttons.
    <div
      {...props}
      ref={chipRef}
      role="group"
      aria-label={description}
      data-slot="filter-group-chip"
      data-negated={group.not ? "" : undefined}
      data-overflow={index >= collapseAfter && !expanded ? "" : undefined}
      className={filterChipClassNames({ size, className })}
      onKeyDown={(event) => {
        if (isRemoveKey(event)) {
          event.preventDefault();
          remove();
        }
      }}
    >
      <span className={groupChipTextClasses}>
        <span className="min-w-0 truncate">{description}</span>
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

export interface FilterBarChipsProps {
  /** Custom chip renderer. Return `undefined` to use the default chip. */
  renderChip?: (condition: FilterCondition, index: number) => ReactNode;
}

/** Chips for the root conditions, with narrow-width collapsing. */
export function FilterBarChips({ renderChip }: FilterBarChipsProps) {
  const { collapseAfter, expanded, labels, setExpanded, size, state } =
    useFilterBarContext("FilterBarChips");
  const { children, combinator } = state.filter;
  const hiddenCount = Math.max(children.length - collapseAfter, 0);

  return (
    <>
      {state.filter.not && children.length > 0 ? (
        <span data-slot="filter-bar-not" className={negationClasses}>
          {labels.notMatching}
        </span>
      ) : null}
      {children.map((node, index) => (
        <FilterBarChipSlot
          key={node.id}
          conjunction={index > 0 && combinator === "or" ? labels.or : undefined}
        >
          {node.type === "condition" ? (
            (renderChip?.(node, index) ?? (
              <FilterChip condition={node} index={index} />
            ))
          ) : (
            <FilterGroupChip group={node} index={index} />
          )}
        </FilterBarChipSlot>
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          data-filter-bar-item="more"
          data-slot="filter-bar-more"
          aria-expanded={expanded}
          className={filterBarActionClassNames({
            size,
            className: moreButtonClasses,
          })}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? labels.showLess : labels.showMore(hiddenCount)}
        </button>
      ) : null}
    </>
  );
}

function FilterBarChipSlot({
  children,
  conjunction,
}: {
  children: ReactNode;
  conjunction?: string;
}) {
  if (!conjunction) {
    return children;
  }

  return (
    <>
      <span aria-hidden="true" className={conjunctionClasses}>
        {conjunction}
      </span>
      {children}
    </>
  );
}

export interface FilterAddMenuProps {
  className?: string;
  /** Button content. Defaults to a plus icon and the add label. */
  children?: ReactNode;
}

interface AddDraft {
  conditionId: string;
  fieldKey: string;
  session: number;
}

/** "+ Filter" button: pick a field, then a value, in one popover. */
export function FilterAddMenu({ children, className }: FilterAddMenuProps) {
  const {
    addButtonRef,
    addMenuOpen,
    fields,
    labels,
    setAddMenuOpen,
    size,
    state,
  } = useFilterBarContext("FilterAddMenu");
  const [draft, setDraft] = useState<AddDraft | null>(null);
  const sessionRef = useRef(0);
  const field = draft ? getFilterField(fields, draft.fieldKey) : undefined;
  const operator = field ? getDefaultFilterOperator(field) : undefined;
  const existing = draft
    ? findFilterNode(state.filter, draft.conditionId)
    : undefined;
  const condition = existing?.type === "condition" ? existing : undefined;
  const coalesceKey = draft ? `add:${draft.session}` : undefined;
  const hasChips = state.filter.children.length > 0;

  const discardIncomplete = () => {
    if (condition && !isFilterConditionActive(condition, fields)) {
      state.removeNode(condition.id, { coalesceKey });
    }
  };

  const close = () => {
    discardIncomplete();
    setDraft(null);
    setAddMenuOpen(false);
  };

  return (
    <>
      <button
        ref={addButtonRef}
        type="button"
        data-filter-bar-item="add"
        data-slot="filter-add-menu-trigger"
        aria-haspopup="dialog"
        aria-expanded={addMenuOpen}
        className={filterBarActionClassNames({
          size,
          variant: "add",
          className,
        })}
        onClick={() => {
          setAddMenuOpen(!addMenuOpen);
        }}
      >
        {children ?? (
          <>
            <PlusIcon />
            {hasChips ? labels.add : labels.addFirst}
          </>
        )}
      </button>
      <Popover
        anchorRef={addButtonRef}
        open={addMenuOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setAddMenuOpen(true);
          } else {
            close();
          }
        }}
      >
        <PopoverContent
          aria-label={labels.addMenu}
          placement="bottom start"
          className={editorPopoverClasses}
        >
          {field && operator && draft ? (
            <div className="grid min-w-0 gap-[var(--dt-space-2)]">
              <div className={editorHeaderClasses}>
                <button
                  type="button"
                  aria-label={labels.back}
                  className={editorBackClasses}
                  onClick={() => {
                    discardIncomplete();
                    setDraft(null);
                  }}
                >
                  <BackIcon />
                </button>
                <span className="min-w-0 truncate font-medium">
                  {field.label}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {labels.operator(operator, condition?.value)}
                </span>
              </div>
              <FilterValueEditor
                field={field}
                value={condition?.value}
                searchLabel={labels.searchOptions(field.label)}
                emptyLabel={labels.noResults}
                textLabel={labels.textValue(field.label)}
                textPlaceholder={field.placeholder ?? labels.textPlaceholder}
                onValueChange={(value) => {
                  if (condition) {
                    state.updateCondition(
                      condition.id,
                      { value },
                      { coalesceKey },
                    );
                    return;
                  }

                  if (value === undefined) {
                    return;
                  }

                  state.addNode(
                    createFilterCondition({
                      id: draft.conditionId,
                      field: field.key,
                      operator: operator.id,
                      value,
                    }),
                    { coalesceKey },
                  );
                }}
                onCommit={close}
                onClose={close}
              />
            </div>
          ) : (
            <FilterFieldPicker
              fields={fields}
              searchLabel={labels.searchFields}
              listLabel={labels.fieldList}
              emptyLabel={labels.noResults}
              onClose={close}
              onSelect={(fieldKey) => {
                const nextField = getFilterField(fields, fieldKey);
                const nextOperator = nextField
                  ? getDefaultFilterOperator(nextField)
                  : undefined;

                if (!nextField || !nextOperator) {
                  return;
                }

                sessionRef.current += 1;

                if (nextOperator.arity === "none") {
                  state.addNode(
                    createFilterCondition({
                      field: nextField.key,
                      operator: nextOperator.id,
                    }),
                  );
                  setAddMenuOpen(false);
                  return;
                }

                setDraft({
                  conditionId: createFilterId("condition"),
                  fieldKey: nextField.key,
                  session: sessionRef.current,
                });
              }}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

export interface FilterBarActionProps {
  className?: string;
  children?: ReactNode;
}

/** Removes every filter. Hidden while the filter is empty. */
export function FilterBarClear({ children, className }: FilterBarActionProps) {
  const { addButtonRef, labels, requestFocus, size, state } =
    useFilterBarContext("FilterBarClear");

  if (state.filter.children.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      data-filter-bar-item="clear"
      data-slot="filter-bar-clear"
      className={filterBarActionClassNames({ size, className })}
      onClick={() => {
        requestFocus(addButtonRef.current);
        state.clear();
      }}
    >
      {children ?? labels.clear}
    </button>
  );
}

/** Undoes the last filter change. Hidden when there is nothing to undo. */
export function FilterBarUndo({ children, className }: FilterBarActionProps) {
  const { labels, size, state } = useFilterBarContext("FilterBarUndo");

  if (!state.canUndo) {
    return null;
  }

  return (
    <button
      type="button"
      data-filter-bar-item="undo"
      data-slot="filter-bar-undo"
      aria-label={children ? undefined : labels.undo}
      title={children ? undefined : labels.undo}
      className={filterBarActionClassNames({
        size,
        className: cn(
          children ? undefined : "px-[var(--dt-space-1-5)]",
          className,
        ),
      })}
      onClick={() => {
        state.undo();
      }}
    >
      {children ?? <UndoIcon />}
    </button>
  );
}

export interface FilterBarProps<TData = unknown> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> {
  fields: FilterFields<TData>;
  value?: Filter;
  defaultValue?: Filter;
  onValueChange?: (filter: Filter) => void;
  /** External state from `useFilterState`. Takes precedence over value props. */
  state?: FilterState;
  labels?: Partial<FilterBarLabels>;
  /** Number of matching rows, announced politely when it changes. */
  resultCount?: number;
  /** Single key that opens the add menu when focus is not in a text field. */
  addShortcut?: string | false;
  /** Chips shown before "+N more" on narrow containers. Defaults to 2. */
  collapseAfter?: number;
  size?: FilterBarSize;
  /** Custom composition of FilterBar parts. Defaults to chips and actions. */
  children?: ReactNode;
}

/**
 * Filter chips in a keyboard-navigable toolbar. Arrow keys move between
 * segments, Backspace/Delete removes the focused chip and Cmd/Ctrl+Z undoes.
 */
export function FilterBar<TData>({
  "aria-label": ariaLabel,
  addShortcut = false,
  children,
  className,
  collapseAfter = 2,
  defaultValue,
  fields,
  labels: labelOverrides,
  onValueChange,
  resultCount,
  size = "md",
  state: externalState,
  value,
  ...props
}: FilterBarProps<TData>) {
  const internalState = useFilterState({ defaultValue, onValueChange, value });
  const state = externalState ?? internalState;
  const labels = useMemo(
    () => ({ ...defaultFilterBarLabels, ...labelOverrides }),
    [labelOverrides],
  );
  const describeOptions = useMemo<DescribeFilterOptions>(
    () => ({
      labels: {
        and: labels.and,
        empty: labels.empty,
        missingValue: labels.missingValue,
        not: labels.not,
        or: labels.or,
      },
    }),
    [labels],
  );
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const activeItemRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef<HTMLElement | null>(null);
  // Position of the tab stop, used to recover focus if its element is removed.
  const activeIndexRef = useRef(0);
  // Whether focus is in the toolbar, so recovery never steals focus.
  const focusWithinRef = useRef(false);
  const summaryId = useId();

  const getAllItems = useCallback(() => {
    const toolbar = toolbarRef.current;

    return toolbar
      ? [...toolbar.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].filter(
          (item) => item.closest("[role=toolbar]") === toolbar,
        )
      : [];
  }, []);

  const getItems = useCallback(
    () => getAllItems().filter(isVisible),
    [getAllItems],
  );

  const syncTabStops = useCallback(() => {
    const items = getAllItems();
    const visible = items.filter(isVisible);
    const activeItem = activeItemRef.current;
    const tabStop =
      activeItem && visible.includes(activeItem) ? activeItem : visible[0];

    // Hidden (collapsed) items get -1 too, so revealing them later never
    // exposes extra tab stops.
    for (const item of items) {
      item.tabIndex = item === tabStop ? 0 : -1;
    }

    if (tabStop) {
      activeIndexRef.current = visible.indexOf(tabStop);
    }
  }, [getAllItems]);

  const requestFocus = useCallback((element?: HTMLElement | null) => {
    pendingFocusRef.current = element ?? null;
  }, []);

  // Roving tabindex: runs after every render so added/removed chips keep a
  // single tab stop, and moves focus after a chip is removed.
  useEffect(() => {
    const pending = pendingFocusRef.current;

    pendingFocusRef.current = null;

    const lost = activeItemRef.current;

    if (pending?.isConnected) {
      activeItemRef.current = pending;
      pending.focus();
    } else if (lost && !lost.isConnected) {
      activeItemRef.current = null;

      // A render removed the focused item (e.g. undo hid the Undo button or
      // a chip). Keep keyboard users in the toolbar at the same position.
      const focusLost =
        document.activeElement === null ||
        document.activeElement === document.body;

      if (focusWithinRef.current && focusLost) {
        const visible = getItems();
        const next =
          visible[Math.min(activeIndexRef.current, visible.length - 1)];

        if (next) {
          activeItemRef.current = next;
          next.focus();
        }
      }
    }

    syncTabStops();
  });

  // Chips collapse through a container query, which does not re-render, so
  // re-sync when the toolbar's size changes.
  useEffect(() => {
    const toolbar = toolbarRef.current;

    if (!toolbar || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      syncTabStops();
    });

    observer.observe(toolbar);

    return () => {
      observer.disconnect();
    };
  }, [syncTabStops]);

  useEffect(() => {
    if (!addShortcut) {
      return undefined;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== addShortcut.toLowerCase() ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      addButtonRef.current?.focus();
      setAddMenuOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addShortcut]);

  const contextValue = useMemo<FilterBarContextValue>(
    () => ({
      addButtonRef,
      addMenuOpen,
      collapseAfter,
      describeOptions,
      expanded,
      fields: fields as FilterFields,
      labels,
      requestFocus,
      setAddMenuOpen,
      setExpanded,
      size,
      state,
    }),
    [
      addMenuOpen,
      collapseAfter,
      describeOptions,
      expanded,
      fields,
      labels,
      requestFocus,
      size,
      state,
    ],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      !(target instanceof HTMLElement) ||
      !target.hasAttribute("data-filter-bar-item")
    ) {
      return;
    }

    const modifier = event.metaKey || event.ctrlKey;

    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();

      if (event.shiftKey) {
        state.redo();
      } else {
        state.undo();
      }

      return;
    }

    const items = getItems();
    const index = items.indexOf(target);

    if (index === -1) {
      return;
    }

    const rtl =
      toolbarRef.current !== null &&
      getComputedStyle(toolbarRef.current).direction === "rtl";
    let next: HTMLElement | undefined;

    switch (event.key) {
      case "ArrowRight":
        next = items[rtl ? index - 1 : index + 1];
        break;
      case "ArrowLeft":
        next = items[rtl ? index + 1 : index - 1];
        break;
      case "Home":
        next = items[0];
        break;
      case "End":
        next = items.at(-1);
        break;
      default:
        return;
    }

    event.preventDefault();

    if (next) {
      activeItemRef.current = next;
      syncTabStops();
      next.focus();
    }
  };

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div
        {...props}
        data-slot="filter-bar"
        data-size={size}
        data-empty={state.filter.children.length === 0 ? "" : undefined}
        className={filterBarClassNames({ className })}
      >
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label={ariaLabel ?? labels.toolbar}
          aria-describedby={summaryId}
          data-slot="filter-bar-toolbar"
          className={filterBarToolbarClasses}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            // A removed element blurs with no related target; only a move
            // to somewhere else counts as leaving.
            if (
              event.relatedTarget instanceof Node &&
              !event.currentTarget.contains(event.relatedTarget)
            ) {
              focusWithinRef.current = false;
            }
          }}
          onFocus={(event) => {
            focusWithinRef.current = true;

            if (
              event.target instanceof HTMLElement &&
              event.target.hasAttribute("data-filter-bar-item") &&
              event.target.closest("[role=toolbar]") === toolbarRef.current
            ) {
              activeItemRef.current = event.target;
              syncTabStops();
            }
          }}
        >
          {children ?? (
            <>
              <FilterBarChips />
              <FilterAddMenu />
              <FilterBarClear />
              <FilterBarUndo />
            </>
          )}
        </div>
        <span id={summaryId} hidden>
          {describeFilter(state.filter, fields, describeOptions)}
        </span>
        <LiveRegion slotName="filter-bar-status">
          {resultCount === undefined ? "" : labels.resultCount(resultCount)}
        </LiveRegion>
      </div>
    </FilterBarContext.Provider>
  );
}
