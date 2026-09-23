import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Card } from "../card";
import { CardStackAnimated } from ".";

it("changes selection without animated transforms when reduced motion is requested", async () => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  });
  const { container } = render(
    <CardStackAnimated>
      <Card>First</Card>
      <Card>Second</Card>
    </CardStackAnimated>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Show next card" }));
  expect(screen.getByRole("group")).toHaveAttribute("data-active-index", "1");
  for (const frame of container.querySelectorAll<HTMLElement>(
    '[data-slot="card-stack-item"]',
  ))
    expect(frame.style.transform).toBe("");
});
