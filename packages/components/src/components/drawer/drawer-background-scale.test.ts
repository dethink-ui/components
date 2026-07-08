import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  DRAWER_BACKGROUND_SCALE_ATTRIBUTE,
  DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE,
  useDrawerBackgroundScale,
} from "./drawer-background-scale";

function renderWrapper() {
  const wrapper = document.createElement("div");

  wrapper.setAttribute(DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE, "");
  document.body.appendChild(wrapper);

  return wrapper;
}

afterEach(() => {
  document
    .querySelectorAll(`[${DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE}]`)
    .forEach((node) => node.remove());
});

describe("useDrawerBackgroundScale", () => {
  it("does nothing when inactive", () => {
    const wrapper = renderWrapper();

    renderHook(() =>
      useDrawerBackgroundScale({ active: false, reducedMotion: false }),
    );

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);
  });

  it("marks the wrapper 'scaled' while active with motion enabled, and clears it on unmount", () => {
    const wrapper = renderWrapper();
    const { unmount } = renderHook(() =>
      useDrawerBackgroundScale({ active: true, reducedMotion: false }),
    );

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "scaled",
    );

    unmount();

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);
  });

  it("marks the wrapper 'dimmed' (not 'scaled') under reduced motion", () => {
    const wrapper = renderWrapper();
    const { unmount } = renderHook(() =>
      useDrawerBackgroundScale({ active: true, reducedMotion: true }),
    );

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "dimmed",
    );

    unmount();

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);
  });

  it("keeps 'scaled' active while a second, reduced-motion drawer closes independently", () => {
    const wrapper = renderWrapper();
    const scaled = renderHook(() =>
      useDrawerBackgroundScale({ active: true, reducedMotion: false }),
    );
    const dimmed = renderHook(() =>
      useDrawerBackgroundScale({ active: true, reducedMotion: true }),
    );

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "scaled",
    );

    dimmed.unmount();

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "scaled",
    );

    scaled.unmount();

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);
  });

  it("falls back to 'dimmed' once the last 'scaled' contributor unmounts while a dimmed one remains", () => {
    const wrapper = renderWrapper();
    const scaled = renderHook(() =>
      useDrawerBackgroundScale({ active: true, reducedMotion: false }),
    );

    renderHook(() =>
      useDrawerBackgroundScale({ active: true, reducedMotion: true }),
    );

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "scaled",
    );

    scaled.unmount();

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "dimmed",
    );
  });

  it("re-syncs when `active` toggles false without unmounting", () => {
    const wrapper = renderWrapper();
    const { rerender } = renderHook(
      ({ active }) =>
        useDrawerBackgroundScale({ active, reducedMotion: false }),
      { initialProps: { active: true } },
    );

    expect(wrapper.getAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(
      "scaled",
    );

    rerender({ active: false });

    expect(wrapper.hasAttribute(DRAWER_BACKGROUND_SCALE_ATTRIBUTE)).toBe(false);
  });

  it("is a no-op when no wrapper element is present in the document", () => {
    expect(() => {
      const { unmount } = renderHook(() =>
        useDrawerBackgroundScale({ active: true, reducedMotion: false }),
      );

      unmount();
    }).not.toThrow();
  });
});
