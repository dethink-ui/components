"use client";
import type { ReactNode } from "react";
import { motion } from "motion/react";

export function SillageReveal({
  children,
  enabled,
  className,
}: {
  children: ReactNode;
  enabled: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={false}
      whileInView={
        enabled ? { opacity: [0.5, 1], y: [16, 0] } : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: enabled ? 0.65 : 0, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
