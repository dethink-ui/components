import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Announcer, LiveRegion, LiveRegionProvider, useAnnouncer } from ".";

function AnnouncerButtons() {
  const announcer = useAnnouncer();

  return (
    <>
      <button
        type="button"
        onClick={() => announcer.announcePolite("Saved workspace")}
      >
        polite
      </button>
      <button
        type="button"
        onClick={() =>
          announcer.announceAssertive("Connection lost", {
            coalesceKey: "network",
            debounceMs: 100,
          })
        }
      >
        assertive
      </button>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("LiveRegionProvider", () => {
  it("announces polite and assertive messages through provider regions", async () => {
    vi.useFakeTimers();

    render(
      <LiveRegionProvider>
        <AnnouncerButtons />
      </LiveRegionProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "polite" }));

    expect(
      document.querySelector('[data-slot="live-region-polite"]'),
    ).toHaveTextContent("Saved workspace");

    fireEvent.click(screen.getByRole("button", { name: "assertive" }));

    expect(
      document.querySelector('[data-slot="live-region-assertive"]'),
    ).toHaveTextContent("");

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(
      document.querySelector('[data-slot="live-region-assertive"]'),
    ).toHaveTextContent("Connection lost");
  });

  it("supports declarative announcements and visible live regions", () => {
    render(
      <LiveRegionProvider>
        <Announcer message="3 results available" coalesceKey="results" />
        <LiveRegion visuallyHidden={false}>Visible status</LiveRegion>
      </LiveRegionProvider>,
    );

    expect(
      document.querySelector('[data-slot="live-region-polite"]'),
    ).toHaveTextContent("3 results available");
    expect(screen.getByText("Visible status")).not.toHaveClass("sr-only");
  });
});
