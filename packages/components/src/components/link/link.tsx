import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type LinkVariant = "default" | "muted" | "nav" | "destructive";
export type LinkUnderline = "hover" | "always" | "none";

type LinkBaseProps = {
  asChild?: boolean;
  variant?: LinkVariant;
  underline?: LinkUnderline;
};

type NativeLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  LinkBaseProps & {
    asChild?: false;
    href: string;
    children: ReactNode;
  };

type ChildLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  LinkBaseProps & {
    asChild: true;
    href?: string;
    children: ReactElement<LinkSlotProps>;
  };

export type LinkProps = NativeLinkProps | ChildLinkProps;

type LinkSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  "aria-current"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
};

const linkBaseClasses =
  "inline rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const linkVariantClasses: Record<LinkVariant, string> = {
  default: "text-primary hover:text-primary/80 active:text-primary/70",
  muted: "text-muted-foreground hover:text-foreground active:text-foreground",
  nav: "text-muted-foreground hover:text-foreground active:text-foreground data-[current=true]:text-foreground data-[current=true]:font-semibold",
  destructive:
    "text-destructive hover:text-destructive/85 active:text-destructive/75",
};

const linkUnderlineClasses: Record<LinkUnderline, string> = {
  hover: "no-underline hover:underline focus-visible:underline",
  always: "underline",
  none: "no-underline",
};

export function linkClassNames({
  variant = "default",
  underline = "hover",
  className,
}: Pick<LinkProps, "variant" | "underline" | "className"> = {}) {
  return cn(
    linkBaseClasses,
    linkVariantClasses[variant],
    linkUnderlineClasses[underline],
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

function getChildRef(child: ReactElement<LinkSlotProps>) {
  return child.props.ref;
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

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      asChild = false,
      children,
      className,
      href,
      onClick,
      rel,
      target,
      underline = "hover",
      variant = "default",
      "aria-current": ariaCurrent,
      ...props
    },
    ref,
  ) => {
    const classes = linkClassNames({ variant, underline, className });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<LinkSlotProps>(child)) {
        throw new Error(
          "Link with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);
      const resolvedHref = child.props.href ?? href;
      const resolvedTarget = child.props.target ?? target;
      const resolvedRel = mergeRelForTarget(
        child.props.rel ?? rel,
        resolvedTarget,
      );
      const resolvedAriaCurrent = child.props["aria-current"] ?? ariaCurrent;
      const isCurrent = hasCurrentState(resolvedAriaCurrent);
      const clonedProps: LinkSlotProps = {
        ...props,
        ...child.props,
        ref: composeRefs(ref as Ref<HTMLElement>, childRef),
        "data-slot": "link",
        "data-variant": variant,
        "data-underline": underline,
        "data-current": isCurrent ? "true" : undefined,
        className: cn(classes, child.props.className),
        onClick: composeClickHandlers(
          onClick as MouseEventHandler<HTMLElement> | undefined,
          child.props.onClick,
        ),
      };

      if (resolvedHref !== undefined) {
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

    const isCurrent = hasCurrentState(ariaCurrent);

    return (
      <a
        {...props}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        href={href}
        rel={mergeRelForTarget(rel, target)}
        target={target}
        aria-current={ariaCurrent}
        data-slot="link"
        data-variant={variant}
        data-underline={underline}
        data-current={isCurrent ? "true" : undefined}
        className={classes}
        onClick={onClick}
      >
        {children}
      </a>
    );
  },
);

Link.displayName = "Link";
