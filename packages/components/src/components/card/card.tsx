import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  version as reactVersion,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type CardElement = "div" | "article" | "section" | "aside" | "li";
export type CardSurface = "default" | "muted" | "transparent";
export type CardBorder = "default" | "muted" | "none";
export type CardRadius = "md" | "lg";
export type CardShadow = "none" | "sm" | "md";
export type CardSpacing = "sm" | "md" | "lg";
export type CardHeaderElement = "div" | "header" | "section";
export type CardTitleElement = "div" | "h2" | "h3" | "h4" | "h5" | "h6";
export type CardDescriptionElement = "p" | "div" | "span";
export type CardActionElement = "div" | "span";
export type CardContentElement = "div" | "section";
export type CardFooterElement = "div" | "footer" | "section";
export type CardFooterJustify = "start" | "between" | "end";

type CardBaseProps = {
  as?: CardElement;
  asChild?: boolean;
  border?: CardBorder;
  radius?: CardRadius;
  shadow?: CardShadow;
  spacing?: CardSpacing;
  surface?: CardSurface;
};

type NativeCardProps = HTMLAttributes<HTMLElement> &
  CardBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildCardProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  CardBaseProps & {
    asChild: true;
    children: ReactElement<CardSlotProps>;
  };

export type CardProps = NativeCardProps | ChildCardProps;

