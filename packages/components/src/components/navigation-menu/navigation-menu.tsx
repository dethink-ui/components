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
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type FocusEventHandler,
  type ForwardedRef,
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
import { cn } from "../../utils/cn";

export type NavigationMenuVariant = "default" | "quiet" | "underline";

export type NavigationMenuSize = "sm" | "md" | "lg";

export type NavigationMenuOrientation = "horizontal" | "vertical";

export type NavigationMenuCurrent = boolean | "page" | "location";

export type NavigationMenuActivationMode =
  | "click"
  | "hover"
  | "focus"
  | "manual";

export interface NavigationMenuProps
  extends Omit<HTMLAttributes<HTMLElement>, "defaultValue"> {
  variant?: NavigationMenuVariant;
  size?: NavigationMenuSize;
  orientation?: NavigationMenuOrientation;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  activationMode?: NavigationMenuActivationMode;
  delay?: number;
  closeDelay?: number;
}

export type NavigationMenuListProps = HTMLAttributes<HTMLUListElement>;

export interface NavigationMenuItemProps
  extends LiHTMLAttributes<HTMLLIElement> {
  value?: string;
}

export interface NavigationMenuTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  showChevron?: boolean;
}

export type NavigationMenuContentProps = HTMLAttributes<HTMLDivElement>;

export type NavigationMenuViewportProps = HTMLAttributes<HTMLDivElement>;

export type NavigationMenuSectionProps = HTMLAttributes<HTMLDivElement>;

export type NavigationMenuLabelProps = HTMLAttributes<HTMLDivElement>;

export type NavigationMenuDescriptionProps =
  HTMLAttributes<HTMLParagraphElement>;

export interface NavigationMenuSeparatorProps
  extends HTMLAttributes<HTMLDivElement> {
  orientation?: NavigationMenuOrientation;
}

type NavigationMenuLinkBaseProps = {
  asChild?: boolean;
  current?: NavigationMenuCurrent;
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
};

type NativeNavigationMenuLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  NavigationMenuLinkBaseProps & {
    asChild?: false;
    href: string;
    children: ReactNode;
  };

type ChildNavigationMenuLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  NavigationMenuLinkBaseProps & {
    asChild: true;
    href?: string;
    children: ReactElement<NavigationMenuLinkSlotProps>;
  };

export type NavigationMenuLinkProps =
  | NativeNavigationMenuLinkProps
  | ChildNavigationMenuLinkProps;

type NavigationMenuFeaturedItemBaseProps = {
  asChild?: boolean;
  disabled?: boolean;
  external?: boolean;
};

type NativeNavigationMenuFeaturedItemProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  NavigationMenuFeaturedItemBaseProps & {
    asChild?: false;
    href: string;
    children: ReactNode;
  };

type ChildNavigationMenuFeaturedItemProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  NavigationMenuFeaturedItemBaseProps & {
    asChild: true;
    href?: string;
    children: ReactElement<NavigationMenuLinkSlotProps>;
  };

export type NavigationMenuFeaturedItemProps =
  | NativeNavigationMenuFeaturedItemProps
  | ChildNavigationMenuFeaturedItemProps;

type NavigationMenuLinkSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  "aria-current"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  "aria-disabled"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-disabled"];
};

type NavigationMenuContextValue = {
  variant: NavigationMenuVariant;
  size: NavigationMenuSize;
  orientation: NavigationMenuOrientation;
  activationMode: NavigationMenuActivationMode;
  openValue: string | null;
  open: (value: string) => void;
  close: () => void;
  toggle: (value: string) => void;
  scheduleOpen: (value: string) => void;
  scheduleClose: () => void;
  cancelScheduledOpen: () => void;
  cancelScheduledClose: () => void;
  registerTrigger: (value: string, element: HTMLButtonElement | null) => void;
  viewportElement: HTMLDivElement | null;
  setViewportElement: (element: HTMLDivElement | null) => void;
};

