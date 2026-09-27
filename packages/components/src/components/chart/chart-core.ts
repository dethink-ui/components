/**
 * Dependency-free chart math shared by every Dethink chart. Everything here is
 * pure and DOM-free, so it runs identically on the server and the client.
 */

export type ChartTokenColor =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "chart-7"
  | "chart-8";

/** A chart palette slot (`"chart-3"`) or any CSS color (`"var(--brand)"`, `"#0af"`). */
export type ChartColor = ChartTokenColor | (string & {});

export type ChartCurve = "monotone" | "linear" | "step";

export type ChartValue = number | null | undefined;

export interface ChartPoint {
  x: number;
  y: number;
}

export interface LinearScale {
  (value: number): number;
  domain: readonly [number, number];
  range: readonly [number, number];
  invert: (pixel: number) => number;
}

export interface BandScale<Key extends string = string> {
  (key: Key): number | undefined;
  bandwidth: number;
  step: number;
  domain: readonly Key[];
}

export interface BandScaleOptions {
  paddingInner?: number;
  paddingOuter?: number;
}

export interface StackedSeries<Key extends string = string> {
  key: Key;
  /** `[lower, upper]` per datum. Missing values stack as zero-height. */
  values: Array<readonly [number, number]>;
}

export interface SeriesSummary {
  count: number;
  first?: number;
  last?: number;
  min?: number;
  max?: number;
  minIndex?: number;
  maxIndex?: number;
}

const chartTokenPattern = /^chart-[1-8]$/;

export function isChartTokenColor(color: string): color is ChartTokenColor {
  return chartTokenPattern.test(color);
}

/** Resolve a palette slot to its CSS variable; pass other CSS colors through. */
export function resolveChartColor(color: ChartColor = "chart-1") {
  return isChartTokenColor(color) ? `var(--dt-color-${color})` : color;
}

