import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  version as reactVersion,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";
import { Card, type CardProps } from "../card";
import { IconButton } from "../icon-button";
import {
  CardStackRendererContext,
  StaticCardStackDeck,
  StaticCardStackFrame,
} from "./card-stack-renderer";

export type CardStackMode = "stack" | "open";
export type CardStackCardElement = ReactElement<CardProps>;

export interface CardStackProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  activeIndex?: number;
  angle?: number;
  children?: CardStackCardElement | CardStackCardElement[];
  defaultActiveIndex?: number;
  /** Explicit labels for selectors and the active-card announcement. */
  getCardLabel?: (index: number) => string;
  /** Maximum visible cards, including the active card (1–9). Others stay mounted. */
  visibleCount?: number;
  loop?: boolean;
  mode?: CardStackMode;
  nextLabel?: string;
  onActiveIndexChange?: (index: number) => void;
  previousLabel?: string;
  showControls?: boolean;
  showNextControl?: boolean;
  showPreviousControl?: boolean;
  stackOffset?: number;
}

type CardStackItemStyle = CSSProperties & {
  "--card-stack-rotate"?: string;
  "--card-stack-scale"?: string;
  "--card-stack-translate"?: string;
};

type InjectedCardProps = CardProps & {
  "aria-hidden"?: boolean;
  "data-card-stack-active"?: "true" | "false";
  "data-card-stack-depth"?: number;
  "data-card-stack-index"?: number;
  "data-card-stack-position"?: "active" | "before" | "after" | "behind";
  inert?: boolean;
};

const cardStackRootClasses =
  "relative isolate min-w-0 text-foreground [--card-stack-direction:1] rtl:[--card-stack-direction:-1] [--card-stack-max-width:24rem] data-[mode=open]:[--card-stack-max-width:32rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const cardStackDeckClasses =
  "relative mx-auto grid w-full max-w-[min(100%,var(--card-stack-max-width))] place-items-center overflow-visible px-[6%] py-[var(--dt-space-8)] data-[mode=open]:px-[10%] data-[mode=open]:py-[var(--dt-space-12)]";

const cardStackItemClasses =
  "group/card-stack-item col-start-1 row-start-1 w-full min-w-0 rounded-lg [rotate:calc(var(--card-stack-rotate)*var(--card-stack-direction))] [scale:var(--card-stack-scale)] [translate:var(--card-stack-translate)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[translate,rotate,scale,opacity] motion-safe:duration-[var(--dt-motion-standard)] motion-safe:ease-control motion-reduce:transition-none";

const cardStackCardClasses =
  "relative w-full motion-safe:transition-[translate,box-shadow,border-color,background-color] motion-safe:duration-[var(--dt-motion-fast)] motion-reduce:transition-none";

const cardStackControlsClasses =
  "relative z-50 mx-auto flex w-fit items-center justify-center gap-3 pb-2";

// React 18 serializes unknown DOM attributes; React 19 understands boolean inert.
const inertAttribute = (
  Number.parseInt(reactVersion, 10) < 19 ? "" : true
) as true;

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function normalizeIndex(
  index: number | undefined,
  count: number,
  loop: boolean,
) {
  if (count <= 0) {
    return -1;
  }

  const safeIndex = Number.isFinite(index) ? Number(index) : 0;

  if (loop) {
    return positiveModulo(Math.trunc(safeIndex), count);
  }

  return clampNumber(Math.trunc(safeIndex), 0, count - 1);
}

function getForwardDistance(index: number, activeIndex: number, count: number) {
  if (count <= 0 || index === activeIndex) {
    return 0;
  }

  return positiveModulo(index - activeIndex, count);
}

function getOpenRelativePosition(
  index: number,
  activeIndex: number,
  count: number,
  loop = true,
) {
  let relativePosition = index - activeIndex;

  if (loop && count > 2) {
    const halfCount = count / 2;

    if (relativePosition > halfCount) {
      relativePosition -= count;
    }

    if (relativePosition < -halfCount) {
      relativePosition += count;
    }
  }

  return relativePosition;
}

function getCardStackPosition(
  mode: CardStackMode,
  relativePosition: number,
  isActive: boolean,
) {
  if (isActive) {
    return "active";
  }

  if (mode === "stack") {
    return "behind";
  }

  return relativePosition < 0 ? "before" : "after";
}

