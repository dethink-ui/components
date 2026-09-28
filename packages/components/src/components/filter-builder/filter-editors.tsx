import {
  Autocomplete,
  Input as AriaInput,
  ListBox,
  ListBoxItem,
  SearchField,
  useFilter,
  type Selection,
} from "react-aria-components";
import { type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Input, inputClassNames } from "../input";
import { getFilterOperatorLabel, getFilterOperators } from "./filter-core";
import type {
  FilterField,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

const filterListBoxClasses = "max-h-64 min-w-0 overflow-auto outline-none";

const filterListItemClasses =
  "grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm text-foreground outline-none motion-safe:transition-[background-color,color] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[pressed]:bg-muted/80";

const filterListIndicatorClasses =
  "flex size-4 items-center justify-center text-foreground";

const filterListCheckboxClasses =
  "flex size-4 items-center justify-center rounded-[4px] border border-input bg-background text-primary-foreground group-data-[selected]:border-primary group-data-[selected]:bg-primary [&>svg]:invisible group-data-[selected]:[&>svg]:visible";

const filterListEmptyClasses =
  "px-[var(--dt-space-2)] py-[var(--dt-space-3)] text-sm text-muted-foreground";

const filterEditorStackClasses = "grid min-w-0 gap-[var(--dt-space-2)]";

/**
 * Autocomplete spends the first Escape clearing its virtual focus. Close the
 * editor straight away instead when the search box is empty.
 */
function closeOnEmptyEscape(onClose: (() => void) | undefined) {
  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      onClose &&
      event.key === "Escape" &&
      event.target instanceof HTMLInputElement &&
      event.target.value === ""
    ) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };
}

export function filterListItemClassNames({
  className,
}: { className?: string } = {}) {
  return cn(filterListItemClasses, className);
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
      <path
        d="m3.5 8.5 3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SearchInput({ label }: { label: string }) {
  return (
    // Editors open on demand, so moving focus into the search is expected.
    // eslint-disable-next-line jsx-a11y/no-autofocus
    <SearchField aria-label={label} autoFocus className="min-w-0">
      <AriaInput
        placeholder={label}
        className={inputClassNames({
          controlSize: "sm",
          className: "[&::-webkit-search-cancel-button]:hidden",
        })}
      />
    </SearchField>
  );
}

export interface FilterFieldPickerProps<TData = unknown> {
  fields: readonly FilterField<TData>[];
  onSelect: (fieldKey: string) => void;
  selectedKey?: string;
  searchLabel?: string;
  listLabel?: string;
  emptyLabel?: ReactNode;
  /** Closes the surrounding editor, e.g. on Escape. */
  onClose?: () => void;
}

/** Searchable list of fields. Selecting one calls `onSelect`. */
export function FilterFieldPicker<TData>({
  emptyLabel = "No results.",
  fields,
  listLabel = "Fields",
  onClose,
  onSelect,
  searchLabel = "Search fields",
  selectedKey,
}: FilterFieldPickerProps<TData>) {
  const { contains } = useFilter({ sensitivity: "base" });
  const items = fields.map((field) => ({ id: field.key, label: field.label }));

  return (
    <div
      data-slot="filter-field-picker"
      className={filterEditorStackClasses}
      onKeyDownCapture={closeOnEmptyEscape(onClose)}
    >
      <Autocomplete filter={contains}>
        <SearchInput label={searchLabel} />
        <ListBox
          aria-label={listLabel}
          items={items}
          className={filterListBoxClasses}
          renderEmptyState={() => (
            <div className={filterListEmptyClasses}>{emptyLabel}</div>
          )}
          onAction={(key) => {
            onSelect(String(key));
          }}
        >
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              className={filterListItemClassNames()}
            >
              <span aria-hidden="true" className={filterListIndicatorClasses}>
                {item.id === selectedKey ? <CheckIcon /> : null}
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
            </ListBoxItem>
          )}
        </ListBox>
      </Autocomplete>
    </div>
  );
}

