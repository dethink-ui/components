import {
  Button as AriaButton,
  ComboBox as AriaCombobox,
  FieldError,
  Input as AriaInput,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
  type ComboBoxProps as AriaComboboxProps,
  type ListBoxItemProps as AriaListBoxItemProps,
} from "react-aria-components";
import {
  Children,
  cloneElement,
  type ForwardedRef,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../utils/cn";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";

export type MultiSelectValue = string;
export type MultiSelectControlSize = "sm" | "md" | "lg";

export type MultiSelectItemData = {
  label?: ReactNode;
  textValue?: string;
  value: MultiSelectValue;
};

export interface MultiSelectProps<
  T extends MultiSelectItemData = MultiSelectItemData,
> extends Omit<
    AriaComboboxProps<T, "multiple">,
    | "children"
    | "className"
    | "defaultInputValue"
    | "defaultValue"
    | "disabledKeys"
    | "inputValue"
    | "isDisabled"
    | "isInvalid"
    | "isReadOnly"
    | "isRequired"
    | "items"
    | "menuTrigger"
    | "name"
    | "onChange"
    | "onInputChange"
    | "onOpenChange"
    | "placeholder"
    | "selectionMode"
    | "validationBehavior"
    | "value"
  > {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "data-slot"?: string;
  children?: ReactNode | ((item: T) => ReactNode);
  className?: string;
  clearLabel?: string;
  controlSize?: MultiSelectControlSize;
  defaultInputValue?: string;
  defaultValue?: MultiSelectValue[];
  description?: ReactNode;
  disabled?: boolean;
  disabledKeys?: Iterable<MultiSelectValue>;
  emptyMessage?: ReactNode;
  errorMessage?: ReactNode;
  inputValue?: string;
  invalid?: boolean;
  items?: Iterable<T>;
  label?: ReactNode;
  name?: string;
  onInputValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: MultiSelectValue[]) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  selectedItems?: Iterable<T>;
  selectedLabel?: string;
  value?: MultiSelectValue[];
}

export interface MultiSelectItemProps
  extends Omit<
    AriaListBoxItemProps<MultiSelectItemData>,
    "children" | "className" | "id" | "isDisabled" | "value"
  > {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  value: MultiSelectValue;
}

type MultiSelectResolvedItem = {
  label: ReactNode;
  textValue: string;
  value: MultiSelectValue;
};

const multiSelectRootBaseClasses =
  "group/multi-select grid w-full min-w-0 gap-[var(--dt-space-2)] text-foreground";

const multiSelectLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60 data-[invalid=true]:text-destructive";

const multiSelectControlBaseClasses =
  "flex w-full min-w-0 items-center gap-[var(--dt-space-2)] rounded-md border border-input bg-background text-foreground shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color] motion-safe:duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[readonly=true]:bg-muted/40 data-[readonly=true]:text-muted-foreground group-data-[open]/multi-select:border-ring";

const multiSelectControlSizeClasses: Record<MultiSelectControlSize, string> = {
  sm: "min-h-8 px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-base sm:text-sm",
  md: "min-h-density-control px-[var(--dt-space-2-5)] py-[var(--dt-space-1)] text-base sm:text-sm",
  lg: "min-h-11 px-[var(--dt-space-3)] py-[var(--dt-space-1-5)] text-base",
};

const multiSelectValueClasses =
  "flex min-w-0 flex-1 flex-wrap items-center gap-[var(--dt-space-1-5)]";

const multiSelectPlaceholderClasses =
  "truncate text-muted-foreground";

const multiSelectInputClasses =
  "min-w-[7rem] flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 read-only:text-muted-foreground";

const multiSelectChipClasses =
  "inline-flex max-w-full items-center gap-[var(--dt-space-1)] rounded-sm border border-border bg-muted px-[var(--dt-space-1-5)] py-0.5 text-xs font-medium leading-5 text-foreground";

const multiSelectChipTextClasses = "min-w-0 truncate";

