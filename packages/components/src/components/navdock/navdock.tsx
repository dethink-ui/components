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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type FocusEventHandler,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type LiHTMLAttributes,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion as motionElement,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { cn } from "../../utils/cn";

export type NavDockPlacement = "bottom" | "top" | "left" | "right";
export type NavDockPosition = "static" | "absolute" | "fixed";
export type NavDockVariant = "default" | "glass" | "solid";
export type NavDockSize = "sm" | "md" | "lg";
export type NavDockShowTitle = "never" | "hover" | "always";
export type NavDockMotion = "none" | "subtle" | "standard" | "expressive";
export type NavDockCollapseMode = "none" | "auto" | "always";
export type NavDockCurrent = boolean | "page" | "location";
type NavDockMotionState = "active" | "neighbor" | "idle";
type NavDockOrientation = "horizontal" | "vertical";
type NavDockOverflowAxis = "x" | "y";
type NavDockLayerOffsetVariable = "--dt-space-2" | "--navdock-submenu-offset";

const NavDockAutoCollapseMediaQuery = "(max-width: 640px), (pointer: coarse)";
const NavDockCollapsedAnchorPlacement: NavDockPlacement = "bottom";
const NavDockCollapsedLayoutPlacement: NavDockPlacement = "left";

export type NavDockCurrentContext = {
  currentValue?: string;
};

type NavDockItemDataBase = {
  badge?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  disabledReason?: ReactNode;
  icon: ReactNode;
  title: ReactNode;
  value: string;
};

export type NavDockLinkItemData = NavDockItemDataBase & {
  ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  current?: NavDockCurrent;
  external?: boolean;
  href: string;
  onAction?: never;
  rel?: string;
  submenu?: never;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
};

export type NavDockActionItemData = NavDockItemDataBase & {
  current?: never;
  external?: never;
  href?: never;
  onAction: (item: NavDockActionItemData) => void;
  rel?: never;
  submenu?: never;
  target?: never;
};

export type NavDockSubmenuChildData =
  | {
      ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
      badge?: ReactNode;
      description?: ReactNode;
      disabled?: boolean;
      disabledReason?: ReactNode;
      external?: boolean;
      href: string;
      kind?: "link";
      rel?: string;
      target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
      title: ReactNode;
      value: string;
    }
  | {
      badge?: ReactNode;
      description?: ReactNode;
      disabled?: boolean;
      disabledReason?: ReactNode;
      kind: "action";
      onAction: () => void;
      title: ReactNode;
      value: string;
    }
  | {
      kind: "label";
      title: ReactNode;
      value: string;
    }
  | {
      kind: "separator";
      value: string;
    };

export type NavDockSubmenuItemData = NavDockItemDataBase & {
  current?: never;
  external?: never;
  href?: never;
  onAction?: never;
  rel?: never;
  submenu: NavDockSubmenuChildData[];
  target?: never;
};

export type NavDockItemData =
  NavDockLinkItemData | NavDockActionItemData | NavDockSubmenuItemData;

export type NavDockCurrentMatcher = (
  item: NavDockItemData,
  context: NavDockCurrentContext,
) => NavDockCurrent | undefined;

export interface NavDockProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue"
> {
  collapseMode?: NavDockCollapseMode;
  collapsed?: boolean;
  currentValue?: string;
  defaultCollapsed?: boolean;
  defaultOpenValue?: string | null;
  defaultValue?: string | null;
  isItemCurrent?: NavDockCurrentMatcher;
  items?: NavDockItemData[];
  motion?: NavDockMotion;
  onCollapsedChange?: (collapsed: boolean) => void;
  onOpenValueChange?: (value: string | null) => void;
  onValueChange?: (value: string | null) => void;
  openValue?: string | null;
  placement?: NavDockPlacement;
  position?: NavDockPosition;
  showTitle?: NavDockShowTitle;
  size?: NavDockSize;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
  collapseLabel?: string;
  value?: string | null;
  variant?: NavDockVariant;
}

export interface CollapseDockProps extends Omit<
  HTMLMotionProps<"div">,
  "children"
> {
  children?: ReactNode;
  collapseLabel?: string;
  collapseMode?: NavDockCollapseMode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  items?: NavDockItemData[];
  mode?: NavDockCollapseMode;
  onCollapsedChange?: (collapsed: boolean) => void;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
}

export type NavDockListProps = HTMLAttributes<HTMLUListElement>;

export type NavDockSeparatorProps = Omit<
  LiHTMLAttributes<HTMLLIElement>,
  "children"
> & {
  children?: never;
};

export interface NavDockItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  "title"
> {
  disabled?: boolean;
  disabledReason?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  value?: string;
}

type NavDockInteractiveBaseProps = {
  badge?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  disabledReason?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
};

type NavDockLinkBaseProps = NavDockInteractiveBaseProps & {
  asChild?: boolean;
  current?: NavDockCurrent;
  external?: boolean;
};

type NativeNavDockAnchorProps = Omit<
  HTMLMotionProps<"a">,
  "children" | "href" | "title"
>;

type NativeNavDockLinkProps = NativeNavDockAnchorProps &
  NavDockLinkBaseProps & {
    asChild?: false;
    children?: ReactNode;
    href: string;
  };

type ChildNavDockLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href" | "title"
> &
  NavDockLinkBaseProps & {
    asChild: true;
    children: ReactElement<NavDockLinkSlotProps>;
    href?: string;
  };

export type NavDockLinkProps = NativeNavDockLinkProps | ChildNavDockLinkProps;

export type NavDockButtonProps = Omit<
  HTMLMotionProps<"button">,
  "children" | "title"
> &
  NavDockInteractiveBaseProps & {
    children?: ReactNode;
    current?: NavDockCurrent;
    onAction?: () => void;
  };

export interface NavDockSubmenuProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
}

export type NavDockSubmenuTriggerProps = Omit<
  NavDockButtonProps,
  "current" | "onAction"
>;

export interface NavDockSubmenuContentProps extends Omit<
  HTMLMotionProps<"div">,
  "children"
> {
  children?: ReactNode;
  panelClassName?: string;
}

type NavDockLinkSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  "aria-current"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  "aria-describedby"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-describedby"];
  "aria-disabled"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-disabled"];
  tabIndex?: number;
};

type NavDockContextValue = {
  activeValue: string | null;
  collapsed: boolean;
  collapseModeActive: boolean;
  collapseMode: NavDockCollapseMode;
  collapseTriggerRef: { current: HTMLButtonElement | null };
  currentValue?: string;
  isItemCurrent?: NavDockCurrentMatcher;
  itemValues: string[];
  listId: string;
  motion: NavDockMotion;
  openValue: string | null;
  placement: NavDockPlacement;
  position: NavDockPosition;
  registerListId: (id: string) => () => void;
  registerItemValue?: (value: string) => () => void;
  renderedListId: string;
  rootId: string;
  setActiveValue: (value: string | null) => void;
  setCollapsed: (collapsed: boolean) => void;
  setOpenValue: (value: string | null) => void;
  showTitle: NavDockShowTitle;
  size: NavDockSize;
  variant: NavDockVariant;
};

type NavDockListContextValue = {
  overflowing: boolean;
  pointerPosition: MotionValue<number>;
};

type NavDockItemContextValue = {
  disabled?: boolean;
  disabledReason?: ReactNode;
  icon?: ReactNode;
  motionState: NavDockMotionState;
  title?: ReactNode;
  value?: string;
};

type NavDockSubmenuContextValue = {
  cancelClose: () => void;
  contentElement: HTMLDivElement | null;
  contentId: string;
  consumeHoverOpenClickGuard: () => boolean;
  open: boolean;
  scheduleClose: () => void;
  setContentElement: (element: HTMLDivElement | null) => void;
  setOpen: (open: boolean) => void;
  setTriggerElement: (element: HTMLButtonElement | null) => void;
  triggerElement: HTMLButtonElement | null;
  triggerId: string;
  value?: string;
};

const NavDockContext = createContext<NavDockContextValue | null>(null);
const NavDockItemContext = createContext<NavDockItemContextValue | null>(null);
const NavDockListContext = createContext<NavDockListContextValue | null>(null);
const NavDockSubmenuContext = createContext<NavDockSubmenuContextValue | null>(
  null,
);
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const navDockBaseClasses =
  "group/navdock relative h-fit w-fit max-w-full min-w-0 gap-[var(--dt-space-1)] text-foreground [--navdock-icon-size:1.5rem] [--navdock-item-radius:calc(var(--dt-radius-lg)+var(--dt-radius-lg))] [--navdock-item-size:3.25rem] [--navdock-position-offset:var(--dt-space-4)] [--navdock-radius:calc(var(--dt-radius-lg)+var(--dt-radius-lg)+var(--dt-radius-lg)+var(--dt-radius-lg))] [--navdock-submenu-offset:var(--dt-space-4)]";

const navDockPlacementClasses: Record<NavDockPlacement, string> = {
  bottom: "inline-flex flex-col items-center",
  top: "inline-flex flex-col-reverse items-center",
  left: "inline-flex flex-row items-center",
  right: "inline-flex flex-row-reverse items-center",
};

const navDockPositionClasses: Record<NavDockPosition, string> = {
  static: "static",
  absolute: "absolute z-40",
  fixed: "fixed z-40",
};

const navDockPositionPlacementClasses: Record<
  NavDockPosition,
  Record<NavDockPlacement, string>
> = {
  static: {
    bottom: "",
    top: "",
    left: "",
    right: "",
  },
  absolute: {
    bottom: "bottom-[var(--navdock-position-offset)] left-1/2 -translate-x-1/2",
    top: "left-1/2 top-[var(--navdock-position-offset)] -translate-x-1/2",
    left: "left-[var(--navdock-position-offset)] top-1/2 -translate-y-1/2",
    right: "right-[var(--navdock-position-offset)] top-1/2 -translate-y-1/2",
  },
  fixed: {
    bottom:
      "bottom-[calc(var(--navdock-position-offset)+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2",
    top: "left-1/2 top-[calc(var(--navdock-position-offset)+env(safe-area-inset-top))] -translate-x-1/2",
    left: "left-[calc(var(--navdock-position-offset)+env(safe-area-inset-left))] top-1/2 -translate-y-1/2",
    right:
      "right-[calc(var(--navdock-position-offset)+env(safe-area-inset-right))] top-1/2 -translate-y-1/2",
  },
};

const navDockVariantClasses: Record<NavDockVariant, string> = {
  default:
    "rounded-[var(--navdock-radius)] border border-border/70 bg-background/95 shadow-[0_24px_60px_-34px_rgb(0_0_0/0.45),0_6px_18px_-14px_rgb(0_0_0/0.25)]",
  glass:
    "rounded-[var(--navdock-radius)] border border-border/60 bg-background/80 shadow-[0_24px_60px_-34px_rgb(0_0_0/0.45),0_6px_18px_-14px_rgb(0_0_0/0.25)] backdrop-blur",
  solid:
    "rounded-[var(--navdock-radius)] border border-border/70 bg-muted text-foreground shadow-[0_18px_48px_-32px_rgb(0_0_0/0.4)]",
};

const navDockSizeClasses: Record<NavDockSize, string> = {
  sm: "[--navdock-icon-size:1.25rem] [--navdock-item-size:2.75rem]",
  md: "[--navdock-icon-size:1.5rem] [--navdock-item-size:3.25rem]",
  lg: "[--navdock-icon-size:1.75rem] [--navdock-item-size:3.75rem]",
};

const navDockListBaseClasses =
  "flex list-none gap-[var(--dt-space-1)] overscroll-contain p-[var(--dt-space-2)] [scrollbar-gutter:stable] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const navDockListPlacementClasses: Record<NavDockPlacement, string> = {
  bottom:
    "max-w-[min(100%,calc(100vw-var(--dt-space-4)))] flex-row items-end [scroll-padding-inline:var(--dt-space-2)]",
  top: "max-w-[min(100%,calc(100vw-var(--dt-space-4)))] flex-row items-start [scroll-padding-inline:var(--dt-space-2)]",
  left: "max-h-[min(100%,calc(100dvh-var(--dt-space-4)))] max-w-full flex-col items-start [scroll-padding-block:var(--dt-space-2)] group-data-[show-title=always]/navdock:items-center",
  right:
    "max-h-[min(100%,calc(100dvh-var(--dt-space-4)))] max-w-full flex-col items-end [scroll-padding-block:var(--dt-space-2)] group-data-[show-title=always]/navdock:items-center",
};

const navDockListOverflowClasses: Record<NavDockOverflowAxis | "none", string> =
  {
    none: "overflow-visible",
    x: "overflow-x-auto overflow-y-visible",
    y: "overflow-x-visible overflow-y-auto",
  };

const navDockSeparatorBaseClasses = "shrink-0 bg-border/70";

