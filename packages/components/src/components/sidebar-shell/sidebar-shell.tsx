import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion as motionElement,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";
import {
  getSidebarShellPart,
  markSidebarShellPart,
} from "../../utils/sidebar-shell-part";
import {
  Sidebar,
  SidebarProvider,
  sidebarSkipLinkClassNames,
  type SidebarMotion,
  type SidebarSide,
  type SidebarVariant,
} from "../sidebar";

export type SidebarShellChrome = "workbench" | "plain";
export type SidebarShellLayout = "viewport";

type MotionBackedEventProps =
  | "onAnimationEnd"
  | "onAnimationEndCapture"
  | "onAnimationIteration"
  | "onAnimationIterationCapture"
  | "onAnimationStart"
  | "onAnimationStartCapture"
  | "onDrag"
  | "onDragCapture"
  | "onDragEnd"
  | "onDragEndCapture"
  | "onDragEnter"
  | "onDragEnterCapture"
  | "onDragExit"
  | "onDragExitCapture"
  | "onDragLeave"
  | "onDragLeaveCapture"
  | "onDragOver"
  | "onDragOverCapture"
  | "onDragStart"
  | "onDragStartCapture";

type MotionSafeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  MotionBackedEventProps
>;

type MotionSafeLandmarkProps = Omit<
  HTMLAttributes<HTMLElement>,
  MotionBackedEventProps
>;

export interface SidebarShellProps extends MotionSafeDivProps {
  animate?: boolean;
  chrome?: SidebarShellChrome;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  defaultMobileOpen?: boolean;
  mainId?: string;
  mobileOpen?: boolean;
  motion?: SidebarMotion;
  onCollapsedChange?: (collapsed: boolean) => void;
  onMobileOpenChange?: (open: boolean) => void;
  side?: SidebarSide;
  variant?: SidebarVariant;
}

export interface SidebarShellHeaderProps extends MotionSafeLandmarkProps {
  as?: "header" | "div";
}

export type SidebarShellNavigationProps = MotionSafeDivProps;

export interface SidebarShellMainProps extends MotionSafeLandmarkProps {
  as?: "main" | "div" | "section";
}

export interface SidebarShellFooterProps extends MotionSafeLandmarkProps {
  as?: "footer" | "div";
  /** Content width by default; shell spans beneath navigation and content. */
  span?: "content" | "shell";
}

export interface SidebarShellSkipLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  MotionBackedEventProps
> {
  targetId?: string;
}

export interface SidebarShellMotionConfig {
  hoverScale: number;
  motion: SidebarMotion;
  reducedMotion: boolean;
  surfaceLift: number;
  tapScale: number;
  transition: Transition;
}

type SidebarShellContextValue = {
  chrome: SidebarShellChrome;
  collapsed: boolean;
  mainId: string;
  motionConfig: SidebarShellMotionConfig;
  side: SidebarSide;
};

const SidebarShellContext = createContext<SidebarShellContextValue | null>(
  null,
);

const sidebarShellRootClasses =
  "group/sidebar-shell relative isolate grid [container-type:size] [--bottom-bar-shell-limit:50cqh] h-[100dvh] min-h-0 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] data-[has-shell-footer=true]:grid-rows-[minmax(0,1fr)_auto] overflow-hidden text-foreground data-[side=right]:grid-cols-[minmax(0,1fr)_auto] rtl:data-[side=left]:grid-cols-[minmax(0,1fr)_auto] rtl:data-[side=right]:grid-cols-[auto_minmax(0,1fr)] data-[has-navigation=false]:grid-cols-1 data-[chrome=workbench]:gap-[var(--dt-density-gap)] data-[chrome=workbench]:bg-muted/40 data-[chrome=workbench]:p-[var(--dt-density-gap)] data-[chrome=workbench]:[&>[data-slot=sidebar]]:h-full data-[chrome=workbench]:[&>[data-slot=sidebar]]:rounded-xl data-[chrome=workbench]:[&>[data-slot=sidebar]]:border data-[chrome=workbench]:[&>[data-slot=sidebar]]:shadow-sm data-[chrome=plain]:bg-background";

