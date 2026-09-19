import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ShaderHeroText } from ".";

// Browser tests exercise the real renderer. Here the seam isolates callback and cancellation contracts.
vi.mock("./renderer", () => ({
  createTextRenderer: vi.fn((_canvas, _text, _root, animation) => ({
    mask: { padding: 10 },
    particles:
      animation === "particle-follow"
        ? {
            home: new Float32Array([10, 10]),
            positions: new Float32Array([10, 10]),
            velocity: new Float32Array(2),
            offsets: new Float32Array(2),
            radius: 100,
            lastPointer: null,
            direction: [1, 0],
            size: 1,
          }
        : null,
    draw: vi.fn(),
    dispose: vi.fn(),
  })),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("hover"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) =>
    setTimeout(() => fn(performance.now()), 16),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("manual activation fires one start and completion; replay is explicit and cancellation never completes", async () => {
  const start = vi.fn(),
    complete = vi.fn();
  const props = {
    text: "Ready when you are",
    trigger: "manual" as const,
    duration: 0.1,
    onAnimationStart: start,
    onAnimationComplete: complete,
  };
  const { rerender } = render(<ShaderHeroText {...props} active={false} />);
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(start).not.toHaveBeenCalled();
  rerender(<ShaderHeroText {...props} active />);
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(start).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(1);
  rerender(<ShaderHeroText {...props} active replayKey={1} />);
  await act(() => vi.advanceTimersByTimeAsync(32));
  rerender(<ShaderHeroText {...props} active={false} replayKey={1} />);
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(start).toHaveBeenCalledTimes(2);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("heading")).toHaveAttribute(
    "data-rendering",
    "false",
  );
});

it("particle re-entry is one cycle and zero return duration restores home immediately", async () => {
  const start = vi.fn(),
    complete = vi.fn();
  render(
    <ShaderHeroText
      text="Follow and return"
      animation="particle-follow"
      duration={0}
      onAnimationStart={start}
      onAnimationComplete={complete}
    />,
  );
  const heading = screen.getByRole("heading");
  const move = () => {
    const event = new Event("pointermove");
    Object.assign(event, {
      pointerType: "mouse",
      clientX: 200,
      clientY: 100,
      buttons: 0,
    });
    fireEvent(heading, event);
  };
  move();
  move();
  expect(start).toHaveBeenCalledTimes(1);
  await act(() => vi.advanceTimersByTimeAsync(100));
  fireEvent(heading, new Event("pointerleave"));
  expect(heading).toHaveAttribute("data-state", "formed");
  expect(heading).toHaveAttribute("data-animating", "false");
  expect(complete).toHaveBeenCalledTimes(1);
  move();
  expect(start).toHaveBeenCalledTimes(2);
  cleanup();
  await act(() => vi.advanceTimersByTimeAsync(300));
  expect(complete).toHaveBeenCalledTimes(1);
});
