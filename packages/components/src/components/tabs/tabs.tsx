import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  MotionConfig,
  motion as motionElement,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";
import { useHydrated } from "../../utils/use-hydrated";

export type TabsValue = string;
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";
export type TabsVariant = "pill" | "line";
export type TabsSize = "sm" | "md" | "lg";
export type TabsMotionPreset = "none" | "subtle" | "standard" | "expressive";

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> {
  activationMode?: TabsActivationMode;
  /**
   * Collapse horizontal triggers to their icon, revealing the label only for the
   * selected trigger and on hover/focus. Requires each Tabs.Trigger to pass an
   * `icon`. Vertical tabs always show their labels.
   */
  collapsible?: boolean;
  defaultValue?: TabsValue;
  disabled?: boolean;
  loop?: boolean;
  motionPreset?: TabsMotionPreset;
  onValueChange?: (value: TabsValue) => void;
  orientation?: TabsOrientation;
  size?: TabsSize;
  value?: TabsValue;
  variant?: TabsVariant;
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export interface TabsTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value"
> {
  /**
   * Leading icon rendered before the label. Stays visible when the label collapses
   * in a collapsible Tabs, so pass a decorative icon and keep the label as children.
   */
  icon?: ReactNode;
  value: TabsValue;
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  value: TabsValue;
}

type TabsContextValue = {
  activationMode: TabsActivationMode;
  collapsible: boolean;
  contentMotionReady: boolean;
  disabled: boolean;
  focusValue: (value: TabsValue, source?: HTMLElement | null) => void;
  getPanelId: (value: TabsValue) => string;
  getTabId: (value: TabsValue) => string;
  layoutId: string;
  loop: boolean;
  motionPreset: TabsMotionPreset;
  orientation: TabsOrientation;
  reducedMotion: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  selectValue: (value: TabsValue) => void;
  selectedValue: TabsValue | undefined;
  size: TabsSize;
  tabStopValue: TabsValue | undefined;
  transition: Transition;
  variant: TabsVariant;
};

type TabsPartName = "List" | "Trigger" | "Panel";
type MarkedTabsPart = {
  [TABS_PART]?: TabsPartName;
};

type TriggerDefinition = {
  disabled: boolean;
  value: TabsValue;
};

const TABS_PART = Symbol.for("@dethink/tabs.part");
const TabsContext = createContext<TabsContextValue | null>(null);

const tabsRootClasses = "grid w-full min-w-0 gap-[var(--dt-space-4)]";

const tabsListBaseClasses =
  "relative isolate flex min-w-0 text-sm font-medium text-muted-foreground";

const tabsListVariantClasses: Record<TabsVariant, string> = {
  pill: "w-fit rounded-lg border border-border bg-muted/40 p-1 shadow-sm",
  line: "w-full border-border",
};

const tabsListOrientationClasses: Record<
  TabsVariant,
  Record<TabsOrientation, string>
> = {
  pill: {
    horizontal: "flex-row items-center gap-[var(--dt-space-1)]",
    vertical: "w-full flex-col items-stretch gap-[var(--dt-space-1)]",
  },
  line: {
    horizontal: "flex-row items-center gap-[var(--dt-space-4)] border-b",
    vertical:
      "w-full flex-col items-stretch gap-[var(--dt-space-1)] border-b-0 border-e pe-[var(--dt-space-3)]",
  },
};

const tabsTriggerBaseClasses =
  "group relative isolate inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[background-color,border-color,color,box-shadow,transform] motion-safe:duration-150 motion-safe:ease-out motion-safe:active:scale-[0.97] motion-reduce:transition-none";

// The content span lifts above the decorative active layer and lays the optional
// icon and label out as a centered row, so a block-level <svg> (Tailwind preflight
// sets svg { display:block }) sits beside its label instead of stacking above it.
const tabsTriggerContentClasses =
  "relative z-[1] inline-flex min-w-0 items-center justify-center";

const tabsTriggerIconClasses =
  "grid shrink-0 place-items-center [&_svg]:size-[1.15em]";

// Static label beside an icon (non-collapsible). ps-2 gives the icon breathing room.
const tabsTriggerLabelClasses = "inline-flex items-center gap-1.5 ps-2";

// Collapsible label: an animatable grid column that expands from 0fr to 1fr when the
// trigger is selected, hovered, or keyboard-focused. The label stays mounted (only
// clipped) so its text remains the trigger's accessible name while icon-only.
const tabsTriggerLabelCollapseClasses =
  "grid overflow-hidden motion-safe:transition-[grid-template-columns] motion-safe:duration-200 motion-safe:ease-out [grid-template-columns:0fr] group-hover:[grid-template-columns:1fr] group-focus-visible:[grid-template-columns:1fr] group-data-[selected=true]:[grid-template-columns:1fr]";

const tabsTriggerLabelCollapseInnerClasses =
  "inline-flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap ps-2";

const tabsTriggerVariantClasses: Record<TabsVariant, string> = {
  pill: "rounded-md text-muted-foreground hover:bg-background/70 hover:text-foreground data-[selected=true]:text-primary-foreground",
  line: "rounded-none border-b-2 border-transparent text-muted-foreground hover:text-foreground data-[selected=true]:text-primary",
};

const tabsTriggerSizeClasses: Record<TabsSize, string> = {
  sm: "min-h-8 px-[var(--dt-space-2-5)] text-xs",
  md: "min-h-density-control px-[var(--dt-space-3)] text-sm",
  lg: "min-h-11 px-[var(--dt-space-4)] text-base",
};

const tabsPanelClasses =
  "min-w-0 rounded-md text-sm leading-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const tabsActiveLayerVariantClasses: Record<TabsVariant, string> = {
  pill: "absolute inset-0 rounded-md bg-primary shadow-sm",
  line: "absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary",
};

