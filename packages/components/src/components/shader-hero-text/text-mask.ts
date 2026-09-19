export interface TextMask {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  padding: number;
  scale: number;
  fontSize: number;
}

/** Rasterize measured, shaped line runs. Unsupported typography keeps HTML. */
export function createTextMask(
  element: HTMLElement,
  maxTextureSize: number,
): TextMask | null {
  const text = element.textContent ?? "";
  const node = element.firstChild;
  const box = element.getBoundingClientRect();
  const css = getComputedStyle(element);
  if (
    !node ||
    node.nodeType !== Node.TEXT_NODE ||
    !text.trim() ||
    text.length > 2000 ||
    box.width < 1 ||
    box.height < 1 ||
    css.writingMode !== "horizontal-tb" ||
    css.textTransform !== "none" ||
    css.fontVariantCaps !== "normal"
  )
    return null;

  const fontSize = parseFloat(css.fontSize);
  const padding = Math.ceil(fontSize * 0.25);
  const width = box.width + padding * 2;
  const height = box.height + padding * 2;
  const scale = Math.min(
    window.devicePixelRatio || 1,
    2,
    Math.sqrt(2_000_000 / (width * height)),
    maxTextureSize / width,
    maxTextureSize / height,
  );
  if (scale < 0.5) return null;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width * scale));
  canvas.height = Math.max(1, Math.floor(height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
  ctx.fontKerning = "normal";
  if (css.letterSpacing !== "normal" && parseFloat(css.letterSpacing) !== 0) {
    if (!("letterSpacing" in ctx)) return null;
    ctx.letterSpacing = css.letterSpacing;
  }
  if (css.wordSpacing !== "normal" && parseFloat(css.wordSpacing) !== 0) {
    if (!("wordSpacing" in ctx)) return null;
    ctx.wordSpacing = css.wordSpacing;
  }
  ctx.fillStyle = "white";
  ctx.textBaseline = "alphabetic";
  ctx.direction = css.direction === "rtl" ? "rtl" : "ltr";
  ctx.textAlign = ctx.direction === "rtl" ? "right" : "left";
  const lines: {
    start: number;
    end: number;
    top: number;
    left: number;
    right: number;
    height: number;
  }[] = [];
  const range = document.createRange();
  // DOM ranges preserve browser wrapping without splitting the canvas draw into glyphs.
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") continue;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const rect = range.getBoundingClientRect();
    if (!rect.height) continue;
    const last = lines.at(-1);
    if (
      last &&
      Math.abs(last.top - rect.top) < 1 &&
      !text.slice(last.end, i).includes("\n")
    ) {
      last.end = i + 1;
      last.left = Math.min(last.left, rect.left);
      last.right = Math.max(last.right, rect.right);
    } else {
      lines.push({
        start: i,
        end: i + 1,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        height: rect.height,
      });
    }
  }
  for (const line of lines) {
    const run = text.slice(line.start, line.end);
    const metrics = ctx.measureText(run);
    // Avoid substituting a mismatched font/shaping engine for the real heading.
    if (
      Math.abs(metrics.width - (line.right - line.left)) >
      Math.max(4, metrics.width * 0.04)
    )
      return null;
    const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2;
    const baseline =
      line.top - box.top + (line.height - ascent - descent) / 2 + ascent;
    const x = (ctx.direction === "rtl" ? line.right : line.left) - box.left;
    ctx.fillText(run, x + padding, baseline + padding);
  }
  return { canvas, width, height, padding, scale, fontSize };
}

/** Canvas converts computed CSS colors (including oklch) to sRGB uniforms. */
export function readShaderColors(root: HTMLElement): number[][] {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none";
  probe.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  root.append(probe);
  try {
    return ["base", "accent", "sheen"].map((token) => {
      probe.style.color = `var(--shader-hero-text-${token})`;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = getComputedStyle(probe).color;
      ctx.fillRect(0, 0, 1, 1);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data)
        .slice(0, 3)
        .map((v) => v / 255);
    });
  } finally {
    probe.remove();
  }
}
