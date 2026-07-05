import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

declare const process:
  | {
      env?: {
        NODE_ENV?: string;
      };
    }
  | undefined;

export type HorizontalAccordionValue = string | undefined;

export type HorizontalAccordionAnimation = {
  duration?: number;
  easing?: string;
  content?: boolean;
};

export interface HorizontalAccordionProps
  extends HTMLAttributes<HTMLDivElement> {
  value?: HorizontalAccordionValue;
  defaultValue?: HorizontalAccordionValue;
  onValueChange?: (value: HorizontalAccordionValue) => void;
  collapsible?: boolean;
  bladeWidth?: number;
  height?: number;
  animation?: HorizontalAccordionAnimation;
  unmountInactivePanels?: boolean;
}

export interface HorizontalAccordionItemProps
  extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export type HorizontalAccordionBladeIconPosition =
  | "start"
  | "end"
  | "top"
  | "bottom";

export interface HorizontalAccordionBladeProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconPosition?: HorizontalAccordionBladeIconPosition;
}

export type HorizontalAccordionBladeIconProps = HTMLAttributes<HTMLSpanElement>;

export type HorizontalAccordionBladeLabelOrientation = "rotated" | "vertical";
export type HorizontalAccordionBladeLabelDirection =
  | "bottom-to-top"
  | "top-to-bottom";

export interface HorizontalAccordionBladeLabelProps
  extends HTMLAttributes<HTMLSpanElement> {
  orientation?: HorizontalAccordionBladeLabelOrientation;
  direction?: HorizontalAccordionBladeLabelDirection;
}

export type HorizontalAccordionPanelProps = HTMLAttributes<HTMLDivElement>;

type AccordionContextValue = {
  activeValue: HorizontalAccordionValue;
  unmountInactivePanels: boolean;
  setActiveValue: (value: string) => void;
};

type ItemContextValue = {
  active: boolean;
  bladeId: string;
  panelId: string;
  value: string;
};

const DEFAULT_BLADE_WIDTH = 72;
const DEFAULT_HEIGHT = 420;
const DEFAULT_ANIMATION: Required<HorizontalAccordionAnimation> = {
  duration: 260,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  content: true,
};
const ACCORDION_PART = Symbol.for("@dethink/horizontal-accordion.part");

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

type AccordionPartName = "Item" | "Blade" | "Panel";
type MarkedAccordionPart = {
  [ACCORDION_PART]?: AccordionPartName;
};

type HorizontalAccordionStyle = CSSProperties & {
  "--horizontal-accordion-blade-width"?: string;
  "--horizontal-accordion-height"?: string;
  "--horizontal-accordion-duration"?: string;
  "--horizontal-accordion-easing"?: string;
};

const horizontalAccordionRootClasses =
  "group/horizontal-accordion relative isolate flex h-[var(--horizontal-accordion-height)] min-h-0 w-full overflow-hidden text-foreground";

const horizontalAccordionItemClasses =
  "flex h-full min-h-0 min-w-[var(--horizontal-accordion-blade-width)] shrink-0 grow-0 basis-[var(--horizontal-accordion-blade-width)] motion-safe:transition-[flex-basis,flex-grow,min-width] motion-safe:duration-[var(--horizontal-accordion-duration)] motion-safe:ease-[var(--horizontal-accordion-easing)] motion-reduce:transition-none data-[state=active]:min-w-[min(100%,calc(var(--horizontal-accordion-blade-width)+16rem))] data-[state=active]:shrink data-[state=active]:grow data-[state=active]:basis-0";

const horizontalAccordionBladeClasses =
  "group/horizontal-accordion-blade relative flex h-full w-[var(--horizontal-accordion-blade-width)] min-w-[var(--horizontal-accordion-blade-width)] shrink-0 grow-0 basis-[var(--horizontal-accordion-blade-width)] cursor-pointer flex-col items-center justify-between gap-[var(--dt-space-3)] overflow-hidden border-e border-border bg-muted px-[var(--dt-space-2)] py-[var(--dt-space-4)] text-muted-foreground outline-none motion-safe:transition-[background-color,color] motion-safe:duration-[var(--horizontal-accordion-duration)] motion-safe:ease-[var(--horizontal-accordion-easing)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50";

