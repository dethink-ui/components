import {
  forwardRef,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "../button";
import { ButtonGroup } from "../button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  type DropdownMenuMotionPreset,
} from "../dropdown-menu";
import type { PositionedOverlayPositionProps } from "../../utils/positioned-overlay";
import { cn } from "../../utils/cn";

export type DropdownButtonMode = "menu" | "split";
export type DropdownButtonMotionPreset = DropdownMenuMotionPreset;
export type DropdownButtonLoadingBehavior = "all" | "primary";

interface DropdownButtonSharedProps extends PositionedOverlayPositionProps {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  groupClassName?: string;
  label: ReactNode;
  menuClassName?: string;
  motionPreset?: DropdownButtonMotionPreset;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  reducedMotion?: boolean;
  showArrow?: boolean;
  size?: ButtonSize;
  triggerClassName?: string;
  variant?: ButtonVariant;
}

export interface DropdownButtonMenuProps extends DropdownButtonSharedProps {
  mode?: "menu";

  /** Reserved for split mode. Direct primary actions are invalid in menu mode. */
  onPrimaryAction?: never;
  /** Reserved for split mode's separately named icon trigger. */
  menuLabel?: never;
  /** Reserved for split mode's primary icon. */
  primaryIcon?: never;
  /** Reserved for split mode's async primary action. */
  loading?: never;
  /** Reserved for split mode's async policy. */
  loadingBehavior?: never;
  /** Reserved for split mode's independent primary state. */
  primaryDisabled?: never;
  /** Reserved for split mode's independent menu state. */
  menuDisabled?: never;
}

export interface DropdownButtonSplitProps extends DropdownButtonSharedProps {
  loading?: boolean;
  loadingBehavior?: DropdownButtonLoadingBehavior;
  menuLabel: string;
  menuDisabled?: boolean;
  mode: "split";
  onPrimaryAction: NonNullable<ButtonProps["onClick"]>;
  primaryDisabled?: boolean;
  primaryIcon?: ReactNode;
}

export type DropdownButtonProps =
  DropdownButtonMenuProps | DropdownButtonSplitProps;

const dropdownButtonRootClasses = "inline-flex w-fit max-w-full";
const dropdownButtonTriggerIconClasses = "pointer-events-none size-4 shrink-0";

const dropdownButtonSplitTriggerSizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 w-7 p-0",
  sm: "h-8 w-8 p-0",
  md: "h-density-control w-density-control p-0",
  lg: "h-11 w-11 p-0",
  xl: "h-12 w-12 p-0",
  icon: "h-density-control w-density-control p-0",
};

const dropdownButtonChevronDuration: Record<
  DropdownButtonMotionPreset,
  number
> = {
  none: 0,
  subtle: 0.12,
  standard: 0.16,
};

const dropdownButtonBusyIndicatorClasses =
  "size-4 rounded-full border-2 border-current border-r-transparent";

function getDropdownButtonNodeKey(node: ReactNode, fallback: string) {
  if (typeof node === "string" || typeof node === "number") {
    return `${fallback}-${String(node)}`;
  }

  if (isValidElement(node) && node.key != null) {
    return `${fallback}-${String(node.key)}`;
  }

  return fallback;
}

export function dropdownButtonClassNames({
  className,
}: Pick<DropdownButtonProps, "className"> = {}) {
  return cn(dropdownButtonRootClasses, className);
}

function ChevronDownIcon({
  motionPreset,
  open,
  reducedMotion,
}: {
  motionPreset: DropdownButtonMotionPreset;
  open: boolean;
  reducedMotion: boolean;
}) {
  return (
    <motion.svg
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      data-open={open ? "" : undefined}
      data-slot="dropdown-button-trigger-icon"
      className={dropdownButtonTriggerIconClasses}
      fill="none"
      focusable="false"
      initial={false}
      transition={{
        duration:
          reducedMotion || motionPreset === "none"
            ? 0
            : dropdownButtonChevronDuration[motionPreset],
        ease: [0.16, 1, 0.3, 1],
      }}
      viewBox="0 0 16 16"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </motion.svg>
  );
}

