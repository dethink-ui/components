import {
  forwardRef,
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { Input, type InputProps } from "../input";
import { NumberInput, type NumberInputProps } from "../number-input";
import { Select, SelectItem } from "../select";
import { Switch, type SwitchProps } from "../switch";
import { useInspectorProperty } from "./inspector";

export interface InspectorNumberProps extends Omit<
  NumberInputProps,
  | "controlSize"
  | "defaultValue"
  | "id"
  | "max"
  | "min"
  | "onChange"
  | "step"
  | "type"
  | "value"
> {
  max?: number;
  min?: number;
  /** Decimal places kept on commit. Defaults to the decimals in `step`. */
  precision?: number;
  step?: number;
  /** Short unit shown inside the field, such as px, %, or deg. */
  unit?: string;
}

export interface InspectorTextProps extends Omit<
  InputProps,
  "controlSize" | "defaultValue" | "id" | "onChange" | "value"
> {
  /** Return a message to reject the draft and keep the previous value. */
  validate?: (value: string) => string | null | undefined;
}

export interface InspectorSwitchProps extends Omit<
  SwitchProps,
  | "checked"
  | "controlSize"
  | "defaultChecked"
  | "id"
  | "onChange"
  | "onCheckedChange"
> {}

export interface InspectorSelectOption {
  disabled?: boolean;
  label: ReactNode;
  textValue?: string;
  value: string;
}

export interface InspectorSelectProps {
  className?: string;
  options: InspectorSelectOption[];
  placeholder?: string;
}

const inspectorNumberRootClasses = "relative min-w-0";

const inspectorNumberUnitClasses =
  "pointer-events-none absolute inset-y-0 end-[var(--dt-space-2-5)] flex items-center text-xs text-muted-foreground";

function countDecimals(value: number) {
  const [, decimals = ""] = String(value).split(".");
  return decimals.length;
}

function roundWithin(
  value: number,
  precision: number,
  min?: number,
  max?: number,
) {
  // Round first, then step back inside any bound the rounding crossed.
  const step = 10 ** -precision;
  let next = roundTo(clamp(value, min, max), precision);

  if (max !== undefined && next > max) {
    next = roundTo(Math.floor(max / step) * step, precision);
  }

  if (min !== undefined && next < min) {
    next = roundTo(Math.ceil(min / step) * step, precision);
  }

  // A range narrower than the precision has no representable value; honor
  // the bounds over the precision.
  return clamp(next, min, max);
}

function clamp(value: number, min?: number, max?: number) {
  let next = value;

  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);

  return next;
}

function roundTo(value: number, precision: number) {
  return Number(value.toFixed(precision));
}

function stripUnit(draft: string, unit?: string) {
  const trimmed = draft.trim();

  if (unit && trimmed.toLowerCase().endsWith(unit.toLowerCase())) {
    return trimmed.slice(0, -unit.length).trim();
  }

  return trimmed;
}

/**
 * Keeps an uncommitted draft while the user types. Committing, reverting, or
 * an external value change all return the field to the committed value.
 */
function useDraft(committedText: string) {
  const { disabled, path, readOnly, reportError, selection } =
    useInspectorProperty();
  const [draft, setDraft] = useState<string | null>(null);
  const locked = disabled || readOnly;
  const bindingKey = `${path}\u0000${committedText}\u0000${locked}`;
  const [bound, setBound] = useState({ key: bindingKey, selection });

  // A new selection, an external change, or locking the property discards the
  // stale draft before it can be committed into the newly bound value.
  // Selection is tracked apart from the text so objects with equal values do
  // not share a draft.
  if (bound.key !== bindingKey || !Object.is(bound.selection, selection)) {
    setBound({ key: bindingKey, selection });
    setDraft(null);
  }

  useEffect(() => {
    reportError(null);
  }, [bindingKey, reportError, selection]);

  return {
    display: draft ?? committedText,
    // A property that turns read-only or disabled mid-edit keeps no draft to
    // commit, even if a blur or key event lands before the reset renders.
    draft: locked ? null : draft,
    reset: () => setDraft(null),
    setDraft,
  };
}

export const InspectorNumber = forwardRef<
  HTMLInputElement,
  InspectorNumberProps