const sidebarShellFrameClasses =
  "relative z-0 col-start-2 row-start-1 grid [container-type:size] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-background group-data-[side=right]/sidebar-shell:col-start-1 rtl:group-data-[side=left]/sidebar-shell:col-start-1 rtl:group-data-[side=right]/sidebar-shell:col-start-2 group-data-[has-navigation=false]/sidebar-shell:col-span-full data-[chrome=workbench]:rounded-xl data-[chrome=workbench]:border data-[chrome=workbench]:border-border data-[chrome=workbench]:shadow-sm";

const sidebarShellNavigationClasses =
  "relative z-20 min-h-0 shrink-0 [&>[data-slot=sidebar]]:h-full data-[chrome=workbench]:rounded-xl data-[chrome=workbench]:border data-[chrome=workbench]:border-border data-[chrome=workbench]:shadow-sm data-[chrome=workbench]:[&>[data-slot=sidebar]]:rounded-[inherit] data-[chrome=workbench]:[&>[data-slot=sidebar]]:border-0";

const sidebarShellHeaderClasses =
  "relative z-10 row-start-1 flex min-h-[calc(var(--dt-density-control)+var(--dt-space-4))] min-w-0 items-center gap-[calc(var(--dt-density-gap)+var(--dt-space-1))] border-b border-border bg-background px-[var(--dt-space-4)] py-[var(--dt-density-gap)] text-foreground outline-none data-[chrome=workbench]:bg-muted/35";

const sidebarShellMainClasses =
  "row-start-2 min-h-0 min-w-0 overflow-auto overscroll-contain bg-background p-[calc(var(--dt-density-gap)+var(--dt-space-2))] text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

const sidebarShellFooterClasses =
  "relative z-10 row-start-3 flex min-h-[calc(var(--dt-density-control)+var(--dt-space-1))] min-w-0 flex-wrap items-center gap-[var(--dt-density-gap)] border-t border-border bg-background px-[var(--dt-space-4)] py-[var(--dt-density-gap)] pb-[max(var(--dt-density-gap),env(safe-area-inset-bottom))] text-sm text-muted-foreground data-[span=shell]:col-span-full data-[span=shell]:row-start-2 data-[span=shell]:max-h-[40dvh] data-[span=shell]:overflow-auto data-[chrome=workbench]:bg-muted/20 data-[span=shell]:data-[chrome=workbench]:rounded-xl data-[span=shell]:data-[chrome=workbench]:border";

const sidebarShellMotionSettings: Record<
  SidebarMotion,
  {
    bounce: number;
    duration: number;
    hoverScale: number;
    surfaceLift: number;
    tapScale: number;
  }
> = {
  none: {
    bounce: 0,
    duration: 0,
    hoverScale: 1,
    surfaceLift: 0,
    tapScale: 1,
  },
  subtle: {
    bounce: 0.02,
    duration: 0.18,
    hoverScale: 1.002,
    surfaceLift: 0.5,
    tapScale: 0.998,
  },
  standard: {
    bounce: 0.06,
    duration: 0.26,
    hoverScale: 1.004,
    surfaceLift: 1,
    tapScale: 0.996,
  },
  expressive: {
    bounce: 0.14,
    duration: 0.36,
    hoverScale: 1.008,
    surfaceLift: 1.5,
    tapScale: 0.992,
  },
};

export function getSidebarShellMotionConfig(
  motion: SidebarMotion,
  reducedMotion = false,
): SidebarShellMotionConfig {
  const resolvedMotion = reducedMotion ? "none" : motion;
  const settings = sidebarShellMotionSettings[resolvedMotion];

  return {
    hoverScale: settings.hoverScale,
    motion: resolvedMotion,
    reducedMotion: resolvedMotion === "none",
    surfaceLift: settings.surfaceLift,
    tapScale: settings.tapScale,
    transition:
      settings.duration === 0
        ? { duration: 0 }
        : {
            type: "spring",
            visualDuration: settings.duration,
            bounce: settings.bounce,
          },
  };
}

export function sidebarShellClassNames({
  className,
}: Pick<SidebarShellProps, "className"> = {}) {
  return cn(sidebarShellRootClasses, className);
}

