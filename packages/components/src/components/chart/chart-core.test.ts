import { describe, expect, it } from "vitest";
import {
  areaPath,
  barPath,
  definedSegments,
  extent,
  formatChartValue,
  linePath,
  nearestIndex,
  niceDomain,
  niceTicks,
  resolveChartColor,
  scaleBand,
  scaleLinear,
  stackSeries,
  summarizeSeries,
  valueDomain,
} from "./chart-core";

// Sample a cubic Bézier path's y values to check it never leaves the data range.
function sampleCubicYs(path: string) {
  const numbers = path.match(/-?\d+(\.\d+)?/g)!.map(Number);
  let [x0, y0] = numbers.splice(0, 2) as [number, number];
  const ys: number[] = [];
  void x0;
  while (numbers.length >= 6) {
    const [, c1y, , c2y, x3, y3] = numbers.splice(0, 6) as number[];
    for (let t = 0; t <= 1; t += 0.05) {
      const u = 1 - t;
      ys.push(
        u * u * u * y0 +
          3 * u * u * t * c1y! +
          3 * u * t * t * c2y! +
          t * t * t * y3!,
      );
    }
    x0 = x3!;
    y0 = y3!;
  }
  return ys;
}

describe("chart core", () => {
  it("resolves palette slots to tokens and passes other colors through", () => {
    expect(resolveChartColor()).toBe("var(--dt-color-chart-1)");
    expect(resolveChartColor("chart-8")).toBe("var(--dt-color-chart-8)");
    expect(resolveChartColor("chart-9")).toBe("chart-9");
    expect(resolveChartColor("#0af")).toBe("#0af");
  });

  it("computes extents ignoring missing values", () => {
    expect(extent([3, null, -2, undefined, Number.NaN, 7])).toEqual([-2, 7]);
    expect(extent([null, undefined])).toBeUndefined();
  });

  it("maps and inverts linear scales, centring flat domains", () => {
    const scale = scaleLinear([0, 100], [200, 0]);
    expect(scale(25)).toBe(150);
    expect(scale.invert(150)).toBe(25);
    expect(scaleLinear([5, 5], [0, 10])(5)).toBe(5);
  });

  it("lays out band scales with inner and outer padding", () => {
    const band = scaleBand(["a", "b", "c"], [0, 300], {
      paddingInner: 0,
      paddingOuter: 0,
    });
    expect(band("a")).toBe(0);
    expect(band("c")).toBe(200);
    expect(band.bandwidth).toBe(100);
    expect(band("z" as "a")).toBeUndefined();
  });

  it("produces round ticks and niced domains", () => {
    expect(niceTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(3, 3)).toEqual([3]);
    expect(niceDomain(3, 97)).toEqual([0, 100]);
    expect(niceDomain(0, 0)).toEqual([0, 1]);
    expect(valueDomain([120, 480])).toEqual([0, 500]);
    expect(valueDomain([120, 480], { includeZero: false })).toEqual([100, 500]);
    expect(valueDomain([-30, 45])).toEqual([-40, 60]);
  });

  it("splits series into defined segments so gaps stay gaps", () => {
    const segments = definedSegments([1, 2, null, 4, undefined], (v, i) => ({
      x: i,
      y: v,
    }));
    expect(segments).toEqual([
      [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
      ],
      [{ x: 3, y: 4 }],
    ]);
  });

  it("draws lines and never overshoots the data with the monotone curve", () => {
    expect(linePath([{ x: 0, y: 0 }])).toBe("");
    expect(
      linePath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 5 },
        ],
        "linear",
      ),
    ).toBe("M0,0L10,5");
    expect(
      linePath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 5 },
          { x: 20, y: 5 },
        ],
        "step",
      ),
    ).toBe("M0,0H5V5H10H15V5H20");

    // Two points still step rather than falling back to a diagonal.
    expect(
      linePath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 5 },
        ],
        "step",
      ),
    ).toBe("M0,0H5V5H10");
    expect(
      areaPath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 5 },
        ],
        10,
        "step",
      ),
    ).toBe("M0,0H5V5H10L10,10H5V10H0Z");

    const spiky = [0, 100, 0, 0, 100, 100, 3].map((y, x) => ({ x: x * 10, y }));
    const ys = sampleCubicYs(linePath(spiky));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-0.01);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100.01);
  });

  it("closes areas against a flat baseline or a lower series", () => {
    const top = [
      { x: 0, y: 2 },
      { x: 10, y: 4 },
    ];
    expect(areaPath(top, 10, "linear")).toBe("M0,2L10,4L10,10L0,10Z");
    expect(
      areaPath(
        top,
        [
          { x: 0, y: 8 },
          { x: 10, y: 9 },
        ],
        "linear",
      ),
    ).toBe("M0,2L10,4L10,9L0,8Z");
  });

  it("stacks positive values upwards and negative values downwards", () => {
    const stacked = stackSeries(
      [
        { a: 2, b: 3 },
        { a: -1, b: null },
      ],
      ["a", "b"] as const,
      (datum, key) => datum[key],
    );
    expect(stacked[0]!.values).toEqual([
      [0, 2],
      [-1, 0],
    ]);
    expect(stacked[1]!.values).toEqual([
      [2, 5],
      [0, 0],
    ]);
  });

  it("builds bars with a rounded data-end and square baseline", () => {
    const up = barPath({ x: 0, width: 10, baseline: 100, value: 40 });
    expect(up.startsWith("M0,100V44A4,4 0 0 1 4,40")).toBe(true);
    const down = barPath({ x: 0, width: 10, baseline: 50, value: 80 });
    expect(down).toContain("A4,4 0 0 0 4,80");
    expect(barPath({ x: 0, width: 10, baseline: 50, value: 50 })).toBe("");
    // Radius shrinks to fit short bars.
    expect(barPath({ x: 0, width: 10, baseline: 10, value: 8 })).toContain(
      "A2,2",
    );
  });

  it("finds the nearest position, preferring the earlier index on ties", () => {
    const xs = [0, 10, 20, 30];
    expect(nearestIndex(xs, -5)).toBe(0);
    expect(nearestIndex(xs, 14)).toBe(1);
    expect(nearestIndex(xs, 15)).toBe(1);
    expect(nearestIndex(xs, 16)).toBe(2);
    expect(nearestIndex(xs, 99)).toBe(3);
    expect(nearestIndex([], 5)).toBe(-1);
  });

  it("summarizes a series with first, last and extremes", () => {
    expect(summarizeSeries([null, 4, 1, 9, null])).toEqual({
      count: 3,
      first: 4,
      last: 9,
      min: 1,
      minIndex: 2,
      max: 9,
      maxIndex: 3,
    });
    expect(summarizeSeries([])).toEqual({ count: 0 });
  });

  it("formats with a fixed default locale so SSR and hydration agree", () => {
    expect(
      formatChartValue(4_200_000, { style: "currency", currency: "USD" }),
    ).toBe("$4.2M");
    // Whole compact currency never gains a trailing ".0" (hydration-safe).
    expect(
      formatChartValue(20_000, { style: "currency", currency: "USD" }),
    ).toBe("$20K");
    expect(formatChartValue(12_940, { locale: "de-DE" })).toBe("12.940");
    expect(formatChartValue(1284.5, { locale: "de-DE" })).toBe("1.284,5");
  });

  it("drops trailing zeros only from whole currency amounts", () => {
    const usd = { style: "currency", currency: "USD" } as const;
    expect(formatChartValue(9310, usd)).toBe("$9,310");
    expect(formatChartValue(12.5, usd)).toBe("$12.50");
    expect(formatChartValue(48_210, usd)).toBe("$48.2K");
  });

  it("formats values compactly only once they get large", () => {
    expect(formatChartValue(1284, { locale: "en-US" })).toBe("1,284");
    expect(formatChartValue(12_940, { locale: "en-US" })).toBe("12.9K");
    expect(
      formatChartValue(4_200_000, {
        locale: "en-US",
        style: "currency",
        currency: "USD",
      }),
    ).toBe("$4.2M");
    expect(
      formatChartValue(0.1234, { locale: "en-US", style: "percent" }),
    ).toBe("12.34%");
  });
});
