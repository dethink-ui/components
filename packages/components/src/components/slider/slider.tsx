import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
  useId,
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
import { SliderThumbControl } from "./slider-thumb";
import { cn } from "../../utils/cn";

export type SliderValue = number | [number, number];
export type SliderSize = "sm" | "md" | "lg";
export type SliderValueDisplay = "inline" | "floating" | "none";
export interface SliderSlots {
  track?: string;
  fill?: string;
  thumb?: string;
  marks?: string;
  output?: string;
}
export interface SliderProps<T extends SliderValue = number> extends Omit<
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
> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T extends number ? number : [number, number]) => void;
  onValueCommit?: (value: T extends number ? number : [number, number]) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  name?: string | [string, string];
  thumbLabels?: [string, string];
  size?: SliderSize;
  valueDisplay?: SliderValueDisplay;
  className?: string;
  classNames?: SliderSlots;
  locale?: string;
}

const sizes: Record<SliderSize, string> = {
  sm: "[--dt-slider-track-height:0.25rem] [--dt-slider-thumb-size:1rem]",
  md: "[--dt-slider-track-height:0.375rem] [--dt-slider-thumb-size:1.25rem]",
  lg: "[--dt-slider-track-height:0.5rem] [--dt-slider-thumb-size:1.5rem]",
};

export function sliderClassNames({
  size = "md",
  className,
}: Pick<SliderProps, "size" | "className"> = {}) {
  return cn(
    "grid w-full min-w-0 gap-density-gap text-foreground data-[disabled]:opacity-50",
    sizes[size],
    className,
  );
}

function SliderImpl(
  {
    value,
    defaultValue,
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
  const range = Array.isArray(value ?? defaultValue);
  return (
    <I18nProvider locale={interactionLocale}>
      <AriaSlider
        {...props}
        ref={setRoot}
        dir={dir}
        value={value}
        defaultValue={defaultValue ?? (value === undefined ? min : undefined)}
        minValue={min}
        maxValue={max}
        step={step}
        isDisabled={disabled}
        orientation="horizontal"
        onChange={onValueChange}
        onChangeEnd={onValueCommit}
        aria-describedby={
          [describedBy, description ? descriptionId : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
        data-slot="slider"
        data-size={size}
        className={sliderClassNames({ size, className })}
      >
        {({ state }) => {
          const formatted = state.values.map((value) =>
            numberFormatter.format(value),
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
                  "relative mx-[var(--dt-space-3)] h-11 touch-none",
                  valueDisplay === "floating" && "mt-8",
                  classNames?.track,
                )}
              >
                <div
                  aria-hidden="true"
                  className="bg-muted absolute top-1/2 h-[var(--dt-slider-track-height)] w-full -translate-y-1/2 rounded-full forced-colors:border forced-colors:border-[GrayText]"
                />
                <div
                  aria-hidden="true"
                  data-slot="slider-fill"
                  className={cn(
                    "bg-primary pointer-events-none absolute top-1/2 h-[var(--dt-slider-track-height)] -translate-y-1/2 rounded-full forced-colors:bg-[Highlight]",
                    classNames?.fill,
                  )}
                  style={{
                    insetInlineStart: `${start}%`,
                    width: `${end - start}%`,
                  }}
                />
                {state.values.map((_, index) => (
                  <SliderThumbControl
                    trackRef={trackRef}
                    valueText={formatted[index]}
                    key={index}
                    index={index}
                    name={Array.isArray(name) ? name[index] : name}
                    label={range ? thumbLabels[index] : undefined}
                    className={cn(
                      "group top-1/2 flex size-11 cursor-grab items-center justify-center outline-none data-[disabled]:cursor-not-allowed data-[dragging]:cursor-grabbing data-[focus-visible]:z-10",
                      classNames?.thumb,
                    )}
                  >
                    {({ isDragging, isFocused, isHovered }) => (
                      <>
                        {valueDisplay === "floating" &&
                          (isDragging || isFocused || isHovered) && (
                            <span
                              aria-hidden="true"
                              data-slot="slider-floating-output"
                              className="border-border bg-background pointer-events-none absolute bottom-full mb-1 max-w-32 rounded-md border px-2 py-1 text-center text-xs font-medium tabular-nums shadow-sm"
                              style={{
                                insetInlineStart:
                                  index === 0 &&
                                  state.getThumbPercent(index) < 0.15
                                    ? "0"
                                    : undefined,
                                insetInlineEnd:
                                  state.getThumbPercent(index) > 0.85
                                    ? "0"
                                    : undefined,
                              }}
                            >
                              {formatted[index]}
                            </span>
                          )}
                        <span
                          aria-hidden="true"
                          className="border-primary bg-background group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-background pointer-events-none size-[var(--dt-slider-thumb-size)] rounded-full border-2 shadow-sm group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-offset-2 forced-colors:border-[Highlight]"
                        />
                      </>
                    )}
                  </SliderThumbControl>
                ))}
              </SliderTrack>
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
