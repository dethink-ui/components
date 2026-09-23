import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  Text,
  type Key,
  type ListBoxItemProps as AriaListBoxItemProps,
  type SelectProps as AriaSelectProps,
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
  useRef,
} from "react";
import { cn } from "../../utils/cn";
import { toPlainText } from "../../utils/to-plain-text";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
  useScopedOverlayState,
} from "../../utils/provider-portal";

export type SelectValue = string;
export type SelectControlSize = "sm" | "md" | "lg";

export type SelectItemData = {
  label?: ReactNode;
  textValue?: string;
  value: SelectValue;
};

export interface SelectProps<
  T extends SelectItemData = SelectItemData,
> extends Omit<
  AriaSelectProps<T>,
  | "children"
  | "className"
  | "defaultOpen"
  | "defaultSelectedKey"
  | "defaultValue"
  | "disabledKeys"
  | "isDisabled"
  | "isInvalid"
  | "isOpen"
  | "isRequired"
  | "items"
  | "onOpenChange"
  | "onSelectionChange"
  | "placeholder"
  | "selectedKey"
  | "validationBehavior"
  | "value"
> {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "data-slot"?: string;
  children?: ReactNode | ((item: T) => ReactNode);
  className?: string;
  controlSize?: SelectControlSize;
  defaultOpen?: boolean;
  defaultValue?: SelectValue;
  description?: ReactNode;
  disabled?: boolean;
  disabledKeys?: Iterable<SelectValue>;
  errorMessage?: ReactNode;
  invalid?: boolean;
  items?: Iterable<T>;
  label?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: SelectValue) => void;
  open?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: SelectValue;
}

export interface SelectItemProps extends Omit<
  AriaListBoxItemProps<SelectItemData>,
  "children" | "className" | "id" | "isDisabled" | "value"
> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  value: SelectValue;
}

const selectRootBaseClasses =
  "group/select grid w-full min-w-0 gap-[var(--dt-space-2)] text-foreground";

const selectLabelClasses =
  "text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-60 data-[invalid=true]:text-destructive";

const selectTriggerBaseClasses =
  "flex w-full min-w-0 items-center justify-between gap-[var(--dt-space-2)] rounded-md border border-input bg-background text-start text-foreground shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color,transform] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 data-[focused]:border-ring data-[focused]:ring-2 data-[focused]:ring-ring/20 data-[focus-visible]:border-ring data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring/20 data-[hovered]:border-ring/60 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[open]:border-ring data-[pressed]:bg-muted data-[readonly=true]:bg-muted/40 data-[readonly=true]:text-muted-foreground";

const selectControlSizeClasses: Record<SelectControlSize, string> = {
  sm: "h-8 px-[var(--dt-space-2-5)] text-base sm:text-sm",
  md: "h-density-control px-[var(--dt-space-3)] text-base sm:text-sm",
  lg: "h-11 px-[var(--dt-space-4)] text-base",
};

const selectValueClasses =
  "min-w-0 flex-1 truncate data-[placeholder]:text-muted-foreground";

const selectIconClasses =
  "ms-[var(--dt-space-2)] size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control group-data-[open]/select:rotate-180 group-data-[disabled]/select:opacity-60";

const selectHelpClasses = "text-xs leading-5 text-muted-foreground";

const selectErrorClasses =
  "text-xs font-medium leading-5 text-destructive motion-safe:animate-feedback-in";

const selectPopoverClasses =
  "z-50 max-h-72 min-w-[var(--trigger-width)] overflow-hidden rounded-md border border-border bg-background text-foreground shadow-lg outline-none origin-top data-[placement=top]:origin-bottom data-[placement=left]:origin-right data-[placement=right]:origin-left motion-safe:data-[entering]:animate-overlay-in motion-safe:data-[exiting]:animate-overlay-out motion-reduce:animate-none";

const selectListBoxClasses =
  "max-h-72 overflow-auto p-[var(--dt-space-1)] outline-none";

const selectItemBaseClasses =
  "grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm text-foreground outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focused]:bg-muted data-[hovered]:bg-muted data-[pressed]:bg-muted/80 data-[selected]:bg-primary data-[selected]:text-primary-foreground";

const selectItemIndicatorClasses =
  "flex size-4 items-center justify-center text-current";

const selectItemContentClasses = "min-w-0 truncate";

