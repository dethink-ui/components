import {
  Autocomplete,
  ListBox,
  ListBoxItem,
  useFilter,
  type Selection,
} from "react-aria-components";
import { useRef } from "react";
import { Input } from "../input";
import { resolveFilterFieldType } from "./filter-field-types";
import { getDefaultFilterOperator } from "./filter-core";
import {
  CheckIcon,
  SearchInput,
  closeOnEmptyEscape,
  filterEditorStackClasses,
  filterListBoxClasses,
  filterListCheckboxClasses,
  filterListEmptyClasses,
  filterListIndicatorClasses,
  filterListItemClassNames,
  useDeferredFocus,
} from "./filter-editors";
import {
  FilterDateEditor,
  FilterDateRangeEditor,
  FilterDurationEditor,
  FilterNumberEditor,
  FilterNumberRangeEditor,
  FilterPeriodEditor,
  defaultFilterTypedEditorLabels,
  type FilterTypedEditorLabels,
  type TypedEditorProps,
} from "./filter-typed-editors";
import type {
  FilterField,
  FilterOperatorDefinition,
  FilterValue,
  FilterWeekday,
} from "./filter-types";

export interface FilterEditorLabels extends FilterTypedEditorLabels {
  searchOptions: (fieldLabel: string) => string;
  noResults: string;
  textValue: (fieldLabel: string) => string;
  textPlaceholder: string;
  /** Screen-reader text for an option's facet count. */
  facetCount: (count: number) => string;
}

export const defaultFilterEditorLabels: FilterEditorLabels = {
  ...defaultFilterTypedEditorLabels,
  searchOptions: (fieldLabel) => `Search ${fieldLabel.toLowerCase()}`,
  noResults: "No results.",
  textValue: (fieldLabel) => `${fieldLabel} value`,
  textPlaceholder: "Type a value",
  facetCount: (count) => `${count} matching`,
};

export interface FilterValueEditorProps<TData = unknown> {
  field: FilterField<TData>;
  /** Operator the value is for. Defaults to the field's default operator. */
  operator?: FilterOperatorDefinition;
  value?: FilterValue;
  onValueChange: (value: FilterValue | undefined) => void;
  /** Called when the user confirms the value, e.g. Enter or a preset. */
  onCommit?: () => void;
  /** Closes the surrounding editor, e.g. on Escape. */
  onClose?: () => void;
  /** Rows per option value, shown next to options and yes/no. */
  counts?: ReadonlyMap<string, number>;
  labels?: Partial<FilterEditorLabels>;
  locale?: string;
  weekStartsOn?: FilterWeekday;
}

function Count({
  count,
  labels,
}: {
  count: number | undefined;
  labels: FilterEditorLabels;
}) {
  if (count === undefined) {
    return null;
  }

  return (
    <span className="text-muted-foreground ms-auto shrink-0 text-xs tabular-nums">
      <span aria-hidden="true">{count}</span>
      <span className="sr-only">, {labels.facetCount(count)}</span>
    </span>
  );
}

