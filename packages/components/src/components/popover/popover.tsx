import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Popover as AriaPopover,
  type ButtonProps as AriaButtonProps,
  type DialogRenderProps as AriaDialogRenderProps,
  type DialogTriggerProps as AriaDialogTriggerProps,
  type HeadingProps as AriaHeadingProps,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buttonClassNames,
  type ButtonSize,
  type ButtonVariant,
} from "../button";
import {
  DethinkPortalProvider,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import {
  PositionedOverlayArrow,
  type PositionedOverlayArrowProps,
  positionedOverlayArrowClassNames,
  positionedOverlayPopoverDefaults,
  positionedOverlaySurfaceClassNames,
  resolvePositionedOverlayPositionProps,
} from "../../utils/positioned-overlay";
import { cn } from "../../utils/cn";

export interface PopoverProps extends Omit<
  AriaDialogTriggerProps,
  "children" | "isOpen" | "onOpenChange"
> {
  anchorRef?: AriaPopoverProps["triggerRef"];
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export interface PopoverTriggerProps extends Omit<
  AriaButtonProps,
  "children" | "className" | "isDisabled"
> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface PopoverContentProps extends Omit<
  AriaPopoverProps,
  | "children"
  | "className"
  | "defaultOpen"
  | "isKeyboardDismissDisabled"
  | "isOpen"
  | "onOpenChange"
  | "UNSTABLE_portalContainer"
> {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  arrowClassName?: string;
  arrowShapeClassName?: string;
  children?: ReactNode | ((opts: AriaDialogRenderProps) => ReactNode);
  className?: string;
  keyboardDismissDisabled?: boolean;
  panelClassName?: string;
  showArrow?: boolean;
}

export interface PopoverArrowProps extends PositionedOverlayArrowProps {}

export interface PopoverHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface PopoverFooterProps extends HTMLAttributes<HTMLDivElement> {}

export interface PopoverTitleProps extends Omit<AriaHeadingProps, "className"> {
  className?: string;
  visuallyHidden?: boolean;
}

export interface PopoverDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export interface PopoverCloseProps extends PopoverTriggerProps {}

interface PopoverContentContextValue {
  defaultTitleId: string;
  setDescriptionId: (id: string | null) => void;
  setTitleId: (id: string | null) => void;
}

const PopoverContentContext = createContext<PopoverContentContextValue | null>(
  null,
);

interface PopoverRootContextValue {
  anchorRef?: AriaPopoverProps["triggerRef"];
  isAnchored: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  setTriggerElement: (element: HTMLButtonElement | null) => void;
}

const PopoverRootContext = createContext<PopoverRootContextValue | null>(null);

const popoverRootClasses = "contents";

const popoverContentClasses =
  "relative w-[var(--dt-popover-width,20rem)] max-w-[min(var(--dt-popover-max-width,24rem),calc(100vw_-_var(--dt-space-4)))] overflow-visible";

const popoverPanelClasses =
  "grid max-h-[min(calc(var(--dt-overlay-max-height,18rem)_-_var(--dt-space-6)),calc(100dvh_-_var(--dt-space-10)))] gap-[var(--dt-space-3)] overflow-auto overscroll-contain outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const popoverHeaderClasses = "grid gap-[var(--dt-space-1)] text-start";

const popoverFooterClasses =
  "flex flex-col-reverse gap-density-gap sm:flex-row sm:justify-end";

const popoverTitleClasses =
  "text-sm font-semibold leading-6 tracking-normal text-foreground";

const popoverDescriptionClasses = "text-sm leading-6 text-muted-foreground";

const visuallyHiddenClasses = "sr-only";

const popoverCloseIconClasses = "pointer-events-none size-4 shrink-0";

function renderPopoverChildren(
  children: PopoverContentProps["children"],
  opts: AriaDialogRenderProps,
) {
  return typeof children === "function" ? children(opts) : children;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      assignRef(ref, node);
    }
  };
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className={popoverCloseIconClasses}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m4.25 4.25 7.5 7.5m0-7.5-7.5 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function popoverClassNames({
  className,
}: Pick<PopoverProps, "className"> = {}) {
  return cn(popoverRootClasses, className);
}

export function popoverTriggerClassNames({
  className,
  size = "md",
  variant = "solid",
}: Pick<PopoverTriggerProps, "className" | "size" | "variant"> = {}) {
  return buttonClassNames({ className, size, variant });
}

export function popoverContentClassNames({
  className,
}: Pick<PopoverContentProps, "className"> = {}) {
  return cn(
    positionedOverlaySurfaceClassNames(),
    popoverContentClasses,
    className,
  );
}

export function popoverPanelClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(popoverPanelClasses, className);
}

export function popoverArrowClassNames({
  className,
}: Pick<PopoverArrowProps, "className"> = {}) {
  return positionedOverlayArrowClassNames({ className });
}

