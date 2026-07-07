import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Modal,
  ModalOverlay,
  type ButtonProps as AriaButtonProps,
  type DialogRenderProps as AriaDialogRenderProps,
  type ModalOverlayProps as AriaModalOverlayProps,
} from "react-aria-components";
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
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
import {
  DRAWER_DEFAULT_CLOSE_THRESHOLD,
  DRAWER_DEFAULT_VELOCITY_THRESHOLD,
  type DrawerSnapPoint,
} from "./drawer-snap";
import {
  DRAWER_DEFAULT_EDGE_SWIPE_HIT_REGION_SIZE,
  DrawerEdgeSwipeZone,
  DrawerMotionHandle,
  MotionDiv,
  MotionModal,
  drawerHandleClassNames,
  getDrawerMotionPresetSettings,
  shouldEnableDrawerMotion,
  useDrawerDrag,
  useDrawerReducedMotion,
  type DragControls,
} from "./drawer-motion";
import { useDrawerBackgroundScale } from "./drawer-background-scale";
import type { DrawerDirection, DrawerMotionPreset } from "./drawer-types";

export type { DrawerDirection, DrawerMotionPreset } from "./drawer-types";
export type { DrawerSnapPoint } from "./drawer-snap";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";
export type DrawerScrollBehavior = "inside" | "outside";

export interface DrawerCloseRenderProps {
  close: () => void;
}

export interface DrawerProps {
  "data-slot"?: string;
  activeSnapPoint?: number;
  backgroundScale?: boolean;
  children?: ReactNode;
  className?: string;
  closeThreshold?: number;
  defaultOpen?: boolean;
  defaultSnapPoint?: number;
  direction?: DrawerDirection;
  dragHandleOnly?: boolean;
  edgeSwipeHitRegionSize?: number;
  edgeSwipeToOpen?: boolean;
  modal?: boolean;
  motionPreset?: DrawerMotionPreset;
  onActiveSnapPointChange?: (snapPoint: number) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  reducedMotion?: boolean;
  snapPoints?: DrawerSnapPoint[];
  velocityThreshold?: number;
}