const navDockSeparatorPlacementClasses: Record<NavDockPlacement, string> = {
  bottom: "mx-[var(--dt-space-1)] h-8 w-px self-center",
  top: "mx-[var(--dt-space-1)] h-8 w-px self-center",
  left: "my-[var(--dt-space-1)] h-px w-8 self-center",
  right: "my-[var(--dt-space-1)] h-px w-8 self-center",
};

const navDockItemBaseClasses =
  "group/navdock-item relative shrink-0 scroll-m-[var(--dt-space-2)]";

const navDockInteractiveBaseClasses =
  "group/navdock-link relative inline-flex min-w-[var(--navdock-item-size)] items-center justify-center gap-[var(--dt-space-1)] rounded-[var(--navdock-item-radius)] border border-transparent px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-center text-sm font-medium text-foreground/80 outline-none motion-safe:transition-[background-color,border-color,box-shadow,color,opacity] motion-safe:duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[active=true]:z-10 data-[active=true]:text-foreground data-[current=true]:text-primary data-[active=true]:data-[current=true]:text-primary data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50";

const navDockInteractivePlacementClasses: Record<NavDockPlacement, string> = {
  bottom: "min-h-[var(--navdock-item-size)] flex-col",
  top: "min-h-[var(--navdock-item-size)] flex-col-reverse",
  // Vertical docks stack the (optional) inline title below the icon, matching
  // the top/bottom caption layout instead of crowding the label beside the icon.
  left: "min-h-[var(--navdock-item-size)] flex-row group-data-[show-title=always]/navdock:flex-col",
  right:
    "min-h-[var(--navdock-item-size)] flex-row-reverse group-data-[show-title=always]/navdock:flex-col",
};

const navDockIconClasses =
  "inline-flex size-[var(--navdock-icon-size)] shrink-0 transform-gpu items-center justify-center will-change-transform data-[reduced-motion=true]:will-change-auto [&>svg]:size-[var(--navdock-icon-size)] [&>svg]:shrink-0";

const navDockCollapseTriggerClasses =
  "group/navdock-collapse-trigger shrink-0 data-[state=open]:text-foreground";

const navDockCollapseTriggerIconClasses =
  "pointer-events-none inline-flex size-[var(--navdock-icon-size)] items-center justify-center [&>svg]:size-[var(--navdock-icon-size)] [&>svg]:shrink-0";

const navDockCollapsedRootClasses =
  "border-transparent bg-transparent shadow-none backdrop-blur-none";

const navDockCollapsedStaticRootClasses = "relative";

const navDockCollapsedPlaceholderClasses =
  "pointer-events-none block min-h-[calc(var(--navdock-item-size)+var(--dt-space-4))] min-w-[calc(var(--navdock-item-size)+var(--dt-space-4))] shrink-0";

const navDockCollapsedShellBaseClasses =
  "absolute bottom-0 left-0 z-20 inline-flex h-fit w-fit min-w-[calc(var(--navdock-item-size)+var(--dt-space-4))] flex-col items-center justify-end gap-[var(--dt-space-1)] overflow-visible p-[var(--dt-space-2)] text-foreground";

const navDockCollapsedContentClasses = "min-w-0 max-w-full shrink-0";

const navDockCollapsedListClasses = "items-center p-0";

const navDockTitleBaseClasses =
  "min-w-0 max-w-28 truncate text-xs font-medium leading-none";

const navDockTitleVisibilityClasses: Record<NavDockShowTitle, string> = {
  always: "block",
  hover: "sr-only",
  never: "sr-only",
};

const navDockHoverTitleBaseClasses =
  "pointer-events-none z-20 max-w-40 whitespace-nowrap rounded-md border border-border bg-background px-[var(--dt-space-2)] py-[var(--dt-space-1)] text-xs font-medium leading-none text-foreground shadow-md";

const navDockHoverTitlePlacementClasses: Record<NavDockPlacement, string> = {
  bottom:
    "absolute bottom-[calc(100%+var(--dt-space-2))] left-1/2 -translate-x-1/2",
  top: "absolute left-1/2 top-[calc(100%+var(--dt-space-2))] -translate-x-1/2",
  left: "absolute left-[calc(100%+var(--dt-space-2))] top-1/2 -translate-y-1/2",
  right:
    "absolute right-[calc(100%+var(--dt-space-2))] top-1/2 -translate-y-1/2",
};

const navDockHoverTitlePortalledClasses = "fixed z-50";

const navDockMotionTransitions: Record<NavDockMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 },
  standard: { type: "spring", stiffness: 420, damping: 30, mass: 0.75 },
  expressive: { type: "spring", stiffness: 360, damping: 22, mass: 0.8 },
};

const navDockTitleTransitions: Record<NavDockMotion, Transition> = {
  none: { duration: 0 },
  subtle: { duration: 0.12, ease: "easeOut" },
  standard: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  expressive: { type: "spring", stiffness: 420, damping: 26, mass: 0.7 },
};

const navDockPointerIdle = Number.POSITIVE_INFINITY;

const navDockMagnifyScale: Record<NavDockMotion, number> = {
  none: 1,
  subtle: 1.3,
  standard: 1.45,
  expressive: 1.6,
};

const navDockMagnifySpringOptions: Record<NavDockMotion, SpringOptions> = {
  none: { stiffness: 1200, damping: 120, mass: 1 },
  subtle: { stiffness: 480, damping: 44, mass: 0.7 },
  standard: { stiffness: 400, damping: 34, mass: 0.7 },
  expressive: { stiffness: 320, damping: 31, mass: 0.7 },
};

const navDockPressSpringOptions: SpringOptions = {
  stiffness: 700,
  damping: 34,
  mass: 0.6,
};

// Horizontal docks lift from their shelf. Vertical docks magnify around the
// rail centerline so the icon does not drift sideways as the pointer moves.
const navDockMagnifyOriginByPlacement: Record<NavDockPlacement, string> = {
  bottom: "50% 100%",
  top: "50% 0%",
  left: "50% 50%",
  right: "50% 50%",
};

const navDockSubmenuTransitions: Record<NavDockMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 520, damping: 40, mass: 0.8 },
  standard: { type: "spring", stiffness: 420, damping: 30, mass: 0.8 },
  expressive: { type: "spring", stiffness: 360, damping: 24, mass: 0.9 },
};

const navDockSubmenuExitTransition: Transition = {
  duration: 0.16,
  ease: [0.4, 0, 1, 1],
};

const navDockCollapsedShellSpringOptions: Record<NavDockMotion, SpringOptions> =
  {
    none: { stiffness: 1200, damping: 120, mass: 1 },
    subtle: { stiffness: 420, damping: 42, mass: 1 },
    standard: { stiffness: 340, damping: 38, mass: 1 },
    expressive: { stiffness: 300, damping: 36, mass: 1 },
  };

const navDockCollapsedContentTransitions: Record<NavDockMotion, Transition> = {
  none: { duration: 0 },
  subtle: { duration: 0.12, ease: "easeOut" },
  standard: { duration: 0.16, ease: "easeOut" },
  expressive: { duration: 0.2, ease: "easeOut" },
};

const navDockCollapsedContentExitTransition: Transition = {
  duration: 0.18,
  ease: [0.4, 0, 1, 1],
};

const navDockBadgeClasses =
  "pointer-events-none absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-4 text-primary-foreground";

const navDockExternalIndicatorClasses =
  "pointer-events-none absolute right-1 top-1 rounded-sm text-[0.5rem] font-semibold uppercase leading-none text-muted-foreground";

const navDockSubmenuBaseClasses = "relative";

const navDockSubmenuContentBaseClasses =
  "z-30 w-[var(--navdock-submenu-width,14rem)] max-w-[min(var(--navdock-submenu-max-width,18rem),calc(100vw_-_var(--dt-space-4)))] transform-gpu overflow-hidden rounded-md border border-border bg-background p-[var(--dt-space-1)] text-foreground shadow-lg outline-none will-change-transform data-[reduced-motion=true]:will-change-auto";

const navDockSubmenuContentPlacementClasses: Record<NavDockPlacement, string> =
  {
    bottom:
      "absolute bottom-[calc(100%+var(--navdock-submenu-offset))] left-1/2 origin-bottom -translate-x-1/2",
    top: "absolute left-1/2 top-[calc(100%+var(--navdock-submenu-offset))] origin-top -translate-x-1/2",
    left: "absolute left-[calc(100%+var(--navdock-submenu-offset))] top-1/2 origin-left -translate-y-1/2",
    right:
      "absolute right-[calc(100%+var(--navdock-submenu-offset))] top-1/2 origin-right -translate-y-1/2",
  };

const navDockSubmenuContentPortalledClasses = "fixed z-50 origin-center";

const navDockSubmenuPanelClasses =
  "grid max-h-[min(var(--navdock-submenu-max-height,22rem),calc(100dvh_-_var(--dt-space-4)))] gap-0 overflow-auto outline-none";

const navDockSubmenuItemClasses =
  "group/navdock-submenu-item grid min-h-9 grid-cols-[minmax(0,1fr)_auto] items-start gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-start text-sm leading-5 text-foreground no-underline outline-none motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[current=true]:bg-primary/10 data-[current=true]:text-primary data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

const navDockSubmenuItemTextClasses = "grid min-w-0 gap-0.5";

const navDockSubmenuItemLabelClasses = "min-w-0 truncate font-medium";

const navDockSubmenuItemDescriptionClasses =
  "min-w-0 text-xs leading-5 text-muted-foreground";

const navDockSubmenuItemBadgeClasses =
  "ms-[var(--dt-space-2)] justify-self-end rounded-full bg-muted px-[var(--dt-space-1-5)] py-0.5 text-[0.6875rem] font-medium leading-4 text-muted-foreground";

const navDockSubmenuItemExternalClasses =
  "ms-[var(--dt-space-2)] justify-self-end text-[0.625rem] font-semibold uppercase leading-5 text-muted-foreground";

const navDockSubmenuLabelClasses =
  "px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-xs font-semibold uppercase leading-5 text-muted-foreground";

const navDockSubmenuSeparatorClasses = "my-[var(--dt-space-1)] h-px bg-border";

export function navDockClassNames({
  placement = "bottom",
  position = "static",
  size = "md",
  variant = "default",
  className,
}: Pick<
  NavDockProps,
  "placement" | "position" | "size" | "variant" | "className"
> = {}) {
  return cn(
    navDockBaseClasses,
    navDockPlacementClasses[placement],
    navDockPositionClasses[position],
    navDockPositionPlacementClasses[position][placement],
    navDockVariantClasses[variant],
    navDockSizeClasses[size],
    className,
  );
}

export function navDockListClassNames({
  placement = "bottom",
  overflowing = false,
  className,
}: Pick<NavDockProps, "placement"> &
  Pick<NavDockListProps, "className"> & {
    overflowing?: boolean;
  } = {}) {
  const overflowAxis = overflowing ? getNavDockOverflowAxis(placement) : "none";

  return cn(
    navDockListBaseClasses,
    navDockListPlacementClasses[placement],
    navDockListOverflowClasses[overflowAxis],
    className,
  );
}

export function navDockSeparatorClassNames({
  placement = "bottom",
  className,
}: Pick<NavDockProps, "placement"> &
  Pick<NavDockSeparatorProps, "className"> = {}) {
  return cn(
    navDockSeparatorBaseClasses,
    navDockSeparatorPlacementClasses[placement],
    className,
  );
}

export function navDockItemClassNames({
  className,
}: Pick<NavDockItemProps, "className"> = {}) {
  return cn(navDockItemBaseClasses, className);
}

export function navDockLinkClassNames({
  placement = "bottom",
  className,
}: Pick<NavDockProps, "placement"> & Pick<NavDockLinkProps, "className"> = {}) {
  return cn(
    navDockInteractiveBaseClasses,
    navDockInteractivePlacementClasses[placement],
    className,
  );
}

export function navDockButtonClassNames({
  placement = "bottom",
  className,
}: Pick<NavDockProps, "placement"> &
  Pick<NavDockButtonProps, "className"> = {}) {
  return cn(
    navDockInteractiveBaseClasses,
    navDockInteractivePlacementClasses[placement],
    className,
  );
}

function navDockCollapseTriggerClassNames({
  placement = NavDockCollapsedLayoutPlacement,
  className,
}: Pick<NavDockProps, "placement"> & { className?: string } = {}) {
  return cn(
    navDockButtonClassNames({ placement }),
    navDockCollapseTriggerClasses,
    className,
  );
}

function navDockCollapsedShellClassNames({
  variant = "default",
  className,
}: Pick<NavDockProps, "variant"> & { className?: string } = {}) {
  return cn(
    navDockCollapsedShellBaseClasses,
    navDockVariantClasses[variant],
    className,
  );
}

export function navDockSubmenuClassNames({
  className,
}: Pick<NavDockSubmenuProps, "className"> = {}) {
  return cn(navDockSubmenuBaseClasses, className);
}

