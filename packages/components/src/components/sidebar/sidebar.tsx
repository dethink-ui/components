import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TransitionEventHandler,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion as motionElement,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "motion/react";
import { cn } from "../../utils/cn";

const subscribePortal = () => () => {};
const getPortalSnapshot = () => document.body;
const getServerPortalSnapshot = () => null;

export type SidebarSide = "left" | "right";
export type SidebarVariant =
  "default" | "floating" | "inset" | "rail" | "bordered";
export type SidebarMotion = "none" | "subtle" | "standard" | "expressive";
export type SidebarTriggerAction = "toggle" | "expand" | "collapse";

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  defaultMobileOpen?: boolean;
  mobileOpen?: boolean;
  motion?: SidebarMotion;
  onCollapsedChange?: (collapsed: boolean) => void;
  onMobileOpenChange?: (open: boolean) => void;
  side?: SidebarSide;
  variant?: SidebarVariant;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  side?: SidebarSide;
  variant?: SidebarVariant;
}

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}
export interface SidebarGroupLabelProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarGroupContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface SidebarGroupTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
export interface SidebarMobileProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  closeButtonLabel?: string;
  label?: ReactNode;
  overlayClassName?: string;
  side?: SidebarSide;
  showCloseButton?: boolean;
}
export interface SidebarMobileTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children?: ReactNode;
  closeLabel?: string;
  openLabel?: string;
  side?: SidebarSide;
}
export interface SidebarMenuProps extends HTMLAttributes<HTMLUListElement> {}
export interface SidebarMenuItemProps extends HTMLAttributes<HTMLLIElement> {}
export interface SidebarMenuBadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export interface SidebarTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  action?: SidebarTriggerAction;
  children?: ReactNode;
  collapseLabel?: string;
  expandLabel?: string;
  side?: SidebarSide;
}

export interface SidebarRailProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children?: ReactNode;
  collapseLabel?: string;
  expandLabel?: string;
  side?: SidebarSide;
}

type SidebarMenuCommonProps = {
  active?: boolean;
  badge?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  shortcut?: ReactNode;
  tooltip?: string;
};

type SidebarMenuLinkBaseProps = SidebarMenuCommonProps & {
  asChild?: boolean;
  current?: boolean;
};

type NativeSidebarMenuLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  SidebarMenuLinkBaseProps & {
    asChild?: false;
    children: ReactNode;
    href: string;
  };

type ChildSidebarMenuLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  SidebarMenuLinkBaseProps & {
    asChild: true;
    children: ReactElement<SidebarMenuLinkSlotProps>;
    href?: string;
  };

export type SidebarMenuLinkProps =
  NativeSidebarMenuLinkProps | ChildSidebarMenuLinkProps;

export interface SidebarMenuButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, SidebarMenuCommonProps {}

export interface SidebarMenuActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  showOnHover?: boolean;
}

export interface SidebarSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export interface SidebarInsetProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "main" | "section";
}

export interface SidebarSkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId?: string;
}

type SidebarMenuLinkSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  "aria-current"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
};

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  mobileTriggerElement: HTMLButtonElement | null;
  motion: SidebarMotion;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setMobileTriggerElement: (element: HTMLButtonElement | null) => void;
  side: SidebarSide;
  toggleCollapsed: () => void;
  toggleMobileOpen: () => void;
  variant: SidebarVariant;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

interface SidebarSurfaceContextValue {
  collapsed: boolean;
  side: SidebarSide;
  variant: SidebarVariant;
}

const SidebarSurfaceContext = createContext<SidebarSurfaceContextValue | null>(
  null,
);

interface SidebarGroupContextValue {
  collapsible: boolean;
  contentId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

const SidebarGroupContext = createContext<SidebarGroupContextValue | null>(
  null,
);

const sidebarProviderClasses =
  "group/sidebar-provider flex min-h-0 w-full min-w-0 text-foreground [--sidebar-motion-duration:220ms] [--sidebar-motion-ease:cubic-bezier(0.34,1.24,0.64,1)] [--sidebar-width:16rem] [--sidebar-width-collapsed:3.5rem] data-[motion=expressive]:[--sidebar-motion-duration:320ms] data-[motion=expressive]:[--sidebar-motion-ease:cubic-bezier(0.34,1.56,0.64,1)] data-[motion=none]:[--sidebar-motion-duration:0ms] data-[motion=none]:[--sidebar-motion-ease:linear] data-[motion=standard]:[--sidebar-motion-duration:220ms] data-[motion=standard]:[--sidebar-motion-ease:cubic-bezier(0.34,1.24,0.64,1)] data-[motion=subtle]:[--sidebar-motion-duration:150ms] data-[motion=subtle]:[--sidebar-motion-ease:cubic-bezier(0.16,1,0.3,1)]";

const sidebarClasses =
  "group group/sidebar relative flex min-h-0 w-[var(--sidebar-width)] shrink-0 flex-col overflow-visible border-border bg-background text-foreground outline-none data-[collapsed=true]:w-[var(--sidebar-width-collapsed)] data-[side=left]:border-e data-[side=right]:border-s";

const sidebarViewportClasses =
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit]";

const sidebarVariantClasses: Record<SidebarVariant, string> = {
  default: "shadow-none",
  floating:
    "m-[var(--dt-space-2)] h-[calc(100%_-_(var(--dt-space-2)*2))] rounded-lg border shadow-lg",
  inset: "border-e-0 bg-muted/40 p-[var(--dt-space-2)]",
  rail: "w-[var(--sidebar-width-collapsed)]",
  bordered: "border bg-background shadow-sm",
};

const sidebarSectionClasses =
  "min-w-0 px-[var(--dt-space-2)] py-[var(--dt-space-2)]";

const sidebarContentClasses =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-[var(--dt-space-2)] py-[var(--dt-space-2)]";

const sidebarGroupClasses =
  "grid min-w-0 gap-[var(--dt-space-1)] py-[var(--dt-space-1)]";

const sidebarGroupLabelClasses =
  "min-w-0 px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-xs font-semibold uppercase tracking-normal text-muted-foreground group-data-[collapsed=true]:sr-only";

