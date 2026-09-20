import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type RadioGroupControlSize = "sm" | "md" | "lg";
export type RadioGroupOrientation = "vertical" | "horizontal";

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  controlSize?: RadioGroupControlSize;
  defaultValue?: string;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  orientation?: RadioGroupOrientation;
  readOnly?: boolean;
  required?: boolean;
  value?: string;
}

export interface RadioGroupItemProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "size" | "type" | "value"
> {
  "data-slot"?: string;
  checked?: boolean;
  controlSize?: RadioGroupControlSize;
  defaultChecked?: boolean;
  invalid?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value: string;
}

type RadioGroupContextValue = {
  controlSize: RadioGroupControlSize;
  disabled: boolean;
  invalid: boolean;
  name: string;
  onItemChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  orientation: RadioGroupOrientation;
  readOnly: boolean;
  required: boolean;
  value: string | undefined;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const radioGroupBaseClasses = "grid min-w-0 gap-[var(--dt-space-2)]";

const radioGroupOrientationClasses: Record<RadioGroupOrientation, string> = {
  vertical: "grid-cols-1",
  horizontal:
    "grid-cols-1 sm:flex sm:flex-wrap sm:items-center sm:gap-x-[var(--dt-space-4)] sm:gap-y-[var(--dt-space-2)]",
};

const radioGroupItemRootBaseClasses =
  "group/radio relative inline-flex shrink-0 items-center justify-center align-middle";

const radioGroupControlSizeClasses: Record<RadioGroupControlSize, string> = {
  sm: "[--choice-control-size:calc(var(--dt-density-control)*0.4)] size-[var(--choice-control-size)]",
  md: "[--choice-control-size:calc(var(--dt-density-control)*0.5)] size-[var(--choice-control-size)]",
  lg: "[--choice-control-size:calc(var(--dt-density-control)*0.6)] size-[var(--choice-control-size)]",
};

const radioGroupItemInputClasses =
  "peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed";

const radioGroupItemIndicatorBaseClasses =
  "pointer-events-none flex size-full items-center justify-center rounded-full border border-input bg-background text-transparent shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color,opacity] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control peer-disabled:opacity-60 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background group-disabled/field-set:opacity-60 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[disabled=true]:opacity-60 data-[readonly=true]:bg-muted/40 data-[readonly=true]:text-muted-foreground";

const radioGroupItemDotClasses = "size-2 rounded-full bg-current";

function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}

