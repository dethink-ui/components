import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";
import { Card, type CardProps } from "../card";
import { IconButton } from "../icon-button";

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
  loop?: boolean;
  mode?: CardStackMode;
  nextLabel?: string;
  onActiveIndexChange?: (index: number) => void;
  previousLabel?: string;
  showControls?: boolean;
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
  "relative min-w-0 text-foreground [--card-stack-max-width:24rem] data-[mode=open]:[--card-stack-max-width:32rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const cardStackDeckClasses =
  "relative mx-auto grid w-full max-w-[min(100%,var(--card-stack-max-width))] place-items-center overflow-visible px-[var(--dt-space-10)] py-[var(--dt-space-8)] data-[mode=open]:px-[calc(var(--dt-space-8)*2)] data-[mode=open]:py-[var(--dt-space-12)]";

const cardStackItemClasses =
  "col-start-1 row-start-1 w-full min-w-0 transform-gpu will-change-transform [rotate:var(--card-stack-rotate)] [scale:var(--card-stack-scale)] [translate:var(--card-stack-translate)] motion-safe:transition-[translate,rotate,scale,opacity] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none";

const cardStackCardClasses =
  "relative w-full motion-safe:transition-[box-shadow,border-color,background-color] motion-safe:duration-200 motion-reduce:transition-none";

const cardStackControlsClasses =
  "pointer-events-none absolute left-1/2 top-1/2 z-50 flex w-full max-w-[var(--card-stack-max-width)] -translate-x-1/2 -translate-y-1/2 items-center justify-between";

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
) {
  let relativePosition = index - activeIndex;

  if (count > 2) {
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
}: {
  activeIndex: number;
  angle: number;
  count: number;
  index: number;
  mode: CardStackMode;
  stackOffset: number;
}): { depth: number; relativePosition: number; style: CardStackItemStyle } {
  const isActive = index === activeIndex;
  const safeAngle = clampNumber(angle, 0, 30);
  const safeStackOffset = clampNumber(stackOffset, 0, 32);

  if (mode === "open") {
    const relativePosition = getOpenRelativePosition(index, activeIndex, count);
    const depth = Math.abs(relativePosition);
    const x = relativePosition * 48;
    const y = depth * 10;
    const rotate = clampNumber(relativePosition * safeAngle, -60, 60);
    const scale = Math.max(0.88, 1 - depth * 0.035);

    return {
      depth,
      relativePosition,
      style: {
        "--card-stack-rotate": `${rotate}deg`,
        "--card-stack-scale": String(isActive ? 1 : scale),
        "--card-stack-translate": `${x}px ${y}px`,
        opacity: isActive ? 1 : Math.max(0.78, 1 - depth * 0.06),
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
      "--card-stack-translate": `${offset}px ${offset}px`,
      opacity: isActive ? 1 : Math.max(0.78, 1 - depth * 0.05),
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
      loop = true,
      mode = "stack",
      nextLabel = "Show next card",
      onActiveIndexChange,
      onKeyDown,
      previousLabel = "Show previous card",
      role = "group",
      showControls,
      stackOffset = 8,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const cards = useMemo(() => getCardChildren(children), [children]);
    const cardCount = cards.length;
    const isControlled = activeIndex !== undefined;
    const [uncontrolledActiveIndex, setUncontrolledActiveIndex] = useState(() =>
      normalizeIndex(defaultActiveIndex, cardCount, loop),
    );
    const seededUncontrolledActiveIndex =
      uncontrolledActiveIndex === -1 && cardCount > 0
        ? normalizeIndex(defaultActiveIndex, cardCount, loop)
        : uncontrolledActiveIndex;
    const resolvedActiveIndex = normalizeIndex(
      isControlled ? activeIndex : seededUncontrolledActiveIndex,
      cardCount,
      loop,
    );
    const canMovePrevious = cardCount > 1 && (loop || resolvedActiveIndex > 0);
    const canMoveNext =
      cardCount > 1 && (loop || resolvedActiveIndex < cardCount - 1);
    const controlsVisible = showControls ?? (mode === "stack" && cardCount > 1);
    const resolvedTabIndex = tabIndex ?? (cardCount > 1 ? 0 : undefined);

    useEffect(() => {
      if (isControlled || cardCount === 0) {
        return;
      }

      const normalizedIndex =
        uncontrolledActiveIndex === -1
          ? normalizeIndex(defaultActiveIndex, cardCount, loop)
          : normalizeIndex(uncontrolledActiveIndex, cardCount, loop);

      if (normalizedIndex !== uncontrolledActiveIndex) {
        setUncontrolledActiveIndex(normalizedIndex);
      }
    }, [
      cardCount,
      defaultActiveIndex,
      isControlled,
      loop,
      uncontrolledActiveIndex,
    ]);

    const setActiveIndex = useCallback(
      (nextIndex: number) => {
        const normalizedIndex = normalizeIndex(nextIndex, cardCount, loop);

        if (normalizedIndex === -1) {
          return;
        }

        if (!isControlled) {
          setUncontrolledActiveIndex(normalizedIndex);
        }

        if (normalizedIndex !== resolvedActiveIndex) {
          onActiveIndexChange?.(normalizedIndex);
        }
      },
      [cardCount, isControlled, loop, onActiveIndexChange, resolvedActiveIndex],
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

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        movePrevious();
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
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
        ref={ref}
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
      >
        <div
          data-slot="card-stack-deck"
          data-mode={mode}
          className={cardStackDeckClasses}
        >
          {cards.map((card, index) => {
            const isActive = index === resolvedActiveIndex;
            const { depth, relativePosition, style } = getItemStyle({
              activeIndex: resolvedActiveIndex,
              angle,
              count: cardCount,
              index,
              mode,
              stackOffset,
            });
            const position = getCardStackPosition(
              mode,
              relativePosition,
              isActive,
            );
            const inactiveOpenCard = mode === "open" && !isActive;
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
              inert: isActive ? undefined : true,
              onClick: isActive ? card.props.onClick : undefined,
              tabIndex: isActive ? card.props.tabIndex : -1,
              className: cn(
                card.props.className,
                cardStackCardClasses,
                !isActive && "pointer-events-none select-none",
              ),
            } as Partial<InjectedCardProps>);

            return (
              <div
                key={card.key ?? index}
                data-slot="card-stack-item"
                data-card-stack-active={isActive ? "true" : "false"}
                data-card-stack-index={index}
                data-card-stack-position={position}
                className={cn(
                  cardStackItemClasses,
                  inactiveOpenCard && "cursor-pointer",
                )}
                style={style}
                onClick={handleInactiveClick}
              >
                {clonedCard}
              </div>
            );
          })}
        </div>
        {controlsVisible ? (
          <div
            data-slot="card-stack-controls"
            className={cardStackControlsClasses}
          >
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
          </div>
        ) : null}
      </div>
    );
  },
);

CardStack.displayName = "CardStack";
