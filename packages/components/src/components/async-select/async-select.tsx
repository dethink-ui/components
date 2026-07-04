import {
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  forwardRef,
  useMemo,
  useState,
} from "react";
import {
  Combobox,
  ComboboxItem,
  type ComboboxControlSize,
} from "../combobox";
import {
  MultiSelect,
  MultiSelectItem,
  type MultiSelectControlSize,
} from "../multi-select";
import { cn } from "../../utils/cn";

export type AsyncSelectValue = string;
export type AsyncSelectSelectionMode = "single" | "multiple";
export type AsyncSelectControlSize = ComboboxControlSize & MultiSelectControlSize;

export type AsyncSelectItemData = {
  label?: ReactNode;
  textValue?: string;
  value: AsyncSelectValue;
};

export type AsyncSelectChangeValue<M extends AsyncSelectSelectionMode> =
  M extends "multiple" ? AsyncSelectValue[] : AsyncSelectValue | null;

export interface AsyncSelectProps<
  T extends AsyncSelectItemData = AsyncSelectItemData,
  M extends AsyncSelectSelectionMode = "single",
> {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "data-slot"?: string;
  className?: string;
  clearLabel?: string;
  controlSize?: AsyncSelectControlSize;
  defaultInputValue?: string;
  defaultValue?: AsyncSelectChangeValue<M>;
  description?: ReactNode;
  disabled?: boolean;
  disabledKeys?: Iterable<AsyncSelectValue>;
  emptyMessage?: ReactNode;
  error?: ReactNode;
  errorMessage?: ReactNode;
  inputValue?: string;
  invalid?: boolean;
  items?: Iterable<T>;
  label?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  minQueryLength?: number;
  minQueryMessage?: ReactNode;
  name?: string;
  onInputValueChange?: (value: string) => void;
  onRetry?: () => void;
  onValueChange?: (value: AsyncSelectChangeValue<M>) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  retryLabel?: string;
  searchPlaceholder?: string;
  selectedItems?: Iterable<T>;
  selectionMode?: M;
  value?: AsyncSelectChangeValue<M>;
}

const asyncSelectRootClasses =
  "grid w-full min-w-0 gap-[var(--dt-space-2)]";

const asyncSelectStatusClasses =
  "rounded-md border border-border bg-muted/40 px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm leading-5 text-muted-foreground";

const asyncSelectErrorClasses =
  "rounded-md border border-destructive/30 bg-destructive/10 px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm leading-5 text-destructive";

const asyncSelectRetryClasses =
  "mt-[var(--dt-space-2)] inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-[var(--dt-space-2-5)] text-xs font-medium text-foreground outline-none motion-safe:transition-[background-color,border-color,color] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