function DropdownButtonPrimaryLabel({
  label,
  motionPreset,
  reducedMotion,
}: {
  label: ReactNode;
  motionPreset: DropdownButtonMotionPreset;
  reducedMotion: boolean;
}) {
  const motionDisabled = reducedMotion || motionPreset === "none";

  return (
    <span
      data-slot="dropdown-button-primary-label-viewport"
      className="inline-grid min-w-0"
    >
      <AnimatePresence initial={false} mode="sync">
        <DropdownButtonPrimaryLabelItem
          key={getDropdownButtonNodeKey(label, "primary-label")}
          label={label}
          motionDisabled={motionDisabled}
          motionPreset={motionPreset}
        />
      </AnimatePresence>
    </span>
  );
}

function DropdownButtonPrimaryLabelItem({
  label,
  motionDisabled,
  motionPreset,
}: {
  label: ReactNode;
  motionDisabled: boolean;
  motionPreset: DropdownButtonMotionPreset;
}) {
  const isPresent = useIsPresent();

  return (
    <motion.span
      animate={motionDisabled ? { opacity: 1 } : { opacity: 1, y: 0 }}
      initial={motionDisabled ? false : { opacity: 0, y: -2 }}
      exit={motionDisabled ? { opacity: 1 } : { opacity: 0, y: 2 }}
      aria-hidden={isPresent ? undefined : true}
      data-slot="dropdown-button-label"
      className="col-start-1 row-start-1 min-w-0 truncate"
      transition={{
        duration: motionDisabled
          ? 0
          : dropdownButtonChevronDuration[motionPreset],
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {label}
    </motion.span>
  );
}

function DropdownButtonPrimaryIcon({
  icon,
  motionPreset,
  reducedMotion,
}: {
  icon: ReactNode;
  motionPreset: DropdownButtonMotionPreset;
  reducedMotion: boolean;
}) {
  const motionDisabled = reducedMotion || motionPreset === "none";

  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.span
        key={getDropdownButtonNodeKey(icon, "primary-icon")}
        animate={motionDisabled ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        initial={motionDisabled ? false : { opacity: 0, scale: 0.9 }}
        exit={motionDisabled ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
        data-slot="dropdown-button-primary-icon"
        className="inline-flex size-4 items-center justify-center"
        transition={{
          duration: motionDisabled
            ? 0
            : dropdownButtonChevronDuration[motionPreset],
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {icon}
      </motion.span>
    </AnimatePresence>
  );
}

function DropdownButtonBusyIndicator({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  return (
    <motion.span
      key="dropdown-button-busy"
      animate={reducedMotion ? { opacity: 0.7 } : { opacity: 1, rotate: 360 }}
      initial={reducedMotion ? false : { opacity: 0, rotate: 0 }}
      data-slot="dropdown-button-busy-indicator"
      className={dropdownButtonBusyIndicatorClasses}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.8,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }
      }
    />
  );
}

export const DropdownButton = forwardRef<HTMLDivElement, DropdownButtonProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      arrowBoundaryOffset,
      children,
      className,
      containerPadding,
      contentClassName,
      crossOffset,
      defaultOpen = false,
      disabled = false,
      groupClassName,
      label,
      loading = false,
      loadingBehavior = "all",
      menuClassName,
      menuDisabled = false,
      menuLabel,
      mode = "menu",
      motionPreset = "standard",
      offset,
      onOpenChange,
      onPrimaryAction,
      open,
      placement,
      primaryDisabled = false,
      primaryIcon,
      reducedMotion,
      shouldFlip,
      showArrow = false,
      size = "md",
      triggerClassName,
      variant = "outline",
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const compositeRef = useRef<HTMLDivElement>(null);
    const primaryRef = useRef<HTMLElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const isControlled = open !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const resolvedReducedMotion =
      reducedMotion ?? prefersReducedMotion === true;
    const isSplit = mode === "split";
    const primaryUnavailable = disabled || primaryDisabled || loading;
    const menuUnavailable =
      disabled || menuDisabled || (loading && loadingBehavior === "all");
    const effectiveOpen = resolvedOpen && !menuUnavailable;
    const groupLabel = ariaLabelledBy
      ? undefined
      : (ariaLabel ?? (typeof label === "string" ? label : undefined));
    const handleOpenChange = (nextOpen: boolean) => {
      if (nextOpen && menuUnavailable) {
        return;
      }

      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    };
    useEffect(() => {
      if (!resolvedOpen || !menuUnavailable) {
        return undefined;
      }

      if (!isControlled) {
        setUncontrolledOpen(false);
      }
      onOpenChange?.(false);

      if (isSplit && !primaryUnavailable) {
        const frame = requestAnimationFrame(() => primaryRef.current?.focus());
        return () => cancelAnimationFrame(frame);
      }

      return undefined;
    }, [
      isControlled,
      isSplit,
      menuUnavailable,
      onOpenChange,
      primaryUnavailable,
      resolvedOpen,
    ]);
    const chevron = (
      <ChevronDownIcon
        motionPreset={motionPreset}
        open={effectiveOpen}
        reducedMotion={resolvedReducedMotion}
      />
    );

    return (
      <div
        ref={ref}
        data-disabled={disabled ? "" : undefined}
        data-loading={loading ? "" : undefined}
        data-loading-behavior={isSplit ? loadingBehavior : undefined}
        data-menu-disabled={menuUnavailable ? "" : undefined}
        data-mode={mode}
        data-motion={motionPreset}
        data-open={effectiveOpen ? "" : undefined}
        data-primary-disabled={primaryUnavailable ? "" : undefined}
        data-reduced-motion={resolvedReducedMotion ? "" : undefined}
        data-slot="dropdown-button"
        data-state={effectiveOpen ? "open" : "closed"}
        className={dropdownButtonClassNames({ className })}
      >
        <DropdownMenu
          className="contents"
          data-slot="dropdown-button-menu-anchor"
          motionPreset={motionPreset}
          onOpenChange={handleOpenChange}
          open={effectiveOpen}
          reducedMotion={resolvedReducedMotion}
        >
          <ButtonGroup
            ref={compositeRef}
            aria-label={groupLabel}
            aria-labelledby={ariaLabelledBy}
            className={groupClassName}
            data-slot="dropdown-button-composite"
          >
            {isSplit ? (
              <Button
                ref={primaryRef}
                data-slot="dropdown-button-primary"
                disabled={disabled || primaryDisabled}
                leftIcon={
                  primaryIcon ? (
                    <DropdownButtonPrimaryIcon
                      icon={primaryIcon}
                      motionPreset={motionPreset}
                      reducedMotion={resolvedReducedMotion}
                    />
                  ) : undefined
                }
                loading={loading}
                loadingIndicator={
                  <DropdownButtonBusyIndicator
                    reducedMotion={resolvedReducedMotion}
                  />
                }
                onClick={onPrimaryAction}
                size={size}
                variant={variant}
              >
                <DropdownButtonPrimaryLabel
                  label={label}
                  motionPreset={motionPreset}
                  reducedMotion={resolvedReducedMotion}
                />
              </Button>
            ) : null}
            <DropdownMenuTrigger
              aria-describedby={ariaDescribedBy}
              aria-label={isSplit ? menuLabel : ariaLabel}
              aria-labelledby={isSplit ? undefined : ariaLabelledBy}
              className={cn(
                isSplit && dropdownButtonSplitTriggerSizeClasses[size],
                triggerClassName,
              )}
              data-slot={
                isSplit
                  ? "dropdown-button-menu-trigger"
                  : "dropdown-button-trigger"
              }
              disabled={menuUnavailable}
              size={isSplit ? "icon" : size}
              variant={variant}
            >
              {isSplit ? (
                chevron
              ) : (
                <>
                  <span data-slot="dropdown-button-label">{label}</span>
                  {chevron}
                </>
              )}
            </DropdownMenuTrigger>
          </ButtonGroup>
          <DropdownMenuContent
            anchorRef={isSplit ? compositeRef : undefined}
            arrowBoundaryOffset={arrowBoundaryOffset}
            className={cn("min-w-[var(--trigger-width)]", contentClassName)}
            containerPadding={containerPadding}
            crossOffset={crossOffset}
            data-slot="dropdown-button-content"
            menuClassName={menuClassName}
            offset={offset}
            placement={placement}
            shouldFlip={shouldFlip}
            showArrow={showArrow}
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

DropdownButton.displayName = "DropdownButton";
