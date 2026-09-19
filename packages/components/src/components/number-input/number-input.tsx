import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type NumberInputControlSize = "sm" | "md" | "lg";
export type NumberInputMode = "decimal" | "numeric";

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "inputMode" | "type"
> {
  controlSize?: NumberInputControlSize;
  invalid?: boolean;
  numberMode?: NumberInputMode;
  type?: "text" | "number";
}

const numberInputBaseClasses =
  "w-full min-w-0 rounded-md border border-input bg-background text-foreground tabular-nums shadow-sm outline-none motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-muted/40 read-only:text-muted-foreground aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/15 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15";

const numberInputControlSizeClasses: Record<NumberInputControlSize, string> = {
  sm: "h-8 px-[var(--dt-space-2-5)] text-base sm:text-sm",
  md: "h-density-control px-[var(--dt-space-3)] text-base sm:text-sm",
  lg: "h-11 px-[var(--dt-space-4)] text-base",
};

function isAriaInvalid(value: NumberInputProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

export function numberInputClassNames({
  className,
  controlSize = "md",
}: Pick<NumberInputProps, "className" | "controlSize"> = {}) {
  return cn(
    numberInputBaseClasses,
    numberInputControlSizeClasses[controlSize],
    className,
  );
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      "aria-invalid": ariaInvalid,
      className,
      controlSize = "md",
      disabled,
      invalid = false,
      numberMode = "decimal",
      readOnly,
      required,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);

    return (
      <input
        data-slot="number-input"
        data-size={controlSize}
        data-number-mode={numberMode}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={resolvedInvalid ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-required={required ? "true" : undefined}
        {...props}
        ref={ref}
        aria-invalid={invalid ? true : ariaInvalid}
        disabled={disabled}
        inputMode={numberMode}
        readOnly={readOnly}
        required={required}
        type={type}
        className={numberInputClassNames({ className, controlSize })}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";