function isAriaInvalid(value: RadioGroupItemProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

export function radioGroupClassNames({
  className,
  orientation = "vertical",
}: Pick<RadioGroupProps, "className" | "orientation"> = {}) {
  return cn(
    radioGroupBaseClasses,
    radioGroupOrientationClasses[orientation],
    className,
  );
}

export function radioGroupItemClassNames({
  className,
  controlSize = "md",
}: Pick<RadioGroupItemProps, "className" | "controlSize"> = {}) {
  return cn(
    radioGroupItemRootBaseClasses,
    radioGroupControlSizeClasses[controlSize],
    className,
  );
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-orientation": ariaOrientation,
      "aria-required": ariaRequired,
      children,
      className,
      controlSize = "md",
      defaultValue,
      disabled = false,
      invalid = false,
      name,
      onValueChange,
      orientation = "vertical",
      readOnly = false,
      required = false,
      role,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedName = useId();
    const inputName = name ?? `radio-group-${generatedName}`;
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const selectedValue = isControlled ? value : uncontrolledValue;
    const hasAccessibleName =
      ariaLabel !== undefined || ariaLabelledBy !== undefined;
    const resolvedRole = role ?? (hasAccessibleName ? "radiogroup" : undefined);
    const resolvedAriaInvalid = invalid ? true : ariaInvalid;
    const resolvedAriaRequired = required ? true : ariaRequired;
    const resolvedAriaOrientation =
      ariaOrientation ??
      (resolvedRole === "radiogroup" ? orientation : undefined);

    const handleItemChange = (
      nextValue: string,
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      if (readOnly || event.defaultPrevented) {
        return;
      }

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    };

    return (
      <RadioGroupContext.Provider
        value={{
          controlSize,
          disabled,
          invalid,
          name: inputName,
          onItemChange: handleItemChange,
          orientation,
          readOnly,
          required,
          value: selectedValue,
        }}
      >
        <div
          {...props}
          ref={ref}
          aria-invalid={resolvedRole ? resolvedAriaInvalid : ariaInvalid}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation={resolvedAriaOrientation}
          aria-readonly={
            resolvedRole === "radiogroup" && readOnly
              ? true
              : props["aria-readonly"]
          }
          aria-required={
            resolvedRole === "radiogroup" ? resolvedAriaRequired : ariaRequired
          }
          data-slot="radio-group"
          data-disabled={disabled ? "true" : undefined}
          data-invalid={invalid ? "true" : undefined}
          data-orientation={orientation}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          data-size={controlSize}
          role={resolvedRole}
          className={radioGroupClassNames({ className, orientation })}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  (
    {
      "aria-invalid": ariaInvalid,
      "data-slot": dataSlot,
      checked,
      className,
      controlSize,
      defaultChecked = false,
      disabled,
      invalid = false,
      name,
      onChange,
      onClick,
      readOnly,
      required,
      value,
      ...props
    },
    ref,
  ) => {
    const group = useRadioGroupContext();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const groupValue = group?.value;
    const itemControlSize = controlSize ?? group?.controlSize ?? "md";
    const itemDisabled = disabled ?? group?.disabled ?? false;
    const itemInvalid =
      invalid || Boolean(group?.invalid) || isAriaInvalid(ariaInvalid);
    const itemAriaInvalid = invalid || group?.invalid ? true : ariaInvalid;
    const itemName = name ?? group?.name;
    const itemReadOnly = readOnly ?? group?.readOnly ?? false;
    const itemRequired = required ?? group?.required ?? false;
    const isGrouped = group !== null;
    const isControlled = checked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] =
      useState(defaultChecked);
    const selected = isGrouped
      ? groupValue === value
      : isControlled
        ? checked
        : uncontrolledChecked;
    const state = selected ? "checked" : "unchecked";

    const restoreReadOnlyState = () => {
      if (inputRef.current) {
        inputRef.current.checked = selected;
      }
    };

    const handleClick: MouseEventHandler<HTMLInputElement> = (event) => {
      if (itemReadOnly) {
        event.preventDefault();
        restoreReadOnlyState();
        queueMicrotask(restoreReadOnlyState);
        return;
      }

      onClick?.(event);
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (itemReadOnly) {
        event.preventDefault();
        restoreReadOnlyState();
        queueMicrotask(restoreReadOnlyState);
        return;
      }

      onChange?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (isGrouped) {
        group.onItemChange(value, event);
        return;
      }

      if (!isControlled) {
        setUncontrolledChecked(event.currentTarget.checked);
      }
    };

    return (
      <span
        data-slot={dataSlot ?? "radio-group-item"}
        data-size={itemControlSize}
        data-state={state}
        data-checked={selected ? "true" : undefined}
        data-disabled={itemDisabled ? "true" : undefined}
        data-invalid={itemInvalid ? "true" : undefined}
        data-readonly={itemReadOnly ? "true" : undefined}
        data-required={itemRequired ? "true" : undefined}
        data-value={value}
        className={radioGroupItemClassNames({
          className,
          controlSize: itemControlSize,
        })}
      >
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props -- aria-invalid remains a global ARIA attribute for native radio error announcements and Field compatibility. */}
        <input
          {...props}
          ref={composeRefs(inputRef, ref)}
          aria-invalid={itemAriaInvalid}
          aria-disabled={itemReadOnly ? true : props["aria-disabled"]}
          checked={selected}
          className={radioGroupItemInputClasses}
          data-slot="radio-group-item-input"
          data-size={itemControlSize}
          data-state={state}
          data-checked={selected ? "true" : undefined}
          data-disabled={itemDisabled ? "true" : undefined}
          data-invalid={itemInvalid ? "true" : undefined}
          data-readonly={itemReadOnly ? "true" : undefined}
          data-required={itemRequired ? "true" : undefined}
          data-value={value}
          disabled={itemDisabled}
          name={itemName}
          onChange={handleChange}
          onClick={handleClick}
          readOnly={itemReadOnly}
          required={itemRequired}
          type="radio"
          value={value}
        />
        <span
          aria-hidden="true"
          data-slot="radio-group-item-indicator"
          data-size={itemControlSize}
          data-state={state}
          data-checked={selected ? "true" : undefined}
          data-disabled={itemDisabled ? "true" : undefined}
          data-invalid={itemInvalid ? "true" : undefined}
          data-readonly={itemReadOnly ? "true" : undefined}
          data-required={itemRequired ? "true" : undefined}
          data-value={value}
          className={radioGroupItemIndicatorBaseClasses}
        >
          <span
            data-slot="radio-group-item-dot"
            className={cn(
              radioGroupItemDotClasses,
              "motion-safe:ease-control motion-safe:transition-[opacity,scale] motion-safe:duration-[var(--dt-motion-fast)]",
              selected
                ? "scale-100 opacity-100"
                : "opacity-0 motion-safe:scale-50",
            )}
          />
        </span>
      </span>
    );
  },
);

RadioGroupItem.displayName = "RadioGroupItem";
