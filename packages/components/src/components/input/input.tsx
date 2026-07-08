import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type InputControlSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  controlSize?: InputControlSize;
  invalid?: boolean;
}

const inputBaseClasses =
  "w-full min-w-0 rounded-md border border-input bg-background text-foreground shadow-sm outline-none motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-muted/40 read-only:text-muted-foreground aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/15 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15";

const inputControlSizeClasses: Record<InputControlSize, string> = {
  sm: "h-8 px-[var(--dt-space-2-5)] text-base sm:text-sm",
  md: "h-density-control px-[var(--dt-space-3)] text-base sm:text-sm",
  lg: "h-11 px-[var(--dt-space-4)] text-base",
};

function isAriaInvalid(value: InputProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

export function inputClassNames({
  className,
  controlSize = "md",
}: Pick<InputProps, "className" | "controlSize"> = {}) {
  return cn(inputBaseClasses, inputControlSizeClasses[controlSize], className);
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      "aria-invalid": ariaInvalid,
      className,
      controlSize = "md",
      disabled,
      invalid = false,
      readOnly,
      required,
      ...props
    },
    ref,
  ) => {
    const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);

    return (
      <input
        data-slot="input"
        data-size={controlSize}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={resolvedInvalid ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-required={required ? "true" : undefined}
        {...props}
        ref={ref}
        aria-invalid={invalid ? true : ariaInvalid}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={inputClassNames({ className, controlSize })}
      />
    );
  },
);

Input.displayName = "Input";
