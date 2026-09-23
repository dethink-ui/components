import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Card } from "../card";
import { CardStackAnimated, type CardStackAnimatedProps } from ".";

expect.extend(toHaveNoViolations);

function Example(props: Partial<CardStackAnimatedProps>) {
  return (
    <CardStackAnimated aria-label="Findings" {...props}>
      {["First", "Second", "Third"].map((title) => (
        <Card key={title}>
          <h3>{title}</h3>
          <input aria-label={`${title} note`} />
          <a href="#evidence">Evidence</a>
        </Card>
      ))}
    </CardStackAnimated>
  );
}

function pointer(target: Element, type: string, x: number, y = 0, extras = {}) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: y,
    ...extras,
  });
  fireEvent(target, event);
}
function swipe(
  target: Element,
  { cancel = false, vertical = false, short = false, mouse = false } = {},
) {
  const extra = mouse ? { pointerType: "mouse" } : {};
  pointer(target, "pointerdown", 200, 0, extra);
  pointer(target, "pointermove", short ? 180 : 60, vertical ? 190 : 0, extra);
  pointer(
    target,
    cancel ? "pointercancel" : "pointerup",
    short ? 180 : 60,
    vertical ? 190 : 0,
    extra,
  );
}

describe("CardStackAnimated", () => {
  it("supports repeated navigation, reversal, and authoritative controlled updates", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Example />);
    const root = screen.getByRole("group", { name: "Findings" });
    root.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowLeft}");
    expect(root).toHaveAttribute("data-active-index", "1");
    rerender(<Example activeIndex={2} />);
    expect(root).toHaveAttribute("data-active-index", "2");
    await user.keyboard("{ArrowRight}");
    expect(root).toHaveAttribute("data-active-index", "2");
  });
  it("only accepts deliberate opted-in gestures and ignores nested inputs and links", () => {
    const { container, rerender } = render(<Example />);
    const deck = container.querySelector('[data-slot="card-stack-deck"]')!;
    const root = screen.getByRole("group", { name: "Findings" });
    swipe(deck);
    expect(root).toHaveAttribute("data-active-index", "0");
    rerender(<Example swipe />);
    for (const options of [
      { cancel: true },
      { vertical: true },
      { short: true },
      { mouse: true },
    ])
      swipe(deck, options);
    swipe(screen.getByRole("textbox", { name: "First note" }));
    swipe(screen.getByRole("link", { name: "Evidence" }));
    expect(root).toHaveAttribute("data-active-index", "0");
    swipe(deck);
    expect(root).toHaveAttribute("data-active-index", "1");
  });
  it("cancels multi-pointer gestures and respects non-looping boundaries", () => {
    const { container } = render(
      <Example swipe loop={false} defaultActiveIndex={2} />,
    );
    const deck = container.querySelector('[data-slot="card-stack-deck"]')!;
    swipe(deck);
    expect(screen.getByRole("group", { name: "Findings" })).toHaveAttribute(
      "data-active-index",
      "2",
    );
    pointer(deck, "pointerdown", 0);
    pointer(deck, "pointerdown", 20, 0, { pointerId: 2, isPrimary: false });
    pointer(deck, "pointermove", 200);
    pointer(deck, "pointerup", 200);
    expect(screen.getByRole("group", { name: "Findings" })).toHaveAttribute(
      "data-active-index",
      "2",
    );
  });
  it("has accessible active contents and controls", async () => {
    const { container } = render(<Example swipe />);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    await expect(axe(container)).resolves.toHaveNoViolations();
  });
  it("hydrates the same initial selection without recoverable errors", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Example defaultActiveIndex={1} />);
    document.body.append(container);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <Example defaultActiveIndex={1} />, {
        onRecoverableError,
      });
    });
    expect(container.querySelector('[data-slot="card-stack"]')).toHaveAttribute(
      "data-active-index",
      "1",
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    container.remove();
  });
});
