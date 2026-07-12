export type BrandThemeId =
  "teal" | "violet" | "rose" | "amber" | "ocean" | "forest";

export interface BrandTheme {
  id: BrandThemeId;
  label: string;
  /** Swatch color shown in the picker (the theme's light-scheme primary). */
  swatch: string;
}

export const BRAND_STORAGE_KEY = "dethink-brand";
export const DEFAULT_BRAND: BrandThemeId = "teal";

/**
 * Each entry pairs with one CSS block in `app/globals.css`. Adding a theme is
 * one entry here plus one `[data-brand="..."]` block there.
 */
export const brandThemes: BrandTheme[] = [
  { id: "teal", label: "Teal", swatch: "oklch(0.5 0.1 185)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.5 0.19 295)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.54 0.19 15)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.52 0.15 78)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.51 0.15 245)" },
  { id: "forest", label: "Forest", swatch: "oklch(0.5 0.12 150)" },
];

export function isBrandThemeId(value: unknown): value is BrandThemeId {
  return brandThemes.some((theme) => theme.id === value);
}