const multiSelectChipRemoveClasses =
  "inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none motion-safe:transition-[background-color,color] motion-safe:duration-150 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const multiSelectTriggerClasses =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[hovered]:bg-muted data-[hovered]:text-foreground data-[pressed]:translate-y-px data-[pressed]:bg-muted";

const multiSelectClearClasses =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none motion-safe:transition-[background-color,color] motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const multiSelectIconClasses =
  "size-4 motion-safe:transition-transform motion-safe:duration-150 group-data-[open]/multi-select:rotate-180";

const multiSelectHelpClasses = "text-xs leading-5 text-muted-foreground";

const multiSelectErrorClasses =
  "text-xs font-medium leading-5 text-destructive";

const multiSelectPopoverClasses =
  "z-50 max-h-80 min-w-[var(--trigger-width)] overflow-hidden rounded-md border border-border bg-background text-foreground shadow-lg outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:translate-y-1 data-[exiting]:opacity-0";

const multiSelectListBoxClasses =
  "max-h-64 overflow-auto p-[var(--dt-space-1)] outline-none";

const multiSelectItemBaseClasses =
  "grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[pressed]:bg-muted/80 data-[selected]:bg-primary/15 data-[selected]:text-foreground";

const multiSelectItemIndicatorClasses =
  "flex size-4 items-center justify-center text-primary";

const multiSelectItemContentClasses = "min-w-0 truncate";

const multiSelectEmptyClasses =
  "px-[var(--dt-space-3)] py-[var(--dt-space-4)] text-sm text-muted-foreground";

const multiSelectSrOnlyClasses =
  "sr-only";

type MultiSelectComponent = (<
  T extends MultiSelectItemData = MultiSelectItemData,
>(
  props: MultiSelectProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

function isAriaInvalid(value: MultiSelectProps["aria-invalid"]) {
  return value === true || value === "true" || value === "grammar" || value === "spelling";
}

function toDisabledKeys(disabledKeys: Iterable<MultiSelectValue> | undefined) {
  return disabledKeys ? Array.from(disabledKeys) : undefined;
}

function toPlainText(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toPlainText).join(" ");
  }

  return "";
}

function getItemLabel(item: MultiSelectItemData) {
  return item.label ?? item.textValue ?? item.value;
}

function getItemTextValue(item: MultiSelectItemData) {
  return item.textValue ?? (toPlainText(item.label) || item.value);
}

function collectDataItems<T extends MultiSelectItemData>(
  items: Iterable<T> | undefined,
) {
  if (!items) {
    return [];
  }

  return Array.from(items, (item) => ({
    label: getItemLabel(item),
    textValue: getItemTextValue(item),
    value: item.value,
  }));
}

function collectStaticItems(children: ReactNode): MultiSelectResolvedItem[] {
  const collected: MultiSelectResolvedItem[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<MultiSelectItemProps>(child)) {
      return;
    }

    const { children: itemChildren, textValue, value } = child.props;

    if (!value) {
      return;
    }

    collected.push({
      label: itemChildren ?? textValue ?? value,
      textValue: textValue ?? (toPlainText(itemChildren) || value),
      value,
    });
  });

  return collected;
}

function filterItems<T extends MultiSelectItemData>({
  inputValue,
  items,
}: {
  inputValue: string;
  items: T[];
}) {
  const query = inputValue.trim().toLocaleLowerCase();

  if (!query) {
    return items;
  }

  return items.filter((item) =>
    getItemTextValue(item).toLocaleLowerCase().includes(query),
  );
}

function filterStaticChildren({
  children,
  inputValue,
}: {
  children: ReactNode;
  inputValue: string;
}) {
  const query = inputValue.trim().toLocaleLowerCase();

  if (!query) {
    return children;
  }

  return Children.toArray(children).filter((child) => {
    if (!isValidElement<MultiSelectItemProps>(child)) {
      return true;
    }

    const { children: itemChildren, textValue, value } = child.props;
    const candidate = textValue ?? (toPlainText(itemChildren) || value);

    return candidate.toLocaleLowerCase().includes(query);
  });
}

