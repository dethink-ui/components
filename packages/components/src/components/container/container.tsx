import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type ContainerElement =
  | "div"
  | "main"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "aside"
  | "nav";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type ContainerGutter = "none" | "sm" | "md" | "lg" | "xl";
export type ContainerAlign = "start" | "center" | "end";

type ContainerBaseProps = {
  align?: ContainerAlign;
  as?: ContainerElement;
  asChild?: boolean;
  fluid?: boolean;
  gutter?: ContainerGutter;
  safeArea?: boolean;
  size?: ContainerSize;
};

type NativeContainerProps = HTMLAttributes<HTMLElement> &
  ContainerBaseProps & {
    asChild?: false;
    children?: ReactNode;
  };

type ChildContainerProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  ContainerBaseProps & {
    asChild: true;
    children: ReactElement<ContainerSlotProps>;
  };

export type ContainerProps = NativeContainerProps | ChildContainerProps;

type ContainerSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const containerBaseClasses = "box-border w-full min-w-0";

const containerSizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-[40rem]",
  md: "max-w-[48rem]",
  lg: "max-w-[64rem]",
  xl: "max-w-[80rem]",
  "2xl": "max-w-[96rem]",
  full: "max-w-none",
};

const containerGutterVariableClasses: Record<ContainerGutter, string> = {
  none: "[--container-gutter:var(--dt-space-0)]",
  sm: "[--container-gutter:var(--dt-space-3)] sm:[--container-gutter:var(--dt-space-4)]",
  md: "[--container-gutter:var(--dt-space-4)] sm:[--container-gutter:var(--dt-space-6)]",
  lg: "[--container-gutter:var(--dt-space-5)] sm:[--container-gutter:var(--dt-space-8)]",
  xl: "[--container-gutter:var(--dt-space-6)] sm:[--container-gutter:var(--dt-space-10)]",
};

const containerGutterPaddingClasses: Record<ContainerGutter, string> = {
  none: "px-[var(--dt-space-0)]",
  sm: "px-[var(--container-gutter)]",
  md: "px-[var(--container-gutter)]",
  lg: "px-[var(--container-gutter)]",
  xl: "px-[var(--container-gutter)]",
};

const containerSafeAreaPaddingClasses =
  "pl-[max(var(--container-gutter),env(safe-area-inset-left))] pr-[max(var(--container-gutter),env(safe-area-inset-right))]";

const containerAlignClasses: Record<ContainerAlign, string> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

export function containerClassNames({
  align = "center",
  className,
  fluid = false,
  gutter = "md",
  safeArea = false,
  size = "xl",
}: Pick<
  ContainerProps,
  "align" | "className" | "fluid" | "gutter" | "safeArea" | "size"
> = {}) {
  return cn(
    containerBaseClasses,
    fluid ? containerSizeClasses.full : containerSizeClasses[size],
    containerAlignClasses[align],
    containerGutterVariableClasses[gutter],
    safeArea
      ? containerSafeAreaPaddingClasses
      : containerGutterPaddingClasses[gutter],
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

function getChildRef(child: ReactElement<ContainerSlotProps>) {
  if (child.props.ref !== undefined) {
    return child.props.ref;
  }

  const descriptor = Object.getOwnPropertyDescriptor(child, "ref");

  return descriptor && "value" in descriptor
    ? (descriptor.value as Ref<HTMLElement> | undefined)
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
  childProps: ContainerSlotProps,
) {
  const composedProps: ContainerSlotProps = {
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

function getContainerDataAttributes({
  align,
  as,
  asChild,
  fluid,
  gutter,
  safeArea,
  size,
}: Required<
  Pick<ContainerBaseProps, "align" | "fluid" | "gutter" | "safeArea" | "size">
> &
  Pick<ContainerBaseProps, "as" | "asChild">) {
  return {
    "data-slot": "container",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-size": size,
    "data-gutter": gutter,
    "data-fluid": fluid ? "true" : "false",
    "data-align": align,
    "data-safe-area": safeArea ? "true" : "false",
  };
}

export const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      align = "center",
      as = "div",
      asChild = false,
      children,
      className,
      fluid = false,
      gutter = "md",
      safeArea = false,
      size = "xl",
      ...props
    },
    ref,
  ) => {
    const classes = containerClassNames({
      align,
      className,
      fluid,
      gutter,
      safeArea,
      size,
    });
    const dataAttributes = getContainerDataAttributes({
      align,
      as,
      asChild,
      fluid,
      gutter,
      safeArea,
      size,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<ContainerSlotProps>(child)) {
        throw new Error(
          "Container with asChild expects a single React element child.",
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

Container.displayName = "Container";
