import { describe, expect, it } from "vitest";
import {
  auroraBackgroundHueShifts,
  getAuroraBackgroundGeometry,
  getAuroraBackgroundMotionConfig,
} from ".";

describe("getAuroraBackgroundMotionConfig", () => {
  it("orders drift durations slow > normal > fast with infinite mirrored loops", () => {
    const slow = getAuroraBackgroundMotionConfig("slow");
    const normal = getAuroraBackgroundMotionConfig("normal");
    const fast = getAuroraBackgroundMotionConfig("fast");

    expect(slow.driftDuration).toBeGreaterThan(normal.driftDuration);
    expect(normal.driftDuration).toBeGreaterThan(fast.driftDuration);

    for (const config of [slow, normal, fast]) {
      expect(config.animateEnabled).toBe(true);
      expect(config.reducedMotion).toBe(false);
      expect(config.transition).toMatchObject({
        duration: config.driftDuration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      });
    }
  });

  it("returns a disabled config under reduced motion", () => {
    const config = getAuroraBackgroundMotionConfig("normal", true);

    expect(config.animateEnabled).toBe(false);
    expect(config.reducedMotion).toBe(true);
    expect(config.driftDuration).toBe(0);
    expect(config.transition).toEqual({ duration: 0 });
  });
});

describe("getAuroraBackgroundGeometry", () => {
  it("is deterministic for a fixed seed and density", () => {
    expect(getAuroraBackgroundGeometry(7, "normal")).toEqual(
      getAuroraBackgroundGeometry(7, "normal"),
    );
  });

  it("differs across seeds", () => {
    expect(getAuroraBackgroundGeometry(7, "normal")).not.toEqual(
      getAuroraBackgroundGeometry(8, "normal"),
    );
  });

  it("respects density ribbon counts", () => {
    expect(getAuroraBackgroundGeometry(1, "sparse")).toHaveLength(3);
    expect(getAuroraBackgroundGeometry(1, "normal")).toHaveLength(4);
    expect(getAuroraBackgroundGeometry(1, "dense")).toHaveLength(5);
  });

  it("keeps every ribbon within bounds", () => {
    for (const seed of [1, 7, 42, 1337]) {
      for (const ribbon of getAuroraBackgroundGeometry(seed, "dense")) {
        expect(ribbon.top).toBeGreaterThanOrEqual(-15);
        expect(ribbon.top).toBeLessThanOrEqual(65);
        expect(ribbon.rotationClassName).toMatch(/^-?rotate-(3|6|12)$/);
        expect(ribbon.driftX).toBeGreaterThanOrEqual(8);
        expect(ribbon.driftX).toBeLessThanOrEqual(18);
        expect(ribbon.driftY).toBeGreaterThanOrEqual(4);
        expect(ribbon.driftY).toBeLessThanOrEqual(10);
        expect(ribbon.swayDegrees).toBeGreaterThanOrEqual(2);
        expect(ribbon.swayDegrees).toBeLessThanOrEqual(6);
        expect(ribbon.delay).toBeGreaterThanOrEqual(0);
        expect(ribbon.delay).toBeLessThanOrEqual(6);
        expect(ribbon.durationScale).toBeGreaterThanOrEqual(0.85);
        expect(ribbon.durationScale).toBeLessThanOrEqual(1.25);
      }
    }
  });
});

describe("auroraBackgroundHueShifts", () => {
  it("is a fixed literal five-slot hue map anchored on the base hue", () => {
    expect(auroraBackgroundHueShifts).toHaveLength(5);
    expect(auroraBackgroundHueShifts[0]).toBe(0);
    expect(new Set(auroraBackgroundHueShifts).size).toBe(5);
  });
});
