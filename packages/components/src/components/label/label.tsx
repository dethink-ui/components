import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type LabelSize = "sm" | "md" | "lg";
export type LabelMarker = ReactNode | false;

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  invalid?: boolean;
  optional?: boolean;
  optionalMarker?: LabelMarker;
  required?: boolean;
  requiredMarker?: LabelMarker;
  size?: LabelSize;
}

const labelBaseClasses =
  "inline-flex max-w-full items-baseline text-foreground data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[invalid=true]:text-destructive";

const labelSizeClasses: Record<LabelSize, string> = {
  sm: "text-xs font-medium leading-4",
  md: "text-sm font-medium leading-none",
  lg: "text-base font-medium leading-6",
};

const labelMarkerBaseClasses =
  "ms-[var(--dt-space-1-5)] shrink-0 text-xs font-normal leading-none";

const labelRequiredMarkerClasses = "text-destructive";

const labelOptionalMarkerClasses = "text-muted-foreground";

export function labelClassNames({
  className,
  size = "md",
}: Pick<LabelProps, "className" | "size"> = {}) {
  return cn(labelBaseClasses, labelSizeClasses[size], className);
}

function hasMarker(marker: LabelMarker | undefined) {
  return marker !== false && marker !== null && marker !== undefined;
}

function renderLabelMarker({
  className,
  marker,
  slot,
}: {
  className: string;
  marker: LabelMarker | undefined;
  slot: "label-required-marker" | "label-optional-marker";
}) {
  if (!hasMarker(marker)) {
    return null;
  }

  return (
    <span data-slot={slot} className={cn(labelMarkerBaseClasses, className)}>
      {marker}
    </span>
  );
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      className,
      disabled = false,
      invalid = false,
      optional = false,
      optionalMarker = "(optional)",
      required = false,
      requiredMarker = "(required)",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const showRequiredMarker = required && hasMarker(requiredMarker);
    const showOptionalMarker =
      !required && optional && hasMarker(optionalMarker);

    return (
      <label
        {...props}
        ref={ref}
        data-slot="label"
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        data-optional={!required && optional ? "true" : undefined}
        data-required={required ? "true" : undefined}
        data-size={size}
        className={labelClassNames({ className, size })}
      >
        {children}
        {showRequiredMarker
          ? renderLabelMarker({
              className: labelRequiredMarkerClasses,
              marker: requiredMarker,
              slot: "label-required-marker",
            })
          : null}
        {showOptionalMarker
          ? renderLabelMarker({
              className: labelOptionalMarkerClasses,
              marker: optionalMarker,
              slot: "label-optional-marker",
            })
          : null}
      </label>
    );
  },
);

Label.displayName = "Label";