const tabsMotionSettings: Record<
  TabsMotionPreset,
  { bounce: number; duration: number }
> = {
  none: { bounce: 0, duration: 0 },
  subtle: { bounce: 0, duration: 0.16 },
  standard: { bounce: 0.04, duration: 0.22 },
  expressive: { bounce: 0.12, duration: 0.3 },
};

// Entrance motion for the freshly revealed panel body. The offset travels along
// the same axis the active layer glides, so the content feels tied to the tab
// that summoned it. Distances stay small to avoid layout-shift and scrollbars.
const tabsPanelMotionSettings: Record<
  TabsMotionPreset,
  { duration: number; offset: number }
> = {
  none: { duration: 0, offset: 0 },
  subtle: { duration: 0.18, offset: 4 },
  standard: { duration: 0.24, offset: 8 },
  expressive: { duration: 0.32, offset: 12 },
};

// A gentle ease-out curve so the body settles without overshooting its content.
const tabsPanelEase = [0.22, 1, 0.36, 1] as const;

const tabsPanelContentClasses = "min-w-0";

function useTabsContext(component: string) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(`${component} must be used within Tabs.`);
  }

  return context;
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

function markTabsPart(component: unknown, partName: TabsPartName) {
  Object.defineProperty(component, TABS_PART, {
    configurable: true,
    value: partName,
  });
}

function getTabsPartName(type: unknown) {
  if (
    typeof type === "function" ||
    (typeof type === "object" && type !== null)
  ) {
    return (type as MarkedTabsPart)[TABS_PART];
  }

  return undefined;
}

function collectTriggers(children: ReactNode, triggers: TriggerDefinition[]) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const partName = getTabsPartName(child.type);
    const props = child.props as {
      children?: ReactNode;
      disabled?: boolean;
      value?: TabsValue;
    };

    if (partName === "Trigger" && props.value !== undefined) {
      triggers.push({
        disabled: props.disabled === true,
        value: props.value,
      });
      return;
    }

    if (props.children !== undefined) {
      collectTriggers(props.children, triggers);
    }
  });
}

