import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
  useId,
  useContext,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import {
  Label,
  Slider as AriaSlider,
  SliderTrack,
  SliderOutput,
  I18nProvider,
  useLocale,
  type SliderProps as AriaSliderProps,
} from "react-aria-components";
import {
  validateSliderSteps,
  validateSliderValue,
  sliderStepIndex,
  type SliderStep,
} from "./slider-values";
import { SliderDecorationContext } from "./slider-visuals";
import { SliderThumbControl } from "./slider-thumb";
import { cn } from "../../utils/cn";

export type SliderValue = number | [number, number];
export type SliderSize = "sm" | "md" | "lg" | "xl";
export type SliderVariant = "default" | "expressive";
export type SliderValueDisplay = "inline" | "floating" | "none";
export interface SliderSlots {
  track?: string;
  fill?: string;
  thumb?: string;
  marks?: string;
  output?: string;
}
interface SliderBaseProps<T extends SliderValue = number> extends Omit<
  AriaSliderProps<T>,
  | "children"
  | "className"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onChangeEnd"
  | "minValue"
  | "maxValue"
  | "isDisabled"
  | "orientation"
  | "style"
  | "step"
> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T extends number ? number : [number, number]) => void;
  onValueCommit?: (value: T extends number ? number : [number, number]) => void;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  name?: string | [string, string];
  thumbLabels?: [string, string];
  size?: SliderSize;
  variant?: SliderVariant;
  valueDisplay?: SliderValueDisplay;
  className?: string;
  classNames?: SliderSlots;
  locale?: string;
}

export type SliderProps<T extends SliderValue = number> = SliderBaseProps<T> &
  (
    | {
        mode?: "numeric";
        min?: number;
        max?: number;
        step?: number;
        steps?: never;
      }
    | {
        mode: "stepper";
        steps: readonly SliderStep[];
        min?: never;
        max?: never;
        step?: never;
      }
  );
export type { SliderStep } from "./slider-values";

const thumbVisual =
  "border-primary bg-background group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-background pointer-events-none size-[var(--dt-slider-thumb-size)] rounded-full border-2 shadow-sm group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-offset-2 forced-colors:border-[Highlight]";

const sizes: Record<SliderSize, string> = {
  sm: "[--dt-slider-track-height:0.25rem] [--dt-slider-thumb-size:1rem]",
  md: "[--dt-slider-track-height:0.375rem] [--dt-slider-thumb-size:1.25rem]",
  xl: "[--dt-slider-track-height:2.75rem] [--dt-slider-thumb-size:2.125rem]",
  lg: "[--dt-slider-track-height:0.5rem] [--dt-slider-thumb-size:1.5rem]",
};

export function sliderClassNames({
  size = "md",
  className,
}: Pick<SliderProps, "size" | "className"> = {}) {
  return cn(
    "grid w-full min-w-0 gap-density-gap text-foreground [--dt-slider-snap-duration:180ms] data-[disabled]:opacity-50",
    sizes[size],
    className,
  );
}

