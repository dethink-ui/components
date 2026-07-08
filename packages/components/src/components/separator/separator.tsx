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
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type SeparatorElement = "hr" | "div" | "span";
export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorThickness = "1" | "2";
export type SeparatorTone = "default" | "muted" | "strong";
export type SeparatorSpacing = "none" | "1" | "2" | "3" | "4" | "6" | "8";

type SeparatorValueAttributes = {
  "aria-valuemax"?: never;
  "aria-valuemin"?: never;
  "aria-valuenow"?: never;
  "aria-valuetext"?: never;
};

type SeparatorBaseProps = SeparatorValueAttributes & {
  as?: SeparatorElement;
  asChild?: boolean;
  decorative?: boolean;
  orientation?: SeparatorOrientation;
  spacing?: SeparatorSpacing;
  thickness?: SeparatorThickness;
  tone?: SeparatorTone;
};

type SeparatorReservedAttribute =
  | "aria-hidden"
  | "aria-orientation"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "aria-valuetext"
  | "role"
  | "tabIndex";

type SeparatorNativeAttributes = Omit<
  HTMLAttributes<HTMLElement>,
  SeparatorReservedAttribute | "children"
>;

type NativeSeparatorProps = SeparatorNativeAttributes &
  SeparatorBaseProps & {
    asChild?: false;
    children?: never;
  };

type ChildSeparatorProps = SeparatorNativeAttributes &
  SeparatorBaseProps & {
    asChild: true;
    children: ReactElement<SeparatorSlotProps>;
  };

export type SeparatorProps = NativeSeparatorProps | ChildSeparatorProps;
export type DividerProps = SeparatorProps;

type SeparatorSlotProps = Record<string, unknown> & {
  children?: never;
  className?: string;
  ref?: Ref<HTMLElement>;
};

type SeparatorElementWithRef = ReactElement<SeparatorSlotProps> & {
  ref?: Ref<HTMLElement>;
};

type EventHandler = (...args: unknown[]) => void;

const separatorBaseClasses = "block shrink-0 border-0 bg-border";

const separatorOrientationClasses: Record<SeparatorOrientation, string> = {
  horizontal: "w-full",
  vertical: "h-full min-h-4 self-stretch",
};

const separatorThicknessClasses: Record<
  SeparatorOrientation,
  Record<SeparatorThickness, string>
> = {
  horizontal: {
    1: "h-px",
    2: "h-0.5",
  },
  vertical: {
    1: "w-px",
    2: "w-0.5",
  },
};

const separatorToneClasses: Record<SeparatorTone, string> = {
  default: "bg-border",
  muted: "bg-muted-foreground/25",
  strong: "bg-foreground/40",
};

const separatorSpacingClasses: Record<
  SeparatorOrientation,
  Record<SeparatorSpacing, string | undefined>
> = {
  horizontal: {
    none: undefined,
    1: "my-[var(--dt-space-1)]",
    2: "my-[var(--dt-space-2)]",
    3: "my-[var(--dt-space-3)]",
    4: "my-[var(--dt-space-4)]",
    6: "my-[var(--dt-space-6)]",
    8: "my-[var(--dt-space-8)]",
  },
  vertical: {
    none: undefined,
    1: "mx-[var(--dt-space-1)]",
    2: "mx-[var(--dt-space-2)]",
    3: "mx-[var(--dt-space-3)]",
    4: "mx-[var(--dt-space-4)]",
    6: "mx-[var(--dt-space-6)]",
    8: "mx-[var(--dt-space-8)]",
  },
};

const strippedSeparatorReservedAttributes: Record<
  SeparatorReservedAttribute,
  undefined
> = {
  "aria-hidden": undefined,
  "aria-orientation": undefined,
  "aria-valuemax": undefined,
  "aria-valuemin": undefined,
  "aria-valuenow": undefined,
  "aria-valuetext": undefined,
  role: undefined,
  tabIndex: undefined,
};

