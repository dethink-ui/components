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
  type Key,
  type ListBoxItemProps as AriaListBoxItemProps,
} from "react-aria-components";
import {
  cloneElement,
  type ForwardedRef,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { cn } from "../../utils/cn";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";

export type ComboboxValue = string;
export type ComboboxControlSize = "sm" | "md" | "lg";
export type ComboboxFormValue = "key" | "text";
export type ComboboxMenuTrigger = "focus" | "input" | "manual";

export type ComboboxItemData = {
  label?: ReactNode;
  textValue?: string;
  value: ComboboxValue;
};

export interface ComboboxProps<
  T extends ComboboxItemData = ComboboxItemData,
> extends Omit<
  AriaComboboxProps<T, "single">,
  | "children"
  | "className"
  | "defaultInputValue"
  | "defaultItems"
  | "defaultSelectedKey"
  | "defaultValue"
  | "disabledKeys"
  | "formValue"
  | "inputValue"
  | "isDisabled"
  | "isInvalid"
  | "isReadOnly"
  | "isRequired"
  | "items"
  | "label"
  | "menuTrigger"
  | "onChange"
  | "onInputChange"
  | "onOpenChange"
  | "onSelectionChange"
  | "placeholder"
  | "selectedKey"
  | "selectionMode"
  | "validationBehavior"
  | "value"
> {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "data-slot"?: string;
  children?: ReactNode | ((item: T) => ReactNode);
  className?: string;
  controlSize?: ComboboxControlSize;
  defaultInputValue?: string;
  defaultItems?: Iterable<T>;
  defaultValue?: ComboboxValue | null;
  description?: ReactNode;
  disabled?: boolean;
  disabledKeys?: Iterable<ComboboxValue>;
  errorMessage?: ReactNode;
  formValue?: ComboboxFormValue;
  inputValue?: string;
  invalid?: boolean;
  items?: Iterable<T>;
  label?: ReactNode;
  menuTrigger?: ComboboxMenuTrigger;
  onInputValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean, trigger?: ComboboxMenuTrigger) => void;
  onValueChange?: (value: ComboboxValue | null) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: ComboboxValue | null;
}

export interface ComboboxItemProps extends Omit<
  AriaListBoxItemProps<ComboboxItemData>,
  "children" | "className" | "id" | "isDisabled" | "value"
> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  value: ComboboxValue;
}

const comboboxRootBaseClasses =
  "group/combobox grid w-full min-w-0 gap-[var(--dt-space-2)] text-foreground";

const comboboxLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60 data-[invalid=true]:text-destructive";

const comboboxControlBaseClasses =
  "flex w-full min-w-0 items-center gap-[var(--dt-space-2)] rounded-md border border-input bg-background text-foreground shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color] motion-safe:duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[readonly=true]:bg-muted/40 data-[readonly=true]:text-muted-foreground group-data-[open]/combobox:border-ring";

const comboboxControlSizeClasses: Record<ComboboxControlSize, string> = {
  sm: "h-8 ps-[var(--dt-space-2-5)] pe-[var(--dt-space-1)] text-base sm:text-sm",
  md: "h-density-control ps-[var(--dt-space-3)] pe-[var(--dt-space-1)] text-base sm:text-sm",
  lg: "h-11 ps-[var(--dt-space-4)] pe-[var(--dt-space-1)] text-base",
};

const comboboxInputClasses =
  "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 read-only:text-muted-foreground";

const comboboxButtonClasses =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none motion-safe:transition-[background-color,color,transform] motion-safe:duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[hovered]:bg-muted data-[hovered]:text-foreground data-[pressed]:translate-y-px data-[pressed]:bg-muted";

const comboboxIconClasses =
  "size-4 motion-safe:transition-transform motion-safe:duration-150 group-data-[open]/combobox:rotate-180";

const comboboxHelpClasses = "text-xs leading-5 text-muted-foreground";

const comboboxErrorClasses = "text-xs font-medium leading-5 text-destructive";

const comboboxPopoverClasses =
  "z-50 max-h-72 min-w-[var(--trigger-width)] overflow-hidden rounded-md border border-border bg-background text-foreground shadow-lg outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:translate-y-1 data-[exiting]:opacity-0";

const comboboxListBoxClasses =
  "max-h-72 overflow-auto p-[var(--dt-space-1)] outline-none";

const comboboxItemBaseClasses =
  "grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[pressed]:bg-muted/80 data-[selected]:bg-primary data-[selected]:text-primary-foreground";

const comboboxItemIndicatorClasses =
  "flex size-4 items-center justify-center text-current";

const comboboxItemContentClasses = "min-w-0 truncate";

