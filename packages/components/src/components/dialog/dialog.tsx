import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal,
  ModalOverlay,
  type ButtonProps as AriaButtonProps,
  type DialogRenderProps as AriaDialogRenderProps,
  type DialogTriggerProps as AriaDialogTriggerProps,
  type HeadingProps as AriaHeadingProps,
  type ModalOverlayProps as AriaModalOverlayProps,
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
import { cn } from "../../utils/cn";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
export type DialogScrollBehavior = "inside" | "outside";

export interface DialogProps
  extends Omit<
    AriaDialogTriggerProps,
    "children" | "isOpen" | "onOpenChange"
  > {
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export interface DialogTriggerProps
  extends Omit<AriaButtonProps, "children" | "className"> {
  children?: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface DialogContentProps
  extends Omit<
    AriaModalOverlayProps,
    | "children"
    | "className"
    | "defaultOpen"
    | "isDismissable"
    | "isKeyboardDismissDisabled"
    | "isOpen"
    | "onOpenChange"
    | "UNSTABLE_portalContainer"
  > {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode | ((opts: AriaDialogRenderProps) => ReactNode);
  className?: string;
  dismissible?: boolean;
  keyboardDismissDisabled?: boolean;
  overlayClassName?: string;
  scrollBehavior?: DialogScrollBehavior;
  size?: DialogSize;
}

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export interface DialogTitleProps
  extends Omit<AriaHeadingProps, "className"> {
  className?: string;
  visuallyHidden?: boolean;
}

export interface DialogDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export interface DialogCloseProps extends DialogTriggerProps {}

interface DialogContentContextValue {
  titleId: string;
  setDescriptionId: (id: string | null) => void;
}

const DialogContentContext =
  createContext<DialogContentContextValue | null>(null);

interface DialogRootContextValue {
  setTriggerElement: (element: HTMLButtonElement | null) => void;
}

const DialogRootContext = createContext<DialogRootContextValue | null>(null);

const dialogRootClasses = "contents";

const dialogOverlayBaseClasses =
  "fixed inset-0 z-50 grid min-h-dvh place-items-center overflow-y-auto overscroll-contain bg-foreground/35 p-[var(--dt-space-4)] text-foreground outline-none motion-safe:transition-opacity motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:opacity-0 sm:p-[var(--dt-space-6)]";

const dialogContentBaseClasses =
  "relative grid w-full overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-xl outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-[entering]:opacity-100 data-[exiting]:translate-y-2 data-[exiting]:opacity-0 data-[exiting]:scale-[0.98]";

const dialogContentSizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "min-h-[calc(100dvh-(env(safe-area-inset-top)+env(safe-area-inset-bottom)+var(--dt-space-8)))] max-w-[calc(100vw-(env(safe-area-inset-left)+env(safe-area-inset-right)+var(--dt-space-8)))]",
};

const dialogContentScrollBehaviorClasses: Record<DialogScrollBehavior, string> = {
  inside:
    "max-h-[calc(100dvh-(env(safe-area-inset-top)+env(safe-area-inset-bottom)+var(--dt-space-8)))] overflow-y-auto overscroll-contain",
  outside: "my-[var(--dt-space-4)] overflow-visible",
};

const dialogPanelClasses = "contents";

const dialogHeaderClasses =
  "grid gap-[var(--dt-space-1-5)] p-[var(--dt-space-6)] pb-[var(--dt-space-3)] text-start";

const dialogFooterClasses =
  "flex flex-col-reverse gap-density-gap p-[var(--dt-space-6)] pt-[var(--dt-space-3)] sm:flex-row sm:justify-end";

const dialogTitleClasses =
  "text-lg font-semibold leading-7 tracking-normal text-foreground";

const dialogDescriptionClasses =
  "text-sm leading-6 text-muted-foreground";

const visuallyHiddenClasses =
  "sr-only";

const dialogCloseIconClasses =
  "pointer-events-none size-4 shrink-0";

function joinIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(" ") || undefined;
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

function renderDialogChildren(
  children: DialogContentProps["children"],
  opts: AriaDialogRenderProps,
) {
  const renderedChildren = typeof children === "function" ? children(opts) : children;

  return renderedChildren;
}

export function dialogClassNames({
  className,
}: Pick<DialogProps, "className"> = {}) {
  return cn(dialogRootClasses, className);
}

export function dialogTriggerClassNames({
  className,
  size = "md",
  variant = "solid",
}: Pick<DialogTriggerProps, "className" | "size" | "variant"> = {}) {
  return buttonClassNames({ className, size, variant });
}

export function dialogOverlayClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(dialogOverlayBaseClasses, className);
}

export function dialogContentClassNames({
  className,
  scrollBehavior = "inside",
  size = "md",
}: Pick<DialogContentProps, "className" | "scrollBehavior" | "size"> = {}) {
  return cn(
    dialogContentBaseClasses,
    dialogContentSizeClasses[size],
    dialogContentScrollBehaviorClasses[scrollBehavior],
    className,
  );
}

export function dialogHeaderClassNames({
  className,
}: Pick<DialogHeaderProps, "className"> = {}) {
  return cn(dialogHeaderClasses, className);
}

export function dialogFooterClassNames({
  className,
}: Pick<DialogFooterProps, "className"> = {}) {
  return cn(dialogFooterClasses, className);
}

