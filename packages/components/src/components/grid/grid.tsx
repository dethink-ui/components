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

export type GridElement =
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
  | "fieldset";

export type GridColumns =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "12"
  | "auto-fit-xs"
  | "auto-fit-sm"
  | "auto-fit-md"
  | "auto-fit-lg";

export type GridRows = "none" | "1" | "2" | "3" | "4" | "5" | "6";
export type GridGap =
  "none" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";
export type GridAlign = "stretch" | "start" | "center" | "end";
export type GridJustify = "stretch" | "start" | "center" | "end";
export type GridContent =
  "start" | "center" | "end" | "between" | "around" | "evenly" | "stretch";

export type GridItemElement =
  "div" | "span" | "li" | "section" | "article" | "aside";
export type GridItemSpan = "1" | "2" | "3" | "4" | "5" | "6" | "full";
export type GridItemAlign = "auto" | "stretch" | "start" | "center" | "end";
export type GridItemJustify = "auto" | "stretch" | "start" | "center" | "end";
export type GridItemMinInlineSize = "auto" | "0";

type GridBaseProps = {
  align?: GridAlign;
  alignContent?: GridContent;
  as?: GridElement;
  asChild?: boolean;
  columnGap?: GridGap;
  columns?: GridColumns;
  gap?: GridGap;
  justify?: GridJustify;
  justifyContent?: GridContent;
  rowGap?: GridGap;
  rows?: GridRows;
};

type GridItemBaseProps = {
  align?: GridItemAlign;
  as?: GridItemElement;
  asChild?: boolean;
  colSpan?: GridItemSpan;
  justify?: GridItemJustify;
  minInlineSize?: GridItemMinInlineSize;
  rowSpan?: GridItemSpan;
};

type GridFormAttributes = Pick<
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

type GridFieldsetAttributes = Pick<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "disabled" | "form" | "name"
>;

type NativeGridProps = HTMLAttributes<HTMLElement> &
  GridFormAttributes &
  GridFieldsetAttributes &
  GridBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildGridProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  GridBaseProps & {
    asChild: true;
    children: ReactElement<GridSlotProps>;
  };

export type GridProps = NativeGridProps | ChildGridProps;

type NativeGridItemProps = HTMLAttributes<HTMLElement> &
  GridItemBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildGridItemProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  GridItemBaseProps & {
    asChild: true;
    children: ReactElement<GridSlotProps>;
  };

export type GridItemProps = NativeGridItemProps | ChildGridItemProps;

type GridSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
};

type GridElementWithRef = ReactElement<GridSlotProps> & {
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const gridBaseClasses = "box-border grid min-w-0";
const gridItemBaseClasses = "box-border";

const gridColumnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
  "auto-fit-xs": "grid-cols-[repeat(auto-fit,minmax(min(12rem,100%),1fr))]",
  "auto-fit-sm": "grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))]",
  "auto-fit-md": "grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))]",
  "auto-fit-lg": "grid-cols-[repeat(auto-fit,minmax(min(24rem,100%),1fr))]",
};

const gridRowClasses: Record<GridRows, string | undefined> = {
  none: undefined,
  1: "grid-rows-1",
  2: "grid-rows-2",
  3: "grid-rows-3",
  4: "grid-rows-4",
  5: "grid-rows-5",
  6: "grid-rows-6",
};

const gridGapClasses: Record<GridGap, string> = {
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

const gridRowGapClasses: Record<GridGap, string> = {
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

const gridColumnGapClasses: Record<GridGap, string> = {
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

const gridAlignClasses: Record<GridAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

const gridJustifyClasses: Record<GridJustify, string> = {
  stretch: "justify-items-stretch",
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
};

const gridAlignContentClasses: Record<GridContent, string> = {
  start: "content-start",
  center: "content-center",
  end: "content-end",
  between: "content-between",
  around: "content-around",
  evenly: "content-evenly",
  stretch: "content-stretch",
};

const gridJustifyContentClasses: Record<GridContent, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
  stretch: "justify-stretch",
};

const gridItemColSpanClasses: Record<GridItemSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  full: "col-span-full",
};

const gridItemRowSpanClasses: Record<GridItemSpan, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
  full: "row-span-full",
};

const gridItemAlignClasses: Record<GridItemAlign, string> = {
  auto: "self-auto",
  stretch: "self-stretch",
  start: "self-start",
  center: "self-center",
  end: "self-end",
};

const gridItemJustifyClasses: Record<GridItemJustify, string> = {
  auto: "justify-self-auto",
  stretch: "justify-self-stretch",
  start: "justify-self-start",
  center: "justify-self-center",
  end: "justify-self-end",
};

const gridItemMinInlineSizeClasses: Record<
  GridItemMinInlineSize,
  string | undefined
> = {
  auto: undefined,
  0: "min-w-0",
};

