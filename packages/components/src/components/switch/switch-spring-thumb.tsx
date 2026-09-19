import { motion, useReducedMotion } from "motion/react";

interface SpringThumbProps {
  checked: boolean;
  className: string;
  [attribute: `data-${string}`]: string | undefined;
}

/** Loaded only by switches that opt in to spring animation. */
export default function SwitchSpringThumb({
  checked,
  ...props
}: SpringThumbProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      {...props}
      data-animation="spring"
      initial={false}
      layout={reducedMotion ? false : "position"}
      layoutDependency={checked}
      transition={{ type: "spring", stiffness: 500, damping: 24, mass: 0.8 }}
    />
  );
}
