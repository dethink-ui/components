import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card, CardContent, CardTitle } from "../card";
import { CardScroller, CardScrollerItem, cardScrollerClassNames } from ".";

function Example({
  disabled = false,
  value = "one",
}: {
  disabled?: boolean;
  value?: string;
}) {
  return (
    <CardScrollerItem disabled={disabled} label={`${value} plan`} value={value}>
      <Card>
        <CardTitle>{value}</CardTitle>
        <CardContent>{value} content</CardContent>
      </Card>
    </CardScrollerItem>
  );
}

function mockScrollIntoView() {
  const mock = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: mock,
  });
  return mock;
}

describe("CardScroller", () => {
  it("selects the first enabled item by default and supports whole-card selection", async () => {
    mockScrollIntoView();
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CardScroller onValueChange={onValueChange}>
        {Example({ disabled: true })}
        {Example({ value: "two" })}
      </CardScroller>,
    );

    expect(screen.getByRole("radio", { name: "two plan" })).toBeChecked();
    await user.click(screen.getByText("one plan"));
    expect(screen.getByRole("radio", { name: "two plan" })).toBeChecked();
    await user.click(screen.getByText("two plan"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("supports uncontrolled and controlled selection", async () => {
    mockScrollIntoView();
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <CardScroller defaultValue="one" onValueChange={onValueChange}>
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    await user.click(screen.getByText("two plan"));
    expect(screen.getByRole("radio", { name: "two plan" })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("two");

    rerender(
      <CardScroller value="one" onValueChange={onValueChange}>
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    await user.click(screen.getByText("two plan"));
    expect(onValueChange).toHaveBeenLastCalledWith("two");
    expect(screen.getByRole("radio", { name: "one plan" })).toBeChecked();
  });

  it("forwards root and item refs, classes, name, and disabled state", () => {
    mockScrollIntoView();
    const rootRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    render(
      <CardScroller
        ref={rootRef}
        className="custom-root"
        name="plans"
        disabled
        maxVisibleCards={4}
      >
        <CardScrollerItem
          ref={itemRef}
          className="custom-item"
          label="Plan"
          value="plan"
        >
          <Card>Plan</Card>
        </CardScrollerItem>
      </CardScroller>,
    );
    expect(cardScrollerClassNames({ className: "custom-root" })).toContain(
      "custom-root",
    );
    expect(rootRef.current).toHaveAttribute("data-slot", "card-scroller");
    expect(rootRef.current).toHaveStyle({
      "--card-scroller-max-visible": "4",
      "--card-scroller-medium-visible": "2",
    });
    expect(
      rootRef.current?.querySelector('[data-slot="card-scroller-viewport"]'),
    ).toHaveClass(
      "@[30rem]:[--card-scroller-columns:var(--card-scroller-medium-visible)]",
      "@[52rem]:[--card-scroller-columns:var(--card-scroller-max-visible)]",
    );
    expect(itemRef.current).toHaveClass("custom-item");
    expect(screen.getByRole("radio", { name: "Plan" })).toHaveAttribute(
      "name",
      "plans",
    );
    expect(screen.getByRole("radio", { name: "Plan" })).toBeDisabled();
    const radio = screen.getByRole("radio", { name: "Plan" });
    const label = document.querySelector(`label[for="${radio.id}"]`);
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent("Plan");
    expect(label?.querySelector('[data-slot="card"]')).toBeNull();
    expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });

  it("rejects invalid direct children and invalid item contents", () => {
    expect(() =>
      render(
        <CardScroller>
          <div />
        </CardScroller>,
      ),
    ).toThrow("CardScroller expects direct CardScrollerItem children.");
    expect(() =>
      render(
        <CardScroller>
          <CardScrollerItem label="Bad" value="bad">
            <div />
          </CardScrollerItem>
        </CardScroller>,
      ),
    ).toThrow("CardScrollerItem expects exactly one direct Card child.");
  });

  it("rejects duplicate values", () => {
    expect(() =>
      render(
        <CardScroller>
          {Example({ value: "duplicate" })}
          {Example({ value: "duplicate" })}
        </CardScroller>,
      ),
    ).toThrow("CardScrollerItem values must be unique.");
  });

  it("falls back from invalid or disabled defaults and dynamic uncontrolled values", () => {
    mockScrollIntoView();
    const { rerender } = render(
      <CardScroller defaultValue="missing">
        {Example({ value: "one", disabled: true })}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    expect(screen.getByRole("radio", { name: "two plan" })).toBeChecked();

    rerender(
      <CardScroller defaultValue="missing">
        {Example({ value: "two", disabled: true })}
        {Example({ value: "three" })}
      </CardScroller>,
    );
    expect(screen.getByRole("radio", { name: "three plan" })).toBeChecked();
  });

  it("leaves a controlled unmatched value unselected", () => {
    mockScrollIntoView();
    render(
      <CardScroller value="missing">
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    expect(
      screen
        .getAllByRole<HTMLInputElement>("radio")
        .every((radio) => !radio.checked),
    ).toBe(true);
  });

  it("aligns the initial selection without animation and smooth-scrolls explicit selection", async () => {
    const scrollIntoView = mockScrollIntoView();
    const user = userEvent.setup();
    render(
      <CardScroller defaultValue="two">
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
    });

    scrollIntoView.mockClear();
    await user.click(screen.getByRole("radio", { name: "one plan" }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  });

  it("disables smooth selection scrolling when reduced motion is requested", async () => {
    const scrollIntoView = mockScrollIntoView();
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    });
    const user = userEvent.setup();
    render(
      <CardScroller>
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    scrollIntoView.mockClear();
    await user.click(screen.getByRole("radio", { name: "two plan" }));
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("uses native radios to skip disabled choices during keyboard navigation", async () => {
    mockScrollIntoView();
    const user = userEvent.setup();
    render(
      <CardScroller defaultValue="one">
        {Example({})}
        {Example({ value: "two", disabled: true })}
        {Example({ value: "three" })}
      </CardScroller>,
    );
    const first = screen.getByRole("radio", { name: "one plan" });
    const disabled = screen.getByRole("radio", { name: "two plan" });
    const third = screen.getByRole("radio", { name: "three plan" });
    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(disabled).not.toBeChecked();
    expect(third).toBeChecked();
  });

  it("spotlights the keyboard-focused card and dims its siblings", () => {
    mockScrollIntoView();
    render(
      <CardScroller>
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    const first = screen
      .getByRole("radio", { name: "one plan" })
      .closest<HTMLElement>("[data-card-scroller-item]");
    const second = screen
      .getByRole("radio", { name: "two plan" })
      .closest<HTMLElement>("[data-card-scroller-item]");

    fireEvent.focus(screen.getByRole("radio", { name: "two plan" }));
    expect(first).toHaveAttribute("data-dimmed", "true");
    expect(second).toHaveAttribute("data-spotlighted", "true");

    fireEvent.blur(screen.getByRole("radio", { name: "two plan" }));
    expect(first).not.toHaveAttribute("data-dimmed");
    expect(second).not.toHaveAttribute("data-spotlighted");
  });

  it("scroll controls move one item without changing selection", async () => {
    const scrollIntoView = mockScrollIntoView();
    const user = userEvent.setup();
    render(
      <CardScroller defaultValue="one">
        {Example({})}
        {Example({ value: "two" })}
        {Example({ value: "three" })}
      </CardScroller>,
    );
    const viewport = document.querySelector<HTMLElement>(
      '[data-slot="card-scroller-viewport"]',
    )!;
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-card-scroller-item]"),
    );
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 600 },
    });
    viewport.getBoundingClientRect = () => ({ left: 0, right: 200 }) as DOMRect;
    items.forEach((item, index) => {
      item.getBoundingClientRect = () =>
        ({ left: index * 200, right: (index + 1) * 200 }) as DOMRect;
    });
    fireEvent(window, new Event("resize"));
    scrollIntoView.mockClear();

    expect(
      screen.getByRole("button", { name: "Previous card" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next card" }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "one plan" })).toBeChecked();
  });
});
