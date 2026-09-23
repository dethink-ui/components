import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from ".";

function makeSlides(count: number) {
  // Slides must be direct children of CarouselContent (arrays and fragments are
  // flattened by React.Children; a wrapping component would hide them).
  return Array.from({ length: count }, (_, i) => (
    <CarouselItem key={i}>
      <div style={{ height: 120 }}>Slide {i + 1}</div>
    </CarouselItem>
  ));
}

function Basic({
  count = 4,
  staging,
  intensity,
  defaultIndex,
  onIndexChange,
}: {
  count?: number;
  staging?: "flat" | "tilt" | "floor";
  intensity?: "subtle" | "standard" | "dramatic";
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}) {
  return (
    <Carousel
      aria-label="Gallery"
      staging={staging}
      intensity={intensity}
      defaultIndex={defaultIndex}
      onIndexChange={onIndexChange}
    >
      <CarouselContent>{makeSlides(count)}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("exposes the APG carousel and slide semantics", () => {
    render(<Basic count={3} />);
    const region = screen.getByRole("region", { name: "Gallery" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("data-staging", "flat");

    const slides = region.querySelectorAll('[data-slot="carousel-item"]');
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute("aria-roledescription", "slide");
    expect(slides[0]).toHaveAttribute("aria-label", "1 of 3");
    expect(slides[2]).toHaveAttribute("aria-label", "3 of 3");
  });

  it("inlines the resting offset on first render", () => {
    const { container } = render(<Basic defaultIndex={2} />);
    const root = container.querySelector(
      '[data-slot="carousel"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--carousel-offset")).toBe("2");
  });

  it("renders a contact-shadow node per slide in tilt staging", () => {
    const { container } = render(<Basic count={4} staging="tilt" />);
    expect(container.querySelector('[data-slot="carousel"]')).toHaveAttribute(
      "data-staging",
      "tilt",
    );
    expect(
      container.querySelectorAll('[data-slot="carousel-item-shadow"]'),
    ).toHaveLength(4);
    for (const shadow of container.querySelectorAll(
      '[data-slot="carousel-item-shadow"]',
    )) {
      expect(shadow).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("writes intensity multipliers as inline root variables", () => {
    const { container, rerender } = render(
      <Basic staging="tilt" />, // standard
    );
    const root = container.querySelector(
      '[data-slot="carousel"]',
    ) as HTMLElement;
    expect(root).toHaveAttribute("data-intensity", "standard");
    expect(root.style.getPropertyValue("--carousel-intensity")).toBe("1");
    expect(root.style.getPropertyValue("--carousel-blur-enabled")).toBe("1");

    rerender(<Basic staging="tilt" intensity="subtle" />);
    const subtleRoot = container.querySelector(
      '[data-slot="carousel"]',
    ) as HTMLElement;
    expect(subtleRoot).toHaveAttribute("data-intensity", "subtle");
    expect(subtleRoot.style.getPropertyValue("--carousel-intensity")).toBe(
      "0.6",
    );
    expect(subtleRoot.style.getPropertyValue("--carousel-blur-enabled")).toBe(
      "0",
    );
  });

  it("widens the inert visible radius for tilt staging", () => {
    // Visible radius is 1 for tilt, so immediate neighbors stay interactive.
    const { container } = render(
      <Basic count={5} staging="tilt" defaultIndex={2} />,
    );
    const slides = container.querySelectorAll('[data-slot="carousel-item"]');
    expect(
      slides[1]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[2]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[3]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[0]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
    expect(
      slides[4]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
  });

  it("widens the inert visible radius further for floor staging", () => {
    // Visible radius is 2 for floor: two neighbors each side stay interactive.
    const { container } = render(
      <Basic count={7} staging="floor" defaultIndex={3} />,
    );
    const slides = container.querySelectorAll('[data-slot="carousel-item"]');
    // Active index 3, radius 2: slides 1..5 stay interactive, 0 and 6 go inert.
    expect(
      slides[0]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
    expect(
      slides[1]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[5]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[6]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
    expect(
      container.querySelectorAll('[data-slot="carousel-item-shadow"]'),
    ).toHaveLength(7);
  });

  it("renders no contact-shadow nodes in flat staging", () => {
    const { container } = render(<Basic staging="flat" />);
    expect(
      container.querySelectorAll('[data-slot="carousel-item-shadow"]'),
    ).toHaveLength(0);
  });

  it("marks fully out-of-view slides inert in flat staging", () => {
    const { container } = render(<Basic count={3} defaultIndex={0} />);
    const slides = container.querySelectorAll('[data-slot="carousel-item"]');
    expect(
      slides[0]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[1]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
    expect(
      slides[2]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
  });

  it("advances with the next control and reports the change once", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Basic count={3} onIndexChange={onIndexChange} />);

    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    expect(onIndexChange).toHaveBeenCalledWith(1);

    const slides = screen
      .getByRole("region")
      .querySelectorAll('[data-slot="carousel-item"]');
    expect(
      slides[1]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(false);
    expect(
      slides[0]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
  });

  it("disables previous/next at the bounds", async () => {
    const user = userEvent.setup();
    render(<Basic count={2} />);
    const prev = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();

    await user.click(next);
    expect(next).toBeDisabled();
    expect(prev).toBeEnabled();
  });

  it("reflects and sets the active slide through dots", async () => {
    const user = userEvent.setup();
    render(<Basic count={3} />);
    const dots = screen.getByRole("button", { name: "Go to slide 3" });
    expect(
      screen.getByRole("button", { name: "Go to slide 1" }),
    ).toHaveAttribute("aria-current", "true");

    await user.click(dots);
    expect(dots).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: "Go to slide 1" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("navigates with the arrow keys", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    const { container } = render(
      <Basic count={3} onIndexChange={onIndexChange} />,
    );
    const viewport = container.querySelector(
      '[data-slot="carousel-viewport"]',
    ) as HTMLElement;
    viewport.focus();

    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    await user.keyboard("{End}");
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    await user.keyboard("{Home}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });

  it("maps arrow keys to the writing direction in RTL", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    const original = window.getComputedStyle;
    const spy = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((el: Element) => {
        const style = original(el);
        return new Proxy(style, {
          get: (target, prop) =>
            prop === "direction" ? "rtl" : Reflect.get(target, prop),
        }) as CSSStyleDeclaration;
      });

    const { container } = render(
      <Basic count={3} defaultIndex={1} onIndexChange={onIndexChange} />,
    );
    const viewport = container.querySelector(
      '[data-slot="carousel-viewport"]',
    ) as HTMLElement;
    viewport.focus();

    // In RTL, ArrowRight is "previous" and ArrowLeft is "next".
    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    await user.keyboard("{ArrowLeft}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    spy.mockRestore();
  });

  it("supports controlled usage without moving on its own", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    function Controlled() {
      const [index] = useState(0);
      return (
        <Carousel
          aria-label="Controlled"
          index={index}
          onIndexChange={onIndexChange}
        >
          <CarouselContent>{makeSlides(3)}</CarouselContent>
          <CarouselNext />
          <CarouselDots />
        </Carousel>
      );
    }

    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    // The consumer ignored the change, so the active slide stays put.
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(
      screen.getByRole("button", { name: "Go to slide 1" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("warns in development when no accessible name is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Carousel>
        <CarouselContent>{makeSlides(2)}</CarouselContent>
      </Carousel>,
    );
    expect(
      warn.mock.calls.some(([message]) =>
        String(message).includes("accessible name"),
      ),
    ).toBe(true);
    warn.mockRestore();
  });

  it("throws when the hook is used outside a Carousel", () => {
    function Orphan() {
      useCarousel();
      return null;
    }
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    expect(() => render(<Orphan />)).toThrow(/within a <Carousel>/);
    error.mockRestore();
  });

  it("keeps a single accessible region with the provided label", () => {
    render(<Basic />);
    const region = screen.getByRole("region", { name: "Gallery" });
    expect(within(region).getAllByRole("group").length).toBeGreaterThan(0);
  });

  it("does not flag reduced motion when the preference is not set", () => {
    const { container } = render(<Basic />);
    expect(
      container.querySelector('[data-slot="carousel"]'),
    ).not.toHaveAttribute("data-reduced-motion");
  });

  it("moves focus to the viewport when the focused slide becomes inert", () => {
    function Gallery({ index }: { index: number }) {
      return (
        <Carousel aria-label="Focus rescue" index={index}>
          <CarouselContent>
            <CarouselItem>
              <button type="button">Nested action</button>
            </CarouselItem>
            <CarouselItem>
              <div>Second</div>
            </CarouselItem>
            <CarouselItem>
              <div>Third</div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      );
    }

    const { container, rerender } = render(<Gallery index={0} />);
    const nested = screen.getByRole("button", { name: "Nested action" });
    nested.focus();
    expect(document.activeElement).toBe(nested);

    // Settling the active slide away makes slide 0 inert (flat radius 0); the
    // rescue must land focus on the viewport instead of document.body.
    rerender(<Gallery index={1} />);

    const viewport = container.querySelector(
      '[data-slot="carousel-viewport"]',
    ) as HTMLElement;
    expect(document.activeElement).toBe(viewport);
    const slides = container.querySelectorAll('[data-slot="carousel-item"]');
    expect(
      slides[0]
        .querySelector('[data-slot="carousel-item-content"]')!
        .hasAttribute("inert"),
    ).toBe(true);
  });

  it("chains consumer handlers on CarouselContent instead of dropping them", async () => {
    const user = userEvent.setup();
    const onPointerDown = vi.fn();
    const onClickCapture = vi.fn();
    const onKeyDown = vi.fn();

    const { container } = render(
      <Carousel aria-label="Handlers">
        <CarouselContent
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
        >
          {makeSlides(3)}
        </CarouselContent>
      </Carousel>,
    );
    const viewport = container.querySelector(
      '[data-slot="carousel-viewport"]',
    ) as HTMLElement;

    await user.click(viewport);
    expect(onPointerDown).toHaveBeenCalled();
    expect(onClickCapture).toHaveBeenCalled();

    viewport.focus();
    await user.keyboard("{ArrowRight}");
    expect(onKeyDown).toHaveBeenCalled();
  });
});
