import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { Card, type CardProps } from "../card";
import { IconButton } from "../icon-button";

export type CardScrollerMaxVisibleCards = 1 | 2 | 3 | 4;
export type CardScrollerCardElement = ReactElement<CardProps>;

export interface CardScrollerItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  children: CardScrollerCardElement;
  disabled?: boolean;
  label: string;
  value: string;
}

export interface CardScrollerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> {
  children?:
    ReactElement<CardScrollerItemProps> | ReactElement<CardScrollerItemProps>[];
  defaultValue?: string;
  disabled?: boolean;
  maxVisibleCards?: CardScrollerMaxVisibleCards;
  name?: string;
  nextLabel?: string;
  onValueChange?: (value: string) => void;
  previousLabel?: string;
  showControls?: boolean;
  value?: string;
}

type InternalCardScrollerItemProps = CardScrollerItemProps & {
  __checked?: boolean;
  __dimmed?: boolean;
  __inputName?: string;
  __onSelect?: (value: string) => void;
  __onSpotlightChange?: (value: string | null) => void;
  __rootDisabled?: boolean;
  __spotlighted?: boolean;
};

const rootClasses =
  "group/card-scroller min-w-0 text-foreground [container-type:inline-size] [--card-scroller-columns:1] [--card-scroller-gap:var(--dt-density-gap)] [--card-scroller-max-visible:3] [--card-scroller-medium-visible:2]";

const viewportClasses =
  "flex min-w-0 snap-x snap-mandatory gap-[var(--card-scroller-gap)] overflow-x-auto overscroll-x-contain pb-[var(--dt-space-2)] [scrollbar-width:thin] motion-reduce:scroll-auto @[30rem]:snap-proximity @[30rem]:[--card-scroller-columns:var(--card-scroller-medium-visible)] @[52rem]:[--card-scroller-columns:var(--card-scroller-max-visible)]";

const itemClasses =
  "relative min-w-0 shrink-0 snap-start [flex-basis:calc((100%-(var(--card-scroller-columns)-1)*var(--card-scroller-gap))/var(--card-scroller-columns))] motion-safe:transition-[opacity,filter,transform] motion-safe:duration-200 motion-reduce:transition-none data-[dimmed=true]:opacity-60 data-[dimmed=true]:blur-[1px] data-[dimmed=true]:scale-[0.99] data-[spotlighted=true]:z-10 data-[spotlighted=true]:scale-[1.02] motion-reduce:data-[dimmed=true]:blur-none motion-reduce:data-[dimmed=true]:scale-100 motion-reduce:data-[spotlighted=true]:scale-100 forced-colors:data-[dimmed=true]:opacity-100 forced-colors:data-[dimmed=true]:blur-none forced-colors:data-[dimmed=true]:scale-100 forced-colors:data-[spotlighted=true]:scale-100";

const cardClasses =
  "h-full cursor-pointer motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-200 motion-reduce:transition-none group-focus-within/card-scroller-item:ring-2 group-focus-within/card-scroller-item:ring-ring group-focus-within/card-scroller-item:ring-offset-2 group-focus-within/card-scroller-item:ring-offset-background data-[selected=true]:border-primary data-[selected=true]:shadow-md data-[selected=true]:scale-[1.01] motion-reduce:data-[selected=true]:scale-100 forced-colors:shadow-none forced-colors:data-[selected=true]:outline forced-colors:data-[selected=true]:outline-2 forced-colors:data-[selected=true]:outline-[Highlight] forced-colors:data-[selected=true]:scale-100";

const controlsClasses =
  "mt-[var(--dt-space-3)] flex items-center justify-end gap-[var(--dt-space-2)]";

type ScrollBehaviorMode = "initial" | "subsequent";

