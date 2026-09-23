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
  type CarouselStaging,
} from ".";

function Gallery({
  defaultIndex,
  staging,
}: {
  defaultIndex?: number;
  staging?: CarouselStaging;
}) {
  return (
    <Carousel
      aria-label="Featured"
      defaultIndex={defaultIndex}
      staging={staging}
    >
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

  it.each(["flat", "fan", "arc", "ribbon"] as const)(
    "hydrates %s without mismatch warnings",
    async (staging) => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const container = document.createElement("div");
      container.innerHTML = renderToString(
        <Gallery defaultIndex={1} staging={staging} />,
      );

      await act(async () => {
        hydrateRoot(container, <Gallery defaultIndex={1} staging={staging} />);
      });

      expect(
        consoleError.mock.calls.some(([message]) =>
          String(message).toLowerCase().includes("hydration"),
        ),
      ).toBe(false);
      consoleError.mockRestore();
    },
  );
});
