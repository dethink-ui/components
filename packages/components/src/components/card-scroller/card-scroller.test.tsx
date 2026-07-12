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
      "[scrollbar-width:none]",
      "[&::-webkit-scrollbar]:hidden",
      "px-[var(--dt-space-4)]",
      "py-[var(--dt-space-4)]",
      "[scroll-padding-inline:var(--dt-space-4)]",
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

  it("adds opt-in selected-card overlap without changing the default", () => {
    mockScrollIntoView();
    const { rerender } = render(
      <CardScroller defaultValue="two">
        {Example({})}
        {Example({ value: "two" })}
        {Example({ value: "three" })}
      </CardScroller>,
    );
    const root = screen.getByRole("radiogroup");
    const selectedItem = screen
      .getByRole("radio", { name: "two plan" })
      .closest<HTMLElement>("[data-card-scroller-item]");
    const selectedCard = selectedItem?.querySelector('[data-slot="card"]');

    expect(root).toHaveAttribute("data-overlap", "false");
    expect(root).toHaveStyle({
      "--card-scroller-gap": "var(--dt-density-gap)",
      "--card-scroller-selected-scale": "1.01",
    });
    expect(selectedItem).toHaveClass("data-[selected=true]:z-20");
    expect(selectedCard).toHaveClass(
      "data-[selected=true]:scale-[var(--card-scroller-selected-scale)]",
    );

    rerender(
      <CardScroller defaultValue="two" overlap>
        {Example({})}
        {Example({ value: "two" })}
        {Example({ value: "three" })}
      </CardScroller>,
    );
    expect(root).toHaveAttribute("data-overlap", "true");
    expect(root).toHaveStyle({
      "--card-scroller-gap": "0px",
      "--card-scroller-selected-scale": "1.055",
    });
  });

  it("centers an overlapping selection so both neighboring cards can remain visible", () => {
    mockScrollIntoView();
    const originalScrollBy = HTMLElement.prototype.scrollBy;
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.matches('[data-slot="card-scroller-viewport"]')) {
          return { left: 0, right: 300, width: 300 } as DOMRect;
        }
        if (this.matches("[data-card-scroller-item]")) {
          const value = this.querySelector("input")?.value;
          const index = value === "two" ? 2 : value === "three" ? 3 : 0;
          return {
            left: index * 100,
            right: (index + 1) * 100,
            width: 100,
          } as DOMRect;
        }
        return { left: 0, right: 0, width: 0 } as DOMRect;
      });
    render(
      <CardScroller defaultValue="two" overlap>
        {Example({})}
        {Example({ value: "two" })}
        {Example({ value: "three" })}
      </CardScroller>,
    );

    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "auto",
      left: 100,
    });

    getBoundingClientRect.mockRestore();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: originalScrollBy,
    });
  });

  it("keeps the scaled visual Card out of pointer hit-testing so overlap labels stay selectable", async () => {
    mockScrollIntoView();
    const user = userEvent.setup();
    render(
      <CardScroller defaultValue="two" overlap>
        {Example({})}
        {Example({ value: "two" })}
        {Example({ value: "three" })}
      </CardScroller>,
    );

    const cards = document.querySelectorAll('[data-slot="card"]');
    for (const card of cards) {
      expect(card).toHaveClass("pointer-events-none");
    }

    await user.click(screen.getByText("three plan"));
    expect(screen.getByRole("radio", { name: "three plan" })).toBeChecked();
  });

  it("shows an inset card focus ring for keyboard focus but not pointer focus", () => {
    mockScrollIntoView();
    render(
      <CardScroller defaultValue="one" overlap>
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );

    const radio = screen.getByRole("radio", { name: "two plan" });
    const item = radio.closest<HTMLElement>("[data-card-scroller-item]")!;
    const label = item.querySelector("label")!;
    const card = item.querySelector<HTMLElement>('[data-slot="card"]')!;

    fireEvent.pointerDown(label, {
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.focus(radio);

    expect(card).not.toHaveAttribute("data-focus-visible");
    expect(card).not.toHaveClass(
      "group-focus-within/card-scroller-item:ring-2",
    );

    fireEvent.keyDown(radio, { key: "ArrowRight" });

    expect(card).toHaveAttribute("data-focus-visible", "true");
    expect(card).toHaveClass(
      "data-[focus-visible=true]:ring-2",
      "data-[focus-visible=true]:ring-inset",
    );

    fireEvent.blur(radio);
    fireEvent.focus(radio);

    expect(card).toHaveAttribute("data-focus-visible", "true");
    expect(card).toHaveClass(
      "data-[focus-visible=true]:ring-2",
      "data-[focus-visible=true]:ring-inset",
    );
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

  it("aligns selection inside the horizontal viewport without scrolling the page", async () => {
    const scrollIntoView = mockScrollIntoView();
    const originalScrollBy = HTMLElement.prototype.scrollBy;
    let horizontalOffset = 0;
    const scrollBy = vi.fn((options: ScrollToOptions) => {
      horizontalOffset += Number(options.left ?? 0);
    });
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.matches('[data-slot="card-scroller-viewport"]')) {
          return { left: 0, right: 200, width: 200 } as DOMRect;
        }
        if (this.matches("[data-card-scroller-item]")) {
          const value = this.querySelector("input")?.value;
          const index = value === "two" ? 1 : 0;
          const left = index * 200 - horizontalOffset;
          return { left, right: left + 200, width: 200 } as DOMRect;
        }
        return { left: 0, right: 0, width: 0 } as DOMRect;
      });
    const user = userEvent.setup();
    render(
      <CardScroller defaultValue="two">
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "auto",
      left: 200,
    });

    await user.click(screen.getByRole("radio", { name: "one plan" }));
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: -200,
    });

    getBoundingClientRect.mockRestore();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: originalScrollBy,
    });
  });

  it("disables smooth selection scrolling when reduced motion is requested", async () => {
    mockScrollIntoView();
    const originalScrollBy = HTMLElement.prototype.scrollBy;
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.matches('[data-slot="card-scroller-viewport"]')) {
          return { left: 0, right: 200, width: 200 } as DOMRect;
        }
        if (this.matches("[data-card-scroller-item]")) {
          const index = this.querySelector("input")?.value === "two" ? 1 : 0;
          return {
            left: index * 200,
            right: (index + 1) * 200,
            width: 200,
          } as DOMRect;
        }
        return { left: 0, right: 0, width: 0 } as DOMRect;
      });
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
    await user.click(screen.getByRole("radio", { name: "two plan" }));
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "auto",
      left: 200,
    });
    getBoundingClientRect.mockRestore();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: originalScrollBy,
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

  it("exposes scroll edge state on the viewport for the edge fade styling", () => {
    mockScrollIntoView();
    render(
      <CardScroller>
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

    expect(viewport).toHaveAttribute("data-at-start", "true");
    expect(viewport).toHaveAttribute("data-at-end", "true");

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

    expect(viewport).toHaveAttribute("data-at-start", "true");
    expect(viewport).toHaveAttribute("data-at-end", "false");

    items.forEach((item, index) => {
      item.getBoundingClientRect = () =>
        ({ left: index * 200 - 400, right: (index + 1) * 200 - 400 }) as DOMRect;
    });
    fireEvent.scroll(viewport);

    expect(viewport).toHaveAttribute("data-at-start", "false");
    expect(viewport).toHaveAttribute("data-at-end", "true");
  });

  it("keeps click-sized pointer movement selectable without capturing the pointer", () => {
    mockScrollIntoView();
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
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 600 },
    });
    const setPointerCapture = vi.fn();
    viewport.setPointerCapture = setPointerCapture;
    fireEvent(window, new Event("resize"));

    const secondRadio = screen.getByRole("radio", { name: "two plan" });
    const secondLabel = document.querySelector(
      `label[for="${secondRadio.id}"]`,
    )!;
    fireEvent.pointerDown(secondLabel, {
      button: 0,
      clientX: 100,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(secondLabel, {
      clientX: 92,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(setPointerCapture).not.toHaveBeenCalled();

    fireEvent.pointerUp(secondLabel, {
      clientX: 92,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.click(secondLabel);

    expect(secondRadio).toBeChecked();
    expect(viewport).not.toHaveAttribute("data-dragging");
  });

  it("supports mouse drag scrolling without selecting the card released under the pointer", () => {
    const scrollIntoView = mockScrollIntoView();
    const onValueChange = vi.fn();
    render(
      <CardScroller defaultValue="one" onValueChange={onValueChange}>
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
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollWidth: { configurable: true, value: 600 },
    });
    viewport.getBoundingClientRect = () => ({ left: 0, right: 200 }) as DOMRect;
    items.forEach((item, index) => {
      item.getBoundingClientRect = () =>
        ({ left: index * 200, right: (index + 1) * 200 }) as DOMRect;
    });
    fireEvent(window, new Event("resize"));
    scrollIntoView.mockClear();

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 160,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(viewport, {
      clientX: 80,
      pointerId: 1,
      pointerType: "mouse",
    });
    expect(viewport.scrollLeft).toBe(80);
    expect(viewport).toHaveAttribute("data-dragging", "true");

    fireEvent.pointerUp(viewport, {
      clientX: 80,
      pointerId: 1,
      pointerType: "mouse",
    });
    const secondRadio = screen.getByRole("radio", { name: "two plan" });
    const secondLabel = document.querySelector(
      `label[for="${secondRadio.id}"]`,
    )!;
    fireEvent.click(secondLabel);

    expect(viewport).not.toHaveAttribute("data-dragging");
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "one plan" })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("leaves touch dragging to the native horizontal scroller", () => {
    mockScrollIntoView();
    render(
      <CardScroller>
        {Example({})}
        {Example({ value: "two" })}
      </CardScroller>,
    );
    const viewport = document.querySelector<HTMLElement>(
      '[data-slot="card-scroller-viewport"]',
    )!;
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 200 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollWidth: { configurable: true, value: 400 },
    });
    fireEvent(window, new Event("resize"));

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 160,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerMove(viewport, {
      clientX: 80,
      pointerId: 2,
      pointerType: "touch",
    });

    expect(viewport.scrollLeft).toBe(0);
    expect(viewport).not.toHaveAttribute("data-dragging");
  });
});