type ComboboxComponent = (<T extends ComboboxItemData = ComboboxItemData>(
  props: ComboboxProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

function isAriaInvalid(value: ComboboxProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

function toSelectionKey(value: ComboboxValue | null | undefined) {
  return value ?? undefined;
}

function toDisabledKeys(disabledKeys: Iterable<ComboboxValue> | undefined) {
  return disabledKeys ? Array.from(disabledKeys) : undefined;
}

function syncAriaInvalidAttribute(
  element: HTMLElement | null,
  value: ComboboxProps["aria-invalid"],
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

export function comboboxClassNames({
  className,
}: Pick<ComboboxProps, "className"> = {}) {
  return cn(comboboxRootBaseClasses, className);
}

export function comboboxItemClassNames({
  className,
}: Pick<ComboboxItemProps, "className"> = {}) {
  return cn(comboboxItemBaseClasses, className);
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

function renderComboboxChildren<T extends ComboboxItemData>({
  children,
  defaultItems,
  items,
}: Pick<ComboboxProps<T>, "children" | "defaultItems" | "items">) {
  const sourceItems = items ?? defaultItems;

  if (sourceItems && typeof children === "function") {
    return Array.from(sourceItems, (item) => {
      const child = children(item);

      if (isValidElement(child)) {
        return cloneElement(child, {
          key: child.key ?? item.value,
        });
      }

      return child;
    });
  }

  return children as ReactNode;
}

function ComboboxRoot<T extends ComboboxItemData = ComboboxItemData>(
  {
    "aria-invalid": ariaInvalid,
    "data-slot": dataSlot,
    children,
    className,
    controlSize = "md",
    defaultInputValue,
    defaultItems,
    defaultValue,
    description,
    disabled = false,
    disabledKeys,
    errorMessage,
    formValue = "key",
    inputValue,
    invalid = false,
    items,
    label,
    menuTrigger = "input",
    name,
    onInputValueChange,
    onOpenChange,
    onValueChange,
    placeholder = "Search options",
    readOnly = false,
    required = false,
    value,
    ...props
  }: ComboboxProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);
  const resolvedAriaInvalid = invalid ? true : ariaInvalid;
  const renderedChildren = renderComboboxChildren({
    children,
    defaultItems,
    items,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
    forwardedRef: ref,
    portalSlot: "combobox-portal-container",
  });
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      syncAriaInvalidAttribute(node, resolvedAriaInvalid);
    },
    [resolvedAriaInvalid],
  );

  useEffect(() => {
    syncAriaInvalidAttribute(inputRef.current, resolvedAriaInvalid);
  }, [resolvedAriaInvalid]);

  return (
    <DethinkPortalProvider container={portalContainer}>
      <AriaCombobox
        {...props}
        ref={rootRef}
        selectedKey={toSelectionKey(value)}
        defaultSelectedKey={toSelectionKey(defaultValue)}
        name={disabled ? undefined : name}
        inputValue={inputValue}
        defaultInputValue={defaultInputValue}
        onInputChange={onInputValueChange}
        onOpenChange={(isOpen, trigger) => {
          if (!readOnly) {
            onOpenChange?.(isOpen, trigger);
          }
        }}
        onSelectionChange={(key: Key | null) => {
          if (!readOnly) {
            onValueChange?.(key === null ? null : String(key));
          }
        }}
        disabledKeys={toDisabledKeys(disabledKeys)}
        isDisabled={disabled}
        isReadOnly={readOnly}
        isRequired={required}
        isInvalid={resolvedInvalid}
        aria-invalid={resolvedAriaInvalid}
        menuTrigger={menuTrigger}
        formValue={formValue}
        validationBehavior="aria"
        data-slot={dataSlot ?? "combobox"}
        data-size={controlSize}
        data-readonly={readOnly ? "true" : undefined}
        className={comboboxClassNames({ className })}
      >
        {label ? (
          <Label
            data-slot="combobox-label"
            data-disabled={disabled ? "true" : undefined}
            data-invalid={resolvedInvalid ? "true" : undefined}
            data-required={required ? "true" : undefined}
            className={comboboxLabelClasses}
          >
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </Label>
        ) : null}
        <div
          data-slot="combobox-control"
          data-size={controlSize}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          className={cn(
            comboboxControlBaseClasses,
            comboboxControlSizeClasses[controlSize],
          )}
        >
          <AriaInput
            ref={setInputRef}
            aria-invalid={resolvedAriaInvalid}
            data-slot="combobox-input"
            data-size={controlSize}
            placeholder={placeholder}
            className={comboboxInputClasses}
          />
          <AriaButton
            aria-label="Show options"
            data-slot="combobox-button"
            className={comboboxButtonClasses}
          >
            <span
              aria-hidden="true"
              data-slot="combobox-icon"
              className={comboboxIconClasses}
            >
              <ChevronDownIcon />
            </span>
          </AriaButton>
        </div>
        {description ? (
          <Text
            slot="description"
            data-slot="combobox-description"
            className={comboboxHelpClasses}
          >
            {description}
          </Text>
        ) : null}
        {errorMessage ? (
          <FieldError
            data-slot="combobox-error"
            className={comboboxErrorClasses}
          >
            {errorMessage}
          </FieldError>
        ) : null}
        <Popover
          data-slot="combobox-popover"
          className={comboboxPopoverClasses}
        >
          <ListBox
            data-slot="combobox-listbox"
            className={comboboxListBoxClasses}
          >
            {renderedChildren}
          </ListBox>
        </Popover>
      </AriaCombobox>
    </DethinkPortalProvider>
  );
}

export const Combobox = forwardRef(ComboboxRoot) as ComboboxComponent;

Combobox.displayName = "Combobox";

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  (
    { children, className, disabled = false, textValue, value, ...props },
    ref,
  ) => (
    <ListBoxItem
      {...props}
      ref={ref}
      id={value}
      isDisabled={disabled}
      textValue={
        textValue ?? (typeof children === "string" ? children : undefined)
      }
      data-slot="combobox-item"
      data-value={value}
      className={comboboxItemClassNames({ className })}
    >
      {({ isSelected }) => (
        <>
          <span
            aria-hidden="true"
            data-slot="combobox-item-indicator"
            data-selected={isSelected ? "true" : undefined}
            className={comboboxItemIndicatorClasses}
          >
            {isSelected ? <CheckIcon /> : null}
          </span>
          <span
            data-slot="combobox-item-content"
            className={comboboxItemContentClasses}
          >
            {children}
          </span>
        </>
      )}
    </ListBoxItem>
  ),
);

ComboboxItem.displayName = "ComboboxItem";
