import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { KanbanBoard, type KanbanColumn } from ".";

interface Task {
  id: string;
  columnId: string;
  title: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing", wipLimit: { max: 1, mode: "hard" } },
  { id: "done", title: "Done" },
];

const tasks: Task[] = [
  { id: "t1", columnId: "todo", title: "Write brief" },
  { id: "t2", columnId: "doing", title: "Build board" },
];

const originalMatchMedia = window.matchMedia;

// Reduced motion makes the drop settle synchronously, so assertions don't
// have to wait for spring animations.
beforeAll(() => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

function rect(left: number, top: number, width: number, height: number) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function layoutColumns() {
  const sections = document.querySelectorAll<HTMLElement>(
    '[data-slot="kanban-column"]',
  );

  sections.forEach((section, index) => {
    section.getBoundingClientRect = () => rect(index * 300, 0, 280, 600);
  });
}

function renderBoard() {
  const onItemsChange = vi.fn();

  render(
    <KanbanBoard<Task>
      columns={columns}
      defaultItems={tasks}
      onItemsChange={onItemsChange}
      renderCard={(task) => <span>{task.title}</span>}
    />,
  );
  layoutColumns();

  return { onItemsChange };
}

const card = (title: string) =>
  screen.getByText(title).closest<HTMLElement>("[data-kanban-card]")!;

// jsdom lacks PointerEvent fields, so decorate MouseEvents with them.
function down(element: HTMLElement, x: number, y: number) {
  const event = new MouseEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
  });

  Object.assign(event, { pointerId: 1, pointerType: "mouse", isPrimary: true });
  fireEvent(element, event);
}

function move(
  type: "pointermove" | "pointerup" | "pointercancel",
  x: number,
  y: number,
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });

  Object.assign(event, { pointerId: 1, pointerType: "mouse", isPrimary: true });
  act(() => {
    window.dispatchEvent(event);
  });
}

describe("KanbanBoard pointer drag", () => {
  it("drags a card into another column with an overlay and placeholder", () => {
    const { onItemsChange } = renderBoard();

    down(card("Write brief"), 20, 20);
    move("pointermove", 22, 21);
    expect(
      document.querySelector('[data-slot="kanban-drag-overlay"]'),
    ).toBeNull();

    move("pointermove", 40, 30);
    expect(
      document.querySelector('[data-slot="kanban-drag-overlay"]'),
    ).not.toBeNull();
    expect(screen.getByRole("region")).toHaveAttribute(
      "data-dragging",
      "pointer",
    );

    move("pointermove", 650, 40);
    expect(
      document
        .querySelector('[data-kanban-card="t1"]')
        ?.closest('[data-slot="kanban-column"]'),
    ).toHaveAttribute("data-drop-target", "true");
    expect(document.querySelector('[data-kanban-card="t1"]')).toHaveAttribute(
      "data-placeholder",
      "true",
    );

    move("pointerup", 650, 40);

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(onItemsChange.mock.calls[0]?.[1].to.columnId).toBe("done");
    expect(
      document.querySelector('[data-slot="kanban-drag-overlay"]'),
    ).toBeNull();
  });

  it("refuses a hard-limited column and returns the card", () => {
    const { onItemsChange } = renderBoard();

    down(card("Write brief"), 20, 20);
    move("pointermove", 40, 30);
    move("pointermove", 350, 40);

    expect(
      screen.getByText("Doing is at its limit, 1 of 1.", { selector: "span" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("heading", { name: "Doing" })
        .closest('[data-slot="kanban-column"]'),
    ).toHaveAttribute("data-drop-blocked", "true");

    move("pointerup", 350, 40);
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(
      card("Write brief").closest('[data-slot="kanban-column"]'),
    ).toContainElement(screen.getByRole("heading", { name: "To do" }));
  });

  it("cancels on Escape", () => {
    const { onItemsChange } = renderBoard();

    down(card("Write brief"), 20, 20);
    move("pointermove", 650, 40);
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(onItemsChange).not.toHaveBeenCalled();
    expect(
      document.querySelector('[data-slot="kanban-drag-overlay"]'),
    ).toBeNull();
    expect(card("Write brief")).not.toHaveAttribute("data-placeholder");
  });

  it("ignores pointer downs on interactive content", () => {
    const { onItemsChange } = renderBoard();
    const trigger = screen.getByRole("button", { name: "Move Write brief" });

    down(trigger, 20, 20);
    move("pointermove", 650, 40);
    move("pointerup", 650, 40);
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(
      document.querySelector('[data-slot="kanban-drag-overlay"]'),
    ).toBeNull();
  });
});
