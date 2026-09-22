"use client";

import {
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";
import { Timeline, type TimelineProps } from "./timeline";
import {
  normalizeTimelineItems,
  type TimelineItemPayload,
} from "./timeline-utils";

export interface TimelineFeedProps<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
> extends Omit<
  TimelineProps<TPayload>,
  "mode" | "orientation" | "presentation" | "layout" | "order"
> {
  /** Automatic following pauses while the reader is away from the end. */
  followLatest?: boolean;
  viewportClassName?: string;
}

/** A contained live history. It never scrolls the surrounding document. */
export function TimelineFeed<
  TPayload extends TimelineItemPayload = TimelineItemPayload,
>({
  items,
  className,
  viewportClassName,
  followLatest = true,
  "aria-label": label = "Live activity",
  scale,
  ...props
}: TimelineFeedProps<TPayload>): ReactElement {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const ids = useMemo(
    () =>
      normalizeTimelineItems(items, {
        scale,
        mode: "events",
        order: "asc",
      }).map((item) => item.id),
    [items, scale],
  );
  const previousIds = useRef(ids);
  const position = useRef<{
    following: boolean;
    anchor?: string;
    offset: number;
    top: number;
  }>({ following: followLatest, offset: 0, top: 0 });
  const unread = useRef(new Set<string>());
  const expectedTop = useRef<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [detached, setDetached] = useState(!followLatest);
  const [announcement, setAnnouncement] = useState("");
  const pendingAnnouncement = useRef(0);
  const announcedTotal = useRef(0);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const followingEnabled = useRef(followLatest);

  const recordAnchor = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top;
    const row = Array.from(
      node.querySelectorAll<HTMLElement>('[data-slot="timeline-item"]'),
    ).find((row) => row.getBoundingClientRect().bottom > top);
    position.current.anchor = row?.dataset.timelineId;
    position.current.offset = row ? row.getBoundingClientRect().top - top : 0;
    position.current.top = node.scrollTop;
  }, []);

  const restorePosition = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    if (position.current.following && followingEnabled.current) {
      node.scrollTop = node.scrollHeight;
    } else {
      const anchor = Array.from(
        node.querySelectorAll<HTMLElement>('[data-slot="timeline-item"]'),
      ).find((row) => row.dataset.timelineId === position.current.anchor);
      if (anchor)
        node.scrollTop +=
          anchor.getBoundingClientRect().top -
          node.getBoundingClientRect().top -
          position.current.offset;
      else node.scrollTop = position.current.top;
    }
    expectedTop.current = node.scrollTop;
    recordAnchor();
  }, [recordAnchor]);

  useLayoutEffect(() => {
    followingEnabled.current = followLatest;
    if (!followLatest) position.current.following = false;
    const before = previousIds.current;
    const beforeSet = new Set(before);
    const tail = ids.reduce(
      (last, id, index) => (beforeSet.has(id) ? index : last),
      -1,
    );
    const replaced = before.length > 0 && !ids.some((id) => beforeSet.has(id));
    if (replaced) {
      unread.current.clear();
      position.current = { following: followLatest, top: 0, offset: 0 };
    }
    const appended = replaced
      ? []
      : ids.filter(
          (id, index) =>
            !beforeSet.has(id) &&
            (before.length === 0 || (tail >= 0 && index > tail)),
        );
    const current = new Set(ids);
    for (const id of unread.current)
      if (!current.has(id)) unread.current.delete(id);
    if (position.current.following && followLatest) unread.current.clear();
    else appended.forEach((id) => unread.current.add(id));
    previousIds.current = ids;
    restorePosition();
    // These states expose measured scroll position after a committed data update.
    setUnreadCount(unread.current.size);
    setDetached(!position.current.following);
    if (appended.length) {
      pendingAnnouncement.current += appended.length;
      if (announceTimer.current === undefined)
        announceTimer.current = setTimeout(() => {
          announceTimer.current = undefined;
          const count = pendingAnnouncement.current;
          pendingAnnouncement.current = 0;
          announcedTotal.current += count;
          setAnnouncement(
            `${count} new ${count === 1 ? "event" : "events"} added. ${announcedTotal.current} received this session.`,
          );
        }, 300);
    }
  }, [ids, followLatest, restorePosition]);

  useLayoutEffect(() => {
    let frame = 0;
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(restorePosition);
          });
    if (viewport.current) observer?.observe(viewport.current);
    if (content.current) observer?.observe(content.current);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(announceTimer.current);
    };
  }, [restorePosition]);

  const onScroll = () => {
    const node = viewport.current;
    if (!node) return;
    if (
      expectedTop.current !== null &&
      Math.abs(node.scrollTop - expectedTop.current) < 1
    ) {
      expectedTop.current = null;
      return;
    }
    expectedTop.current = null;
    const atEnd = node.scrollHeight - node.clientHeight - node.scrollTop <= 48;
    position.current.following = followLatest && atEnd;
    if (atEnd) {
      unread.current.clear();
      setUnreadCount(0);
    }
    setDetached(!position.current.following);
    recordAnchor();
  };

  const jump = () => {
    const node = viewport.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
    expectedTop.current = node.scrollTop;
    position.current.following = followLatest;
    unread.current.clear();
    setUnreadCount(0);
    setDetached(!followLatest);
    recordAnchor();
  };

  return (
    <div
      data-slot="timeline-feed"
      className={cn(
        "border-border bg-background relative min-w-0 rounded-md border",
        className,
      )}
    >
      {/* A focusable scroll region allows keyboard scrolling even for static events. */}
      <div
        ref={viewport}
        role="region"
        aria-label={label}
        // Keyboard access is required for this independently scrollable region.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onScroll={onScroll}
        data-slot="timeline-feed-viewport"
        className={cn(
          "focus-visible:ring-ring h-[28rem] overflow-y-auto overscroll-contain p-4 [overflow-anchor:none] focus-visible:ring-2 focus-visible:outline-none",
          viewportClassName,
        )}
      >
        <div ref={content}>
          <Timeline
            {...props}
            items={items}
            scale={scale}
            mode="events"
            layout="rail"
            presentation="flow"
            orientation="vertical"
            order="asc"
            aria-label={`${label} timeline`}
          />
        </div>
      </div>
      <div className="border-border flex min-h-12 items-center justify-end border-t px-3 py-2">
        <button
          type="button"
          onClick={detached || unreadCount ? jump : undefined}
          aria-disabled={!detached && unreadCount === 0}
          className="text-primary hover:bg-muted focus-visible:ring-ring aria-disabled:text-muted-foreground rounded-md px-3 py-1 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
        >
          {unreadCount
            ? `${unreadCount} new ${unreadCount === 1 ? "event" : "events"} · `
            : ""}
          {detached || unreadCount ? "Jump to latest" : "Following latest"}
        </button>
      </div>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>
    </div>
  );
}
