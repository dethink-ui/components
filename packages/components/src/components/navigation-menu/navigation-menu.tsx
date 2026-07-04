import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  type AnchorHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type NavigationMenuVariant = "default" | "quiet" | "underline";

export type NavigationMenuSize = "sm" | "md" | "lg";

export type NavigationMenuOrientation = "horizontal" | "vertical";

export type NavigationMenuCurrent = boolean | "page" | "location";

export interface NavigationMenuProps extends HTMLAttributes<HTMLElement> {
  variant?: NavigationMenuVariant;
  size?: NavigationMenuSize;
  orientation?: NavigationMenuOrientation;
}

export type NavigationMenuListProps = HTMLAttributes<HTMLUListElement>;

export interface NavigationMenuItemProps
  extends LiHTMLAttributes<HTMLLIElement> {
  value?: string;
}

type NavigationMenuLinkBaseProps = {
  asChild?: boolean;
  current?: NavigationMenuCurrent;
  disabled?: boolean;
  external?: boolean;
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
};

const defaultNavigationMenuContext: NavigationMenuContextValue = {
  variant: "default",
  size: "md",
  orientation: "horizontal",
};

const NavigationMenuContext = createContext<NavigationMenuContextValue>(
  defaultNavigationMenuContext,
);

function useNavigationMenuContext() {
  return useContext(NavigationMenuContext);
}

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

const navigationMenuItemBaseClasses = "flex";

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

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
  (
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      children,
      className,
      orientation = "horizontal",
      size = "md",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const resolvedAriaLabel =
      ariaLabel ?? (ariaLabelledby === undefined ? "Main" : undefined);

    return (
      <nav
        {...props}
        ref={ref as ForwardedRef<HTMLElement>}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledby}
        data-slot="navigation-menu"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        className={navigationMenuClassNames({ orientation, className })}
      >
        <NavigationMenuContext.Provider value={{ variant, size, orientation }}>
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
>(({ className, value, ...props }, ref) => {
  return (
    <li
      {...props}
      ref={ref}
      data-slot="navigation-menu-item"
      data-value={value}
      className={navigationMenuItemClassNames({ className })}
    />
  );
});

NavigationMenuItem.displayName = "NavigationMenuItem";

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
      onClick,
      rel,
      target,
      ...props
    },
    ref,
  ) => {
    const { variant, size } = useNavigationMenuContext();
    const classes = navigationMenuLinkClassNames({ variant, size, className });
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

      return cloneElement(child, clonedProps);
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
        data-current={isCurrent ? "true" : undefined}
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

NavigationMenuLink.displayName = "NavigationMenuLink";