function ChevronLeftIcon() {
  return (
    <svg
      className="rtl:rotate-180"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="rtl:rotate-180"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function getItems(children: CardScrollerProps["children"]) {
  const seenValues = new Set<string>();
  return Children.toArray(children).map((child) => {
    if (
      !isValidElement<CardScrollerItemProps>(child) ||
      child.type !== CardScrollerItem
    ) {
      throw new Error("CardScroller expects direct CardScrollerItem children.");
    }

    if (typeof child.props.value !== "string" || !child.props.value) {
      throw new Error("CardScrollerItem requires a non-empty string value.");
    }
    if (seenValues.has(child.props.value)) {
      throw new Error("CardScrollerItem values must be unique.");
    }
    seenValues.add(child.props.value);

    return child;
  });
}

function getCard(child: ReactNode) {
  if (
    Children.count(child) !== 1 ||
    !isValidElement<CardProps>(child) ||
    child.type !== Card
  ) {
    throw new Error("CardScrollerItem expects exactly one direct Card child.");
  }

  return child;
}

export function cardScrollerClassNames({
  className,
}: Pick<CardScrollerProps, "className"> = {}) {
  return cn(rootClasses, className);
}

export function cardScrollerItemClassNames({
  className,
}: Pick<CardScrollerItemProps, "className"> = {}) {
  return cn(itemClasses, className);
}

export const CardScrollerItem = forwardRef<
  HTMLDivElement,
  CardScrollerItemProps
>((props, ref) => {
  const {
    __checked = false,
    __dimmed = false,
    __inputName,
    __onSelect,
    __onSpotlightChange,
    __rootDisabled = false,
    __spotlighted = false,
    children,
    className,
    disabled = false,
    label,
    value,
    ...htmlProps
  } = props as InternalCardScrollerItemProps;
  const card = getCard(children);
  const isDisabled = disabled || __rootDisabled;
  const generatedId = useId();
  const inputId = `card-scroller-item-${generatedId}`;

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    htmlProps.onPointerEnter?.(event);
    if (
      !event.defaultPrevented &&
      event.pointerType !== "touch" &&
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches
    ) {
      __onSpotlightChange?.(value);
    }
  };
  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    htmlProps.onPointerLeave?.(event);
    if (!event.defaultPrevented) __onSpotlightChange?.(null);
  };
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    htmlProps.onFocus?.(event);
    if (!event.defaultPrevented) __onSpotlightChange?.(value);
  };
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    htmlProps.onBlur?.(event);
    if (!event.currentTarget.contains(event.relatedTarget))
      __onSpotlightChange?.(null);
  };

  return (
    <div
      {...htmlProps}
      ref={ref}
      data-card-scroller-item=""
      data-disabled={isDisabled ? "true" : undefined}
      data-dimmed={__dimmed ? "true" : undefined}
      data-selected={__checked ? "true" : "false"}
      data-spotlighted={__spotlighted ? "true" : undefined}
      className={cn(
        "group/card-scroller-item",
        cardScrollerItemClassNames({ className }),
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <input
        id={inputId}
        className="sr-only"
        type="radio"
        name={__inputName}
        value={value}
        checked={__checked}
        disabled={isDisabled}
        onChange={() => __onSelect?.(value)}
      />
      <label
        htmlFor={inputId}
        data-disabled={isDisabled ? "true" : undefined}
        className="absolute inset-0 z-10 cursor-pointer data-[disabled=true]:cursor-not-allowed"
      >
        <span className="sr-only">{label}</span>
      </label>
      {cloneElement(card, {
        className: cn(cardClasses, card.props.className),
        "data-selected": __checked ? "true" : "false",
        "aria-disabled": isDisabled ? true : undefined,
      } as CardProps)}
    </div>
  );
});

CardScrollerItem.displayName = "CardScrollerItem";

