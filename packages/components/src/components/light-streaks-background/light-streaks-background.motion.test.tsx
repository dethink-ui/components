import { describe, expect, it } from "vitest";
import {
  getLightStreaksBackgroundGeometry,
  getLightStreaksBackgroundMotionConfig,
} from ".";

describe("getLightStreaksBackgroundMotionConfig", () => {
  it("orders sweep durations slow > normal > fast with infinite eased loops", () => {
    const slow = getLightStreaksBackgroundMotionConfig("slow");
    const normal = getLightStreaksBackgroundMotionConfig("normal");
    const fast = getLightStreaksBackgroundMotionConfig("fast");

    expect(slow.sweepDuration).toBeGreaterThan(normal.sweepDuration);
    expect(normal.sweepDuration).toBeGreaterThan(fast.sweepDuration);

    for (const config of [slow, normal, fast]) {
      expect(config.animateEnabled).toBe(true);
      expect(config.reducedMotion).toBe(false);
      expect(config.transition).toMatchObject({
        duration: config.sweepDuration,
        ease: "easeInOut",
        repeat: Infinity,
      });
    }
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getLightStreaksBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.sweepDuration).toBe(0);
    expect(config.transition).toEqual({ duration: 0 });
  });
});

describe("getLightStreaksBackgroundGeometry", () => {
  it("is deterministic for a fixed seed and density", () => {
    expect(getLightStreaksBackgroundGeometry(7, "normal")).toEqual(
      getLightStreaksBackgroundGeometry(7, "normal"),
    );
  });

  it("differs across seeds", () => {
    expect(getLightStreaksBackgroundGeometry(7, "normal")).not.toEqual(
      getLightStreaksBackgroundGeometry(8, "normal"),
    );
  });

  it("respects density streak counts", () => {
    expect(getLightStreaksBackgroundGeometry(1, "sparse")).toHaveLength(3);
    expect(getLightStreaksBackgroundGeometry(1, "normal")).toHaveLength(4);
    expect(getLightStreaksBackgroundGeometry(1, "dense")).toHaveLength(5);
  });

  it("keeps every streak within bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      for (const streak of getLightStreaksBackgroundGeometry(seed, "dense")) {
        expect(streak.left).toBeGreaterThanOrEqual(5);
        expect(streak.left).toBeLessThanOrEqual(80);
        expect(streak.delay).toBeGreaterThanOrEqual(0);
        expect(streak.delay).toBeLessThanOrEqual(5);
        expect(streak.repeatDelay).toBeGreaterThanOrEqual(1);
        expect(streak.repeatDelay).toBeLessThanOrEqual(4);
      }
    }
  });
});
