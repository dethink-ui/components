import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  type ForwardedRef,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type StackElement =
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

export type StackDirection = "vertical" | "horizontal";
export type StackGap =
  "none" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12";
export type StackAlign = "stretch" | "start" | "center" | "end" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";
export type StackWrap = "nowrap" | "wrap";

type StackBaseProps = {
  align?: StackAlign;
  as?: StackElement;
  asChild?: boolean;
  direction?: StackDirection;
  gap?: StackGap;
  justify?: StackJustify;
  wrap?: StackWrap;
};

type StackFormAttributes = Pick<
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

type StackFieldsetAttributes = Pick<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "disabled" | "form" | "name"
>;

type NativeStackProps = HTMLAttributes<HTMLElement> &
  StackFormAttributes &
  StackFieldsetAttributes &
  StackBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildStackProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  StackBaseProps & {
    asChild: true;
    children: ReactElement<StackSlotProps>;
  };

export type StackProps = NativeStackProps | ChildStackProps;

type StackSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const stackBaseClasses = "box-border flex min-w-0";

const stackDirectionClasses: Record<StackDirection, string> = {
  vertical: "flex-col",
  horizontal: "flex-row",
};

const stackGapClasses: Record<StackGap, string> = {
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

const stackAlignClasses: Record<StackAlign, string> = {
  stretch: "items-stretch",
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};

const stackJustifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

const stackWrapClasses: Record<StackWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
};

export function stackClassNames({
  align = "stretch",
  className,
  direction = "vertical",
  gap = "4",
  justify = "start",
  wrap = "nowrap",
}: Pick<
  StackProps,
  "align" | "className" | "direction" | "gap" | "justify" | "wrap"
> = {}) {
  return cn(
    stackBaseClasses,
    stackDirectionClasses[direction],
    stackGapClasses[gap],
    stackAlignClasses[align],
    stackJustifyClasses[justify],
    stackWrapClasses[wrap],
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

function getChildRef(child: ReactElement<StackSlotProps>) {
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
  childProps: StackSlotProps,
) {
  const composedProps: StackSlotProps = {
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

function getStackDataAttributes({
  align,
  as,
  asChild,
  direction,
  gap,
  justify,
  wrap,
}: Pick<
  StackProps,
  "align" | "as" | "asChild" | "direction" | "gap" | "justify" | "wrap"
>) {
  return {
    "data-slot": "stack",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-direction": direction,
    "data-gap": gap,
    "data-align": align,
    "data-justify": justify,
    "data-wrap": wrap,
  };
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    {
      align = "stretch",
      as = "div",
      asChild = false,
      children,
      className,
      direction = "vertical",
      gap = "4",
      justify = "start",
      wrap = "nowrap",
      ...props
    },
    ref,
  ) => {
    const classes = stackClassNames({
      align,
      className,
      direction,
      gap,
      justify,
      wrap,
    });
    const dataAttributes = getStackDataAttributes({
      align,
      as,
      asChild,
      direction,
      gap,
      justify,
      wrap,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<StackSlotProps>(child)) {
        throw new Error(
          "Stack with asChild expects a single React element child.",
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

Stack.displayName = "Stack";
