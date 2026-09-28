import {
  Autocomplete,
  Input as AriaInput,
  ListBox,
  ListBoxItem,
  SearchField,
  useFilter,
} from "react-aria-components";
import { useEffect, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { inputClassNames } from "../input";
import { getFilterOperatorLabel, getFilterOperators } from "./filter-core";
import type {
  FilterField,
  FilterOperatorDefinition,
  FilterValue,
} from "./filter-types";

export const filterListBoxClasses =
  "max-h-64 min-w-0 overflow-auto outline-none";

export const filterListItemClasses =
  "grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm text-foreground outline-none motion-safe:transition-[background-color,color] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[pressed]:bg-muted/80";

export const filterListIndicatorClasses =
  "flex size-4 items-center justify-center text-foreground";

export const filterListCheckboxClasses =
  "flex size-4 items-center justify-center rounded-[4px] border border-input bg-background text-primary-foreground group-data-[selected]:border-primary group-data-[selected]:bg-primary [&>svg]:invisible group-data-[selected]:[&>svg]:visible";

export const filterListEmptyClasses =
  "px-[var(--dt-space-2)] py-[var(--dt-space-3)] text-sm text-muted-foreground";

export const filterEditorStackClasses = "grid min-w-0 gap-[var(--dt-space-2)]";

/**
 * Autocomplete spends the first Escape clearing its virtual focus. Close the
 * editor straight away instead when the search box is empty.
 */
export function closeOnEmptyEscape(onClose: (() => void) | undefined) {
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

export function CheckIcon() {
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

export function SearchInput({ label }: { label: string }) {
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

/**
 * Focuses an element after the popover has registered as the top overlay. A
 * native autoFocus fires first and, inside a group editor's popover, reads as
 * an outside interaction that dismisses both popovers.
 */
export function useDeferredFocus(
  ref: { current: HTMLElement | null },
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      ref.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, ref]);
}
