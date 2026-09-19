import {
  particleFragment,
  particleVertex,
  planeVertex,
  textFragment,
} from "./shaders";
import { createTextMask, readShaderColors, type TextMask } from "./text-mask";
import { sampleParticles, type ParticleField } from "./particles";
import {
  shaderHeroTextAnimations,
  type ShaderHeroTextAnimation,
} from "./types";

export interface TextRenderer {
  mask: TextMask;
  particles: ParticleField | null;
  draw: (progress?: number) => void;
  dispose: () => void;
}

export function createTextRenderer(
  canvas: HTMLCanvasElement,
  text: HTMLElement,
  root: HTMLElement,
  animation: ShaderHeroTextAnimation,
  intensity: number,
  seed: number,
): TextRenderer {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const dispose = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (texture) gl.deleteTexture(texture);
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
    buffer = texture = program = null;
  };
  try {
    const mask = createTextMask(
      text,
      gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    );
    if (!mask) throw new Error("Unsupported text layout");
    canvas.width = mask.canvas.width;
    canvas.height = mask.canvas.height;
    canvas.style.width = `${mask.width}px`;
    canvas.style.height = `${mask.height}px`;
    canvas.style.left = canvas.style.top = `${-mask.padding}px`;
    const particles =
      animation === "particle-follow" ? sampleParticles(mask, seed) : null;
    if (animation === "particle-follow" && !particles)
      throw new Error("Insufficient glyph coverage");
    program = gl.createProgram();
    if (!program) throw new Error("No shader program");
    for (const [type, source] of [
      [gl.VERTEX_SHADER, particles ? particleVertex : planeVertex],
      [gl.FRAGMENT_SHADER, particles ? particleFragment : textFragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("No shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        gl.getProgramInfoLog(program) ?? "Shader compilation failed",
      );
    }
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("No vertex buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      particles?.positions ??
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      particles ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program!, name);
    const colors = readShaderColors(root);
    ["base", "accent", "sheen"].forEach((name, index) =>
      gl.uniform3fv(uniform(`u_${name}`), colors[index]!),
    );
    gl.uniform2f(
      uniform("u_resolution"),
      particles ? mask.width : canvas.width,
      particles ? mask.height : canvas.height,
    );
    gl.uniform1f(uniform("u_intensity"), intensity);
    gl.uniform1f(uniform("u_seed"), seed % 1000);
    gl.uniform1i(
      uniform("u_effect"),
      shaderHeroTextAnimations.indexOf(animation),
    );
    if (particles) {
      const limits = gl.getParameter(
        gl.ALIASED_POINT_SIZE_RANGE,
      ) as Float32Array;
      gl.uniform1f(
        uniform("u_size"),
        Math.min(limits[1]!, Math.max(limits[0]!, particles.size * mask.scale)),
      );
    } else {
      texture = gl.createTexture();
      if (!texture) throw new Error("No mask texture");
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        mask.canvas,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(uniform("u_mask"), 0);
    }
    const progressUniform = uniform("u_progress");
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    const draw = (progress = 1) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(progressUniform, progress);
      if (particles) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, particles.positions);
      }
      gl.drawArrays(
        particles ? gl.POINTS : gl.TRIANGLES,
        0,
        particles ? particles.positions.length / 2 : 6,
      );
    };
    draw();
    if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR)
      throw new Error("GPU initialization failed");
    return { mask, particles, draw, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
