import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion as motionElement,
  useReducedMotion,
} from "motion/react";
import { cn } from "../../utils/cn";
import {
  LiveRegionProvider,
  useAnnouncer,
  type LiveRegionPoliteness,
} from "../live-region";
import type { FeedbackTone } from "../alert";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export type ToastTone = Exclude<FeedbackTone, "neutral"> | "neutral";
export type ToastPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";
export type ToastMotionPreset = "none" | "subtle" | "standard" | "expressive";

export interface ToastAction {
  label: ReactNode;
  onClick: () => void;
  dismissOnClick?: boolean;
}

export interface ToastRenderContext {
  toast: ToastRecord;
  dismiss: () => void;
}

export type ToastRender =
  ReactNode | ((context: ToastRenderContext) => ReactNode);

export interface ToastRecord {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  action?: ToastAction;
  render?: ToastRender;
  duration?: number;
  persistent?: boolean;
  announcement?: string;
  announce?: boolean;
  politeness?: LiveRegionPoliteness;
  onDismiss?: () => void;
}

export type ToastInput = Omit<ToastRecord, "id"> & {
  id?: string;
};

export interface ToastProviderProps {
  children?: ReactNode;
  toasts?: ToastRecord[];
  defaultToasts?: ToastRecord[];
  onToastsChange?: (toasts: ToastRecord[]) => void;
  placement?: ToastPlacement;
  motion?: ToastMotionPreset;
  maxToasts?: number;
  defaultDuration?: number;
}

export interface ToastViewportProps extends HTMLAttributes<HTMLOListElement> {
  placement?: ToastPlacement;
  motion?: ToastMotionPreset;
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  toast: ToastRecord;
  onDismiss?: (id: string) => void;
  defaultDuration?: number;
  motion?: ToastMotionPreset;
}