const defaultNavigationMenuContext: NavigationMenuContextValue = {
  variant: "default",
  size: "md",
  orientation: "horizontal",
  activationMode: "click",
  openValue: null,
  open: () => undefined,
  close: () => undefined,
  toggle: () => undefined,
  scheduleOpen: () => undefined,
  scheduleClose: () => undefined,
  cancelScheduledOpen: () => undefined,
  cancelScheduledClose: () => undefined,
  registerTrigger: () => undefined,
  viewportElement: null,
  setViewportElement: () => undefined,
};

const NavigationMenuContext = createContext<NavigationMenuContextValue>(
  defaultNavigationMenuContext,
);

function useNavigationMenuContext() {
  return useContext(NavigationMenuContext);
}

type NavigationMenuItemContextValue = {
  value: string;
  contentId: string;
  open: boolean;
};

const NavigationMenuItemContext =
  createContext<NavigationMenuItemContextValue | null>(null);

const NavigationMenuPanelContext = createContext(false);

const navigationMenuBaseClasses = "relative max-w-full";

const navigationMenuOrientationClasses: Record<
  NavigationMenuOrientation,
  string
> = {
  horizontal: "flex items-center",
  vertical: "flex flex-col items-stretch",
};

const navigationMenuListBaseClasses =
  "m-0 flex list-none gap-[var(--dt-space-1)] p-0";

const navigationMenuListOrientationClasses: Record<
  NavigationMenuOrientation,
  string
> = {
  horizontal: "flex-row items-center",
  vertical: "w-full flex-col items-stretch",
};

const navigationMenuItemBaseClasses = "relative flex";

const navigationMenuLinkBaseClasses =
  "relative inline-flex select-none items-center gap-[var(--dt-space-2)] whitespace-nowrap text-start font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

const navigationMenuLinkVariantClasses: Record<NavigationMenuVariant, string> =
  {
    default:
      "rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 data-[current=true]:bg-muted data-[current=true]:font-semibold data-[current=true]:text-foreground",
    quiet:
      "rounded-md text-muted-foreground hover:text-foreground active:text-foreground data-[current=true]:font-semibold data-[current=true]:text-foreground",
    underline:
      "rounded-none border-b-2 border-transparent text-muted-foreground hover:border-border hover:text-foreground data-[current=true]:border-primary data-[current=true]:text-foreground",
  };

const navigationMenuLinkSizeClasses: Record<NavigationMenuSize, string> = {
  sm: "h-8 px-[var(--dt-space-2)] text-sm",
  md: "h-density-control px-[var(--dt-space-3)] text-sm",
  lg: "h-11 px-[var(--dt-space-4)] text-base",
};

const navigationMenuPanelLinkBaseClasses =
  "relative flex w-full min-w-40 select-none items-start gap-[var(--dt-space-2)] rounded-sm px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-sm leading-5 font-medium text-foreground no-underline outline-none transition-colors hover:bg-muted active:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring data-[current=true]:bg-muted data-[current=true]:font-semibold data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

const navigationMenuLinkIconClasses =
  "mt-0.5 flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4";

const navigationMenuLinkTextClasses =
  "flex min-w-0 flex-col gap-[var(--dt-space-0-5)]";

const navigationMenuTriggerBaseClasses =
  "group/navigation-menu-trigger cursor-pointer border-transparent bg-transparent disabled:pointer-events-none disabled:opacity-50";

const navigationMenuTriggerVariantClasses: Record<
  NavigationMenuVariant,
  string
> = {
  default: "data-[state=open]:bg-muted data-[state=open]:text-foreground",
  quiet: "data-[state=open]:text-foreground",
  underline:
    "data-[state=open]:border-border data-[state=open]:text-foreground",
};

const navigationMenuTriggerChevronClasses =
  "size-3 shrink-0 transition-transform duration-200 group-data-[state=open]/navigation-menu-trigger:rotate-180 motion-reduce:transition-none";

const navigationMenuContentBaseClasses =
  "flex w-max min-w-48 max-w-[min(var(--dt-navigation-menu-content-max-width,40rem),calc(100vw_-_var(--dt-space-4)))] items-start gap-[var(--dt-space-4)] rounded-md border border-border bg-background p-[var(--dt-space-3)] text-foreground shadow-lg [--dt-overlay-motion-x:0px] [--dt-overlay-motion-y:calc(0px_-_var(--dt-space-1))] motion-safe:animate-overlay-in motion-reduce:animate-none";

