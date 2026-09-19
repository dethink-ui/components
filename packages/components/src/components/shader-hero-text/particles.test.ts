import { describe, expect, it } from "vitest";
import { resetParticles, stepParticles, type ParticleField } from "./particles";
import { bounded } from "./types";

function field(): ParticleField {
  const home = new Float32Array([10, 20, 30, 40, 50, 60]);
  return {
    home,
    positions: home.slice(),
    velocity: new Float32Array(6),
    offsets: new Float32Array(6),
    size: 2,
  };
}

describe("particle following and return", () => {
  it("attracts to the pointer, converges without idle work, and returns to exact homes", () => {
    const particles = field();
    for (let i = 0; i < 200; i++)
      stepParticles(particles, [200, 100], 1 / 60, 1, 1.2);
    expect(Array.from(particles.positions)).toEqual([
      200, 100, 200, 100, 200, 100,
    ]);
    expect(stepParticles(particles, [200, 100], 1 / 60, 1, 1.2)).toBe(false);
    for (let i = 0; i < 200; i++)
      stepParticles(particles, null, 1 / 60, 1, 1.2);
    expect(particles.positions).toEqual(particles.home);
    expect(stepParticles(particles, null, 1 / 60, 1, 1.2)).toBe(false);
  });

  it("redirects a returning particle continuously and caps long time steps", () => {
    const particles = field();
    for (let i = 0; i < 20; i++)
      stepParticles(particles, [200, 100], 1 / 60, 0.8, 1.2);
    stepParticles(particles, null, 1 / 60, 0.8, 1.2);
    const previous = particles.positions.slice();
    stepParticles(particles, [0, 0], 0, 0.8, 1.2);
    expect(particles.positions).toEqual(previous);
    const copy = {
      ...particles,
      positions: particles.positions.slice(),
      velocity: particles.velocity.slice(),
    };
    stepParticles(particles, [0, 0], 300, 0.8, 1.2);
    stepParticles(copy, [0, 0], 0.05, 0.8, 1.2);
    expect(particles.positions).toEqual(copy.positions);
    resetParticles(particles);
    expect(particles.positions).toEqual(particles.home);
    expect(Array.from(particles.velocity).every((value) => value === 0)).toBe(
      true,
    );
  });

  it("bounds invalid and extreme public numeric controls", () => {
    expect(bounded(NaN, 0.5, 1)).toBe(0.5);
    expect(bounded(Infinity, 1.2, 2)).toBe(1.2);
    expect(bounded(-10, 1.2, 2)).toBe(0);
    expect(bounded(100, 1.2, 2)).toBe(2);
  });
});