export function popoverHeaderClassNames({
  className,
}: Pick<PopoverHeaderProps, "className"> = {}) {
  return cn(popoverHeaderClasses, className);
}

export function popoverFooterClassNames({
  className,
}: Pick<PopoverFooterProps, "className"> = {}) {
  return cn(popoverFooterClasses, className);
}

export function popoverTitleClassNames({
  className,
  visuallyHidden = false,
}: Pick<PopoverTitleProps, "className" | "visuallyHidden"> = {}) {
  return cn(
    popoverTitleClasses,
    visuallyHidden && visuallyHiddenClasses,
    className,
  );
}

export function popoverDescriptionClassNames({
  className,
}: Pick<PopoverDescriptionProps, "className"> = {}) {
  return cn(popoverDescriptionClasses, className);
}

export function popoverCloseClassNames({
  className,
  size = "md",
  variant = "ghost",
}: Pick<PopoverCloseProps, "className" | "size" | "variant"> = {}) {
  return popoverTriggerClassNames({ className, size, variant });
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      "data-slot": dataSlot,
      anchorRef,
      children,
      className,
      defaultOpen,
      onOpenChange,
      open,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(
      defaultOpen ?? false,
    );
    const isControlled = open !== undefined;
    const isAnchored = anchorRef !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const previousOpenRef = useRef(resolvedOpen);
    const triggerElementRef = useRef<HTMLButtonElement | null>(null);
    const { portalContainer, rootRef } = useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "popover-portal-container",
    });
    const handleOpenChange = (isOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(isOpen);
      }

      onOpenChange?.(isOpen);
    };
    const rootContextValue = useMemo<PopoverRootContextValue>(
      () => ({
        anchorRef,
        isAnchored,
        onOpenChange: handleOpenChange,
        open: resolvedOpen,
        setTriggerElement: (element) => {
          triggerElementRef.current = element;
        },
      }),
      [anchorRef, handleOpenChange, isAnchored, resolvedOpen],
    );

    useEffect(() => {
      const wasOpen = previousOpenRef.current;

      previousOpenRef.current = resolvedOpen;

      if (wasOpen && !resolvedOpen && typeof window !== "undefined") {
        const restoreFocus = window.setTimeout(() => {
          if (isAnchored) {
            const anchorElement = anchorRef?.current;

            if (anchorElement instanceof HTMLElement) {
              anchorElement.focus();
            }

            return;
          }

          triggerElementRef.current?.focus();
        }, 0);

        return () => {
          window.clearTimeout(restoreFocus);
        };
      }

      return undefined;
    }, [anchorRef, isAnchored, resolvedOpen]);

    return (
      <div
        ref={rootRef}
        data-slot={dataSlot ?? "popover"}
        data-open={resolvedOpen ? "" : undefined}
        className={popoverClassNames({ className })}
      >
        <DethinkPortalProvider container={portalContainer}>
          <PopoverRootContext.Provider value={rootContextValue}>
            {isAnchored ? (
              children
            ) : (
              <AriaDialogTrigger
                {...props}
                isOpen={resolvedOpen}
                onOpenChange={handleOpenChange}
              >
                {children}
              </AriaDialogTrigger>
            )}
          </PopoverRootContext.Provider>
        </DethinkPortalProvider>
      </div>
    );
  },
);

Popover.displayName = "Popover";

export const PopoverTrigger = forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>(
  (
    {
      children,
      className,
      disabled = false,
      size = "md",
      variant = "solid",
      ...props
    },
    ref,
  ) => {
    const rootContext = useContext(PopoverRootContext);
    const setTriggerRef = (node: HTMLButtonElement | null) => {
      rootContext?.setTriggerElement(node);
    };

    return (
      <AriaButton
        {...props}
        ref={composeRefs(ref, setTriggerRef)}
        data-slot="popover-trigger"
        isDisabled={disabled}
        className={popoverTriggerClassNames({ className, size, variant })}
      >
        {children}
      </AriaButton>
    );
  },
);

PopoverTrigger.displayName = "PopoverTrigger";