export function sidebarShellFrameClassNames({
  className,
}: { className?: string } = {}) {
  return cn(sidebarShellFrameClasses, className);
}

export function sidebarShellNavigationClassNames({
  className,
}: Pick<SidebarShellNavigationProps, "className"> = {}) {
  return cn(sidebarShellNavigationClasses, className);
}

export function sidebarShellHeaderClassNames({
  className,
}: Pick<SidebarShellHeaderProps, "className"> = {}) {
  return cn(sidebarShellHeaderClasses, className);
}

export function sidebarShellMainClassNames({
  className,
}: Pick<SidebarShellMainProps, "className"> = {}) {
  return cn(sidebarShellMainClasses, className);
}

export function sidebarShellFooterClassNames({
  className,
}: Pick<SidebarShellFooterProps, "className"> = {}) {
  return cn(sidebarShellFooterClasses, className);
}

export function sidebarShellSkipLinkClassNames({
  className,
}: Pick<SidebarShellSkipLinkProps, "className"> = {}) {
  return sidebarSkipLinkClassNames({ className });
}

function useSidebarShellContext(componentName: string) {
  const context = useContext(SidebarShellContext);

  if (!context) {
    throw new Error(`${componentName} must be used within SidebarShell.`);
  }

  return context;
}

function useControllableBoolean({
  defaultValue = false,
  onChange,
  value,
}: {
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  value?: boolean;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = value ?? uncontrolledValue;

  const setValue = useCallback(
    (nextValue: boolean) => {
      if (nextValue === currentValue) {
        return;
      }

      if (!controlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [controlled, currentValue, onChange],
  );

  return [currentValue, setValue] as const;
}

// Fragments are transparent slots. Qualify keys so sibling fragments can reuse keys.
function flattenShellChildren(children: ReactNode, prefix = ""): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child];
    const key = `${prefix}${child.key}`;
    return child.type === Fragment
      ? flattenShellChildren(child.props.children, `${key}/`)
      : [cloneElement(child, { key })];
  });
}

function isSidebarChild(child: ReactNode) {
  if (!isValidElement(child) || typeof child.type === "string") {
    return false;
  }

  return (
    child.type === Sidebar ||
    (child.type as { displayName?: string }).displayName === "Sidebar"
  );
}

export const SidebarShellSkipLink = forwardRef<
  HTMLAnchorElement,
  SidebarShellSkipLinkProps
>(
  (
    { children = "Skip to main content", className, href, targetId, ...props },
    ref,
  ) => {
    const context = useSidebarShellContext("SidebarShellSkipLink");
    const resolvedTargetId = targetId ?? context.mainId;
    const motionConfig = context.motionConfig;

    return (
      <motionElement.a
        {...props}
        ref={ref}
        href={href ?? `#${resolvedTargetId}`}
        data-slot="sidebar-shell-skip-link"
        data-motion={motionConfig.motion}
        className={sidebarShellSkipLinkClassNames({ className })}
        initial={false}
        whileFocus={
          motionConfig.reducedMotion
            ? undefined
            : { y: -motionConfig.surfaceLift }
        }
        whileHover={
          motionConfig.reducedMotion
            ? undefined
            : {
                y: -motionConfig.surfaceLift,
                scale: motionConfig.hoverScale,
              }
        }
        whileTap={
          motionConfig.reducedMotion
            ? undefined
            : { scale: motionConfig.tapScale }
        }
        transition={motionConfig.transition}
      >
        {children}
      </motionElement.a>
    );
  },
);

SidebarShellSkipLink.displayName = "SidebarShellSkipLink";
markSidebarShellPart(SidebarShellSkipLink, "SkipLink");

export const SidebarShellNavigation = forwardRef<
  HTMLDivElement,
  SidebarShellNavigationProps
>(({ className, ...props }, ref) => {
  const context = useSidebarShellContext("SidebarShellNavigation");
  const motionConfig = context.motionConfig;

  return (
    <motionElement.div
      {...props}
      ref={ref}
      data-slot="sidebar-shell-navigation"
      data-chrome={context.chrome}
      data-collapsed={context.collapsed ? "true" : "false"}
      data-motion={motionConfig.motion}
      data-side={context.side}
      className={sidebarShellNavigationClassNames({ className })}
      initial={false}
      transition={motionConfig.transition}
    />
  );
});