function renderMultiSelectChildren<T extends MultiSelectItemData>({
  children,
  inputValue,
  items,
  onItemAction,
}: Pick<MultiSelectProps<T>, "children" | "items"> & {
  inputValue: string;
  onItemAction: (value: MultiSelectValue) => void;
}) {
  if (items && typeof children === "function") {
    return filterItems({ inputValue, items: Array.from(items) }).map((item) => {
      const child = children(item);

      if (isValidElement(child)) {
        const typedChild = child as ReactElement<MultiSelectItemProps>;
        const existingOnAction = typedChild.props.onAction;

        return cloneElement(typedChild, {
          key: child.key ?? item.value,
          onAction: () => {
            existingOnAction?.();
            onItemAction(item.value);
          },
        });
      }

      return child;
    });
  }

  return Children.toArray(
    filterStaticChildren({
      children: children as ReactNode,
      inputValue,
    }),
  ).map((child) => {
    if (!isValidElement<MultiSelectItemProps>(child)) {
      return child;
    }

    const existingOnAction = child.props.onAction;

    return cloneElement(child, {
      onAction: () => {
        existingOnAction?.();
        onItemAction(child.props.value);
      },
    });
  });
}

function syncAriaInvalidAttribute(
  element: HTMLElement | null,
  value: MultiSelectProps["aria-invalid"],
) {
  if (!element) {
    return;
  }

  if (value === undefined) {
    element.removeAttribute("aria-invalid");
    return;
  }

  element.setAttribute("aria-invalid", String(value));
}

export function multiSelectClassNames({
  className,
}: Pick<MultiSelectProps, "className"> = {}) {
  return cn(multiSelectRootBaseClasses, className);
}