>(
  (
    {
      className,
      max,
      min,
      onBlur,
      onKeyDown,
      precision,
      step = 1,
      style,
      unit,
      ...props
    },
    ref,
  ) => {
    const property = useInspectorProperty();
    const committed =
      typeof property.value === "number" && Number.isFinite(property.value)
        ? property.value
        : undefined;
    const resolvedPrecision = precision ?? countDecimals(step);
    const format = (value: number) => String(roundTo(value, resolvedPrecision));
    const { display, draft, reset, setDraft } = useDraft(
      committed === undefined ? "" : format(committed),
    );

    const apply = (value: number) => {
      if (property.readOnly || property.disabled) {
        return;
      }

      const next = roundWithin(value, resolvedPrecision, min, max);

      reset();
      property.reportError(null);

      if (next !== committed) {
        property.setValue(next);
      }
    };

    const commitDraft = () => {
      if (draft === null) {
        return;
      }

      const text = stripUnit(draft, unit);

      if (text === "" && committed === undefined) {
        reset();
        property.reportError(null);
        return;
      }

      const parsed = text === "" ? Number.NaN : Number(text);

      if (!Number.isFinite(parsed)) {
        property.reportError("Enter a number.");
        return;
      }

      apply(parsed);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || property.readOnly) {
        return;
      }

      if (event.key === "Enter") {
        commitDraft();
        return;
      }

      if (event.key === "Escape") {
        if (draft !== null) {
          event.preventDefault();
          reset();
          property.reportError(null);
        }
        return;
      }

      if (event.key === "Home" && min !== undefined) {
        event.preventDefault();
        apply(min);
        return;
      }

      if (event.key === "End" && max !== undefined) {
        event.preventDefault();
        apply(max);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const drafted =
          draft === null ? Number.NaN : Number(stripUnit(draft, unit));
        const base = Number.isFinite(drafted)
          ? drafted
          : (committed ?? min ?? 0);

        apply(base + (event.key === "ArrowUp" ? step : -step));
      }
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      commitDraft();
    };

    return (
      <div
        data-slot="inspector-number"
        className={cn(inspectorNumberRootClasses, className)}
      >
        <NumberInput
          {...props}
          ref={ref}
          id={property.controlId}
          role="spinbutton"
          aria-labelledby={property.labelId}
          aria-describedby={property.describedBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={committed}
          aria-valuetext={
            committed !== undefined && unit
              ? `${format(committed)} ${unit}`
              : undefined
          }
          autoComplete="off"
          controlSize="sm"
          disabled={property.disabled}
          invalid={property.invalid}
          readOnly={property.readOnly}
          value={display}
          style={
            unit
              ? {
                  paddingInlineEnd: `calc(${unit.length}ch + var(--dt-space-4))`,
                  ...style,
                }
              : style
          }
          onBlur={handleBlur}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value)
          }
          onKeyDown={handleKeyDown}
        />
        {unit ? (
          <span
            aria-hidden="true"
            data-slot="inspector-number-unit"
            className={inspectorNumberUnitClasses}
          >
            {unit}
          </span>
        ) : null}
      </div>
    );
  },
);

InspectorNumber.displayName = "InspectorNumber";

export const InspectorText = forwardRef<HTMLInputElement, InspectorTextProps>(
  ({ onBlur, onKeyDown, validate, ...props }, ref) => {
    const property = useInspectorProperty();
    const committed = typeof property.value === "string" ? property.value : "";
    const { display, draft, reset, setDraft } = useDraft(committed);

    const commitDraft = () => {
      if (draft === null) {
        return;
      }

      const message = validate?.(draft);

      if (message) {
        property.reportError(message);
        return;
      }

      reset();
      property.reportError(null);

      if (draft !== committed) {
        property.setValue(draft);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        id={property.controlId}
        aria-labelledby={property.labelId}
        aria-describedby={property.describedBy}
        autoComplete="off"
        controlSize="sm"
        disabled={property.disabled}
        invalid={property.invalid}
        readOnly={property.readOnly}
        value={display}
        onBlur={(event) => {
          onBlur?.(event);
          commitDraft();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented || property.readOnly) {
            return;
          }

          if (event.key === "Enter") {
            commitDraft();
          } else if (event.key === "Escape" && draft !== null) {
            event.preventDefault();
            reset();
            property.reportError(null);
          }
        }}
      />
    );
  },
);

InspectorText.displayName = "InspectorText";

export const InspectorSwitch = forwardRef<
  HTMLInputElement,
  InspectorSwitchProps
>((props, ref) => {
  const property = useInspectorProperty();

  return (
    <Switch
      {...props}
      ref={ref}
      id={property.controlId}
      aria-labelledby={property.labelId}
      aria-describedby={property.describedBy}
      checked={property.value === true}
      controlSize="sm"
      disabled={property.disabled}
      invalid={property.invalid}
      readOnly={property.readOnly}
      onCheckedChange={(checked) => property.setValue(checked)}
    />
  );
});

InspectorSwitch.displayName = "InspectorSwitch";

export function InspectorSelect({
  className,
  options,
  placeholder = "Select…",
}: InspectorSelectProps) {
  const property = useInspectorProperty();
  const value = typeof property.value === "string" ? property.value : undefined;

  return (
    <Select
      // Select treats an undefined value as uncontrolled, so remount it when
      // the property is cleared rather than keeping a stale selection.
      key={value === undefined ? "empty" : "set"}
      id={property.controlId}
      aria-labelledby={property.labelId}
      aria-describedby={property.describedBy}
      className={cn("min-w-0", className)}
      controlSize="sm"
      disabled={property.disabled}
      invalid={property.invalid}
      placeholder={placeholder}
      readOnly={property.readOnly}
      value={value}
      onValueChange={(next) => property.setValue(next)}
    >
      {options.map((option) => (
        <SelectItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          textValue={option.textValue}
        >
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