function TextEditor({
  field,
  labels,
  onCommit,
  onValueChange,
  value,
}: {
  field: FilterField;
  labels: FilterEditorLabels;
  onCommit: () => void;
  onValueChange: (value: FilterValue | undefined) => void;
  value: FilterValue | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useDeferredFocus(inputRef);

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <Input
        ref={inputRef}
        aria-label={labels.textValue(field.label)}
        controlSize="sm"
        placeholder={field.placeholder ?? labels.textPlaceholder}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => {
          const next = event.currentTarget.value;

          onValueChange(next === "" ? undefined : next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
      />
    </div>
  );
}

function OptionsEditor({
  counts,
  field,
  labels,
  onClose,
  onValueChange,
  value,
}: {
  counts?: ReadonlyMap<string, number>;
  field: FilterField;
  labels: FilterEditorLabels;
  onClose?: () => void;
  onValueChange: (value: FilterValue | undefined) => void;
  value: FilterValue | undefined;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  const options = field.options ?? [];
  const selected = Array.isArray(value) ? value.map(String) : [];

  return (
    <div
      data-slot="filter-value-editor"
      className={filterEditorStackClasses}
      onKeyDownCapture={closeOnEmptyEscape(onClose)}
    >
      <Autocomplete filter={contains}>
        <SearchInput label={labels.searchOptions(field.label)} />
        <ListBox
          aria-label={field.label}
          items={options.map((option) => ({
            id: option.value,
            label: option.label,
            keywords: option.keywords,
          }))}
          selectionMode="multiple"
          selectedKeys={selected}
          className={filterListBoxClasses}
          renderEmptyState={() => (
            <div className={filterListEmptyClasses}>{labels.noResults}</div>
          )}
          onSelectionChange={(keys: Selection) => {
            const next = options
              .map((option) => option.value)
              .filter((optionValue) => keys === "all" || keys.has(optionValue));

            onValueChange(next.length > 0 ? next : undefined);
          }}
        >
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={[item.label, ...(item.keywords ?? [])].join(" ")}
              data-empty={counts && !counts.get(item.id) ? "" : undefined}
              className={filterListItemClassNames({
                className:
                  "group data-[empty]:text-muted-foreground grid-cols-[1rem_minmax(0,1fr)_auto]",
              })}
            >
              <span aria-hidden="true" className={filterListCheckboxClasses}>
                <CheckIcon />
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
              <Count
                count={counts ? (counts.get(item.id) ?? 0) : undefined}
                labels={labels}
              />
            </ListBoxItem>
          )}
        </ListBox>
      </Autocomplete>
    </div>
  );
}

function BooleanEditor({
  counts,
  field,
  labels,
  onCommit,
  onValueChange,
  value,
}: {
  counts?: ReadonlyMap<string, number>;
  field: FilterField;
  labels: FilterEditorLabels;
  onCommit: () => void;
  onValueChange: (value: FilterValue | undefined) => void;
  value: FilterValue | undefined;
}) {
  const items = [
    { id: "true", label: field.trueLabel ?? "Yes", value: true },
    { id: "false", label: field.falseLabel ?? "No", value: false },
  ];

  return (
    <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
      <ListBox
        aria-label={field.label}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- Opened on demand.
        autoFocus="first"
        items={items}
        className={filterListBoxClasses}
        onAction={(key) => {
          onValueChange(key === "true");
          onCommit();
        }}
      >
        {(item) => (
          <ListBoxItem
            id={item.id}
            textValue={item.label}
            className={filterListItemClassNames({
              className: "grid-cols-[1rem_minmax(0,1fr)_auto]",
            })}
          >
            <span aria-hidden="true" className={filterListIndicatorClasses}>
              {value === item.value ? <CheckIcon /> : null}
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
            <Count
              count={counts ? (counts.get(item.id) ?? 0) : undefined}
              labels={labels}
            />
          </ListBoxItem>
        )}
      </ListBox>
    </div>
  );
}

const typedEditors: Record<
  string,
  (props: TypedEditorProps) => React.JSX.Element
> = {
  number: FilterNumberEditor,
  numberRange: FilterNumberRangeEditor,
  date: FilterDateEditor,
  dateRange: FilterDateRangeEditor,
  duration: FilterDurationEditor,
  period: FilterPeriodEditor,
};

/**
 * Value editor for a condition, chosen by the operator's value kind: text
 * box, option checklist (with facet counts), yes/no, number or number range,
 * date presets and calendar, date range, "last N" durations or calendar
 * periods. Custom field types render their own editor.
 */
export function FilterValueEditor<TData>({
  counts,
  field: typedField,
  labels: labelOverrides,
  locale = "en-US",
  onClose,
  onCommit = () => undefined,
  onValueChange,
  operator: operatorProp,
  value,
  weekStartsOn = 1,
}: FilterValueEditorProps<TData>) {
  const field = typedField as FilterField;
  const labels = { ...defaultFilterEditorLabels, ...labelOverrides };
  const operator = operatorProp ?? getDefaultFilterOperator(field);
  const type = resolveFilterFieldType(field);

  if (type.renderEditor && operator) {
    return (
      <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
        {type.renderEditor({ field, operator, value, onValueChange, onCommit })}
      </div>
    );
  }

  const kind = operator?.valueKind;
  const Typed = kind ? typedEditors[kind] : undefined;

  if (Typed) {
    return (
      <Typed
        // A new operator kind needs fresh drafts.
        key={kind}
        fieldLabel={field.label}
        value={value}
        onValueChange={onValueChange}
        onCommit={onCommit}
        labels={labels}
        locale={locale}
        weekStartsOn={weekStartsOn}
      />
    );
  }

  if (kind === "list") {
    return (
      <OptionsEditor
        counts={counts}
        field={field}
        labels={labels}
        onClose={onClose}
        onValueChange={onValueChange}
        value={value}
      />
    );
  }

  if (kind === "boolean") {
    return (
      <BooleanEditor
        counts={counts}
        field={field}
        labels={labels}
        onCommit={onCommit}
        onValueChange={onValueChange}
        value={value}
      />
    );
  }

  return (
    <TextEditor
      field={field}
      labels={labels}
      onCommit={onCommit}
      onValueChange={onValueChange}
      value={value}
    />
  );
}