export function navDockSubmenuTriggerClassNames({
  placement = "bottom",
  className,
}: Pick<NavDockProps, "placement"> &
  Pick<NavDockSubmenuTriggerProps, "className"> = {}) {
  return navDockButtonClassNames({ placement, className });
}

export function navDockSubmenuContentClassNames({
  placement = "bottom",
  portalled = false,
  className,
}: Pick<NavDockProps, "placement"> &
  Pick<NavDockSubmenuContentProps, "className"> & {
    portalled?: boolean;
  } = {}) {
  return cn(
    navDockSubmenuContentBaseClasses,
    portalled
      ? navDockSubmenuContentPortalledClasses
      : navDockSubmenuContentPlacementClasses[placement],
    className,
  );
}

export function navDockTitleClassNames({
  showTitle = "hover",
  className,
}: Pick<NavDockProps, "showTitle"> & { className?: string } = {}) {
  return cn(
    navDockTitleBaseClasses,
    navDockTitleVisibilityClasses[showTitle],
    className,
  );
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

  return (event: React.MouseEvent<HTMLElement>) => {
    componentHandler?.(event);

    if (!event.defaultPrevented) {
      childHandler?.(event);
    }
  };
}

function composeFocusHandlers<T extends HTMLElement>(
  componentHandler: FocusEventHandler<T> | undefined,
  consumerHandler: FocusEventHandler<T> | undefined,
) {
  if (!componentHandler && !consumerHandler) {
    return undefined;
  }

  return (event: React.FocusEvent<T>) => {
    componentHandler?.(event);
    consumerHandler?.(event);
  };
}

function useControllableValue({
  value,
  defaultValue,
  onValueChange,
}: {
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  value?: string | null;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? null,
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: string | null) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return [currentValue ?? null, setValue] as const;
}

function useControllableBoolean({
  value,
  defaultValue = false,
  onValueChange,
}: {
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
  value?: boolean;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: boolean) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue, isControlled] as const;
}

function getAutoCollapseMediaQueryList() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }

  return window.matchMedia(NavDockAutoCollapseMediaQuery);
}

function subscribeAutoCollapse(onChange: () => void) {
  const query = getAutoCollapseMediaQueryList();
  if (!query) return () => {};
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }
  query.addListener(onChange);
  return () => query.removeListener(onChange);
}
function getAutoCollapseSnapshot() {
  return getAutoCollapseMediaQueryList()?.matches ?? false;
}
function getAutoCollapseServerSnapshot() {
  return false;
}
function useAutoCollapseActive(collapseMode: NavDockCollapseMode) {
  const matches = useSyncExternalStore(
    subscribeAutoCollapse,
    getAutoCollapseSnapshot,
    getAutoCollapseServerSnapshot,
  );
  return collapseMode === "always" || (collapseMode !== "none" && matches);
}

function useCollapsedShellHeight({
  motion,
  open,
  reducedMotion,
}: {
  motion: NavDockMotion;
  open: boolean;
  reducedMotion: boolean;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [closedHeight, setClosedHeight] = useState<number | null>(null);
  const [openHeight, setOpenHeight] = useState<number | null>(null);
  const heightValue = useMotionValue(0);
  const springHeight = useSpring(
    heightValue,
    navDockCollapsedShellSpringOptions[motion],
  );

  useIsomorphicLayoutEffect(() => {
    const shell = shellRef.current;

    if (!shell) {
      return undefined;
    }

    const measure = () => {
      const nextClosedHeight = getCollapsedShellClosedHeight(shell);

      if (nextClosedHeight !== null) {
        setClosedHeight(nextClosedHeight);
      }

      if (!open) {
        return;
      }

      const content = shell.querySelector<HTMLElement>(
        '[data-slot="navdock-collapsed-content"]',
      );
      const gap = Number.parseFloat(window.getComputedStyle(shell).rowGap) || 0;
      // Measure intrinsic children, never the shell whose height we animate.
      // scrollHeight includes the animated box and feeds its overshoot back in.
      const nextHeight =
        content && nextClosedHeight !== null
          ? nextClosedHeight + content.offsetHeight + gap
          : 0;

      if (nextHeight > 0) {
        setOpenHeight(nextHeight);
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(measure);

    for (const child of shell.children) observer.observe(child);

    return () => {
      observer.disconnect();
    };
  }, [open]);

  const hasSyncedHeightRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const nextHeight = open
      ? (openHeight ?? closedHeight)
      : (closedHeight ?? openHeight);

    if (nextHeight === null) {
      return;
    }

    // The first measurement is layout, not a state change — snap to it so the
    // shell does not animate from 0 on mount.
    if (!hasSyncedHeightRef.current) {
      hasSyncedHeightRef.current = true;
      heightValue.jump(nextHeight);
      springHeight.jump(nextHeight);
      return;
    }

    heightValue.set(nextHeight);
  }, [closedHeight, heightValue, open, openHeight, springHeight]);

  const staticHeight = open
    ? (openHeight ?? closedHeight ?? undefined)
    : (closedHeight ?? undefined);

  return [
    shellRef,
    {
      closedHeight,
      height: reducedMotion
        ? staticHeight
        : closedHeight === null
          ? undefined
          : springHeight,
      openHeight,
    },
  ] as const;
}

function getCollapsedShellClosedHeight(shell: Element) {
  const styles = window.getComputedStyle(shell);
  const itemSize = parseCssLength(
    styles.getPropertyValue("--navdock-item-size"),
    shell,
  );
  const shellBlockPadding = parseCssLength(
    styles.getPropertyValue("--dt-space-4"),
    shell,
  );

  if (itemSize === null || shellBlockPadding === null) {
    return null;
  }

  return Math.ceil(itemSize + shellBlockPadding);
}

function useNavDockContext() {
  const context = useContext(NavDockContext);

  if (!context) {
    throw new Error("NavDock components must be rendered inside NavDock.");
  }

  return context;
}

function useNavDockItemContext() {
  return useContext(NavDockItemContext);
}

function useNavDockListContext() {
  return useContext(NavDockListContext);
}

function useNavDockSubmenuContext() {
  const context = useContext(NavDockSubmenuContext);

  if (!context) {
    throw new Error(
      "NavDock submenu parts must be rendered inside NavDockSubmenu.",
    );
  }

  return context;
}

function getPortalTarget() {
  return typeof document === "undefined" ? null : document.body;
}

function parseCssLength(value: string, owner: Element | null): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.endsWith("px")) {
    return Number.parseFloat(trimmedValue);
  }

  if (trimmedValue.endsWith("rem")) {
    const rootFontSize =
      typeof window === "undefined"
        ? 16
        : Number.parseFloat(
            window.getComputedStyle(document.documentElement).fontSize,
          );

    return Number.parseFloat(trimmedValue) * rootFontSize;
  }

  if (trimmedValue.endsWith("em") && owner) {
    const fontSize = Number.parseFloat(window.getComputedStyle(owner).fontSize);

    return Number.parseFloat(trimmedValue) * fontSize;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    return Number.parseFloat(trimmedValue);
  }

  return null;
}

function readCssLengthVariable({
  anchorElement,
  fallback,
  variableName,
}: {
  anchorElement: HTMLElement;
  fallback: number;
  variableName: NavDockLayerOffsetVariable;
}) {
  const root = anchorElement.closest('[data-slot="navdock"]') ?? anchorElement;
  const rootStyles = window.getComputedStyle(root);
  const directValue = rootStyles.getPropertyValue(variableName);
  const directLength = parseCssLength(directValue, root);

  if (directLength !== null) {
    return directLength;
  }

  const variableMatch = directValue.match(/var\((--[^,)]+)/);

  if (variableMatch) {
    const referencedValue = rootStyles.getPropertyValue(variableMatch[1]);
    const referencedLength = parseCssLength(referencedValue, root);

    if (referencedLength !== null) {
      return referencedLength;
    }
  }

  return fallback;
}

function getAnchoredLayerStyle({
  anchorElement,
  fallbackOffset,
  placement,
  variableName,
}: {
  anchorElement: HTMLElement;
  fallbackOffset: number;
  placement: NavDockPlacement;
  variableName: NavDockLayerOffsetVariable;
}): CSSProperties {
  const rect = anchorElement.getBoundingClientRect();
  const offset = readCssLengthVariable({
    anchorElement,
    fallback: fallbackOffset,
    variableName,
  });
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  switch (placement) {
    case "top":
      return {
        left: centerX,
        top: rect.bottom + offset,
        translate: "-50% 0",
      };
    case "left":
      return {
        left: rect.right + offset,
        top: centerY,
        translate: "0 -50%",
      };
    case "right":
      return {
        left: rect.left - offset,
        top: centerY,
        translate: "-100% -50%",
      };
    case "bottom":
    default:
      return {
        left: centerX,
        top: rect.top - offset,
        translate: "-50% -100%",
      };
  }
}

function useAnchoredLayerStyle({
  anchorElement,
  fallbackOffset,
  open,
  placement,
  variableName,
}: {
  anchorElement: HTMLElement | null | undefined;
  fallbackOffset: number;
  open: boolean;
  placement: NavDockPlacement;
  variableName: NavDockLayerOffsetVariable;
}) {
  const currentStyle =
    open && anchorElement && typeof window !== "undefined"
      ? getAnchoredLayerStyle({
          anchorElement,
          fallbackOffset,
          placement,
          variableName,
        })
      : undefined;
  const [style, setStyle] = useState<CSSProperties | undefined>(currentStyle);

  useEffect(() => {
    if (!open || !anchorElement || typeof window === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Discard committed DOM measurements when hidden so reopening uses the anchor's current position.
      setStyle(undefined);
      return undefined;
    }

    const updateStyle = () => {
      setStyle(
        getAnchoredLayerStyle({
          anchorElement,
          fallbackOffset,
          placement,
          variableName,
        }),
      );
    };

    updateStyle();
    window.addEventListener("resize", updateStyle);
    window.addEventListener("scroll", updateStyle, true);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateStyle);

      observer.observe(anchorElement);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateStyle);
        window.removeEventListener("scroll", updateStyle, true);
      };
    }

    return () => {
      window.removeEventListener("resize", updateStyle);
      window.removeEventListener("scroll", updateStyle, true);
    };
  }, [anchorElement, fallbackOffset, open, placement, variableName]);

  return style ?? currentStyle;
}