SidebarShellNavigation.displayName = "SidebarShellNavigation";
markSidebarShellPart(SidebarShellNavigation, "Navigation");

export const SidebarShellHeader = forwardRef<
  HTMLElement,
  SidebarShellHeaderProps
>(({ as = "header", className, ...props }, ref) => {
  const context = useSidebarShellContext("SidebarShellHeader");
  const motionConfig = context.motionConfig;
  const motionProps = {
    ...props,
    "data-slot": "sidebar-shell-header",
    "data-chrome": context.chrome,
    "data-collapsed": context.collapsed ? "true" : "false",
    "data-motion": motionConfig.motion,
    "data-side": context.side,
    className: sidebarShellHeaderClassNames({ className }),
    initial: false as const,
    layout: "position" as const,
    whileHover: motionConfig.reducedMotion
      ? undefined
      : { y: -motionConfig.surfaceLift },
    transition: motionConfig.transition,
  };

  if (as === "div") {
    return (
      <motionElement.div
        {...motionProps}
        ref={ref as ForwardedRef<HTMLDivElement>}
      />
    );
  }

  return <motionElement.header {...motionProps} ref={ref} />;
});

SidebarShellHeader.displayName = "SidebarShellHeader";
markSidebarShellPart(SidebarShellHeader, "Header");

export const SidebarShellMain = forwardRef<HTMLElement, SidebarShellMainProps>(
  ({ as = "main", className, id, tabIndex = 0, ...props }, ref) => {
    const context = useSidebarShellContext("SidebarShellMain");
    const motionConfig = context.motionConfig;
    const motionProps = {
      ...props,
      id: id ?? context.mainId,
      tabIndex,
      "data-slot": "sidebar-shell-main",
      "data-chrome": context.chrome,
      "data-collapsed": context.collapsed ? "true" : "false",
      "data-motion": motionConfig.motion,
      "data-side": context.side,
      className: sidebarShellMainClassNames({ className }),
      initial: false as const,
      transition: motionConfig.transition,
    };

    if (as === "div") {
      return (
        <motionElement.div
          {...motionProps}
          ref={ref as ForwardedRef<HTMLDivElement>}
        />
      );
    }

    if (as === "section") {
      return <motionElement.section {...motionProps} ref={ref} />;
    }

    return <motionElement.main {...motionProps} ref={ref} />;
  },
);

SidebarShellMain.displayName = "SidebarShellMain";
markSidebarShellPart(SidebarShellMain, "Main");

export const SidebarShellFooter = forwardRef<
  HTMLElement,
  SidebarShellFooterProps
>(({ as = "footer", className, span = "content", ...props }, ref) => {
  const context = useSidebarShellContext("SidebarShellFooter");
  const motionConfig = context.motionConfig;
  const motionProps = {
    ...props,
    "data-slot": "sidebar-shell-footer",
    "data-span": span,
    "data-chrome": context.chrome,
    "data-collapsed": context.collapsed ? "true" : "false",
    "data-motion": motionConfig.motion,
    "data-side": context.side,
    className: sidebarShellFooterClassNames({ className }),
    initial: false as const,
    layout: "position" as const,
    transition: motionConfig.transition,
  };

  if (as === "div") {
    return (
      <motionElement.div
        {...motionProps}
        ref={ref as ForwardedRef<HTMLDivElement>}
      />
    );
  }

  return <motionElement.footer {...motionProps} ref={ref} />;
});

SidebarShellFooter.displayName = "SidebarShellFooter";
markSidebarShellPart(SidebarShellFooter, "Footer");