function getTriggerDefinitions(children: ReactNode) {
  const triggers: TriggerDefinition[] = [];
  collectTriggers(children, triggers);
  return triggers;
}

function getIdPart(value: TabsValue) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return `${normalized || "tab"}-${hash.toString(36)}`;
}

function createTabsTransition(
  motionPreset: TabsMotionPreset,
  reducedMotion: boolean,
): Transition {
  const settings = reducedMotion
    ? tabsMotionSettings.none
    : tabsMotionSettings[motionPreset];

  if (settings.duration === 0) {
    return { duration: 0 };
  }

  return {
    type: "spring",
    visualDuration: settings.duration,
    bounce: settings.bounce,
  };
}

function getEnabledTabButtons(root: HTMLElement | null) {
  return Array.from(
    root?.querySelectorAll<HTMLButtonElement>(
      'button[data-slot="tabs-trigger"]:not(:disabled)',
    ) ?? [],
  );
}

function isRootRtl(root: HTMLElement | null) {
  if (!root || typeof window === "undefined") {
    return false;
  }

  const closestDirection =
    root.getAttribute("dir") ??
    root.closest<HTMLElement>("[dir]")?.getAttribute("dir");

  if (closestDirection) {
    return closestDirection === "rtl";
  }

  return window.getComputedStyle(root).direction === "rtl";
}

function focusTabAtOffset({
  currentTarget,
  loop,
  offset,
  root,
}: {
  currentTarget: HTMLElement;
  loop: boolean;
  offset: number;
  root: HTMLElement | null;
}) {
  const tabs = getEnabledTabButtons(root);
  const currentIndex = tabs.findIndex((tab) => tab === currentTarget);

  if (currentIndex === -1 || tabs.length === 0) {
    return;
  }

  const nextIndex = currentIndex + offset;

  if (!loop && (nextIndex < 0 || nextIndex >= tabs.length)) {
    return;
  }

  tabs[(nextIndex + tabs.length) % tabs.length]?.focus();
}

function focusTabAtIndex(root: HTMLElement | null, index: number) {
  const tabs = getEnabledTabButtons(root);
  const targetIndex = index < 0 ? tabs.length + index : index;

  tabs[targetIndex]?.focus();
}

export function tabsClassNames({
  className,
}: Pick<TabsProps, "className"> = {}) {
  return cn(tabsRootClasses, className);
}

export function tabsListClassNames({
  className,
  orientation = "horizontal",
  variant = "pill",
}: Pick<TabsListProps, "className"> &
  Pick<TabsProps, "orientation" | "variant"> = {}) {
  return cn(
    tabsListBaseClasses,
    tabsListVariantClasses[variant],
    tabsListOrientationClasses[variant][orientation],
    className,
  );
}

export function tabsTriggerClassNames({
  className,
  size = "md",
  variant = "pill",
}: Pick<TabsTriggerProps, "className"> &
  Pick<TabsProps, "size" | "variant"> = {}) {
  return cn(
    tabsTriggerBaseClasses,
    tabsTriggerVariantClasses[variant],
    tabsTriggerSizeClasses[size],
    className,
  );
}

export function tabsPanelClassNames({
  className,
}: Pick<TabsPanelProps, "className"> = {}) {
  return cn(tabsPanelClasses, className);
}

