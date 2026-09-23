"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  type MutableRefObject,
} from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle, Minus } from "lucide-react";
import { cn } from "../../utils/cn";
import { useHydrated } from "../../utils/use-hydrated";
import {
  DethinkPortalProvider,
  DethinkOverlayScope,
  useProviderPortalRoot,
} from "../../utils/provider-portal";
import { Chat, type ChatProps } from "../chat/chat";

export type ChatBubblePosition = "bottom-right" | "bottom-left";

export interface ChatBubbleProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: ChatBubblePosition;
  /** Numbers are CSS pixels. CSS lengths can use rem, clamp(), etc. */
  offset?: number | string;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  /** Disable spatial animation regardless of the user's OS preference. */
  motion?: "auto" | "none";
  /** Supply chat for the default composition, or children for custom parts. */
  chat?: ChatProps;
  triggerProps?: ChatBubbleTriggerProps;
  contentProps?: ChatBubbleContentProps;
}

export interface ChatBubbleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount?: number;
  /** Localizable description, e.g. “3 unread messages”. */
  unreadLabel?: string;
}

export interface ChatBubbleContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  /** Replaces the default header; include ChatBubbleClose in a custom header. */
  header?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export interface ChatBubbleCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

interface BubbleContext {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
  portalContainer: HTMLElement | null;
  contentId: string;
  titleId: string;
  position: ChatBubblePosition;
  reduceMotion: boolean;
}

const Context = createContext<BubbleContext | null>(null);
function useBubble() {
  const context = useContext(Context);
  if (!context) throw new Error("ChatBubble parts must be inside ChatBubble.");
  return context;
}
const length = (value: string | number) =>
  typeof value === "number" ? `${value}px` : value;