export interface DrawerTriggerProps
  extends Omit<AriaButtonProps, "children" | "className"> {
  "data-slot"?: string;
  children?: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export interface DrawerContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | "children"
    | "className"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "onAnimationStart"
    | "onDrag"
    | "onDragEnd"
    | "onDragEnter"
    | "onDragLeave"
    | "onDragOver"
    | "onDragStart"
    | "onDrop"
    | "onTransitionCancel"
    | "onTransitionEnd"
    | "onTransitionRun"
    | "onTransitionStart"
  > {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode | ((opts: DrawerCloseRenderProps) => ReactNode);
  className?: string;
  closeButtonClassName?: string;
  closeButtonLabel?: string;
  dismissible?: boolean;
  keyboardDismissDisabled?: boolean;
  layoutId?: string;
  overlayClassName?: string;
  scrollBehavior?: DrawerScrollBehavior;
  shouldCloseOnInteractOutside?: AriaModalOverlayProps["shouldCloseOnInteractOutside"];
  showCloseButton?: boolean;
  size?: DrawerSize;
}

export interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement> {}

export interface DrawerTitleProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, "className"> {
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  visuallyHidden?: boolean;
}

export interface DrawerDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export interface DrawerCloseProps extends DrawerTriggerProps {}

export interface DrawerHandleProps extends HTMLAttributes<HTMLDivElement> {}

interface DrawerRootContextValue {
  activeSnapPoint?: number;
  backgroundScale: boolean;
  closeThreshold: number;
  defaultSnapPoint?: number;
  direction: DrawerDirection;
  dragHandleOnly: boolean;
  modal: boolean;
  motionPreset: DrawerMotionPreset;
  onActiveSnapPointChange?: (snapPoint: number) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  portalContainer: HTMLElement | null;
  reducedMotion?: boolean;
  setTriggerElement: (element: HTMLButtonElement | null) => void;
  snapPoints?: DrawerSnapPoint[];
  velocityThreshold: number;
}

const DrawerRootContext = createContext<DrawerRootContextValue | null>(null);

/**
 * Provided by an open drawer's content to any `Drawer` rendered inside it.
 * A nested `Drawer` registers itself here while its own `open` is true, so
 * the parent can recede (see `useDrawerDrag`'s `receded` option) using the
 * same spring primitives as the base drag layer — no separate animation
 * path, and no DOM-tree walking, since context already pierces the child's
 * portal.
 *
 * `portalContainer` is the parent's own resolved portal container (which
 * may itself be inherited from a further-out ancestor). A nested `Drawer`
 * portals into the SAME container instead of creating its own body-level
 * one: React Aria's modal background-inertness (`ariaHideOutside`) hides
 * everything outside a modal's own DOM subtree, and two `ModalOverlay`
 * instances mounted into two separate top-level containers do not reliably
 * exempt each other, which made a nested drawer's own dialog get hidden by
 * its parent's inertness sweep the moment it opened. Sharing one container
 * keeps the whole nested chain as a single DOM subtree, which is the
 * pattern React Aria's own nested-modal usage expects.
 */
interface DrawerNestedContextValue {
  portalContainer: HTMLElement | null;
  registerChildOpen: () => void;
  unregisterChildOpen: () => void;
}

const DrawerNestedContext = createContext<DrawerNestedContextValue | null>(null);

interface DrawerContentContextValue {
  defaultTitleId: string;
  dragControls: DragControls | null;
  hasCloseButton: boolean;
  motionEnabled: boolean;
  setDescriptionId: (id: string | null) => void;
  setTitleId: (id: string | null) => void;
}

const DrawerContentContext =
  createContext<DrawerContentContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const drawerDirectionAxis: Record<DrawerDirection, "horizontal" | "vertical"> = {
  bottom: "vertical",
  left: "horizontal",
  right: "horizontal",
  top: "vertical",
};

const drawerRootClasses = "contents";

const drawerOverlayBaseClasses =
  "fixed inset-0 z-50 bg-foreground/35 outline-none motion-safe:transition-opacity data-[entering]:opacity-100 data-[exiting]:opacity-0";

const drawerContentBaseClasses =
  "fixed z-50 flex flex-col border-border bg-background text-foreground shadow-xl outline-none motion-safe:transition-[transform,opacity,filter] motion-safe:ease-out";

/**
 * Dims a receded (auto-parented-back) drawer. Always present in the class
 * list — it is inert unless `data-drawer-receded="true"` is set — so it
 * applies identically whether or not Motion is driving the recede scale
 * transform (which is a separate, JS-driven `transform`, so it never
 * fights this `filter`-only CSS rule).
 */
const drawerContentRecedeClasses = "data-[drawer-receded=true]:brightness-90";

const drawerContentPositionClasses: Record<DrawerDirection, string> = {
  bottom:
    "inset-x-0 bottom-0 rounded-t-lg border-t data-[entering]:translate-y-0 data-[exiting]:translate-y-full data-[exiting]:opacity-0",
  left: "inset-y-0 left-0 rounded-r-lg border-r data-[entering]:translate-x-0 data-[exiting]:-translate-x-full data-[exiting]:opacity-0",
  right:
    "inset-y-0 right-0 rounded-l-lg border-l data-[entering]:translate-x-0 data-[exiting]:translate-x-full data-[exiting]:opacity-0",
  top: "inset-x-0 top-0 rounded-b-lg border-b data-[entering]:translate-y-0 data-[exiting]:-translate-y-full data-[exiting]:opacity-0",
};

const drawerPushContainerBaseClasses =
  "relative flex shrink-0 border-border bg-background text-foreground motion-safe:transition-[width,height,opacity,filter] motion-safe:ease-out";

const drawerPushBorderClasses: Record<DrawerDirection, string> = {
  bottom: "border-t",
  left: "border-r",
  right: "border-l",
  top: "border-b",
};

const drawerVerticalSizeClasses: Record<DrawerSize, string> = {
  full: "h-[calc(100dvh-(env(safe-area-inset-top)+env(safe-area-inset-bottom)))]",
  lg: "h-[75dvh]",
  md: "h-[50dvh]",
  sm: "h-[35dvh]",
  xl: "h-[90dvh]",
};

const drawerHorizontalSizeClasses: Record<DrawerSize, string> = {
  full: "w-[calc(100vw-(env(safe-area-inset-left)+env(safe-area-inset-right)))]",
  lg: "w-[32rem]",
  md: "w-96",
  sm: "w-80",
  xl: "w-[40rem]",
};

const drawerContentScrollBehaviorClasses: Record<DrawerScrollBehavior, string> = {
  inside: "overflow-y-auto overscroll-contain",
  outside: "overflow-visible",
};

const drawerPanelClasses = "contents";

const drawerHeaderClasses =
  "grid gap-[var(--dt-space-1-5)] p-[var(--dt-space-6)] pb-[var(--dt-space-3)] text-start";

const drawerHeaderWithCloseButtonClasses =
  "pe-[calc(var(--dt-space-6)+var(--dt-space-8))]";

const drawerFooterClasses =
  "flex flex-col-reverse gap-density-gap p-[var(--dt-space-6)] pt-[var(--dt-space-3)] sm:flex-row sm:justify-end";

const drawerTitleClasses =
  "text-lg font-semibold leading-7 tracking-normal text-foreground";

const drawerDescriptionClasses = "text-sm leading-6 text-muted-foreground";

const visuallyHiddenClasses = "sr-only";

const drawerCloseIconClasses = "pointer-events-none size-4 shrink-0";

const drawerCloseButtonClasses =
  "absolute end-[var(--dt-space-3)] top-[var(--dt-space-3)] z-10";

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

function renderDrawerChildren(
  children: DrawerContentProps["children"],
  opts: DrawerCloseRenderProps,
) {
  return typeof children === "function" ? children(opts) : children;
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className={drawerCloseIconClasses}
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

export function drawerClassNames({
  className,
}: Pick<DrawerProps, "className"> = {}) {
  return cn(drawerRootClasses, className);
}

export function drawerTriggerClassNames({
  className,
  size = "md",
  variant = "solid",
}: Pick<DrawerTriggerProps, "className" | "size" | "variant"> = {}) {
  return buttonClassNames({ className, size, variant });
}

export function drawerOverlayClassNames({
  className,
  motionPreset = "standard",
}: {
  className?: string;
  motionPreset?: DrawerMotionPreset;
} = {}) {
  return cn(
    drawerOverlayBaseClasses,
    getDrawerMotionPresetSettings(motionPreset).overlayDurationClass,
    className,
  );
}

export function drawerContentClassNames({
  className,
  direction = "bottom",
  modal = true,
  motionPreset = "standard",
  open = false,
  scrollBehavior = "inside",
  size = "md",
}: {
  className?: string;
  direction?: DrawerDirection;
  modal?: boolean;
  motionPreset?: DrawerMotionPreset;
  open?: boolean;
  scrollBehavior?: DrawerScrollBehavior;
  size?: DrawerSize;
} = {}) {
  const axis = drawerDirectionAxis[direction];
  const openSizeClass =
    axis === "vertical"
      ? drawerVerticalSizeClasses[size]
      : drawerHorizontalSizeClasses[size];
  const durationClass = getDrawerMotionPresetSettings(motionPreset).contentDurationClass;

  if (!modal) {
    const closedSizeClass = axis === "vertical" ? "h-0" : "w-0";

    return cn(
      drawerPushContainerBaseClasses,
      durationClass,
      drawerContentRecedeClasses,
      drawerPushBorderClasses[direction],
      axis === "vertical" ? "w-full" : "h-full",
      open ? openSizeClass : closedSizeClass,
      open ? "opacity-100" : "opacity-0",
      drawerContentScrollBehaviorClasses[scrollBehavior],
      className,
    );
  }

  return cn(
    drawerContentBaseClasses,
    durationClass,
    drawerContentRecedeClasses,
    drawerContentPositionClasses[direction],
    openSizeClass,
    drawerContentScrollBehaviorClasses[scrollBehavior],
    className,
  );
}

export function drawerHeaderClassNames({
  className,
  hasCloseButton = false,
}: Pick<DrawerHeaderProps, "className"> & {
  hasCloseButton?: boolean;
} = {}) {
  return cn(
    drawerHeaderClasses,
    hasCloseButton && drawerHeaderWithCloseButtonClasses,
    className,
  );
}

export function drawerFooterClassNames({
  className,
}: Pick<DrawerFooterProps, "className"> = {}) {
  return cn(drawerFooterClasses, className);
}

export function drawerTitleClassNames({
  className,
  visuallyHidden = false,
}: Pick<DrawerTitleProps, "className" | "visuallyHidden"> = {}) {
  return cn(drawerTitleClasses, visuallyHidden && visuallyHiddenClasses, className);
}

export function drawerDescriptionClassNames({
  className,
}: Pick<DrawerDescriptionProps, "className"> = {}) {
  return cn(drawerDescriptionClasses, className);
}

export function drawerCloseButtonClassNames({
  className,
}: {
  className?: string;
} = {}) {
  return cn(drawerCloseButtonClasses, className);
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      "data-slot": dataSlot,
      activeSnapPoint,
      backgroundScale = false,
      children,
      className,
      closeThreshold = DRAWER_DEFAULT_CLOSE_THRESHOLD,
      defaultOpen,
      defaultSnapPoint,
      direction = "bottom",
      dragHandleOnly = true,
      edgeSwipeHitRegionSize = DRAWER_DEFAULT_EDGE_SWIPE_HIT_REGION_SIZE,
      edgeSwipeToOpen = false,
      modal = true,
      motionPreset = "standard",
      onActiveSnapPointChange,
      onOpenChange,
      open,
      reducedMotion,
      snapPoints,
      velocityThreshold = DRAWER_DEFAULT_VELOCITY_THRESHOLD,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
    const isControlled = open !== undefined;
    const resolvedOpen = open ?? uncontrolledOpen;
    const previousOpenRef = useRef(resolvedOpen);
    const triggerElementRef = useRef<HTMLButtonElement | null>(null);
    const prefersReducedMotion = useDrawerReducedMotion();
    const resolvedReducedMotion = reducedMotion ?? prefersReducedMotion;
    const { portalContainer: ownPortalContainer, rootRef } =
      useProviderPortalRoot<HTMLDivElement>({
        forwardedRef: ref,
        portalSlot: "drawer-portal-container",
      });
    const nestedParentContext = useContext(DrawerNestedContext);
    const portalContainer = nestedParentContext?.portalContainer ?? ownPortalContainer;

    useEffect(() => {
      if (!nestedParentContext || !resolvedOpen) {
        return undefined;
      }

      nestedParentContext.registerChildOpen();

      return () => {
        nestedParentContext.unregisterChildOpen();
      };
    }, [nestedParentContext, resolvedOpen]);

    const handleOpenChange = (isOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(isOpen);
      }

      onOpenChange?.(isOpen);
    };

    useEffect(() => {
      const wasOpen = previousOpenRef.current;

      previousOpenRef.current = resolvedOpen;

      if (wasOpen && !resolvedOpen && typeof window !== "undefined") {
        const restoreFocus = window.setTimeout(() => {
          triggerElementRef.current?.focus();
        }, 0);

        return () => {
          window.clearTimeout(restoreFocus);
        };
      }

      return undefined;
    }, [resolvedOpen]);

    const rootContextValue = useMemo<DrawerRootContextValue>(
      () => ({
        activeSnapPoint,
        backgroundScale,
        closeThreshold,
        defaultSnapPoint,
        direction,
        dragHandleOnly,
        modal,
        motionPreset,
        onActiveSnapPointChange,
        onOpenChange: handleOpenChange,
        open: resolvedOpen,
        portalContainer,
        reducedMotion,
        setTriggerElement: (element) => {
          triggerElementRef.current = element;
        },
        snapPoints,
        velocityThreshold,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        activeSnapPoint,
        backgroundScale,
        closeThreshold,
        defaultSnapPoint,
        direction,
        dragHandleOnly,
        modal,
        motionPreset,
        onActiveSnapPointChange,
        portalContainer,
        reducedMotion,
        resolvedOpen,
        isControlled,
        snapPoints,
        velocityThreshold,
      ],
    );
    const showEdgeSwipeZone =
      edgeSwipeToOpen &&
      shouldEnableDrawerMotion({ motionPreset, reducedMotion: resolvedReducedMotion }) &&
      !resolvedOpen;

    return (
      <div
        ref={rootRef}
        data-direction={direction}
        data-modal={modal ? "true" : "false"}
        data-slot={dataSlot ?? "drawer"}
        className={drawerClassNames({ className })}
      >
        <DethinkPortalProvider container={portalContainer}>
          <DrawerRootContext.Provider value={rootContextValue}>
            {children}
          </DrawerRootContext.Provider>
        </DethinkPortalProvider>
        {showEdgeSwipeZone ? (
          <DrawerEdgeSwipeZone
            direction={direction}
            hitRegionSize={edgeSwipeHitRegionSize}
            onOpenChange={handleOpenChange}
            velocityThreshold={velocityThreshold}
          />
        ) : null}
      </div>
    );
  },
);

Drawer.displayName = "Drawer";

export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  (
    {
      "data-slot": dataSlot,
      children,
      className,
      onPress,
      size = "md",
      variant = "solid",
      ...props
    },
    ref,
  ) => {
    const rootContext = useContext(DrawerRootContext);
    const setTriggerRef = (node: HTMLButtonElement | null) => {
      rootContext?.setTriggerElement(node);
    };

    return (
      <AriaButton
        {...props}
        ref={composeRefs(ref, setTriggerRef)}
        aria-expanded={rootContext?.open ?? false}
        aria-haspopup={rootContext?.modal ? "dialog" : undefined}
        data-direction={rootContext?.direction}
        data-modal={rootContext ? (rootContext.modal ? "true" : "false") : undefined}
        data-slot={dataSlot ?? "drawer-trigger"}
        className={drawerTriggerClassNames({ className, size, variant })}
        onPress={(event) => {
          rootContext?.onOpenChange(true);
          onPress?.(event);
        }}
      >
        {children}
      </AriaButton>
    );
  },
);