export interface CardHeaderProps extends HTMLAttributes<HTMLElement> {
  as?: CardHeaderElement;
  children?: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLElement> {
  as?: CardTitleElement;
  children?: ReactNode;
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLElement> {
  as?: CardDescriptionElement;
  children?: ReactNode;
}

export interface CardActionProps extends HTMLAttributes<HTMLElement> {
  as?: CardActionElement;
  children?: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLElement> {
  as?: CardContentElement;
  children?: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLElement> {
  as?: CardFooterElement;
  children?: ReactNode;
  justify?: CardFooterJustify;
}

type CardSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
};

type CardElementWithRef = ReactElement<CardSlotProps> & {
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const cardBaseClasses = "box-border flex min-w-0 flex-col text-foreground";

const cardSurfaceClasses: Record<CardSurface, string> = {
  default: "bg-background",
  muted: "bg-muted",
  transparent: "bg-transparent",
};

const cardBorderClasses: Record<CardBorder, string> = {
  default: "border border-border",
  muted: "border border-muted",
  none: "border-0",
};

const cardRadiusClasses: Record<CardRadius, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
};

const cardShadowClasses: Record<CardShadow, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
};

const cardSpacingClasses: Record<CardSpacing, string> = {
  sm: "[--card-gap:var(--dt-density-gap)] [--card-padding:calc(var(--dt-density-gap)*2)]",
  md: "[--card-gap:calc(var(--dt-density-gap)*1.5)] [--card-padding:calc(var(--dt-density-gap)*3)]",
  lg: "[--card-gap:calc(var(--dt-density-gap)*2)] [--card-padding:calc(var(--dt-density-gap)*4)]",
};

const cardHeaderBaseClasses =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-density-gap gap-y-[var(--dt-space-1-5)] px-[var(--card-padding)] pt-[var(--card-padding)] last:pb-[var(--card-padding)]";

const cardTitleBaseClasses =
  "col-start-1 min-w-0 font-heading text-lg font-semibold leading-snug tracking-normal text-foreground";

const cardDescriptionBaseClasses =
  "col-start-1 min-w-0 text-sm leading-6 text-muted-foreground";

const cardActionBaseClasses =
  "col-start-2 row-span-2 row-start-1 ms-[var(--dt-space-4)] flex shrink-0 items-center justify-self-end";

const cardContentBaseClasses =
  "min-w-0 px-[var(--card-padding)] first:pt-[var(--card-padding)] last:pb-[var(--card-padding)]";

const cardFooterBaseClasses =
  "flex min-w-0 flex-wrap items-center gap-density-gap px-[var(--card-padding)] pb-[var(--card-padding)] first:pt-[var(--card-padding)]";

const cardFooterJustifyClasses: Record<CardFooterJustify, string> = {
  start: "justify-start",
  between: "justify-between",
  end: "justify-end",
};

export function cardClassNames({
  border = "default",
  className,
  radius = "lg",
  shadow = "sm",
  spacing = "md",
  surface = "default",
}: Pick<
  CardProps,
  "border" | "className" | "radius" | "shadow" | "spacing" | "surface"
> = {}) {
  return cn(
    cardBaseClasses,
    cardSurfaceClasses[surface],
    cardBorderClasses[border],
    cardRadiusClasses[radius],
    cardShadowClasses[shadow],
    cardSpacingClasses[spacing],
    "gap-[var(--card-gap)]",
    className,
  );
}

export function cardHeaderClassNames({
  className,
}: Pick<CardHeaderProps, "className"> = {}) {
  return cn(cardHeaderBaseClasses, className);
}

export function cardTitleClassNames({
  className,
}: Pick<CardTitleProps, "className"> = {}) {
  return cn(cardTitleBaseClasses, className);
}

export function cardDescriptionClassNames({
  className,
}: Pick<CardDescriptionProps, "className"> = {}) {
  return cn(cardDescriptionBaseClasses, className);
}

export function cardActionClassNames({
  className,
}: Pick<CardActionProps, "className"> = {}) {
  return cn(cardActionBaseClasses, className);
}

export function cardContentClassNames({
  className,
}: Pick<CardContentProps, "className"> = {}) {
  return cn(cardContentBaseClasses, className);
}

export function cardFooterClassNames({
  className,
  justify = "start",
}: Pick<CardFooterProps, "className" | "justify"> = {}) {
  return cn(
    cardFooterBaseClasses,
    cardFooterJustifyClasses[justify],
    className,
  );
}

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

function getChildRef(child: ReactElement<CardSlotProps>) {
  if ("ref" in child.props) {
    return child.props.ref;
  }

  return reactVersion.startsWith("18.")
    ? (child as CardElementWithRef).ref
    : undefined;
}

function isEventHandler(key: string, value: unknown): value is EventHandler {
  return /^on[A-Z]/.test(key) && typeof value === "function";
}

function isDefaultPreventedEvent(
  event: unknown,
): event is { defaultPrevented: boolean } {
  return (
    typeof event === "object" &&
    event !== null &&
    "defaultPrevented" in event &&
    event.defaultPrevented === true
  );
}

function composeEventHandlers(
  componentHandler: EventHandler,
  childHandler: EventHandler,
): EventHandler {
  return (...args) => {
    componentHandler(...args);

    if (!isDefaultPreventedEvent(args[0])) {
      childHandler(...args);
    }
  };
}

function composeSlotProps(
  componentProps: Record<string, unknown>,
  childProps: CardSlotProps,
) {
  const composedProps: CardSlotProps = {
    ...componentProps,
    ...childProps,
  };

  for (const [key, componentValue] of Object.entries(componentProps)) {
    const childValue = childProps[key];

    if (
      isEventHandler(key, componentValue) &&
      isEventHandler(key, childValue)
    ) {
      composedProps[key] = composeEventHandlers(componentValue, childValue);
    }
  }

  return composedProps;
}

function getCardDataAttributes({
  as,
  asChild,
  border,
  radius,
  shadow,
  spacing,
  surface,
}: Required<
  Pick<CardBaseProps, "border" | "radius" | "shadow" | "spacing" | "surface">
> &
  Pick<CardBaseProps, "as" | "asChild">) {
  return {
    "data-slot": "card",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-surface": surface,
    "data-border": border,
    "data-radius": radius,
    "data-shadow": shadow,
    "data-spacing": spacing,
  };
}

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      as = "div",
      asChild = false,
      border = "default",
      children,
      className,
      radius = "lg",
      shadow = "sm",
      spacing = "md",
      surface = "default",
      ...props
    },
    ref,
  ) => {
    const classes = cardClassNames({
      border,
      className,
      radius,
      shadow,
      spacing,
      surface,
    });
    const dataAttributes = getCardDataAttributes({
      as,
      asChild,
      border,
      radius,
      shadow,
      spacing,
      surface,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<CardSlotProps>(child)) {
        throw new Error(
          "Card with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const composedProps = composeSlotProps(props, child.props);

      return cloneElement(child, {
        ...composedProps,
        ...dataAttributes,
        ref: composeRefs(ref as Ref<HTMLElement>, childRef),
        className: cn(classes, child.props.className),
      });
    }

    return createElement(
      as,
      {
        ...props,
        ...dataAttributes,
        ref: ref as ForwardedRef<HTMLElement>,
        className: classes,
      },
      children,
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLElement, CardHeaderProps>(
  ({ as = "div", children, className, ...props }, ref) =>
    createElement(
      as,
      {
        ...props,
        ref: ref as ForwardedRef<HTMLElement>,
        "data-slot": "card-header",
        "data-element": as,
        className: cardHeaderClassNames({ className }),
      },
      children,
    ),
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLElement, CardTitleProps>(
  ({ as = "h3", children, className, ...props }, ref) =>
    createElement(
      as,
      {
        ...props,
        ref: ref as ForwardedRef<HTMLElement>,
        "data-slot": "card-title",
        "data-element": as,
        className: cardTitleClassNames({ className }),
      },
      children,
    ),
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLElement, CardDescriptionProps>(
  ({ as = "p", children, className, ...props }, ref) =>
    createElement(
      as,
      {
        ...props,
        ref: ref as ForwardedRef<HTMLElement>,
        "data-slot": "card-description",
        "data-element": as,
        className: cardDescriptionClassNames({ className }),
      },
      children,
    ),
);

CardDescription.displayName = "CardDescription";

export const CardAction = forwardRef<HTMLElement, CardActionProps>(
  ({ as = "div", children, className, ...props }, ref) =>
    createElement(
      as,
      {
        ...props,
        ref: ref as ForwardedRef<HTMLElement>,
        "data-slot": "card-action",
        "data-element": as,
        className: cardActionClassNames({ className }),
      },
      children,
    ),
);

CardAction.displayName = "CardAction";

export const CardContent = forwardRef<HTMLElement, CardContentProps>(
  ({ as = "div", children, className, ...props }, ref) =>
    createElement(
      as,
      {
        ...props,
        ref: ref as ForwardedRef<HTMLElement>,
        "data-slot": "card-content",
        "data-element": as,
        className: cardContentClassNames({ className }),
      },
      children,
    ),
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLElement, CardFooterProps>(
  ({ as = "div", children, className, justify = "start", ...props }, ref) =>
    createElement(
      as,
      {
        ...props,
        ref: ref as ForwardedRef<HTMLElement>,
        "data-slot": "card-footer",
        "data-element": as,
        "data-justify": justify,
        className: cardFooterClassNames({ className, justify }),
      },
      children,
    ),
);

CardFooter.displayName = "CardFooter";