function getItemStyle({
  activeIndex,
  angle,
  count,
  index,
  mode,
  stackOffset,
  loop,
}: {
  activeIndex: number;
  angle: number;
  count: number;
  index: number;
  mode: CardStackMode;
  stackOffset: number;
  loop: boolean;
}): { depth: number; relativePosition: number; style: CardStackItemStyle } {
  const isActive = index === activeIndex;
  const safeAngle = clampNumber(angle, 0, 30);
  const safeStackOffset = clampNumber(stackOffset, 0, 32);

  if (mode === "open") {
    const relativePosition = getOpenRelativePosition(
      index,
      activeIndex,
      count,
      loop,
    );
    const depth = Math.abs(relativePosition);
    const x = relativePosition * 12;
    const y = depth * 10;
    const rotate = clampNumber(relativePosition * safeAngle, -60, 60);
    const scale = Math.max(0.88, 1 - depth * 0.035);

    return {
      depth,
      relativePosition,
      style: {
        "--card-stack-rotate": `${rotate}deg`,
        "--card-stack-scale": String(isActive ? 1 : scale),
        "--card-stack-translate": `calc(${x}% * var(--card-stack-direction)) ${y}px`,
        zIndex: isActive ? count + 20 : count - depth,
      },
    };
  }

  const depth = isActive
    ? 0
    : Math.min(getForwardDistance(index, activeIndex, count), 4);
  const rotate = isActive ? 0 : depth * 0.75;
  const scale = Math.max(0.9, 1 - depth * 0.02);
  const offset = depth * safeStackOffset;

  return {
    depth,
    relativePosition: isActive ? 0 : depth,
    style: {
      "--card-stack-rotate": `${rotate}deg`,
      "--card-stack-scale": String(isActive ? 1 : scale),
      "--card-stack-translate": `calc(${offset}px * var(--card-stack-direction)) ${offset}px`,
      zIndex: isActive ? count + 20 : count - depth,
    },
  };
}

