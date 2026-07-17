import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
} from ".";

function Gallery({ defaultIndex }: { defaultIndex?: number }) {
  return (
    <Carousel aria-label="Featured" defaultIndex={defaultIndex}>
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

describe("Carousel SSR", () => {
  it("renders the resting pose and slot markers on the server", () => {
    const html = renderToString(<Gallery defaultIndex={1} />);
    expect(html).toContain('data-slot="carousel"');
    expect(html).toContain('data-slot="carousel-viewport"');
    expect(html).toContain('data-slot="carousel-track"');
    expect(html).toContain('data-slot="carousel-item"');
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain("--carousel-offset:1");
    expect(html).toContain("One");
  });

  it("renders deterministic markup across repeated server renders", () => {
    expect(renderToString(<Gallery defaultIndex={0} />)).toBe(
      renderToString(<Gallery defaultIndex={0} />),
    );
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Gallery defaultIndex={1} />);

    await act(async () => {
      hydrateRoot(container, <Gallery defaultIndex={1} />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
