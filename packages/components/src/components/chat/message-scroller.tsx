"use client";

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The bounded transcript region must support keyboard scrolling. */

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { ChatMessage } from "./chat-message";
import { useChatAction } from "./use-chat-action";
import type {
  ChatActionResult,
  ChatMessageActionHandlers,
  ChatMessageData,
  ChatPartRenderer,
} from "./types";

const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(
  null,
);
export interface MessageScrollPosition {
  top: number;
  following: boolean;
  readCount: number;
  anchorId?: string;
  anchorOffset?: number;
}
export interface MessageScrollerProps {
  children: ReactNode;
  label?: string;
  className?: string;
  contentClassName?: string;
  revision?: unknown;
  messageCount?: number;
  /** Distinguishes older-history prepends from newly appended messages. */
  lastMessageId?: string;
  initialPosition?: MessageScrollPosition;
  onPositionChange?: (position: MessageScrollPosition) => void;
}
export function MessageScroller({
  children,
  label = "Conversation messages",
  className,
  contentClassName,
  revision,
  messageCount = 0,
  lastMessageId,
  initialPosition,
  onPositionChange,
}: MessageScrollerProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const position = useRef<MessageScrollPosition>(
    initialPosition ?? { top: 0, following: true, readCount: messageCount },
  );
  const expectedTop = useRef<number | undefined>(undefined);
  const [readCount, setReadCount] = useState(
    initialPosition?.readCount ?? messageCount,
  );
  const [detached, setDetached] = useState(
    !initialPosition?.following && !!initialPosition,
  );
  const callbacks = useRef({ onPositionChange, messageCount });
  const previousMessages = useRef({
    count: messageCount,
    lastId: lastMessageId,
  });
  useLayoutEffect(() => {
    callbacks.current = { onPositionChange, messageCount };
  });
  function recordAnchor(node: HTMLDivElement) {
    const bounds = node.getBoundingClientRect();
    const row = Array.from(
      node.querySelectorAll<HTMLElement>("[data-chat-row]"),
    ).find((item) => item.getBoundingClientRect().bottom > bounds.top + 1);
    position.current = {
      ...position.current,
      top: node.scrollTop,
      anchorId: row?.dataset.chatRow,
      anchorOffset: row
        ? row.getBoundingClientRect().top - bounds.top
        : undefined,
    };
  }
  function restore() {
    const node = viewport.current;
    if (!node) return;
    if (position.current.following) {
      node.scrollTop = node.scrollHeight;
      position.current.readCount = callbacks.current.messageCount;
    } else if (position.current.anchorId) {
      const row = Array.from(
        node.querySelectorAll<HTMLElement>("[data-chat-row]"),
      ).find((item) => item.dataset.chatRow === position.current.anchorId);
      if (row)
        node.scrollTop +=
          row.getBoundingClientRect().top -
          node.getBoundingClientRect().top -
          (position.current.anchorOffset ?? 0);
    }
    expectedTop.current = node.scrollTop;
    position.current.top = node.scrollTop;
  }
  useLayoutEffect(() => {
    const node = viewport.current;
    if (node && !position.current.following)
      node.scrollTop = position.current.top;
    restore();
    if (node) recordAnchor(node);
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(restore);
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(schedule);
    if (node) observer?.observe(node);
    if (content.current) observer?.observe(content.current);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      callbacks.current.onPositionChange?.({ ...position.current });
    };
  }, []);
  useLayoutEffect(() => {
    if (
      lastMessageId &&
      previousMessages.current.lastId === lastMessageId &&
      messageCount > previousMessages.current.count
    ) {
      position.current.readCount +=
        messageCount - previousMessages.current.count;
      // Keep the visible count synchronized with a measured history prepend.
      setReadCount(position.current.readCount);
    }
    previousMessages.current = { count: messageCount, lastId: lastMessageId };
    restore();
  }, [revision, messageCount, lastMessageId]);
  function onScroll() {
    const node = viewport.current;
    if (!node) return;
    if (
      expectedTop.current !== undefined &&
      Math.abs(node.scrollTop - expectedTop.current) < 1
    ) {
      expectedTop.current = undefined;
      return;
    }
    expectedTop.current = undefined;
    position.current.following =
      node.scrollHeight - node.clientHeight - node.scrollTop < 48;
    if (position.current.following) position.current.readCount = messageCount;
    recordAnchor(node);
    setReadCount(position.current.readCount);
    setDetached(!position.current.following);
    onPositionChange?.({ ...position.current });
  }
  return (
    <ScrollContext.Provider value={viewport}>
      <div
        className={cn(
          "relative flex min-h-0 min-w-0 flex-1 flex-col",
          className,
        )}
      >
        <div
          ref={viewport}
          data-slot="message-scroller"
          role="region"
          aria-label={label}
          tabIndex={0}
          className="focus-visible:ring-ring min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none [overflow-anchor:none] [scrollbar-gutter:stable] focus-visible:ring-2 focus-visible:ring-inset"
          onScroll={onScroll}
        >
          <div
            ref={content}
            className={cn(
              "mx-auto w-full max-w-3xl px-4 py-6 sm:px-8",
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
        {detached && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <Button
              size="sm"
              variant="outline"
              className="pointer-events-auto rounded-full shadow-md"
              leftIcon={<ArrowDown />}
              onClick={() => {
                position.current.following = true;
                restore();
                viewport.current?.focus({ preventScroll: true });
                setDetached(false);
                onPositionChange?.({ ...position.current });
              }}
            >
              Jump to latest
              {messageCount > readCount
                ? ` · ${messageCount - readCount} new`
                : ""}
            </Button>
          </div>
        )}
      </div>
    </ScrollContext.Provider>
  );
}
export interface MessageListProps {
  messages: readonly ChatMessageData[];
  renderPart?: ChatPartRenderer;
  actions?: ChatMessageActionHandlers;
  className?: string;
  /** Disable windowing for native find/copy and full screen-reader traversal. */
  windowed?: boolean;
  estimatedRowHeight?: number;
  overscan?: number;
  hasOlder?: boolean;
  loadingOlder?: boolean;
  historyError?: string;
  onLoadOlder?: () => ChatActionResult;
}
export function MessageList({
  messages,
  renderPart,
  actions,
  className,
  windowed = false,
  estimatedRowHeight = 160,
  overscan = 5,
  hasOlder,
  loadingOlder,
  historyError,
  onLoadOlder,
}: MessageListProps) {
  const viewport = useContext(ScrollContext);
  const list = useRef<HTMLOListElement>(null);
  const [heights, setHeights] = useState(() => new Map<string, number>());
  const [view, setView] = useState({ top: 0, height: 640 });
  const [focused, setFocused] = useState<string>();
  const { pending, error, perform } = useChatAction();
  const virtual = windowed && !!viewport;
  useEffect(() => {
    const node = viewport?.current;
    if (!virtual || !node) return;
    let frame = 0;
    const update = () => {
      const offset = list.current
        ? list.current.getBoundingClientRect().top -
          node.getBoundingClientRect().top +
          node.scrollTop
        : 0;
      setView({
        top: Math.max(0, node.scrollTop - offset),
        height: node.clientHeight,
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    node.addEventListener("scroll", schedule, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(schedule);
    observer?.observe(node);
    return () => {
      node.removeEventListener("scroll", schedule);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [virtual, viewport]);
  const offsets = useMemo(() => {
    const result = [0];
    for (const message of messages)
      result.push(
        result[result.length - 1]! +
          (heights.get(message.id) ?? estimatedRowHeight),
      );
    return result;
  }, [messages, estimatedRowHeight, heights]);
  let start = 0;
  let end = messages.length;
  if (virtual) {
    const locate = (target: number) => {
      let low = 0;
      let high = messages.length;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (offsets[mid + 1]! < target) low = mid + 1;
        else high = mid;
      }
      return low;
    };
    start = Math.max(0, locate(view.top) - overscan);
    end = Math.min(
      messages.length,
      locate(view.top + view.height) + overscan + 1,
    );
  }
  const indices = Array.from(
    { length: Math.max(0, end - start) },
    (_, index) => start + index,
  );
  const focusIndex = focused
    ? messages.findIndex((message) => message.id === focused)
    : -1;
  if (virtual && focusIndex >= 0 && !indices.includes(focusIndex))
    indices.push(focusIndex);
  indices.sort((a, b) => a - b);
  const renderedKey = indices.map((index) => messages[index]!.id).join("|");
  useLayoutEffect(() => {
    if (!virtual || !list.current || typeof ResizeObserver === "undefined")
      return;
    const observer = new ResizeObserver((entries) => {
      const sizes = entries.map((entry) => ({
        id: (entry.target as HTMLElement).dataset.chatRow,
        height:
          entry.borderBoxSize?.[0]?.blockSize ??
          (entry.target as HTMLElement).offsetHeight,
      }));
      setHeights((current) => {
        const changed = sizes.filter(
          ({ id, height }) =>
            id && height > 0 && Math.abs((current.get(id) ?? 0) - height) > 0.5,
        );
        if (!changed.length) return current;
        const next = new Map(current);
        for (const { id, height } of changed) next.set(id!, height);
        return next;
      });
    });
    for (const row of list.current.querySelectorAll<HTMLElement>(
      "[data-chat-row]",
    ))
      observer.observe(row);
    return () => observer.disconnect();
  }, [virtual, renderedKey]);
  const rows: ReactNode[] = [];
  let previous = 0;
  for (const index of indices) {
    if (virtual && index > previous)
      rows.push(
        <li
          key={`gap-${index}`}
          aria-hidden="true"
          style={{ height: offsets[index]! - offsets[previous]! }}
        />,
      );
    const message = messages[index]!;
    rows.push(
      <li
        key={message.id}
        data-chat-row={message.id}
        aria-posinset={virtual ? index + 1 : undefined}
        aria-setsize={virtual ? messages.length : undefined}
        className="pb-7"
      >
        <ChatMessage
          message={message}
          renderPart={renderPart}
          actions={actions}
        />
      </li>,
    );
    previous = index + 1;
  }
  if (virtual && previous < messages.length)
    rows.push(
      <li
        key="gap-end"
        aria-hidden="true"
        style={{ height: offsets[messages.length]! - offsets[previous]! }}
      />,
    );
  return (
    <>
      {onLoadOlder && (
        <div className="mb-5 text-center">
          {hasOlder ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={loadingOlder || pending}
              onClick={() => void perform(onLoadOlder)}
            >
              {loadingOlder || pending
                ? "Loading history…"
                : historyError || error
                  ? "Retry loading history"
                  : "Load earlier messages"}
            </Button>
          ) : (
            <span className="text-muted-foreground text-xs">
              Beginning of conversation
            </span>
          )}
          {(historyError || error) && (
            <p className="text-destructive mt-1 text-xs" role="alert">
              {historyError || error}
            </p>
          )}
        </div>
      )}
      <ol
        ref={list}
        data-slot="message-list"
        data-windowed={virtual || undefined}
        aria-label="Messages"
        className={cn("m-0 list-none p-0", className)}
        onFocusCapture={(event) =>
          setFocused(
            (event.target as HTMLElement).closest<HTMLElement>(
              "[data-chat-row]",
            )?.dataset.chatRow,
          )
        }
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(undefined);
        }}
      >
        {rows}
      </ol>
    </>
  );
}