type AsyncSelectComponent = (<
  T extends AsyncSelectItemData = AsyncSelectItemData,
  M extends AsyncSelectSelectionMode = "single",
>(
  props: AsyncSelectProps<T, M> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

function itemLabel(item: AsyncSelectItemData) {
  return item.label ?? item.textValue ?? item.value;
}

function itemTextValue(item: AsyncSelectItemData) {
  if (item.textValue) {
    return item.textValue;
  }

  return typeof item.label === "string" ? item.label : item.value;
}

function uniqueItems<T extends AsyncSelectItemData>(
  items: Iterable<T> | undefined,
  selectedItems: Iterable<T> | undefined,
) {
  const map = new Map<AsyncSelectValue, T>();

  for (const item of selectedItems ?? []) {
    map.set(item.value, item);
  }

  for (const item of items ?? []) {
    map.set(item.value, item);
  }

  return Array.from(map.values());
}

function normalizeSingleValue(value: unknown): AsyncSelectValue | null {
  return typeof value === "string" ? value : null;
}

function normalizeMultipleValue(value: unknown): AsyncSelectValue[] {
  return Array.isArray(value) ? value : [];
}

function getAsyncState({
  error,
  inputValue,
  itemsCount,
  loading,
  minQueryLength,
}: {
  error?: ReactNode;
  inputValue: string;
  itemsCount: number;
  loading?: boolean;
  minQueryLength: number;
}) {
  if (error) {
    return "error";
  }

  if (loading) {
    return "loading";
  }

  if (minQueryLength > 0 && inputValue.trim().length < minQueryLength) {
    return "min-query";
  }

  if (itemsCount === 0) {
    return "empty";
  }

  return "ready";
}

function AsyncStatus({
  error,
  errorMessage,
  loadingMessage,
  minQueryLength,
  minQueryMessage,
  onRetry,
  retryLabel,
  state,
}: {
  error?: ReactNode;
  errorMessage: ReactNode;
  loadingMessage: ReactNode;
  minQueryLength: number;
  minQueryMessage: ReactNode;
  onRetry?: () => void;
  retryLabel: string;
  state: "empty" | "error" | "loading" | "min-query" | "ready";
}) {
  if (state === "ready") {
    return null;
  }

  if (state === "error") {
    return (
      <div
        role="alert"
        data-slot="async-select-status"
        data-state="error"
        className={asyncSelectErrorClasses}
      >
        <div>{error ?? errorMessage}</div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={asyncSelectRetryClasses}
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  const message =
    state === "loading"
      ? loadingMessage
      : state === "min-query"
        ? minQueryMessage || `Type at least ${minQueryLength} characters.`
        : errorMessage;

  return (
    <div
      role="status"
      data-slot="async-select-status"
      data-state={state}
      className={asyncSelectStatusClasses}
    >
      {message}
    </div>
  );
}

function AsyncSelectRoot<
  T extends AsyncSelectItemData = AsyncSelectItemData,
  M extends AsyncSelectSelectionMode = "single",
>(
  {
    "aria-invalid": ariaInvalid,
    "data-slot": dataSlot,
    className,
    clearLabel,
    controlSize = "md",
    defaultInputValue = "",
    defaultValue,
    description,
    disabled = false,
    disabledKeys,
    emptyMessage = "No results found.",
    error,
    errorMessage,
    inputValue,
    invalid = false,
    items,
    label,
    loading = false,
    loadingMessage = "Loading options...",
    minQueryLength = 0,
    minQueryMessage,
    name,
    onInputValueChange,
    onRetry,
    onValueChange,
    placeholder = "Search options",
    readOnly = false,
    required = false,
    retryLabel = "Retry",
    searchPlaceholder,
    selectedItems,
    selectionMode,
    value,
  }: AsyncSelectProps<T, M>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const isMultiple = selectionMode === "multiple";
  const valueControlled = value !== undefined;
  const inputControlled = inputValue !== undefined;
  const [singleValue, setSingleValue] = useState<AsyncSelectValue | null>(
    normalizeSingleValue(defaultValue),
  );
  const [multipleValue, setMultipleValue] = useState<AsyncSelectValue[]>(
    normalizeMultipleValue(defaultValue),
  );
  const [uncontrolledInputValue, setUncontrolledInputValue] =
    useState(defaultInputValue);
  const resolvedInputValue = inputValue ?? uncontrolledInputValue;
  const resolvedItems = useMemo(
    () => uniqueItems(items, selectedItems),
    [items, selectedItems],
  );
  const asyncState = getAsyncState({
    error,
    inputValue: resolvedInputValue,
    itemsCount: Array.from(items ?? []).length,
    loading,
    minQueryLength,
  });
  const renderedItems = asyncState === "ready" ? resolvedItems : [];
  const status = (
    <AsyncStatus
      error={error}
      errorMessage={emptyMessage}
      loadingMessage={loadingMessage}
      minQueryLength={minQueryLength}
      minQueryMessage={minQueryMessage}
      onRetry={onRetry}
      retryLabel={retryLabel}
      state={asyncState}
    />
  );
  const handleInputChange = (nextValue: string) => {
    if (!inputControlled) {
      setUncontrolledInputValue(nextValue);
    }

    onInputValueChange?.(nextValue);
  };

  if (isMultiple) {
    const resolvedValue = valueControlled
      ? normalizeMultipleValue(value)
      : multipleValue;
    const handleValueChange = (nextValue: AsyncSelectValue[]) => {
      if (!valueControlled) {
        setMultipleValue(nextValue);
      }

      onValueChange?.(nextValue as AsyncSelectChangeValue<M>);
    };

    return (
      <div
        ref={ref}
        data-slot={dataSlot ?? "async-select"}
        data-selection-mode="multiple"
        className={cn(asyncSelectRootClasses, className)}
      >
        <MultiSelect
          aria-invalid={ariaInvalid}
          clearLabel={clearLabel}
          controlSize={controlSize}
          description={description}
          disabled={disabled}
          disabledKeys={disabledKeys}
          emptyMessage={status}
          errorMessage={errorMessage}
          inputValue={resolvedInputValue}
          invalid={invalid}
          items={renderedItems}
          label={label}
          name={name}
          onInputValueChange={handleInputChange}
          onValueChange={handleValueChange}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          searchPlaceholder={searchPlaceholder}
          selectedItems={selectedItems}
          value={resolvedValue}
        >
          {(item) => (
            <MultiSelectItem value={item.value} textValue={itemTextValue(item)}>
              {itemLabel(item)}
            </MultiSelectItem>
          )}
        </MultiSelect>
      </div>
    );
  }

  const resolvedValue = valueControlled ? normalizeSingleValue(value) : singleValue;
  const handleValueChange = (nextValue: AsyncSelectValue | null) => {
    if (!valueControlled) {
      setSingleValue(nextValue);
    }

    onValueChange?.(nextValue as AsyncSelectChangeValue<M>);
  };

  return (
    <div
      ref={ref}
      data-slot={dataSlot ?? "async-select"}
      data-selection-mode="single"
      className={cn(asyncSelectRootClasses, className)}
    >
      <Combobox
        aria-invalid={ariaInvalid}
        allowsEmptyCollection
        controlSize={controlSize}
        description={description}
        disabled={disabled}
        disabledKeys={disabledKeys}
        errorMessage={errorMessage}
        inputValue={resolvedInputValue}
        invalid={invalid}
        items={renderedItems}
        label={label}
        name={name}
        onInputValueChange={handleInputChange}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        value={resolvedValue}
      >
        {(item) => (
          <ComboboxItem value={item.value} textValue={itemTextValue(item)}>
            {itemLabel(item)}
          </ComboboxItem>
        )}
      </Combobox>
      {status}
    </div>
  );
}

export const AsyncSelect = forwardRef(AsyncSelectRoot) as AsyncSelectComponent;

AsyncSelect.displayName = "AsyncSelect";

export function asyncSelectClassNames({
  className,
}: Pick<AsyncSelectProps, "className"> = {}) {
  return cn(asyncSelectRootClasses, className);
}
