import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  type CarouselStaging,
} from ".";

function Fixture({
  staging,
  index,
}: {
  staging: CarouselStaging;
  index?: number;
}) {
  return (
    <Carousel aria-label="Modes" staging={staging} index={index}>
      <CarouselContent>
        {[0, 1, 2].map((i) => (
          <CarouselItem key={i}>
            <input aria-label={`Field ${i}`} defaultValue="Editable text" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

describe.each(["fan", "arc", "ribbon"] as const)("%s mode", (staging) => {
  it("centers a preview without activating its content and preserves active controls", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const { container } = render(
      <Carousel staging={staging} aria-label="Clickable cards" drag={false}>
        <CarouselContent>
          <CarouselItem>First</CarouselItem>
          <CarouselItem>
            <button onClick={action}>Card action</button>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    await user.click(screen.getByRole("button", { name: "Show slide 2" }));
    expect(container.querySelector('[data-active="true"]')).toHaveAttribute(
      "aria-label",
      "2 of 2",
    );
    expect(action).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Card action" }));
    expect(action).toHaveBeenCalledOnce();
  });

  it("excludes every inactive card and rescues focus on controlled selection", () => {
    const { container, rerender } = render(
      <Fixture staging={staging} index={0} />,
    );
    screen.getByLabelText("Field 0").focus();
    rerender(<Fixture staging={staging} index={1} />);
    const slides = container.querySelectorAll(
      '[data-slot="carousel-item-content"]',
    );
    expect(slides[0]).toHaveAttribute("inert");
    expect(slides[1]).not.toHaveAttribute("inert");
    expect(slides[2]).toHaveAttribute("inert");
    expect(
      container.querySelector('[data-slot="carousel-viewport"]'),
    ).toHaveFocus();
  });

  it("preserves input keys and still supports viewport End/Home navigation", async () => {
    const user = userEvent.setup();
    const { container } = render(<Fixture staging={staging} />);
    const input = screen.getByLabelText("Field 0");
    input.focus();
    await user.keyboard("{End}{ArrowLeft}{Home}");
    expect(
      screen.getByRole("button", { name: "Go to slide 1" }),
    ).toHaveAttribute("aria-current", "true");
    const viewport = container.querySelector(
      '[data-slot="carousel-viewport"]',
    ) as HTMLElement;
    viewport.focus();
    await user.keyboard("{End}");
    expect(
      screen.getByRole("button", { name: "Go to slide 3" }),
    ).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
    await user.keyboard("{Home}");
    expect(
      screen.getByRole("button", { name: "Go to slide 1" }),
    ).toHaveAttribute("aria-current", "true");
  });
});

it("preserves selection when switching modes", async () => {
  const { rerender } = render(<Fixture staging="fan" />);
  fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
  rerender(<Fixture staging="arc" />);
  expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute(
    "aria-current",
    "true",
  );
  rerender(<Fixture staging="ribbon" />);
  expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});

it("lets controlled owners and capture handlers decline preview selection", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const gallery = (cancel: boolean) => (
    <Carousel
      aria-label="Controlled previews"
      staging="fan"
      index={0}
      onIndexChange={changed}
    >
      <CarouselContent
        onClickCapture={cancel ? (event) => event.preventDefault() : undefined}
      >
        <CarouselItem>First</CarouselItem>
        <CarouselItem>Second</CarouselItem>
      </CarouselContent>
    </Carousel>
  );
  const { container, rerender } = render(gallery(true));
  await user.click(screen.getByRole("button", { name: "Show slide 2" }));
  expect(changed).not.toHaveBeenCalled();
  rerender(gallery(false));
  await user.click(screen.getByRole("button", { name: "Show slide 2" }));
  expect(changed).toHaveBeenCalledWith(1);
  expect(container.querySelector('[data-active="true"]')).toHaveAttribute(
    "aria-label",
    "1 of 2",
  );
});

it("responds to a live motion preference change and releases the subscription", () => {
  let matches = false;
  const listeners = new Set<() => void>();
  const original = window.matchMedia;
  window.matchMedia = vi.fn(
    () =>
      ({
        get matches() {
          return matches;
        },
        addEventListener: (_: string, callback: () => void) =>
          listeners.add(callback),
        removeEventListener: (_: string, callback: () => void) =>
          listeners.delete(callback),
      }) as unknown as MediaQueryList,
  );
  try {
    const { container, unmount } = render(<Fixture staging="fan" />);
    act(() => {
      matches = true;
      listeners.forEach((callback) => callback());
    });
    expect(container.querySelector('[data-slot="carousel"]')).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    act(() => {
      matches = false;
      listeners.forEach((callback) => callback());
    });
    expect(
      container.querySelector('[data-slot="carousel"]'),
    ).not.toHaveAttribute("data-reduced-motion", "true");
    unmount();
    expect(listeners.size).toBe(0);
  } finally {
    window.matchMedia = original;
  }
});
