import { forwardRef, type ReactNode, useState } from "react";
import type { ButtonSize, ButtonVariant } from "../button";
import { ButtonGroup } from "../button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  type DropdownMenuMotionPreset,
} from "../dropdown-menu";
import type { PositionedOverlayPositionProps } from "../../utils/positioned-overlay";
import { cn } from "../../utils/cn";

export type DropdownButtonMode = "menu";
export type DropdownButtonMotionPreset = DropdownMenuMotionPreset;

export interface DropdownButtonMenuProps extends PositionedOverlayPositionProps {
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
  mode?: "menu";
  motionPreset?: DropdownButtonMotionPreset;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  reducedMotion?: boolean;
  showArrow?: boolean;
  size?: ButtonSize;
  triggerClassName?: string;
  variant?: ButtonVariant;

  /** Reserved for split mode. Direct primary actions are invalid in menu mode. */
  onPrimaryAction?: never;
  /** Reserved for split mode's separately named icon trigger. */
  menuLabel?: never;
  /** Reserved for split mode's async primary action. */
  loading?: never;
  /** Reserved for split mode's async policy. */
  loadingBehavior?: never;
  /** Reserved for split mode's independent primary state. */
  primaryDisabled?: never;
  /** Reserved for split mode's independent menu state. */
  menuDisabled?: never;
}

export type DropdownButtonProps = DropdownButtonMenuProps;

const dropdownButtonRootClasses = "inline-flex w-fit max-w-full";
const dropdownButtonTriggerIconClasses =
  "pointer-events-none ms-[var(--dt-space-1)] size-4 shrink-0";

export function dropdownButtonClassNames({
  className,
}: Pick<DropdownButtonProps, "className"> = {}) {
  return cn(dropdownButtonRootClasses, className);
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      data-slot="dropdown-button-trigger-icon"
      className={dropdownButtonTriggerIconClasses}
      fill="none"
      focusable="false"
      viewBox="0 0 16 16"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
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
      menuClassName,
      mode = "menu",
      motionPreset = "standard",
      offset,
      onOpenChange,
      open,
      placement,
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
    const isControlled = open !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const groupLabel = ariaLabelledBy
      ? undefined
      : (ariaLabel ?? (typeof label === "string" ? label : undefined));
    const handleOpenChange = (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    };

    return (
      <div
        ref={ref}
        data-disabled={disabled ? "" : undefined}
        data-mode={mode}
        data-motion={motionPreset}
        data-open={resolvedOpen ? "" : undefined}
        data-reduced-motion={reducedMotion ? "" : undefined}
        data-slot="dropdown-button"
        data-state={resolvedOpen ? "open" : "closed"}
        className={dropdownButtonClassNames({ className })}
      >
        <DropdownMenu
          className="contents"
          data-slot="dropdown-button-menu-anchor"
          motionPreset={motionPreset}
          onOpenChange={handleOpenChange}
          open={resolvedOpen}
          reducedMotion={reducedMotion}
        >
          <ButtonGroup
            aria-label={groupLabel}
            aria-labelledby={ariaLabelledBy}
            className={groupClassName}
            data-slot="dropdown-button-composite"
          >
            <DropdownMenuTrigger
              aria-describedby={ariaDescribedBy}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              className={triggerClassName}
              data-slot="dropdown-button-trigger"
              disabled={disabled}
              size={size}
              variant={variant}
            >
              <span data-slot="dropdown-button-label">{label}</span>
              <ChevronDownIcon />
            </DropdownMenuTrigger>
          </ButtonGroup>
          <DropdownMenuContent
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