/** A persistent, non-modal chat widget. Closing never unmounts the conversation. */
export function ChatBubble({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  position = "bottom-right",
  offset = "1.5rem",
  width = "25rem",
  height = "36rem",
  zIndex = 50,
  motion: motionPreference = "auto",
  chat,
  triggerProps,
  contentProps,
  children,
  className,
  style,
  ...props
}: ChatBubbleProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const hydrated = useHydrated();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = motionPreference === "none" || !!prefersReducedMotion;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const floating = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const { rootRef, portalContainer } = useProviderPortalRoot<HTMLSpanElement>({
    portalSlot: "chat-bubble-portal",
  });
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (controlledOpen === undefined) setLocalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange, open],
  );
  const context = useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
      portalContainer,
      contentId: `${id}-panel`,
      titleId: `${id}-title`,
      position,
      reduceMotion,
    }),
    [open, setOpen, id, position, reduceMotion, portalContainer],
  );

  // Visual viewport accounts for a mobile keyboard without changing chat state.
  useEffect(() => {
    if (!hydrated) return;
    const viewport = window.visualViewport;
    const update = () => {
      floating.current?.style.setProperty(
        "--chat-bubble-viewport-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
      floating.current?.style.setProperty(
        "--chat-bubble-keyboard-offset",
        `${Math.max(0, window.innerHeight - (viewport?.height ?? window.innerHeight) - (viewport?.offsetTop ?? 0))}px`,
      );
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [hydrated]);

  return (
    <Context.Provider value={context}>
      <span ref={rootRef} data-slot="chat-bubble-root" />
      {hydrated &&
        portalContainer &&
        createPortal(
          <DethinkOverlayScope visible={open}>
            <DethinkPortalProvider container={portalContainer}>
              <div
                {...props}
                ref={floating}
                data-slot="chat-bubble"
                data-state={open ? "open" : "closed"}
                data-position={position}
                className={cn(
                  "pointer-events-none fixed max-w-full",
                  className,
                )}
                style={
                  {
                    "--chat-bubble-offset": length(offset),
                    "--chat-bubble-width": length(width),
                    "--chat-bubble-height": length(height),
                    "--chat-bubble-edge":
                      "max(var(--chat-bubble-offset), env(safe-area-inset-left), env(safe-area-inset-right))",
                    width:
                      "min(var(--chat-bubble-width), calc(100vw - 2 * var(--chat-bubble-edge)))",
                    bottom:
                      "calc(max(var(--chat-bubble-offset), env(safe-area-inset-bottom)) + var(--chat-bubble-keyboard-offset, 0px))",
                    [position === "bottom-right" ? "right" : "left"]:
                      "var(--chat-bubble-edge)",
                    zIndex,
                    ...style,
                  } as CSSProperties
                }
              >
                {children ?? (
                  <>
                    <ChatBubbleTrigger {...triggerProps} />
                    <ChatBubbleContent {...contentProps}>
                      {chat && (
                        <Chat
                          {...chat}
                          className={cn(
                            "h-full flex-1 [&>[data-slot=message-scroller]]:min-h-0",
                            chat.className,
                          )}
                        />
                      )}
                    </ChatBubbleContent>
                  </>
                )}
              </div>
            </DethinkPortalProvider>
          </DethinkOverlayScope>,
          portalContainer,
        )}
    </Context.Provider>
  );
}

export const ChatBubbleTrigger = forwardRef<
  HTMLButtonElement,
  ChatBubbleTriggerProps
>(function ChatBubbleTrigger(
  {
    children,
    className,
    onClick,
    unreadCount = 0,
    unreadLabel,
    "aria-label": label = "Open chat",
    "aria-describedby": describedBy,
    ...props
  },
  ref,
) {
  const { open, setOpen, triggerRef, contentId, position } = useBubble();
  const unreadId = useId();
  const count = Number.isFinite(unreadCount)
    ? Math.max(0, Math.floor(unreadCount))
    : 0;
  return (
    <button
      {...props}
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type="button"
      hidden={open}
      data-slot="chat-bubble-trigger"
      aria-label={label}
      aria-describedby={
        [describedBy, count > 0 ? unreadId : undefined]
          .filter(Boolean)
          .join(" ") || undefined
      }
      aria-expanded={open}
      aria-controls={contentId}
      aria-haspopup="dialog"
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-offset-background pointer-events-auto relative flex size-14 items-center justify-center rounded-full shadow-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50 [&[hidden]]:hidden",
        position === "bottom-right" ? "ml-auto" : "mr-auto",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
    >
      {children ?? <MessageCircle aria-hidden="true" className="size-6" />}
      {count > 0 && (
        <>
          <span
            aria-hidden="true"
            className="bg-destructive text-destructive-foreground border-background absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full border-2 px-1 text-[10px] font-semibold"
          >
            {count > 99 ? "99+" : count}
          </span>
          <span id={unreadId} className="sr-only">
            {unreadLabel ?? `${count} unread messages`}
          </span>
        </>
      )}
    </button>
  );
});

export const ChatBubbleContent = forwardRef<
  HTMLDivElement,
  ChatBubbleContentProps
>(function ChatBubbleContent(
  {
    title = "Let’s talk",
    subtitle = "How can we help?",
    avatar,
    header,
    footer,
    closeLabel = "Minimize chat",
    initialFocusRef,
    children,
    className,
    style,
    onKeyDown,
    onFocusCapture,
    "aria-label": label,
    "aria-labelledby": labelledBy,
    ...props
  },
  ref,
) {
  const {
    open,
    setOpen,
    triggerRef,
    contentId,
    titleId,
    position,
    reduceMotion,
    portalContainer,
  } = useBubble();
  const panel = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const [exited, setExited] = useState(!open);
  useEffect(() => {
    const node = panel.current;
    if (!node) return;
    if (open && !wasOpen.current) {
      // Reveal before focusing; the opening animation can then run independently.
      node.removeAttribute("inert");
      (initialFocusRef?.current ?? node).focus({ preventScroll: true });
    }
    const restoreFocus =
      !open &&
      wasOpen.current &&
      (portalContainer?.contains(document.activeElement) ||
        (document.activeElement === document.body &&
          lastFocused.current !== null &&
          !lastFocused.current.isConnected));
    if (!open) node.setAttribute("inert", "");
    wasOpen.current = open;
    if (restoreFocus) {
      triggerRef.current?.focus({ preventScroll: true });
      // Nested focus scopes finish restoring focus on their next animation frame.
      const frame = requestAnimationFrame(() => {
        if (
          document.activeElement === document.body ||
          portalContainer?.contains(document.activeElement)
        ) {
          triggerRef.current?.focus({ preventScroll: true });
        }
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open, initialFocusRef, triggerRef, portalContainer]);
  return (
    <motion.div
      initial={false}
      animate={
        open
          ? { opacity: 1, scale: 1, y: 0 }
          : {
              opacity: 0,
              scale: reduceMotion ? 1 : 0.88,
              y: reduceMotion ? 0 : 16,
            }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.22,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationStart={() => {
        if (open) setExited(false);
      }}
      onAnimationComplete={() => {
        if (!open) setExited(true);
      }}
      style={{
        visibility: open || !exited ? "visible" : "hidden",
        transformOrigin:
          position === "bottom-right" ? "bottom right" : "bottom left",
        position: open ? "relative" : "absolute",
        bottom: 0,
        width: "100%",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* The non-modal dialog owns Escape dismissal, not a click interaction. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        {...props}
        ref={(node) => {
          panel.current = node;
          // Attribute form works with both React 18 and React 19.
          if (node) {
            if (open) node.removeAttribute("inert");
            else if (!wasOpen.current) node.setAttribute("inert", "");
          }
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={contentId}
        role="dialog"
        tabIndex={-1}
        aria-label={label}
        aria-labelledby={labelledBy ?? (label ? undefined : titleId)}
        aria-hidden={!open || undefined}
        onFocusCapture={(event) => {
          lastFocused.current = event.target;
          onFocusCapture?.(event);
        }}
        data-slot="chat-bubble-content"
        data-state={open ? "open" : "closed"}
        className={cn(
          "bg-background text-foreground border-border focus-visible:ring-ring flex min-h-0 flex-col overflow-hidden rounded-3xl border shadow-2xl outline-none focus-visible:ring-2",
          className,
        )}
        style={{
          height:
            "min(var(--chat-bubble-height), calc(var(--chat-bubble-viewport-height, 100dvh) - 2 * var(--chat-bubble-edge) - env(safe-area-inset-top) - env(safe-area-inset-bottom)))",
          ...style,
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            event.key === "Escape" &&
            !event.nativeEvent.isComposing &&
            open
          ) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          }
        }}
      >
        {header ?? (
          <div
            data-slot="chat-bubble-header"
            className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-[calc(var(--dt-density-gap,0.5rem)*2)]"
          >
            {avatar ?? (
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-2xl">
                <MessageCircle aria-hidden="true" className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="truncate text-sm font-semibold">
                {title}
              </h2>
              {subtitle && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {subtitle}
                </p>
              )}
            </div>
            <ChatBubbleClose aria-label={closeLabel} />
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col [&>[data-slot=chat]]:h-full [&>[data-slot=chat]]:min-h-0">
          {children}
        </div>
        {footer && (
          <div
            data-slot="chat-bubble-footer"
            className="border-border text-muted-foreground shrink-0 border-t px-4 py-2 text-center text-xs"
          >
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export const ChatBubbleClose = forwardRef<
  HTMLButtonElement,
  ChatBubbleCloseProps
>(function ChatBubbleClose(
  {
    children,
    className,
    onClick,
    "aria-label": label = "Minimize chat",
    ...props
  },
  ref,
) {
  const { setOpen } = useBubble();
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      aria-label={label}
      data-slot="chat-bubble-close"
      className={cn(
        "hover:bg-muted focus-visible:ring-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 disabled:opacity-50",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    >
      {children ?? <Minus aria-hidden="true" className="size-4" />}
    </button>
  );
});