export function isFiniteValue(value: ChartValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function extent(
  values: Iterable<ChartValue>,
): [number, number] | undefined {
  let min = Infinity;
  let max = -Infinity;

  for (const value of values) {
    if (!isFiniteValue(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return min === Infinity ? undefined : [min, max];
}

export function scaleLinear(
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  // A flat domain maps every value to the middle of the range.
  const scale = ((value: number) =>
    span === 0
      ? (r0 + r1) / 2
      : r0 + ((value - d0) / span) * (r1 - r0)) as LinearScale;

  scale.domain = domain;
  scale.range = range;
  scale.invert = (pixel: number) =>
    r1 === r0 ? d0 : d0 + ((pixel - r0) / (r1 - r0)) * span;

  return scale;
}

export function scaleBand<Key extends string>(
  domain: readonly Key[],
  range: readonly [number, number],
  { paddingInner = 0.2, paddingOuter = 0.1 }: BandScaleOptions = {},
): BandScale<Key> {
  const [r0, r1] = range;
  const count = domain.length;
  const step =
    count === 0
      ? 0
      : (r1 - r0) / Math.max(1, count - paddingInner + paddingOuter * 2);
  const bandwidth = step * (1 - paddingInner);
  const start = r0 + step * paddingOuter;
  const index = new Map(domain.map((key, i) => [key, i]));
  const scale = ((key: Key) => {
    const i = index.get(key);
    return i === undefined ? undefined : start + step * i;
  }) as BandScale<Key>;

  scale.bandwidth = bandwidth;
  scale.step = step;
  scale.domain = domain;

  return scale;
}

function tickIncrement(start: number, stop: number, count: number) {
  const step = (stop - start) / Math.max(1, count);
  const power = Math.floor(Math.log10(step));
  const error = step / 10 ** power;
  const factor = error >= 7.07 ? 10 : error >= 3.16 ? 5 : error >= 1.41 ? 2 : 1;
  return factor * 10 ** power;
}

/** Evenly spaced "round" tick values (1, 2, 5 × 10ⁿ) covering `[min, max]`. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const reverse = max < min;
  const [lo, hi] = reverse ? [max, min] : [min, max];
  const step = tickIncrement(lo, hi, count);
  const first = Math.ceil(lo / step);
  const last = Math.floor(hi / step);
  // Round away floating-point noise such as 0.30000000000000004.
  const digits = Math.max(0, -Math.floor(Math.log10(step)));
  const ticks: number[] = [];

  for (let i = first; i <= last; i += 1) {
    ticks.push(Number((i * step).toFixed(digits)));
  }

  return reverse ? ticks.reverse() : ticks;
}

/** Extend `[min, max]` outwards to round tick boundaries. */
export function niceDomain(
  min: number,
  max: number,
  count = 5,
): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    if (min === 0) return [0, 1];
    return min > 0 ? [0, min] : [min, 0];
  }

  const step = tickIncrement(min, max, count);
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
}

/** Value domain for a chart: includes zero unless told otherwise, then niced. */
export function valueDomain(
  values: Iterable<ChartValue>,
  { includeZero = true, nice = true, count = 5 } = {},
): [number, number] {
  const bounds = extent(values) ?? [0, 1];
  let [min, max] = bounds;

  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  return nice ? niceDomain(min, max, count) : [min, max];
}

/** Split points into runs of consecutive defined values so gaps stay gaps. */
export function definedSegments(
  values: readonly ChartValue[],
  toPoint: (value: number, index: number) => ChartPoint,
): ChartPoint[][] {
  const segments: ChartPoint[][] = [];
  let current: ChartPoint[] = [];

  values.forEach((value, index) => {
    if (isFiniteValue(value)) {
      current.push(toPoint(value, index));
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  });

  if (current.length > 0) segments.push(current);
  return segments;
}

const round = (value: number) => Math.round(value * 100) / 100;

function sign(value: number) {
  return value < 0 ? -1 : 1;
}

// Fritsch–Carlson monotone tangents: the curve never overshoots its data.
function monotoneTangents(points: readonly ChartPoint[]) {
  const n = points.length;
  const tangents = new Array<number>(n).fill(0);
  if (n < 2) return tangents;

  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const dx = points[i + 1]!.x - points[i]!.x;
    slopes.push(dx === 0 ? 0 : (points[i + 1]!.y - points[i]!.y) / dx);
  }

  for (let i = 1; i < n - 1; i += 1) {
    const s0 = slopes[i - 1]!;
    const s1 = slopes[i]!;
    const h0 = points[i]!.x - points[i - 1]!.x;
    const h1 = points[i + 1]!.x - points[i]!.x;
    const p = (s0 * h1 + s1 * h0) / (h0 + h1 || 1);
    tangents[i] =
      (sign(s0) + sign(s1)) *
        Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }

  tangents[0] = n === 2 ? slopes[0]! : (3 * slopes[0]! - tangents[1]!) / 2;
  tangents[n - 1] =
    n === 2 ? slopes[n - 2]! : (3 * slopes[n - 2]! - tangents[n - 2]!) / 2;

  // Clamp endpoints so the first and last segments stay monotone too.
  for (const [end, slope] of [
    [0, slopes[0]!],
    [n - 1, slopes[n - 2]!],
  ] as const) {
    if (slope === 0 || sign(tangents[end]!) !== sign(slope)) {
      tangents[end] = 0;
    } else if (Math.abs(tangents[end]!) > 3 * Math.abs(slope)) {
      tangents[end] = 3 * slope;
    }
  }

  return tangents;
}

function segmentCommands(
  points: readonly ChartPoint[],
  curve: ChartCurve,
): string {
  if (points.length === 0) return "";
  const [head, ...rest] = points;
  let path = "";

  if (curve === "step") {
    let previous = head!;
    for (const point of rest) {
      const mid = round((previous.x + point.x) / 2);
      path += `H${mid}V${round(point.y)}H${round(point.x)}`;
      previous = point;
    }
    return path;
  }

  // Monotone needs three points for tangents; two points draw straight.
  if (curve === "linear" || points.length < 3) {
    for (const point of rest) path += `L${round(point.x)},${round(point.y)}`;
    return path;
  }

  const tangents = monotoneTangents(points);
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const dx = (p1.x - p0.x) / 3;
    path +=
      `C${round(p0.x + dx)},${round(p0.y + dx * tangents[i]!)},` +
      `${round(p1.x - dx)},${round(p1.y - dx * tangents[i + 1]!)},` +
      `${round(p1.x)},${round(p1.y)}`;
  }
  return path;
}

/** SVG path data for a line through the points. A single point draws nothing. */
export function linePath(
  points: readonly ChartPoint[],
  curve: ChartCurve = "monotone",
): string {
  if (points.length < 2) return "";
  const head = points[0]!;
  return `M${round(head.x)},${round(head.y)}${segmentCommands(points, curve)}`;
}

/**
 * SVG path data for an area between the `top` points and a baseline, which is
 * either a flat pixel `y` or a matching array of lower points (stacked areas).
 */
export function areaPath(
  top: readonly ChartPoint[],
  baseline: number | readonly ChartPoint[],
  curve: ChartCurve = "monotone",
): string {
  if (top.length < 2) return "";
  const bottom =
    typeof baseline === "number"
      ? top.map((point) => ({ x: point.x, y: baseline }))
      : baseline;
  const reversed = [...bottom].reverse();
  const tail = reversed[0]!;

  return (
    linePath(top, curve) +
    `L${round(tail.x)},${round(tail.y)}` +
    segmentCommands(reversed, curve) +
    "Z"
  );
}

/** Stack series on top of each other (positive values up, negatives down). */
export function stackSeries<Datum, Key extends string>(
  data: readonly Datum[],
  keys: readonly Key[],
  valueOf: (datum: Datum, key: Key) => ChartValue,
): StackedSeries<Key>[] {
  const positive = new Array<number>(data.length).fill(0);
  const negative = new Array<number>(data.length).fill(0);

  return keys.map((key) => ({
    key,
    values: data.map((datum, index) => {
      const raw = valueOf(datum, key);
      const value = isFiniteValue(raw) ? raw : 0;
      const base = value < 0 ? negative : positive;
      const lower = base[index]!;
      base[index] = lower + value;
      return value < 0
        ? ([lower + value, lower] as const)
        : ([lower, lower + value] as const);
    }),
  }));
}

/** Index of the position nearest to `target` in an ascending list. */
export function nearestIndex(positions: readonly number[], target: number) {
  if (positions.length === 0) return -1;
  let lo = 0;
  let hi = positions.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (positions[mid]! < target) lo = mid + 1;
    else hi = mid;
  }

  if (lo > 0 && target - positions[lo - 1]! <= positions[lo]! - target) {
    return lo - 1;
  }
  return lo;
}

