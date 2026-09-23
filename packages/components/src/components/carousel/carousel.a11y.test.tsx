import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselStaging,
} from ".";

expect.extend(toHaveNoViolations);

function Gallery({ staging }: { staging?: CarouselStaging }) {
  return (
    <main aria-label="Carousel smoke">
      <Carousel aria-label="Featured work" staging={staging}>
        <CarouselContent>
          <CarouselItem>
            <div style={{ height: 120 }}>First</div>
          </CarouselItem>
          <CarouselItem>
            <div style={{ height: 120 }}>Second</div>
          </CarouselItem>
          <CarouselItem>
            <div style={{ height: 120 }}>Third</div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </main>
  );
}

describe("Carousel accessibility", () => {
  it.each(["fan", "arc", "ribbon"] as const)(
    "has no axe violations in %s staging",
    async (staging) => {
      const { container } = render(<Gallery staging={staging} />);
      await expect(axe(container)).resolves.toHaveNoViolations();
    },
  );
  it("has no axe violations in flat staging", async () => {
    const { container } = render(<Gallery staging="flat" />);
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations in tilt staging", async () => {
    const { container } = render(<Gallery staging="tilt" />);
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations in floor staging", async () => {
    const { container } = render(<Gallery staging="floor" />);
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("describes the region as a carousel and slides as slides", () => {
    const { container } = render(<Gallery />);
    const region = container.querySelector('[data-slot="carousel"]');
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");

    for (const slide of container.querySelectorAll(
      '[data-slot="carousel-item"]',
    )) {
      expect(slide).toHaveAttribute("role", "group");
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
      expect(slide.getAttribute("aria-label")).toMatch(/^\d+ of 3$/);
    }
  });

  it("exposes a polite live region for control-driven announcements", () => {
    const { container } = render(<Gallery />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
  });
});
