import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FocusEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";
import {
  motion as motionElement,
  useReducedMotion,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { Pressable } from "react-aria-components";
import type { ButtonVariant } from "../button";
import { cn } from "../../utils/cn";

export type RevealButtonVariant = Exclude<ButtonVariant, "link">;
export type RevealButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type RevealButtonMotion = "none" | "subtle" | "standard";
export type RevealButtonLabelVisibility = "hover" | "always";

export interface RevealButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-labelledby" | "children"
> {
  icon: ReactNode;
  label: string;
  labelVisibility?: RevealButtonLabelVisibility;
  loading?: boolean;
  motion?: RevealButtonMotion;
  size?: RevealButtonSize;
  variant?: RevealButtonVariant;
}

const revealButtonBaseClasses =
  "relative inline-flex shrink-0 transform-gpu items-center justify-start overflow-hidden whitespace-nowrap rounded-md border border-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[loading=true]:cursor-wait data-[loading=true]:opacity-80 data-[reduced-motion=true]:will-change-auto";

const revealButtonVariantClasses: Record<RevealButtonVariant, string> = {
  solid:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
  outline:
    "border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

const revealButtonSizeClasses: Record<RevealButtonSize, string> = {
  xs: "h-7 min-w-7 text-xs",
  sm: "h-8 min-w-8 text-sm",
  md: "h-density-control min-w-density-control text-sm",
  lg: "h-11 min-w-11 text-base",
  xl: "h-12 min-w-12 text-base",
};

const revealButtonIconBoxClasses: Record<RevealButtonSize, string> = {
  xs: "size-7",
  sm: "size-8",
  md: "size-density-control",
  lg: "size-11",
  xl: "size-12",
};

const revealButtonIconSizeClasses: Record<RevealButtonSize, string> = {
  xs: "size-3.5 [&>svg]:size-3.5",
  sm: "size-4 [&>svg]:size-4",
  md: "size-4 [&>svg]:size-4",
  lg: "size-5 [&>svg]:size-5",
  xl: "size-5 [&>svg]:size-5",
};

const revealButtonIconRevealShift: Record<RevealButtonSize, number> = {
  xs: 3,
  sm: 4,
  md: 5,
  lg: 6,
  xl: 6,
};

const revealButtonLabelPaddingClasses: Record<RevealButtonSize, string> = {
  xs: "ps-[var(--dt-space-1)] pe-[var(--dt-space-2)]",
  sm: "ps-[var(--dt-space-1)] pe-[var(--dt-space-3)]",
  md: "ps-[var(--dt-space-2)] pe-[var(--dt-space-4)]",
  lg: "ps-[var(--dt-space-2)] pe-[var(--dt-space-5)]",
  xl: "ps-[var(--dt-space-2)] pe-[var(--dt-space-5)]",
};

const revealButtonIconClasses =
  "pointer-events-none inline-flex shrink-0 items-center justify-center";

const revealButtonIconMotionClasses = "inline-flex items-center justify-center";

const revealButtonSpinnerClasses =
  "pointer-events-none shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none";

const revealButtonLabelClasses =
  "pointer-events-none min-w-0 shrink-0 overflow-hidden";

const revealButtonLabelTextClasses = "inline-block whitespace-nowrap";

const revealButtonLabelMeasureClasses =
  "pointer-events-none invisible absolute inset-y-0 start-0 inline-flex w-max items-center whitespace-nowrap";

const revealButtonTransitions: Record<RevealButtonMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 440, damping: 36, mass: 0.8 },
  standard: { type: "spring", stiffness: 520, damping: 34, mass: 0.75 },
};

const revealButtonLabelTransitions: Record<RevealButtonMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 360, damping: 34, mass: 0.9 },
  standard: { type: "spring", stiffness: 420, damping: 32, mass: 0.85 },
};

const revealButtonEstimatedFontSize: Record<RevealButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 14,
  lg: 16,
  xl: 16,
};

const revealButtonEstimatedLabelPadding: Record<RevealButtonSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 28,
  xl: 28,
};

export function revealButtonClassNames({
  variant = "ghost",
  size = "md",
  className,
}: Pick<RevealButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(
    revealButtonBaseClasses,
    revealButtonSizeClasses[size],
    revealButtonVariantClasses[variant],
    className,
  );
}