const navigationMenuContentInlineClasses: Record<
  NavigationMenuOrientation,
  string
> = {
  horizontal: "absolute start-0 top-full z-50 mt-[var(--dt-space-2)]",
  vertical: "absolute start-full top-0 z-50 ms-[var(--dt-space-2)]",
};

const navigationMenuViewportBaseClasses =
  "absolute inset-x-0 top-full z-50 mt-[var(--dt-space-2)] flex justify-center data-[state=closed]:pointer-events-none";

const navigationMenuSectionBaseClasses =
  "flex min-w-40 flex-col gap-[var(--dt-space-0-5)]";

const navigationMenuLabelBaseClasses =
  "px-[var(--dt-space-2)] py-[var(--dt-space-1-5)] text-xs font-semibold uppercase tracking-normal text-muted-foreground";

const navigationMenuDescriptionBaseClasses =
  "text-xs font-normal leading-5 text-muted-foreground";

const navigationMenuSeparatorBaseClasses = "shrink-0 bg-border";

const navigationMenuSeparatorOrientationClasses: Record<
  NavigationMenuOrientation,
  string
> = {
  horizontal: "my-[var(--dt-space-1)] h-px w-full",
  vertical: "mx-[var(--dt-space-1)] w-px self-stretch",
};

const navigationMenuFeaturedItemBaseClasses =
  "relative flex min-h-28 w-56 select-none flex-col justify-end gap-[var(--dt-space-1)] overflow-hidden rounded-md border border-border bg-muted p-[var(--dt-space-3)] text-sm font-semibold text-foreground no-underline outline-none transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

export function navigationMenuClassNames({
  orientation = "horizontal",
  className,
}: Pick<NavigationMenuProps, "orientation" | "className"> = {}) {
  return cn(
    navigationMenuBaseClasses,
    navigationMenuOrientationClasses[orientation],
    className,
  );
}

export function navigationMenuListClassNames({
  orientation = "horizontal",
  className,
}: {
  orientation?: NavigationMenuOrientation;
  className?: string;
} = {}) {
  return cn(
    navigationMenuListBaseClasses,
    navigationMenuListOrientationClasses[orientation],
    className,
  );
}

export function navigationMenuItemClassNames({
  className,
}: Pick<NavigationMenuItemProps, "className"> = {}) {
  return cn(navigationMenuItemBaseClasses, className);
}

export function navigationMenuLinkClassNames({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: NavigationMenuVariant;
  size?: NavigationMenuSize;
  className?: string;
} = {}) {
  return cn(
    navigationMenuLinkBaseClasses,
    navigationMenuLinkSizeClasses[size],
    navigationMenuLinkVariantClasses[variant],
    className,
  );
}

export function navigationMenuPanelLinkClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(navigationMenuPanelLinkBaseClasses, className);
}

export function navigationMenuTriggerClassNames({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: NavigationMenuVariant;
  size?: NavigationMenuSize;
  className?: string;
} = {}) {
  return cn(
    navigationMenuLinkBaseClasses,
    navigationMenuLinkSizeClasses[size],
    navigationMenuLinkVariantClasses[variant],
    navigationMenuTriggerBaseClasses,
    navigationMenuTriggerVariantClasses[variant],
    className,
  );
}

export function navigationMenuContentClassNames({
  orientation = "horizontal",
  inline = true,
  className,
}: {
  orientation?: NavigationMenuOrientation;
  inline?: boolean;
  className?: string;
} = {}) {
  return cn(
    navigationMenuContentBaseClasses,
    inline && navigationMenuContentInlineClasses[orientation],
    className,
  );
}

export function navigationMenuViewportClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(navigationMenuViewportBaseClasses, className);
}

export function navigationMenuSectionClassNames({
  className,
}: Pick<NavigationMenuSectionProps, "className"> = {}) {
  return cn(navigationMenuSectionBaseClasses, className);
}

