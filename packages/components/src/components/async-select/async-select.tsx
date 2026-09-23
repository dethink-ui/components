import {
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  forwardRef,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  type KeyboardEvent,
  useState,
} from "react";
import { Combobox, ComboboxItem, type ComboboxControlSize } from "../combobox";
import {
  MultiSelect,
  MultiSelectItem,
  type MultiSelectControlSize,
} from "../multi-select";
import { cn } from "../../utils/cn";

export type AsyncSelectValue = string;
export type AsyncSelectSelectionMode = "single" | "multiple";
export type AsyncSelectControlSize = ComboboxControlSize &
  MultiSelectControlSize;

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
  "grid w-full min-w-0 content-start gap-[var(--dt-space-2)]";

const asyncSelectStatusClasses =
  "min-h-10 rounded-md border border-border bg-muted/40 px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm leading-5 text-muted-foreground motion-safe:animate-feedback-in";

const asyncSelectErrorClasses =
  "min-h-10 rounded-md border border-destructive/30 bg-destructive/10 px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm leading-5 text-destructive motion-safe:animate-feedback-in";

const asyncSelectRetryClasses =
  "mt-[var(--dt-space-2)] inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-[var(--dt-space-2-5)] text-xs font-medium text-foreground outline-none motion-safe:transition-[background-color,border-color,color] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

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
            data-slot="async-select-retry"
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
      <div className="flex items-center gap-2">
        {state === "loading" ? (
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full border-2 border-current border-e-transparent motion-safe:animate-spin"
          />
        ) : null}
        <span>{message}</span>
      </div>
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
    defaultInputValue,
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
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const retryFocusPending = useRef(false);
  const isMultiple = selectionMode === "multiple";
  const valueControlled = value !== undefined;
  const inputControlled = inputValue !== undefined;
  const initialSingleValue = normalizeSingleValue(value ?? defaultValue);
  const initialMultipleValue = normalizeMultipleValue(value ?? defaultValue);
  const resultItems = useMemo(() => Array.from(items ?? []), [items]);
  const resolvedItems = useMemo(
    () => uniqueItems(resultItems, selectedItems),
    [resultItems, selectedItems],
  );
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open && retryFocusPending.current) {
      retryFocusPending.current = false;
      const frame = requestAnimationFrame(() =>
        rootRef.current
          ?.querySelector<HTMLButtonElement>('[data-slot="async-select-retry"]')
          ?.focus(),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);
  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === "Tab" &&
      !event.shiftKey &&
      open &&
      error &&
      onRetry &&
      !disabled &&
      !readOnly &&
      (event.target as HTMLElement).getAttribute("role") === "combobox"
    ) {
      // Tab leaves the popup and lands on its retry action in the field's feedback.
      retryFocusPending.current = true;
    }
  };
  const handleRetry =
    onRetry && !disabled && !readOnly
      ? () => {
          onRetry();
          requestAnimationFrame(() =>
            rootRef.current
              ?.querySelector<HTMLInputElement>('input[role="combobox"]')
              ?.focus(),
          );
        }
      : undefined;
  const initialSingleItem = initialSingleValue
    ? resolvedItems.find((item) => item.value === initialSingleValue)
    : undefined;
  const initialInputValue =
    defaultInputValue ??
    (!isMultiple && initialSingleValue
      ? itemTextValue(initialSingleItem ?? { value: initialSingleValue })
      : "");
  const [singleValue, setSingleValue] = useState<AsyncSelectValue | null>(
    initialSingleValue,
  );
  const [multipleValue, setMultipleValue] =
    useState<AsyncSelectValue[]>(initialMultipleValue);
  const [uncontrolledInputValue, setUncontrolledInputValue] =
    useState(initialInputValue);
  const committedValue = valueControlled
    ? normalizeSingleValue(value)
    : singleValue;
  const [previousValue, setPreviousValue] = useState(committedValue);
  const [editing, setEditing] = useState(defaultInputValue !== undefined);
  if (committedValue !== previousValue) {
    setPreviousValue(committedValue);
    setEditing(false);
  }
  const committedItem = resolvedItems.find(
    (item) => item.value === committedValue,
  );
  const selectedLabel =
    committedValue === null
      ? ""
      : itemTextValue(committedItem ?? { value: committedValue });
  const resolvedInputValue =
    inputValue ??
    (!isMultiple && !editing ? selectedLabel : uncontrolledInputValue);
  const asyncState = getAsyncState({
    error,
    inputValue: resolvedInputValue,
    itemsCount: resultItems.length,
    loading,
    minQueryLength,
  });
  const renderedItems = asyncState === "ready" ? resultItems : [];
  const showStatus =
    asyncState !== "empty" ||
    open ||
    (!invalid &&
      ariaInvalid !== true &&
      ariaInvalid !== "true" &&
      resolvedInputValue.trim().length > 0);
  const status = showStatus ? (
    <AsyncStatus
      error={error}
      errorMessage={emptyMessage}
      loadingMessage={loadingMessage}
      minQueryLength={minQueryLength}
      minQueryMessage={minQueryMessage}
      onRetry={handleRetry}
      retryLabel={retryLabel}
      state={asyncState}
    />
  ) : null;
  const handleInputChange = (nextValue: string) => {
    setEditing(true);
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
        onKeyDownCapture={handleKeyDownCapture}
        ref={rootRef}
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
          emptyMessage={open ? status : null}
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
          selectedItems={resolvedItems}
          shouldFilter={false}
          onOpenChange={setOpen}
          value={resolvedValue}
        >
          {(item) => (
            <MultiSelectItem value={item.value} textValue={itemTextValue(item)}>
              {itemLabel(item)}
            </MultiSelectItem>
          )}
        </MultiSelect>
        {!open ? status : null}
      </div>
    );
  }

  const resolvedValue = valueControlled
    ? normalizeSingleValue(value)
    : singleValue;
  const handleValueChange = (nextValue: AsyncSelectValue | null) => {
    const selected = resolvedItems.find((item) => item.value === nextValue);
    handleInputChange(
      nextValue === null ? "" : itemTextValue(selected ?? { value: nextValue }),
    );
    setEditing(false);
    if (!valueControlled) {
      setSingleValue(nextValue);
    }

    onValueChange?.(nextValue as AsyncSelectChangeValue<M>);
  };

  return (
    <div
      onKeyDownCapture={handleKeyDownCapture}
      ref={rootRef}
      data-slot={dataSlot ?? "async-select"}
      data-selection-mode="single"
      className={cn(asyncSelectRootClasses, className)}
    >
      <Combobox
        aria-invalid={ariaInvalid}
        allowsEmptyCollection
        onOpenChange={setOpen}
        popupContent={open ? status : null}
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
      {!open ? status : null}
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
