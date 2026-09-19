import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePageVisible } from "./use-page-visible";

function Visibility() {
  return <output>{usePageVisible() ? "running" : "paused"}</output>;
}

describe("decorative animation visibility", () => {
  afterEach(() => vi.restoreAllMocks());

  it("pauses all consumers while the document is hidden and resumes on return", () => {
    let visibility: DocumentVisibilityState = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibility,
    );
    const { unmount } = render(
      <>
        <Visibility />
        <Visibility />
      </>,
    );
    expect(screen.getAllByText("running")).toHaveLength(2);
    act(() => {
      visibility = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getAllByText("paused")).toHaveLength(2);
    act(() => {
      visibility = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getAllByText("running")).toHaveLength(2);
    unmount();
  });
});
