import { cn } from "../../../../packages/components/src/utils/cn";

/**
 * Approved folded d/t mark with an angled notch in the upright stem.
 * Geometry matches docs/brand/logo/dethink-mark-currentcolor.svg; the tight
 * viewBox keeps the mark legible at header and footer sizes.
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="34 0 242 350"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M 46 201 L 46 161 Q 46 152 54 147 L 133 100 Q 141 95 149 100 L 182 119 Z" />
      <path
        transform="translate(0 18)"
        d="M 46 216 L 46 253 Q 46 263 55 269 L 133 315 Q 141 320 149 315 L 224 271 L 80 186 Z"
      />
      <path d="M 198 60 Q 198 51 206 46 L 264 12 L 264 269 Q 264 279 255 284 L 246 289 L 198 261 L 198 107 L 246 131 L 246 109 L 198 85 Z" />
    </svg>
  );
}

/**
 * Brand mark: the bare glyph in the active brand's primary color, following
 * the theme picker through `text-primary`.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      data-brand-logo="angled-notch"
      aria-hidden="true"
      className={cn(
        "text-primary grid size-7 shrink-0 place-items-center",
        className,
      )}
    >
      <BrandGlyph className="size-full" />
    </span>
  );
}

/** Parent brand wordmark with a quiet, inline product label. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap",
        className,
      )}
    >
      <span className="sr-only">Dethink Components</span>
      <BrandGlyph className="h-9 w-7 shrink-0" />
      <span aria-hidden="true" className="flex items-center gap-3">
        <span className="text-[22px] leading-none font-semibold tracking-[-0.06em]">
          dethink
        </span>
        <span className="border-border text-muted-foreground border-l pl-3 text-[11px] leading-5 font-medium">
          Components
        </span>
      </span>
    </span>
  );
}
