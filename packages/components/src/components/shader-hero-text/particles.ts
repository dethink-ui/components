import type { TextMask } from "./text-mask";

export interface ParticleField {
  home: Float32Array;
  positions: Float32Array;
  velocity: Float32Array;
  offsets: Float32Array;
  size: number;
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
  };
}

export function resetParticles(field: ParticleField) {
  field.positions.set(field.home);
  field.velocity.fill(0);
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
  const omega = pointer ? 14 : 10 / Math.max(0.1, returnDuration);
  const decay = Math.exp(-omega * seconds);
  let moving = false;
  for (let i = 0; i < field.positions.length; i++) {
    const target = pointer
      ? field.home[i]! +
        (pointer[i % 2]! + field.offsets[i]! - field.home[i]!) * intensity
      : field.home[i]!;
    const distance = field.positions[i]! - target;
    const impulse = field.velocity[i]! + omega * distance;
    const position = target + (distance + impulse * seconds) * decay;
    const velocity = (field.velocity[i]! - omega * impulse * seconds) * decay;
    if (Math.abs(position - target) < 0.08 && Math.abs(velocity) < 0.15) {
      field.positions[i] = target;
      field.velocity[i] = 0;
    } else {
      moving = true;
      field.positions[i] = position;
      field.velocity[i] = velocity;
    }
  }
  return moving;
}