export function multiSelectItemClassNames({
  className,
}: Pick<MultiSelectItemProps, "className"> = {}) {
  return cn(multiSelectItemBaseClasses, className);
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-full"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m3.5 8 3 3 6-6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function MultiSelectRoot<T extends MultiSelectItemData = MultiSelectItemData>(
  {
    "aria-invalid": ariaInvalid,
    "data-slot": dataSlot,
    children,
    className,
    clearLabel = "Clear selected options",
    controlSize = "md",
    defaultInputValue = "",
    defaultValue = [],
    description,
    disabled = false,
    disabledKeys,
    emptyMessage = "No options found.",
    errorMessage,
    inputValue,
    invalid = false,
    items,
    label,
    name,
    onInputValueChange,
    onOpenChange,
    onValueChange,
    placeholder = "Select options",
    readOnly = false,
    required = false,
    searchLabel,
    searchPlaceholder = "Search options",
    selectedItems,
    selectedLabel,
    value,
    ...props
  }: MultiSelectProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);
  const resolvedAriaInvalid = invalid ? true : ariaInvalid;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] =
    useState<MultiSelectValue[]>(defaultValue);
  const selectedValues = value ?? uncontrolledValue;
  const inputControlled = inputValue !== undefined;
  const [uncontrolledInputValue, setUncontrolledInputValue] =
    useState(defaultInputValue);
  const resolvedInputValue = inputValue ?? uncontrolledInputValue;
  const dataItems = collectDataItems(items);
  const selectedDataItems = collectDataItems(selectedItems);
  const staticItems = useMemo(
    () =>
      typeof children === "function"
        ? []
        : collectStaticItems(children as ReactNode),
    [children],
  );
  const resolvedItems = [
    ...(dataItems.length > 0 ? dataItems : staticItems),
    ...selectedDataItems,
  ];
  const itemLookup = useMemo(() => {
    const map = new Map<MultiSelectValue, MultiSelectResolvedItem>();

    for (const item of resolvedItems) {
      map.set(item.value, item);
    }

    return map;
  }, [resolvedItems]);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const { portalContainer, rootRef } =
    useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "multi-select-portal-container",
    });
  const setControlRef = useCallback(
    (node: HTMLDivElement | null) => {
      controlRef.current = node;
      syncAriaInvalidAttribute(node, resolvedAriaInvalid);
    },
    [resolvedAriaInvalid],
  );
  const selectedCount = selectedValues.length;
  const resolvedSelectedLabel =
    selectedLabel ?? `${selectedCount} option${selectedCount === 1 ? "" : "s"} selected`;
  const disabledOrReadOnly = disabled || readOnly;
  const updateValue = useCallback(
    (nextValue: MultiSelectValue[]) => {
      if (readOnly) {
        return;
      }

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange, readOnly],
  );
  const toggleValue = useCallback(
    (selectedValue: MultiSelectValue) => {
      if (selectedValues.includes(selectedValue)) {
        updateValue(
          selectedValues.filter((currentValue) =>
            currentValue !== selectedValue,
          ),
        );
        return;
      }

      updateValue([...selectedValues, selectedValue]);
    },
    [selectedValues, updateValue],
  );
  const renderedChildren = renderMultiSelectChildren({
    children,
    inputValue: resolvedInputValue,
    items,
    onItemAction: toggleValue,
  });
  const renderedChildrenCount = Children.count(renderedChildren);

  useEffect(() => {
    syncAriaInvalidAttribute(controlRef.current, resolvedAriaInvalid);
  }, [resolvedAriaInvalid]);

  return (
    <DethinkPortalProvider container={portalContainer}>
      <AriaCombobox<T, "multiple">
        {...props}
        ref={rootRef}
        value={selectedValues}
        selectionMode="multiple"
        inputValue={resolvedInputValue}
        onInputChange={(nextValue) => {
          if (!inputControlled) {
            setUncontrolledInputValue(nextValue);
          }

          onInputValueChange?.(nextValue);
        }}
        onOpenChange={(isOpen) => {
          if (!readOnly) {
            onOpenChange?.(isOpen);
          }
        }}
        disabledKeys={toDisabledKeys(disabledKeys)}
        isDisabled={disabled}
        isReadOnly={readOnly}
        isRequired={required}
        isInvalid={resolvedInvalid}
        aria-invalid={resolvedAriaInvalid}
        menuTrigger="manual"
        allowsEmptyCollection
        validationBehavior="aria"
        data-slot={dataSlot ?? "multi-select"}
        data-size={controlSize}
        data-readonly={readOnly ? "true" : undefined}
        className={multiSelectClassNames({ className })}
      >
        {label ? (
          <Label
            data-slot="multi-select-label"
            data-disabled={disabled ? "true" : undefined}
            data-invalid={resolvedInvalid ? "true" : undefined}
            data-required={required ? "true" : undefined}
            className={multiSelectLabelClasses}
          >
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </Label>
        ) : null}
        <div
          ref={setControlRef}
          aria-invalid={resolvedAriaInvalid}
          data-slot="multi-select-control"
          data-size={controlSize}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          className={cn(
            multiSelectControlBaseClasses,
            multiSelectControlSizeClasses[controlSize],
          )}
        >
          <div
            aria-label={resolvedSelectedLabel}
            data-slot="multi-select-value"
            className={multiSelectValueClasses}
          >
            {selectedValues.length > 0 ? (
              selectedValues.map((selectedValue) => {
                const item = itemLookup.get(selectedValue);
                const labelNode = item?.label ?? selectedValue;
                const textValue = item?.textValue ?? selectedValue;

                return (
                  <span
                    key={selectedValue}
                    data-slot="multi-select-chip"
                    data-value={selectedValue}
                    className={multiSelectChipClasses}
                  >
                    <span
                      data-slot="multi-select-chip-text"
                      className={multiSelectChipTextClasses}
                    >
                      {labelNode}
                    </span>
                    <button
                      aria-label={`Remove ${textValue}`}
                      className={multiSelectChipRemoveClasses}
                      disabled={disabledOrReadOnly}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        updateValue(
                          selectedValues.filter((currentValue) =>
                            currentValue !== selectedValue,
                          ),
                        );
                      }}
                      type="button"
                    >
                      <XIcon />
                    </button>
                  </span>
                );
              })
            ) : (
              <span
                data-slot="multi-select-placeholder"
                className={multiSelectPlaceholderClasses}
              >
                {placeholder}
              </span>
            )}
            <AriaInput
              aria-invalid={resolvedAriaInvalid}
              data-slot="multi-select-input"
              data-size={controlSize}
              placeholder={selectedValues.length > 0 ? searchPlaceholder : placeholder}
              className={multiSelectInputClasses}
            />
          </div>
          {selectedValues.length > 0 ? (
            <button
              aria-label={clearLabel}
              className={multiSelectClearClasses}
              disabled={disabledOrReadOnly}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                updateValue([]);
              }}
              type="button"
            >
              <XIcon />
            </button>
          ) : null}
          <AriaButton
            aria-label="Show options"
            data-slot="multi-select-trigger"
            className={multiSelectTriggerClasses}
          >
            <span
              aria-hidden="true"
              data-slot="multi-select-icon"
              className={multiSelectIconClasses}
            >
              <ChevronDownIcon />
            </span>
          </AriaButton>
        </div>
        {name && !disabled ? (
          selectedValues.map((selectedValue) => (
            <input
              key={selectedValue}
              name={name}
              type="hidden"
              value={selectedValue}
            />
          ))
        ) : null}
        <span
          aria-live="polite"
          data-slot="multi-select-status"
          className={multiSelectSrOnlyClasses}
        >
          {resolvedSelectedLabel}
        </span>
        {description ? (
          <Text
            slot="description"
            data-slot="multi-select-description"
            className={multiSelectHelpClasses}
          >
            {description}
          </Text>
        ) : null}
        {errorMessage ? (
          <FieldError
            data-slot="multi-select-error"
            className={multiSelectErrorClasses}
          >
            {errorMessage}
          </FieldError>
        ) : null}
        <Popover
          triggerRef={controlRef}
          data-slot="multi-select-popover"
          className={multiSelectPopoverClasses}
        >
          {renderedChildrenCount > 0 ? (
            <ListBox
              aria-label={searchLabel ?? `Options for ${toPlainText(label) || "multi-select"}`}
              data-slot="multi-select-listbox"
              className={multiSelectListBoxClasses}
            >
              {renderedChildren}
            </ListBox>
          ) : (
            <div
              data-slot="multi-select-empty"
              className={multiSelectEmptyClasses}
            >
              {emptyMessage}
            </div>
          )}
        </Popover>
      </AriaCombobox>
    </DethinkPortalProvider>
  );
}

export const MultiSelect = forwardRef(MultiSelectRoot) as MultiSelectComponent;

MultiSelect.displayName = "MultiSelect";

export const MultiSelectItem = forwardRef<HTMLDivElement, MultiSelectItemProps>(
  (
    {
      children,
      className,
      disabled = false,
      textValue,
      value,
      ...props
    },
    ref,
  ) => (
    <ListBoxItem
      {...props}
      ref={ref}
      id={value}
      isDisabled={disabled}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      data-slot="multi-select-item"
      data-value={value}
      className={multiSelectItemClassNames({ className })}
    >
      {({ isSelected }) => (
        <>
          <span
            aria-hidden="true"
            data-slot="multi-select-item-indicator"
            data-selected={isSelected ? "true" : undefined}
            className={multiSelectItemIndicatorClasses}
          >
            {isSelected ? <CheckIcon /> : null}
          </span>
          <span
            data-slot="multi-select-item-content"
            className={multiSelectItemContentClasses}
          >
            {children}
          </span>
        </>
      )}
    </ListBoxItem>
  ),
);

MultiSelectItem.displayName = "MultiSelectItem";
