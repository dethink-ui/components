import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Motion's useReducedMotion snapshots a module-level singleton on the first
// mount, so the preference must be in place before any render in this file.
// This file therefore owns only the positive reduced-motion case; the negative
// case lives in carousel.test.tsx, which never mocks the preference.
Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: (query: string) =>
    ({
      matches: query.includes("reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as MediaQueryList,
});

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
} from ".";

function Gallery() {
  return (
    <Carousel aria-label="Reduced">
      <CarouselContent>
        <CarouselItem>
          <div>One</div>
        </CarouselItem>
        <CarouselItem>
          <div>Two</div>
        </CarouselItem>
        <CarouselItem>
          <div>Three</div>
        </CarouselItem>
      </CarouselContent>
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

describe("Carousel reduced motion", () => {
  it("flags reduced motion and still changes slides instantly", async () => {
    const user = userEvent.setup();
    const { container } = render(<Gallery />);

    const root = container.querySelector(
      '[data-slot="carousel"]',
    ) as HTMLElement;
    await waitFor(() =>
      expect(root).toHaveAttribute("data-reduced-motion", "true"),
    );

    await user.click(screen.getByRole("button", { name: "Next slide" }));
    // Under reduced motion the change is an instant jump: the active slide
    // updates synchronously with no spring in flight.
    expect(
      screen.getByRole("button", { name: "Go to slide 2" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("settles the offset back to the held index when a controlled consumer ignores a drag", async () => {
    // Read-only controlled usage: index is pinned at 1 and onIndexChange is
    // ignored, so a drag that projects to another slide must spring (here:
    // jump, reduced motion) back to the committed index rather than resting at
    // a fractional offset.
    const onIndexChange = vi.fn();
    const { container } = render(
      <Carousel aria-label="Pinned" index={1} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>
            <div>One</div>
          </CarouselItem>
          <CarouselItem>
            <div>Two</div>
          </CarouselItem>
          <CarouselItem>
            <div>Three</div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const root = container.querySelector(
      '[data-slot="carousel"]',
    ) as HTMLElement;
    const viewport = container.querySelector(
      '[data-slot="carousel-viewport"]',
    ) as HTMLElement;
    await waitFor(() =>
      expect(root).toHaveAttribute("data-reduced-motion", "true"),
    );

    fireEvent.pointerDown(viewport, {
      button: 0,
      clientX: 200,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(viewport, {
      clientX: 140,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(viewport, {
      clientX: 140,
      pointerId: 1,
      pointerType: "mouse",
    });

    // The drag projected past the held slide and the consumer was notified...
    expect(onIndexChange).toHaveBeenCalled();
    // ...but ignored it, so the track returns to the committed index.
    await waitFor(() =>
      expect(root.style.getPropertyValue("--carousel-offset")).toBe("1"),
    );
  });
});