export const CardScroller = forwardRef<HTMLDivElement, CardScrollerProps>(
  (
    {
      children,
      className,
      defaultValue,
      disabled = false,
      maxVisibleCards = 3,
      name,
      nextLabel = "Next card",
      onValueChange,
      previousLabel = "Previous card",
      showControls = true,
      style,
      value,
      ...props
    },
    ref,
  ) => {
    const items = useMemo(() => getItems(children), [children]);
    const generatedName = useId();
    const inputName = name ?? `card-scroller-${generatedName}`;
    const firstEnabledValue =
      items.find((item) => !item.props.disabled)?.props.value ?? "";
    const defaultValueIsEnabled = items.some(
      (item) => item.props.value === defaultValue && !item.props.disabled,
    );
    const initialValue = defaultValueIsEnabled
      ? (defaultValue ?? "")
      : firstEnabledValue;
    const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
    const uncontrolledValueIsEnabled = items.some(
      (item) => item.props.value === uncontrolledValue && !item.props.disabled,
    );
    const selectedValue =
      value === undefined
        ? uncontrolledValueIsEnabled
          ? uncontrolledValue
          : firstEnabledValue
        : value;
    const [spotlightValue, setSpotlightValue] = useState<string | null>(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(true);
    const viewportRef = useRef<HTMLDivElement>(null);
    const didAlignInitialSelection = useRef(false);
    const lastAlignedValue = useRef<string | undefined>(undefined);

    const bringValueIntoView = useCallback(
      (nextValue: string, mode: ScrollBehaviorMode = "subsequent") => {
        const selected = Array.from(
          viewportRef.current?.querySelectorAll<HTMLElement>(
            "[data-card-scroller-item]",
          ) ?? [],
        ).find((_, index) => items[index]?.props.value === nextValue);
        selected?.scrollIntoView?.({
          behavior:
            mode === "initial" ||
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          block: "nearest",
          inline: "nearest",
        });
      },
      [items],
    );

    const updateScrollState = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const elements = Array.from(
        viewport.querySelectorAll<HTMLElement>("[data-card-scroller-item]"),
      );
      const first = elements[0];
      const last = elements.at(-1);
      const viewportRect = viewport.getBoundingClientRect();
      const rtl = getComputedStyle(viewport).direction === "rtl";
      const overflow = viewport.scrollWidth > viewport.clientWidth + 1;

      setHasOverflow(overflow);
      setAtStart(
        !overflow ||
          !first ||
          (rtl
            ? first.getBoundingClientRect().right <= viewportRect.right + 2
            : first.getBoundingClientRect().left >= viewportRect.left - 2),
      );
      setAtEnd(
        !overflow ||
          !last ||
          (rtl
            ? last.getBoundingClientRect().left >= viewportRect.left - 2
            : last.getBoundingClientRect().right <= viewportRect.right + 2),
      );
    }, []);

    useLayoutEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      updateScrollState();
      const observer =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(updateScrollState);
      observer?.observe(viewport);
      for (const item of viewport.querySelectorAll<HTMLElement>(
        "[data-card-scroller-item]",
      ))
        observer?.observe(item);
      viewport.addEventListener("scroll", updateScrollState, { passive: true });
      window.addEventListener("resize", updateScrollState);
      return () => {
        observer?.disconnect();
        viewport.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }, [items.length, maxVisibleCards, updateScrollState]);

    useLayoutEffect(() => {
      if (!didAlignInitialSelection.current) {
        didAlignInitialSelection.current = true;
        lastAlignedValue.current = selectedValue;
        if (
          selectedValue &&
          items.findIndex((item) => item.props.value === selectedValue) > 0
        ) {
          bringValueIntoView(selectedValue, "initial");
        }
        return;
      }

      if (lastAlignedValue.current === selectedValue) return;
      lastAlignedValue.current = selectedValue;
      if (selectedValue) bringValueIntoView(selectedValue);
    }, [bringValueIntoView, items, selectedValue]);

    const select = useCallback(
      (nextValue: string) => {
        if (disabled) return;
        if (nextValue === selectedValue) return;
        if (value === undefined) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      },
      [disabled, onValueChange, selectedValue, value],
    );

    const scrollByItem = (delta: -1 | 1) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const elements = Array.from(
        viewport.querySelectorAll<HTMLElement>("[data-card-scroller-item]"),
      );
      const viewportRect = viewport.getBoundingClientRect();
      const rtl = getComputedStyle(viewport).direction === "rtl";
      const leadingEdge = rtl ? viewportRect.right : viewportRect.left;
      let currentIndex = 0;
      let distance = Number.POSITIVE_INFINITY;
      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const itemEdge = rtl ? rect.right : rect.left;
        const nextDistance = Math.abs(itemEdge - leadingEdge);
        if (nextDistance < distance) {
          distance = nextDistance;
          currentIndex = index;
        }
      });
      const targetIndex = Math.min(
        elements.length - 1,
        Math.max(0, currentIndex + delta),
      );
      elements[targetIndex]?.scrollIntoView?.({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "auto"
          : "smooth",
        block: "nearest",
        inline: "start",
      });
    };

    return (
      <div
        {...props}
        ref={ref}
        role="radiogroup"
        data-disabled={disabled ? "true" : undefined}
        data-slot="card-scroller"
        className={cardScrollerClassNames({ className })}
        style={
          {
            ...style,
            "--card-scroller-max-visible": maxVisibleCards,
            "--card-scroller-medium-visible": Math.min(maxVisibleCards, 2),
          } as React.CSSProperties
        }
      >
        <div
          ref={viewportRef}
          data-slot="card-scroller-viewport"
          className={viewportClasses}
        >
          {items.map((item) =>
            cloneElement(item, {
              key: item.props.value,
              __checked: item.props.value === selectedValue,
              __dimmed:
                spotlightValue !== null && spotlightValue !== item.props.value,
              __inputName: inputName,
              __onSelect: select,
              __onSpotlightChange: setSpotlightValue,
              __rootDisabled: disabled,
              __spotlighted: spotlightValue === item.props.value,
            } as Partial<InternalCardScrollerItemProps>),
          )}
        </div>
        {showControls && hasOverflow ? (
          <div data-slot="card-scroller-controls" className={controlsClasses}>
            <IconButton
              aria-label={previousLabel}
              disabled={disabled || atStart}
              onClick={() => scrollByItem(-1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label={nextLabel}
              disabled={disabled || atEnd}
              onClick={() => scrollByItem(1)}
              size="sm"
              variant="outline"
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        ) : null}
      </div>
    );
  },
);

CardScroller.displayName = "CardScroller";