function SliderImpl(
  {
    value,
    defaultValue,
    mode = "numeric",
    steps,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    label,
    description,
    name,
    thumbLabels = ["Minimum", "Maximum"],
    size = "md",
    variant = "default",
    valueDisplay = "inline",
    className,
    classNames,
    locale,
    dir,
    "aria-describedby": describedBy,
    ...props
  }: SliderProps<SliderValue>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const Decoration = useContext(SliderDecorationContext);
  const [directDrag, setDirectDrag] = useState(false);
  useEffect(() => {
    if (!directDrag) return;
    const release = () => setDirectDrag(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [directDrag]);
  const descriptionId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const inheritedLocale = useLocale();
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [inheritedDirection, setInheritedDirection] = useState(
    inheritedLocale.direction,
  );
  const setRoot = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      if (node)
        setInheritedDirection(
          getComputedStyle(node).direction === "rtl" ? "rtl" : "ltr",
        );
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  useEffect(() => {
    if (!element) return;
    const observer = new MutationObserver(() =>
      setInheritedDirection(
        getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr",
      ),
    );
    let ancestor: HTMLElement | null = element;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["dir"],
      });
      ancestor = ancestor.parentElement;
    }
    return () => observer.disconnect();
  }, [element]);
  const direction = dir === "rtl" || dir === "ltr" ? dir : inheritedDirection;
  const numberFormatter = new Intl.NumberFormat(
    locale ?? inheritedLocale.locale,
    props.formatOptions,
  );
  // React Aria uses locale direction for input mechanics. Preserve the consumer's
  // number locale separately while matching inherited DOM direction for movement.
  const interactionLocale = direction === "rtl" ? "ar" : "en-US";
  validateSliderValue(value);
  validateSliderValue(defaultValue);
  if (mode === "stepper") validateSliderSteps(steps!);
  else if (![min, max, step].every(Number.isFinite) || max <= min || step <= 0)
    throw new Error("Slider requires finite min < max and a positive step.");
  const stops = mode === "stepper" ? steps : undefined;
  const toPosition = (
    input: SliderValue | undefined,
  ): SliderValue | undefined => {
    if (!stops || input === undefined) return input;
    return Array.isArray(input)
      ? [sliderStepIndex(input[0], stops), sliderStepIndex(input[1], stops)]
      : sliderStepIndex(input, stops);
  };
  const toValue = (input: SliderValue): SliderValue => {
    if (!stops) return input;
    return Array.isArray(input)
      ? [stops[input[0]].value, stops[input[1]].value]
      : stops[input].value;
  };
  const range = Array.isArray(value ?? defaultValue);
  return (
    <I18nProvider locale={interactionLocale}>
      <AriaSlider
        {...props}
        ref={setRoot}
        onPointerDownCapture={(event) => {
          props.onPointerDownCapture?.(event);
          if (!disabled && !event.defaultPrevented)
            setDirectDrag(
              !!(event.target as HTMLElement).closest(
                '[data-slot="slider-thumb"]',
              ),
            );
        }}
        onPointerMoveCapture={(event) => {
          props.onPointerMoveCapture?.(event);
          if (!disabled && event.buttons === 1) setDirectDrag(true);
        }}
        dir={dir}
        value={toPosition(value)}
        defaultValue={
          toPosition(defaultValue) ??
          (value === undefined ? (stops ? 0 : min) : undefined)
        }
        minValue={stops ? 0 : min}
        maxValue={stops ? stops.length - 1 : max}
        step={stops ? 1 : step}
        isDisabled={disabled}
        orientation="horizontal"
        onChange={(next: SliderValue) => onValueChange?.(toValue(next))}
        onChangeEnd={(next: SliderValue) => onValueCommit?.(toValue(next))}
        aria-describedby={
          [describedBy, description ? descriptionId : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
        data-slot="slider"
        data-size={size}
        data-variant={variant}
        data-mode={mode}
        className={sliderClassNames({ size, className })}
      >
        {({ state }) => {
          const formatted = state.values.map((value) =>
            stops ? stops[value].label : numberFormatter.format(value),
          );
          const start = range ? state.getThumbPercent(0) * 100 : 0;
          const end = state.getThumbPercent(state.values.length - 1) * 100;
          return (
            <>
              {(label || valueDisplay !== "none") && (
                <div className="flex min-w-0 items-baseline justify-between gap-4">
                  {label && (
                    <Label className="text-sm font-medium">{label}</Label>
                  )}
                  {valueDisplay !== "none" && (
                    <SliderOutput
                      data-slot="slider-output"
                      className={cn(
                        "text-muted-foreground ms-auto min-w-0 text-end text-sm font-medium tabular-nums",
                        classNames?.output,
                      )}
                    >
                      {formatted.join(" – ")}
                    </SliderOutput>
                  )}
                </div>
              )}
              <SliderTrack
                ref={trackRef}
                data-slot="slider-track"
                className={cn(
                  "relative h-11 touch-none",
                  size === "xl" ? "mx-[1.375rem]" : "mx-[var(--dt-space-3)]",
                  valueDisplay === "floating" && "mt-8",
                  classNames?.track,
                )}
              >
                <div
                  aria-hidden="true"
                  data-slot="slider-rail"
                  className={cn(
                    "bg-muted absolute top-1/2 h-[var(--dt-slider-track-height)] -translate-y-1/2 rounded-full forced-colors:border forced-colors:border-[GrayText]",
                    size === "xl"
                      ? "-inset-x-[1.375rem] shadow-inner"
                      : "w-full",
                  )}
                />
                <div
                  aria-hidden="true"
                  data-slot="slider-fill"
                  className={cn(
                    "bg-primary pointer-events-none absolute top-1/2 h-[var(--dt-slider-track-height)] -translate-y-1/2 rounded-full forced-colors:bg-[Highlight]",
                    variant === "expressive" &&
                      "shadow-[0_0_16px_color-mix(in_srgb,var(--dt-color-primary)_25%,transparent)]",
                    stops &&
                      !directDrag &&
                      "motion-safe:transition-[width,inset-inline-start] motion-safe:duration-[var(--dt-slider-snap-duration)] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                    classNames?.fill,
                  )}
                  style={{
                    insetInlineStart:
                      size === "xl"
                        ? `calc(${start}% - 1.375rem)`
                        : `${start}%`,
                    width:
                      size === "xl"
                        ? `calc(${end - start}% + 2.75rem)`
                        : `${end - start}%`,
                  }}
                />
                {stops?.map((stop, index) => {
                  const selected = state.values.includes(index);
                  const passed =
                    index <= state.values[state.values.length - 1] &&
                    (!range || index >= state.values[0]);
                  return (
                    <span
                      key={stop.value}
                      aria-hidden="true"
                      data-slot="slider-mark"
                      data-selected={selected || undefined}
                      data-passed={passed || undefined}
                      className={cn(
                        "border-background bg-muted-foreground/50 data-[passed]:bg-primary data-[selected]:bg-primary pointer-events-none absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 rtl:translate-x-1/2 forced-colors:border-[Canvas] forced-colors:bg-[GrayText] forced-colors:data-[passed]:bg-[Highlight]",
                        classNames?.marks,
                      )}
                      style={{
                        insetInlineStart: `${(index / (stops.length - 1)) * 100}%`,
                      }}
                    />
                  );
                })}
                {state.values.map((_, index) => (
                  <SliderThumbControl
                    trackRef={trackRef}
                    valueText={formatted[index]}
                    key={index}
                    index={index}
                    name={
                      stops
                        ? undefined
                        : Array.isArray(name)
                          ? name[index]
                          : name
                    }
                    label={range ? thumbLabels[index] : undefined}
                    className={cn(
                      "group top-1/2 flex size-11 cursor-grab items-center justify-center outline-none data-[disabled]:cursor-not-allowed data-[dragging]:cursor-grabbing data-[focus-visible]:z-10",
                      stops &&
                        !directDrag &&
                        "motion-safe:transition-[left] motion-safe:duration-[var(--dt-slider-snap-duration)] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                      classNames?.thumb,
                    )}
                  >
                    {({ isDragging, isFocused, isHovered }) => (
                      <>
                        {valueDisplay === "floating" &&
                          (isDragging ||
                            isFocused ||
                            (isHovered && state.focusedThumb == null)) && (
                            <span
                              aria-hidden="true"
                              data-slot="slider-floating-output"
                              className="border-border bg-background pointer-events-none absolute bottom-full mb-1 w-max max-w-32 truncate rounded-md border px-2 py-1 text-center text-xs font-medium tabular-nums shadow-sm"
                              style={{
                                insetInlineStart:
                                  state.getThumbPercent(index) < 0.25
                                    ? size === "xl"
                                      ? "0"
                                      : "calc(1.375rem - var(--dt-space-3))"
                                    : undefined,
                                insetInlineEnd:
                                  state.getThumbPercent(index) > 0.75
                                    ? size === "xl"
                                      ? "0"
                                      : "calc(1.375rem - var(--dt-space-3))"
                                    : undefined,
                              }}
                            >
                              {formatted[index]}
                            </span>
                          )}
                        {variant === "expressive" && Decoration ? (
                          <Decoration
                            dragging={isDragging}
                            active={isDragging || isFocused}
                            milestone={stops ? state.values[index] : undefined}
                            className={thumbVisual}
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            data-slot="slider-thumb-visual"
                            className={cn(
                              thumbVisual,
                              variant === "expressive" &&
                                "shadow-[0_0_0_5px_color-mix(in_srgb,var(--dt-color-primary)_10%,transparent)]",
                            )}
                          />
                        )}
                      </>
                    )}
                  </SliderThumbControl>
                ))}
              </SliderTrack>
              {stops && stops.some((stop) => stop.showLabel !== false) && (
                <div
                  aria-hidden="true"
                  data-slot="slider-marks"
                  className="text-muted-foreground mx-[var(--dt-space-3)] grid text-[11px] leading-4"
                  style={{
                    gridTemplateColumns: `repeat(${(stops.length - 1) * 2}, minmax(0, 1fr))`,
                  }}
                >
                  {stops.map((stop, index) => (
                    <span
                      key={stop.value}
                      className={cn(
                        "min-w-0 px-0.5 text-center [overflow-wrap:anywhere]",
                        index === 0
                          ? "-ms-[var(--dt-space-3)] w-[calc(100%+var(--dt-space-3))] text-start"
                          : index === stops.length - 1
                            ? "-me-[var(--dt-space-3)] w-[calc(100%+var(--dt-space-3))] justify-self-end text-end"
                            : "col-span-2",
                        state.values.includes(index) &&
                          "text-primary font-semibold",
                      )}
                    >
                      {stop.showLabel !== false ? stop.label : null}
                    </span>
                  ))}
                </div>
              )}
              {stops &&
                name &&
                state.values.map((position, index) => (
                  <input
                    key={index}
                    type="hidden"
                    name={Array.isArray(name) ? name[index] : name}
                    value={stops[position].value}
                    disabled={disabled}
                  />
                ))}

              {description && (
                <p
                  id={descriptionId}
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  {description}
                </p>
              )}
            </>
          );
        }}
      </AriaSlider>
    </I18nProvider>
  );
}

export const Slider = forwardRef(SliderImpl) as <
  T extends SliderValue = number,
>(
  props: SliderProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement;