function resolveAriaCurrent(
  ariaCurrent: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"],
  current: NavDockCurrent | undefined,
) {
  if (ariaCurrent !== undefined) {
    return ariaCurrent;
  }

  if (current === true) {
    return "page";
  }

  if (current === "page" || current === "location") {
    return current;
  }

  return undefined;
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

function shouldReduceNavDockMotion(
  motion: NavDockMotion,
  prefersReducedMotion: boolean | null,
) {
  return motion === "none" || prefersReducedMotion === true;
}

function getNavDockOrientation(
  placement: NavDockPlacement,
): NavDockOrientation {
  return placement === "left" || placement === "right"
    ? "vertical"
    : "horizontal";
}

function getNavDockOverflowAxis(
  placement: NavDockPlacement,
): NavDockOverflowAxis {
  return getNavDockOrientation(placement) === "vertical" ? "y" : "x";
}

function getNavDockElementDirection(element: HTMLElement) {
  const explicitDir = element.closest("[dir]")?.getAttribute("dir");

  if (explicitDir === "rtl" || explicitDir === "ltr") {
    return explicitDir;
  }

  return window.getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
}

function getNavDockFocusableItems(list: HTMLElement) {
  return Array.from(
    list.querySelectorAll<HTMLElement>(
      '[data-slot="navdock-link"], [data-slot="navdock-button"], [data-slot="navdock-submenu-trigger"]',
    ),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-disabled") !== "true",
  );
}

function scrollNavDockItemIntoView(element: HTMLElement) {
  if (typeof element.scrollIntoView !== "function") {
    return;
  }

  element.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function focusNavDockItemAtIndex(
  list: HTMLElement,
  index: number,
  focusableItems = getNavDockFocusableItems(list),
) {
  const nextItem = focusableItems[index];

  if (!nextItem) {
    return false;
  }

  nextItem.focus();
  scrollNavDockItemIntoView(nextItem);

  return true;
}

function focusNavDockItemByOffset({
  list,
  offset,
  target,
}: {
  list: HTMLElement;
  offset: number;
  target: EventTarget | null;
}) {
  const focusableItems = getNavDockFocusableItems(list);

  if (focusableItems.length === 0) {
    return false;
  }

  const currentIndex = focusableItems.findIndex(
    (element) => target instanceof Node && element.contains(target),
  );

  if (currentIndex === -1) {
    return focusNavDockItemAtIndex(
      list,
      offset > 0 ? 0 : focusableItems.length - 1,
      focusableItems,
    );
  }

  const nextIndex = Math.min(
    Math.max(currentIndex + offset, 0),
    focusableItems.length - 1,
  );

  if (nextIndex === currentIndex) {
    return false;
  }

  return focusNavDockItemAtIndex(list, nextIndex, focusableItems);
}

function getNavDockItemMotionState({
  activeValue,
  itemValues,
  value,
}: {
  activeValue: string | null;
  itemValues: string[];
  value?: string;
}): NavDockMotionState {
  if (value === undefined || activeValue === null) {
    return "idle";
  }

  if (value === activeValue) {
    return "active";
  }

  const activeIndex = itemValues.indexOf(activeValue);
  const itemIndex = itemValues.indexOf(value);

  if (
    activeIndex !== -1 &&
    itemIndex !== -1 &&
    Math.abs(activeIndex - itemIndex) === 1
  ) {
    return "neighbor";
  }

  return "idle";
}

function getNavDockMagnifiedScale({
  distance,
  magnifyScale,
  radius,
}: {
  distance: number;
  magnifyScale: number;
  radius: number;
}) {
  if (radius <= 0 || distance >= radius) {
    return 1;
  }

  // Cosine falloff peaks smoothly at the pointer and fades over `radius`.
  const falloff = (1 + Math.cos((distance / radius) * Math.PI)) / 2;

  return 1 + (magnifyScale - 1) * falloff;
}

function getPressMotionTarget({
  disabled,
  reducedMotion,
}: {
  disabled: boolean;
  reducedMotion: boolean;
}): TargetAndTransition | undefined {
  if (disabled || reducedMotion) {
    return undefined;
  }

  return { scale: 0.92 };
}

function getTitleMotionOffset(placement: NavDockPlacement) {
  switch (placement) {
    case "top":
      return { x: 0, y: -4 };
    case "left":
      return { x: -4, y: 0 };
    case "right":
      return { x: 4, y: 0 };
    case "bottom":
    default:
      return { x: 0, y: 4 };
  }
}

function getTitleMotionState({
  placement,
  reducedMotion,
}: {
  placement: NavDockPlacement;
  reducedMotion: boolean;
}): TargetAndTransition {
  const offset = reducedMotion
    ? { x: 0, y: 0 }
    : getTitleMotionOffset(placement);

  return {
    opacity: 0,
    ...offset,
  };
}

function getSubmenuMotionOffset(placement: NavDockPlacement) {
  switch (placement) {
    case "top":
      return { x: 0, y: -8 };
    case "left":
      return { x: -8, y: 0 };
    case "right":
      return { x: 8, y: 0 };
    case "bottom":
    default:
      return { x: 0, y: 8 };
  }
}

function getSubmenuClosedMotionState({
  placement,
  reducedMotion,
}: {
  placement: NavDockPlacement;
  reducedMotion: boolean;
}): TargetAndTransition {
  const offset = reducedMotion
    ? { x: 0, y: 0 }
    : getSubmenuMotionOffset(placement);

  return {
    opacity: 0,
    scale: reducedMotion ? 1 : 0.92,
    ...offset,
  };
}

function getSubmenuOpenMotionState(): TargetAndTransition {
  return {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
  };
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

function getChildRef(child: ReactElement<NavDockLinkSlotProps>) {
  return child.props.ref;
}

function getItemRoleCount(item: Record<string, unknown>) {
  return [item.href, item.onAction, item.submenu].filter(
    (value) => value !== undefined,
  ).length;
}

function assertValidItemRole(item: NavDockItemData) {
  if (getItemRoleCount(item as Record<string, unknown>) > 1) {
    throw new Error(
      "NavDock item data must define only one of href, onAction, or submenu.",
    );
  }
}

function getCollapsedContentClosedMotionState({
  reducedMotion,
}: {
  reducedMotion: boolean;
}): TargetAndTransition {
  if (reducedMotion) {
    return { opacity: 0 };
  }

  return { opacity: 0 };
}

function getCollapsedContentExitMotionState({
  reducedMotion,
}: {
  reducedMotion: boolean;
}): TargetAndTransition {
  if (reducedMotion) {
    return { opacity: 0 };
  }

  // Keep the list anchored above the trigger while the shell contracts.
  return {
    opacity: 0,
    transition: navDockCollapsedContentExitTransition,
  };
}

function getCollapsedContentOpenMotionState(): TargetAndTransition {
  return { opacity: 1 };
}

function getItemCurrent(
  item: NavDockItemData,
  currentValue: string | undefined,
  isItemCurrent: NavDockCurrentMatcher | undefined,
): NavDockCurrent | undefined {
  if ("current" in item && item.current !== undefined) {
    return item.current;
  }

  const matched = isItemCurrent?.(item, { currentValue });

  if (matched !== undefined) {
    return matched;
  }

  return currentValue !== undefined && item.value === currentValue
    ? true
    : undefined;
}

function NavDockHoverTitle({
  active,
  anchorElement,
  motion,
  placement,
  portalled,
  reducedMotion,
  title,
}: {
  active: boolean;
  anchorElement?: HTMLElement | null;
  motion: NavDockMotion;
  placement: NavDockPlacement;
  portalled: boolean;
  reducedMotion: boolean;
  title: ReactNode;
}) {
  const portalTarget = portalled ? getPortalTarget() : null;
  const portalledStyle = useAnchoredLayerStyle({
    anchorElement,
    fallbackOffset: 8,
    open: active && portalled,
    placement,
    variableName: "--dt-space-2",
  });
  const shouldPortal = Boolean(portalled && portalTarget);
  const titleNode = (
    <motionElement.span
      aria-hidden="true"
      key="navdock-hover-title"
      data-slot="navdock-hover-title"
      data-placement={placement}
      data-portalled={shouldPortal ? "true" : undefined}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      initial={
        shouldPortal
          ? { opacity: 0 }
          : getTitleMotionState({ placement, reducedMotion })
      }
      animate={shouldPortal ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      exit={
        shouldPortal
          ? { opacity: 0 }
          : getTitleMotionState({ placement, reducedMotion })
      }
      transition={
        reducedMotion
          ? navDockTitleTransitions.none
          : navDockTitleTransitions[motion]
      }
      style={shouldPortal ? (portalledStyle ?? { left: 0, top: 0 }) : undefined}
      className={cn(
        navDockHoverTitleBaseClasses,
        shouldPortal
          ? navDockHoverTitlePortalledClasses
          : navDockHoverTitlePlacementClasses[placement],
      )}
    >
      {title}
    </motionElement.span>
  );

  const titlePresence = (
    <AnimatePresence initial={false}>
      {active ? titleNode : null}
    </AnimatePresence>
  );

  return shouldPortal && portalTarget
    ? createPortal(titlePresence, portalTarget)
    : titlePresence;
}

function NavDockItemIcon({
  disabled,
  icon,
  motion,
  motionState,
  placement,
  reducedMotion,
}: {
  disabled: boolean;
  icon: ReactNode;
  motion: NavDockMotion;
  motionState: NavDockMotionState;
  placement: NavDockPlacement;
  reducedMotion: boolean;
}) {
  const listContext = useNavDockListContext();
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const localPointerPosition = useMotionValue(navDockPointerIdle);
  const pointerPosition = listContext?.pointerPosition ?? localPointerPosition;
  const focusMagnify = useMotionValue(motionState === "active" ? 1 : 0);
  const pressTarget = useMotionValue(1);
  const press = useSpring(pressTarget, navDockPressSpringOptions);
  const horizontal = getNavDockOrientation(placement) === "horizontal";
  const magnifyScale = navDockMagnifyScale[motion];
  const scaleTarget = useTransform(
    [pointerPosition, focusMagnify],
    ([pointer, focus]: number[]) => {
      if (reducedMotion || disabled || magnifyScale <= 1) {
        return 1;
      }

      // No pointer over the dock: keyboard focus still magnifies the item.
      if (!Number.isFinite(pointer)) {
        return focus > 0 ? magnifyScale : 1;
      }

      const anchor = anchorRef.current ?? iconRef.current;

      if (!anchor) {
        return 1;
      }

      const bounds = anchor.getBoundingClientRect();
      const center = horizontal
        ? bounds.left + bounds.width / 2
        : bounds.top + bounds.height / 2;
      const radius = (horizontal ? bounds.width : bounds.height) * 2;

      return getNavDockMagnifiedScale({
        distance: Math.abs(pointer - center),
        magnifyScale,
        radius,
      });
    },
  );
  const magnify = useSpring(scaleTarget, navDockMagnifySpringOptions[motion]);
  const scale = useTransform(
    [magnify, press],
    ([magnifyValue, pressValue]: number[]) => magnifyValue * pressValue,
  );

  // The pointer distance must be measured against a stationary box, so anchor
  // to the interactive element rather than the scaling icon itself.
  useIsomorphicLayoutEffect(() => {
    const iconElement = iconRef.current;

    anchorRef.current =
      iconElement?.closest<HTMLElement>(
        '[data-slot="navdock-link"], [data-slot="navdock-button"], [data-slot="navdock-submenu-trigger"]',
      ) ?? iconElement;
  }, []);

  useEffect(() => {
    focusMagnify.set(motionState === "active" ? 1 : 0);
  }, [focusMagnify, motionState]);

  useEffect(() => {
    const anchor = anchorRef.current;

    if (!anchor || reducedMotion || disabled) {
      pressTarget.set(1);
      return undefined;
    }

    const handlePress = () => pressTarget.set(0.94);
    const releasePress = () => pressTarget.set(1);

    anchor.addEventListener("pointerdown", handlePress);
    window.addEventListener("pointerup", releasePress);
    window.addEventListener("pointercancel", releasePress);

    return () => {
      anchor.removeEventListener("pointerdown", handlePress);
      window.removeEventListener("pointerup", releasePress);
      window.removeEventListener("pointercancel", releasePress);
    };
  }, [disabled, pressTarget, reducedMotion]);

  return (
    <motionElement.span
      ref={iconRef}
      aria-hidden="true"
      data-slot="navdock-item-icon"
      data-motion-state={motionState}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      style={{
        scale: reducedMotion ? 1 : scale,
        transformOrigin: navDockMagnifyOriginByPlacement[placement],
      }}
      className={navDockIconClasses}
    >
      {icon}
    </motionElement.span>
  );
}

function getInteractiveContent({
  active,
  anchorElement,
  badge,
  children,
  description,
  disabled,
  external,
  icon,
  motion,
  motionState,
  placement,
  portalledLayer,
  reducedMotion,
  showTitle,
  title,
}: {
  active: boolean;
  anchorElement?: HTMLElement | null;
  badge?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  disabled: boolean;
  external?: boolean;
  icon?: ReactNode;
  motion: NavDockMotion;
  motionState: NavDockMotionState;
  placement: NavDockPlacement;
  portalledLayer: boolean;
  reducedMotion: boolean;
  showTitle: NavDockShowTitle;
  title?: ReactNode;
}) {
  if (children !== undefined) {
    return children;
  }

  return (
    <>
      {icon !== undefined ? (
        <NavDockItemIcon
          disabled={disabled}
          icon={icon}
          motion={motion}
          motionState={motionState}
          placement={placement}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {title !== undefined ? (
        <>
          <span
            data-slot="navdock-item-title"
            data-motion-state={motionState}
            data-reduced-motion={reducedMotion ? "true" : undefined}
            className={navDockTitleClassNames({ showTitle })}
          >
            {title}
          </span>
          {showTitle === "hover" ? (
            <NavDockHoverTitle
              active={active}
              anchorElement={anchorElement}
              motion={motion}
              placement={placement}
              portalled={portalledLayer}
              reducedMotion={reducedMotion}
              title={title}
            />
          ) : null}
        </>
      ) : null}
      {description !== undefined ? (
        <span className="sr-only"> {description}</span>
      ) : null}
      {badge !== undefined ? (
        <span
          aria-hidden="true"
          data-slot="navdock-item-badge"
          className={navDockBadgeClasses}
        >
          {badge}
        </span>
      ) : null}
      {external ? (
        <span
          aria-hidden="true"
          data-slot="navdock-external-indicator"
          className={navDockExternalIndicatorClasses}
        >
          ext
        </span>
      ) : null}
    </>
  );
}

function getDescribedBy(
  providedDescribedBy: string | undefined,
  generatedId: string | undefined,
) {
  if (!generatedId) {
    return providedDescribedBy;
  }

  return [providedDescribedBy, generatedId].filter(Boolean).join(" ");
}

function DisabledReason({
  id,
  reason,
}: {
  id: string | undefined;
  reason: ReactNode;
}) {
  if (!id) {
    return null;
  }

  return (
    <span id={id} className="sr-only">
      {reason}
    </span>
  );
}

function DefaultNavDockTriggerIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M5.75 7.25h4.5v4.5h-4.5zM13.75 7.25h4.5v4.5h-4.5zM5.75 15.25h4.5v1.5h-4.5zM13.75 15.25h4.5v1.5h-4.5z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export const CollapseDock = forwardRef<HTMLDivElement, CollapseDockProps>(
  (
    {
      children,
      className,
      collapseLabel = "Close navigation dock",
      collapseMode: _collapseMode,
      collapsed: _collapsed,
      defaultCollapsed: _defaultCollapsed,
      items,
      mode: _mode,
      onCollapsedChange: _onCollapsedChange,
      style,
      triggerIcon,
      triggerLabel = "Open navigation dock",
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion = shouldReduceNavDockMotion(
      context.motion,
      prefersReducedMotion,
    );
    const [collapsedShellRef, collapsedShellHeight] = useCollapsedShellHeight({
      motion: context.motion,
      open: context.collapseModeActive && !context.collapsed,
      reducedMotion,
    });
    const collapseDockContext = useMemo<NavDockContextValue>(
      () => ({
        ...context,
        showTitle: "never",
      }),
      [context],
    );
    const dockContent = items ? (
      <NavDockList key="collapse-dock-list">
        {items.map((item) =>
          renderNavDockItemData(item, {
            current: getItemCurrent(
              item,
              context.currentValue,
              context.isItemCurrent,
            ),
          }),
        )}
      </NavDockList>
    ) : (
      children
    );
    const triggerAccessibleLabel = context.collapsed
      ? triggerLabel
      : collapseLabel;
    const renderedTriggerIcon = triggerIcon ?? <DefaultNavDockTriggerIcon />;
    const handleCollapseTriggerClick: MouseEventHandler<
      HTMLButtonElement
    > = () => {
      const nextCollapsed = !context.collapsed;

      context.setCollapsed(nextCollapsed);

      if (nextCollapsed) {
        context.setOpenValue(null);
      }
    };

    if (!context.collapseModeActive) {
      return (
        <NavDockContext.Provider value={collapseDockContext}>
          {dockContent}
        </NavDockContext.Provider>
      );
    }

    return (
      <NavDockContext.Provider value={collapseDockContext}>
        <span
          aria-hidden="true"
          data-slot="navdock-collapse-placeholder"
          className={navDockCollapsedPlaceholderClasses}
        />
        <motionElement.div
          {...props}
          ref={composeRefs(ref, collapsedShellRef)}
          data-slot="navdock-collapsed-shell"
          data-placement={context.placement}
          data-position={context.position}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          data-size={context.size}
          data-state={context.collapsed ? "closed" : "open"}
          data-variant={context.variant}
          initial={false}
          style={{ ...style, height: collapsedShellHeight.height }}
          className={navDockCollapsedShellClassNames({
            variant: context.variant,
            className,
          })}
        >
          <AnimatePresence initial={false}>
            {!context.collapsed ? (
              <motionElement.div
                key="navdock-collapsed-content"
                data-slot="navdock-collapsed-content"
                data-placement={context.placement}
                data-state="open"
                data-reduced-motion={reducedMotion ? "true" : undefined}
                initial={getCollapsedContentClosedMotionState({
                  reducedMotion,
                })}
                animate={getCollapsedContentOpenMotionState()}
                exit={getCollapsedContentExitMotionState({
                  reducedMotion,
                })}
                transition={
                  reducedMotion
                    ? navDockMotionTransitions.none
                    : navDockCollapsedContentTransitions[context.motion]
                }
                className={navDockCollapsedContentClasses}
              >
                {dockContent}
              </motionElement.div>
            ) : null}
          </AnimatePresence>
          <motionElement.button
            ref={(node) => {
              setRef(context.collapseTriggerRef, node);
            }}
            type="button"
            aria-controls={context.renderedListId}
            aria-expanded={!context.collapsed}
            data-slot="navdock-collapse-trigger"
            data-placement={context.placement}
            data-position={context.position}
            data-reduced-motion={reducedMotion ? "true" : undefined}
            data-size={context.size}
            data-state={context.collapsed ? "closed" : "open"}
            data-variant={context.variant}
            className={navDockCollapseTriggerClassNames({
              placement: context.placement,
            })}
            initial={false}
            whileTap={getPressMotionTarget({
              disabled: false,
              reducedMotion,
            })}
            transition={
              reducedMotion
                ? navDockMotionTransitions.none
                : navDockMotionTransitions[context.motion]
            }
            onClick={handleCollapseTriggerClick}
          >
            <span
              aria-hidden="true"
              data-slot="navdock-collapse-trigger-icon"
              className={navDockCollapseTriggerIconClasses}
            >
              {renderedTriggerIcon}
            </span>
            <span className="sr-only">{triggerAccessibleLabel}</span>
          </motionElement.button>
        </motionElement.div>
      </NavDockContext.Provider>
    );
  },
);

CollapseDock.displayName = "CollapseDock";

function isCollapseDockElement(
  child: ReactNode,
): child is ReactElement<CollapseDockProps> {
  return (
    isValidElement<CollapseDockProps>(child) && child.type === CollapseDock
  );
}

function getCollapseDockElement(
  children: ReactNode,
): ReactElement<CollapseDockProps> | null {
  let collapseDockElement: ReactElement<CollapseDockProps> | null = null;

  Children.forEach(children, (child) => {
    if (!collapseDockElement && isCollapseDockElement(child)) {
      collapseDockElement = child;
    }
  });

  return collapseDockElement;
}

export const NavDock = forwardRef<HTMLElement, NavDockProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      collapseLabel = "Close navigation dock",
      collapseMode = "auto",
      collapsed,
      currentValue,
      defaultCollapsed,
      defaultOpenValue = null,
      defaultValue = null,
      isItemCurrent,
      items,
      motion = "standard",
      onCollapsedChange,
      onKeyDown,
      onOpenValueChange,
      onValueChange,
      openValue,
      placement = "bottom",
      position = "static",
      showTitle = "hover",
      size = "md",
      triggerIcon,
      triggerLabel = "Open navigation dock",
      value,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const collapseDockElement = items ? null : getCollapseDockElement(children);
    const collapseDockProps = collapseDockElement?.props;
    const resolvedCollapseMode =
      collapseDockProps?.collapseMode ??
      collapseDockProps?.mode ??
      (collapseDockElement ? "always" : collapseMode);
    const resolvedCollapsed = collapseDockProps?.collapsed ?? collapsed;
    const resolvedDefaultCollapsed =
      collapseDockProps?.defaultCollapsed ?? defaultCollapsed;
    const resolvedOnCollapsedChange =
      collapseDockProps?.onCollapsedChange ?? onCollapsedChange;
    const [activeValue, setActiveValue] = useControllableValue({
      defaultValue,
      onValueChange,
      value,
    });
    const [currentOpenValue, setOpenValue] = useControllableValue({
      defaultValue: defaultOpenValue,
      onValueChange: onOpenValueChange,
      value: openValue,
    });
    const autoCollapseActive = useAutoCollapseActive(resolvedCollapseMode);
    const collapseModeActive =
      resolvedCollapseMode === "always" ||
      (resolvedCollapseMode === "auto" && autoCollapseActive);
    const [currentCollapsed, setCollapsed, isCollapsedControlled] =
      useControllableBoolean({
        defaultValue:
          resolvedDefaultCollapsed ?? resolvedCollapseMode === "always",
        onValueChange: resolvedOnCollapsedChange,
        value: resolvedCollapsed,
      });
    const isCollapsed = collapseModeActive && currentCollapsed;
    const anchorPlacement = collapseModeActive
      ? NavDockCollapsedAnchorPlacement
      : placement;
    const layoutPlacement = collapseModeActive
      ? NavDockCollapsedLayoutPlacement
      : placement;
    const rootRef = useRef<HTMLElement | null>(null);
    const collapseTriggerRef = useRef<HTMLButtonElement | null>(null);
    const rootId = useId();
    const listId = useId();
    const [renderedListId, setRenderedListId] = useState(listId);
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion = shouldReduceNavDockMotion(
      motion,
      prefersReducedMotion,
    );
    const [collapsedShellRef, collapsedShellHeight] = useCollapsedShellHeight({
      motion,
      open: collapseModeActive && !collapseDockElement && !isCollapsed,
      reducedMotion,
    });
    const [registeredItemValues, setRegisteredItemValues] = useState<string[]>(
      [],
    );
    const dataItemValues = useMemo(
      () => items?.map((item) => item.value) ?? [],
      [items],
    );
    const itemValues = items ? dataItemValues : registeredItemValues;
    const registerListId = useCallback(
      (renderedId: string) => {
        setRenderedListId(renderedId);

        return () => {
          setRenderedListId((currentRenderedId) =>
            currentRenderedId === renderedId ? listId : currentRenderedId,
          );
        };
      },
      [listId],
    );
    const registerItemValue = useCallback((itemValue: string) => {
      setRegisteredItemValues((values) =>
        values.includes(itemValue) ? values : [...values, itemValue],
      );

      return () => {
        setRegisteredItemValues((values) =>
          values.filter((value) => value !== itemValue),
        );
      };
    }, []);
    const context = useMemo<NavDockContextValue>(
      () => ({
        activeValue,
        collapsed: isCollapsed,
        collapseMode: resolvedCollapseMode,
        collapseModeActive,
        collapseTriggerRef,
        currentValue,
        isItemCurrent,
        itemValues,
        listId,
        motion,
        openValue: currentOpenValue,
        placement: layoutPlacement,
        position,
        registerListId,
        registerItemValue: items ? undefined : registerItemValue,
        renderedListId,
        rootId,
        setActiveValue,
        setCollapsed,
        setOpenValue,
        showTitle,
        size,
        variant,
      }),
      [
        activeValue,
        collapseModeActive,
        currentValue,
        currentOpenValue,
        isCollapsed,
        isItemCurrent,
        itemValues,
        items,
        layoutPlacement,
        listId,
        motion,
        position,
        registerListId,
        registerItemValue,
        renderedListId,
        resolvedCollapseMode,
        rootId,
        setActiveValue,
        setCollapsed,
        setOpenValue,
        showTitle,
        size,
        variant,
      ],
    );
    const orientation = getNavDockOrientation(layoutPlacement);
    const overflowAxis = getNavDockOverflowAxis(layoutPlacement);
    useEffect(() => {
      if (isCollapsedControlled || resolvedDefaultCollapsed !== undefined) {
        return;
      }

      if (resolvedCollapseMode === "none") {
        setCollapsed(false);
      } else if (resolvedCollapseMode === "always") {
        setCollapsed(true);
      } else {
        setCollapsed(autoCollapseActive);
      }
    }, [
      autoCollapseActive,
      resolvedCollapseMode,
      resolvedDefaultCollapsed,
      isCollapsedControlled,
      setCollapsed,
    ]);
    useEffect(() => {
      if (currentOpenValue === null) {
        return undefined;
      }

      const handleDocumentPointerDown = (event: PointerEvent) => {
        const root = rootRef.current;
        const targetElement =
          event.target instanceof Element ? event.target : null;
        const submenuContent = targetElement?.closest(
          '[data-slot="navdock-submenu-content"]',
        );

        if (
          root &&
          event.target instanceof Node &&
          !root.contains(event.target) &&
          submenuContent?.getAttribute("data-navdock-root") !== rootId
        ) {
          setOpenValue(null);
        }
      };

      document.addEventListener("pointerdown", handleDocumentPointerDown);

      return () => {
        document.removeEventListener("pointerdown", handleDocumentPointerDown);
      };
    }, [currentOpenValue, rootId, setOpenValue]);
    useEffect(() => {
      if (!collapseModeActive || isCollapsed) {
        return undefined;
      }

      const handleDocumentPointerDown = (event: PointerEvent) => {
        const root = rootRef.current;
        const targetElement =
          event.target instanceof Element ? event.target : null;
        const submenuContent = targetElement?.closest(
          '[data-slot="navdock-submenu-content"]',
        );

        if (
          root &&
          event.target instanceof Node &&
          !root.contains(event.target) &&
          submenuContent?.getAttribute("data-navdock-root") !== rootId
        ) {
          setCollapsed(true);
          setOpenValue(null);
        }
      };

      document.addEventListener("pointerdown", handleDocumentPointerDown);

      return () => {
        document.removeEventListener("pointerdown", handleDocumentPointerDown);
      };
    }, [collapseModeActive, isCollapsed, rootId, setCollapsed, setOpenValue]);
    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
      onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape" && currentOpenValue !== null) {
        setOpenValue(null);
        event.preventDefault();
      } else if (event.key === "Escape" && collapseModeActive && !isCollapsed) {
        setCollapsed(true);
        collapseTriggerRef.current?.focus();
        event.preventDefault();
      }
    };
    const handleCollapseTriggerClick: MouseEventHandler<
      HTMLButtonElement
    > = () => {
      const nextCollapsed = !isCollapsed;

      setCollapsed(nextCollapsed);

      if (nextCollapsed) {
        setOpenValue(null);
      }
    };
    const navLabelProps =
      ariaLabelledBy !== undefined
        ? { "aria-labelledby": ariaLabelledBy }
        : { "aria-label": ariaLabel ?? "Navigation dock" };
    const collapsedDockContext = useMemo<NavDockContextValue>(
      () => ({
        ...context,
        showTitle: "never",
      }),
      [context],
    );
    const dockContent = items ? (
      <NavDockList key="navdock-list">
        {items.map((item) =>
          renderNavDockItemData(item, {
            current: getItemCurrent(item, currentValue, isItemCurrent),
          }),
        )}
      </NavDockList>
    ) : (
      children
    );
    const triggerAccessibleLabel = isCollapsed ? triggerLabel : collapseLabel;
    const renderedTriggerIcon = triggerIcon ?? <DefaultNavDockTriggerIcon />;
    const renderedDockContent =
      collapseModeActive && !collapseDockElement ? (
        <>
          <span
            aria-hidden="true"
            data-slot="navdock-collapse-placeholder"
            className={navDockCollapsedPlaceholderClasses}
          />
          <motionElement.div
            ref={collapsedShellRef}
            data-slot="navdock-collapsed-shell"
            data-placement={layoutPlacement}
            data-position={position}
            data-reduced-motion={reducedMotion ? "true" : undefined}
            data-size={size}
            data-state={isCollapsed ? "closed" : "open"}
            data-variant={variant}
            initial={false}
            style={{ height: collapsedShellHeight.height }}
            className={navDockCollapsedShellClassNames({ variant })}
          >
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motionElement.div
                  key="navdock-collapsed-content"
                  data-slot="navdock-collapsed-content"
                  data-placement={layoutPlacement}
                  data-state="open"
                  data-reduced-motion={reducedMotion ? "true" : undefined}
                  initial={getCollapsedContentClosedMotionState({
                    reducedMotion,
                  })}
                  animate={getCollapsedContentOpenMotionState()}
                  exit={getCollapsedContentExitMotionState({
                    reducedMotion,
                  })}
                  transition={
                    reducedMotion
                      ? navDockMotionTransitions.none
                      : navDockCollapsedContentTransitions[motion]
                  }
                  className={navDockCollapsedContentClasses}
                >
                  <NavDockContext.Provider value={collapsedDockContext}>
                    {dockContent}
                  </NavDockContext.Provider>
                </motionElement.div>
              ) : null}
            </AnimatePresence>
            <motionElement.button
              ref={collapseTriggerRef}
              type="button"
              aria-controls={renderedListId}
              aria-expanded={!isCollapsed}
              data-slot="navdock-collapse-trigger"
              data-placement={layoutPlacement}
              data-position={position}
              data-reduced-motion={reducedMotion ? "true" : undefined}
              data-size={size}
              data-state={isCollapsed ? "closed" : "open"}
              data-variant={variant}
              className={navDockCollapseTriggerClassNames({
                placement: layoutPlacement,
              })}
              initial={false}
              whileTap={getPressMotionTarget({
                disabled: false,
                reducedMotion,
              })}
              transition={
                reducedMotion
                  ? navDockMotionTransitions.none
                  : navDockMotionTransitions[motion]
              }
              onClick={handleCollapseTriggerClick}
            >
              <span
                aria-hidden="true"
                data-slot="navdock-collapse-trigger-icon"
                className={navDockCollapseTriggerIconClasses}
              >
                {renderedTriggerIcon}
              </span>
              <span className="sr-only">{triggerAccessibleLabel}</span>
            </motionElement.button>
          </motionElement.div>
        </>
      ) : (
        dockContent
      );

    return (
      <MotionConfig reducedMotion={motion === "none" ? "always" : "user"}>
        <NavDockContext.Provider value={context}>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Keyboard and pointer events delegate to the dock’s focusable links and buttons. */}
          <nav
            {...props}
            {...navLabelProps}
            ref={composeRefs(ref, rootRef)}
            data-slot="navdock"
            data-navdock-root={rootId}
            data-placement={placement}
            data-anchor-placement={
              collapseModeActive ? anchorPlacement : undefined
            }
            data-layout-placement={
              collapseModeActive ? layoutPlacement : undefined
            }
            data-position={position}
            data-variant={variant}
            data-size={size}
            data-orientation={orientation}
            data-overflow-axis={overflowAxis}
            data-motion={motion}
            data-show-title={showTitle}
            data-collapse-mode={resolvedCollapseMode}
            data-collapse-active={collapseModeActive ? "true" : undefined}
            data-collapsed={isCollapsed ? "true" : undefined}
            data-value={activeValue ?? undefined}
            data-open-value={currentOpenValue ?? undefined}
            className={navDockClassNames({
              placement: anchorPlacement,
              position,
              size,
              variant,
              className: cn(
                className,
                collapseModeActive
                  ? cn(
                      position === "static"
                        ? navDockCollapsedStaticRootClasses
                        : undefined,
                      navDockCollapsedRootClasses,
                    )
                  : undefined,
              ),
            })}
            onKeyDown={handleKeyDown}
          >
            {renderedDockContent}
          </nav>
        </NavDockContext.Provider>
      </MotionConfig>
    );
  },
);

