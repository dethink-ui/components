import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  type ForwardedRef,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type BoxElement =
  | "div"
  | "section"
  | "article"
  | "main"
  | "aside"
  | "nav"
  | "header"
  | "footer"
  | "ul"
  | "ol"
  | "li"
  | "span";

export type BoxDisplay =
  | "block"
  | "inline"
  | "inline-block"
  | "contents"
  | "flex"
  | "inline-flex"
  | "grid";

export type BoxSpacing =
  "none" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";

export type BoxSurface =
  | "transparent"
  | "background"
  | "muted"
  | "primary"
  | "destructive"
  | "success"
  | "warning"
  | "info";

export type BoxBorder =
  | "none"
  | "default"
  | "muted"
  | "input"
  | "primary"
  | "destructive"
  | "success"
  | "warning"
  | "info";

export type BoxRadius = "none" | "sm" | "md" | "lg" | "full";
export type BoxOverflow = "visible" | "hidden" | "clip" | "auto";

type BoxBaseProps = {
  as?: BoxElement;
  asChild?: boolean;
  border?: BoxBorder;
  display?: BoxDisplay;
  gap?: BoxSpacing;
  m?: BoxSpacing;
  mb?: BoxSpacing;
  me?: BoxSpacing;
  ms?: BoxSpacing;
  mt?: BoxSpacing;
  mx?: BoxSpacing;
  my?: BoxSpacing;
  overflow?: BoxOverflow;
  p?: BoxSpacing;
  pb?: BoxSpacing;
  pe?: BoxSpacing;
  ps?: BoxSpacing;
  pt?: BoxSpacing;
  px?: BoxSpacing;
  py?: BoxSpacing;
  radius?: BoxRadius;
  surface?: BoxSurface;
};

type NativeBoxProps = HTMLAttributes<HTMLElement> &
  BoxBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildBoxProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  BoxBaseProps & {
    asChild: true;
    children: ReactElement<BoxSlotProps>;
  };

export type BoxProps = NativeBoxProps | ChildBoxProps;

type BoxSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const boxBaseClasses = "box-border min-w-0";

const boxDisplayClasses: Record<BoxDisplay, string> = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  contents: "contents",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
};

const boxPaddingClasses: Record<
  "p" | "px" | "py" | "ps" | "pe" | "pt" | "pb",
  Record<BoxSpacing, string>
