import type { Layout } from "react-resizable-panels";

/** Storage is optional; applications can supply localStorage, sessionStorage or memory. */
export type ResizableLayoutStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export function parseResizableLayout(
  serialized: string | null,
  panelIds: readonly string[],
): Layout | undefined {
  if (!serialized || !panelIds.length) return;
  try {
    const value: unknown = JSON.parse(serialized);
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1 ||
      !("layout" in value)
    )
      return;
    const layout = value.layout;
    if (!layout || typeof layout !== "object" || Array.isArray(layout)) return;
    const entries = Object.entries(layout);
    if (
      entries.length !== panelIds.length ||
      new Set(panelIds).size !== panelIds.length
    )
      return;
    if (
      !entries.every(
        ([id, size]) =>
          panelIds.includes(id) &&
          typeof size === "number" &&
          Number.isFinite(size) &&
          size >= 0 &&
          size <= 100,
      )
    )
      return;
    if (
      Math.abs(
        entries.reduce((sum, [, size]) => sum + (size as number), 0) - 100,
      ) > 0.1
    )
      return;
    return Object.fromEntries(entries) as Layout;
  } catch {
    return;
  }
}

export function serializeResizableLayout(layout: Layout): string {
  return JSON.stringify({ version: 1, layout });
}
