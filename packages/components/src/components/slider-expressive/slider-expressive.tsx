import {
  forwardRef,
  useSyncExternalStore,
  type ReactElement,
  type RefAttributes,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Slider, type SliderProps, type SliderValue } from "../slider";
import {
  SliderDecorationContext,
  type SliderDecorationProps,
} from "../slider/slider-visuals";

const subscribe = () => () => {};
const client = () => true;
const server = () => false;

function ExpressiveThumb({
  dragging,
  active,
  milestone,
  className,
}: SliderDecorationProps) {
  const hydrated = useSyncExternalStore(subscribe, client, server);
  const reduced = useReducedMotion();
  const animate = hydrated && reduced === false;
  return (
    <>
      {animate && active && milestone !== undefined && (
        <motion.span
          key={milestone}
          aria-hidden="true"
          data-slot="slider-pulse"
          className="bg-primary/20 pointer-events-none absolute size-[var(--dt-slider-thumb-size)] rounded-full"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.32 }}
        />
      )}
      <motion.span
        aria-hidden="true"
        data-slot="slider-thumb-visual"
        className={
          className +
          " shadow-[0_0_0_5px_color-mix(in_srgb,var(--dt-color-primary)_10%,transparent)]"
        }
        initial={false}
        animate={{ scale: animate && dragging ? 0.88 : 1 }}
        transition={
          animate
            ? { type: "spring", stiffness: 550, damping: 28 }
            : { duration: 0 }
        }
      />
    </>
  );
}
export type ExpressiveSliderProps<T extends SliderValue = number> =
  SliderProps<T>;

/** Optional Motion companion. Pointer position is always controlled directly by React Aria. */
export const ExpressiveSlider = forwardRef<
  HTMLDivElement,
  SliderProps<SliderValue>
>(function ExpressiveSlider(props, ref) {
  return (
    <SliderDecorationContext.Provider value={ExpressiveThumb}>
      <Slider
        variant="expressive"
        valueDisplay="floating"
        {...props}
        ref={ref}
      />
    </SliderDecorationContext.Provider>
  );
}) as <T extends SliderValue = number>(
  props: ExpressiveSliderProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement;
