import { describe, expect, it } from "vitest";
import { mulberry32, seededPick, seededRange } from "./seeded-random";

describe("mulberry32", () => {
  it("produces a stable sequence for a fixed seed", () => {
    const first = mulberry32(7);
    const second = mulberry32(7);
    const firstSequence = Array.from({ length: 8 }, () => first());
    const secondSequence = Array.from({ length: 8 }, () => second());

    expect(firstSequence).toEqual(secondSequence);
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const aSequence = Array.from({ length: 8 }, () => a());
    const bSequence = Array.from({ length: 8 }, () => b());

    expect(aSequence).not.toEqual(bSequence);
  });

  it("stays within [0, 1)", () => {
    const random = mulberry32(42);

    for (let index = 0; index < 1000; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("seededRange", () => {
  it("stays within the requested bounds", () => {
    const random = mulberry32(11);

    for (let index = 0; index < 500; index += 1) {
      const value = seededRange(random, 8, 92);
      expect(value).toBeGreaterThanOrEqual(8);
      expect(value).toBeLessThan(92);
    }
  });
});

describe("seededPick", () => {
  it("returns a member of the list deterministically", () => {
    const values = ["a", "b", "c"] as const;
    const first = mulberry32(3);
    const second = mulberry32(3);
    const firstPicks = Array.from({ length: 12 }, () =>
      seededPick(first, values),
    );
    const secondPicks = Array.from({ length: 12 }, () =>
      seededPick(second, values),
    );

    expect(firstPicks).toEqual(secondPicks);
    for (const pick of firstPicks) {
      expect(values).toContain(pick);
    }
  });
});
