import { describe, expect, it } from "vitest";
import { resetParticles, stepParticles, type ParticleField } from "./particles";
import { bounded } from "./types";

function field(): ParticleField {
  const home = new Float32Array([10, 20, 30, 40, 250, 60]);
  return {
    home,
    positions: home.slice(),
    velocity: new Float32Array(6),
    offsets: new Float32Array(6),
    size: 2,
    radius: 100,
    lastPointer: null,
    direction: [1, 0],
  };
}

describe("particle following and return", () => {
  it("gently attracts nearby particles, leaves distant letters intact, settles and returns home", () => {
    const particles = field();
    stepParticles(particles, [60, 40], 1 / 60, 1, 1.2);
    expect(particles.positions[0]).toBeLessThan(11);
    for (let i = 0; i < 200; i++)
      stepParticles(particles, [60, 40], 1 / 60, 1, 1.2);
    expect(particles.positions[0]).toBeGreaterThan(10);
    expect(particles.positions[0]).toBeLessThan(60);
    expect(particles.positions[2]).toBeGreaterThan(30);
    expect(particles.positions[2]).toBeLessThan(45);
    expect(particles.positions.slice(4)).toEqual(particles.home.slice(4));
    expect(stepParticles(particles, [60, 40], 1 / 60, 1, 1.2)).toBe(false);
    for (let i = 0; i < 200; i++)
      stepParticles(particles, null, 1 / 60, 1, 1.2);
    expect(particles.positions).toEqual(particles.home);
    expect(stepParticles(particles, null, 1 / 60, 1, 1.2)).toBe(false);
  });

  it("redirects a returning particle continuously and caps long time steps", () => {
    const particles = field();
    for (let i = 0; i < 20; i++)
      stepParticles(particles, [60, 40], 1 / 60, 0.8, 1.2);
    stepParticles(particles, null, 1 / 60, 0.8, 1.2);
    const previous = particles.positions.slice();
    stepParticles(particles, [0, 0], 0, 0.8, 1.2);
    expect(particles.positions).toEqual(previous);
    const copy = {
      ...particles,
      positions: particles.positions.slice(),
      velocity: particles.velocity.slice(),
      direction: [...particles.direction] as [number, number],
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

  it("forms a tail behind the direction of travel and turns it when the pointer reverses", () => {
    const particles = field();
    stepParticles(particles, [40, 40], 1 / 60, 1, 1.2);
    for (let i = 0; i < 200; i++)
      stepParticles(particles, [60, 40], 1 / 60, 1, 1.2);
    expect(particles.positions[2]).toBeLessThan(60);
    expect(particles.positions[2]).toBeGreaterThan(30);
    for (let i = 0; i < 200; i++)
      stepParticles(particles, [40, 40], 1 / 60, 1, 1.2);
    expect(particles.positions[2]).toBeGreaterThan(40);
    expect(particles.positions.slice(4)).toEqual(particles.home.slice(4));
  });

  it("releases the previous area when the pointer moves to another word", () => {
    const particles = field();
    for (let i = 0; i < 200; i++)
      stepParticles(particles, [60, 40], 1 / 60, 1, 1.2);
    for (let i = 0; i < 300; i++)
      stepParticles(particles, [280, 60], 1 / 60, 1, 1.2);
    expect(particles.positions.slice(0, 4)).toEqual(particles.home.slice(0, 4));
    expect(particles.positions[4]).toBeGreaterThan(250);
    expect(particles.positions[4]).toBeLessThan(265);
  });

  it("bounds invalid and extreme public numeric controls", () => {
    expect(bounded(NaN, 0.5, 1)).toBe(0.5);
    expect(bounded(Infinity, 1.2, 2)).toBe(1.2);
    expect(bounded(-10, 1.2, 2)).toBe(0);
    expect(bounded(100, 1.2, 2)).toBe(2);
  });
});