> = {
  p: {
    none: "p-[var(--dt-space-0)]",
    1: "p-[var(--dt-space-1)]",
    2: "p-[var(--dt-space-2)]",
    3: "p-[var(--dt-space-3)]",
    4: "p-[var(--dt-space-4)]",
    5: "p-[var(--dt-space-5)]",
    6: "p-[var(--dt-space-6)]",
    8: "p-[var(--dt-space-8)]",
    10: "p-[var(--dt-space-10)]",
    12: "p-[var(--dt-space-12)]",
  },
  px: {
    none: "px-[var(--dt-space-0)]",
    1: "px-[var(--dt-space-1)]",
    2: "px-[var(--dt-space-2)]",
    3: "px-[var(--dt-space-3)]",
    4: "px-[var(--dt-space-4)]",
    5: "px-[var(--dt-space-5)]",
    6: "px-[var(--dt-space-6)]",
    8: "px-[var(--dt-space-8)]",
    10: "px-[var(--dt-space-10)]",
    12: "px-[var(--dt-space-12)]",
  },
  py: {
    none: "py-[var(--dt-space-0)]",
    1: "py-[var(--dt-space-1)]",
    2: "py-[var(--dt-space-2)]",
    3: "py-[var(--dt-space-3)]",
    4: "py-[var(--dt-space-4)]",
    5: "py-[var(--dt-space-5)]",
    6: "py-[var(--dt-space-6)]",
    8: "py-[var(--dt-space-8)]",
    10: "py-[var(--dt-space-10)]",
    12: "py-[var(--dt-space-12)]",
  },
  ps: {
    none: "ps-[var(--dt-space-0)]",
    1: "ps-[var(--dt-space-1)]",
    2: "ps-[var(--dt-space-2)]",
    3: "ps-[var(--dt-space-3)]",
    4: "ps-[var(--dt-space-4)]",
    5: "ps-[var(--dt-space-5)]",
    6: "ps-[var(--dt-space-6)]",
    8: "ps-[var(--dt-space-8)]",
    10: "ps-[var(--dt-space-10)]",
    12: "ps-[var(--dt-space-12)]",
  },
  pe: {
    none: "pe-[var(--dt-space-0)]",
    1: "pe-[var(--dt-space-1)]",
    2: "pe-[var(--dt-space-2)]",
    3: "pe-[var(--dt-space-3)]",
    4: "pe-[var(--dt-space-4)]",
    5: "pe-[var(--dt-space-5)]",
    6: "pe-[var(--dt-space-6)]",
    8: "pe-[var(--dt-space-8)]",
    10: "pe-[var(--dt-space-10)]",
    12: "pe-[var(--dt-space-12)]",
  },
  pt: {
    none: "pt-[var(--dt-space-0)]",
    1: "pt-[var(--dt-space-1)]",
    2: "pt-[var(--dt-space-2)]",
    3: "pt-[var(--dt-space-3)]",
    4: "pt-[var(--dt-space-4)]",
    5: "pt-[var(--dt-space-5)]",
    6: "pt-[var(--dt-space-6)]",
    8: "pt-[var(--dt-space-8)]",
    10: "pt-[var(--dt-space-10)]",
    12: "pt-[var(--dt-space-12)]",
  },
  pb: {
    none: "pb-[var(--dt-space-0)]",
    1: "pb-[var(--dt-space-1)]",
    2: "pb-[var(--dt-space-2)]",
    3: "pb-[var(--dt-space-3)]",
    4: "pb-[var(--dt-space-4)]",
    5: "pb-[var(--dt-space-5)]",
    6: "pb-[var(--dt-space-6)]",
    8: "pb-[var(--dt-space-8)]",
    10: "pb-[var(--dt-space-10)]",
    12: "pb-[var(--dt-space-12)]",
  },
};

const boxMarginClasses: Record<
  "m" | "mx" | "my" | "ms" | "me" | "mt" | "mb",
  Record<BoxSpacing, string>
