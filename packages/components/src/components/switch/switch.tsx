import {
  forwardRef,
  useRef,
  useState,
  type ChangeEventHandler,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type SwitchControlSize = "sm" | "md" | "lg";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "size" | "type"
> {
  "data-slot"?: string;
  checked?: boolean;
  controlSize?: SwitchControlSize;
  defaultChecked?: boolean;
  invalid?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onCheckedChange?: (checked: boolean) => void;
}

const switchRootBaseClasses =
  "group/switch relative inline-flex shrink-0 items-center align-middle";

const switchControlSizeClasses: Record<SwitchControlSize, string> = {
  sm: "[--switch-height:calc(var(--dt-density-control)*0.5)] [--switch-thumb-size:calc(var(--switch-height)-0.25rem)] [--switch-width:calc(var(--dt-density-control)*0.9)] h-[var(--switch-height)] w-[var(--switch-width)]",
  md: "[--switch-height:calc(var(--dt-density-control)*0.6)] [--switch-thumb-size:calc(var(--switch-height)-0.25rem)] [--switch-width:calc(var(--dt-density-control)*1.1)] h-[var(--switch-height)] w-[var(--switch-width)]",
  lg: "[--switch-height:calc(var(--dt-density-control)*0.7)] [--switch-thumb-size:calc(var(--switch-height)-0.25rem)] [--switch-width:calc(var(--dt-density-control)*1.3)] h-[var(--switch-height)] w-[var(--switch-width)]",
};

const switchThumbSizeClasses: Record<SwitchControlSize, string> = {
  sm: "size-[var(--switch-thumb-size)]",
  md: "size-[var(--switch-thumb-size)]",
  lg: "size-[var(--switch-thumb-size)]",
};

const switchInputClasses =
  "peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed";

const switchTrackBaseClasses =
  "pointer-events-none flex size-full items-center rounded-full border border-input bg-muted p-[var(--dt-space-0-5)] shadow-sm outline-none motion-safe:transition-[background-color,border-color,box-shadow,opacity] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control peer-disabled:opacity-60 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background group-disabled/field-set:opacity-60 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15 data-[disabled=true]:opacity-60 data-[readonly=true]:bg-muted/40";

const switchThumbBaseClasses =
  "shrink-0 rounded-full bg-background text-background shadow-sm [--switch-travel:calc(var(--switch-width)-var(--switch-thumb-size)-var(--dt-space-0-5)*2-2px)] translate-x-0 motion-safe:transition-[translate,background-color] motion-safe:duration-[180ms] motion-safe:ease-control data-[state=checked]:translate-x-[var(--switch-travel)] rtl:data-[state=checked]:-translate-x-[var(--switch-travel)] data-[state=checked]:bg-primary-foreground data-[readonly=true]:bg-muted-foreground/70";

function isAriaInvalid(value: SwitchProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

function getSwitchState(checked: boolean) {
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

export function switchClassNames({
  className,
  controlSize = "md",
}: Pick<SwitchProps, "className" | "controlSize"> = {}) {
  return cn(
    switchRootBaseClasses,
    switchControlSizeClasses[controlSize],
    className,
  );
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
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
      useState(defaultChecked);
    const checkedState = isControlled ? checked : uncontrolledChecked;
    const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);
    const state = getSwitchState(checkedState);

    const restoreReadOnlyState = () => {
      if (inputRef.current) {
        inputRef.current.checked = checkedState;
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
        data-slot={dataSlot ?? "switch"}
        data-size={controlSize}
        data-state={state}
        data-checked={checkedState ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={resolvedInvalid ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-required={required ? "true" : undefined}
        className={switchClassNames({ className, controlSize })}
      >
        <input
          {...props}
          ref={composeRefs(inputRef, ref)}
          aria-checked={checkedState}
          aria-invalid={invalid ? true : ariaInvalid}
          aria-readonly={readOnly ? true : undefined}
          checked={checkedState}
          className={switchInputClasses}
          data-slot="switch-input"
          data-size={controlSize}
          data-state={state}
          data-checked={checkedState ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          disabled={disabled}
          onChange={handleChange}
          onClick={handleClick}
          readOnly={readOnly}
          required={required}
          role="switch"
          type="checkbox"
        />
        <span
          aria-hidden="true"
          data-slot="switch-track"
          data-size={controlSize}
          data-state={state}
          data-checked={checkedState ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={resolvedInvalid ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          data-required={required ? "true" : undefined}
          className={switchTrackBaseClasses}
        >
          <span
            data-slot="switch-thumb"
            data-size={controlSize}
            data-state={state}
            data-checked={checkedState ? "true" : undefined}
            data-disabled={disabled ? "true" : undefined}
            data-invalid={resolvedInvalid ? "true" : undefined}
            data-readonly={readOnly ? "true" : undefined}
            data-required={required ? "true" : undefined}
            className={cn(
              switchThumbBaseClasses,
              switchThumbSizeClasses[controlSize],
            )}
          />
        </span>
      </span>
    );
  },
);

Switch.displayName = "Switch";
