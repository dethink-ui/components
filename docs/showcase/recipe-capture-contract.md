# Recipe Thumbnail Capture Contract

## Purpose

Recipe thumbnails must show the real runnable recipe surface rather than a generic category approximation. This contract keeps those captures comparable, reproducible, and easy to refresh when a recipe changes.

## Capture Settings

- Route: `/recipes/<slug>` from a successful production build.
- Selector: `[data-recipe-preview="<slug>"]`.
- Browser: repository Playwright Chromium.
- Browser viewport: 1440×1200 CSS pixels.
- Output crop: 1200×675 CSS pixels (16:9), horizontally centred on the preview and aligned to its top edge.
- Pixel density: 1× (`deviceScaleFactor: 1`, screenshot `scale: "css"`).
- Brand: Teal.
- Colour mode: Light.
- Density: Default.
- Locale: `en-GB`.
- Motion: `prefers-reduced-motion: reduce` plus Playwright `animations: "disabled"`.
- Caret: hidden.
- Background: opaque; do not omit the page background.
- File name: `<slug>--teal-light-default@1x.png`.
- Output folder: `apps/showcase/public/recipe-captures/`.

The crop intentionally prioritises the first task-defining portion of the real surface. It must not be recomposed, retouched, or replaced with a mockup.

## Representative Approval Set

Before applying the capture treatment across the catalog, review these three surfaces:

1. `command-center-dashboard` — dashboard-like density and navigation.
2. `saas-landing-page` — marketing hierarchy and visual rhythm.
3. `login-and-onboarding` — form structure and validation affordances.

The full ten-recipe set must not be finalized until this representative treatment is approved.

## Refresh Workflow

1. Build and start the showcase at `http://127.0.0.1:3015`.
2. Run `pnpm capture:recipes` for the representative approval set.
3. Run `pnpm capture:recipes -- --all` after the representative treatment is approved.
4. Confirm every output is exactly 1200×675 and has no loading, focus, caret, animation, or error-overlay artefacts.
5. Review at both the desktop three-column card size and the mobile single-column card size.
6. Run the recipe-gallery Playwright coverage and the production build before committing refreshed captures.

Set `SHOWCASE_BASE_URL` when the production server uses another origin.

## Product Integration Rules

- Render captures with an explicit 16:9 aspect ratio so card layout space is reserved before image load.
- Use the framework image component and responsive `sizes`; gallery thumbnails are not above-the-fold LCP candidates and should remain lazy by default.
- Treat the image as decorative when the adjacent title and summary already identify the recipe; use empty alternative text in that composition.
- Keep the recipe title as the card’s navigation link. The image must not create a second competing link.
- Any hover treatment is limited to transform and opacity, and is removed under reduced motion.
- A capture refresh must never redesign or alter the underlying recipe solely to improve its thumbnail.
