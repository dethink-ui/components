import { describe, expect, it } from "vitest";
import { getInspectorValue, setInspectorValue } from "./inspector-path";

describe("getInspectorValue", () => {
  it("reads top-level, nested, and array paths", () => {
    const source = { name: "Card", layout: { width: 120 }, points: [{ x: 4 }] };

    expect(getInspectorValue(source, "name")).toBe("Card");
    expect(getInspectorValue(source, "layout.width")).toBe(120);
    expect(getInspectorValue(source, "points.0.x")).toBe(4);
  });

  it("returns undefined for missing or non-object branches", () => {
    expect(getInspectorValue({ a: 1 }, "b.c")).toBeUndefined();
    expect(getInspectorValue({ a: 1 }, "a.b")).toBeUndefined();
    expect(getInspectorValue(null, "a")).toBeUndefined();
  });
});

describe("setInspectorValue", () => {
  it("writes immutably and keeps untouched branches", () => {
    const style = { fill: "#fff" };
    const source = { layout: { width: 120, height: 40 }, style };
    const next = setInspectorValue(source, "layout.width", 160);

    expect(next).toEqual({ layout: { width: 160, height: 40 }, style });
    expect(next.style).toBe(style);
    expect(source.layout.width).toBe(120);
  });

  it("returns the same object when the value is unchanged", () => {
    const source = { layout: { width: 120 } };

    expect(setInspectorValue(source, "layout.width", 120)).toBe(source);
  });

  it("creates missing branches and copies arrays", () => {
    const points = [{ x: 1 }, { x: 2 }];
    const next = setInspectorValue({ points }, "points.1.x", 5);

    expect(Array.isArray(next.points)).toBe(true);
    expect(next.points).toEqual([{ x: 1 }, { x: 5 }]);
    expect(points[1]?.x).toBe(2);
    expect(setInspectorValue({}, "a.b", 1)).toEqual({ a: { b: 1 } });
  });

  it("rejects reserved keys", () => {
    expect(() => setInspectorValue({}, "__proto__.polluted", true)).toThrow(
      /reserved/,
    );
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