function TabsActiveLayer({
  layoutId,
  motionPreset,
  reducedMotion,
  transition,
  variant,
}: {
  layoutId: string;
  motionPreset: TabsMotionPreset;
  reducedMotion: boolean;
  transition: Transition;
  variant: TabsVariant;
}) {
  const props = {
    "aria-hidden": true,
    "data-motion-enabled": reducedMotion ? undefined : "true",
    "data-motion-preset": motionPreset,
    "data-reduced-motion": reducedMotion ? "true" : undefined,
    "data-slot": "tabs-active-layer",
    className: tabsActiveLayerVariantClasses[variant],
  } as const;

  if (reducedMotion) {
    return <span {...props} />;
  }

  return (
    <motionElement.span
      {...props}
      layoutId={layoutId}
      transition={transition}
    />
  );
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      activationMode = "automatic",
      children,
      className,
      collapsible = false,
      defaultValue,
      disabled = false,
      loop = true,
      motionPreset = "standard",
      onValueChange,
      orientation = "horizontal",
      size = "md",
      value,
      variant = "pill",
      ...props
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const generatedId = useId();
    const controlled = Object.hasOwn(props, "value") || value !== undefined;
    const triggerDefinitions = useMemo(
      () => getTriggerDefinitions(children),
      [children],
    );
    const firstEnabledValue = triggerDefinitions.find(
      (trigger) => !trigger.disabled,
    )?.value;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [focusedValue, setFocusedValue] = useState<TabsValue | undefined>();
    // Panels animate their body in only after mount, so the server-rendered and
    // first client render show the initial panel content statically and visible.
    // The entrance then plays on user-driven tab changes without an SSR flash of
    // invisible content or a hydration mismatch.
    const selectedValue = controlled
      ? value
      : (uncontrolledValue ?? firstEnabledValue);
    const tabStopValue = focusedValue ?? selectedValue ?? firstEnabledValue;
    const prefersReducedMotion = useReducedMotion();
    const hasHydrated = useHydrated();
    const contentMotionReady = hasHydrated;
    const reducedMotion =
      motionPreset === "none" || (hasHydrated && prefersReducedMotion === true);
    const transition = useMemo(
      () => createTabsTransition(motionPreset, reducedMotion),
      [motionPreset, reducedMotion],
    );
    const rootId = `tabs-${generatedId}`;

    const getTabId = useCallback(
      (tabValue: TabsValue) => `${rootId}-trigger-${getIdPart(tabValue)}`,
      [rootId],
    );
    const getPanelId = useCallback(
      (tabValue: TabsValue) => `${rootId}-panel-${getIdPart(tabValue)}`,
      [rootId],
    );

    const selectValue = useCallback(
      (nextValue: TabsValue) => {
        if (disabled) {
          return;
        }

        const trigger = triggerDefinitions.find(
          (definition) => definition.value === nextValue,
        );

        if (trigger?.disabled) {
          return;
        }

        if (nextValue === selectedValue) {
          return;
        }

        if (!controlled) {
          setUncontrolledValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      [controlled, disabled, onValueChange, selectedValue, triggerDefinitions],
    );

    const focusValue = useCallback(
      (nextValue: TabsValue, source?: HTMLElement | null) => {
        setFocusedValue(nextValue);

        if (activationMode === "automatic") {
          selectValue(nextValue);
        }

        if (source) {
          source.focus();
        }
      },
      [activationMode, selectValue],
    );

    const contextValue = useMemo<TabsContextValue>(
      () => ({
        activationMode,
        collapsible,
        contentMotionReady,
        disabled,
        focusValue,
        getPanelId,
        getTabId,
        layoutId: `${rootId}-active-layer`,
        loop,
        motionPreset,
        orientation,
        reducedMotion,
        rootRef,
        selectValue,
        selectedValue,
        size,
        tabStopValue,
        transition,
        variant,
      }),
      [
        activationMode,
        collapsible,
        contentMotionReady,
        disabled,
        focusValue,
        getPanelId,
        getTabId,
        loop,
        motionPreset,
        orientation,
        reducedMotion,
        rootId,
        selectValue,
        selectedValue,
        size,
        tabStopValue,
        transition,
        variant,
      ],
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
          <div
            {...props}
            ref={composeRefs(rootRef, ref)}
            data-slot="tabs"
            data-activation-mode={activationMode}
            data-collapsible={collapsible ? "true" : undefined}
            data-disabled={disabled ? "true" : undefined}
            data-motion-preset={motionPreset}
            data-orientation={orientation}
            data-reduced-motion={reducedMotion ? "true" : undefined}
            data-size={size}
            data-variant={variant}
            className={tabsClassNames({ className })}
          >
            {children}
          </div>
        </MotionConfig>
      </TabsContext.Provider>
    );
  },
);

TabsRoot.displayName = "Tabs";

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      "aria-orientation": ariaOrientation,
      className,
      children,
      role = "tablist",
      ...props
    },
    ref,
  ) => {
    const { orientation, size, variant } = useTabsContext("Tabs.List");

    return (
      <div
        {...props}
        ref={ref}
        aria-orientation={
          ariaOrientation ??
          (orientation === "vertical" ? "vertical" : undefined)
        }
        data-orientation={orientation}
        data-size={size}
        data-slot="tabs-list"
        data-variant={variant}
        role={role}
        className={tabsListClassNames({ className, orientation, variant })}
      >
        {children}
      </div>
    );
  },
);

TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      className,
      children,
      disabled: disabledProp = false,
      icon,
      onClick,
      onFocus,
      onKeyDown,
      type = "button",
      value,
      ...props
    },
    ref,
  ) => {
    const {
      activationMode,
      collapsible,
      disabled: rootDisabled,
      focusValue,
      getPanelId,
      getTabId,
      layoutId,
      loop,
      motionPreset,
      orientation,
      reducedMotion,
      rootRef,
      selectValue,
      selectedValue,
      size,
      tabStopValue,
      transition,
      variant,
    } = useTabsContext("Tabs.Trigger");
    const disabled = rootDisabled || disabledProp;
    const selected = selectedValue === value;
    const tabIndex = disabled ? undefined : value === tabStopValue ? 0 : -1;
    const hasIcon = icon !== undefined && icon !== null;
    const collapseLabel =
      collapsible && hasIcon && orientation === "horizontal";

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      onFocus?.(event);

      if (!event.defaultPrevented && !disabled) {
        focusValue(value);
      }
    };

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (!event.defaultPrevented && !disabled) {
        focusValue(value);

        if (activationMode === "manual") {
          selectValue(value);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      const isRtl = isRootRtl(rootRef.current);
      const nextOffset = isRtl ? -1 : 1;
      const previousOffset = isRtl ? 1 : -1;

      if (orientation === "horizontal" && event.key === "ArrowRight") {
        event.preventDefault();
        focusTabAtOffset({
          currentTarget: event.currentTarget,
          loop,
          offset: nextOffset,
          root: rootRef.current,
        });
        return;
      }

      if (orientation === "horizontal" && event.key === "ArrowLeft") {
        event.preventDefault();
        focusTabAtOffset({
          currentTarget: event.currentTarget,
          loop,
          offset: previousOffset,
          root: rootRef.current,
        });
        return;
      }

      if (orientation === "vertical" && event.key === "ArrowDown") {
        event.preventDefault();
        focusTabAtOffset({
          currentTarget: event.currentTarget,
          loop,
          offset: 1,
          root: rootRef.current,
        });
        return;
      }

      if (orientation === "vertical" && event.key === "ArrowUp") {
        event.preventDefault();
        focusTabAtOffset({
          currentTarget: event.currentTarget,
          loop,
          offset: -1,
          root: rootRef.current,
        });
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusTabAtIndex(rootRef.current, 0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusTabAtIndex(rootRef.current, -1);
        return;
      }

      if (
        activationMode === "manual" &&
        (event.key === "Enter" || event.key === " " || event.key === "Spacebar")
      ) {
        event.preventDefault();
        focusValue(value);
        selectValue(value);
      }
    };

    return (
      <button
        {...props}
        ref={ref}
        id={getTabId(value)}
        aria-controls={getPanelId(value)}
        aria-selected={selected}
        data-collapsible={collapseLabel ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-motion-preset={motionPreset}
        data-orientation={orientation}
        data-selected={selected ? "true" : undefined}
        data-size={size}
        data-slot="tabs-trigger"
        data-state={selected ? "active" : "inactive"}
        data-value={value}
        data-variant={variant}
        disabled={disabled}
        role="tab"
        tabIndex={tabIndex}
        type={type}
        className={tabsTriggerClassNames({ className, size, variant })}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      >
        {selected ? (
          <TabsActiveLayer
            layoutId={layoutId}
            motionPreset={motionPreset}
            reducedMotion={reducedMotion}
            transition={transition}
            variant={variant}
          />
        ) : null}
        <span
          data-slot="tabs-trigger-content"
          className={cn(
            tabsTriggerContentClasses,
            collapsible &&
              hasIcon &&
              orientation === "vertical" &&
              "w-full justify-start",
          )}
        >
          {hasIcon ? (
            <span
              data-slot="tabs-trigger-icon"
              className={tabsTriggerIconClasses}
            >
              {icon}
            </span>
          ) : null}
          {hasIcon ? (
            collapseLabel ? (
              <span
                data-slot="tabs-trigger-label"
                className={tabsTriggerLabelCollapseClasses}
              >
                <span className={tabsTriggerLabelCollapseInnerClasses}>
                  {children}
                </span>
              </span>
            ) : (
              <span
                data-slot="tabs-trigger-label"
                className={tabsTriggerLabelClasses}
              >
                {children}
              </span>
            )
          ) : (
            children
          )}
        </span>
      </button>
    );
  },
);

TabsTrigger.displayName = "TabsTrigger";

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  (
    {
      className,
      children,
      forceMount = false,
      hidden: hiddenProp,
      tabIndex,
      value,
      ...props
    },
    ref,
  ) => {
    const {
      contentMotionReady,
      getPanelId,
      getTabId,
      motionPreset,
      orientation,
      reducedMotion,
      selectedValue,
    } = useTabsContext("Tabs.Panel");
    const selected = selectedValue === value;

    if (!selected && !forceMount) {
      return null;
    }

    // Only non-forceMount panels remount on selection, which is what lets the
    // entrance animation replay on each tab change. Force-mounted panels persist
    // their DOM (and any local state), so they render statically.
    const animateContent =
      selected && !forceMount && !reducedMotion && motionPreset !== "none";
    const panelSettings = tabsPanelMotionSettings[motionPreset];
    const offsetAxis = orientation === "vertical" ? "x" : "y";

    return (
      <div
        {...props}
        ref={ref}
        id={getPanelId(value)}
        aria-labelledby={getTabId(value)}
        data-selected={selected ? "true" : undefined}
        data-slot="tabs-panel"
        data-state={selected ? "active" : "inactive"}
        hidden={hiddenProp ?? !selected}
        role="tabpanel"
        tabIndex={tabIndex ?? (selected ? 0 : undefined)}
        className={tabsPanelClassNames({ className })}
      >
        <motionElement.div
          data-slot="tabs-panel-content"
          className={tabsPanelContentClasses}
          initial={
            animateContent && contentMotionReady
              ? { opacity: 0, [offsetAxis]: panelSettings.offset }
              : false
          }
          animate={{ opacity: 1, [offsetAxis]: 0 }}
          transition={{
            duration: animateContent ? panelSettings.duration : 0,
            ease: tabsPanelEase,
          }}
        >
          {children}
        </motionElement.div>
      </div>
    );
  },
);

TabsPanel.displayName = "TabsPanel";

markTabsPart(TabsList, "List");
markTabsPart(TabsTrigger, "Trigger");
markTabsPart(TabsPanel, "Panel");

type TabsComponent = typeof TabsRoot & {
  List: typeof TabsList;
  Panel: typeof TabsPanel;
  Trigger: typeof TabsTrigger;
};

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Panel: TabsPanel,
  Trigger: TabsTrigger,
}) as TabsComponent;