const sidebarGroupTriggerClasses =
  "group group/sidebar-group-trigger flex min-h-8 w-full min-w-0 items-center justify-between gap-[var(--dt-space-2)] rounded-md px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-start text-xs font-semibold uppercase tracking-normal text-muted-foreground outline-none motion-safe:transition-[color,box-shadow] motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring group-data-[collapsed=true]:sr-only";

const sidebarGroupTriggerIconClasses =
  "size-4 shrink-0 text-muted-foreground motion-safe:transition-[rotate] motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none group-data-[open=true]:rotate-90 rtl:group-data-[open=false]:rotate-180 [&>svg]:size-4";

const sidebarGroupContentClasses = "grid min-w-0 grid-rows-[1fr]";

const sidebarGroupContentInnerClasses =
  "grid min-h-0 min-w-0 gap-[var(--dt-space-1)] overflow-hidden";

const sidebarMobileOverlayClasses =
  "fixed inset-0 z-50 bg-foreground/35 text-foreground outline-none";

const sidebarMobilePanelClasses =
  "fixed inset-y-0 flex w-[min(var(--sidebar-width),calc(100vw_-_var(--dt-space-6)))] max-w-sm flex-col overflow-hidden border-border bg-background shadow-xl outline-none data-[side=left]:start-0 data-[side=left]:border-e data-[side=right]:end-0 data-[side=right]:border-s";

const sidebarMobileCloseClasses =
  "absolute end-[var(--dt-space-3)] top-[var(--dt-space-3)] z-10";

const sidebarMenuClasses = "grid min-w-0 list-none gap-[var(--dt-space-1)] p-0";

const sidebarMenuItemClasses = "group/sidebar-menu-item relative min-w-0";

const sidebarMenuInteractiveClasses =
  "group group/sidebar-menu-interactive relative grid min-h-9 w-full min-w-0 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-[var(--dt-space-2)] rounded-md px-[var(--dt-space-2)] py-[var(--dt-space-2)] text-start text-sm leading-5 text-muted-foreground outline-none motion-safe:transition-[color,box-shadow,scale] motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-muted motion-safe:active:scale-[0.985] data-[active=true]:bg-muted data-[active=true]:text-foreground data-[current=true]:bg-primary/10 data-[current=true]:font-medium data-[current=true]:text-foreground data-[current=true]:hover:bg-primary/10 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 group-data-[collapsed=true]:grid-cols-[1rem] group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0";

const sidebarMenuIndicatorClasses =
  "pointer-events-none absolute inset-y-[var(--dt-space-1-5)] start-0 w-0.5 rounded-full bg-primary motion-safe:animate-sidebar-indicator-in motion-reduce:animate-none";

const sidebarMenuIconClasses =
  "pointer-events-none relative flex size-4 shrink-0 items-center justify-center text-muted-foreground group-data-[active=true]:text-foreground group-data-[current=true]:text-primary [&>svg]:size-4";

const sidebarMenuIconFallbackClasses =
  "text-[0.625rem] font-semibold uppercase leading-none opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none group-data-[collapsed=true]:opacity-100";

const sidebarMenuBadgeDotClasses =
  "absolute -end-0.5 -top-0.5 size-1.5 rounded-full bg-primary opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none group-data-[collapsed=true]:opacity-100";

const sidebarMenuLabelClasses =
  "min-w-0 truncate motion-safe:transition-[opacity,translate] motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none group-data-[collapsed=true]:pointer-events-none group-data-[collapsed=true]:absolute group-data-[collapsed=true]:start-8 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:-translate-x-2 rtl:group-data-[collapsed=true]:translate-x-2";

const sidebarMenuDescriptionClasses =
  "col-start-2 min-w-0 truncate text-xs leading-5 text-muted-foreground motion-safe:transition-opacity motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none group-data-[collapsed=true]:pointer-events-none group-data-[collapsed=true]:absolute group-data-[collapsed=true]:opacity-0";

const sidebarMenuMetaClasses =
  "ms-[var(--dt-space-2)] inline-flex shrink-0 items-center gap-[var(--dt-space-1)] justify-self-end motion-safe:transition-opacity motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] motion-reduce:transition-none group-data-[collapsed=true]:pointer-events-none group-data-[collapsed=true]:absolute group-data-[collapsed=true]:end-2 group-data-[collapsed=true]:opacity-0";

const sidebarMenuBadgeClasses =
  "inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-[var(--dt-space-1-5)] py-0.5 text-[0.6875rem] font-medium leading-4 text-muted-foreground";

const sidebarMenuShortcutClasses =
  "rounded-sm bg-muted px-[var(--dt-space-1)] py-0.5 font-mono text-[0.6875rem] leading-4 text-muted-foreground";

const sidebarTriggerClasses =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground outline-none motion-safe:transition-[background-color,color,box-shadow,scale] motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] hover:bg-muted hover:text-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-[18px] [&>svg]:shrink-0";

const sidebarRailClasses =
  "group/sidebar-rail absolute top-[var(--dt-space-3)] z-20 hidden h-10 w-6 cursor-pointer items-center justify-center outline-none disabled:pointer-events-none disabled:opacity-50 data-[side=left]:left-full data-[side=left]:-translate-x-2 data-[side=right]:right-full data-[side=right]:translate-x-2 md:flex";

const sidebarRailHandleClasses =
  "relative flex h-8 w-5 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm ring-offset-background group-hover/sidebar-rail:bg-muted group-hover/sidebar-rail:text-foreground group-focus-visible/sidebar-rail:ring-2 group-focus-visible/sidebar-rail:ring-ring group-focus-visible/sidebar-rail:ring-offset-2 contrast-more:border-current [&>span]:flex [&>span]:items-center [&>span]:justify-center [&_svg]:size-2.5 [&_svg]:shrink-0";

const sidebarMotionTransitions: Record<
  Exclude<SidebarMotion, "none">,
  Transition
> = {
  subtle: { type: "spring", stiffness: 520, damping: 40, mass: 0.65 },
  standard: { type: "spring", stiffness: 460, damping: 34, mass: 0.7 },
  expressive: { type: "spring", stiffness: 420, damping: 27, mass: 0.75 },
};

const sidebarStaticTransition: Transition = { duration: 0 };