function getCardChildren(children: CardStackProps["children"]) {
  const childArray = Children.toArray(children);

  return childArray.map((child) => {
    if (!isValidElement<CardProps>(child) || child.type !== Card) {
      throw new Error("CardStack expects direct Card children.");
    }

    return child as CardStackCardElement;
  });
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="rtl:rotate-180"
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
      aria-hidden="true"
      className="rtl:rotate-180"
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

export function cardStackClassNames({
  className,
}: Pick<CardStackProps, "className"> = {}) {
  return cn(cardStackRootClasses, className);
}

export const CardStack = forwardRef<HTMLDivElement, CardStackProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      activeIndex,
      angle = 15,
      children,
      className,
      defaultActiveIndex = 0,
      getCardLabel,
      visibleCount = 5,
      onFocusCapture,
      onBlurCapture,
      loop = true,
      mode = "stack",
      nextLabel = "Show next card",
      onActiveIndexChange,
      onKeyDown,
      previousLabel = "Show previous card",
      role = "group",
      showControls,
      showNextControl,
      showPreviousControl,
      stackOffset = 8,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const renderer = useContext(CardStackRendererContext);
    const Frame = renderer?.Frame ?? StaticCardStackFrame;
    const Deck = renderer?.Deck ?? StaticCardStackDeck;
    const cards = useMemo(() => getCardChildren(children), [children]);
    const cardCount = cards.length;
    const isControlled = activeIndex !== undefined;
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const focusedCardKey = useRef<string | null>(null);
    const [selection, setSelection] = useState(() => {
      const index = normalizeIndex(defaultActiveIndex, cardCount, loop);
      return { index, key: cards[index]?.key ?? null };
    });
    const anchoredIndex =
      selection.key === null
        ? -1
        : cards.findIndex((card) => card.key === selection.key);
    const resolvedActiveIndex = isControlled
      ? normalizeIndex(activeIndex, cardCount, loop)
      : anchoredIndex >= 0
        ? anchoredIndex
        : normalizeIndex(
            selection.index === -1 ? defaultActiveIndex : selection.index,
            cardCount,
            false,
          );
    const activeKey = cards[resolvedActiveIndex]?.key ?? null;
    const [navigation, setNavigation] = useState({
      index: resolvedActiveIndex,
      direction: 1,
    });
    if (navigation.index !== resolvedActiveIndex) {
      setNavigation({
        index: resolvedActiveIndex,
        direction: resolvedActiveIndex >= navigation.index ? 1 : -1,
      });
    }
    if (
      !isControlled &&
      (selection.index !== resolvedActiveIndex || selection.key !== activeKey)
    ) {
      setSelection({ index: resolvedActiveIndex, key: activeKey });
    }
    useEffect(() => {
      if (
        focusedCardKey.current !== null &&
        focusedCardKey.current !== activeKey
      ) {
        const root = rootRef.current;
        const focused = root?.ownerDocument.activeElement;
        if (
          root &&
          (focused === root.ownerDocument.body ||
            (focused && root.contains(focused)))
        ) {
          root.focus({ preventScroll: true });
        }
        focusedCardKey.current = null;
      }
    }, [activeKey]);
    const limit = Math.trunc(clampNumber(visibleCount, 1, 9));
    const visibleIndices = new Set<number>();
    for (
      let step = 0;
      step < cardCount && visibleIndices.size < limit;
      step++
    ) {
      const offset =
        mode === "open" ? (step % 2 ? (step + 1) / 2 : -step / 2) : step;
      const candidate = resolvedActiveIndex + offset;
      if (loop) visibleIndices.add(positiveModulo(candidate, cardCount));
      else if (candidate >= 0 && candidate < cardCount)
        visibleIndices.add(candidate);
    }
    // At a non-looping edge, fill unused fan positions from the remaining side.
    if (mode === "open" && !loop) {
      for (
        let distance = 1;
        distance < cardCount && visibleIndices.size < limit;
        distance++
      ) {
        for (const candidate of [
          resolvedActiveIndex + distance,
          resolvedActiveIndex - distance,
        ]) {
          if (
            candidate >= 0 &&
            candidate < cardCount &&
            visibleIndices.size < limit
          )
            visibleIndices.add(candidate);
        }
      }
    }
    const activeLabel =
      resolvedActiveIndex >= 0
        ? getCardLabel?.(resolvedActiveIndex)?.trim()
        : undefined;
    const canMovePrevious = cardCount > 1 && (loop || resolvedActiveIndex > 0);
    const canMoveNext =
      cardCount > 1 && (loop || resolvedActiveIndex < cardCount - 1);
    const controlsVisible = showControls ?? (mode === "stack" && cardCount > 1);
    const previousControlVisible = showPreviousControl ?? controlsVisible;
    const nextControlVisible = showNextControl ?? controlsVisible;
    const controlsRendered = previousControlVisible || nextControlVisible;
    const resolvedTabIndex = tabIndex ?? (cardCount > 1 ? 0 : -1);

    const setActiveIndex = useCallback(
      (nextIndex: number) => {
        const normalizedIndex = normalizeIndex(nextIndex, cardCount, loop);

        if (normalizedIndex === -1) {
          return;
        }

        if (!isControlled) {
          setSelection({
            index: normalizedIndex,
            key: cards[normalizedIndex]?.key ?? null,
          });
        }

        if (normalizedIndex !== resolvedActiveIndex) {
          setNavigation({
            index: normalizedIndex,
            direction: nextIndex >= resolvedActiveIndex ? 1 : -1,
          });
          onActiveIndexChange?.(normalizedIndex);
        }
      },
      [
        cardCount,
        cards,
        isControlled,
        loop,
        onActiveIndexChange,
        resolvedActiveIndex,
        setNavigation,
      ],
    );

    const movePrevious = useCallback(() => {
      if (!canMovePrevious) {
        return;
      }

      setActiveIndex(resolvedActiveIndex - 1);
    }, [canMovePrevious, resolvedActiveIndex, setActiveIndex]);

    const moveNext = useCallback(() => {
      if (!canMoveNext) {
        return;
      }

      setActiveIndex(resolvedActiveIndex + 1);
    }, [canMoveNext, resolvedActiveIndex, setActiveIndex]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (
        event.defaultPrevented ||
        event.target !== event.currentTarget ||
        cardCount <= 1
      ) {
        return;
      }

      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      if (
        event.key === (rtl ? "ArrowRight" : "ArrowLeft") ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        movePrevious();
        return;
      }

      if (
        event.key === (rtl ? "ArrowLeft" : "ArrowRight") ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        moveNext();
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        setActiveIndex(cardCount - 1);
      }
    };

    const accessibleNameProps = ariaLabelledBy
      ? { "aria-labelledby": ariaLabelledBy }
      : { "aria-label": ariaLabel ?? "Card stack" };

    return (
      <div
        {...props}
        {...accessibleNameProps}
        ref={rootRef}
        role={role}
        tabIndex={resolvedTabIndex}
        data-slot="card-stack"
        data-mode={mode}
        data-loop={loop ? "true" : "false"}
        data-count={cardCount}
        data-active-index={
          resolvedActiveIndex === -1 ? undefined : resolvedActiveIndex
        }
        className={cardStackClassNames({ className })}
        onKeyDown={handleKeyDown}
        onFocusCapture={(event) => {
          onFocusCapture?.(event);
          const item = (event.target as HTMLElement).closest<HTMLElement>(
            '[data-slot="card-stack-item"]',
          );
          focusedCardKey.current = item
            ? String(cards[Number(item.dataset.cardStackIndex)]?.key ?? "")
            : null;
        }}
        onBlurCapture={(event) => {
          onBlurCapture?.(event);
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget as Node)
          )
            focusedCardKey.current = null;
        }}
      >
        <Deck
          data-slot="card-stack-deck"
          navigation={{
            previous: movePrevious,
            next: moveNext,
            activeIndex: resolvedActiveIndex,
          }}
          data-mode={mode}
          className={cardStackDeckClasses}
        >
          {cards.map((card, index) => {
            const isActive = index === resolvedActiveIndex;
            const visible = visibleIndices.has(index);
            const label = getCardLabel?.(index)?.trim();
            const { depth, relativePosition, style } = getItemStyle({
              activeIndex: resolvedActiveIndex,
              angle,
              count: cardCount,
              index,
              mode,
              stackOffset,
              loop,
            });
            const position = getCardStackPosition(
              mode,
              relativePosition,
              isActive,
            );
            const inactiveOpenCard = mode === "open" && !isActive && visible;
            const handleInactiveClick = (event: MouseEvent<HTMLDivElement>) => {
              if (!inactiveOpenCard) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              setActiveIndex(index);
            };
            const clonedCard = cloneElement(card, {
              "aria-hidden": isActive ? card.props["aria-hidden"] : true,
              "data-card-stack-active": isActive ? "true" : "false",
              "data-card-stack-depth": depth,
              "data-card-stack-index": index,
              "data-card-stack-position": position,
              inert: isActive ? undefined : inertAttribute,
              onClick: isActive ? card.props.onClick : undefined,
              tabIndex: isActive ? card.props.tabIndex : -1,
              className: cn(
                card.props.className,
                cardStackCardClasses,
                !isActive && "pointer-events-none select-none",
                inactiveOpenCard &&
                  "motion-safe:group-hover/card-stack-item:-translate-y-1 motion-safe:group-focus-visible/card-stack-item:-translate-y-1",
              ),
            } as Partial<InjectedCardProps>);

            return (
              <Frame
                key={card.key ?? index}
                frame={{
                  active: isActive,
                  visible,
                  direction: navigation.direction,
                  count: cardCount,
                }}
                data-slot="card-stack-item"
                data-card-stack-visible={visible ? "true" : "false"}
                aria-hidden={!visible || undefined}
                inert={!visible ? inertAttribute : undefined}
                data-card-stack-active={isActive ? "true" : "false"}
                data-card-stack-index={index}
                data-card-stack-position={position}
                className={cn(
                  cardStackItemClasses,
                  inactiveOpenCard && "cursor-pointer",
                )}
                style={{
                  ...style,
                  visibility: visible ? undefined : "hidden",
                  pointerEvents: visible ? undefined : "none",
                }}
                role={inactiveOpenCard ? "button" : undefined}
                tabIndex={inactiveOpenCard ? 0 : undefined}
                aria-label={
                  inactiveOpenCard
                    ? label
                      ? `Show ${label}`
                      : `Show card ${index + 1}`
                    : undefined
                }
                onKeyDown={(event) => {
                  if (
                    inactiveOpenCard &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.key === "Enter") {
                      event.currentTarget
                        .closest<HTMLElement>('[data-slot="card-stack"]')
                        ?.focus({ preventScroll: true });
                      setActiveIndex(index);
                    }
                  }
                }}
                onKeyUp={(event) => {
                  if (inactiveOpenCard && event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget
                      .closest<HTMLElement>('[data-slot="card-stack"]')
                      ?.focus({ preventScroll: true });
                    setActiveIndex(index);
                  }
                }}
                onClick={handleInactiveClick}
              >
                {clonedCard}
              </Frame>
            );
          })}
        </Deck>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {cardCount > 1
            ? `Card ${resolvedActiveIndex + 1} of ${cardCount}${activeLabel ? `: ${activeLabel}` : ""}`
            : ""}
        </span>
        {controlsRendered ? (
          <div
            data-slot="card-stack-controls"
            className={cardStackControlsClasses}
          >
            {previousControlVisible ? (
              <IconButton
                aria-label={previousLabel}
                className="pointer-events-auto"
                disabled={!canMovePrevious}
                shape="circle"
                size="sm"
                variant="outline"
                onClick={movePrevious}
              >
                <ChevronLeftIcon />
              </IconButton>
            ) : (
              <span aria-hidden="true" className="pointer-events-none" />
            )}
            {nextControlVisible ? (
              <IconButton
                aria-label={nextLabel}
                className="pointer-events-auto"
                disabled={!canMoveNext}
                shape="circle"
                size="sm"
                variant="outline"
                onClick={moveNext}
              >
                <ChevronRightIcon />
              </IconButton>
            ) : (
              <span aria-hidden="true" className="pointer-events-none" />
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

CardStack.displayName = "CardStack";
