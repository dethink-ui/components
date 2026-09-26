import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { animate, useMotionValue, useSpring } from "motion/react";
import {
  getKanbanCell,
  getKanbanLocation,
  isSameKanbanLocation,
  type KanbanItem,
} from "./kanban-board-model";
import type {
  KanbanDragHandleMode,
  PointerSession,
} from "./kanban-board-types";
import {
  MOUSE_ACTIVATION_DISTANCE,
  SPRING,
  TOUCH_ACTIVATION_DELAY,
  TOUCH_TOLERANCE,
  autoScrollKanban,
  hitTestKanbanCells,
  isInteractiveTarget,
} from "./kanban-board-utils";
import type { KanbanBoardState } from "./use-kanban-board-state";

/**
 * Pointer Events drag engine: activation thresholds, the floating overlay with
 * velocity tilt, edge auto-scroll, and the spring settle into the drop slot.
 */
export function useKanbanPointer<T extends KanbanItem>(
  board: KanbanBoardState<T>,
  {
    disabled,
    dragHandle,
    dragTilt,
  }: { disabled: boolean; dragHandle: KanbanDragHandleMode; dragTilt: number },
) {
  const {
    announce,
    cardRefs,
    cellLists,
    cellTargets,
    commitMove,
    describe,
    dragRef,
    getRefusal,
    latest,
    scrollerRef,
    setActiveId,
    setDrag,
  } = board;
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const sessionRef = useRef<PointerSession | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const overlayX = useMotionValue(0);
  const overlayY = useMotionValue(0);
  const tiltTarget = useMotionValue(0);
  const overlayRotate = useSpring(tiltTarget, {
    stiffness: 380,
    damping: 26,
  });
  const overlayScale = useMotionValue(1);

  const hitTest = useCallback(
    (x: number, y: number, itemId: string) =>
      hitTestKanbanCells(
        cellTargets.current.values(),
        cellLists.current,
        x,
        y,
        itemId,
        (columnId, laneId) =>
          getKanbanCell(
            latest.current.displayedItems,
            columnId,
            laneId,
            latest.current.lanes,
          ).filter((item) => item.id !== itemId).length,
      ),
    [cellLists, cellTargets, latest],
  );

  const updatePointerPreview = useCallback(
    (x: number, y: number) => {
      const current = dragRef.current;

      if (
        !current ||
        current.mode !== "pointer" ||
        current.phase !== "dragging"
      ) {
        return;
      }

      const target = hitTest(x, y, current.itemId);

      if (!target) {
        if (current.blocked) {
          setDrag({ ...current, blocked: null });
        }

        return;
      }

      const reason = getRefusal(current.itemId, target, current.from);

      if (reason) {
        if (current.blocked?.columnId !== target.columnId) {
          setDrag({
            ...current,
            blocked: { columnId: target.columnId, reason },
          });
          announce(
            latest.current.labels.refused(
              describe(
                current.itemId,
                current.preview,
                latest.current.displayedItems,
                reason,
              ),
            ),
          );
        }

        return;
      }

      if (isSameKanbanLocation(target, current.preview) && !current.blocked) {
        return;
      }

      const changedCell =
        target.columnId !== current.preview.columnId ||
        target.laneId !== current.preview.laneId;

      setDrag({ ...current, preview: target, blocked: null });

      if (changedCell) {
        announce(
          latest.current.labels.moved(
            describe(current.itemId, target, latest.current.displayedItems),
          ),
        );
      }
    },
    [announce, describe, getRefusal, hitTest, setDrag],
  );

  const autoScroll = useCallback(
    (x: number, y: number) =>
      autoScrollKanban(scrollerRef.current, cellLists.current.values(), x, y),
    [cellLists, scrollerRef],
  );

  const teardownSession = useCallback(() => {
    const session = sessionRef.current;

    if (session) {
      clearTimeout(session.timer);
      clearTimeout(session.idle);

      if (session.frame !== undefined) {
        cancelAnimationFrame(session.frame);
      }
    }

    sessionRef.current = null;
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const settleOverlay = useCallback(
    (itemId: string, after: () => void) => {
      const finish = () => {
        after();
        tiltTarget.set(0);
        overlayRotate.jump(0);
        overlayScale.set(1);
      };

      if (latest.current.prefersReducedMotion) {
        finish();

        return;
      }

      // Wait for the placeholder to reach its final slot, then fly into it.
      requestAnimationFrame(() => {
        const target = cardRefs.current.get(itemId);

        if (!target) {
          finish();

          return;
        }

        const rect = target.getBoundingClientRect();

        tiltTarget.set(0);
        Promise.all([
          animate(overlayX, rect.left, SPRING),
          animate(overlayY, rect.top, SPRING),
          animate(overlayScale, 1, SPRING),
        ]).then(finish, finish);
      });
    },
    [overlayRotate, overlayScale, overlayX, overlayY, tiltTarget],
  );

  const finishPointerDrag = useCallback(
    (commit: boolean) => {
      const current = dragRef.current;

      teardownSession();

      if (
        !current ||
        current.mode !== "pointer" ||
        current.phase !== "dragging"
      ) {
        return;
      }

      const items = latest.current.displayedItems;
      const shouldCommit =
        commit &&
        !current.blocked &&
        !isSameKanbanLocation(current.from, current.preview);
      const destination = shouldCommit ? current.preview : current.from;

      if (!commit) {
        announce(
          latest.current.labels.cancelled(
            describe(current.itemId, current.from, items),
          ),
        );
      } else if (current.blocked) {
        announce(
          latest.current.labels.refused(
            describe(
              current.itemId,
              current.from,
              items,
              current.blocked.reason,
            ),
          ),
        );
      }

      setDrag({
        ...current,
        preview: destination,
        blocked: null,
        phase: "settling",
      });

      settleOverlay(current.itemId, () => {
        setDrag(null);

        if (shouldCommit) {
          const moved = commitMove(
            { itemId: current.itemId, from: current.from, to: current.preview },
            { skipValidation: false },
          );

          if (moved) {
            announce(
              latest.current.labels.dropped(
                describe(current.itemId, current.preview, items),
              ),
            );
          }
        } else if (commit && !current.blocked) {
          announce(
            latest.current.labels.dropped(
              describe(current.itemId, current.from, items),
            ),
          );
        }
      });
    },
    [announce, commitMove, describe, setDrag, settleOverlay, teardownSession],
  );

  const activatePointerDrag = useCallback(() => {
    const session = sessionRef.current;

    if (!session || session.active) {
      return;
    }

    const element = cardRefs.current.get(session.itemId);
    const { displayedItems: items, lanes: laneList } = latest.current;
    const from = getKanbanLocation(items, session.itemId, laneList);

    if (!element || !from) {
      teardownSession();

      return;
    }

    const rect = element.getBoundingClientRect();

    session.active = true;
    session.offsetX = session.startX - rect.left;
    session.offsetY = session.startY - rect.top;
    overlayX.jump(session.lastX - session.offsetX);
    overlayY.jump(session.lastY - session.offsetY);
    tiltTarget.jump(0);
    overlayRotate.jump(0);
    overlayScale.jump(1);

    if (!latest.current.prefersReducedMotion) {
      animate(overlayScale, 1.035, SPRING);
    }

    setOverlaySize({ width: rect.width, height: rect.height });
    setActiveId(session.itemId);
    setDrag({
      itemId: session.itemId,
      from,
      preview: from,
      mode: "pointer",
      phase: "dragging",
      blocked: null,
    });
    announce(
      latest.current.labels.pickedUp(describe(session.itemId, from, items)),
    );

    const tick = () => {
      const live = sessionRef.current;

      if (!live?.active) {
        return;
      }

      if (autoScroll(live.lastX, live.lastY)) {
        updatePointerPreview(live.lastX, live.lastY);
      }

      live.frame = requestAnimationFrame(tick);
    };

    session.frame = requestAnimationFrame(tick);
  }, [
    announce,
    autoScroll,
    describe,
    overlayRotate,
    overlayScale,
    overlayX,
    overlayY,
    setDrag,
    teardownSession,
    tiltTarget,
    updatePointerPreview,
  ]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, itemId: string) => {
      if (
        disabled ||
        dragRef.current ||
        sessionRef.current ||
        (event.pointerType === "mouse" && event.button !== 0) ||
        !event.isPrimary
      ) {
        return;
      }

      const card = event.currentTarget;
      const handle =
        event.target instanceof Element
          ? event.target.closest("[data-kanban-drag-handle]")
          : null;

      if (dragHandle === "handle") {
        if (!handle || !card.contains(handle)) {
          return;
        }
      } else if (isInteractiveTarget(event.target, card)) {
        return;
      }

      const view = event.currentTarget.ownerDocument.defaultView ?? window;
      const session: PointerSession = {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        itemId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        offsetX: 0,
        offsetY: 0,
        active: false,
        timer: undefined,
        frame: undefined,
        idle: undefined,
      };

      sessionRef.current = session;

      if (event.pointerType !== "mouse") {
        session.timer = setTimeout(activatePointerDrag, TOUCH_ACTIVATION_DELAY);
      }

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== session.pointerId) {
          return;
        }

        const distance = Math.hypot(
          moveEvent.clientX - session.startX,
          moveEvent.clientY - session.startY,
        );

        if (!session.active) {
          session.lastX = moveEvent.clientX;
          session.lastY = moveEvent.clientY;

          if (session.pointerType === "mouse") {
            if (distance >= MOUSE_ACTIVATION_DISTANCE) {
              activatePointerDrag();
            }
          } else if (distance > TOUCH_TOLERANCE) {
            teardownSession();
          }

          return;
        }

        moveEvent.preventDefault();

        const elapsed = Math.max(1, moveEvent.timeStamp - session.lastTime);
        const velocityX = (moveEvent.clientX - session.lastX) / elapsed;

        session.lastX = moveEvent.clientX;
        session.lastY = moveEvent.clientY;
        session.lastTime = moveEvent.timeStamp;
        overlayX.set(moveEvent.clientX - session.offsetX);
        overlayY.set(moveEvent.clientY - session.offsetY);

        if (!latest.current.prefersReducedMotion && dragTilt > 0) {
          const tilt = Math.max(-dragTilt, Math.min(dragTilt, velocityX * 9));

          tiltTarget.set(tilt);
          clearTimeout(session.idle);
          session.idle = setTimeout(() => tiltTarget.set(0), 90);
        }

        updatePointerPreview(moveEvent.clientX, moveEvent.clientY);
      };
      const onUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== session.pointerId) {
          return;
        }

        if (!session.active) {
          teardownSession();

          return;
        }

        // Swallow the click that follows a drag so card links don't fire.
        const swallow = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        };

        view.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(
          () => view.removeEventListener("click", swallow, { capture: true }),
          0,
        );
        finishPointerDrag(true);
      };
      const onCancel = (cancelEvent: PointerEvent) => {
        if (cancelEvent.pointerId === session.pointerId) {
          if (session.active) {
            finishPointerDrag(false);
          } else {
            teardownSession();
          }
        }
      };
      const onKey = (keyEvent: globalThis.KeyboardEvent) => {
        if (keyEvent.key === "Escape" && session.active) {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
          finishPointerDrag(false);
        }
      };
      const onBlur = () => {
        if (session.active) {
          finishPointerDrag(false);
        } else {
          teardownSession();
        }
      };
      // Once a touch drag is active, stop the page from panning underneath it.
      const onTouchMove = (touchEvent: TouchEvent) => {
        if (session.active && touchEvent.cancelable) {
          touchEvent.preventDefault();
        }
      };
      const onContextMenu = (menuEvent: Event) => {
        if (session.pointerType !== "mouse") {
          menuEvent.preventDefault();
        }
      };

      view.addEventListener("pointermove", onMove, { passive: false });
      view.addEventListener("pointerup", onUp);
      view.addEventListener("pointercancel", onCancel);
      view.addEventListener("keydown", onKey, true);
      view.addEventListener("blur", onBlur);
      view.addEventListener("touchmove", onTouchMove, { passive: false });
      view.addEventListener("contextmenu", onContextMenu);

      const root = view.document.documentElement;
      const previousCursor = root.style.cursor;
      const previousSelect = root.style.userSelect;

      root.style.userSelect = "none";
      if (event.pointerType === "mouse") {
        root.style.cursor = "grabbing";
      }

      cleanupRef.current = () => {
        view.removeEventListener("pointermove", onMove);
        view.removeEventListener("pointerup", onUp);
        view.removeEventListener("pointercancel", onCancel);
        view.removeEventListener("keydown", onKey, true);
        view.removeEventListener("blur", onBlur);
        view.removeEventListener("touchmove", onTouchMove);
        view.removeEventListener("contextmenu", onContextMenu);
        root.style.cursor = previousCursor;
        root.style.userSelect = previousSelect;
      };
    },
    [
      activatePointerDrag,
      disabled,
      dragHandle,
      dragTilt,
      finishPointerDrag,
      overlayX,
      overlayY,
      teardownSession,
      tiltTarget,
      updatePointerPreview,
    ],
  );

  // Disabling the board cancels a drag in progress, or a press that has not
  // started one yet.
  useEffect(() => {
    if (!disabled) {
      return;
    }

    if (dragRef.current?.mode === "pointer") {
      finishPointerDrag(false);
    } else {
      teardownSession();
    }
  }, [disabled, dragRef, finishPointerDrag, teardownSession]);

  useEffect(() => () => teardownSession(), [teardownSession]);

  return {
    handlePointerDown,
    overlayRotate,
    overlayScale,
    overlaySize,
    overlayX,
    overlayY,
  };
}