export function navigationMenuLabelClassNames({
  className,
}: Pick<NavigationMenuLabelProps, "className"> = {}) {
  return cn(navigationMenuLabelBaseClasses, className);
}

export function navigationMenuDescriptionClassNames({
  className,
}: Pick<NavigationMenuDescriptionProps, "className"> = {}) {
  return cn(navigationMenuDescriptionBaseClasses, className);
}

export function navigationMenuSeparatorClassNames({
  orientation = "horizontal",
  className,
}: Pick<NavigationMenuSeparatorProps, "orientation" | "className"> = {}) {
  return cn(
    navigationMenuSeparatorBaseClasses,
    navigationMenuSeparatorOrientationClasses[orientation],
    className,
  );
}

export function navigationMenuFeaturedItemClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(navigationMenuFeaturedItemBaseClasses, className);
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

function composeClickHandlers(
  componentHandler: MouseEventHandler<HTMLElement>,
  childHandler: MouseEventHandler<HTMLElement> | undefined,
) {
  return (event: React.MouseEvent<HTMLElement>) => {
    componentHandler(event);

    if (!event.defaultPrevented) {
      childHandler?.(event);
    }
  };
}

function getChildRef(child: ReactElement<NavigationMenuLinkSlotProps>) {
  return child.props.ref;
}

function mergeRel(
  rel: string | undefined,
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"] | undefined,
  external: boolean,
) {
  if (!external && target !== "_blank") {
    return rel;
  }

  const tokens = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");

  if (external) {
    tokens.add("noreferrer");
  }

  return Array.from(tokens).join(" ");
}

function resolveAriaCurrent(
  ariaCurrent: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"],
  current: NavigationMenuCurrent | undefined,
) {
  if (ariaCurrent !== undefined) {
    return ariaCurrent;
  }

  if (current === true) {
    return "page" as const;
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
    ariaCurrent !== undefined && ariaCurrent !== false && ariaCurrent !== "false"
  );
}

function renderLinkContent({
  children,
  icon,
  inPanel,
}: {
  children: ReactNode;
  icon: ReactNode;
  inPanel: boolean;
}) {
  if (!icon && !inPanel) {
    return children;
  }

  return (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          data-slot="navigation-menu-link-icon"
          className={navigationMenuLinkIconClasses}
        >
          {icon}
        </span>
      ) : null}
      {inPanel ? (
        <span
          data-slot="navigation-menu-link-text"
          className={navigationMenuLinkTextClasses}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </>
  );
}