const horizontalAccordionBladeIconClasses =
  "pointer-events-none order-1 inline-flex items-center justify-center [&:only-child]:my-auto group-data-[icon-position=end]/horizontal-accordion-blade:order-3";

const horizontalAccordionBladeLabelClasses =
  "pointer-events-none order-2 inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap text-sm font-semibold data-[orientation=rotated]:data-[direction=bottom-to-top]:-rotate-90 data-[orientation=rotated]:data-[direction=top-to-bottom]:rotate-90 data-[orientation=vertical]:[writing-mode:vertical-rl] data-[orientation=vertical]:data-[direction=bottom-to-top]:rotate-180";

const horizontalAccordionPanelClasses =
  "min-h-0 min-w-0 flex-1 overflow-hidden [contain:paint]";

export function horizontalAccordionClassNames({
  className,
}: Pick<HorizontalAccordionProps, "className"> = {}) {
  return cn(horizontalAccordionRootClasses, className);
}

export function horizontalAccordionItemClassNames({
  className,
}: Pick<HorizontalAccordionItemProps, "className"> = {}) {
  return cn(horizontalAccordionItemClasses, className);
}

export function horizontalAccordionBladeClassNames({
  className,
}: Pick<HorizontalAccordionBladeProps, "className"> = {}) {
  return cn(horizontalAccordionBladeClasses, className);
}

export function horizontalAccordionBladeIconClassNames({
  className,
}: Pick<HorizontalAccordionBladeIconProps, "className"> = {}) {
  return cn(horizontalAccordionBladeIconClasses, className);
}

export function horizontalAccordionBladeLabelClassNames({
  className,
}: Pick<HorizontalAccordionBladeLabelProps, "className"> = {}) {
  return cn(horizontalAccordionBladeLabelClasses, className);
}

export function horizontalAccordionPanelClassNames({
  className,
}: Pick<HorizontalAccordionPanelProps, "className"> = {}) {
  return cn(horizontalAccordionPanelClasses, className);
}

function useAccordionContext(component: string) {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error(`${component} must be used within HorizontalAccordion.`);
  }

  return context;
}

function useItemContext(component: string) {
  const context = useContext(ItemContext);

  if (!context) {
    throw new Error(
      `${component} must be used within HorizontalAccordion.Item.`,
    );
  }

  return context;
}

function isDevelopment() {
  return (
    typeof process === "undefined" || process.env?.NODE_ENV !== "production"
  );
}

function getAccordionPartName(type: unknown) {
  if (typeof type === "function" || (typeof type === "object" && type !== null)) {
    return (type as MarkedAccordionPart)[ACCORDION_PART];
  }

  return undefined;
}

function countDirectChildrenOfPart(
  children: ReactNode,
  partName: AccordionPartName,
  type: unknown,
) {
  let count = 0;

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === type || getAccordionPartName(child.type) === partName)
    ) {
      count += 1;
    }
  });

  return count;
}

function getDirectItemValues(children: ReactNode) {
  const values: string[] = [];

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === HorizontalAccordionItem ||
        getAccordionPartName(child.type) === "Item")
    ) {
      values.push((child.props as HorizontalAccordionItemProps).value);
    }
  });

  return values;
}

function validateRootComposition(children: ReactNode) {
  if (!isDevelopment()) {
    return;
  }

  const seen = new Set<string>();

  for (const itemValue of getDirectItemValues(children)) {
    if (seen.has(itemValue)) {
      throw new Error(
        `Duplicate HorizontalAccordion.Item value "${itemValue}".`,
      );
    }

    seen.add(itemValue);
  }
}