function getSidebarMotionTransition(motion: SidebarMotion) {
  return motion === "none"
    ? sidebarStaticTransition
    : sidebarMotionTransitions[motion];
}

function useResolvedSidebarMotion(motion: SidebarMotion) {
  const shouldReduceMotion = useReducedMotion();

  return motion === "none" || shouldReduceMotion === true ? "none" : motion;
}

const sidebarRailHandleVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.96 },
};

const sidebarMenuActionRevealClasses =
  "absolute end-[var(--dt-space-1)] top-1/2 size-7 -translate-y-1/2 border-0 bg-transparent opacity-0 motion-safe:transition-[opacity,color,box-shadow,scale] motion-safe:duration-[var(--sidebar-motion-duration)] motion-safe:ease-[var(--sidebar-motion-ease)] focus-visible:opacity-100 group-focus-within/sidebar-menu-item:opacity-100 group-hover/sidebar-menu-item:opacity-100 group-data-[collapsed=true]:hidden";

const sidebarSeparatorClasses =
  "mx-[var(--dt-space-2)] my-[var(--dt-space-1)] h-px shrink-0 rounded-full bg-border";

const sidebarInsetClasses = "min-w-0 flex-1 bg-background text-foreground";

const sidebarSkipLinkClasses =
  "sr-only fixed start-[var(--dt-space-3)] top-[var(--dt-space-3)] z-50 rounded-md bg-background px-[var(--dt-space-3)] py-[var(--dt-space-2)] text-sm font-medium text-foreground shadow-lg ring-2 ring-ring focus:not-sr-only";

const exitFallbackMs = 500;

function canAnimateExit(motion: SidebarMotion) {
  if (motion === "none") {
    return false;
  }

  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useSidebarContext(componentName: string) {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error(`${componentName} must be used within SidebarProvider.`);
  }

  return context;
}

function resolveNextState<T>(
  next: T | ((currentValue: T) => T),
  currentValue: T,
) {
  return typeof next === "function"
    ? (next as (currentValue: T) => T)(currentValue)
    : next;
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
  const isControlled = value !== undefined;
  const currentValue = value ?? uncontrolledValue;

  const setValue = useCallback(
    (next: boolean | ((currentValue: boolean) => boolean)) => {
      const nextValue = resolveNextState(next, currentValue);

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [currentValue, isControlled, onChange],
  );

  return [currentValue, setValue] as const;
}

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    (ref as { current: T | null }).current = node;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

function composeClickHandlers(
  componentHandler: MouseEventHandler<HTMLElement> | undefined,
  childHandler: MouseEventHandler<HTMLElement> | undefined,
) {
  if (!componentHandler && !childHandler) {
    return undefined;
  }

  return (event: MouseEvent<HTMLElement>) => {
    componentHandler?.(event);

    if (!event.defaultPrevented) {
      childHandler?.(event);
    }
  };
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isFocusableElement(element: HTMLElement) {
  if (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-hidden") === "true"
  ) {
    return false;
  }

  const style = window.getComputedStyle(element);

  return style.display !== "none" && style.visibility !== "hidden";
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(isFocusableElement);
}

function getChildRef(child: ReactElement<SidebarMenuLinkSlotProps>) {
  return (
    child.props.ref ??
    (
      child as ReactElement<SidebarMenuLinkSlotProps> & {
        ref?: Ref<HTMLElement>;
      }
    ).ref
  );
}

function mergeRelForTarget(
  rel: string | undefined,
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"] | undefined,
) {
  if (target !== "_blank") {
    return rel;
  }

  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");

  return Array.from(tokens).join(" ");
}

function hasCurrentState(
  ariaCurrent: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"],
) {
  return (
    ariaCurrent !== undefined &&
    ariaCurrent !== false &&
    ariaCurrent !== "false"
  );
}

function resolveMenuTooltip(tooltip: string | undefined, children: ReactNode) {
  if (tooltip !== undefined) {
    return tooltip || undefined;
  }

  return typeof children === "string" && children.trim() ? children : undefined;
}

function useTooltipAnchorName() {
  const id = useId();

  return `--dt-sidebar-item-${id.replace(/[^a-zA-Z0-9-]/g, "")}`;
}

function tooltipAnchorStyle(
  anchorName: string,
  tooltip: string | undefined,
  style: CSSProperties | undefined,
) {
  if (!tooltip) {
    return style;
  }

  return {
    ...({ "--dt-sidebar-tooltip-anchor": anchorName } as CSSProperties),
    ...style,
  };
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
    >
      <path
        d="m4.25 4.25 7.5 7.5m0-7.5-7.5 7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function getTriggerDirection(collapsed: boolean, side: SidebarSide) {
  if (side === "right") {
    return collapsed ? "left" : "right";
  }

  return collapsed ? "right" : "left";
}

function renderTriggerIcon(collapsed: boolean, side: SidebarSide) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d={side === "left" ? "M9 4v16" : "M15 4v16"} />
      {!collapsed && (
        <path
          d={
            side === "left"
              ? "M5 5h3v14H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
              : "M16 5h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3Z"
          }
          fill="currentColor"
          fillOpacity="0.15"
          stroke="none"
        />
      )}
    </svg>
  );
}

function isSidebarRailChild(child: ReactNode) {
  if (!isValidElement(child) || typeof child.type === "string") {
    return false;
  }

  return (
    (
      child.type as unknown as {
        displayName?: string;
      }
    ).displayName === "SidebarRail"
  );
}

