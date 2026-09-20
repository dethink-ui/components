import { backgroundFragment, backgroundVertex } from "./shaders";
import { bufferSize, type ShaderBackgroundEffect } from "./types";

export interface BackgroundRenderer {
  resize: () => boolean;
  colors: () => void;
  draw: (time: number, pointer: readonly [number, number]) => void;
  dispose: () => void;
}

export function createBackgroundRenderer(
  canvas: HTMLCanvasElement,
  root: HTMLElement,
  effect: ShaderBackgroundEffect,
  intensity: number,
  seed: number,
): BackgroundRenderer {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null,
    buffer: WebGLBuffer | null = null;
  const dispose = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach((s) => gl.deleteShader(s));
    shaders.length = 0;
    buffer = program = null;
  };
  try {
    program = gl.createProgram();
    if (!program) throw new Error("No program");
    for (const [type, source] of [
      [gl.VERTEX_SHADER, backgroundVertex],
      [gl.FRAGMENT_SHADER, backgroundFragment(effect)],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("No shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? "Shader failed");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("No buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program!, name);
    const timeUniform = uniform("u_time"),
      pointerUniform = uniform("u_pointer"),
      resolutionUniform = uniform("u_resolution");
    gl.uniform1f(uniform("u_intensity"), intensity);
    gl.uniform1f(
      uniform("u_seed"),
      (Number.isFinite(seed) ? seed % 1000 : 1) * 0.137,
    );
    const limits = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;
    const limit = Math.min(limits[0]!, limits[1]!, 4096);
    const resize = () => {
      const size = bufferSize(
        root.clientWidth,
        root.clientHeight,
        window.devicePixelRatio || 1,
        limit,
      );
      if (!size) return false;
      if (canvas.width !== size[0] || canvas.height !== size[1]) {
        canvas.width = size[0];
        canvas.height = size[1];
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      return true;
    };
    const colors = () => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;visibility:hidden;pointer-events:none";
      probe.setAttribute("aria-hidden", "true");
      const swatch = document.createElement("canvas");
      swatch.width = swatch.height = 1;
      const ctx = swatch.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Color conversion unavailable");
      root.append(probe);
      try {
        for (const name of ["base", "accent", "secondary"]) {
          probe.style.color = `var(--shader-background-${name})`;
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = getComputedStyle(probe).color;
          ctx.fillRect(0, 0, 1, 1);
          const pixel = ctx.getImageData(0, 0, 1, 1).data;
          gl.uniform3f(
            uniform(`u_${name}`),
            pixel[0]! / 255,
            pixel[1]! / 255,
            pixel[2]! / 255,
          );
        }
      } finally {
        probe.remove();
      }
    };
    const draw = (time: number, pointer: readonly [number, number]) => {
      gl.uniform1f(timeUniform, time);
      gl.uniform2f(pointerUniform, pointer[0], pointer[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    if (!resize()) throw new Error("Empty background");
    colors();
    draw(0, [0, 0]);
    if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR)
      throw new Error("GPU initialization failed");
    return { resize, colors, draw, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
