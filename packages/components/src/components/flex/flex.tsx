import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  version as reactVersion,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type FlexElement =
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
  | "form"
  | "fieldset"
  | "span";

export type FlexDisplay = "flex" | "inline-flex";
export type FlexDirection = "row" | "column";
export type FlexWrap = "nowrap" | "wrap";
export type FlexGap =
  "none" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";
export type FlexAlign = "stretch" | "start" | "center" | "end" | "baseline";
export type FlexJustify =
  "start" | "center" | "end" | "between" | "around" | "evenly";
export type FlexContent =
  "start" | "center" | "end" | "between" | "around" | "evenly" | "stretch";

export type FlexItemElement =
  "div" | "span" | "li" | "section" | "article" | "aside";
export type FlexItemGrow = "0" | "1";
export type FlexItemShrink = "0" | "1";
export type FlexItemBasis = "auto" | "0" | "full" | "xs" | "sm" | "md" | "lg";
export type FlexItemAlign =
  "auto" | "stretch" | "start" | "center" | "end" | "baseline";
export type FlexItemMinInlineSize = "auto" | "0";

type FlexBaseProps = {
  align?: FlexAlign;
  as?: FlexElement;
  asChild?: boolean;
  columnGap?: FlexGap;
  content?: FlexContent;
  direction?: FlexDirection;
  display?: FlexDisplay;
  gap?: FlexGap;
  justify?: FlexJustify;
  rowGap?: FlexGap;
  wrap?: FlexWrap;
};

type FlexItemBaseProps = {
  align?: FlexItemAlign;
  as?: FlexItemElement;
  asChild?: boolean;
  basis?: FlexItemBasis;
  grow?: FlexItemGrow;
  minInlineSize?: FlexItemMinInlineSize;
  shrink?: FlexItemShrink;
};

type FlexFormAttributes = Pick<
  FormHTMLAttributes<HTMLFormElement>,
  | "acceptCharset"
  | "action"
  | "autoComplete"
  | "encType"
  | "method"
  | "name"
  | "noValidate"
  | "target"
>;

type FlexFieldsetAttributes = Pick<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "disabled" | "form" | "name"
>;

type NativeFlexProps = HTMLAttributes<HTMLElement> &
  FlexFormAttributes &
  FlexFieldsetAttributes &
  FlexBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildFlexProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  FlexBaseProps & {
    asChild: true;
    children: ReactElement<FlexSlotProps>;
  };

export type FlexProps = NativeFlexProps | ChildFlexProps;

type NativeFlexItemProps = HTMLAttributes<HTMLElement> &
  FlexItemBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildFlexItemProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  FlexItemBaseProps & {
    asChild: true;
    children: ReactElement<FlexSlotProps>;
  };

export type FlexItemProps = NativeFlexItemProps | ChildFlexItemProps;

type FlexSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
};

type FlexElementWithRef = ReactElement<FlexSlotProps> & {
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const flexBaseClasses = "box-border min-w-0";
const flexItemBaseClasses = "box-border";

const flexDisplayClasses: Record<FlexDisplay, string> = {
  flex: "flex",
  "inline-flex": "inline-flex",
};

const flexDirectionClasses: Record<FlexDirection, string> = {
  row: "flex-row",
  column: "flex-col",
};

const flexWrapClasses: Record<FlexWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
};

const flexGapClasses: Record<FlexGap, string> = {
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

const flexRowGapClasses: Record<FlexGap, string> = {
  none: "gap-y-[var(--dt-space-0)]",
  1: "gap-y-[var(--dt-space-1)]",
  2: "gap-y-[var(--dt-space-2)]",
  3: "gap-y-[var(--dt-space-3)]",
  4: "gap-y-[var(--dt-space-4)]",
  5: "gap-y-[var(--dt-space-5)]",
  6: "gap-y-[var(--dt-space-6)]",
  8: "gap-y-[var(--dt-space-8)]",
  10: "gap-y-[var(--dt-space-10)]",
  12: "gap-y-[var(--dt-space-12)]",
};

const flexColumnGapClasses: Record<FlexGap, string> = {
  none: "gap-x-[var(--dt-space-0)]",
  1: "gap-x-[var(--dt-space-1)]",
  2: "gap-x-[var(--dt-space-2)]",
  3: "gap-x-[var(--dt-space-3)]",
  4: "gap-x-[var(--dt-space-4)]",
  5: "gap-x-[var(--dt-space-5)]",
  6: "gap-x-[var(--dt-space-6)]",
  8: "gap-x-[var(--dt-space-8)]",
  10: "gap-x-[var(--dt-space-10)]",
  12: "gap-x-[var(--dt-space-12)]",
};

const flexAlignClasses: Record<FlexAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};

const flexJustifyClasses: Record<FlexJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const flexContentClasses: Record<FlexContent, string> = {
  start: "content-start",
  center: "content-center",
  end: "content-end",
  between: "content-between",
  around: "content-around",
  evenly: "content-evenly",
  stretch: "content-stretch",
};

const flexItemGrowClasses: Record<FlexItemGrow, string> = {
  0: "grow-0",
  1: "grow",
};

const flexItemShrinkClasses: Record<FlexItemShrink, string> = {
  0: "shrink-0",
  1: "shrink",
};