export function summarizeSeries(values: readonly ChartValue[]): SeriesSummary {
  const summary: SeriesSummary = { count: 0 };

  values.forEach((value, index) => {
    if (!isFiniteValue(value)) return;
    summary.count += 1;
    summary.first ??= value;
    summary.last = value;
    if (summary.min === undefined || value < summary.min) {
      summary.min = value;
      summary.minIndex = index;
    }
    if (summary.max === undefined || value > summary.max) {
      summary.max = value;
      summary.maxIndex = index;
    }
  });

  return summary;
}

export interface FormatChartValueOptions extends Intl.NumberFormatOptions {
  /**
   * Defaults to "en-US" rather than the runtime locale, so server and client
   * render identical text and hydration never mismatches. Pass the user's
   * locale explicitly to localize.
   */
  locale?: string | string[];
}

export const DEFAULT_CHART_LOCALE = "en-US";

const formatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Compact, locale-aware number formatting: 1,284 · 12.9K · $4.2M.
 * Values below 10,000 stay in full so small counts remain exact.
 */
export function formatChartValue(
  value: number,
  { locale = DEFAULT_CHART_LOCALE, ...options }: FormatChartValueOptions = {},
): string {
  const compact =
    options.notation === undefined && Math.abs(value) >= 10_000
      ? ({ notation: "compact", maximumFractionDigits: 1 } as const)
      : // Whole amounts drop trailing zeros ($9,310, not $9,310.00) while
        // fractional ones keep them ($12.50).
        ({
          maximumFractionDigits: 2,
          trailingZeroDisplay: "stripIfInteger",
        } as Intl.NumberFormatOptions);
  const resolved = { ...compact, ...options };
  const cacheKey = JSON.stringify([locale, resolved]);
  let formatter = formatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, resolved);
    formatterCache.set(cacheKey, formatter);
  }

  return formatter.format(value);
}

export interface BarPathOptions {
  /** Left edge in pixels. */
  x: number;
  width: number;
  /** Pixel position of the zero baseline. */
  baseline: number;
  /** Pixel position of the value end. */
  value: number;
  /** Corner radius of the data end; the baseline end stays square. */
  radius?: number;
}

/** A vertical bar with a rounded data-end and a square baseline. */
export function barPath({
  x,
  width,
  baseline,
  value,
  radius = 4,
}: BarPathOptions): string {
  const height = Math.abs(baseline - value);
  if (width <= 0 || height === 0) return "";

  const r = Math.max(0, Math.min(radius, width / 2, height));
  const up = value < baseline;
  const end = up ? value + r : value - r;
  const sweep = up ? 1 : 0;
  const right = x + width;

  return (
    `M${round(x)},${round(baseline)}V${round(end)}` +
    `A${round(r)},${round(r)} 0 0 ${sweep} ${round(x + r)},${round(value)}` +
    `H${round(right - r)}` +
    `A${round(r)},${round(r)} 0 0 ${sweep} ${round(right)},${round(end)}` +
    `V${round(baseline)}Z`
  );
}
