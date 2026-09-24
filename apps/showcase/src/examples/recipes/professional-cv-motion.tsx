"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

export function CvReveal({
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
        enabled ? { opacity: [0.4, 1], y: [18, 0] } : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: enabled ? 0.55 : 0, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
