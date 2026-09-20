import { createRef, type ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { CardStack, cardStackClassNames } from ".";

function createExampleCard({
  action,
  title,
}: {
  action?: string;
  title: string;
}) {
  return (
    <Card key={title} as="article">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {action ? <Button>{action}</Button> : <span>{title} content</span>}
      </CardContent>
    </Card>
  );
}

function renderThreeCards(
  props: Partial<ComponentProps<typeof CardStack>> = {},
) {
  return render(
    <CardStack {...props}>
      {createExampleCard({ title: "First" })}
      {createExampleCard({ title: "Second" })}
      {createExampleCard({ title: "Third" })}
    </CardStack>,
  );
}

describe("CardStack", () => {
  it("waits for Space release before activating an open card", async () => {
    const user = userEvent.setup();
    renderThreeCards({ mode: "open" });
    screen.getByRole("button", { name: "Show card 2" }).focus();
    await user.keyboard("[Space>]");
    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "0",
    );
    await user.keyboard("[/Space]");
    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "1",
    );
  });

  it.each(["{Enter}", " "])("activates an open card with %s", async (key) => {
    const user = userEvent.setup();
    renderThreeCards({ mode: "open" });
    const card = screen.getByRole("button", { name: "Show card 2" });
    card.focus();
    await user.keyboard(key);
    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "1",
    );
    expect(screen.getByRole("heading", { name: "Second" })).toBeVisible();
  });

  it("renders stack mode with safe defaults and controls", () => {
    renderThreeCards();

    const stack = screen.getByRole("group", { name: "Card stack" });
    const cards = document.querySelectorAll('[data-slot="card"]');

    expect(stack).toHaveAttribute("data-slot", "card-stack");
    expect(stack).toHaveAttribute("data-mode", "stack");
    expect(stack).toHaveAttribute("data-loop", "true");
    expect(stack).toHaveAttribute("data-count", "3");
    expect(stack).toHaveAttribute("data-active-index", "0");
    expect(
      screen.getByRole("button", { name: "Show previous card" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Show next card" }),
    ).toBeEnabled();
    expect(cards[0]).toHaveAttribute("data-card-stack-active", "true");
    expect(cards[1]).toHaveAttribute("data-card-stack-active", "false");
    expect(cards[1]).toHaveAttribute("aria-hidden", "true");
    expect(cards[1]).toHaveAttribute("inert");
  });

  it("composes consumer classes and forwards the root ref", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <CardStack ref={ref} className="custom-stack">
        {createExampleCard({ title: "First" })}
      </CardStack>,
    );

    expect(cardStackClassNames({ className: "custom-stack" })).toContain(
      "custom-stack",
    );
    expect(ref.current).toHaveAttribute("data-slot", "card-stack");
    expect(ref.current).toHaveClass("custom-stack");
  });

  it("supports mapped Card arrays", () => {
    const cards = ["First", "Second"].map((title) =>
      createExampleCard({ title }),
    );

    render(<CardStack>{cards}</CardStack>);

    expect(document.querySelectorAll('[data-slot="card"]')).toHaveLength(2);
  });

  it("rejects direct non-Card children", () => {
    expect(() =>
      render(
        <CardStack>
          <div>Not a card</div>
        </CardStack>,
      ),
    ).toThrow("CardStack expects direct Card children.");
  });

  it("rejects text children at the TypeScript boundary", () => {
    // @ts-expect-error CardStack only accepts Card elements.
    const invalidText = <CardStack>Text</CardStack>;

    expect(invalidText).toBeTruthy();
  });

  it("moves next and previous with looping enabled by default", async () => {
    const user = userEvent.setup();
    const onActiveIndexChange = vi.fn();

    renderThreeCards({ onActiveIndexChange });

    await user.click(
      screen.getByRole("button", { name: "Show previous card" }),
    );

    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "2",
    );
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);

    await user.click(screen.getByRole("button", { name: "Show next card" }));

    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "0",
    );
  });

  it("disables boundary controls when looping is disabled", async () => {
    const user = userEvent.setup();

    renderThreeCards({ loop: false });

    const previous = screen.getByRole("button", { name: "Show previous card" });
    const next = screen.getByRole("button", { name: "Show next card" });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    await user.click(next);
    await user.click(next);

    expect(next).toBeDisabled();
    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "2",
    );
  });

  it("supports controlled active index state", async () => {
    const user = userEvent.setup();
    const onActiveIndexChange = vi.fn();

    renderThreeCards({ activeIndex: 1, onActiveIndexChange });

    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "1",
    );

    await user.click(screen.getByRole("button", { name: "Show next card" }));

    expect(onActiveIndexChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "1",
    );
  });

  it("moves with keyboard navigation from the root", async () => {
    const user = userEvent.setup();

    renderThreeCards();

    const stack = screen.getByRole("group", { name: "Card stack" });

    stack.focus();
    await user.keyboard("{ArrowRight}");

    expect(stack).toHaveAttribute("data-active-index", "1");

    await user.keyboard("{Home}");

    expect(stack).toHaveAttribute("data-active-index", "0");

    await user.keyboard("{End}");

    expect(stack).toHaveAttribute("data-active-index", "2");
  });

  it("activates inactive cards by click in open mode", async () => {
    const user = userEvent.setup();

    renderThreeCards({ mode: "open" });

    const secondItem = screen
      .getByText("Second")
      .closest('[data-slot="card-stack-item"]');

    expect(secondItem).not.toBeNull();

    await user.click(secondItem as HTMLElement);

    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-active-index",
      "1",
    );
  });

  it("keeps inactive nested controls hidden and inert", () => {
    render(
      <CardStack defaultActiveIndex={0}>
        {createExampleCard({ action: "Open active", title: "Active" })}
        {createExampleCard({ action: "Open inactive", title: "Inactive" })}
      </CardStack>,
    );

    expect(screen.getByRole("button", { name: "Open active" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Open inactive" })).toBeNull();
    expect(
      screen.getByText("Inactive").closest('[data-slot="card"]'),
    ).toHaveAttribute("inert");
  });

  it("hides both controls when showControls is false", () => {
    renderThreeCards({ showControls: false });

    expect(
      screen.queryByRole("button", { name: "Show previous card" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Show next card" })).toBeNull();
  });

  it("hides only the previous control when showPreviousControl is false", () => {
    renderThreeCards({ showPreviousControl: false });

    expect(
      screen.queryByRole("button", { name: "Show previous card" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Show next card" }),
    ).toBeVisible();
  });

  it("hides only the next control when showNextControl is false", () => {
    renderThreeCards({ showNextControl: false });

    expect(
      screen.getByRole("button", { name: "Show previous card" }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Show next card" })).toBeNull();
  });

  it("shows a control per side even in open mode when explicitly requested", () => {
    renderThreeCards({ mode: "open", showNextControl: true });

    expect(
      screen.queryByRole("button", { name: "Show previous card" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Show next card" }),
    ).toBeVisible();
  });

  it("handles empty and single-card stacks", () => {
    const { rerender } = render(<CardStack />);

    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-count",
      "0",
    );
    expect(screen.queryByRole("button", { name: "Show next card" })).toBeNull();

    rerender(<CardStack>{createExampleCard({ title: "Only" })}</CardStack>);

    expect(screen.getByRole("group", { name: "Card stack" })).toHaveAttribute(
      "data-count",
      "1",
    );
    expect(screen.queryByRole("button", { name: "Show next card" })).toBeNull();
  });

  it("uses the default active index when cards are added after an empty render", () => {
    const { rerender } = render(<CardStack />);

    rerender(
      <CardStack>
        {createExampleCard({ title: "First" })}
        {createExampleCard({ title: "Second" })}
        {createExampleCard({ title: "Third" })}
      </CardStack>,
    );

    const stack = screen.getByRole("group", { name: "Card stack" });
    const firstCard = screen.getByText("First").closest('[data-slot="card"]');
    const thirdCard = screen.getByText("Third").closest('[data-slot="card"]');

    expect(stack).toHaveAttribute("data-active-index", "0");
    expect(firstCard).toHaveAttribute("data-card-stack-active", "true");
    expect(thirdCard).toHaveAttribute("data-card-stack-active", "false");
  });
});
