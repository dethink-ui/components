# KanbanBoard

A data-driven board for moving cards between workflow stages. Cards can be moved by pointer drag, keyboard or a per-card Move menu. Columns can have soft or hard work-in-progress (WIP) limits, and cards can be grouped into swimlanes. Moves can be saved optimistically and roll back if the save fails.

```sh
npx shadcn@latest add https://components.dethink.co.uk/r/kanban-board.json
```

```tsx
import { KanbanBoard, type KanbanColumn } from "@dethink/components";

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing", wipLimit: { max: 3, mode: "hard" } },
  { id: "done", title: "Done" },
];

<KanbanBoard
  className="h-[32rem]"
  columns={columns}
  items={tasks}
  onItemsChange={setTasks}
  onMove={(move) => api.moveTask(move)} // return a Promise for optimistic saves
  getItemLabel={(task) => task.title}
  renderCard={(task, state) => (
    <TaskCard task={task} pending={state.isPending} />
  )}
/>;
```

## Data model

- `items` is one ordered array of `{ id, columnId, laneId? }` plus your own fields. Array order is the order inside each column/lane cell.
- Every move is a `KanbanMove`: `{ itemId, from: { columnId, laneId?, index }, to: { … } }`. Indexes are zero-based within the cell.
- The pure helpers `applyKanbanMove`, `getKanbanCell`, `getKanbanLocation`, `getKanbanWipState` and `getKanbanDropRefusal` are exported for your own store or optimistic cache. `applyKanbanMove` is idempotent.
- The board can be controlled (`items` + `onItemsChange`) or uncontrolled (`defaultItems`).

## Optimistic saves

- If `onMove` returns nothing, the board commits right away and calls `onItemsChange`.
- If it returns a Promise, the board shows the move straight away and marks the card with `data-pending` and `aria-busy`.
  - When the Promise resolves, the board commits and calls `onItemsChange`.
  - When it rejects, the card springs back to its last saved place. It shows `getErrorMessage(error, item)` with Retry and Dismiss, and the failure is announced.
- Moves that are still pending apply in order on top of the latest `items`.

## WIP limits and vetoes

- `wipLimit: number` is a soft limit. The header meter shows `count/max`, and over the limit it turns red and says "Over limit" with an icon and text.
- `wipLimit: { max, min?, mode: "hard" }` refuses cards that would push the column past `max`, whether they come from a pointer, keyboard or menu move. The header, the Move menu item and the live region all say why. Reordering inside a full column always works. `min` shows a "Below minimum" state.
- `dropDisabled` refuses every incoming card. `canMove(move, item)` adds your own rules; return a string to explain a refusal.

## Swimlanes and collapsing

- `lanes` renders a sticky lane header above a row of cells for each lane. Cards without a known `laneId` go in the first lane. Moving a card across lanes sets its `laneId`.
- Columns collapse to a rail that shows their count (`collapsibleColumns`, plus `collapsedColumns`/`defaultCollapsedColumns`/`onCollapsedColumnsChange`). A collapsed rail still accepts pointer drops.
- Lanes collapse from their headers (`collapsedLanes`, …).

## Motion

The pointer engine uses Pointer Events. A drag starts after 5px of mouse movement, or after a 180ms press on touch or pen with 8px of tolerance, so touch scrolling keeps working. While a card is dragged:

- A copy of it floats in a portal. It lifts (scale 1.035) and tilts with horizontal speed, up to `dragTilt` degrees.
- Neighbouring cards glide aside using Motion layout animations, and a dashed gap marks where the card will land.
- The board and columns auto-scroll near their edges.

On drop, the floating copy springs into the gap. Escape, `pointercancel` and window blur all send it back. Reduced motion turns off the tilt, lift, springs and layout animation; moves happen instantly and are still announced.

## Accessibility

- The board is a labelled `region`, each column a labelled `group`, and each cell a `list` of `listitem` cards. All cards share one tab stop.
- To move focus, use the arrow keys (Up/Down within a column across lanes, Left/Right across columns, RTL-aware) and Home/End.
- To move a card, press Space or Enter to pick it up, the arrow keys to move it, and Space or Enter to drop it; Escape cancels. The keyboard skips columns that would refuse the card. Every step is announced in a polite live region with the column, the lane and a one-based position.
- The Move menu (up, down, top, bottom, any column, any lane) is the single-pointer alternative that WCAG 2.2 SC 2.5.7 requires. Keep `showMoveMenu` on unless you provide another alternative.
- Every string is in `labels` for localisation.

Manual acceptance:

1. With a screen reader, Tab to the board and pick up a card. You hear "Picked up …, position 1 of 3 in To do".
2. Arrow Right into a full hard-limited column. It is skipped, or you hear the refusal if no other column fits.
3. Press Escape. You hear "Move cancelled", and focus stays on the card.

## Verification

- `pnpm --filter @dethink/components exec vitest run src/components/kanban-board`: model, rendered, pointer, a11y and SSR tests.
- `pnpm registry:smoke:kanban-board`: clean consumer install, typecheck and build.
- Storybook: `Components/KanbanBoard` (the KeyboardMove play test).
- Showcase: `/components/kanban-board`.

Real-browser drag e2e (including WebKit touch) is a follow-up. It was verified manually in Chromium with Playwright.

## Out of scope

Virtualised columns, multi-card drag, dragging columns to reorder them, resizable column widths, inline card editing, a "confirm with reason" WIP mode, and persisting collapsed state.