NavDock.displayName = "NavDock";

export const NavDockList = forwardRef<HTMLUListElement, NavDockListProps>(
  (
    {
      className,
      id,
      onKeyDown,
      onPointerLeave,
      onPointerMove,
      role = "list",
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const listRef = useRef<HTMLUListElement | null>(null);
    const [overflowing, setOverflowing] = useState(false);
    const renderedListId = id ?? context.listId;
    const orientation = getNavDockOrientation(context.placement);
    const overflowAxis = getNavDockOverflowAxis(context.placement);
    const pointerPosition = useMotionValue(navDockPointerIdle);
    const listContext = useMemo<NavDockListContextValue>(
      () => ({ overflowing, pointerPosition }),
      [overflowing, pointerPosition],
    );
    useEffect(() => {
      const list = listRef.current;

      if (!list) {
        return undefined;
      }

      const measureOverflow = () => {
        const nextOverflowing =
          orientation === "horizontal"
            ? list.scrollWidth > list.clientWidth + 1
            : list.scrollHeight > list.clientHeight + 1;

        setOverflowing(nextOverflowing);
      };

      measureOverflow();

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(measureOverflow);

        observer.observe(list);

        return () => {
          observer.disconnect();
        };
      }

      window.addEventListener("resize", measureOverflow);

      return () => {
        window.removeEventListener("resize", measureOverflow);
      };
    }, [context.itemValues.length, orientation]);
    useIsomorphicLayoutEffect(
      () => context.registerListId(renderedListId),
      [context.registerListId, renderedListId],
    );
    const handleKeyDown: KeyboardEventHandler<HTMLUListElement> = (event) => {
      onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (
        event.target instanceof Element &&
        event.target.closest('[data-slot="navdock-submenu-content"]')
      ) {
        return;
      }

      let handled = false;

      if (event.key === "Home") {
        handled = focusNavDockItemAtIndex(event.currentTarget, 0);
      } else if (event.key === "End") {
        handled = focusNavDockItemAtIndex(
          event.currentTarget,
          getNavDockFocusableItems(event.currentTarget).length - 1,
        );
      } else if (orientation === "horizontal") {
        const direction = getNavDockElementDirection(event.currentTarget);

        if (event.key === "ArrowRight") {
          handled = focusNavDockItemByOffset({
            list: event.currentTarget,
            offset: direction === "rtl" ? -1 : 1,
            target: event.target,
          });
        } else if (event.key === "ArrowLeft") {
          handled = focusNavDockItemByOffset({
            list: event.currentTarget,
            offset: direction === "rtl" ? 1 : -1,
            target: event.target,
          });
        }
      } else if (event.key === "ArrowDown") {
        handled = focusNavDockItemByOffset({
          list: event.currentTarget,
          offset: 1,
          target: event.target,
        });
      } else if (event.key === "ArrowUp") {
        handled = focusNavDockItemByOffset({
          list: event.currentTarget,
          offset: -1,
          target: event.target,
        });
      }

      if (handled) {
        event.preventDefault();
      }
    };
    const handlePointerMove: PointerEventHandler<HTMLUListElement> = (
      event,
    ) => {
      onPointerMove?.(event);

      // Touch input has no hover; magnifying under a finger just obscures it.
      if (event.pointerType !== "touch") {
        pointerPosition.set(
          orientation === "horizontal" ? event.clientX : event.clientY,
        );
      }
    };
    const handlePointerLeave: PointerEventHandler<HTMLUListElement> = (
      event,
    ) => {
      onPointerLeave?.(event);
      pointerPosition.set(navDockPointerIdle);
    };

    return (
      <NavDockListContext.Provider value={listContext}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Keyboard and pointer events delegate to the dock’s focusable links and buttons. */}
        <ul
          {...props}
          ref={composeRefs(ref, listRef)}
          id={renderedListId}
          role={role}
          data-slot="navdock-list"
          data-placement={context.placement}
          data-position={context.position}
          data-variant={context.variant}
          data-size={context.size}
          data-orientation={orientation}
          data-overflow-axis={overflowAxis}
          data-overflowing={overflowing ? "true" : undefined}
          data-motion={context.motion}
          className={navDockListClassNames({
            placement: context.placement,
            overflowing,
            className: cn(
              context.collapseModeActive && context.showTitle === "never"
                ? navDockCollapsedListClasses
                : undefined,
              className,
            ),
          })}
          onKeyDown={handleKeyDown}
          onPointerLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
        />
      </NavDockListContext.Provider>
    );
  },
);