type SelectComponent = (<T extends SelectItemData = SelectItemData>(
  props: SelectProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & { displayName?: string };

function isAriaInvalid(value: SelectProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

function toSelectionKey(value: SelectValue | undefined) {
  return value === undefined ? undefined : value;
}

function toDisabledKeys(disabledKeys: Iterable<SelectValue> | undefined) {
  return disabledKeys ? Array.from(disabledKeys) : undefined;
}

function syncAriaInvalidAttribute(
  element: HTMLElement | null,
  value: SelectProps["aria-invalid"],
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

export function selectClassNames({
  className,
}: Pick<SelectProps, "className"> = {}) {
  return cn(selectRootBaseClasses, className);
}

export function selectItemClassNames({
  className,
}: Pick<SelectItemProps, "className"> = {}) {
  return cn(selectItemBaseClasses, className);
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

function renderSelectChildren<T extends SelectItemData>({
  children,
  items,
}: Pick<SelectProps<T>, "children" | "items">): ReactNode {
  if (items && typeof children === "function") {
    return Array.from(items, (item) => {
      const child = children(item);

      return withSelectItemTextValue(child, item.value);
    });
  }

  return Children.map(children as ReactNode, (child) =>
    withSelectItemTextValue(child),
  );
}

function withSelectItemTextValue(child: ReactNode, key?: string) {
  if (!isValidElement<SelectItemProps>(child)) {
    return child;
  }

  const { children, textValue, value } = child.props;

  if (typeof value !== "string") {
    return child;
  }

  return cloneElement(child, {
    key: child.key ?? key,
    textValue: textValue || toPlainText(children) || value,
  });
}

function SelectRoot<T extends SelectItemData = SelectItemData>(
  {
    "aria-invalid": ariaInvalid,
    "data-slot": dataSlot,
    children,
    className,
    controlSize = "md",
    defaultOpen,
    defaultValue,
    description,
    disabled = false,
    disabledKeys,
    errorMessage,
    invalid = false,
    items,
    label,
    onOpenChange,
    onValueChange,
    open,
    placeholder = "Select an option",
    readOnly = false,
    required = false,
    value,
    ...props
  }: SelectProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);
  const resolvedAriaInvalid = invalid ? true : ariaInvalid;
  const renderedChildren = renderSelectChildren({ children, items });
  const [scopedOpen, setScopedOpen] = useScopedOverlayState({
    open,
    defaultOpen,
    onOpenChange,
  });
  const resolvedOpen = !readOnly && scopedOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
    forwardedRef: ref,
    portalSlot: "select-portal-container",
  });
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      syncAriaInvalidAttribute(node, resolvedAriaInvalid);
    },
    [resolvedAriaInvalid],
  );

  useEffect(() => {
    syncAriaInvalidAttribute(triggerRef.current, resolvedAriaInvalid);
  }, [resolvedAriaInvalid]);

  return (
    <DethinkPortalProvider container={portalContainer}>
      <AriaSelect
        {...props}
        ref={rootRef}
        selectedKey={toSelectionKey(value)}
        defaultSelectedKey={toSelectionKey(defaultValue)}
        isOpen={resolvedOpen}
        onOpenChange={(isOpen) => {
          if (!readOnly) {
            setScopedOpen(isOpen);
          }
        }}
        onSelectionChange={(key: Key | null) => {
          if (key !== null && !readOnly) {
            onValueChange?.(String(key));
          }
        }}
        disabledKeys={toDisabledKeys(disabledKeys)}
        isDisabled={disabled}
        isRequired={required}
        isInvalid={resolvedInvalid}
        aria-invalid={resolvedAriaInvalid}
        placeholder={placeholder}
        validationBehavior="aria"
        data-slot={dataSlot ?? "select"}
        data-size={controlSize}
        data-readonly={readOnly ? "true" : undefined}
        className={selectClassNames({ className })}
      >
        {label ? (
          <Label
            data-slot="select-label"
            data-disabled={disabled ? "true" : undefined}
            data-invalid={resolvedInvalid ? "true" : undefined}
            data-required={required ? "true" : undefined}
            className={selectLabelClasses}
          >
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </Label>
        ) : null}
        <AriaButton
          aria-invalid={resolvedAriaInvalid}
          ref={setTriggerRef}
          data-slot="select-trigger"
          data-size={controlSize}
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          className={cn(
            selectTriggerBaseClasses,
            selectControlSizeClasses[controlSize],
          )}
        >
          <AriaSelectValue
            data-slot="select-value"
            className={selectValueClasses}
          >
            {({ selectedText, defaultChildren }) =>
              selectedText || defaultChildren
            }
          </AriaSelectValue>
          <span
            aria-hidden="true"
            data-slot="select-icon"
            className={selectIconClasses}
          >
            <ChevronDownIcon />
          </span>
        </AriaButton>
        {description ? (
          <Text
            slot="description"
            data-slot="select-description"
            className={selectHelpClasses}
          >
            {description}
          </Text>
        ) : null}
        {errorMessage ? (
          <FieldError data-slot="select-error" className={selectErrorClasses}>
            {errorMessage}
          </FieldError>
        ) : null}
        <Popover data-slot="select-popover" className={selectPopoverClasses}>
          <ListBox data-slot="select-listbox" className={selectListBoxClasses}>
            {renderedChildren}
          </ListBox>
        </Popover>
      </AriaSelect>
    </DethinkPortalProvider>
  );
}

export const Select = forwardRef(SelectRoot) as SelectComponent;

Select.displayName = "Select";

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (
    { children, className, disabled = false, textValue, value, ...props },
    ref,
  ) => (
    <ListBoxItem
      {...props}
      ref={ref}
      id={value}
      isDisabled={disabled}
      textValue={textValue || toPlainText(children) || value}
      data-slot="select-item"
      data-value={value}
      className={selectItemClassNames({ className })}
    >
      {({ isSelected }) => (
        <>
          <span
            aria-hidden="true"
            data-slot="select-item-indicator"
            data-selected={isSelected ? "true" : undefined}
            className={selectItemIndicatorClasses}
          >
            {isSelected ? <CheckIcon /> : null}
          </span>
          <span
            data-slot="select-item-content"
            className={selectItemContentClasses}
          >
            {children}
          </span>
        </>
      )}
    </ListBoxItem>
  ),
);

SelectItem.displayName = "SelectItem";