export interface ToastContextValue {
  toasts: ToastRecord[];
  placement: ToastPlacement;
  motion: ToastMotionPreset;
  defaultDuration: number;
  addToast: (toast: ToastInput) => string;
  updateToast: (id: string, toast: Partial<ToastInput>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  toast: (toast: ToastInput) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastViewportBaseClasses =
  "pointer-events-none fixed z-50 m-0 flex max-h-dvh w-[min(calc(100vw-var(--dt-space-4)*2),24rem)] list-none flex-col gap-[var(--dt-space-2)] p-0 [--toast-safe-area-top:env(safe-area-inset-top)] [--toast-safe-area-bottom:env(safe-area-inset-bottom)]";

const toastPlacementClasses: Record<ToastPlacement, string> = {
  "top-start":
    "start-[var(--dt-space-4)] top-[calc(var(--dt-space-4)+var(--toast-safe-area-top))]",
  "top-center":
    "left-1/2 top-[calc(var(--dt-space-4)+var(--toast-safe-area-top))] -translate-x-1/2",
  "top-end":
    "end-[var(--dt-space-4)] top-[calc(var(--dt-space-4)+var(--toast-safe-area-top))]",
  "bottom-start":
    "bottom-[calc(var(--dt-space-4)+var(--toast-safe-area-bottom))] start-[var(--dt-space-4)] flex-col-reverse",
  "bottom-center":
    "bottom-[calc(var(--dt-space-4)+var(--toast-safe-area-bottom))] left-1/2 -translate-x-1/2 flex-col-reverse",
  "bottom-end":
    "bottom-[calc(var(--dt-space-4)+var(--toast-safe-area-bottom))] end-[var(--dt-space-4)] flex-col-reverse",
};

const toastBaseClasses =
  "pointer-events-auto grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-[var(--dt-space-3)] rounded-lg border bg-background p-[var(--dt-space-4)] text-sm leading-6 text-foreground shadow-lg outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background";

const toastToneClasses: Record<ToastTone, string> = {
  neutral: "border-border",
  info: "border-info/35",
  success: "border-success/35",
  warning: "border-warning/45",
  destructive: "border-destructive/40",
};

const toastTitleClasses = "font-medium text-foreground";
const toastDescriptionClasses = "text-muted-foreground";
const toastRenderClasses = "min-w-0";
const toastActionClasses =
  "inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-[var(--dt-space-3)] text-sm font-medium text-foreground outline-none motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const toastDismissClasses =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const toastMotionSettings: Record<
  ToastMotionPreset,
  {
    offset: number;
    duration: number;
    scale: number;
  }
> = {
  none: { duration: 0, offset: 0, scale: 1 },
  subtle: { duration: 0.16, offset: 8, scale: 0.99 },
  standard: { duration: 0.2, offset: 14, scale: 0.98 },
  expressive: { duration: 0.28, offset: 20, scale: 0.96 },
};

function getToastAnnouncement(toast: ToastRecord) {
  if (toast.announcement) {
    return toast.announcement;
  }

  return [toast.title, toast.description]
    .filter(
      (part): part is string => typeof part === "string" && part.length > 0,
    )
    .join(". ");
}

function createToastId(prefix: string, count: number) {
  return `${prefix}-${count}`;
}

function getNextToasts(
  current: ToastRecord[],
  next: ToastRecord[],
  maxToasts?: number,
) {
  if (!maxToasts || next.length <= maxToasts) {
    return next;
  }

  return next.slice(next.length - maxToasts);
}

function useControlledToasts({
  defaultToasts = [],
  maxToasts,
  onToastsChange,
  toasts,
}: Pick<
  ToastProviderProps,
  "defaultToasts" | "maxToasts" | "onToastsChange" | "toasts"
>) {
  const [uncontrolledToasts, setUncontrolledToasts] = useState(defaultToasts);
  const controlled = toasts !== undefined;
  const resolvedToasts = controlled ? toasts : uncontrolledToasts;
  const latestToastsRef = useRef(resolvedToasts);
  const pendingUncontrolledChangeRef = useRef<ToastRecord[] | null>(null);

  useIsomorphicLayoutEffect(() => {
    latestToastsRef.current = resolvedToasts;
  }, [resolvedToasts]);

  const setToasts = useCallback(
    (updater: (current: ToastRecord[]) => ToastRecord[]) => {
      if (controlled) {
        const current = latestToastsRef.current;
        const next = getNextToasts(current, updater(current), maxToasts);

        latestToastsRef.current = next;
        onToastsChange?.(next);
        return;
      }

      setUncontrolledToasts((current) => {
        const next = getNextToasts(current, updater(current), maxToasts);

        latestToastsRef.current = next;
        pendingUncontrolledChangeRef.current = next;
        return next;
      });
    },
    [controlled, maxToasts, onToastsChange],
  );

  useEffect(() => {
    if (controlled || pendingUncontrolledChangeRef.current === null) {
      return;
    }

    const next = pendingUncontrolledChangeRef.current;

    pendingUncontrolledChangeRef.current = null;
    onToastsChange?.(next);
  }, [controlled, onToastsChange, uncontrolledToasts]);

  return [resolvedToasts, setToasts] as const;
}

function ToastProviderInner({
  children,
  defaultDuration = 5000,
  defaultToasts,
  maxToasts = 6,
  motion = "standard",
  onToastsChange,
  placement = "bottom-end",
  toasts,
}: ToastProviderProps) {
  const idPrefix = useRef("toast");
  const idCountRef = useRef(0);
  const announcer = useAnnouncer();
  const [resolvedToasts, setToasts] = useControlledToasts({
    defaultToasts,
    maxToasts,
    onToastsChange,
    toasts,
  });

  const dismissToast = useCallback(
    (id: string) => {
      const dismissed = resolvedToasts.find((toast) => toast.id === id);

      setToasts((current) => current.filter((toast) => toast.id !== id));
      dismissed?.onDismiss?.();
    },
    [resolvedToasts, setToasts],
  );

  const addToast = useCallback(
    (toast: ToastInput) => {
      const id =
        toast.id ?? createToastId(idPrefix.current, ++idCountRef.current);
      const record: ToastRecord = {
        ...toast,
        id,
      };

      setToasts((current) => [
        ...current.filter((item) => item.id !== id),
        record,
      ]);

      if (record.announce !== false) {
        const announcement = getToastAnnouncement(record);

        if (announcement) {
          announcer.announce(announcement, {
            politeness:
              record.politeness ??
              (record.tone === "destructive" ? "assertive" : "polite"),
          });
        }
      }

      return id;
    },
    [announcer, setToasts],
  );

  const updateToast = useCallback(
    (id: string, toast: Partial<ToastInput>) => {
      setToasts((current) =>
        current.map((item) =>
          item.id === id ? { ...item, ...toast, id } : item,
        ),
      );
    },
    [setToasts],
  );

  const clearToasts = useCallback(() => {
    setToasts(() => []);
  }, [setToasts]);

  const value = useMemo<ToastContextValue>(
    () => ({
      addToast,
      clearToasts,
      defaultDuration,
      dismissToast,
      motion,
      placement,
      toast: addToast,
      toasts: resolvedToasts,
      updateToast,
    }),
    [
      addToast,
      clearToasts,
      defaultDuration,
      dismissToast,
      motion,
      placement,
      resolvedToasts,
      updateToast,
    ],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function ToastProvider(props: ToastProviderProps) {
  return (
    <LiveRegionProvider>
      <ToastProviderInner {...props} />
    </LiveRegionProvider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}

export function toastViewportClassNames({
  className,
  placement = "bottom-end",
}: Pick<ToastViewportProps, "className" | "placement"> = {}) {
  return cn(
    toastViewportBaseClasses,
    toastPlacementClasses[placement],
    className,
  );
}

export function toastClassNames({
  className,
  tone = "neutral",
}: Pick<ToastRecord, "tone"> & { className?: string } = {}) {
  return cn(toastBaseClasses, toastToneClasses[tone], className);
}

function renderToastCustomContent(
  render: ToastRender,
  context: ToastRenderContext,
) {
  return typeof render === "function" ? render(context) : render;
}

function ToastTimer({
  defaultDuration,
  onDismiss,
  toast,
}: {
  defaultDuration: number;
  onDismiss: (id: string) => void;
  toast: ToastRecord;
}) {
  const duration = toast.duration ?? defaultDuration;

  useEffect(() => {
    if (toast.persistent || duration <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => onDismiss(toast.id), duration);

    return () => window.clearTimeout(timer);
  }, [duration, onDismiss, toast.id, toast.persistent]);

  return null;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      defaultDuration = 5000,
      motion = "standard",
      onBlur,
      onDismiss,
      onFocus,
      onKeyDown,
      onPointerEnter,
      onPointerLeave,
      toast,
      ...props
    },
    ref,
  ) => {
    const [focusWithin, setFocusWithin] = useState(false);
    const [hovered, setHovered] = useState(false);
    const paused = focusWithin || hovered;
    const dismiss = () => onDismiss?.(toast.id);
    const hasCustomRender = toast.render !== undefined && toast.render !== null;
    const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
      onBlur?.(event);

      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setFocusWithin(false);
      }
    };
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      onKeyDown?.(event);

      if (!event.defaultPrevented && event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    };

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Focus/pointer events pause dismissal and bubbled Escape dismisses the toast; actions retain native semantics.
      <div
        {...props}
        ref={ref}
        tabIndex={props.tabIndex ?? -1}
        data-slot="toast"
        data-tone={toast.tone ?? "neutral"}
        data-motion={motion}
        className={toastClassNames({ className, tone: toast.tone })}
        onBlur={handleBlur}
        onFocus={(event) => {
          setFocusWithin(true);
          onFocus?.(event);
        }}
        onKeyDown={handleKeyDown}
        onPointerEnter={(event) => {
          setHovered(true);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          setHovered(false);
          onPointerLeave?.(event);
        }}
      >
        {!paused ? (
          <ToastTimer
            defaultDuration={defaultDuration}
            onDismiss={(id) => onDismiss?.(id)}
            toast={toast}
          />
        ) : null}
        {hasCustomRender ? (
          <div data-slot="toast-render" className={toastRenderClasses}>
            {renderToastCustomContent(toast.render as ToastRender, {
              dismiss,
              toast,
            })}
          </div>
        ) : (
          <div
            data-slot="toast-content"
            className="grid min-w-0 gap-[var(--dt-space-1)]"
          >
            {toast.title ? (
              <div data-slot="toast-title" className={toastTitleClasses}>
                {toast.title}
              </div>
            ) : null}
            {toast.description ? (
              <div
                data-slot="toast-description"
                className={toastDescriptionClasses}
              >
                {toast.description}
              </div>
            ) : null}
            {toast.action ? (
              <div data-slot="toast-actions" className="pt-[var(--dt-space-2)]">
                <button
                  type="button"
                  className={toastActionClasses}
                  onClick={() => {
                    toast.action?.onClick();

                    if (toast.action?.dismissOnClick !== false) {
                      dismiss();
                    }
                  }}
                >
                  {toast.action.label}
                </button>
              </div>
            ) : null}
          </div>
        )}
        <button
          type="button"
          aria-label="Dismiss notification"
          data-slot="toast-dismiss"
          className={toastDismissClasses}
          onClick={dismiss}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    );
  },
);