export function gridClassNames({
  align = "stretch",
  alignContent = "start",
  className,
  columnGap,
  columns = "1",
  gap = "none",
  justify = "stretch",
  justifyContent = "start",
  rowGap,
  rows = "none",
}: Pick<
  GridProps,
  | "align"
  | "alignContent"
  | "className"
  | "columnGap"
  | "columns"
  | "gap"
  | "justify"
  | "justifyContent"
  | "rowGap"
  | "rows"
> = {}) {
  return cn(
    gridBaseClasses,
    gridColumnClasses[columns],
    gridRowClasses[rows],
    gridGapClasses[gap],
    rowGap ? gridRowGapClasses[rowGap] : undefined,
    columnGap ? gridColumnGapClasses[columnGap] : undefined,
    gridAlignClasses[align],
    gridJustifyClasses[justify],
    gridAlignContentClasses[alignContent],
    gridJustifyContentClasses[justifyContent],
    className,
  );
}

export function gridItemClassNames({
  align = "auto",
  className,
  colSpan = "1",
  justify = "auto",
  minInlineSize = "auto",
  rowSpan = "1",
}: Pick<
  GridItemProps,
  "align" | "className" | "colSpan" | "justify" | "minInlineSize" | "rowSpan"
> = {}) {
  return cn(
    gridItemBaseClasses,
    gridItemColSpanClasses[colSpan],
    gridItemRowSpanClasses[rowSpan],
    gridItemAlignClasses[align],
    gridItemJustifyClasses[justify],
    gridItemMinInlineSizeClasses[minInlineSize],
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

function getChildRef(child: ReactElement<GridSlotProps>) {
  if ("ref" in child.props) {
    return child.props.ref;
  }

  return reactVersion.startsWith("18.")
    ? (child as GridElementWithRef).ref
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
  childProps: GridSlotProps,
) {
  const composedProps: GridSlotProps = {
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

function getGridDataAttributes({
  align,
  alignContent,
  as,
  asChild,
  columnGap,
  columns,
  gap,
  justify,
  justifyContent,
  rowGap,
  rows,
}: Pick<
  GridProps,
  | "align"
  | "alignContent"
  | "as"
  | "asChild"
  | "columnGap"
  | "columns"
  | "gap"
  | "justify"
  | "justifyContent"
  | "rowGap"
  | "rows"
>) {
  return {
    "data-slot": "grid",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-columns": columns,
    "data-rows": rows,
    "data-gap": gap,
    "data-row-gap": rowGap,
    "data-column-gap": columnGap,
    "data-align": align,
    "data-justify": justify,
    "data-align-content": alignContent,
    "data-justify-content": justifyContent,
  };
}

function getGridItemDataAttributes({
  align,
  as,
  asChild,
  colSpan,
  justify,
  minInlineSize,
  rowSpan,
}: Pick<
  GridItemProps,
  | "align"
  | "as"
  | "asChild"
  | "colSpan"
  | "justify"
  | "minInlineSize"
  | "rowSpan"
>) {
  return {
    "data-slot": "grid-item",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-col-span": colSpan,
    "data-row-span": rowSpan,
    "data-align": align,
    "data-justify": justify,
    "data-min-inline-size": minInlineSize,
  };
}

export const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      align = "stretch",
      alignContent = "start",
      as = "div",
      asChild = false,
      children,
      className,
      columnGap,
      columns = "1",
      gap = "none",
      justify = "stretch",
      justifyContent = "start",
      rowGap,
      rows = "none",
      ...props
    },
    ref,
  ) => {
    const classes = gridClassNames({
      align,
      alignContent,
      className,
      columnGap,
      columns,
      gap,
      justify,
      justifyContent,
      rowGap,
      rows,
    });
    const dataAttributes = getGridDataAttributes({
      align,
      alignContent,
      as,
      asChild,
      columnGap,
      columns,
      gap,
      justify,
      justifyContent,
      rowGap,
      rows,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<GridSlotProps>(child)) {
        throw new Error(
          "Grid with asChild expects a single React element child.",
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

Grid.displayName = "Grid";

export const GridItem = forwardRef<HTMLElement, GridItemProps>(
  (
    {
      align = "auto",
      as = "div",
      asChild = false,
      children,
      className,
      colSpan = "1",
      justify = "auto",
      minInlineSize = "auto",
      rowSpan = "1",
      ...props
    },
    ref,
  ) => {
    const classes = gridItemClassNames({
      align,
      className,
      colSpan,
      justify,
      minInlineSize,
      rowSpan,
    });
    const dataAttributes = getGridItemDataAttributes({
      align,
      as,
      asChild,
      colSpan,
      justify,
      minInlineSize,
      rowSpan,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<GridSlotProps>(child)) {
        throw new Error(
          "GridItem with asChild expects a single React element child.",
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

GridItem.displayName = "GridItem";
