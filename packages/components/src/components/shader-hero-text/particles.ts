import type { TextMask } from "./text-mask";

export interface ParticleField {
  home: Float32Array;
  positions: Float32Array;
  velocity: Float32Array;
  offsets: Float32Array;
  size: number;
  radius: number;
  lastPointer: readonly [number, number] | null;
  direction: [number, number];
}

export function sampleParticles(
  mask: TextMask,
  seed: number,
): ParticleField | null {
  const { canvas, scale } = mask;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let filled = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i]! > 100) filled++;
  // Uniform sampling keeps the last word as well covered as the first.
  const step = Math.max(1.5 * scale, Math.sqrt(filled / 3000));
  const homes: number[] = [];
  for (let y = step / 2; y < canvas.height; y += step) {
    for (let x = step / 2; x < canvas.width; x += step) {
      if (data[(Math.floor(y) * canvas.width + Math.floor(x)) * 4 + 3]! > 100) {
        homes.push(x / scale, y / scale);
      }
    }
  }
  if (homes.length < 20 || homes.length > 16_000) return null;
  const home = new Float32Array(homes);
  const offsets = new Float32Array(homes.length);
  let random = seed >>> 0;
  for (let i = 0; i < offsets.length; i++) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    offsets[i] = (random / 4294967296 - 0.5) * mask.fontSize * 0.7;
  }
  return {
    home,
    positions: home.slice(),
    velocity: new Float32Array(home.length),
    offsets,
    size: Math.max(1, (step / scale) * 0.9),
    radius: Math.min(160, Math.max(64, mask.fontSize * 1.8)),
    lastPointer: null,
    direction: [1, 0],
  };
}

export function resetParticles(field: ParticleField) {
  field.positions.set(field.home);
  field.velocity.fill(0);
  field.lastPointer = null;
  field.direction[0] = 1;
  field.direction[1] = 0;
}

/** Exact critically damped spring step; no per-frame React updates or allocations. */
export function stepParticles(
  field: ParticleField,
  pointer: readonly [number, number] | null,
  dt: number,
  intensity: number,
  returnDuration: number,
) {
  const seconds = Math.min(0.05, Math.max(0, dt));
  if (pointer && field.lastPointer) {
    const dx = pointer[0] - field.lastPointer[0];
    const dy = pointer[1] - field.lastPointer[1];
    const travel = Math.hypot(dx, dy);
    if (travel > 0.5) {
      field.direction[0] = dx / travel;
      field.direction[1] = dy / travel;
    }
  }
  field.lastPointer = pointer;
  let moving = false;
  for (let i = 0; i < field.positions.length; i += 2) {
    // Measure from the glyph, never the displaced particle: moving dots cannot
    // recruit the rest of the headline into a growing cluster.
    const dx = pointer ? pointer[0] - field.home[i]! : 0;
    const dy = pointer ? pointer[1] - field.home[i + 1]! : 0;
    const distanceFromPointer = Math.hypot(dx, dy);
    const proximity = pointer
      ? Math.min(1, Math.max(0, (1 - distanceFromPointer / field.radius) * 1.5))
      : 0;
    const influence = proximity * proximity * (3 - 2 * proximity) * intensity;
    // Distribute nearby dots along a tapered tail opposite the travel direction.
    // Each dot keeps a seeded place in the tail, rather than sharing one target.
    const along = Math.min(
      1,
      Math.max(0, 0.5 + (field.offsets[i]! / field.radius) * 2.5),
    );
    const length = field.radius * 0.48 * along;
    const spread = field.offsets[i + 1]! * 0.45 * (0.2 + along);
    const tailX = -field.direction[0] * length - field.direction[1] * spread;
    const tailY = -field.direction[1] * length + field.direction[0] * spread;
    const omega = pointer
      ? 5 + (1 - along) * 4
      : 10 / Math.max(0.1, returnDuration);
    const decay = Math.exp(-omega * seconds);
    for (let axis = 0; axis < 2; axis++) {
      const index = i + axis;
      const drift = axis === 0 ? dx + tailX : dy + tailY;
      const target = field.home[index]! + drift * influence;
      const distance = field.positions[index]! - target;
      const impulse = field.velocity[index]! + omega * distance;
      const position = target + (distance + impulse * seconds) * decay;
      const velocity =
        (field.velocity[index]! - omega * impulse * seconds) * decay;
      if (Math.abs(position - target) < 0.08 && Math.abs(velocity) < 0.15) {
        field.positions[index] = target;
        field.velocity[index] = 0;
      } else {
        moving = true;
        field.positions[index] = position;
        field.velocity[index] = velocity;
      }
    }
  }
  return moving;
}
