import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type CheckboxCheckedState = boolean | "indeterminate";
export type CheckboxControlSize = "sm" | "md" | "lg";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "size" | "type"
> {
  "data-slot"?: string;
  checked?: CheckboxCheckedState;
  controlSize?: CheckboxControlSize;
  defaultChecked?: CheckboxCheckedState;
  invalid?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
}

const checkboxRootBaseClasses =
  "group/checkbox relative inline-flex shrink-0 items-center justify-center align-middle";

const checkboxControlSizeClasses: Record<CheckboxControlSize, string> = {
  sm: "[--choice-control-size:calc(var(--dt-density-control)*0.4)] size-[var(--choice-control-size)]",
  md: "[--choice-control-size:calc(var(--dt-density-control)*0.5)] size-[var(--choice-control-size)]",
  lg: "[--choice-control-size:calc(var(--dt-density-control)*0.6)] size-[var(--choice-control-size)]",
};

const checkboxInputClasses =
  "peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed";

const checkboxIndicatorBaseClasses =
  "pointer-events-none flex size-full items-center justify-center rounded border border-input bg-background text-transparent shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,color,opacity] motion-safe:duration-150 peer-disabled:opacity-60 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background group-disabled/field-set:opacity-60 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[disabled=true]:opacity-60 data-[readonly=true]:bg-muted/40 data-[readonly=true]:text-muted-foreground";

function isAriaInvalid(value: CheckboxProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

function getCheckboxState(checked: CheckboxCheckedState) {
  if (checked === "indeterminate") {
    return "indeterminate";
  }

  return checked ? "checked" : "unchecked";
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

export function checkboxClassNames({
  className,
  controlSize = "md",
}: Pick<CheckboxProps, "className" | "controlSize"> = {}) {
  return cn(
    checkboxRootBaseClasses,
    checkboxControlSizeClasses[controlSize],
    className,
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

function MinusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M3.5 8h9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      "aria-invalid": ariaInvalid,
      "data-slot": dataSlot,
      checked,
      className,
      controlSize = "md",
      defaultChecked = false,
      disabled,
      invalid = false,
      onChange,
      onCheckedChange,
      onClick,
      readOnly,
      required,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isControlled = checked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] =
      useState<CheckboxCheckedState>(defaultChecked);
    const checkedState = isControlled ? checked : uncontrolledChecked;
    const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);
    const state = getCheckboxState(checkedState);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = checkedState === "indeterminate";
      }
    }, [checkedState]);

    const restoreReadOnlyState = () => {
      if (inputRef.current) {
        inputRef.current.checked = checkedState === true;
        inputRef.current.indeterminate = checkedState === "indeterminate";
      }
    };

    const handleClick: MouseEventHandler<HTMLInputElement> = (event) => {
      if (readOnly) {
        event.preventDefault();
        restoreReadOnlyState();
        queueMicrotask(restoreReadOnlyState);
        return;
      }

      onClick?.(event);
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (readOnly) {
        event.preventDefault();
        restoreReadOnlyState();
        queueMicrotask(restoreReadOnlyState);
        return;
      }

      onChange?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const nextChecked = event.currentTarget.checked;

      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }

      onCheckedChange?.(nextChecked);
    };

    return (
      <span
        data-slot={dataSlot ?? "checkbox"}
        data-size={controlSize}
        data-state={state}
        data-checked={checkedState === true ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-indeterminate={
          checkedState === "indeterminate" ? "true" : undefined
        }
        data-invalid={resolvedInvalid ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-required={required ? "true" : undefined}
        className={checkboxClassNames({ className, controlSize })}
      >
        <input
          {...props}
          ref={composeRefs(inputRef, ref)}
          aria-checked={checkedState === "indeterminate" ? "mixed" : undefined}
          aria-invalid={invalid ? true : ariaInvalid}
          aria-readonly={readOnly ? true : undefined}
          checked={checkedState === true}
          className={checkboxInputClasses}
          data-slot="checkbox-input"
          data-size={controlSize}
          data-state={state}
          data-checked={checkedState === true ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-indeterminate={
            checkedState === "indeterminate" ? "true" : undefined
          }
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          disabled={disabled}
          onChange={handleChange}
          onClick={handleClick}
          readOnly={readOnly}
          required={required}
          type="checkbox"
        />
        <span
          aria-hidden="true"
          data-slot="checkbox-indicator"
          data-size={controlSize}
          data-state={state}
          data-checked={checkedState === true ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-indeterminate={
            checkedState === "indeterminate" ? "true" : undefined
          }
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          className={checkboxIndicatorBaseClasses}
        >
          {checkedState === "indeterminate" ? (
            <MinusIcon />
          ) : checkedState ? (
            <CheckIcon />
          ) : null}
        </span>
      </span>
    );
  },
);

Checkbox.displayName = "Checkbox";