function estimateLabelInlineSize(label: string, size: RevealButtonSize) {
  return Math.ceil(
    Math.max(label.length, 1) * revealButtonEstimatedFontSize[size] * 0.56 +
      revealButtonEstimatedLabelPadding[size],
  );
}

function measureInlineSize(node: HTMLElement) {
  return Math.ceil(node.scrollWidth || node.getBoundingClientRect().width);
}

function useMeasuredInlineSize(label: string) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [inlineSize, setInlineSize] = useState(0);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const measure = () => {
      setInlineSize(measureInlineSize(node));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [label]);

  return [ref, inlineSize] as const;
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

  return { scale: 0.96 };
}

function renderSizedIcon(icon: ReactNode) {
  if (!isValidElement<{ className?: string }>(icon)) {
    return icon;
  }

  return cloneElement(icon, {
    className: cn(icon.props.className, "size-full shrink-0"),
  });
}

function canRevealForHover() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }

  return window.matchMedia("(hover: hover)").matches;
}

export const RevealButton = forwardRef<HTMLButtonElement, RevealButtonProps>(
  (
    {
      "aria-busy": ariaBusy,
      "aria-disabled": ariaDisabled,
      className,
      disabled = false,
      icon,
      label,
      labelVisibility = "hover",
      loading = false,
      motion = "standard",
      onBlur,
      onClick,
      onFocus,
      onMouseEnter,
      onMouseLeave,
      onPointerEnter,
      onPointerLeave,
      size = "md",
      type = "button",
      variant = "ghost",
      ...props
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion = motion === "none" || prefersReducedMotion === true;
    const isAriaDisabled = ariaDisabled === true || ariaDisabled === "true";
    const isActivationDisabled = disabled || loading || isAriaDisabled;
    const canReveal = !disabled;
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [labelRef, measuredLabelInlineSize] = useMeasuredInlineSize(label);
    const revealed = labelVisibility === "always" || hovered || focused;
    const revealState = revealed ? "revealed" : "collapsed";
    const transition = reducedMotion
      ? revealButtonTransitions.none
      : revealButtonTransitions[motion];
    const labelTransition = reducedMotion
      ? revealButtonLabelTransitions.none
      : revealButtonLabelTransitions[motion];
    const resolvedLabelInlineSize =
      measuredLabelInlineSize > 0
        ? measuredLabelInlineSize
        : estimateLabelInlineSize(label, size);
    const labelWidth = resolvedLabelInlineSize;

    const setButtonRef = useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      const node = buttonRef.current;

      if (!node) {
        return undefined;
      }

      const syncCurrentInteractionState = () => {
        setFocused(node === document.activeElement);
        setHovered(canReveal && canRevealForHover() && node.matches(":hover"));
        setIsRtl(getComputedStyle(node).direction === "rtl");
      };

      syncCurrentInteractionState();

      const frame =
        typeof window.requestAnimationFrame === "function"
          ? window.requestAnimationFrame(syncCurrentInteractionState)
          : undefined;

      const handleNativeFocus = () => {
        setFocused(true);
      };

      const handleNativeBlur = () => {
        setFocused(false);
      };

      const handleNativePointerEnter = (event: PointerEvent) => {
        if (canReveal && event.pointerType !== "touch" && canRevealForHover()) {
          setHovered(true);
        }
      };

      const handleNativePointerLeave = () => {
        setHovered(false);
      };

      node.addEventListener("focus", handleNativeFocus);
      node.addEventListener("blur", handleNativeBlur);
      node.addEventListener("pointerenter", handleNativePointerEnter);
      node.addEventListener("pointerleave", handleNativePointerLeave);

      return () => {
        if (frame !== undefined) {
          window.cancelAnimationFrame(frame);
        }

        node.removeEventListener("focus", handleNativeFocus);
        node.removeEventListener("blur", handleNativeBlur);
        node.removeEventListener("pointerenter", handleNativePointerEnter);
        node.removeEventListener("pointerleave", handleNativePointerLeave);
      };
    }, [canReveal]);

    useEffect(() => {
      if (disabled) {
        setHovered(false);
        setFocused(false);
      }
    }, [disabled]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (isActivationDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    };

    const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
      setFocused(true);
      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLButtonElement> = (event) => {
      setFocused(false);
      onBlur?.(event);
    };

    const handlePointerEnter: PointerEventHandler<HTMLButtonElement> = (
      event,
    ) => {
      if (canReveal && event.pointerType !== "touch" && canRevealForHover()) {
        setHovered(true);
      }

      onPointerEnter?.(event);
    };

    const handlePointerLeave: PointerEventHandler<HTMLButtonElement> = (
      event,
    ) => {
      setHovered(false);
      onPointerLeave?.(event);
    };

    const handleMouseEnter: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (canReveal && canRevealForHover()) {
        setHovered(true);
      }

      onMouseEnter?.(event);
    };

    const handleMouseLeave: MouseEventHandler<HTMLButtonElement> = (event) => {
      setHovered(false);
      onMouseLeave?.(event);
    };
    const iconRevealShift = reducedMotion
      ? 0
      : revealButtonIconRevealShift[size] * (isRtl ? -1 : 1);
    const iconMotionVariants = {
      collapsed: { x: 0 },
      revealed: { x: iconRevealShift },
    };

    return (
      <Pressable isDisabled={isActivationDisabled}>
        <motionElement.button
          {...(props as HTMLMotionProps<"button">)}
          ref={setButtonRef}
          type={type}
          disabled={disabled}
          aria-label={label}
          aria-busy={loading ? true : ariaBusy}
          aria-disabled={loading ? true : ariaDisabled}
          data-slot="reveal-button"
          data-variant={variant}
          data-size={size}
          data-motion={motion}
          data-label-visibility={labelVisibility}
          data-state={revealState}
          data-disabled={disabled ? "true" : undefined}
          data-loading={loading ? "true" : undefined}
          data-reduced-motion={reducedMotion ? "true" : undefined}
          className={revealButtonClassNames({ variant, size, className })}
          variants={{ collapsed: {}, revealed: {} }}
          initial={false}
          animate={revealState}
          whileHover={canReveal ? "revealed" : undefined}
          whileFocus={canReveal ? "revealed" : undefined}
          whileTap={getPressMotionTarget({
            disabled: isActivationDisabled,
            reducedMotion,
          })}
          transition={transition}
          onBlur={handleBlur}
          onClick={handleClick}
          onFocus={handleFocus}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          {loading ? (
            <span
              aria-hidden="true"
              data-slot="reveal-button-spinner"
              className={cn(
                revealButtonIconClasses,
                revealButtonIconBoxClasses[size],
              )}
            >
              <motionElement.span
                data-slot="reveal-button-spinner-motion"
                className={cn(
                  revealButtonIconMotionClasses,
                  revealButtonIconSizeClasses[size],
                )}
                variants={iconMotionVariants}
                transition={transition}
              >
                <span
                  data-slot="reveal-button-spinner-glyph"
                  className={cn(revealButtonSpinnerClasses, "size-full")}
                />
              </motionElement.span>
            </span>
          ) : (
            <span
              aria-hidden="true"
              data-slot="reveal-button-icon"
              className={cn(
                revealButtonIconClasses,
                revealButtonIconBoxClasses[size],
              )}
            >
              <motionElement.span
                data-slot="reveal-button-icon-motion"
                className={cn(
                  revealButtonIconMotionClasses,
                  revealButtonIconSizeClasses[size],
                )}
                variants={iconMotionVariants}
                transition={transition}
              >
                {renderSizedIcon(icon)}
              </motionElement.span>
            </span>
          )}
          <motionElement.span
            aria-hidden="true"
            data-slot="reveal-button-label"
            className={revealButtonLabelClasses}
            variants={{
              collapsed: {
                width: labelVisibility === "always" ? labelWidth : 0,
                opacity: labelVisibility === "always" ? 1 : 0,
              },
              revealed: {
                width: labelWidth,
                opacity: 1,
              },
            }}
            transition={labelTransition}
          >
            <span
              data-slot="reveal-button-label-text"
              className={cn(
                revealButtonLabelTextClasses,
                revealButtonLabelPaddingClasses[size],
              )}
            >
              {label}
            </span>
          </motionElement.span>
          <span
            ref={labelRef}
            aria-hidden="true"
            data-slot="reveal-button-label-measure"
            className={cn(
              revealButtonLabelMeasureClasses,
              revealButtonLabelPaddingClasses[size],
            )}
          >
            {label}
          </span>
        </motionElement.button>
      </Pressable>
    );
  },
);

RevealButton.displayName = "RevealButton";