NavDockList.displayName = "NavDockList";

export const NavDockSeparator = forwardRef<
  HTMLLIElement,
  NavDockSeparatorProps
>(
  (
    {
      "aria-hidden": ariaHidden = true,
      className,
      role = "presentation",
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const orientation =
      context.placement === "left" || context.placement === "right"
        ? "horizontal"
        : "vertical";

    return (
      <li
        {...props}
        ref={ref}
        aria-hidden={ariaHidden}
        role={role}
        data-slot="navdock-separator"
        data-orientation={orientation}
        data-placement={context.placement}
        className={navDockSeparatorClassNames({
          placement: context.placement,
          className,
        })}
      />
    );
  },
);

NavDockSeparator.displayName = "NavDockSeparator";

export const NavDockDivider = NavDockSeparator;

export const NavDockItem = forwardRef<HTMLLIElement, NavDockItemProps>(
  (
    {
      children,
      className,
      disabled,
      disabledReason,
      icon,
      onBlur,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      title,
      value,
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const isActive = value !== undefined && context.activeValue === value;
    const motionState = getNavDockItemMotionState({
      activeValue: context.activeValue,
      itemValues: context.itemValues,
      value,
    });
    const registerItemValue = context.registerItemValue;

    const handleActivate = useCallback(() => {
      if (value !== undefined && !disabled) {
        context.setActiveValue(value);
      }
    }, [context, disabled, value]);
    const handleDeactivate = useCallback(() => {
      if (value !== undefined && context.activeValue === value) {
        context.setActiveValue(null);
      }
    }, [context, value]);
    const handleBlur: FocusEventHandler<HTMLLIElement> = (event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        handleDeactivate();
      }
    };
    const handleFocus: FocusEventHandler<HTMLLIElement> = (event) => {
      handleActivate();
      scrollNavDockItemIntoView(event.currentTarget);
    };
    useEffect(() => {
      if (value === undefined || registerItemValue === undefined) {
        return undefined;
      }

      return registerItemValue(value);
    }, [registerItemValue, value]);
    const itemContext = useMemo<NavDockItemContextValue>(
      () => ({ disabled, disabledReason, icon, motionState, title, value }),
      [disabled, disabledReason, icon, motionState, title, value],
    );

    return (
      <NavDockItemContext.Provider value={itemContext}>
        <li
          {...props}
          ref={ref}
          data-slot="navdock-item"
          data-value={value}
          data-active={isActive ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-motion-state={motionState}
          className={navDockItemClassNames({ className })}
          onBlur={composeFocusHandlers(handleBlur, onBlur)}
          onFocus={composeFocusHandlers(handleFocus, onFocus)}
          onMouseEnter={(event) => {
            handleActivate();
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            handleDeactivate();
            onMouseLeave?.(event);
          }}
        >
          {children}
        </li>
      </NavDockItemContext.Provider>
    );
  },
);

NavDockItem.displayName = "NavDockItem";

export const NavDockLink = forwardRef<HTMLAnchorElement, NavDockLinkProps>(
  (
    {
      "aria-current": ariaCurrent,
      "aria-describedby": ariaDescribedBy,
      asChild = false,
      badge,
      children,
      className,
      current,
      description,
      disabled,
      disabledReason,
      external = false,
      href,
      icon,
      onClick,
      rel,
      style,
      target,
      title,
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const item = useNavDockItemContext();
    const listContext = useNavDockListContext();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(
      null,
    );
    const interactiveRef = useCallback(
      (node: HTMLElement | null) => setAnchorElement(node),
      [],
    );
    const prefersReducedMotion = useReducedMotion();
    const resolvedDisabled = disabled ?? item?.disabled ?? false;
    const reducedMotion = shouldReduceNavDockMotion(
      context.motion,
      prefersReducedMotion,
    );
    const resolvedDisabledReason = disabledReason ?? item?.disabledReason;
    const disabledReasonId = useId();
    const resolvedDisabledReasonId =
      resolvedDisabled && resolvedDisabledReason !== undefined
        ? disabledReasonId
        : undefined;
    const resolvedTitle = title ?? item?.title;
    const resolvedIcon = icon ?? item?.icon;
    const resolvedCurrent =
      current ??
      (item?.value !== undefined && context.currentValue === item.value
        ? true
        : undefined);
    const resolvedAriaCurrent = resolveAriaCurrent(
      ariaCurrent,
      resolvedCurrent,
    );
    const isCurrent = hasCurrentState(resolvedAriaCurrent);
    const isActive =
      item?.value !== undefined && context.activeValue === item.value;
    const motionState = item?.motionState ?? "idle";
    const resolvedTarget = target ?? (external ? "_blank" : undefined);
    const resolvedRel = mergeRelForTarget(
      rel ?? (external ? "noreferrer" : undefined),
      resolvedTarget,
    );
    const classes = navDockLinkClassNames({
      placement: context.placement,
      className,
    });
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (resolvedDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
    };
    const content = getInteractiveContent({
      active: isActive,
      anchorElement,
      badge,
      children: asChild ? undefined : children,
      description,
      disabled: resolvedDisabled,
      external,
      icon: resolvedIcon,
      motion: context.motion,
      motionState,
      placement: context.placement,
      portalledLayer: listContext?.overflowing ?? false,
      reducedMotion,
      showTitle: context.showTitle,
      title: resolvedTitle,
    });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<NavDockLinkSlotProps>(child)) {
        throw new Error(
          "NavDockLink with asChild expects a single React element child.",
        );
      }

      const childTarget = child.props.target ?? resolvedTarget;
      const childRel = mergeRelForTarget(
        child.props.rel ?? resolvedRel,
        childTarget,
      );
      const childAriaCurrent =
        child.props["aria-current"] ?? resolvedAriaCurrent;
      const childDescribedBy = getDescribedBy(
        child.props["aria-describedby"] ?? ariaDescribedBy,
        resolvedDisabledReasonId,
      );
      const clonedProps: NavDockLinkSlotProps = {
        ...props,
        ...child.props,
        ref: (node) => {
          composeRefs(
            ref as Ref<HTMLElement>,
            getChildRef(child),
            interactiveRef,
          )(node);
        },
        "aria-current": childAriaCurrent,
        "aria-describedby": childDescribedBy,
        "aria-disabled": resolvedDisabled ? true : child.props["aria-disabled"],
        className: cn(classes, child.props.className),
        "data-active": isActive ? "true" : undefined,
        "data-current": hasCurrentState(childAriaCurrent) ? "true" : undefined,
        "data-disabled": resolvedDisabled ? "true" : undefined,
        "data-external": external ? "true" : undefined,
        "data-motion": context.motion,
        "data-motion-state": motionState,
        "data-placement": context.placement,
        "data-reduced-motion": reducedMotion ? "true" : undefined,
        "data-size": context.size,
        "data-slot": "navdock-link",
        "data-variant": context.variant,
        onClick: composeClickHandlers(handleClick, child.props.onClick),
        tabIndex: resolvedDisabled ? -1 : child.props.tabIndex,
      };

      if (child.props.href !== undefined || href !== undefined) {
        clonedProps.href = child.props.href ?? href;
      }

      if (childTarget !== undefined) {
        clonedProps.target = childTarget;
      }

      if (childRel !== undefined) {
        clonedProps.rel = childRel;
      }

      return (
        <>
          {/* eslint-disable-next-line react-hooks/refs -- React forwards this ref during commit; createElement/cloneElement does not read ref.current. */}
          {cloneElement(child, clonedProps, content)}
          <DisabledReason
            id={resolvedDisabledReasonId}
            reason={resolvedDisabledReason}
          />
        </>
      );
    }

    const nativeProps = props as NativeNavDockAnchorProps;

    return (
      <>
        <motionElement.a
          {...nativeProps}
          ref={composeRefs(
            ref as Ref<HTMLAnchorElement>,
            interactiveRef as Ref<HTMLAnchorElement>,
          )}
          aria-current={resolvedAriaCurrent}
          aria-describedby={getDescribedBy(
            ariaDescribedBy,
            resolvedDisabledReasonId,
          )}
          aria-disabled={resolvedDisabled ? true : undefined}
          data-slot="navdock-link"
          data-active={isActive ? "true" : undefined}
          data-current={isCurrent ? "true" : undefined}
          data-disabled={resolvedDisabled ? "true" : undefined}
          data-external={external ? "true" : undefined}
          data-motion={context.motion}
          data-motion-state={motionState}
          data-placement={context.placement}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          data-size={context.size}
          href={href}
          rel={resolvedRel}
          tabIndex={resolvedDisabled ? -1 : nativeProps.tabIndex}
          target={resolvedTarget}
          data-variant={context.variant}
          style={style}
          className={classes}
          onClick={handleClick}
        >
          {content}
        </motionElement.a>
        <DisabledReason
          id={resolvedDisabledReasonId}
          reason={resolvedDisabledReason}
        />
      </>
    );
  },
);

NavDockLink.displayName = "NavDockLink";

export const NavDockButton = forwardRef<HTMLButtonElement, NavDockButtonProps>(
  (
    {
      "aria-current": ariaCurrent,
      "aria-describedby": ariaDescribedBy,
      badge,
      children,
      className,
      current,
      description,
      disabled,
      disabledReason,
      icon,
      onAction,
      onClick,
      style,
      title,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const item = useNavDockItemContext();
    const listContext = useNavDockListContext();
    const [anchorElement, setAnchorElement] =
      useState<HTMLButtonElement | null>(null);
    const interactiveRef = useCallback(
      (node: HTMLButtonElement | null) => setAnchorElement(node),
      [],
    );
    const prefersReducedMotion = useReducedMotion();
    const resolvedDisabled = disabled ?? item?.disabled ?? false;
    const reducedMotion = shouldReduceNavDockMotion(
      context.motion,
      prefersReducedMotion,
    );
    const resolvedDisabledReason = disabledReason ?? item?.disabledReason;
    const disabledReasonId = useId();
    const resolvedDisabledReasonId =
      resolvedDisabled && resolvedDisabledReason !== undefined
        ? disabledReasonId
        : undefined;
    const resolvedTitle = title ?? item?.title;
    const resolvedIcon = icon ?? item?.icon;
    const resolvedCurrent =
      current ??
      (item?.value !== undefined && context.currentValue === item.value
        ? true
        : undefined);
    // Buttons switch local panels, not pages, so a plain `true` stays `"true"`.
    const resolvedAriaCurrent =
      ariaCurrent ??
      (resolvedCurrent === true
        ? "true"
        : resolvedCurrent === "page" || resolvedCurrent === "location"
          ? resolvedCurrent
          : undefined);
    const isCurrent = hasCurrentState(resolvedAriaCurrent);
    const isActive =
      item?.value !== undefined && context.activeValue === item.value;
    const motionState = item?.motionState ?? "idle";
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (resolvedDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);

      if (!event.defaultPrevented) {
        onAction?.();
      }
    };

    return (
      <>
        <motionElement.button
          {...props}
          ref={composeRefs(ref, interactiveRef)}
          type={type}
          disabled={resolvedDisabled}
          aria-current={resolvedAriaCurrent}
          aria-describedby={getDescribedBy(
            ariaDescribedBy,
            resolvedDisabledReasonId,
          )}
          data-slot="navdock-button"
          data-active={isActive ? "true" : undefined}
          data-current={isCurrent ? "true" : undefined}
          data-disabled={resolvedDisabled ? "true" : undefined}
          data-motion={context.motion}
          data-motion-state={motionState}
          data-placement={context.placement}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          data-size={context.size}
          data-variant={context.variant}
          style={style}
          className={navDockButtonClassNames({
            placement: context.placement,
            className,
          })}
          onClick={handleClick}
        >
          {getInteractiveContent({
            active: isActive,
            anchorElement,
            badge,
            children,
            description,
            disabled: resolvedDisabled,
            icon: resolvedIcon,
            motion: context.motion,
            motionState,
            placement: context.placement,
            portalledLayer: listContext?.overflowing ?? false,
            reducedMotion,
            showTitle: context.showTitle,
            title: resolvedTitle,
          })}
        </motionElement.button>
        <DisabledReason
          id={resolvedDisabledReasonId}
          reason={resolvedDisabledReason}
        />
      </>
    );
  },
);

NavDockButton.displayName = "NavDockButton";

export const NavDockSubmenu = forwardRef<HTMLDivElement, NavDockSubmenuProps>(
  (
    {
      children,
      className,
      onBlur,
      onFocus,
      onKeyDown,
      onMouseEnter,
      onMouseLeave,
      onPointerDownCapture,
      value,
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const item = useNavDockItemContext();
    const submenuValue = value ?? item?.value;
    const disabled = item?.disabled ?? false;
    const contentId = useId();
    const triggerId = useId();
    const suppressFocusOpenRef = useRef(false);
    const closeTimerRef = useRef<number | null>(null);
    const hoverOpenClickGuardRef = useRef(false);
    const hoverOpenClickGuardTimerRef = useRef<number | null>(null);
    const [triggerElement, setTriggerElement] =
      useState<HTMLButtonElement | null>(null);
    const [contentElement, setContentElement] = useState<HTMLDivElement | null>(
      null,
    );
    const open =
      submenuValue !== undefined && context.openValue === submenuValue;
    const setOpen = useCallback(
      (nextOpen: boolean) => {
        if (submenuValue === undefined || disabled) {
          return;
        }

        context.setOpenValue(nextOpen ? submenuValue : null);
      },
      [context, disabled, submenuValue],
    );
    const cancelClose = useCallback(() => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, []);
    const scheduleClose = useCallback(() => {
      cancelClose();
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setOpen(false);
      }, 180);
    }, [cancelClose, setOpen]);
    const clearHoverOpenClickGuard = useCallback(() => {
      hoverOpenClickGuardRef.current = false;

      if (hoverOpenClickGuardTimerRef.current !== null) {
        window.clearTimeout(hoverOpenClickGuardTimerRef.current);
        hoverOpenClickGuardTimerRef.current = null;
      }
    }, []);
    const markHoverOpenClickGuard = useCallback(() => {
      clearHoverOpenClickGuard();
      hoverOpenClickGuardRef.current = true;
      hoverOpenClickGuardTimerRef.current = window.setTimeout(() => {
        hoverOpenClickGuardRef.current = false;
        hoverOpenClickGuardTimerRef.current = null;
      }, 300);
    }, [clearHoverOpenClickGuard]);
    const consumeHoverOpenClickGuard = useCallback(() => {
      const shouldGuardClick = hoverOpenClickGuardRef.current;

      clearHoverOpenClickGuard();

      return shouldGuardClick;
    }, [clearHoverOpenClickGuard]);
    const submenuContext = useMemo<NavDockSubmenuContextValue>(
      () => ({
        cancelClose,
        contentElement,
        contentId,
        consumeHoverOpenClickGuard,
        open,
        scheduleClose,
        setContentElement,
        setOpen,
        setTriggerElement,
        triggerElement,
        triggerId,
        value: submenuValue,
      }),
      [
        cancelClose,
        contentElement,
        contentId,
        consumeHoverOpenClickGuard,
        open,
        scheduleClose,
        setOpen,
        triggerElement,
        triggerId,
        submenuValue,
      ],
    );
    useEffect(
      () => () => {
        cancelClose();
        clearHoverOpenClickGuard();
      },
      [cancelClose, clearHoverOpenClickGuard],
    );
    const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
      onBlur?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const nextFocused = event.relatedTarget as Node | null;

      if (
        !nextFocused ||
        (!event.currentTarget.contains(nextFocused) &&
          !contentElement?.contains(nextFocused))
      ) {
        setOpen(false);
      }
    };
    const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
      cancelClose();

      if (!suppressFocusOpenRef.current) {
        setOpen(true);
      }

      onFocus?.(event);
    };
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape" && open) {
        suppressFocusOpenRef.current = true;
        setOpen(false);
        triggerElement?.focus();
        window.setTimeout(() => {
          suppressFocusOpenRef.current = false;
        }, 0);
        event.preventDefault();
      }
    };

    return (
      <NavDockSubmenuContext.Provider value={submenuContext}>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Keyboard and pointer events delegate to the dock’s focusable links and buttons. */}
        <div
          {...props}
          ref={ref}
          data-slot="navdock-submenu"
          data-state={open ? "open" : "closed"}
          data-open={open ? "true" : undefined}
          data-value={submenuValue}
          className={navDockSubmenuClassNames({ className })}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onPointerDownCapture={(event) => {
            suppressFocusOpenRef.current = true;
            window.setTimeout(() => {
              suppressFocusOpenRef.current = false;
            }, 200);
            onPointerDownCapture?.(event);
          }}
          onMouseEnter={(event) => {
            const wasClosed = !open;

            cancelClose();
            setOpen(true);

            if (wasClosed && !disabled) {
              markHoverOpenClickGuard();
            }

            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            clearHoverOpenClickGuard();
            scheduleClose();
            onMouseLeave?.(event);
          }}
        >
          {children}
        </div>
      </NavDockSubmenuContext.Provider>
    );
  },
);

