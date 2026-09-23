import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";
import { markSidebarShellPart } from "../../utils/sidebar-shell-part";

export type BottomBarSize = "sm" | "md" | "lg";
export interface BottomBarProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: BottomBarSize;
  /** Content height: a CSS length, or pixels when a number. */
  height?: string | number;
  /** Maximum total bar height, including its header. Defaults to 40dvh. */
  maxHeight?: string | number;
  span?: "content" | "shell";
  /** Stable ID shared by the content and every trigger. */
  contentId?: string;
}
export type BottomBarHeaderProps = HTMLAttributes<HTMLDivElement>;
export interface BottomBarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  expandLabel?: string;
  collapseLabel?: string;
}
export type BottomBarContentProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "id" | "hidden"
>;

type BottomBarState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  setContentFocused: (focused: boolean) => void;
};
const BottomBarContext = createContext<BottomBarState | null>(null);
function useBottomBar() {
  const context = useContext(BottomBarContext);
  if (!context)
    throw new Error("BottomBar parts must be used inside BottomBar.");
  return context;
}
const sizes: Record<BottomBarSize, string> = {
  sm: "10rem",
  md: "16rem",
  lg: "24rem",
};
const length = (value: string | number) =>
  typeof value === "number" ? `${value}px` : value;

export const BottomBar = forwardRef<HTMLDivElement, BottomBarProps>(
  function BottomBar(
    {
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      size = "md",
      height,
      maxHeight = "40dvh",
      span = "content",
      contentId: providedId,
      children,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = controlledOpen ?? internalOpen;
    const generatedId = useId();
    const contentId = providedId ?? `bottom-bar-${generatedId}`;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const contentFocusedRef = useRef(false);
    const setOpen = (next: boolean) => {
      if (next === open) return;
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    useEffect(() => {
      if (!open && contentFocusedRef.current) {
        rootRef.current
          ?.querySelector<HTMLButtonElement>(
            '[data-slot="bottom-bar-trigger"]:not(:disabled)',
          )
          ?.focus();
        contentFocusedRef.current = false;
      }
    }, [open]);
    return (
      <BottomBarContext.Provider
        value={{
          open,
          setOpen,
          contentId,
          setContentFocused: (focused) => {
            contentFocusedRef.current = focused;
          },
        }}
      >
        <div
          {...props}
          ref={(node) => {
            rootRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          data-slot="bottom-bar"
          data-state={open ? "open" : "closed"}
          data-size={size}
          data-span={span}
          className={cn(
            "border-border bg-background text-foreground relative row-start-3 grid max-h-[min(var(--bottom-bar-max-height),var(--bottom-bar-shell-limit,var(--bottom-bar-max-height)))] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-t data-[span=shell]:col-span-full data-[span=shell]:row-start-2 data-[span=shell]:rounded-xl data-[span=shell]:border",
            className,
          )}
          style={
            {
              "--bottom-bar-height": length(height ?? sizes[size]),
              "--bottom-bar-max-height": length(maxHeight),
              ...style,
            } as CSSProperties
          }
        >
          {children}
        </div>
      </BottomBarContext.Provider>
    );
  },
);
markSidebarShellPart(BottomBar, "Footer");

export const BottomBarHeader = forwardRef<HTMLDivElement, BottomBarHeaderProps>(
  function BottomBarHeader({ className, ...props }, ref) {
    const { open } = useBottomBar();
    return (
      <div
        {...props}
        ref={ref}
        data-slot="bottom-bar-header"
        data-state={open ? "open" : "closed"}
        className={cn(
          "bg-muted/20 flex min-w-0 flex-wrap items-center gap-[var(--dt-density-gap)] px-3 py-[var(--dt-density-gap)]",
          className,
        )}
      />
    );
  },
);

export const BottomBarTrigger = forwardRef<
  HTMLButtonElement,
  BottomBarTriggerProps
>(function BottomBarTrigger(
  {
    children,
    className,
    onClick,
    expandLabel = "Expand bottom bar",
    collapseLabel = "Collapse bottom bar",
    ...props
  },
  ref,
) {
  const { open, setOpen, contentId } = useBottomBar();
  return (
    <button
      type="button"
      aria-label={
        children == null ? (open ? collapseLabel : expandLabel) : undefined
      }
      {...props}
      ref={ref}
      data-slot="bottom-bar-trigger"
      data-state={open ? "open" : "closed"}
      aria-controls={contentId}
      aria-expanded={open}
      className={cn(
        "border-border bg-background hover:bg-muted focus-visible:outline-ring inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-2 text-sm focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
    >
      {children ?? (
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d={open ? "m6 9 6 6 6-6" : "m6 15 6-6 6 6"} />
        </svg>
      )}
    </button>
  );
});

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- A bounded scroll region must be focusable for keyboard scrolling. */
export const BottomBarContent = forwardRef<
  HTMLDivElement,
  BottomBarContentProps
>(function BottomBarContent(
  { className, onFocusCapture, onBlurCapture, ...props },
  ref,
) {
  const { open, contentId, setContentFocused } = useBottomBar();
  return (
    <div
      role="region"
      aria-label="Bottom bar content"
      tabIndex={0}
      {...props}
      ref={ref}
      id={contentId}
      hidden={!open}
      data-slot="bottom-bar-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "border-border focus-visible:ring-ring h-[var(--bottom-bar-height)] max-h-full min-h-0 min-w-0 overflow-auto overscroll-contain border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset",
        className,
      )}
      onFocusCapture={(event) => {
        setContentFocused(true);
        onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setContentFocused(false);
        onBlurCapture?.(event);
      }}
    />
  );
});

/* eslint-enable jsx-a11y/no-noninteractive-tabindex */
