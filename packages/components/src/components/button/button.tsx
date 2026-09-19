import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";

export type ButtonVariant =
  "solid" | "soft" | "outline" | "ghost" | "link" | "destructive";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "data-slot"?: string;
  asChild?: boolean;
  leftIcon?: ReactNode;
  loadingIndicator?: ReactNode;
  rightIcon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const buttonBaseClasses =
  "relative inline-flex shrink-0 items-center justify-center gap-density-gap whitespace-nowrap rounded-md border border-transparent font-medium motion-safe:transition-[color,background-color,border-color,opacity,scale] motion-safe:duration-[var(--dt-motion-fast)] motion-safe:ease-control motion-safe:[&:not(:disabled):not([data-disabled=true]):active]:scale-[var(--dt-control-press-scale,0.98)] motion-safe:active:duration-[var(--dt-motion-press)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[loading=true]:cursor-wait data-[loading=true]:opacity-80";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
  outline:
    "border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline active:text-primary/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 px-[var(--dt-space-2)] text-xs",
  sm: "h-8 px-[var(--dt-space-3)] text-sm",
  md: "h-density-control px-[var(--dt-space-4)] text-sm",
  lg: "h-11 px-[var(--dt-space-5)] text-base",
  xl: "h-12 px-[var(--dt-space-6)] text-base",
  icon: "h-density-control w-density-control p-0 text-sm",
};

const buttonIconClasses =
  "pointer-events-none inline-flex size-4 shrink-0 items-center justify-center empty:hidden [&>svg]:size-4";

const buttonSpinnerClasses =
  "pointer-events-none size-4 shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none";

const buttonLoadingIndicatorClasses =
  "pointer-events-none inline-flex size-4 shrink-0 items-center justify-center";

type ButtonSlotProps = Record<string, unknown> & {
  children?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
};

export function buttonClassNames({
  variant = "solid",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(
    buttonBaseClasses,
    buttonSizeClasses[size],
    buttonVariantClasses[variant],
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

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function ButtonContent({
  children,
  leftIcon,
  loading,
  loadingIndicator,
  rightIcon,
}: Pick<
  ButtonProps,
  "children" | "leftIcon" | "loading" | "loadingIndicator" | "rightIcon"
>) {
  const contentRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || loading) return;

    // Measure only at rest. Parent press transforms must not affect the size
    // reserved while a consumer swaps the label during an async action.
    const measure = () => {
      const width = content.offsetWidth;
      if (width)
        content.style.setProperty("--dt-button-idle-width", `${width}px`);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [loading]);

  const overlaySpinner = loading && !leftIcon;
  return (
    <span
      ref={contentRef}
      data-slot="button-content"
      className="gap-density-gap relative inline-flex max-w-full min-w-0 items-center justify-center"
      style={{
        inlineSize: loading ? "var(--dt-button-idle-width, auto)" : undefined,
      }}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-flex shrink-0 items-center justify-center motion-safe:animate-[dt-scrim-in_120ms_ease-out]",
            overlaySpinner && "absolute inset-0",
          )}
        >
          <span
            aria-hidden="true"
            data-slot="button-spinner"
            className={
              loadingIndicator
                ? buttonLoadingIndicatorClasses
                : buttonSpinnerClasses
            }
          >
            {loadingIndicator}
          </span>
        </span>
      ) : leftIcon ? (
        <span
          aria-hidden="true"
          data-slot="button-left-icon"
          className={buttonIconClasses}
        >
          {leftIcon}
        </span>
      ) : null}
      <span
        data-slot="button-label"
        className={cn(
          "min-w-0 truncate motion-safe:transition-opacity motion-safe:duration-[var(--dt-motion-fast)]",
          overlaySpinner && "opacity-0",
        )}
      >
        {children}
      </span>
      {rightIcon ? (
        <span
          aria-hidden="true"
          data-slot="button-right-icon"
          className={cn(buttonIconClasses, overlaySpinner && "opacity-0")}
        >
          {rightIcon}
        </span>
      ) : null}
    </span>
  );
}

function getChildRef(child: ReactElement<ButtonSlotProps>) {
  return child.props.ref;
}

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      "data-slot": dataSlot = "button",
      "aria-busy": ariaBusy,
      asChild = false,
      children,
      className,
      disabled = false,
      leftIcon,
      loading = false,
      loadingIndicator,
      onClick,
      rightIcon,
      type = "button",
      variant = "solid",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    };
    const classes = buttonClassNames({ variant, size, className });

    if (asChild) {
      const child = Children.only(children);

      if (!isValidElement<ButtonSlotProps>(child)) {
        throw new Error(
          "Button with asChild expects a single React element child.",
        );
      }

      const childRef = getChildRef(child);

      return cloneElement(
        child,
        {
          ...props,
          ...child.props,
          ref: composeRefs(ref, childRef),
          "aria-busy": loading ? true : ariaBusy,
          "aria-disabled": isDisabled ? true : child.props["aria-disabled"],
          "data-slot": dataSlot,
          "data-variant": variant,
          "data-size": size,
          "data-disabled": isDisabled ? "true" : undefined,
          "data-loading": loading ? "true" : undefined,
          className: cn(classes, child.props.className),
          onClick: composeClickHandlers(handleClick, child.props.onClick),
        },
        <ButtonContent
          leftIcon={leftIcon}
          loading={loading}
          loadingIndicator={loadingIndicator}
          rightIcon={rightIcon}
        >
          {child.props.children}
        </ButtonContent>,
      );
    }

    return (
      <button
        {...props}
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? true : ariaBusy}
        data-slot={dataSlot}
        data-variant={variant}
        data-size={size}
        data-disabled={isDisabled ? "true" : undefined}
        data-loading={loading ? "true" : undefined}
        className={classes}
        onClick={handleClick as MouseEventHandler<HTMLButtonElement>}
      >
        <ButtonContent
          leftIcon={leftIcon}
          loading={loading}
          loadingIndicator={loadingIndicator}
          rightIcon={rightIcon}
        >
          {children}
        </ButtonContent>
      </button>
    );
  },
);

Button.displayName = "Button";