NavDockSubmenu.displayName = "NavDockSubmenu";

export const NavDockSubmenuTrigger = forwardRef<
  HTMLButtonElement,
  NavDockSubmenuTriggerProps
>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      badge,
      children,
      className,
      description,
      disabled,
      disabledReason,
      icon,
      id,
      onClick,
      onPointerDown,
      style,
      title,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const item = useNavDockItemContext();
    const listContext = useNavDockListContext();
    const submenu = useNavDockSubmenuContext();
    const [anchorElement, setAnchorElement] =
      useState<HTMLButtonElement | null>(null);
    const interactiveRef = useCallback(
      (node: HTMLButtonElement | null) => setAnchorElement(node),
      [],
    );
    const prefersReducedMotion = useReducedMotion();
    const resolvedDisabled = disabled ?? item?.disabled ?? false;
    const reducedMotion = shouldReduceNavDockMotion(
      context.motion,
      prefersReducedMotion,
    );
    const resolvedDisabledReason = disabledReason ?? item?.disabledReason;
    const disabledReasonId = useId();
    const resolvedDisabledReasonId =
      resolvedDisabled && resolvedDisabledReason !== undefined
        ? disabledReasonId
        : undefined;
    const resolvedTitle = title ?? item?.title;
    const resolvedIcon = icon ?? item?.icon;
    const isActive =
      item?.value !== undefined && context.activeValue === item.value;
    const motionState = item?.motionState ?? "idle";
    const triggerId = id ?? submenu.triggerId;
    const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (
      event,
    ) => {
      onPointerDown?.(event);
    };
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (resolvedDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);

      if (!event.defaultPrevented) {
        if (submenu.open && submenu.consumeHoverOpenClickGuard()) {
          submenu.setOpen(true);
          return;
        }

        submenu.setOpen(!submenu.open);
      }
    };

    return (
      <>
        <motionElement.button
          {...props}
          ref={composeRefs(ref, submenu.setTriggerElement, interactiveRef)}
          id={triggerId}
          type={type}
          disabled={resolvedDisabled}
          aria-controls={submenu.open ? submenu.contentId : undefined}
          aria-describedby={getDescribedBy(
            ariaDescribedBy,
            resolvedDisabledReasonId,
          )}
          aria-expanded={submenu.open}
          data-slot="navdock-submenu-trigger"
          data-active={isActive ? "true" : undefined}
          data-disabled={resolvedDisabled ? "true" : undefined}
          data-motion={context.motion}
          data-motion-state={motionState}
          data-placement={context.placement}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          data-size={context.size}
          data-state={submenu.open ? "open" : "closed"}
          data-variant={context.variant}
          style={style}
          className={navDockSubmenuTriggerClassNames({
            placement: context.placement,
            className,
          })}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
        >
          {getInteractiveContent({
            active: isActive,
            anchorElement,
            badge,
            children,
            description,
            disabled: resolvedDisabled,
            icon: resolvedIcon,
            motion: context.motion,
            motionState,
            placement: context.placement,
            portalledLayer: listContext?.overflowing ?? false,
            reducedMotion,
            showTitle: context.showTitle,
            title: resolvedTitle,
          })}
        </motionElement.button>
        <DisabledReason
          id={resolvedDisabledReasonId}
          reason={resolvedDisabledReason}
        />
      </>
    );
  },
);

