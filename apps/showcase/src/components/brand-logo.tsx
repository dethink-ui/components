import { cn } from "../../../../packages/components/src/utils/cn";

/**
 * Dethink mark: a block snapping into place. Three blocks are already merged
 * into an L-piece with an open slot; the fourth hovers diagonally offset,
 * mid-snap — the moment a registry component drops into your app. The
 * incoming block is full-strength; the assembled piece sits slightly muted.
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.5 6H10.5Q12.5 6 12.5 8V13Q12.5 15 14.5 15H19.5Q21.5 15 21.5 17V21Q21.5 23 19.5 23H6.5Q4.5 23 4.5 21V8Q4.5 6 6.5 6Z"
        fill="currentColor"
        fillOpacity="0.72"
      />
      <rect x="16" y="3.5" width="8" height="8" rx="2" fill="currentColor" />
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
      data-brand-logo="block-snap"
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

/** Full lockup: brand tile plus the Dethink/Components wordmark. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <span className="font-heading text-[15px] font-semibold tracking-tight">
        Dethink<span className="text-primary">/</span>Components
      </span>
    </span>
  );
}
