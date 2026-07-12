/**
 * Deterministic pseudo-random helpers for decorative components. Background
 * components must render identical markup on the server and every client
 * render, so all "random" placement flows through a caller-provided seed
 * instead of Math.random().
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRange(
  random: () => number,
  min: number,
  max: number,
): number {
  return min + (max - min) * random();
}

export function seededPick<T>(random: () => number, values: readonly T[]): T {
  return values[
    Math.min(values.length - 1, Math.floor(random() * values.length))
  ];
}