const flexItemBasisClasses: Record<FlexItemBasis, string> = {
  auto: "basis-auto",
  0: "basis-0",
  full: "basis-full",
  xs: "basis-32",
  sm: "basis-48",
  md: "basis-64",
  lg: "basis-80",
};

const flexItemAlignClasses: Record<FlexItemAlign, string> = {
  auto: "self-auto",
  stretch: "self-stretch",
  start: "self-start",
  center: "self-center",
  end: "self-end",
  baseline: "self-baseline",
};

const flexItemMinInlineSizeClasses: Record<
  FlexItemMinInlineSize,
  string | undefined
> = {
  auto: undefined,
  0: "min-w-0",
};

export function flexClassNames({
  align = "stretch",
  className,
  columnGap,
  content = "stretch",
  direction = "row",
  display = "flex",
  gap = "none",
  justify = "start",
  rowGap,
  wrap = "nowrap",
}: Pick<
  FlexProps,
  | "align"
  | "className"
  | "columnGap"
  | "content"
  | "direction"
  | "display"
  | "gap"
  | "justify"
  | "rowGap"
  | "wrap"
> = {}) {
  return cn(
    flexBaseClasses,
    flexDisplayClasses[display],
    flexDirectionClasses[direction],
    flexWrapClasses[wrap],
    flexGapClasses[gap],
    rowGap ? flexRowGapClasses[rowGap] : undefined,
    columnGap ? flexColumnGapClasses[columnGap] : undefined,
    flexAlignClasses[align],
    flexJustifyClasses[justify],
    flexContentClasses[content],
    className,
  );
}

export function flexItemClassNames({
  align = "auto",
  basis = "auto",
  className,
  grow,
  minInlineSize = "auto",
  shrink,
}: Pick<
  FlexItemProps,
  "align" | "basis" | "className" | "grow" | "minInlineSize" | "shrink"
> = {}) {
  return cn(
    flexItemBaseClasses,
    grow ? flexItemGrowClasses[grow] : undefined,
    shrink ? flexItemShrinkClasses[shrink] : undefined,
    flexItemBasisClasses[basis],
    flexItemAlignClasses[align],
    flexItemMinInlineSizeClasses[minInlineSize],
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

function getChildRef(child: ReactElement<FlexSlotProps>) {
  if ("ref" in child.props) {
    return child.props.ref;
  }

  return reactVersion.startsWith("18.")
    ? (child as FlexElementWithRef).ref
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
  childProps: FlexSlotProps,
) {
  const composedProps: FlexSlotProps = {
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

function getFlexDataAttributes({
  align,
  as,
  asChild,
  columnGap,
  content,
  direction,
  display,
  gap,
  justify,
  rowGap,
  wrap,
}: Pick<
  FlexProps,
  | "align"
  | "as"
  | "asChild"
  | "columnGap"
  | "content"
  | "direction"
  | "display"
  | "gap"
  | "justify"
  | "rowGap"
  | "wrap"
>) {
  return {
    "data-slot": "flex",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-display": display,
    "data-direction": direction,
    "data-wrap": wrap,
    "data-gap": gap,
    "data-row-gap": rowGap,
    "data-column-gap": columnGap,
    "data-align": align,
    "data-justify": justify,
    "data-content": content,
  };
}

function getFlexItemDataAttributes({
  align,
  as,
  asChild,
  basis,
  grow,
  minInlineSize,
  shrink,
}: Pick<
  FlexItemProps,
  "align" | "as" | "asChild" | "basis" | "grow" | "minInlineSize" | "shrink"
>) {
  return {
    "data-slot": "flex-item",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-grow": grow,
    "data-shrink": shrink,
    "data-basis": basis,
    "data-align": align,
    "data-min-inline-size": minInlineSize,
  };
}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      align = "stretch",
      as = "div",
      asChild = false,
      children,
      className,
      columnGap,
      content = "stretch",
      direction = "row",
      display = "flex",
      gap = "none",
      justify = "start",
      rowGap,
      wrap = "nowrap",
      ...props
    },
    ref,
  ) => {
    const classes = flexClassNames({
      align,
      className,
      columnGap,
      content,
      direction,
      display,
      gap,
      justify,
      rowGap,
      wrap,
    });
    const dataAttributes = getFlexDataAttributes({
      align,
      as,
      asChild,
      columnGap,
      content,
      direction,
      display,
      gap,
      justify,
      rowGap,
      wrap,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<FlexSlotProps>(child)) {
        throw new Error(
          "Flex with asChild expects a single React element child.",
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

Flex.displayName = "Flex";

export const FlexItem = forwardRef<HTMLElement, FlexItemProps>(
  (
    {
      align = "auto",
      as = "div",
      asChild = false,
      basis = "auto",
      children,
      className,
      grow,
      minInlineSize = "auto",
      shrink,
      ...props
    },
    ref,
  ) => {
    const classes = flexItemClassNames({
      align,
      basis,
      className,
      grow,
      minInlineSize,
      shrink,
    });
    const dataAttributes = getFlexItemDataAttributes({
      align,
      as,
      asChild,
      basis,
      grow,
      minInlineSize,
      shrink,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<FlexSlotProps>(child)) {
        throw new Error(
          "FlexItem with asChild expects a single React element child.",
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

FlexItem.displayName = "FlexItem";