DrawerTrigger.displayName = "DrawerTrigger";

function DrawerPushContent(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    children,
    className,
    closeButtonClassName,
    closeButtonLabel,
    keyboardDismissDisabled,
    layoutId,
    scrollBehavior = "inside",
    showCloseButton,
    size = "md",
    ...props
  }: DrawerContentProps,
  ref: Ref<HTMLDivElement>,
) {
  const rootContext = useContext(DrawerRootContext);
  const direction = rootContext?.direction ?? "bottom";
  const open = rootContext?.open ?? false;
  const motionPreset = rootContext?.motionPreset ?? "standard";
  const outerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useDrawerReducedMotion();
  const resolvedReducedMotion = rootContext?.reducedMotion ?? prefersReducedMotion;
  const motionEnabled = shouldEnableDrawerMotion({
    motionPreset,
    reducedMotion: resolvedReducedMotion,
  });
  const [openChildCount, setOpenChildCount] = useState(0);
  const receded = openChildCount > 0;
  const nestedContextValue = useMemo<DrawerNestedContextValue>(
    () => ({
      portalContainer: rootContext?.portalContainer ?? null,
      registerChildOpen: () => setOpenChildCount((count) => count + 1),
      unregisterChildOpen: () => setOpenChildCount((count) => Math.max(0, count - 1)),
    }),
    [rootContext?.portalContainer],
  );
  const { dragControls, getMotionProps } = useDrawerDrag({
    activeSnapPoint: rootContext?.activeSnapPoint,
    closeThreshold: rootContext?.closeThreshold ?? DRAWER_DEFAULT_CLOSE_THRESHOLD,
    contentRef: outerRef,
    defaultSnapPoint: rootContext?.defaultSnapPoint,
    direction,
    motionPreset,
    onActiveSnapPointChange: rootContext?.onActiveSnapPointChange,
    onOpenChange: (nextOpen) => rootContext?.onOpenChange(nextOpen),
    open,
    receded,
    snapPoints: rootContext?.snapPoints,
    velocityThreshold:
      rootContext?.velocityThreshold ?? DRAWER_DEFAULT_VELOCITY_THRESHOLD,
  });
  const defaultTitleId = useId();
  const [titleId, setTitleId] = useState<string | null>(null);
  const [descriptionId, setDescriptionId] = useState<string | null>(null);
  const labelledBy =
    ariaLabelledBy ?? (ariaLabel ? undefined : titleId ?? defaultTitleId);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(open);
  const contextValue = useMemo(
    () => ({
      defaultTitleId,
      dragControls: motionEnabled ? dragControls : null,
      hasCloseButton: Boolean(showCloseButton),
      motionEnabled,
      setDescriptionId,
      setTitleId,
    }),
    [defaultTitleId, dragControls, motionEnabled, showCloseButton],
  );

  useEffect(() => {
    const wasOpen = wasOpenRef.current;

    wasOpenRef.current = open;

    if (
      !wasOpen &&
      open &&
      panelRef.current &&
      !panelRef.current.contains(document.activeElement)
    ) {
      panelRef.current.focus();
    }
  }, [open]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!keyboardDismissDisabled && event.key === "Escape") {
      event.stopPropagation();
      rootContext?.onOpenChange(false);
    }
  }

  const close = () => {
    rootContext?.onOpenChange(false);
  };

  const contentClassName = drawerContentClassNames({
    className,
    direction,
    modal: false,
    motionPreset,
    open,
    scrollBehavior,
    size,
  });

  const panel = (
    <div
      ref={panelRef}
      aria-describedby={joinIds(ariaDescribedBy, descriptionId ?? undefined)}
      aria-hidden={open ? undefined : true}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-modal="false"
      className={drawerPanelClasses}
      data-slot="drawer-panel"
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={-1}
    >
      <DrawerContentContext.Provider value={contextValue}>
        <DrawerNestedContext.Provider value={nestedContextValue}>
          {showCloseButton ? (
            <DrawerClose
              aria-label={closeButtonLabel ?? "Close drawer"}
              className={drawerCloseButtonClassNames({
                className: closeButtonClassName,
              })}
            />
          ) : null}
          {renderDrawerChildren(children, { close })}
        </DrawerNestedContext.Provider>
      </DrawerContentContext.Provider>
    </div>
  );

  if (!motionEnabled) {
    return (
      <div
        {...props}
        ref={composeRefs(ref, outerRef)}
        data-direction={direction}
        data-drawer-receded={receded ? "true" : undefined}
        data-modal="false"
        data-motion={motionPreset}
        data-motion-direction={direction}
        data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
        data-slot="drawer-content"
        data-state={open ? "open" : "closed"}
        className={contentClassName}
      >
        {panel}
      </div>
    );
  }

  const motionProps = getMotionProps(rootContext?.dragHandleOnly ?? true);

  return (
    <MotionDiv
      {...props}
      {...motionProps}
      layoutId={layoutId}
      ref={composeRefs(ref, outerRef)}
      data-direction={direction}
      data-drawer-receded={receded ? "true" : undefined}
      data-modal="false"
      data-motion={motionPreset}
      data-motion-direction={direction}
      data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
      data-slot="drawer-content"
      data-state={open ? "open" : "closed"}
      className={contentClassName}
    >
      {panel}
    </MotionDiv>
  );
}