function validateItemComposition(children: ReactNode, value: string) {
  if (!isDevelopment()) {
    return;
  }

  const bladeCount = countDirectChildrenOfPart(
    children,
    "Blade",
    HorizontalAccordionBlade,
  );
  const panelCount = countDirectChildrenOfPart(
    children,
    "Panel",
    HorizontalAccordionPanel,
  );

  if (bladeCount !== 1 || panelCount !== 1) {
    throw new Error(
      `HorizontalAccordion.Item "${value}" must contain exactly one Blade and one Panel.`,
    );
  }
}

function markAccordionPart(component: unknown, partName: AccordionPartName) {
  Object.defineProperty(component, ACCORDION_PART, {
    configurable: true,
    value: partName,
  });
}

function renderBladeChildren(children: ReactNode) {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span
          className="pointer-events-none order-2 inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap text-sm font-semibold"
          data-slot="horizontal-accordion-blade-content"
        >
          {child}
        </span>
      );
    }

    return child;
  });
}

const HorizontalAccordionRoot = forwardRef<
  HTMLDivElement,
  HorizontalAccordionProps
>((props, ref) => {
  const {
    value,
    defaultValue,
    onValueChange,
    collapsible = true,
    bladeWidth = DEFAULT_BLADE_WIDTH,
    height = DEFAULT_HEIGHT,
    animation,
    unmountInactivePanels = false,
    className,
    children,
    style,
    ...rootProps
  } = props;
  const [uncontrolledValue, setUncontrolledValue] =
    useState<HorizontalAccordionValue>(defaultValue);
  const controlled = Object.hasOwn(props, "value");
  const activeValue = controlled ? value : uncontrolledValue;
  const mergedAnimation = { ...DEFAULT_ANIMATION, ...animation };
  const rootStyle: HorizontalAccordionStyle = {
    "--horizontal-accordion-blade-width": `${bladeWidth}px`,
    "--horizontal-accordion-height": `${height}px`,
    "--horizontal-accordion-duration": `${mergedAnimation.duration}ms`,
    "--horizontal-accordion-easing": mergedAnimation.easing,
    ...style,
  };

  validateRootComposition(children);

  const setActiveValue = useCallback(
    (nextValue: string) => {
      const nextActiveValue =
        activeValue === nextValue && collapsible ? undefined : nextValue;

      if (nextActiveValue === activeValue) {
        return;
      }

      if (!controlled) {
        setUncontrolledValue(nextActiveValue);
      }

      onValueChange?.(nextActiveValue);
    },
    [activeValue, collapsible, controlled, onValueChange],
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({
      activeValue,
      unmountInactivePanels,
      setActiveValue,
    }),
    [activeValue, setActiveValue, unmountInactivePanels],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        {...rootProps}
        ref={ref}
        data-slot="horizontal-accordion"
        className={horizontalAccordionClassNames({ className })}
        style={rootStyle}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

HorizontalAccordionRoot.displayName = "HorizontalAccordion";

export const HorizontalAccordionItem = forwardRef<
  HTMLDivElement,
  HorizontalAccordionItemProps
>(({ value, className, children, ...props }, ref) => {
  const { activeValue } = useAccordionContext("HorizontalAccordion.Item");
  const generatedId = useId();
  const active = activeValue === value;
  const bladeId = `horizontal-accordion-blade-${generatedId}`;
  const panelId = `horizontal-accordion-panel-${generatedId}`;
  const itemContextValue = useMemo<ItemContextValue>(
    () => ({ active, bladeId, panelId, value }),
    [active, bladeId, panelId, value],
  );

  validateItemComposition(children, value);

  return (
    <ItemContext.Provider value={itemContextValue}>
      <div
        {...props}
        ref={ref}
        data-slot="horizontal-accordion-item"
        data-state={active ? "active" : "inactive"}
        className={horizontalAccordionItemClassNames({ className })}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
});

HorizontalAccordionItem.displayName = "HorizontalAccordionItem";

export const HorizontalAccordionBlade = forwardRef<
  HTMLButtonElement,
  HorizontalAccordionBladeProps
>(
  (
    {
      className,
      children,
      disabled = false,
      iconPosition = "start",
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const { setActiveValue } = useAccordionContext(
      "HorizontalAccordion.Blade",
    );
    const { active, bladeId, value } = useItemContext(
      "HorizontalAccordion.Blade",
    );
    const resolvedIconPosition =
      iconPosition === "top"
        ? "start"
        : iconPosition === "bottom"
          ? "end"
          : iconPosition;

    return (
      <button
        {...props}
        ref={ref}
        id={bladeId}
        data-slot="horizontal-accordion-blade"
        data-state={active ? "active" : "inactive"}
        data-icon-position={resolvedIconPosition}
        className={horizontalAccordionBladeClassNames({ className })}
        disabled={disabled}
        type={type}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            setActiveValue(value);
          }
        }}
      >
        {renderBladeChildren(children)}
      </button>
    );
  },
);

HorizontalAccordionBlade.displayName = "HorizontalAccordionBlade";

export const HorizontalAccordionBladeIcon = forwardRef<
  HTMLSpanElement,
  HorizontalAccordionBladeIconProps
>(({ className, ...props }, ref) => {
  const { active } = useItemContext("HorizontalAccordion.BladeIcon");

  return (
    <span
      {...props}
      ref={ref}
      data-slot="horizontal-accordion-blade-icon"
      data-state={active ? "active" : "inactive"}
      className={horizontalAccordionBladeIconClassNames({ className })}
    />
  );
});

HorizontalAccordionBladeIcon.displayName = "HorizontalAccordionBladeIcon";

export const HorizontalAccordionBladeLabel = forwardRef<
  HTMLSpanElement,
  HorizontalAccordionBladeLabelProps
>(
  (
    { className, orientation = "rotated", direction = "bottom-to-top", ...props },
    ref,
  ) => {
    const { active } = useItemContext("HorizontalAccordion.BladeLabel");

    return (
      <span
        {...props}
        ref={ref}
        data-slot="horizontal-accordion-blade-label"
        data-state={active ? "active" : "inactive"}
        data-orientation={orientation}
        data-direction={direction}
        className={horizontalAccordionBladeLabelClassNames({ className })}
      />
    );
  },
);

HorizontalAccordionBladeLabel.displayName = "HorizontalAccordionBladeLabel";

export const HorizontalAccordionPanel = forwardRef<
  HTMLDivElement,
  HorizontalAccordionPanelProps
>(({ className, children, ...props }, ref) => {
  const { unmountInactivePanels } = useAccordionContext(
    "HorizontalAccordion.Panel",
  );
  const { active, bladeId, panelId } = useItemContext(
    "HorizontalAccordion.Panel",
  );

  return (
    <div
      {...props}
      ref={ref}
      id={panelId}
      aria-labelledby={bladeId}
      data-slot="horizontal-accordion-panel"
      data-state={active ? "active" : "inactive"}
      className={horizontalAccordionPanelClassNames({ className })}
      hidden={!active}
    >
      {active || !unmountInactivePanels ? children : null}
    </div>
  );
});

HorizontalAccordionPanel.displayName = "HorizontalAccordionPanel";

markAccordionPart(HorizontalAccordionItem, "Item");
markAccordionPart(HorizontalAccordionBlade, "Blade");
markAccordionPart(HorizontalAccordionPanel, "Panel");

type HorizontalAccordionComponent = typeof HorizontalAccordionRoot & {
  Item: typeof HorizontalAccordionItem;
  Blade: typeof HorizontalAccordionBlade;
  BladeIcon: typeof HorizontalAccordionBladeIcon;
  BladeLabel: typeof HorizontalAccordionBladeLabel;
  Panel: typeof HorizontalAccordionPanel;
};

export const HorizontalAccordion = Object.assign(HorizontalAccordionRoot, {
  Item: HorizontalAccordionItem,
  Blade: HorizontalAccordionBlade,
  BladeIcon: HorizontalAccordionBladeIcon,
  BladeLabel: HorizontalAccordionBladeLabel,
  Panel: HorizontalAccordionPanel,
}) as HorizontalAccordionComponent;
