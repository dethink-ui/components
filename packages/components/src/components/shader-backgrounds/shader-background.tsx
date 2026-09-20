"use client";

import { forwardRef, useEffect, useRef, type CSSProperties } from "react";
import { cn } from "../../utils/cn";
import { createBackgroundRenderer, type BackgroundRenderer } from "./renderer";
import {
  backgroundIntensities,
  backgroundSpeeds,
  type ShaderBackgroundEffect,
  type ShaderBackgroundProps,
} from "./types";

const fallback: Record<ShaderBackgroundEffect, string> = {
  "liquid-mesh":
    "radial-gradient(ellipse at 20% 35%,var(--shader-background-accent),transparent 65%),radial-gradient(ellipse at 80% 70%,var(--shader-background-secondary),transparent 65%)",
  "silk-flow":
    "repeating-linear-gradient(155deg,transparent 0%,var(--shader-background-accent) 12%,transparent 21%,var(--shader-background-secondary) 27%,transparent 33%)",
  "caustic-light":
    "repeating-radial-gradient(ellipse at 30% 60%,transparent 0 18px,var(--shader-background-accent) 20px,transparent 24px 55px),radial-gradient(ellipse at 80% 10%,var(--shader-background-secondary),transparent 70%)",
  "contour-field":
    "repeating-radial-gradient(ellipse at 70% 120%,transparent 0 24px,var(--shader-background-accent) 25px,transparent 27px 45px)",
  "orbital-glow":
    "radial-gradient(ellipse at 60% 50%,transparent 29%,var(--shader-background-accent) 30%,transparent 31% 39%,var(--shader-background-secondary) 40%,transparent 42%),radial-gradient(ellipse at 60% 50%,var(--shader-background-secondary),transparent 30%)",
};

/** Internal host shared by the five independently installable public components. */
export const ShaderBackground = forwardRef<
  HTMLDivElement,
  ShaderBackgroundProps & { effect: ShaderBackgroundEffect }