> = {
  m: {
    none: "m-[var(--dt-space-0)]",
    1: "m-[var(--dt-space-1)]",
    2: "m-[var(--dt-space-2)]",
    3: "m-[var(--dt-space-3)]",
    4: "m-[var(--dt-space-4)]",
    5: "m-[var(--dt-space-5)]",
    6: "m-[var(--dt-space-6)]",
    8: "m-[var(--dt-space-8)]",
    10: "m-[var(--dt-space-10)]",
    12: "m-[var(--dt-space-12)]",
  },
  mx: {
    none: "mx-[var(--dt-space-0)]",
    1: "mx-[var(--dt-space-1)]",
    2: "mx-[var(--dt-space-2)]",
    3: "mx-[var(--dt-space-3)]",
    4: "mx-[var(--dt-space-4)]",
    5: "mx-[var(--dt-space-5)]",
    6: "mx-[var(--dt-space-6)]",
    8: "mx-[var(--dt-space-8)]",
    10: "mx-[var(--dt-space-10)]",
    12: "mx-[var(--dt-space-12)]",
  },
  my: {
    none: "my-[var(--dt-space-0)]",
    1: "my-[var(--dt-space-1)]",
    2: "my-[var(--dt-space-2)]",
    3: "my-[var(--dt-space-3)]",
    4: "my-[var(--dt-space-4)]",
    5: "my-[var(--dt-space-5)]",
    6: "my-[var(--dt-space-6)]",
    8: "my-[var(--dt-space-8)]",
    10: "my-[var(--dt-space-10)]",
    12: "my-[var(--dt-space-12)]",
  },
  ms: {
    none: "ms-[var(--dt-space-0)]",
    1: "ms-[var(--dt-space-1)]",
    2: "ms-[var(--dt-space-2)]",
    3: "ms-[var(--dt-space-3)]",
    4: "ms-[var(--dt-space-4)]",
    5: "ms-[var(--dt-space-5)]",
    6: "ms-[var(--dt-space-6)]",
    8: "ms-[var(--dt-space-8)]",
    10: "ms-[var(--dt-space-10)]",
    12: "ms-[var(--dt-space-12)]",
  },
  me: {
    none: "me-[var(--dt-space-0)]",
    1: "me-[var(--dt-space-1)]",
    2: "me-[var(--dt-space-2)]",
    3: "me-[var(--dt-space-3)]",
    4: "me-[var(--dt-space-4)]",
    5: "me-[var(--dt-space-5)]",
    6: "me-[var(--dt-space-6)]",
    8: "me-[var(--dt-space-8)]",
    10: "me-[var(--dt-space-10)]",
    12: "me-[var(--dt-space-12)]",
  },
  mt: {
    none: "mt-[var(--dt-space-0)]",
    1: "mt-[var(--dt-space-1)]",
    2: "mt-[var(--dt-space-2)]",
    3: "mt-[var(--dt-space-3)]",
    4: "mt-[var(--dt-space-4)]",
    5: "mt-[var(--dt-space-5)]",
    6: "mt-[var(--dt-space-6)]",
    8: "mt-[var(--dt-space-8)]",
    10: "mt-[var(--dt-space-10)]",
    12: "mt-[var(--dt-space-12)]",
  },
  mb: {
    none: "mb-[var(--dt-space-0)]",
    1: "mb-[var(--dt-space-1)]",
    2: "mb-[var(--dt-space-2)]",
    3: "mb-[var(--dt-space-3)]",
    4: "mb-[var(--dt-space-4)]",
    5: "mb-[var(--dt-space-5)]",
    6: "mb-[var(--dt-space-6)]",
    8: "mb-[var(--dt-space-8)]",
    10: "mb-[var(--dt-space-10)]",
    12: "mb-[var(--dt-space-12)]",
  },
};

const boxGapClasses: Record<BoxSpacing, string> = {
  none: "gap-[var(--dt-space-0)]",
  1: "gap-[var(--dt-space-1)]",
  2: "gap-[var(--dt-space-2)]",
  3: "gap-[var(--dt-space-3)]",
  4: "gap-[var(--dt-space-4)]",
  5: "gap-[var(--dt-space-5)]",
  6: "gap-[var(--dt-space-6)]",
  8: "gap-[var(--dt-space-8)]",
  10: "gap-[var(--dt-space-10)]",
  12: "gap-[var(--dt-space-12)]",
};

const boxSurfaceClasses: Record<BoxSurface, string> = {
  transparent: "bg-transparent",
  background: "bg-background text-foreground",
  muted: "bg-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
};

const boxBorderClasses: Record<BoxBorder, string> = {
  none: "border-0",
  default: "border border-border",
  muted: "border border-muted",
  input: "border border-input",
  primary: "border border-primary",
  destructive: "border border-destructive",
  success: "border border-success",
  warning: "border border-warning",
  info: "border border-info",
};

const boxRadiusClasses: Record<BoxRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const boxOverflowClasses: Record<BoxOverflow, string> = {
  visible: "overflow-visible",
  hidden: "overflow-hidden",
  clip: "overflow-clip",
  auto: "overflow-auto",
};