function renderMenuContent({
  badge,
  children,
  current = false,
  description,
  icon,
  shortcut,
}: Pick<
  SidebarMenuCommonProps,
  "badge" | "description" | "icon" | "shortcut"
> & {
  children: ReactNode;
  current?: boolean;
}) {
  return (
    <>
      {current ? (
        <span
          aria-hidden="true"
          data-slot="sidebar-menu-indicator"
          className={sidebarMenuIndicatorClasses}
        />
      ) : null}
      <span
        aria-hidden="true"
        data-slot="sidebar-menu-icon"
        className={sidebarMenuIconClasses}
      >
        {icon ??
          (typeof children === "string" && children.trim() ? (
            <span
              data-slot="sidebar-menu-icon-fallback"
              className={sidebarMenuIconFallbackClasses}
            >
              {children.trim().charAt(0)}
            </span>
          ) : null)}
        {badge ? (
          <span
            data-slot="sidebar-menu-badge-dot"
            className={sidebarMenuBadgeDotClasses}
          />
        ) : null}
      </span>
      <span data-slot="sidebar-menu-label" className={sidebarMenuLabelClasses}>
        {children}
      </span>
      {description ? (
        <span
          data-slot="sidebar-menu-description"
          className={sidebarMenuDescriptionClasses}
        >
          {description}
        </span>
      ) : null}
      {badge || shortcut ? (
        <span data-slot="sidebar-menu-meta" className={sidebarMenuMetaClasses}>
          {badge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
          {shortcut ? (
            <span
              data-slot="sidebar-menu-shortcut"
              className={sidebarMenuShortcutClasses}
            >
              {shortcut}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );
}

export function sidebarProviderClassNames({
  className,
}: Pick<SidebarProviderProps, "className"> = {}) {
  return cn(sidebarProviderClasses, className);
}

export function sidebarClassNames({
  className,
  variant = "default",
}: Pick<SidebarProps, "className" | "variant"> = {}) {
  return cn(sidebarClasses, sidebarVariantClasses[variant], className);
}

export function sidebarHeaderClassNames({
  className,
}: Pick<SidebarHeaderProps, "className"> = {}) {
  return cn(sidebarSectionClasses, className);
}

export function sidebarFooterClassNames({
  className,
}: Pick<SidebarFooterProps, "className"> = {}) {
  return cn(sidebarSectionClasses, className);
}

export function sidebarContentClassNames({
  className,
}: Pick<SidebarContentProps, "className"> = {}) {
  return cn(sidebarContentClasses, className);
}

export function sidebarGroupClassNames({
  className,
}: Pick<SidebarGroupProps, "className"> = {}) {
  return cn(sidebarGroupClasses, className);
}

export function sidebarGroupLabelClassNames({
  className,
}: Pick<SidebarGroupLabelProps, "className"> = {}) {
  return cn(sidebarGroupLabelClasses, className);
}

export function sidebarGroupTriggerClassNames({
  className,
}: Pick<SidebarGroupTriggerProps, "className"> = {}) {
  return cn(sidebarGroupTriggerClasses, className);
}

export function sidebarGroupContentClassNames({
  className,
}: Pick<SidebarGroupContentProps, "className"> = {}) {
  return cn(sidebarGroupContentClasses, className);
}

export function sidebarMobileClassNames({
  className,
}: Pick<SidebarMobileProps, "className"> = {}) {
  return cn(sidebarMobilePanelClasses, className);
}

export function sidebarMobileOverlayClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(sidebarMobileOverlayClasses, className);
}

export function sidebarMobileTriggerClassNames({
  className,
}: Pick<SidebarMobileTriggerProps, "className"> = {}) {
  return cn(sidebarTriggerClasses, className);
}

export function sidebarMenuClassNames({
  className,
}: Pick<SidebarMenuProps, "className"> = {}) {
  return cn(sidebarMenuClasses, className);
}

export function sidebarMenuItemClassNames({
  className,
}: Pick<SidebarMenuItemProps, "className"> = {}) {
  return cn(sidebarMenuItemClasses, className);
}

export function sidebarMenuLinkClassNames({
  className,
}: Pick<SidebarMenuLinkProps, "className"> = {}) {
  return cn(sidebarMenuInteractiveClasses, className);
}

export function sidebarMenuButtonClassNames({
  className,
}: Pick<SidebarMenuButtonProps, "className"> = {}) {
  return cn(sidebarMenuInteractiveClasses, className);
}

export function sidebarMenuBadgeClassNames({
  className,
}: Pick<SidebarMenuBadgeProps, "className"> = {}) {
  return cn(sidebarMenuBadgeClasses, className);
}

export function sidebarMenuActionClassNames({
  className,
  showOnHover = false,
}: Pick<SidebarMenuActionProps, "className" | "showOnHover"> = {}) {
  return cn(
    sidebarTriggerClasses,
    "size-7",
    showOnHover && sidebarMenuActionRevealClasses,
    className,
  );
}

export function sidebarSeparatorClassNames({
  className,
}: Pick<SidebarSeparatorProps, "className"> = {}) {
  return cn(sidebarSeparatorClasses, className);
}

export function sidebarTriggerClassNames({
  className,
}: Pick<SidebarTriggerProps, "className"> = {}) {
  return cn(sidebarTriggerClasses, className);
}

export function sidebarRailClassNames({
  className,
}: Pick<SidebarRailProps, "className"> = {}) {
  return cn(sidebarRailClasses, className);
}

export function sidebarInsetClassNames({
  className,
}: Pick<SidebarInsetProps, "className"> = {}) {
  return cn(sidebarInsetClasses, className);
}

export function sidebarSkipLinkClassNames({
  className,
}: Pick<SidebarSkipLinkProps, "className"> = {}) {
  return cn(sidebarSkipLinkClasses, className);
}

export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      animate = true,
      children,
      className,
      collapsed,
      defaultCollapsed = false,
      defaultMobileOpen = false,
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
    const [mobileTriggerElement, setMobileTriggerElement] =
      useState<HTMLButtonElement | null>(null);
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
    const resolvedMotion = animate ? motion : "none";
    const value = useMemo<SidebarContextValue>(
      () => ({
        collapsed: resolvedCollapsed,
        mobileOpen: resolvedMobileOpen,
        mobileTriggerElement,
        motion: resolvedMotion,
        setCollapsed,
        setMobileOpen,
        setMobileTriggerElement,
        side,
        toggleCollapsed: () => setCollapsed((currentValue) => !currentValue),
        toggleMobileOpen: () => setMobileOpen((currentValue) => !currentValue),
        variant,
      }),
      [
        mobileTriggerElement,
        resolvedCollapsed,
        resolvedMobileOpen,
        resolvedMotion,
        setCollapsed,
        setMobileOpen,
        setMobileTriggerElement,
        side,
        variant,
      ],
    );

    return (
      <SidebarContext.Provider value={value}>
        <div
          {...props}
          ref={ref}
          data-slot="sidebar-provider"
          data-animate={animate ? "true" : "false"}
          data-collapsed={resolvedCollapsed ? "true" : "false"}
          data-mobile-open={resolvedMobileOpen ? "true" : "false"}
          data-motion={resolvedMotion}
          data-side={side}
          data-variant={variant}
          className={sidebarProviderClassNames({ className })}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);

SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      "aria-label": ariaLabel = "Sidebar",
      children,
      className,
      side: sideProp,
      variant: variantProp,
      ...props
    },
    ref,
  ) => {
    const context = useSidebarContext("Sidebar");
    const side = sideProp ?? context.side;
    const variant = variantProp ?? context.variant;
    const surfaceCollapsed = context.collapsed || variant === "rail";
    const resolvedMotion = useResolvedSidebarMotion(context.motion);
    const motionTransition = getSidebarMotionTransition(resolvedMotion);
    const motionWidth = surfaceCollapsed
      ? "var(--sidebar-width-collapsed)"
      : "var(--sidebar-width)";
    const surfaceContext = useMemo<SidebarSurfaceContextValue>(
      () => ({
        collapsed: surfaceCollapsed,
        side,
        variant,
      }),
      [side, surfaceCollapsed, variant],
    );
    const resolvedChildren = Children.toArray(children);
    const railChildren = resolvedChildren.filter(isSidebarRailChild);
    const viewportChildren = resolvedChildren.filter(
      (child) => !isSidebarRailChild(child),
    );

    return (
      <SidebarSurfaceContext.Provider value={surfaceContext}>
        <motionElement.nav
          {...(props as HTMLMotionProps<"nav">)}
          ref={ref as ForwardedRef<HTMLElement>}
          aria-label={ariaLabel}
          animate={{ width: motionWidth }}
          data-slot="sidebar"
          data-collapsed={surfaceCollapsed ? "true" : "false"}
          data-mobile-open={context.mobileOpen ? "true" : "false"}
          data-motion={resolvedMotion}
          data-side={side}
          data-variant={variant}
          className={sidebarClassNames({ className, variant })}
          initial={false}
          transition={motionTransition}
        >
          <div data-slot="sidebar-viewport" className={sidebarViewportClasses}>
            {viewportChildren}
          </div>
          {railChildren}
        </motionElement.nav>
      </SidebarSurfaceContext.Provider>
    );
  },
);

Sidebar.displayName = "Sidebar";

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="sidebar-header"
      className={sidebarHeaderClassNames({ className })}
    />
  ),
);

SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="sidebar-footer"
      className={sidebarFooterClassNames({ className })}
    />
  ),
);

SidebarFooter.displayName = "SidebarFooter";

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="sidebar-content"
      className={sidebarContentClassNames({ className })}
    />
  ),
);

SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  (
    {
      children,
      className,
      collapsible = false,
      defaultOpen = true,
      onOpenChange,
      open,
      ...props
    },
    ref,
  ) => {
    const [resolvedOpen, setOpen] = useControllableBoolean({
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      value: open,
    });
    const contentId = useId();
    const value = useMemo<SidebarGroupContextValue>(
      () => ({
        collapsible,
        contentId,
        open: resolvedOpen,
        setOpen,
        toggleOpen: () => setOpen((currentValue) => !currentValue),
      }),
      [collapsible, contentId, resolvedOpen, setOpen],
    );

    return (
      <SidebarGroupContext.Provider value={value}>
        <div
          {...props}
          ref={ref}
          data-collapsible={collapsible ? "true" : undefined}
          data-open={collapsible ? String(resolvedOpen) : undefined}
          data-slot="sidebar-group"
          className={sidebarGroupClassNames({ className })}
        >
          {children}
        </div>
      </SidebarGroupContext.Provider>
    );
  },
);

SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  SidebarGroupLabelProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    data-slot="sidebar-group-label"
    className={sidebarGroupLabelClassNames({ className })}
  />
));

SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupTrigger = forwardRef<
  HTMLButtonElement,
  SidebarGroupTriggerProps
>(
  (
    { children, className, onClick, tabIndex, type = "button", ...props },
    ref,
  ) => {
    const context = useContext(SidebarGroupContext);
    const surfaceContext = useContext(SidebarSurfaceContext);
    const surfaceCollapsed = surfaceContext?.collapsed ?? false;

    if (!context || !context.collapsible) {
      throw new Error(
        "SidebarGroupTrigger must be used inside a collapsible SidebarGroup.",
      );
    }

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      context.toggleOpen();
      onClick?.(event);
    };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        tabIndex={surfaceCollapsed ? -1 : tabIndex}
        aria-controls={context.contentId}
        aria-expanded={context.open}
        data-open={String(context.open)}
        data-slot="sidebar-group-trigger"
        className={sidebarGroupTriggerClassNames({ className })}
        onClick={handleClick}
      >
        <span className="min-w-0 truncate">{children}</span>
        <span aria-hidden="true" className={sidebarGroupTriggerIconClasses}>
          <ChevronRightIcon />
        </span>
      </button>
    );
  },
);

SidebarGroupTrigger.displayName = "SidebarGroupTrigger";

export const SidebarGroupContent = forwardRef<
  HTMLDivElement,
  SidebarGroupContentProps
>(({ children, className, hidden, id, onTransitionEnd, ...props }, ref) => {
  const context = useContext(SidebarGroupContext);
  const sidebarContext = useContext(SidebarContext);
  const motion = sidebarContext?.motion ?? "standard";
  const isOpen = context?.collapsible ? context.open : true;
  const [present, setPresent] = useState(isOpen);

  const [previousOpen, setPreviousOpen] = useState(isOpen);
  if (previousOpen !== isOpen) {
    setPreviousOpen(isOpen);
    if (isOpen || !canAnimateExit(motion)) setPresent(isOpen);
  }
  useEffect(() => {
    if (isOpen || !canAnimateExit(motion)) return undefined;

    const fallback = window.setTimeout(() => setPresent(false), exitFallbackMs);

    return () => window.clearTimeout(fallback);
  }, [isOpen, motion]);

  const handleTransitionEnd: TransitionEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "grid-template-rows" &&
      !isOpen
    ) {
      setPresent(false);
    }

    onTransitionEnd?.(event);
  };

  const isHidden =
    hidden ??
    (context?.collapsible
      ? !isOpen && (!present || !canAnimateExit(motion))
      : undefined);

  return (
    <div
      {...props}
      ref={ref}
      id={id ?? context?.contentId}
      hidden={isHidden}
      data-open={context?.collapsible ? String(context.open) : undefined}
      data-slot="sidebar-group-content"
      className={sidebarGroupContentClassNames({ className })}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        data-slot="sidebar-group-content-inner"
        className={sidebarGroupContentInnerClasses}
      >
        {children}
      </div>
    </div>
  );
});

SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMobile = forwardRef<HTMLDivElement, SidebarMobileProps>(
  (
    {
      children,
      className,
      closeButtonLabel = "Close sidebar",
      onClick,
      onKeyDown,
      label = "Sidebar navigation",
      overlayClassName,
      side: sideProp,
      showCloseButton = true,
      ...props
    },
    ref,
  ) => {
    const context = useSidebarContext("SidebarMobile");
    const surfaceContext = useContext(SidebarSurfaceContext);
    const side = sideProp ?? surfaceContext?.side ?? context.side;
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const portalElement = useSyncExternalStore(
      subscribePortal,
      getPortalSnapshot,
      getServerPortalSnapshot,
    );
    const titleId = useId();
    const wasOpenRef = useRef(context.mobileOpen);
    const resolvedMotion = useResolvedSidebarMotion(context.motion);
    const motionDisabled = resolvedMotion === "none";
    const motionTransition = getSidebarMotionTransition(resolvedMotion);
    const panelOffset =
      side === "left" ? "calc(var(--dt-space-3) * -1)" : "var(--dt-space-3)";

    useEffect(() => {
      if (context.mobileOpen) {
        panelRef.current?.focus();
      }

      if (wasOpenRef.current && !context.mobileOpen) {
        context.mobileTriggerElement?.focus();
      }

      wasOpenRef.current = context.mobileOpen;
    }, [context.mobileOpen, context.mobileTriggerElement, portalElement]);

    useEffect(() => {
      if (!context.mobileOpen || !portalElement || !overlayRef.current) {
        return undefined;
      }

      const overlayElement = overlayRef.current;
      const bodyChildren = Array.from(document.body.children).filter(
        (element) => element !== overlayElement,
      );
      const previousInertState = bodyChildren.map(
        (element) => [element, element.hasAttribute("inert")] as const,
      );

      for (const element of bodyChildren) {
        element.setAttribute("inert", "");
      }

      return () => {
        for (const [element, hadInert] of previousInertState) {
          if (hadInert) {
            element.setAttribute("inert", "");
          } else {
            element.removeAttribute("inert");
          }
        }
      };
    }, [context.mobileOpen, portalElement]);

    useEffect(() => {
      if (!context.mobileOpen) {
        return undefined;
      }

      const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") {
          context.setMobileOpen(false);
        }
      };

      document.addEventListener("keydown", handleDocumentKeyDown);

      return () =>
        document.removeEventListener("keydown", handleDocumentKeyDown);
    }, [context]);

    const handleOverlayClick: MouseEventHandler<HTMLDivElement> = (event) => {
      if (event.target === event.currentTarget) {
        context.setMobileOpen(false);
        onClick?.(event);
      }
    };
    const handlePanelClick: MouseEventHandler<HTMLDivElement> = (event) => {
      const target = event.target;

      onClick?.(event);

      if (
        !event.defaultPrevented &&
        target instanceof Element &&
        target.closest('a[data-slot="sidebar-menu-link"]')
      ) {
        context.setMobileOpen(false);
      }
    };
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        context.setMobileOpen(false);
      }

      if (event.key === "Tab") {
        const panelElement = panelRef.current;

        if (!panelElement) {
          return;
        }

        const focusableElements = getFocusableElements(panelElement);

        if (focusableElements.length === 0) {
          event.preventDefault();
          panelElement.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;
        const isFocusOutsidePanel =
          activeElement instanceof Node &&
          !panelElement.contains(activeElement);

        if (
          event.shiftKey &&
          (activeElement === firstElement || isFocusOutsidePanel)
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          (activeElement === lastElement || isFocusOutsidePanel)
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }

      onKeyDown?.(event);
    };

    const overlay = (
      <AnimatePresence initial={false}>
        {context.mobileOpen ? (
          <motionElement.div
            key="sidebar-mobile-overlay"
            ref={overlayRef}
            animate={{ opacity: 1 }}
            initial={motionDisabled ? false : { opacity: 0 }}
            exit={
              motionDisabled
                ? { opacity: 1 }
                : { opacity: 0, pointerEvents: "none" }
            }
            data-slot="sidebar-mobile-overlay"
            data-motion={resolvedMotion}
            data-state="open"
            className={sidebarMobileOverlayClassNames({
              className: overlayClassName,
            })}
            transition={motionTransition}
            onClick={handleOverlayClick}
          >
            <motionElement.div
              {...(props as HTMLMotionProps<"div">)}
              ref={composeRefs(ref, panelRef)}
              role="dialog"
              tabIndex={-1}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              initial={
                motionDisabled
                  ? false
                  : { opacity: 0, scale: 0.985, x: panelOffset }
              }
              exit={
                motionDisabled
                  ? { opacity: 1, scale: 1, x: 0 }
                  : { opacity: 0, scale: 0.985, x: panelOffset }
              }
              aria-labelledby={titleId}
              aria-modal="true"
              data-motion={resolvedMotion}
              data-side={side}
              data-slot="sidebar-mobile"
              data-state="open"
              className={sidebarMobileClassNames({ className })}
              transition={motionTransition}
              onClick={handlePanelClick}
              onKeyDown={handleKeyDown}
            >
              <h2 id={titleId} className="sr-only">
                {label}
              </h2>
              {showCloseButton ? (
                <button
                  type="button"
                  aria-label={closeButtonLabel}
                  data-slot="sidebar-mobile-close"
                  className={cn(
                    sidebarTriggerClasses,
                    sidebarMobileCloseClasses,
                  )}
                  onClick={() => context.setMobileOpen(false)}
                >
                  <CloseIcon />
                </button>
              ) : null}
              {children}
            </motionElement.div>
          </motionElement.div>
        ) : null}
      </AnimatePresence>
    );

    return portalElement ? createPortal(overlay, portalElement) : overlay;
  },
);