export interface FilterOperatorPickerProps {
  field: Pick<FilterField, "operators" | "type">;
  onSelect: (operatorId: string) => void;
  selectedKey?: string;
  value?: FilterValue;
  listLabel?: string;
  getOperatorLabel?: (
    operator: FilterOperatorDefinition,
    value?: FilterValue,
  ) => string;
}

/** List of the operators available for a field's type. */
export function FilterOperatorPicker({
  field,
  getOperatorLabel = getFilterOperatorLabel,
  listLabel = "Operators",
  onSelect,
  selectedKey,
  value,
}: FilterOperatorPickerProps) {
  const items = getFilterOperators(field).map((operator) => ({
    id: operator.id,
    label: getOperatorLabel(operator, value),
  }));

  return (
    <ListBox
      aria-label={listLabel}
      // eslint-disable-next-line jsx-a11y/no-autofocus -- Opened on demand.
      autoFocus="first"
      data-slot="filter-operator-picker"
      items={items}
      className={filterListBoxClasses}
      onAction={(key) => {
        onSelect(String(key));
      }}
    >
      {(item) => (
        <ListBoxItem
          id={item.id}
          textValue={item.label}
          className={filterListItemClassNames()}
        >
          <span aria-hidden="true" className={filterListIndicatorClasses}>
            {item.id === selectedKey ? <CheckIcon /> : null}
          </span>
          <span className="min-w-0 truncate">{item.label}</span>
        </ListBoxItem>
      )}
    </ListBox>
  );
}

export interface FilterValueEditorProps<TData = unknown> {
  field: FilterField<TData>;
  value?: FilterValue;
  onValueChange: (value: FilterValue | undefined) => void;
  /** Called when the user confirms the value, e.g. Enter in a text field. */
  onCommit?: () => void;
  /** Closes the surrounding editor, e.g. on Escape. */
  onClose?: () => void;
  searchLabel?: string;
  emptyLabel?: ReactNode;
  textLabel?: string;
  textPlaceholder?: string;
}

function toKeys(value: FilterValue | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  return value === undefined || value === "" ? [] : [String(value)];
}

/** Value input for a field: text box for text, checklist for options. */
export function FilterValueEditor<TData>({
  emptyLabel = "No results.",
  field,
  onClose,
  onCommit,
  onValueChange,
  searchLabel,
  textLabel,
  textPlaceholder,
  value,
}: FilterValueEditorProps<TData>) {
  const { contains } = useFilter({ sensitivity: "base" });

  if (field.type === "text") {
    return (
      <div data-slot="filter-value-editor" className={filterEditorStackClasses}>
        <Input
          // Popover editors open on demand, so moving focus in is expected.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          aria-label={textLabel ?? `${field.label} value`}
          controlSize="sm"
          placeholder={textPlaceholder ?? field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            const next = event.currentTarget.value;

            onValueChange(next === "" ? undefined : next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onCommit?.();
            }
          }}
        />
      </div>
    );
  }

  const options = field.options ?? [];
  const selected = toKeys(value);

  return (
    <div
      data-slot="filter-value-editor"
      className={filterEditorStackClasses}
      onKeyDownCapture={closeOnEmptyEscape(onClose)}
    >
      <Autocomplete filter={contains}>
        <SearchInput label={searchLabel ?? `Search ${field.label}`} />
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
            <div className={filterListEmptyClasses}>{emptyLabel}</div>
          )}
          onSelectionChange={(keys: Selection) => {
            const next =
              keys === "all"
                ? options.map((option) => option.value)
                : options
                    .map((option) => option.value)
                    .filter((optionValue) => keys.has(optionValue));

            onValueChange(next.length > 0 ? next : undefined);
          }}
        >
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={[item.label, ...(item.keywords ?? [])].join(" ")}
              className={filterListItemClassNames({ className: "group" })}
            >
              <span aria-hidden="true" className={filterListCheckboxClasses}>
                <CheckIcon />
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
            </ListBoxItem>
          )}
        </ListBox>
      </Autocomplete>
    </div>
  );
}