export const PopoverContent = forwardRef<HTMLElement, PopoverContentProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      arrowClassName,
      arrowShapeClassName,
      children,
      className,
      containerPadding,
      crossOffset,
      arrowBoundaryOffset,
      keyboardDismissDisabled = false,
      offset,
      panelClassName,
      placement,
      shouldFlip,
      showArrow = false,
      ...props
    },
    ref,
  ) => {
    const defaultTitleId = useId();
    const [titleId, setTitleId] = useState<string | null>(null);
    const [descriptionId, setDescriptionId] = useState<string | null>(null);
    const labelledBy =
      ariaLabelledBy ?? (ariaLabel ? undefined : (titleId ?? undefined));
    const describedBy = ariaDescribedBy ?? descriptionId ?? undefined;
    const positionProps = resolvePositionedOverlayPositionProps(
      {
        arrowBoundaryOffset,
        containerPadding,
        crossOffset,
        offset,
        placement,
        shouldFlip,
      },
      positionedOverlayPopoverDefaults,
    );
    const contextValue = useMemo(
      () => ({
        defaultTitleId,
        setDescriptionId,
        setTitleId,
      }),
      [defaultTitleId],
    );
    const rootContext = useContext(PopoverRootContext);
    const anchoredPopoverProps: Partial<
      Pick<AriaPopoverProps, "isOpen" | "onOpenChange" | "triggerRef">
    > = {};

    if (rootContext?.isAnchored && rootContext.anchorRef) {
      anchoredPopoverProps.isOpen = rootContext.open;
      anchoredPopoverProps.onOpenChange = rootContext.onOpenChange;
      anchoredPopoverProps.triggerRef = rootContext.anchorRef;
    }

    return (
      <AriaPopover
        {...props}
        {...anchoredPopoverProps}
        {...positionProps}
        ref={ref}
        data-slot="popover-content"
        isKeyboardDismissDisabled={keyboardDismissDisabled}
        className={popoverContentClassNames({ className })}
      >
        {showArrow ? (
          <PopoverArrow
            className={arrowClassName}
            shapeClassName={arrowShapeClassName}
          />
        ) : null}
        <AriaDialog
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          data-slot="popover-panel"
          className={popoverPanelClassNames({ className: panelClassName })}
        >
          {(opts) => (
            <PopoverContentContext.Provider value={contextValue}>
              {renderPopoverChildren(children, opts)}
            </PopoverContentContext.Provider>
          )}
        </AriaDialog>
      </AriaPopover>
    );
  },
);

PopoverContent.displayName = "PopoverContent";

export const PopoverArrow = forwardRef<HTMLDivElement, PopoverArrowProps>(
  ({ className, ...props }, ref) => (
    <PositionedOverlayArrow
      {...props}
      ref={ref}
      data-slot="popover-arrow"
      className={className}
    />
  ),
);

PopoverArrow.displayName = "PopoverArrow";

export const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="popover-header"
      className={popoverHeaderClassNames({ className })}
    />
  ),
);

PopoverHeader.displayName = "PopoverHeader";

export const PopoverFooter = forwardRef<HTMLDivElement, PopoverFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="popover-footer"
      className={popoverFooterClassNames({ className })}
    />
  ),
);

PopoverFooter.displayName = "PopoverFooter";

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  ({ className, id, level = 2, visuallyHidden = false, ...props }, ref) => {
    const context = useContext(PopoverContentContext);
    const resolvedId = id ?? context?.defaultTitleId;

    useEffect(() => {
      if (!resolvedId) {
        return undefined;
      }

      context?.setTitleId(resolvedId);

      return () => {
        context?.setTitleId(null);
      };
    }, [context, resolvedId]);

    return (
      <AriaHeading
        {...props}
        ref={ref}
        id={resolvedId}
        level={level}
        data-slot="popover-title"
        className={popoverTitleClassNames({ className, visuallyHidden })}
      />
    );
  },
);

PopoverTitle.displayName = "PopoverTitle";

export const PopoverDescription = forwardRef<
  HTMLParagraphElement,
  PopoverDescriptionProps
>(({ className, id, ...props }, ref) => {
  const context = useContext(PopoverContentContext);
  const generatedId = useId();
  const resolvedId = id ?? generatedId;

  useEffect(() => {
    context?.setDescriptionId(resolvedId);

    return () => {
      context?.setDescriptionId(null);
    };
  }, [context, resolvedId]);

  return (
    <p
      {...props}
      ref={ref}
      id={resolvedId}
      data-slot="popover-description"
      className={popoverDescriptionClassNames({ className })}
    />
  );
});

PopoverDescription.displayName = "PopoverDescription";

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  (
    {
      "aria-label": ariaLabel,
      children,
      className,
      disabled = false,
      onPress,
      size,
      variant = "ghost",
      ...props
    },
    ref,
  ) => {
    const hasVisibleChildren = children != null;
    const resolvedSize = size ?? (hasVisibleChildren ? "md" : "icon");
    const rootContext = useContext(PopoverRootContext);

    return (
      <AriaButton
        {...props}
        ref={ref}
        aria-label={
          ariaLabel ?? (hasVisibleChildren ? undefined : "Close popover")
        }
        isDisabled={disabled}
        onPress={(event) => {
          onPress?.(event);

          if (rootContext?.isAnchored) {
            rootContext.onOpenChange(false);
          }
        }}
        slot="close"
        data-slot="popover-close"
        className={popoverCloseClassNames({
          className,
          size: resolvedSize,
          variant,
        })}
      >
        {hasVisibleChildren ? children : <CloseIcon />}
      </AriaButton>
    );
  },
);

PopoverClose.displayName = "PopoverClose";