function TriggerChevron() {
  return (
    <svg
      aria-hidden="true"
      data-slot="navigation-menu-trigger-icon"
      className={navigationMenuTriggerChevronClasses}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path
        d="m3 4.5 3 3 3-3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      activationMode = "click",
      children,
      className,
      closeDelay = 300,
      defaultValue = null,
      delay = 150,
      onBlur,
      onKeyDown,
      onPointerDown,
      onValueChange,
      orientation = "horizontal",
      size = "md",
      value,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
      defaultValue,
    );
    const isControlled = value !== undefined;
    const openValue = isControlled ? value : uncontrolledValue;
    const openValueRef = useRef(openValue);
    const rootRef = useRef<HTMLElement | null>(null);
    const triggerElementsRef = useRef(new Map<string, HTMLButtonElement>());
    const openTimerRef = useRef<number | null>(null);
    const closeTimerRef = useRef<number | null>(null);
    const pointerDownInsideRef = useRef(false);
    const [viewportElement, setViewportElement] =
      useState<HTMLDivElement | null>(null);

    useEffect(() => {
      openValueRef.current = openValue;
    }, [openValue]);

    const cancelScheduledOpen = useCallback(() => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    }, []);

    const cancelScheduledClose = useCallback(() => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, []);

    const setOpenValue = useCallback(
      (next: string | null) => {
        cancelScheduledOpen();
        cancelScheduledClose();

        if (next === openValueRef.current) {
          return;
        }

        openValueRef.current = next;

        if (!isControlled) {
          setUncontrolledValue(next);
        }

        onValueChange?.(next);
      },
      [cancelScheduledClose, cancelScheduledOpen, isControlled, onValueChange],
    );

    const scheduleOpen = useCallback(
      (nextValue: string) => {
        cancelScheduledClose();
        cancelScheduledOpen();
        openTimerRef.current = window.setTimeout(() => {
          openTimerRef.current = null;
          setOpenValue(nextValue);
        }, delay);
      },
      [cancelScheduledClose, cancelScheduledOpen, delay, setOpenValue],
    );

    const scheduleClose = useCallback(() => {
      cancelScheduledClose();
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setOpenValue(null);
      }, closeDelay);
    }, [cancelScheduledClose, closeDelay, setOpenValue]);

    useEffect(() => {
      return () => {
        if (openTimerRef.current !== null) {
          window.clearTimeout(openTimerRef.current);
        }

        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (openValue === null || activationMode === "manual") {
        return undefined;
      }

      const handleDocumentPointerDown = (event: PointerEvent) => {
        const root = rootRef.current;

        if (
          root &&
          event.target instanceof Node &&
          !root.contains(event.target)
        ) {
          setOpenValue(null);
        }
      };

      document.addEventListener("pointerdown", handleDocumentPointerDown);

      return () => {
        document.removeEventListener("pointerdown", handleDocumentPointerDown);
      };
    }, [activationMode, openValue, setOpenValue]);

    const registerTrigger = useCallback(
      (triggerValue: string, element: HTMLButtonElement | null) => {
        if (element) {
          triggerElementsRef.current.set(triggerValue, element);
          return;
        }

        triggerElementsRef.current.delete(triggerValue);
      },
      [],
    );

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || activationMode === "manual") {
        return;
      }

      if (event.key === "Escape" && openValueRef.current !== null) {
        const trigger = triggerElementsRef.current.get(openValueRef.current);

        setOpenValue(null);
        trigger?.focus();
        event.preventDefault();
      }
    };

    const handlePointerDown: PointerEventHandler<HTMLElement> = (event) => {
      onPointerDown?.(event);
      pointerDownInsideRef.current = true;
      window.setTimeout(() => {
        pointerDownInsideRef.current = false;
      }, 0);
    };

    const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
      onBlur?.(event);

      if (activationMode === "manual" || openValueRef.current === null) {
        return;
      }

      if (pointerDownInsideRef.current) {
        return;
      }

      const nextFocused = event.relatedTarget as Node | null;

      if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
        setOpenValue(null);
      }
    };

    const contextValue = useMemo<NavigationMenuContextValue>(
      () => ({
        variant,
        size,
        orientation,
        activationMode,
        openValue,
        open: (nextValue) => setOpenValue(nextValue),
        close: () => setOpenValue(null),
        toggle: (nextValue) =>
          setOpenValue(openValueRef.current === nextValue ? null : nextValue),
        scheduleOpen,
        scheduleClose,
        cancelScheduledOpen,
        cancelScheduledClose,
        registerTrigger,
        viewportElement,
        setViewportElement,
      }),
      [
        activationMode,
        cancelScheduledClose,
        cancelScheduledOpen,
        openValue,
        orientation,
        registerTrigger,
        scheduleClose,
        scheduleOpen,
        setOpenValue,
        size,
        variant,
        viewportElement,
      ],
    );

    const resolvedAriaLabel =
      ariaLabel ?? (ariaLabelledby === undefined ? "Main" : undefined);

    return (
      <nav
        {...props}
        ref={composeRefs(ref, rootRef)}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledby}
        data-slot="navigation-menu"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        data-state={openValue !== null ? "open" : "closed"}
        className={navigationMenuClassNames({ orientation, className })}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
      >
        <NavigationMenuContext.Provider value={contextValue}>
          {children}
        </NavigationMenuContext.Provider>
      </nav>
    );
  },
);

NavigationMenu.displayName = "NavigationMenu";

export const NavigationMenuList = forwardRef<
  HTMLUListElement,
  NavigationMenuListProps
>(({ className, ...props }, ref) => {
  const { orientation } = useNavigationMenuContext();

  return (
    <ul
      {...props}
      ref={ref}
      data-slot="navigation-menu-list"
      data-orientation={orientation}
      className={navigationMenuListClassNames({ orientation, className })}
    />
  );
});

