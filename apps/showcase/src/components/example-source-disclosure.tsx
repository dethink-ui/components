"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Code2 } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";

const motionEase = [0.2, 0, 0, 1] as const;

interface ExampleSourceDisclosureProps {
  children: ReactNode;
  defaultOpen?: boolean;
  filename: string;
  id: string;
  title: string;
}

export function ExampleSourceDisclosure({
  children,
  defaultOpen = false,
  filename,
  id,
  title,
}: ExampleSourceDisclosureProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const shouldReduceMotion = useReducedMotion();
  const contentId = `${id}-content`;

  useEffect(() => {
    const openFromFragment = () => {
      if (window.location.hash === `#${id}`) {
        setOpen(true);
      }
    };

    openFromFragment();
    window.addEventListener("hashchange", openFromFragment);

    return () => window.removeEventListener("hashchange", openFromFragment);
  }, [id]);

  return (
    <MotionConfig reducedMotion="user">
      <details
        ref={detailsRef}
        id={id}
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="group border-border bg-background border-t"
      >
        <summary
          aria-controls={contentId}
          aria-label={`${open ? "Hide" : "Show"} source for ${title}`}
          className="focus-visible:ring-ring focus-visible:ring-offset-background hover:bg-muted/60 flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
        >
          <Code2
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="block">{open ? "Hide" : "Show"} source</span>
            <span className="text-muted-foreground block truncate font-mono text-xs font-normal">
              {filename}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <motion.div
          key={open ? "expanded" : "collapsed"}
          id={contentId}
          data-slot="example-source-content"
          initial={open && !shouldReduceMotion ? { opacity: 0, y: -6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.24,
            ease: motionEase,
          }}
          className="border-border bg-muted/20 border-t p-3"
        >
          {children}
        </motion.div>
      </details>
    </MotionConfig>
  );
}
