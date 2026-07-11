# Showcase Theme Contrast Audit

Measured on 11 July 2026 against the rendered CSS tokens in Chromium for teal, violet, rose, amber, ocean, and forest, each in light and dark mode. CSS Color 4 values are rasterized to sRGB before WCAG relative-luminance calculations.

| Semantic pair                                | Target | Lowest before | Lowest after | Limiting theme |
| -------------------------------------------- | -----: | ------------: | -----------: | -------------- |
| Muted foreground / background                |  4.5:1 |        5.83:1 |       6.52:1 | Amber light    |
| Muted foreground / muted surface             |  4.5:1 |        5.42:1 |       5.64:1 | Amber light    |
| Primary / background                         |  4.5:1 |        2.20:1 |       5.25:1 | Amber light    |
| Primary / muted surface                      |  4.5:1 |        2.05:1 |       4.55:1 | Amber light    |
| Primary foreground / primary surface         |  4.5:1 |        4.90:1 |       5.33:1 | Amber light    |
| Border / background                          |    3:1 |        1.19:1 |       3.12:1 | Rose dark      |
| Input / background                           |    3:1 |        1.20:1 |       3.58:1 | Rose dark      |
| Ring / background                            |    3:1 |        2.86:1 |       3.12:1 | Amber light    |
| Destructive foreground / destructive surface |  4.5:1 |        3.13:1 |       4.57:1 | Teal light     |

## Decisions

- Keep secondary-text token structure unchanged because every brand exceeds the 4.5:1 normal-text target.
- Lower the teal, rose, amber, and forest light primary tokens enough for primary-colored labels to remain readable on page and selected surfaces; amber uses a light primary foreground after the surface becomes deeper.
- Strengthen border, input, timeline-border, and timeline-rail values through the existing brand-derived semantic variables.
- Dark destructive surfaces use a dark semantic foreground so their normal-size labels exceed 4.5:1.
- Amber’s light focus-ring token is lowered slightly in lightness so the weakest brand still exceeds 3:1.
- Current-page links gain a font-weight cue in addition to color and surface treatment.
- Forced-colors mode restores a 2px `Highlight` focus outline, outlines current/selected/checked states, and gives disabled controls a dashed boundary.
- Component-catalog cards use a softer 70% rendering of the semantic border because their outline is decorative hierarchy rather than the sole indicator of an interactive control. Their labels, arrows, hover treatment, and 2px focus ring continue to identify and expose the link state.

The automated acceptance seam is `e2e/showcase-theme-resilience.spec.ts`.