>(function ShaderBackground(
  {
    effect,
    animate = true,
    speed = "normal",
    intensity = "subtle",
    seed = 1,
    interactive = false,
    children,
    className,
    style,
    ...props
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null),
    layerRef = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  useEffect(() => {
    const root = rootRef.current,
      layer = layerRef.current;
    if (!root || !layer) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)"),
      contrast = matchMedia("(forced-colors: active)"),
      colorScheme = matchMedia("(prefers-color-scheme: dark)"),
      mouse = matchMedia("(hover: hover) and (pointer: fine)");
    let disposed = false,
      visible = false,
      skipped = false,
      printing = false,
      failed = false;
    let renderer: BackgroundRenderer | null = null,
      canvas: HTMLCanvasElement | null = null;
    let frame = 0,
      last = 0;
    const target: [number, number] = [0, 0],
      pointer: [number, number] = [0, 0];
    const state = (value: string) => {
      root.dataset.state = value;
    };
    const cancel = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const allowed = () =>
      !disposed &&
      animate &&
      !motion.matches &&
      !contrast.matches &&
      !document.hidden &&
      visible &&
      !skipped &&
      !printing;
    const lost = (event: Event) => {
      event.preventDefault();
      cancel();
      renderer?.dispose();
      renderer = null;
      failed = true;
      state("fallback");
    };
    const restored = () => {
      release();
      failed = false;
      reconcile();
    };
    const release = () => {
      cancel();
      renderer?.dispose();
      renderer = null;
      if (canvas) {
        canvas.removeEventListener("webglcontextlost", lost);
        canvas.removeEventListener("webglcontextrestored", restored);
        const gl = canvas.getContext("webgl");
        if (gl && !gl.isContextLost())
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
        canvas = null;
      }
      target[0] = target[1] = pointer[0] = pointer[1] = 0;
      state("static");
    };
    const tick = (now: number) => {
      frame = 0;
      if (!allowed()) {
        release();
        return;
      }
      if (!renderer) return;
      const dt = last ? (now - last) / 1000 : 1 / 30;
      if (!last || dt >= 1 / 30) {
        last = now;
        elapsed.current += Math.min(dt, 0.1) * backgroundSpeeds[speed];
        const follow = 1 - Math.exp(-Math.min(dt, 0.1) * 6);
        pointer[0] += (target[0] - pointer[0]) * follow;
        pointer[1] += (target[1] - pointer[1]) * follow;
        try {
          renderer.draw(elapsed.current, pointer);
        } catch {
          failed = true;
          release();
          state("fallback");
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const reconcile = () => {
      if (!mouse.matches || !interactive) target[0] = target[1] = 0;
      if (!allowed()) {
        release();
        return;
      }
      if (failed || renderer) return;
      if (root.clientWidth < 1 || root.clientHeight < 1) return;
      canvas = document.createElement("canvas");
      canvas.className = "absolute inset-0 h-full w-full";
      canvas.setAttribute("aria-hidden", "true");
      canvas.addEventListener("webglcontextlost", lost);
      canvas.addEventListener("webglcontextrestored", restored);
      layer.append(canvas);
      try {
        renderer = createBackgroundRenderer(
          canvas,
          root,
          effect,
          backgroundIntensities[intensity],
          seed,
        );
        renderer.draw(elapsed.current, pointer);
        state("running");
        frame = requestAnimationFrame(tick);
      } catch {
        failed = true;
        release();
        state("fallback");
      }
    };
    const resize = () => {
      if (!allowed()) {
        release();
        return;
      }
      if (renderer) {
        if (!renderer.resize()) release();
      } else reconcile();
    };
    const recolor = () => {
      if (renderer) {
        try {
          renderer.colors();
        } catch {
          failed = true;
          release();
          state("fallback");
        }
      } else reconcile();
    };
    const move = (event: PointerEvent) => {
      if (
        !interactive ||
        !mouse.matches ||
        event.pointerType !== "mouse" ||
        event.buttons ||
        !allowed()
      )
        return;
      const box = root.getBoundingClientRect();
      target[0] = Math.max(
        -1,
        Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1),
      );
      target[1] = Math.max(
        -1,
        Math.min(1, 1 - ((event.clientY - box.top) / box.height) * 2),
      );
    };
    const leave = () => {
      target[0] = target[1] = 0;
    };
    const beforePrint = () => {
        printing = true;
        reconcile();
      },
      afterPrint = () => {
        printing = false;
        reconcile();
      };
    const contentVisibility = (event: Event) => {
      skipped = Boolean((event as Event & { skipped: boolean }).skipped);
      reconcile();
    };
    const intersection =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = !!entry?.isIntersecting;
            reconcile();
          })
        : null;
    intersection?.observe(root);
    if (!intersection) visible = true;
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(root);
    const styles = new MutationObserver(recolor);
    for (
      let ancestor: HTMLElement | null = root;
      ancestor;
      ancestor = ancestor.parentElement
    )
      styles.observe(ancestor, {
        attributes: true,
        attributeFilter: [
          "style",
          "class",
          "data-theme",
          "data-brand",
          "data-density",
        ],
      });
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    layer.addEventListener(
      "contentvisibilityautostatechange",
      contentVisibility,
    );
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("resize", resize);
    window.addEventListener("blur", leave);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    [motion, contrast, mouse].forEach((m) =>
      m.addEventListener("change", reconcile),
    );
    colorScheme.addEventListener("change", recolor);
    reconcile();
    return () => {
      disposed = true;
      intersection?.disconnect();
      observer?.disconnect();
      styles.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointercancel", leave);
      layer.removeEventListener(
        "contentvisibilityautostatechange",
        contentVisibility,
      );
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", leave);
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      [motion, contrast, mouse].forEach((m) =>
        m.removeEventListener("change", reconcile),
      );
      colorScheme.removeEventListener("change", recolor);
      release();
    };
  }, [effect, animate, speed, intensity, seed, interactive]);
  return (
    <div
      {...props}
      ref={(node) => {
        rootRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      data-slot={`${effect}-background`}
      data-effect={effect}
      data-state="static"
      data-animate={animate}
      data-speed={speed}
      data-intensity={intensity}
      data-interactive={interactive}
      className={cn(
        "group/shader-bg bg-background text-foreground relative isolate overflow-hidden",
        className,
      )}
      style={
        {
          backgroundColor: "var(--shader-background-base)",
          "--shader-background-base": "var(--dt-color-background)",
          "--shader-background-accent": "var(--dt-color-primary)",
          "--shader-background-secondary": "var(--dt-color-info)",
          ...style,
        } as CSSProperties
      }
    >
      <div
        aria-hidden="true"
        data-slot="shader-background-fallback"
        className="pointer-events-none absolute inset-0 forced-colors:hidden"
        style={{
          backgroundImage: fallback[effect],
          opacity: backgroundIntensities[intensity] * 0.55,
        }}
      />
      <div
        ref={layerRef}
        aria-hidden="true"
        data-slot="shader-background-layer"
        className="pointer-events-none invisible absolute inset-0 group-data-[state=running]/shader-bg:visible motion-reduce:!invisible print:!invisible forced-colors:!invisible"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "auto 500px",
        }}
      />
      <div data-slot="shader-background-content" className="relative z-10">
        {children}
      </div>
    </div>
  );
});