SidebarMobile.displayName = "SidebarMobile";

export const SidebarMobileTrigger = forwardRef<
  HTMLButtonElement,
  SidebarMobileTriggerProps
>(
  (
    {
      children,
      className,
      closeLabel = "Close sidebar",
      onClick,
      openLabel = "Open sidebar",
      side: sideProp,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const context = useSidebarContext("SidebarMobileTrigger");
    const surfaceContext = useContext(SidebarSurfaceContext);
    const side = sideProp ?? surfaceContext?.side ?? context.side;
    const label = context.mobileOpen ? closeLabel : openLabel;
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      context.setMobileTriggerElement(event.currentTarget);
      context.toggleMobileOpen();
      onClick?.(event);
    };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        aria-expanded={context.mobileOpen}
        aria-label={props["aria-label"] ?? label}
        data-mobile-open={context.mobileOpen ? "true" : "false"}
        data-side={side}
        data-slot="sidebar-mobile-trigger"
        className={sidebarMobileTriggerClassNames({ className })}
        onClick={handleClick}
      >
        {children ?? renderTriggerIcon(!context.mobileOpen, side)}
      </button>
    );
  },
);

SidebarMobileTrigger.displayName = "SidebarMobileTrigger";

export const SidebarMenu = forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <ul
      {...props}
      ref={ref}
      data-slot="sidebar-menu"
      className={sidebarMenuClassNames({ className })}
    />
  ),
);

SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <li
      {...props}
      ref={ref}
      data-slot="sidebar-menu-item"
      className={sidebarMenuItemClassNames({ className })}
    />
  ),
);

SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuLink = forwardRef<
  HTMLAnchorElement,
  SidebarMenuLinkProps
>(
  (
    {
      active = false,
      asChild = false,
      badge,
      children,
      className,
      current = false,
      description,
      disabled = false,
      external = false,
      href,
      icon,
      onClick,
      rel,
      shortcut,
      style,
      target,
      tooltip,
      "aria-current": ariaCurrent,
      ...props
    },
    ref,
  ) => {
    const tooltipAnchorName = useTooltipAnchorName();
    const resolvedTarget = target ?? (external ? "_blank" : undefined);
    const resolvedRel = mergeRelForTarget(rel, resolvedTarget);
    const resolvedAriaCurrent = ariaCurrent ?? (current ? "page" : undefined);
    const isCurrent = current || hasCurrentState(resolvedAriaCurrent);
    const classes = sidebarMenuLinkClassNames({ className });
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event as MouseEvent<HTMLAnchorElement>);
    };

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<SidebarMenuLinkSlotProps>(child)) {
        throw new Error(
          "SidebarMenuLink with asChild expects a single React element child.",
        );
      }

      const childTarget = child.props.target ?? resolvedTarget;
      const childRel = mergeRelForTarget(
        child.props.rel ?? resolvedRel,
        childTarget,
      );
      const childAriaCurrent =
        child.props["aria-current"] ?? resolvedAriaCurrent;
      const childIsCurrent = current || hasCurrentState(childAriaCurrent);
      const childTooltip = resolveMenuTooltip(tooltip, child.props.children);
      const childStyle =
        style || child.props.style
          ? { ...style, ...(child.props.style as CSSProperties | undefined) }
          : undefined;
      const clonedProps: SidebarMenuLinkSlotProps = {
        ...props,
        ...child.props,
        ref: (node) => {
          composeRefs(ref as Ref<HTMLElement>, getChildRef(child))(node);
        },
        style: tooltipAnchorStyle(tooltipAnchorName, childTooltip, childStyle),
        "aria-current": childAriaCurrent,
        "aria-disabled": disabled ? true : child.props["aria-disabled"],
        "data-active": active ? "true" : undefined,
        "data-current": childIsCurrent ? "true" : undefined,
        "data-disabled": disabled ? "true" : undefined,
        "data-external": external ? "true" : undefined,
        "data-sidebar-tooltip": childTooltip,
        "data-slot": "sidebar-menu-link",
        className: cn(classes, child.props.className),
        onClick: composeClickHandlers(handleClick, child.props.onClick),
      };

      if (child.props.href ?? href) {
        clonedProps.href = child.props.href ?? href;
      }

      if (childTarget !== undefined) {
        clonedProps.target = childTarget;
      }

      if (childRel !== undefined) {
        clonedProps.rel = childRel;
      }

      return cloneElement(
        child,
        // eslint-disable-next-line react-hooks/refs -- React forwards this ref during commit; createElement/cloneElement does not read ref.current.
        clonedProps,
        renderMenuContent({
          badge,
          children: child.props.children,
          current: childIsCurrent,
          description,
          icon,
          shortcut,
        }),
      );
    }

    const resolvedTooltip = resolveMenuTooltip(tooltip, children);

    return (
      <a
        {...props}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={href}
        rel={resolvedRel}
        style={tooltipAnchorStyle(tooltipAnchorName, resolvedTooltip, style)}
        target={resolvedTarget}
        aria-current={resolvedAriaCurrent}
        aria-disabled={disabled ? true : undefined}
        data-active={active ? "true" : undefined}
        data-current={isCurrent ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-external={external ? "true" : undefined}
        data-sidebar-tooltip={resolvedTooltip}
        data-slot="sidebar-menu-link"
        className={classes}
        onClick={handleClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {renderMenuContent({
          badge,
          children,
          current: isCurrent,
          description,
          icon,
          shortcut,
        })}
      </a>
    );
  },
);

SidebarMenuLink.displayName = "SidebarMenuLink";

export const SidebarMenuButton = forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      active = false,
      badge,
      children,
      className,
      description,
      disabled = false,
      icon,
      shortcut,
      style,
      tooltip,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const tooltipAnchorName = useTooltipAnchorName();
    const resolvedTooltip = resolveMenuTooltip(tooltip, children);

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled}
        style={tooltipAnchorStyle(tooltipAnchorName, resolvedTooltip, style)}
        data-active={active ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-sidebar-tooltip={resolvedTooltip}
        data-slot="sidebar-menu-button"
        className={sidebarMenuButtonClassNames({ className })}
      >
        {renderMenuContent({ badge, children, description, icon, shortcut })}
      </button>
    );
  },
);

SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuBadge = forwardRef<
  HTMLSpanElement,
  SidebarMenuBadgeProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    data-slot="sidebar-menu-badge"
    className={sidebarMenuBadgeClassNames({ className })}
  />
));

SidebarMenuBadge.displayName = "SidebarMenuBadge";

export const SidebarMenuAction = forwardRef<
  HTMLButtonElement,
  SidebarMenuActionProps
>(
  (
    {
      children,
      className,
      label,
      showOnHover = false,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-label={props["aria-label"] ?? label}
      data-show-on-hover={showOnHover ? "true" : undefined}
      data-slot="sidebar-menu-action"
      className={sidebarMenuActionClassNames({ className, showOnHover })}
    >
      {children}
    </button>
  ),
);

SidebarMenuAction.displayName = "SidebarMenuAction";

export const SidebarSeparator = forwardRef<
  HTMLDivElement,
  SidebarSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    aria-hidden="true"
    data-slot="sidebar-separator"
    className={sidebarSeparatorClassNames({ className })}
  />
));

SidebarSeparator.displayName = "SidebarSeparator";

export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(
  (
    {
      action = "toggle",
      children,
      className,
      collapseLabel = "Collapse sidebar",
      expandLabel = "Expand sidebar",
      onClick,
      side: sideProp,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const context = useSidebarContext("SidebarTrigger");
    const surfaceContext = useContext(SidebarSurfaceContext);
    const collapsed = surfaceContext?.collapsed ?? context.collapsed;
    const side = sideProp ?? surfaceContext?.side ?? context.side;
    const nextCollapsed =
      action === "expand" ? false : action === "collapse" ? true : !collapsed;
    const label = nextCollapsed ? collapseLabel : expandLabel;
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (props.disabled) {
        return;
      }

      if (action === "expand") {
        context.setCollapsed(false);
      } else if (action === "collapse") {
        context.setCollapsed(true);
      } else {
        context.toggleCollapsed();
      }

      onClick?.(event);
    };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        aria-expanded={!collapsed}
        aria-label={props["aria-label"] ?? label}
        title={props.title ?? props["aria-label"] ?? label}
        data-collapsed={collapsed ? "true" : "false"}
        data-side={side}
        data-slot="sidebar-trigger"
        className={sidebarTriggerClassNames({ className })}
        onClick={handleClick}
      >
        {children ?? renderTriggerIcon(collapsed, side)}
      </button>
    );
  },
);

SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarRail = forwardRef<HTMLButtonElement, SidebarRailProps>(
  (
    {
      children,
      className,
      collapseLabel = "Collapse sidebar",
      expandLabel = "Expand sidebar",
      onClick,
      side: sideProp,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const context = useSidebarContext("SidebarRail");
    const surfaceContext = useContext(SidebarSurfaceContext);
    const collapsed = surfaceContext?.collapsed ?? context.collapsed;
    const side = sideProp ?? surfaceContext?.side ?? context.side;
    const label = collapsed ? expandLabel : collapseLabel;
    const resolvedMotion = useResolvedSidebarMotion(context.motion);
    const motionDisabled = resolvedMotion === "none";
    const motionTransition = getSidebarMotionTransition(resolvedMotion);
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (props.disabled) {
        return;
      }

      context.toggleCollapsed();
      onClick?.(event);
    };

    return (
      <motionElement.button
        {...(props as HTMLMotionProps<"button">)}
        ref={ref}
        type={type}
        animate="rest"
        aria-expanded={!collapsed}
        aria-label={props["aria-label"] ?? label}
        data-collapsed={collapsed ? "true" : "false"}
        data-motion={resolvedMotion}
        data-motion-behavior="transform"
        data-reduced-motion={motionDisabled ? "true" : "false"}
        data-side={side}
        data-slot="sidebar-rail"
        initial={false}
        className={sidebarRailClassNames({ className })}
        onClick={handleClick}
        whileHover={motionDisabled || props.disabled ? undefined : "hover"}
        whileTap={motionDisabled || props.disabled ? undefined : "tap"}
      >
        <motionElement.span
          aria-hidden="true"
          data-slot="sidebar-rail-handle"
          className={sidebarRailHandleClasses}
          transition={motionTransition}
          variants={sidebarRailHandleVariants}
        >
          {children ?? (
            <motionElement.span
              data-direction={getTriggerDirection(collapsed, side)}
              data-slot="sidebar-rail-chevron"
              initial={false}
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={motionTransition}
            >
              {side === "right" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </motionElement.span>
          )}
        </motionElement.span>
      </motionElement.button>
    );
  },
);

SidebarRail.displayName = "SidebarRail";

export const SidebarInset = forwardRef<HTMLElement, SidebarInsetProps>(
  ({ as = "main", className, ...props }, ref) => {
    if (as === "div") {
      return (
        <div
          {...props}
          ref={ref as ForwardedRef<HTMLDivElement>}
          data-slot="sidebar-inset"
          className={sidebarInsetClassNames({ className })}
        />
      );
    }

    if (as === "section") {
      return (
        <section
          {...props}
          ref={ref as ForwardedRef<HTMLElement>}
          data-slot="sidebar-inset"
          className={sidebarInsetClassNames({ className })}
        />
      );
    }

    return (
      <main
        {...props}
        ref={ref as ForwardedRef<HTMLElement>}
        data-slot="sidebar-inset"
        className={sidebarInsetClassNames({ className })}
      />
    );
  },
);

SidebarInset.displayName = "SidebarInset";

export const SidebarSkipLink = forwardRef<
  HTMLAnchorElement,
  SidebarSkipLinkProps
>(
  (
    {
      children = "Skip to content",
      className,
      href,
      targetId = "content",
      ...props
    },
    ref,
  ) => (
    <a
      {...props}
      ref={ref}
      href={href ?? `#${targetId}`}
      data-slot="sidebar-skip-link"
      className={sidebarSkipLinkClassNames({ className })}
    >
      {children}
    </a>
  ),
);

SidebarSkipLink.displayName = "SidebarSkipLink";