export function dialogTitleClassNames({
  className,
  visuallyHidden = false,
}: Pick<DialogTitleProps, "className" | "visuallyHidden"> = {}) {
  return cn(dialogTitleClasses, visuallyHidden && visuallyHiddenClasses, className);
}

export function dialogDescriptionClassNames({
  className,
}: Pick<DialogDescriptionProps, "className"> = {}) {
  return cn(dialogDescriptionClasses, className);
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className={dialogCloseIconClasses}
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

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      "data-slot": dataSlot,
      children,
      className,
      defaultOpen,
      onOpenChange,
      open,
      ...props
    },
    ref,
  ) => {
    const triggerElementRef = useRef<HTMLButtonElement | null>(null);
    const {
      portalContainer,
      rootRef,
    } = useProviderPortalRoot<HTMLDivElement>({
      forwardedRef: ref,
      portalSlot: "dialog-portal-container",
    });
    const rootContextValue = useMemo<DialogRootContextValue>(
      () => ({
        setTriggerElement: (element) => {
          triggerElementRef.current = element;
        },
      }),
      [],
    );
    const handleOpenChange = (isOpen: boolean) => {
      onOpenChange?.(isOpen);

      if (!isOpen && typeof window !== "undefined") {
        window.setTimeout(() => {
          triggerElementRef.current?.focus();
        }, 0);
      }
    };

    return (
      <div
        ref={rootRef}
        data-slot={dataSlot ?? "dialog"}
        className={dialogClassNames({ className })}
      >
        <DethinkPortalProvider container={portalContainer}>
          <DialogRootContext.Provider value={rootContextValue}>
            <AriaDialogTrigger
              {...props}
              defaultOpen={defaultOpen}
              isOpen={open}
              onOpenChange={handleOpenChange}
            >
              {children}
            </AriaDialogTrigger>
          </DialogRootContext.Provider>
        </DethinkPortalProvider>
      </div>
    );
  },
);

Dialog.displayName = "Dialog";

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  (
    {
      children,
      className,
      size = "md",
      variant = "solid",
      ...props
    },
    ref,
  ) => {
    const rootContext = useContext(DialogRootContext);
    const setTriggerRef = (node: HTMLButtonElement | null) => {
      rootContext?.setTriggerElement(node);
    };

    return (
      <AriaButton
        {...props}
        ref={composeRefs(ref, setTriggerRef)}
        data-slot="dialog-trigger"
        className={dialogTriggerClassNames({ className, size, variant })}
      >
        {children}
      </AriaButton>
    );
  },
);

DialogTrigger.displayName = "DialogTrigger";

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      children,
      className,
      dismissible = false,
      keyboardDismissDisabled = false,
      overlayClassName,
      scrollBehavior = "inside",
      shouldCloseOnInteractOutside,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const titleId = useId();
    const [descriptionId, setDescriptionId] = useState<string | null>(null);
    const contextValue = useMemo(
      () => ({
        setDescriptionId,
        titleId,
      }),
      [titleId],
    );
    const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : titleId);

    return (
      <ModalOverlay
        {...props}
        data-slot="dialog-overlay"
        isDismissable={dismissible}
        isKeyboardDismissDisabled={keyboardDismissDisabled}
        shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
        className={dialogOverlayClassNames({ className: overlayClassName })}
      >
        <Modal
          ref={ref}
          data-slot="dialog-content"
          data-size={size}
          data-scroll-behavior={scrollBehavior}
          className={dialogContentClassNames({
            className,
            scrollBehavior,
            size,
          })}
        >
          <AriaDialog
            aria-describedby={joinIds(ariaDescribedBy, descriptionId ?? undefined)}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            className={dialogPanelClasses}
            data-slot="dialog-panel"
            role="dialog"
          >
            {(opts) => (
              <DialogContentContext.Provider value={contextValue}>
                {renderDialogChildren(children, opts)}
              </DialogContentContext.Provider>
            )}
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    );
  },
);

DialogContent.displayName = "DialogContent";

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="dialog-header"
      className={dialogHeaderClassNames({ className })}
    />
  ),
);

DialogHeader.displayName = "DialogHeader";

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="dialog-footer"
      className={dialogFooterClassNames({ className })}
    />
  ),
);

DialogFooter.displayName = "DialogFooter";

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  (
    {
      className,
      id,
      level = 2,
      visuallyHidden = false,
      ...props
    },
    ref,
  ) => {
    const context = useContext(DialogContentContext);
    const resolvedId = id ?? context?.titleId;

    return (
      <AriaHeading
        {...props}
        ref={ref}
        id={resolvedId}
        slot="title"
        level={level}
        data-slot="dialog-title"
        className={dialogTitleClassNames({ className, visuallyHidden })}
      />
    );
  },
);

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, id, ...props }, ref) => {
  const context = useContext(DialogContentContext);
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
      data-slot="dialog-description"
      className={dialogDescriptionClassNames({ className })}
    />
  );
});

DialogDescription.displayName = "DialogDescription";

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  (
    {
      "aria-label": ariaLabel,
      children,
      className,
      size = "icon",
      variant = "ghost",
      ...props
    },
    ref,
  ) => (
    <AriaButton
      {...props}
      ref={ref}
      aria-label={ariaLabel ?? (children ? undefined : "Close dialog")}
      slot="close"
      data-slot="dialog-close"
      className={dialogTriggerClassNames({ className, size, variant })}
    >
      {children ?? <CloseIcon />}
    </AriaButton>
  ),
);

DialogClose.displayName = "DialogClose";
