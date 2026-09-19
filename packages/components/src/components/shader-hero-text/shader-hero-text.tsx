"use client";

import {
  createElement,
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { cn } from "../../utils/cn";
import { createTextRenderer, type TextRenderer } from "./renderer";
import { resetParticles, stepParticles } from "./particles";
import { bounded, type ShaderHeroTextProps } from "./types";

const defaults = {
  "liquid-ripple": 1.4,
  "chromatic-refraction": 1.2,
  "noise-dissolve": 1.6,
  "wave-distortion": 1.4,
  "liquid-metal": 1.8,
  "particle-follow": 1.2,
};

/** Semantic HTML is always present; WebGL is a disposable visual enhancement. */
export const ShaderHeroText = forwardRef<HTMLElement, ShaderHeroTextProps>(
  function ShaderHeroText(
    {
      text,
      as = "h1",
      ariaLabel,
      animation = "liquid-ripple",
      trigger = "in-view",
      active = true,
      delay = 0,
      duration,
      intensity = 0.5,
      seed = 0,
      replayKey,
      reducedMotion = "user",
      onAnimationStart,
      onAnimationComplete,
      className,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const rootRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const visualRef = useRef<HTMLSpanElement>(null);
    const callbacks = useRef({ onAnimationStart, onAnimationComplete });
    useEffect(() => {
      callbacks.current = { onAnimationStart, onAnimationComplete };
    }, [onAnimationStart, onAnimationComplete]);

    useEffect(() => {
      const root = rootRef.current,
        textElement = textRef.current,
        visual = visualRef.current;
      if (!root || !textElement || !visual) return;
      const particleMode = animation === "particle-follow";
      const seconds = bounded(
        duration,
        defaults[animation],
        particleMode ? 2 : 5,
      );
      const wait = bounded(delay, 0, 5);
      const amount = bounded(intensity, 0.5, 1);
      const randomSeed = Number.isFinite(seed) ? seed : 0;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const contrast = window.matchMedia("(forced-colors: active)");
      const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
      let disposed = false,
        visible = trigger !== "in-view",
        fontsReady = false;
      let failed = false,
        completed = false,
        started = false,
        cycle = false,
        selecting = false;
      let renderer: TextRenderer | null = null,
        canvas: HTMLCanvasElement | null = null;
      let frame = 0,
        lastTime = 0,
        elapsed = 0,
        returnElapsed = 0;
      let pointer: [number, number] | null = null;
      let returning = false;

      const setState = (state: string, rendering = false) => {
        root.dataset.state = state;
        root.dataset.rendering = String(rendering && !selecting);
      };
      const cancelFrame = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        root.dataset.animating = "false";
      };
      const allowed = () =>
        !disposed &&
        !document.hidden &&
        visible &&
        fontsReady &&
        active &&
        reducedMotion !== "always" &&
        !motion.matches &&
        !contrast.matches &&
        (!particleMode || mouse.matches);
      const contextLost = (event: Event) => {
        event.preventDefault();
        cancelFrame();
        renderer?.dispose();
        renderer = null;
        failed = true;
        pointer = null;
        cycle = false;
        returning = false;
        setState("fallback");
      };
      const contextRestored = () => {
        release();
        failed = false;
        reconcile();
      };
      const release = () => {
        cancelFrame();
        renderer?.dispose();
        renderer = null;
        if (canvas) {
          canvas.removeEventListener("webglcontextlost", contextLost);
          canvas.removeEventListener("webglcontextrestored", contextRestored);
          // Free the browser context as well as its buffers when a preview leaves view.
          const gl = canvas.getContext("webgl");
          if (gl && !gl.isContextLost())
            gl.getExtension("WEBGL_lose_context")?.loseContext();
          canvas.remove();
          canvas = null;
        }
        pointer = null;
        returning = false;
        cycle = false;
        setState(completed ? "complete" : "static");
      };
      const finishCycle = () => {
        returning = false;
        setState("formed", true);
        if (cycle) {
          cycle = false;
          callbacks.current.onAnimationComplete?.();
        }
      };
      const tick = (time: number) => {
        frame = 0;
        if (!allowed() || !renderer) return;
        // Duration deadlines use elapsed time; the spring integrator separately caps its step.
        const dt = lastTime ? Math.max(0, (time - lastTime) / 1000) : 0;
        lastTime = time;
        try {
          if (renderer.particles) {
            if (returning) returnElapsed += dt;
            let moving = stepParticles(
              renderer.particles,
              pointer,
              dt,
              amount,
              seconds,
            );
            if (returning && (seconds === 0 || returnElapsed >= seconds)) {
              resetParticles(renderer.particles);
              moving = false;
            }
            renderer.draw();
            if (!moving) {
              cancelFrame();
              if (returning) finishCycle();
              return;
            }
          } else {
            elapsed += dt;
            if (elapsed < wait) {
              schedule();
              return;
            }
            if (!started) {
              started = true;
              callbacks.current.onAnimationStart?.();
            }
            const progress =
              seconds === 0 ? 1 : Math.min(1, (elapsed - wait) / seconds);
            renderer.draw(progress);
            setState("running", true);
            if (progress >= 1) {
              completed = true;
              release();
              callbacks.current.onAnimationComplete?.();
              return;
            }
          }
          schedule();
        } catch {
          failed = true;
          release();
          setState("fallback");
        }
      };
      const schedule = () => {
        if (!frame && allowed() && renderer) {
          root.dataset.animating = "true";
          frame = requestAnimationFrame(tick);
        }
      };
      const reconcile = () => {
        if (!allowed()) {
          release();
          return;
        }
        if (failed || completed || renderer) return;
        canvas = document.createElement("canvas");
        canvas.className = "absolute pointer-events-none max-w-none";
        canvas.setAttribute("aria-hidden", "true");
        canvas.addEventListener("webglcontextlost", contextLost);
        canvas.addEventListener("webglcontextrestored", contextRestored);
        visual.append(canvas);
        try {
          renderer = createTextRenderer(
            canvas,
            textElement,
            root,
            animation,
            amount,
            randomSeed,
          );
          if (particleMode) setState("formed", true);
          else schedule();
        } catch {
          failed = true;
          release();
          setState("fallback");
        }
      };
      const rebuild = () => {
        if (disposed) return;
        release();
        failed = false;
        reconcile();
      };
      const follow = (event: PointerEvent) => {
        if (
          event.pointerType !== "mouse" ||
          event.buttons ||
          selecting ||
          !allowed() ||
          !renderer?.particles
        )
          return;
        const bounds = textElement.getBoundingClientRect();
        pointer = [
          event.clientX - bounds.left + renderer.mask.padding,
          event.clientY - bounds.top + renderer.mask.padding,
        ];
        returning = false;
        if (!cycle) {
          cycle = true;
          callbacks.current.onAnimationStart?.();
        }
        setState("following", true);
        schedule();
      };
      const leave = () => {
        if (!renderer?.particles || !cycle) return;
        pointer = null;
        returning = true;
        returnElapsed = 0;
        setState("returning", true);
        if (seconds === 0) {
          resetParticles(renderer.particles);
          renderer.draw();
          cancelFrame();
          finishCycle();
        } else schedule();
      };
      const selectionChanged = () => {
        const selection = window.getSelection();
        selecting =
          !!selection &&
          !selection.isCollapsed &&
          selection.containsNode(textElement, true);
        root.dataset.rendering = String(
          !!renderer && (particleMode || started) && !selecting,
        );
        if (selecting) leave();
      };
      root.addEventListener("pointermove", follow);
      root.addEventListener("pointerleave", leave);
      root.addEventListener("pointercancel", leave);
      window.addEventListener("blur", leave);
      document.addEventListener("selectionchange", selectionChanged);
      document.addEventListener("visibilitychange", reconcile);
      [motion, contrast, mouse].forEach((query) =>
        query.addEventListener("change", reconcile),
      );
      const intersection =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              visible = !!entry?.isIntersecting;
              reconcile();
            });
      intersection?.observe(root);
      if (!intersection) visible = true;
      const resize =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(rebuild);
      resize?.observe(textElement);
      // Observe only author-controlled styling; our data-state writes never retrigger it.
      const styles = new MutationObserver(rebuild);
      for (
        let ancestor: HTMLElement | null = root;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        styles.observe(ancestor, {
          attributes: true,
          attributeFilter: [
            "class",
            "style",
            "dir",
            "data-theme",
            "data-density",
          ],
        });
      }
      const fontsChanged = () => {
        fontsReady = true;
        rebuild();
      };
      document.fonts?.addEventListener("loadingdone", fontsChanged);
      if (document.fonts)
        void document.fonts.ready.then(() => {
          if (!disposed) fontsChanged();
        });
      else fontsReady = true;
      reconcile();
      return () => {
        disposed = true;
        intersection?.disconnect();
        resize?.disconnect();
        styles.disconnect();
        root.removeEventListener("pointermove", follow);
        root.removeEventListener("pointerleave", leave);
        root.removeEventListener("pointercancel", leave);
        window.removeEventListener("blur", leave);
        document.removeEventListener("selectionchange", selectionChanged);
        document.removeEventListener("visibilitychange", reconcile);
        document.fonts?.removeEventListener("loadingdone", fontsChanged);
        [motion, contrast, mouse].forEach((query) =>
          query.removeEventListener("change", reconcile),
        );
        release();
      };
    }, [
      as,
      text,
      animation,
      trigger,
      active,
      delay,
      duration,
      intensity,
      seed,
      replayKey,
      reducedMotion,
    ]);

    return createElement(
      as,
      {
        ...props,
        ref: (node: HTMLElement | null) => {
          rootRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        },
        "aria-label": ariaLabel,
        "data-slot": "shader-hero-text",
        "data-animation": animation,
        "data-state": "static",
        "data-rendering": "false",
        "data-animating": "false",
        className: cn(
          "group/shader relative block min-w-0 max-w-full text-foreground",
          className,
        ),
        style: {
          "--shader-hero-text-base": "var(--dt-color-foreground)",
          "--shader-hero-text-accent": "var(--dt-color-primary)",
          "--shader-hero-text-sheen": "var(--dt-color-muted-foreground)",
          ...style,
        } as CSSProperties,
      },
      <span
        ref={textRef}
        data-slot="shader-hero-text-content"
        className="motion-reduce:!text-foreground print:!text-foreground selection:bg-primary selection:text-primary-foreground block break-words whitespace-pre-wrap group-data-[rendering=true]/shader:text-transparent forced-colors:!text-[CanvasText]"
      >
        {text}
      </span>,
      <span
        ref={visualRef}
        aria-hidden="true"
        data-slot="shader-hero-text-visual"
        className="pointer-events-none invisible absolute inset-0 group-data-[rendering=true]/shader:visible motion-reduce:!invisible print:!invisible forced-colors:!invisible"
      />,
    );
  },
);