export function separatorClassNames({
  className,
  orientation = "horizontal",
  spacing = "none",
  thickness = "1",
  tone = "default",
}: Pick<
  SeparatorProps,
  "className" | "orientation" | "spacing" | "thickness" | "tone"
> = {}) {
  return cn(
    separatorBaseClasses,
    separatorOrientationClasses[orientation],
    separatorThicknessClasses[orientation][thickness],
    separatorToneClasses[tone],
    separatorSpacingClasses[orientation][spacing],
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

function getChildRef(child: ReactElement<SeparatorSlotProps>) {
  if ("ref" in child.props) {
    return child.props.ref;
  }

  return reactVersion.startsWith("18.")
    ? (child as SeparatorElementWithRef).ref
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
  childProps: SeparatorSlotProps,
) {
  const composedProps: SeparatorSlotProps = {
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

function stripSeparatorReservedAttributes<T extends object>(
  props: T,
): Omit<T, SeparatorReservedAttribute> {
  const {
    "aria-hidden": _ariaHidden,
    "aria-orientation": _ariaOrientation,
    "aria-valuemax": _ariaValueMax,
    "aria-valuemin": _ariaValueMin,
    "aria-valuenow": _ariaValueNow,
    "aria-valuetext": _ariaValueText,
    role: _role,
    tabIndex: _tabIndex,
    ...safeProps
  } = props as Record<string, unknown>;

  return safeProps as Omit<T, SeparatorReservedAttribute>;
}

function getSeparatorDataAttributes({
  as,
  asChild,
  decorative,
  orientation,
  spacing,
  thickness,
  tone,
}: Pick<
  SeparatorProps,
  | "as"
  | "asChild"
  | "decorative"
  | "orientation"
  | "spacing"
  | "thickness"
  | "tone"
>) {
  return {
    "data-slot": "separator",
    "data-as-child": asChild ? "true" : undefined,
    "data-element": asChild ? undefined : as,
    "data-orientation": orientation,
    "data-decorative": decorative ? "true" : "false",
    "data-thickness": thickness,
    "data-tone": tone,
    "data-spacing": spacing,
  };
}

function getSeparatorAccessibilityAttributes({
  as,
  asChild,
  decorative,
  orientation,
}: Pick<SeparatorProps, "as" | "asChild" | "decorative" | "orientation">) {
  if (decorative) {
    return {
      "aria-hidden": true,
      "aria-orientation": undefined,
      role: undefined,
    };
  }

  return {
    "aria-hidden": undefined,
    "aria-orientation": orientation,
    role: asChild || as !== "hr" ? "separator" : undefined,
  };
}

export const Separator = forwardRef<HTMLElement, SeparatorProps>(
  (
    {
      as = "hr",
      asChild = false,
      children,
      className,
      decorative = false,
      orientation = "horizontal",
      spacing = "none",
      thickness = "1",
      tone = "default",
      ...props
    },
    ref,
  ) => {
    const safeProps = stripSeparatorReservedAttributes(props);
    const classes = separatorClassNames({
      className,
      orientation,
      spacing,
      thickness,
      tone,
    });
    const dataAttributes = getSeparatorDataAttributes({
      as,
      asChild,
      decorative,
      orientation,
      spacing,
      thickness,
      tone,
    });
    const accessibilityAttributes = getSeparatorAccessibilityAttributes({
      as,
      asChild,
      decorative,
      orientation,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<SeparatorSlotProps>(child)) {
        throw new Error(
          "Separator with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const safeChildProps = stripSeparatorReservedAttributes(child.props);
      const composedProps = composeSlotProps(safeProps, safeChildProps);

      return cloneElement(child, {
        ...composedProps,
        ...strippedSeparatorReservedAttributes,
        ...dataAttributes,
        ...accessibilityAttributes,
        ref: composeRefs(ref as Ref<HTMLElement>, childRef),
        className: cn(classes, child.props.className),
      });
    }

    return createElement(as, {
      ...safeProps,
      ...dataAttributes,
      ...accessibilityAttributes,
      ref: ref as ForwardedRef<HTMLElement>,
      className: classes,
    });
  },
);

Separator.displayName = "Separator";

export const Divider = forwardRef<HTMLElement, DividerProps>((props, ref) => (
  <Separator ref={ref} {...props} />
));

Divider.displayName = "Divider";