export function boxClassNames({
  border = "none",
  className,
  display,
  gap,
  m,
  mb,
  me,
  ms,
  mt,
  mx,
  my,
  overflow,
  p,
  pb,
  pe,
  ps,
  pt,
  px,
  py,
  radius = "none",
  surface = "transparent",
}: Pick<
  BoxProps,
  | "border"
  | "className"
  | "display"
  | "gap"
  | "m"
  | "mb"
  | "me"
  | "ms"
  | "mt"
  | "mx"
  | "my"
  | "overflow"
  | "p"
  | "pb"
  | "pe"
  | "ps"
  | "pt"
  | "px"
  | "py"
  | "radius"
  | "surface"
> = {}) {
  return cn(
    boxBaseClasses,
    display ? boxDisplayClasses[display] : undefined,
    p ? boxPaddingClasses.p[p] : undefined,
    px ? boxPaddingClasses.px[px] : undefined,
    py ? boxPaddingClasses.py[py] : undefined,
    ps ? boxPaddingClasses.ps[ps] : undefined,
    pe ? boxPaddingClasses.pe[pe] : undefined,
    pt ? boxPaddingClasses.pt[pt] : undefined,
    pb ? boxPaddingClasses.pb[pb] : undefined,
    m ? boxMarginClasses.m[m] : undefined,
    mx ? boxMarginClasses.mx[mx] : undefined,
    my ? boxMarginClasses.my[my] : undefined,
    ms ? boxMarginClasses.ms[ms] : undefined,
    me ? boxMarginClasses.me[me] : undefined,
    mt ? boxMarginClasses.mt[mt] : undefined,
    mb ? boxMarginClasses.mb[mb] : undefined,
    gap ? boxGapClasses[gap] : undefined,
    boxSurfaceClasses[surface],
    boxBorderClasses[border],
    boxRadiusClasses[radius],
    overflow ? boxOverflowClasses[overflow] : undefined,
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

function getChildRef(child: ReactElement<BoxSlotProps>) {
  return child.props.ref;
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
  childProps: BoxSlotProps,
) {
  const composedProps: BoxSlotProps = {
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

function getBoxDataAttributes({
  as,
  asChild,
  border,
  display,
  gap,
  m,
  mb,
  me,
  ms,
  mt,
  mx,
  my,
  overflow,
  p,
  pb,
  pe,
  ps,
  pt,
  px,
  py,
  radius,
  surface,
}: Pick<
  BoxProps,
  | "as"
  | "asChild"
  | "border"
  | "display"
  | "gap"
  | "m"
  | "mb"
  | "me"
  | "ms"
  | "mt"
  | "mx"
  | "my"
  | "overflow"
  | "p"
  | "pb"
  | "pe"
  | "ps"
  | "pt"
  | "px"
  | "py"
  | "radius"
  | "surface"
>) {
  return {
    "data-slot": "box",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-display": display,
    "data-p": p,
    "data-px": px,
    "data-py": py,
    "data-ps": ps,
    "data-pe": pe,
    "data-pt": pt,
    "data-pb": pb,
    "data-m": m,
    "data-mx": mx,
    "data-my": my,
    "data-ms": ms,
    "data-me": me,
    "data-mt": mt,
    "data-mb": mb,
    "data-gap": gap,
    "data-surface": surface,
    "data-border": border,
    "data-radius": radius,
    "data-overflow": overflow,
  };
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as = "div",
      asChild = false,
      border = "none",
      children,
      className,
      display,
      gap,
      m,
      mb,
      me,
      ms,
      mt,
      mx,
      my,
      onClick,
      overflow,
      p,
      pb,
      pe,
      ps,
      pt,
      px,
      py,
      radius = "none",
      surface = "transparent",
      ...props
    },
    ref,
  ) => {
    const classes = boxClassNames({
      border,
      className,
      display,
      gap,
      m,
      mb,
      me,
      ms,
      mt,
      mx,
      my,
      overflow,
      p,
      pb,
      pe,
      ps,
      pt,
      px,
      py,
      radius,
      surface,
    });
    const dataAttributes = getBoxDataAttributes({
      as,
      asChild,
      border,
      display,
      gap,
      m,
      mb,
      me,
      ms,
      mt,
      mx,
      my,
      overflow,
      p,
      pb,
      pe,
      ps,
      pt,
      px,
      py,
      radius,
      surface,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<BoxSlotProps>(child)) {
        throw new Error(
          "Box with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const composedProps = composeSlotProps(
        {
          ...props,
          ...(onClick ? { onClick } : {}),
        },
        child.props,
      );

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
        onClick,
      },
      children,
    );
  },
);

Box.displayName = "Box";
