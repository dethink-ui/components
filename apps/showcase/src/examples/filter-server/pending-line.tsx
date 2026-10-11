/**
 * A thin line along the top edge while results load. It never changes the
 * layout and leaves text at full contrast; with reduced motion it is static.
 */
export function PendingLine({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      data-slot="pending-line"
      data-active={active ? "" : undefined}
      className="bg-primary pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 rounded-full opacity-0 data-[active]:scale-x-100 data-[active]:opacity-100 motion-safe:transition-[transform,opacity] motion-safe:duration-500"
    />
  );
}