NavigationMenuList.displayName = "NavigationMenuList";

export const NavigationMenuItem = forwardRef<
  HTMLLIElement,
  NavigationMenuItemProps
>(({ children, className, onPointerEnter, onPointerLeave, value, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const autoValue = useId();
  const itemValue = value ?? autoValue;
  const contentId = useId();
  const open = context.openValue === itemValue;
  const itemContextValue = useMemo<NavigationMenuItemContextValue>(
    () => ({ value: itemValue, contentId, open }),
    [contentId, itemValue, open],
  );

  const handlePointerEnter: PointerEventHandler<HTMLLIElement> = (event) => {
    onPointerEnter?.(event);

    if (context.activationMode === "hover") {
      context.cancelScheduledClose();
    }
  };

  const handlePointerLeave: PointerEventHandler<HTMLLIElement> = (event) => {
    onPointerLeave?.(event);

    if (context.activationMode === "hover") {
      context.cancelScheduledOpen();

      if (open) {
        context.scheduleClose();
      }
    }
  };

  return (
    <li
      {...props}
      ref={ref}
      data-slot="navigation-menu-item"
      data-value={value}
      data-state={open ? "open" : "closed"}
      className={navigationMenuItemClassNames({ className })}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <NavigationMenuItemContext.Provider value={itemContextValue}>
        {children}
      </NavigationMenuItemContext.Provider>
    </li>
  );
});

NavigationMenuItem.displayName = "NavigationMenuItem";

export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(
  (
    {
      children,
      className,
      disabled,
      onClick,
      onFocus,
      onPointerEnter,
      showChevron = true,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const context = useNavigationMenuContext();
    const itemContext = useContext(NavigationMenuItemContext);

    if (!itemContext) {
      throw new Error(
        "NavigationMenuTrigger must be used within a NavigationMenuItem.",
      );
    }

    const { contentId, open, value } = itemContext;

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);

      if (
        event.defaultPrevented ||
        disabled ||
        context.activationMode === "manual"
      ) {
        return;
      }

      context.toggle(value);
    };

    const handlePointerEnter: PointerEventHandler<HTMLButtonElement> = (
      event,
    ) => {
      onPointerEnter?.(event);

      if (disabled || context.activationMode !== "hover") {
        return;
      }

      if (!open) {
        context.scheduleOpen(value);
      }
    };

    const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
      onFocus?.(event);

      if (disabled || context.activationMode !== "focus") {
        return;
      }

      context.open(value);
    };

    return (
      <button
        {...props}
        ref={composeRefs(ref, (node) => context.registerTrigger(value, node))}
        type={type}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        data-slot="navigation-menu-trigger"
        data-variant={context.variant}
        data-size={context.size}
        data-state={open ? "open" : "closed"}
        className={navigationMenuTriggerClassNames({
          variant: context.variant,
          size: context.size,
          className,
        })}
        onClick={handleClick}
        onFocus={handleFocus}
        onPointerEnter={handlePointerEnter}
      >
        {children}
        {showChevron ? <TriggerChevron /> : null}
      </button>
    );
  },
);

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export const NavigationMenuContent = forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(({ children, className, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const itemContext = useContext(NavigationMenuItemContext);

  if (!itemContext) {
    throw new Error(
      "NavigationMenuContent must be used within a NavigationMenuItem.",
    );
  }

  if (!itemContext.open) {
    return null;
  }

  const inline = context.viewportElement === null;
  const panel = (
    <div
      {...props}
      ref={ref}
      id={itemContext.contentId}
      data-slot="navigation-menu-content"
      data-state="open"
      data-orientation={context.orientation}
      className={navigationMenuContentClassNames({
        orientation: context.orientation,
        inline,
        className,
      })}
    >
      <NavigationMenuPanelContext.Provider value={true}>
        {children}
      </NavigationMenuPanelContext.Provider>
    </div>
  );

  if (!inline && context.viewportElement) {
    return createPortal(panel, context.viewportElement);
  }

  return panel;
});

NavigationMenuContent.displayName = "NavigationMenuContent";

export const NavigationMenuViewport = forwardRef<
  HTMLDivElement,
  NavigationMenuViewportProps
>(({ className, onPointerEnter, onPointerLeave, ...props }, ref) => {
  const context = useNavigationMenuContext();
  const open = context.openValue !== null;
  const { setViewportElement } = context;
  const composedRef = useMemo(
    () =>
      composeRefs<HTMLDivElement>(ref, (node) => setViewportElement(node)),
    [ref, setViewportElement],
  );

  const handlePointerEnter: PointerEventHandler<HTMLDivElement> = (event) => {
    onPointerEnter?.(event);

    if (context.activationMode === "hover") {
      context.cancelScheduledClose();
    }
  };

  const handlePointerLeave: PointerEventHandler<HTMLDivElement> = (event) => {
    onPointerLeave?.(event);

    if (context.activationMode === "hover" && open) {
      context.scheduleClose();
    }
  };

  return (
    <div
      {...props}
      ref={composedRef}
      data-slot="navigation-menu-viewport"
      data-state={open ? "open" : "closed"}
      className={navigationMenuViewportClassNames({ className })}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    />
  );
});

NavigationMenuViewport.displayName = "NavigationMenuViewport";

export const NavigationMenuSection = forwardRef<
  HTMLDivElement,
  NavigationMenuSectionProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    data-slot="navigation-menu-section"
    className={navigationMenuSectionClassNames({ className })}
  />
));