NavDockSubmenuTrigger.displayName = "NavDockSubmenuTrigger";

export const NavDockSubmenuContent = forwardRef<
  HTMLDivElement,
  NavDockSubmenuContentProps
>(
  (
    {
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      id,
      onBlur,
      onClick,
      onMouseEnter,
      onMouseLeave,
      panelClassName,
      role = "group",
      ...props
    },
    ref,
  ) => {
    const context = useNavDockContext();
    const listContext = useNavDockListContext();
    const submenu = useNavDockSubmenuContext();
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion = shouldReduceNavDockMotion(
      context.motion,
      prefersReducedMotion,
    );
    const portalled = Boolean(
      listContext?.overflowing && submenu.triggerElement,
    );
    const portalTarget = portalled ? getPortalTarget() : null;
    const portalledStyle = useAnchoredLayerStyle({
      anchorElement: submenu.triggerElement,
      fallbackOffset: 16,
      open: submenu.open && portalled,
      placement: context.placement,
      variableName: "--navdock-submenu-offset",
    });
    const shouldPortal = Boolean(portalled && portalTarget);
    const resolvedPortalledStyle = portalledStyle ?? { left: 0, top: 0 };
    const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactive = target.closest("a,button");

      if (interactive && event.currentTarget.contains(interactive)) {
        submenu.setOpen(false);
      }
    };
    const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
      onBlur?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const nextFocused = event.relatedTarget as Node | null;

      if (
        !nextFocused ||
        (!event.currentTarget.contains(nextFocused) &&
          !submenu.triggerElement?.contains(nextFocused))
      ) {
        submenu.setOpen(false);
      }
    };
    const handleMouseEnter: MouseEventHandler<HTMLDivElement> = (event) => {
      submenu.cancelClose();
      onMouseEnter?.(event);
    };
    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
      submenu.scheduleClose();
      onMouseLeave?.(event);
    };
    const contentNode = (
      <motionElement.div
        {...props}
        ref={composeRefs(ref, submenu.setContentElement)}
        id={id ?? submenu.contentId}
        role={role}
        aria-labelledby={ariaLabelledBy ?? submenu.triggerId}
        data-slot="navdock-submenu-content"
        data-navdock-root={context.rootId}
        data-placement={context.placement}
        data-portalled={shouldPortal ? "true" : undefined}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        data-state="open"
        initial={
          shouldPortal
            ? { opacity: 0, scale: reducedMotion ? 1 : 0.96 }
            : getSubmenuClosedMotionState({
                placement: context.placement,
                reducedMotion,
              })
        }
        animate={
          shouldPortal ? { opacity: 1, scale: 1 } : getSubmenuOpenMotionState()
        }
        exit={
          shouldPortal
            ? {
                opacity: 0,
                scale: reducedMotion ? 1 : 0.96,
                transition: reducedMotion
                  ? navDockSubmenuTransitions.none
                  : navDockSubmenuExitTransition,
              }
            : {
                ...getSubmenuClosedMotionState({
                  placement: context.placement,
                  reducedMotion,
                }),
                transition: reducedMotion
                  ? navDockSubmenuTransitions.none
                  : navDockSubmenuExitTransition,
              }
        }
        transition={
          reducedMotion
            ? navDockSubmenuTransitions.none
            : navDockSubmenuTransitions[context.motion]
        }
        style={shouldPortal ? resolvedPortalledStyle : undefined}
        className={navDockSubmenuContentClassNames({
          placement: context.placement,
          portalled: shouldPortal,
          className,
        })}
        onBlur={handleBlur}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          data-slot="navdock-submenu-panel"
          className={cn(navDockSubmenuPanelClasses, panelClassName)}
        >
          {children}
        </div>
      </motionElement.div>
    );

    const contentPresence = (
      <AnimatePresence initial={false}>
        {submenu.open ? contentNode : null}
      </AnimatePresence>
    );

    return shouldPortal && portalTarget
      ? createPortal(contentPresence, portalTarget)
      : contentPresence;
  },
);

NavDockSubmenuContent.displayName = "NavDockSubmenuContent";

function renderSubmenuItemContent({
  badge,
  description,
  external,
  title,
}: {
  badge?: ReactNode;
  description?: ReactNode;
  external?: boolean;
  title: ReactNode;
}) {
  return (
    <>
      <span
        data-slot="navdock-submenu-item-text"
        className={navDockSubmenuItemTextClasses}
      >
        <span
          data-slot="navdock-submenu-item-label"
          className={navDockSubmenuItemLabelClasses}
        >
          {title}
        </span>
        {description !== undefined ? (
          <span
            data-slot="navdock-submenu-item-description"
            className={navDockSubmenuItemDescriptionClasses}
          >
            {description}
          </span>
        ) : null}
      </span>
      {badge !== undefined ? (
        <span
          aria-hidden="true"
          data-slot="navdock-submenu-item-badge"
          className={navDockSubmenuItemBadgeClasses}
        >
          {badge}
        </span>
      ) : external ? (
        <span
          aria-hidden="true"
          data-slot="navdock-submenu-item-external"
          className={navDockSubmenuItemExternalClasses}
        >
          ext
        </span>
      ) : null}
    </>
  );
}

function renderNavDockSubmenuChildData(item: NavDockSubmenuChildData) {
  if (item.kind === "separator") {
    return (
      <div
        key={item.value}
        aria-hidden="true"
        role="presentation"
        data-slot="navdock-submenu-separator"
        className={navDockSubmenuSeparatorClasses}
      />
    );
  }

  if (item.kind === "label") {
    return (
      <div
        key={item.value}
        data-slot="navdock-submenu-label"
        className={navDockSubmenuLabelClasses}
      >
        {item.title}
      </div>
    );
  }

  if (item.kind === "action") {
    return (
      <button
        key={item.value}
        type="button"
        disabled={item.disabled}
        data-slot="navdock-submenu-action"
        data-disabled={item.disabled ? "true" : undefined}
        className={navDockSubmenuItemClasses}
        onClick={() => {
          if (!item.disabled) {
            item.onAction();
          }
        }}
      >
        {renderSubmenuItemContent({
          badge: item.badge,
          description: item.description ?? item.disabledReason,
          title: item.title,
        })}
      </button>
    );
  }

  const target = item.target ?? (item.external ? "_blank" : undefined);
  const rel = mergeRelForTarget(
    item.rel ?? (item.external ? "noreferrer" : undefined),
    target,
  );

  return (
    <a
      key={item.value}
      aria-current={item.ariaCurrent}
      aria-disabled={item.disabled ? true : undefined}
      data-slot="navdock-submenu-link"
      data-current={hasCurrentState(item.ariaCurrent) ? "true" : undefined}
      data-disabled={item.disabled ? "true" : undefined}
      data-external={item.external ? "true" : undefined}
      href={item.href}
      rel={rel}
      tabIndex={item.disabled ? -1 : undefined}
      target={target}
      className={navDockSubmenuItemClasses}
      onClick={(event) => {
        if (item.disabled) {
          event.preventDefault();
        }
      }}
    >
      {renderSubmenuItemContent({
        badge: item.badge,
        description: item.description ?? item.disabledReason,
        external: item.external,
        title: item.title,
      })}
    </a>
  );
}

function renderNavDockItemData(
  item: NavDockItemData,
  { current }: { current?: NavDockCurrent },
) {
  assertValidItemRole(item);

  if ("href" in item && item.href !== undefined) {
    return (
      <NavDockItem
        key={item.value}
        disabled={item.disabled}
        disabledReason={item.disabledReason}
        icon={item.icon}
        title={item.title}
        value={item.value}
      >
        <NavDockLink
          aria-current={item.ariaCurrent}
          badge={item.badge}
          current={current}
          description={item.description}
          disabled={item.disabled}
          disabledReason={item.disabledReason}
          external={item.external}
          href={item.href}
          rel={item.rel}
          target={item.target}
        />
      </NavDockItem>
    );
  }

  if ("onAction" in item && item.onAction !== undefined) {
    return (
      <NavDockItem
        key={item.value}
        disabled={item.disabled}
        disabledReason={item.disabledReason}
        icon={item.icon}
        title={item.title}
        value={item.value}
      >
        <NavDockButton
          badge={item.badge}
          current={current}
          description={item.description}
          disabled={item.disabled}
          disabledReason={item.disabledReason}
          onAction={() => item.onAction(item)}
        />
      </NavDockItem>
    );
  }

  return (
    <NavDockItem
      key={item.value}
      disabled={item.disabled}
      disabledReason={item.disabledReason}
      icon={item.icon}
      title={item.title}
      value={item.value}
    >
      <NavDockSubmenu>
        <NavDockSubmenuTrigger
          badge={item.badge}
          description={item.description}
          disabled={item.disabled}
          disabledReason={item.disabledReason}
        />
        <NavDockSubmenuContent>
          {item.submenu.map(renderNavDockSubmenuChildData)}
        </NavDockSubmenuContent>
      </NavDockSubmenu>
    </NavDockItem>
  );
}

export const __navDockTestUtils = {
  getItemRoleCount,
};
