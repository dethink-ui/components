import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type TextareaControlSize = "sm" | "md" | "lg";
export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  controlSize?: TextareaControlSize;
  invalid?: boolean;
  resize?: TextareaResize;
}

const textareaBaseClasses =
  "w-full min-w-0 rounded-md border border-input bg-background text-foreground shadow-sm outline-none motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-muted/40 read-only:text-muted-foreground aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/15 data-[invalid=true]:border-destructive data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive/15";

const textareaControlSizeClasses: Record<TextareaControlSize, string> = {
  sm: "min-h-20 px-[var(--dt-space-2-5)] py-[var(--dt-space-2)] text-base sm:text-sm",
  md: "min-h-28 px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-base sm:text-sm",
  lg: "min-h-36 px-[var(--dt-space-4)] py-[var(--dt-space-3)] text-base",
};

const textareaResizeClasses: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

function isAriaInvalid(value: TextareaProps["aria-invalid"]) {
  return (
    value === true ||
    value === "true" ||
    value === "grammar" ||
    value === "spelling"
  );
}

export function textareaClassNames({
  className,
  controlSize = "md",
  resize = "vertical",
}: Pick<TextareaProps, "className" | "controlSize" | "resize"> = {}) {
  return cn(
    textareaBaseClasses,
    textareaControlSizeClasses[controlSize],
    textareaResizeClasses[resize],
    className,
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      "aria-invalid": ariaInvalid,
      className,
      controlSize = "md",
      disabled,
      invalid = false,
      readOnly,
      required,
      resize = "vertical",
      ...props
    },
    ref,
  ) => {
    const resolvedInvalid = invalid || isAriaInvalid(ariaInvalid);

    return (
      <textarea
        data-slot="textarea"
        data-size={controlSize}
        data-resize={resize}
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
        className={textareaClassNames({ className, controlSize, resize })}
      />
    );
  },
);

Textarea.displayName = "Textarea";