export const SidebarShell = forwardRef<HTMLDivElement, SidebarShellProps>(
  (
    {
      animate = true,
      children,
      chrome = "workbench",
      className,
      collapsed,
      defaultCollapsed = false,
      defaultMobileOpen = false,
      mainId,
      mobileOpen,
      motion = "standard",
      onCollapsedChange,
      onMobileOpenChange,
      side = "left",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const generatedMainId = useId();
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion =
      !animate || motion === "none" || prefersReducedMotion === true;
    const motionConfig = useMemo(
      () => getSidebarShellMotionConfig(motion, reducedMotion),
      [motion, reducedMotion],
    );
    const [resolvedCollapsed, setCollapsed] = useControllableBoolean({
      defaultValue: defaultCollapsed,
      onChange: onCollapsedChange,
      value: collapsed,
    });
    const [resolvedMobileOpen, setMobileOpen] = useControllableBoolean({
      defaultValue: defaultMobileOpen,
      onChange: onMobileOpenChange,
      value: mobileOpen,
    });
    const resolvedChildren = flattenShellChildren(children);
    const explicitMainId = resolvedChildren.find(
      (child) => getSidebarShellPart(child) === "Main",
    );
    const childMainId = isValidElement(explicitMainId)
      ? (explicitMainId.props as { id?: string }).id
      : undefined;
    const resolvedMainId =
      childMainId ?? mainId ?? `sidebar-shell-main-${generatedMainId}`;
    const contextValue: SidebarShellContextValue = {
      chrome,
      collapsed: resolvedCollapsed,
      mainId: resolvedMainId,
      motionConfig,
      side,
    };
    const skipLinkChildren = resolvedChildren.filter(
      (child) => getSidebarShellPart(child) === "SkipLink",
    );
    const navigationChildren = resolvedChildren.filter(isSidebarChild);
    const navigationRegionChildren = resolvedChildren.filter(
      (child) => getSidebarShellPart(child) === "Navigation",
    );
    const shellFooters = resolvedChildren.filter(
      (child) =>
        getSidebarShellPart(child) === "Footer" &&
        isValidElement<SidebarShellFooterProps>(child) &&
        child.props.span === "shell",
    );
    const frameChildren = resolvedChildren.filter(
      (child) =>
        getSidebarShellPart(child) !== "SkipLink" &&
        getSidebarShellPart(child) !== "Navigation" &&
        !shellFooters.includes(child) &&
        !isSidebarChild(child),
    );
    const navigation = [...navigationRegionChildren, ...navigationChildren];
    const frame = (
      <motionElement.div
        key="shell-frame"
        data-slot="sidebar-shell-frame"
        data-chrome={chrome}
        data-collapsed={resolvedCollapsed ? "true" : "false"}
        data-motion={motionConfig.motion}
        className={sidebarShellFrameClassNames()}
        initial={false}
      >
        {frameChildren}
      </motionElement.div>
    );

    return (
      <SidebarProvider
        animate={animate}
        className="contents"
        collapsed={resolvedCollapsed}
        mobileOpen={resolvedMobileOpen}
        motion={motionConfig.motion}
        onCollapsedChange={setCollapsed}
        onMobileOpenChange={setMobileOpen}
        side={side}
        variant={variant}
      >
        <SidebarShellContext.Provider value={contextValue}>
          <MotionConfig
            reducedMotion={motionConfig.reducedMotion ? "always" : "user"}
            transition={motionConfig.transition}
          >
            <motionElement.div
              role={
                props["aria-label"] || props["aria-labelledby"]
                  ? "group"
                  : undefined
              }
              {...props}
              ref={ref}
              data-slot="sidebar-shell"
              data-animate={animate ? "true" : "false"}
              data-chrome={chrome}
              data-collapsed={resolvedCollapsed ? "true" : "false"}
              data-layout="viewport"
              data-mobile-open={resolvedMobileOpen ? "true" : "false"}
              data-motion={motionConfig.motion}
              data-reduced-motion={
                motionConfig.reducedMotion ? "true" : undefined
              }
              data-side={side}
              data-has-navigation={navigation.length > 0 ? "true" : "false"}
              data-has-shell-footer={shellFooters.length > 0 ? "true" : "false"}
              className={sidebarShellClassNames({ className })}
              initial={false}
            >
              {skipLinkChildren.length > 0 ? (
                skipLinkChildren
              ) : (
                <SidebarShellSkipLink />
              )}
              {side === "left"
                ? [...navigation, frame]
                : [frame, ...navigation]}
              {shellFooters}
            </motionElement.div>
          </MotionConfig>
        </SidebarShellContext.Provider>
      </SidebarProvider>
    );
  },
);

SidebarShell.displayName = "SidebarShell";