NavigationMenuSection.displayName = "NavigationMenuSection";

export const NavigationMenuLabel = forwardRef<
  HTMLDivElement,
  NavigationMenuLabelProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    data-slot="navigation-menu-label"
    className={navigationMenuLabelClassNames({ className })}
  />
));

NavigationMenuLabel.displayName = "NavigationMenuLabel";

export const NavigationMenuDescription = forwardRef<
  HTMLParagraphElement,
  NavigationMenuDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    {...props}
    ref={ref}
    data-slot="navigation-menu-description"
    className={navigationMenuDescriptionClassNames({ className })}
  />
));

NavigationMenuDescription.displayName = "NavigationMenuDescription";

export const NavigationMenuSeparator = forwardRef<
  HTMLDivElement,
  NavigationMenuSeparatorProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    aria-hidden="true"
    data-slot="navigation-menu-separator"
    data-orientation={orientation}
    className={navigationMenuSeparatorClassNames({ orientation, className })}
  />
));

NavigationMenuSeparator.displayName = "NavigationMenuSeparator";

export const NavigationMenuLink = forwardRef<
  HTMLAnchorElement,
  NavigationMenuLinkProps
>(
  (
    {
      "aria-current": ariaCurrent,
      asChild = false,
      children,
      className,
      current,
      disabled = false,
      external = false,
      href,
      icon,
      onClick,
      rel,
      target,
      ...props
    },
    ref,
  ) => {
    const { variant, size } = useNavigationMenuContext();
    const inPanel = useContext(NavigationMenuPanelContext);
    const classes = inPanel
      ? navigationMenuPanelLinkClassNames({ className })
      : navigationMenuLinkClassNames({ variant, size, className });
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
    };

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<NavigationMenuLinkSlotProps>(child)) {
        throw new Error(
          "NavigationMenuLink with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const resolvedHref = child.props.href ?? href;
      const resolvedTarget =
        child.props.target ?? target ?? (external ? "_blank" : undefined);
      const resolvedRel = mergeRel(
        child.props.rel ?? rel,
        resolvedTarget,
        external,
      );
      const resolvedAriaCurrent = resolveAriaCurrent(
        child.props["aria-current"] ?? ariaCurrent,
        current,
      );
      const isCurrent = hasCurrentState(resolvedAriaCurrent);
      const clonedProps: NavigationMenuLinkSlotProps = {
        ...props,
        ...child.props,
        ref: composeRefs(ref as Ref<HTMLElement>, childRef),
        "data-slot": "navigation-menu-link",
        "data-variant": variant,
        "data-size": size,
        "data-panel": inPanel ? "true" : undefined,
        "data-current": isCurrent ? "true" : undefined,
        "data-disabled": disabled ? "true" : undefined,
        "data-external": external ? "true" : undefined,
        className: cn(classes, child.props.className),
        onClick: composeClickHandlers(handleClick, child.props.onClick),
      };

      if (disabled) {
        clonedProps["aria-disabled"] = true;
        clonedProps.href = undefined;
      } else if (resolvedHref !== undefined) {
        clonedProps.href = resolvedHref;
      }

      if (resolvedTarget !== undefined) {
        clonedProps.target = resolvedTarget;
      }

      if (resolvedRel !== undefined) {
        clonedProps.rel = resolvedRel;
      }

      if (resolvedAriaCurrent !== undefined) {
        clonedProps["aria-current"] = resolvedAriaCurrent;
      }

      if (!icon && !inPanel) {
        return cloneElement(child, clonedProps);
      }

      return cloneElement(
        child,
        clonedProps,
        renderLinkContent({ children: child.props.children, icon, inPanel }),
      );
    }

    const resolvedTarget = target ?? (external ? "_blank" : undefined);
    const resolvedAriaCurrent = resolveAriaCurrent(ariaCurrent, current);
    const isCurrent = hasCurrentState(resolvedAriaCurrent);

    return (
      <a
        {...props}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={resolvedTarget}
        rel={mergeRel(rel, resolvedTarget, external)}
        aria-current={resolvedAriaCurrent}
        aria-disabled={disabled ? true : undefined}
        data-slot="navigation-menu-link"
        data-variant={variant}
        data-size={size}
        data-panel={inPanel ? "true" : undefined}
        data-current={isCurrent ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-external={external ? "true" : undefined}
        className={classes}
        onClick={handleClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {renderLinkContent({ children, icon, inPanel })}
      </a>
    );
  },
);

NavigationMenuLink.displayName = "NavigationMenuLink";

export const NavigationMenuFeaturedItem = forwardRef<
  HTMLAnchorElement,
  NavigationMenuFeaturedItemProps
>(
  (
    {
      asChild = false,
      children,
      className,
      disabled = false,
      external = false,
      href,
      onClick,
      rel,
      target,
      ...props
    },
    ref,
  ) => {
    const classes = navigationMenuFeaturedItemClassNames({ className });
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
    };

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<NavigationMenuLinkSlotProps>(child)) {
        throw new Error(
          "NavigationMenuFeaturedItem with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const resolvedHref = child.props.href ?? href;
      const resolvedTarget =
        child.props.target ?? target ?? (external ? "_blank" : undefined);
      const resolvedRel = mergeRel(
        child.props.rel ?? rel,
        resolvedTarget,
        external,
      );
      const clonedProps: NavigationMenuLinkSlotProps = {
        ...props,
        ...child.props,
        ref: composeRefs(ref as Ref<HTMLElement>, childRef),
        "data-slot": "navigation-menu-featured-item",
        "data-disabled": disabled ? "true" : undefined,
        "data-external": external ? "true" : undefined,
        className: cn(classes, child.props.className),
        onClick: composeClickHandlers(handleClick, child.props.onClick),
      };

      if (disabled) {
        clonedProps["aria-disabled"] = true;
        clonedProps.href = undefined;
      } else if (resolvedHref !== undefined) {
        clonedProps.href = resolvedHref;
      }

      if (resolvedTarget !== undefined) {
        clonedProps.target = resolvedTarget;
      }

      if (resolvedRel !== undefined) {
        clonedProps.rel = resolvedRel;
      }

      return cloneElement(child, clonedProps);
    }

    const resolvedTarget = target ?? (external ? "_blank" : undefined);

    return (
      <a
        {...props}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={resolvedTarget}
        rel={mergeRel(rel, resolvedTarget, external)}
        aria-disabled={disabled ? true : undefined}
        data-slot="navigation-menu-featured-item"
        data-disabled={disabled ? "true" : undefined}
        data-external={external ? "true" : undefined}
        className={classes}
        onClick={handleClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {children}
      </a>
    );
  },
);

NavigationMenuFeaturedItem.displayName = "NavigationMenuFeaturedItem";