const ForwardedDrawerPushContent = forwardRef(DrawerPushContent);

function DrawerModalContent(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    children,
    className,
    closeButtonClassName,
    closeButtonLabel,
    dismissible = false,
    keyboardDismissDisabled = false,
    layoutId,
    overlayClassName,
    scrollBehavior = "inside",
    shouldCloseOnInteractOutside,
    showCloseButton,
    size = "md",
    ...props
  }: DrawerContentProps,
  ref: Ref<HTMLDivElement>,
) {
  const rootContext = useContext(DrawerRootContext);
  const direction = rootContext?.direction ?? "bottom";
  const open = rootContext?.open ?? false;
  const motionPreset = rootContext?.motionPreset ?? "standard";
  const outerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useDrawerReducedMotion();
  const resolvedReducedMotion = rootContext?.reducedMotion ?? prefersReducedMotion;
  const motionEnabled = shouldEnableDrawerMotion({
    motionPreset,
    reducedMotion: resolvedReducedMotion,
  });
  const [openChildCount, setOpenChildCount] = useState(0);
  const receded = openChildCount > 0;
  const nestedContextValue = useMemo<DrawerNestedContextValue>(
    () => ({
      portalContainer: rootContext?.portalContainer ?? null,
      registerChildOpen: () => setOpenChildCount((count) => count + 1),
      unregisterChildOpen: () => setOpenChildCount((count) => Math.max(0, count - 1)),
    }),
    [rootContext?.portalContainer],
  );
  const { dragControls, getMotionProps } = useDrawerDrag({
    activeSnapPoint: rootContext?.activeSnapPoint,
    closeThreshold: rootContext?.closeThreshold ?? DRAWER_DEFAULT_CLOSE_THRESHOLD,
    contentRef: outerRef,
    defaultSnapPoint: rootContext?.defaultSnapPoint,
    direction,
    motionPreset,
    onActiveSnapPointChange: rootContext?.onActiveSnapPointChange,
    onOpenChange: (nextOpen) => rootContext?.onOpenChange(nextOpen),
    open,
    receded,
    snapPoints: rootContext?.snapPoints,
    velocityThreshold:
      rootContext?.velocityThreshold ?? DRAWER_DEFAULT_VELOCITY_THRESHOLD,
  });
  const defaultTitleId = useId();
  const [titleId, setTitleId] = useState<string | null>(null);
  const [descriptionId, setDescriptionId] = useState<string | null>(null);
  const labelledBy =
    ariaLabelledBy ?? (ariaLabel ? undefined : titleId ?? defaultTitleId);
  const contextValue = useMemo(
    () => ({
      defaultTitleId,
      dragControls: motionEnabled ? dragControls : null,
      hasCloseButton: Boolean(showCloseButton),
      motionEnabled,
      setDescriptionId,
      setTitleId,
    }),
    [defaultTitleId, dragControls, motionEnabled, showCloseButton],
  );

  useDrawerBackgroundScale({
    active: Boolean(rootContext?.backgroundScale) && open,
    reducedMotion: !motionEnabled,
  });

  const contentClassName = drawerContentClassNames({
    className,
    direction,
    modal: true,
    motionPreset,
    scrollBehavior,
    size,
  });

  const panel = (
    <AriaDialog
      aria-describedby={joinIds(ariaDescribedBy, descriptionId ?? undefined)}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={drawerPanelClasses}
      data-slot="drawer-panel"
      role="dialog"
    >
      {(opts: AriaDialogRenderProps) => (
        <DrawerContentContext.Provider value={contextValue}>
          <DrawerNestedContext.Provider value={nestedContextValue}>
            {showCloseButton ? (
              <DrawerClose
                aria-label={closeButtonLabel ?? "Close drawer"}
                className={drawerCloseButtonClassNames({
                  className: closeButtonClassName,
                })}
              />
            ) : null}
            {renderDrawerChildren(children, { close: opts.close })}
          </DrawerNestedContext.Provider>
        </DrawerContentContext.Provider>
      )}
    </AriaDialog>
  );

  return (
    <ModalOverlay
      {...props}
      isDismissable={dismissible}
      isKeyboardDismissDisabled={keyboardDismissDisabled}
      isOpen={open}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
      onOpenChange={(isOpen) => rootContext?.onOpenChange(isOpen)}
      data-direction={direction}
      data-slot="drawer-overlay"
      className={drawerOverlayClassNames({ className: overlayClassName, motionPreset })}
    >
      {motionEnabled ? (
        <MotionModal
          {...getMotionProps(rootContext?.dragHandleOnly ?? true)}
          layoutId={layoutId}
          ref={composeRefs(ref, outerRef)}
          data-direction={direction}
          data-drawer-receded={receded ? "true" : undefined}
          data-modal="true"
          data-motion={motionPreset}
          data-motion-direction={direction}
          data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
          data-slot="drawer-content"
          className={contentClassName}
        >
          {panel}
        </MotionModal>
      ) : (
        <Modal
          ref={composeRefs(ref, outerRef)}
          data-direction={direction}
          data-drawer-receded={receded ? "true" : undefined}
          data-modal="true"
          data-motion={motionPreset}
          data-motion-direction={direction}
          data-reduced-motion={resolvedReducedMotion ? "true" : undefined}
          data-slot="drawer-content"
          className={contentClassName}
        >
          {panel}
        </Modal>
      )}
    </ModalOverlay>
  );
}