Toast.displayName = "Toast";

function ToastMotionItem({
  children,
  motion,
  placement,
  toastId,
}: {
  children: ReactNode;
  motion: ToastMotionPreset;
  placement: ToastPlacement;
  toastId: string;
}) {
  const reducedMotion = useReducedMotion();
  const enabled = motion !== "none" && !reducedMotion;
  const settings = toastMotionSettings[motion];
  const fromBottom = placement.startsWith("bottom");

  if (!enabled) {
    return <li data-slot="toast-motion-item">{children}</li>;
  }

  return (
    <motionElement.li
      data-slot="toast-motion-item"
      data-motion={motion}
      key={toastId}
      layout="position"
      initial={{
        opacity: 0,
        scale: settings.scale,
        y: fromBottom ? settings.offset : -settings.offset,
      }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: settings.scale,
        y: fromBottom ? settings.offset : -settings.offset,
      }}
      transition={{ duration: settings.duration, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motionElement.li>
  );
}

export const ToastViewport = forwardRef<HTMLOListElement, ToastViewportProps>(
  (
    { className, motion: motionProp, placement: placementProp, ...props },
    ref,
  ) => {
    const context = useToast();
    const placement = placementProp ?? context.placement;
    const motion = motionProp ?? context.motion;

    return (
      <ol
        {...props}
        ref={ref}
        aria-label={props["aria-label"] ?? "Notifications"}
        data-slot="toast-viewport"
        data-placement={placement}
        data-motion={motion}
        className={toastViewportClassNames({ className, placement })}
      >
        <AnimatePresence initial={false}>
          {context.toasts.map((toast) => (
            <ToastMotionItem
              key={toast.id}
              motion={motion}
              placement={placement}
              toastId={toast.id}
            >
              <Toast
                defaultDuration={context.defaultDuration}
                motion={motion}
                toast={toast}
                onDismiss={context.dismissToast}
              />
            </ToastMotionItem>
          ))}
        </AnimatePresence>
      </ol>
    );
  },
);

ToastViewport.displayName = "ToastViewport";