const ForwardedDrawerModalContent = forwardRef(DrawerModalContent);

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  (props, ref) => {
    const rootContext = useContext(DrawerRootContext);
    const modal = rootContext?.modal ?? true;

    if (!modal) {
      return <ForwardedDrawerPushContent {...props} ref={ref} />;
    }

    return <ForwardedDrawerModalContent {...props} ref={ref} />;
  },
);

DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => {
    const context = useContext(DrawerContentContext);

    return (
      <div
        {...props}
        ref={ref}
        data-slot="drawer-header"
        className={drawerHeaderClassNames({
          className,
          hasCloseButton: context?.hasCloseButton,
        })}
      />
    );
  },
);

DrawerHeader.displayName = "DrawerHeader";

export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="drawer-footer"
      className={drawerFooterClassNames({ className })}
    />
  ),
);

DrawerFooter.displayName = "DrawerFooter";

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, id, level = 2, visuallyHidden = false, ...props }, ref) => {
    const context = useContext(DrawerContentContext);
    const generatedId = useId();
    const resolvedId = id ?? context?.defaultTitleId ?? generatedId;
    const HeadingTag = `h${level}` as const;

    useIsomorphicLayoutEffect(() => {
      context?.setTitleId(resolvedId);

      return () => {
        context?.setTitleId(null);
      };
    }, [context, resolvedId]);

    return (
      <HeadingTag
        {...props}
        ref={ref}
        id={resolvedId}
        data-slot="drawer-title"
        className={drawerTitleClassNames({ className, visuallyHidden })}
      />
    );
  },
);

DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(({ className, id, ...props }, ref) => {
  const context = useContext(DrawerContentContext);
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
      data-slot="drawer-description"
      className={drawerDescriptionClassNames({ className })}
    />
  );
});

DrawerDescription.displayName = "DrawerDescription";

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  (
    {
      "aria-label": ariaLabel,
      children,
      className,
      onPress,
      size,
      variant = "ghost",
      ...props
    },
    ref,
  ) => {
    const rootContext = useContext(DrawerRootContext);
    const hasVisibleChildren = children != null;
    const resolvedSize = size ?? (hasVisibleChildren ? "md" : "icon");

    return (
      <AriaButton
        {...props}
        ref={ref}
        aria-label={ariaLabel ?? (hasVisibleChildren ? undefined : "Close drawer")}
        data-slot="drawer-close"
        className={drawerTriggerClassNames({
          className,
          size: resolvedSize,
          variant,
        })}
        onPress={(event) => {
          rootContext?.onOpenChange(false);
          onPress?.(event);
        }}
      >
        {hasVisibleChildren ? children : <CloseIcon />}
      </AriaButton>
    );
  },
);

DrawerClose.displayName = "DrawerClose";

export const DrawerHandle = forwardRef<HTMLDivElement, DrawerHandleProps>(
  ({ className, ...props }, ref) => {
    const rootContext = useContext(DrawerRootContext);
    const contentContext = useContext(DrawerContentContext);
    const direction = rootContext?.direction ?? "bottom";

    if (contentContext?.motionEnabled && contentContext.dragControls) {
      return (
        <DrawerMotionHandle
          {...props}
          ref={ref}
          className={className}
          direction={direction}
          dragControls={contentContext.dragControls}
        />
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        aria-hidden="true"
        data-direction={direction}
        data-slot="drawer-handle"
        className={drawerHandleClassNames({ className })}
      />
    );
  },
);

DrawerHandle.displayName = "DrawerHandle";
