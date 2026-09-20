# Automation landing and social login recipes

Status: implemented and verified on 2026-09-20. Live preview: http://localhost:3098/recipes/automation-landing and http://localhost:3098/recipes/automation-login.

GitHub planning: [PRD #475](https://github.com/parveshh/dethink-components/issues/475), [landing #476](https://github.com/parveshh/dethink-components/issues/476), [login #477](https://github.com/parveshh/dethink-components/issues/477). The user approved the concept, two slices, and testing seams on 2026-09-20. See [reuse and interaction documentation](README.md).

Concept: [Desktop and mobile direction](mockups/automation-concept-v1.png), generated with the built-in image generation tool. The exact prompt is saved in [prompt.txt](mockups/prompt.txt). The generated board mistakenly uses component-library marketing in some supporting copy and pricing. Implementation must replace that with automation-company copy: workflow runs, integrations, approvals, audit history, and operational benefits. Dethink attribution belongs in recipe documentation rather than the fictional company's core pitch.

## Proposed experience

Two coordinated full-page showcase recipes for a fictional software automation company, using the working brand “Automation”. The marketing page links to the matching sign-in recipe. Existing recipes remain available.

The landing page combines a shader-backed hero, product navigation, a selectable workflow demonstration, readable execution history, benefits, pricing, FAQ, and a conversion action. Lead routing, invoice approvals, and incident response provide realistic sample workflows. A local run interaction demonstrates progress and a terminal result without contacting external services.

The login page uses a quieter split composition with a related shader panel, Google and GitHub provider buttons, and labelled email/password controls. These are explicitly demo authentication interactions with loading, error, retry, and success feedback; production OAuth, credentials storage, and backend authentication are outside this recipe scope. Do not persist entered passwords or send them anywhere.

## Component composition

- LiquidMeshBackground or SilkFlowBackground provides decorative atmosphere, with readable static fallback and reduced-motion behavior.
- Existing Button / RevealButton, Tabs, Card, Badge, Table, AvatarGroup, Progress, Accordion, and Dialog compose the marketing experience.
- Existing FormField, Input, Button, Separator, and feedback primitives compose the login experience.
- Existing showcase metadata, source display, full-page presentation, and recipe gallery provide distribution and discovery.

Generated visuals are design references, not raster UI assets. Implementation uses existing component APIs and semantic tokens, with responsive, light/dark, forced-color, and keyboard behavior.

## Proposed vertical slices for approval

1. **Automation landing recipe** — AFK after concept approval; no issue dependencies. Deliver the complete landing route, gallery entry, source, workflow interactions, conversion link, documentation, and route-level verification.
2. **Matching social login recipe** — AFK after concept approval; depends on slice 1 for the shared visual direction and landing-to-login journey. Deliver its route, gallery/source integration, provider demos, email validation, recovery feedback, and verification.

## Proposed testing seams

Use existing Playwright showcase journeys as the primary seam: gallery → landing → workflow selection/run → login → provider or email demo → explicit result. Exercise keyboard focus and validation, repeat/retry behavior, accessible names and status announcements, desktop/mobile layouts, both themes, reduced motion, forced colors, and absence of document overflow. Run relevant existing gallery/full-page checks, accessibility scans, typecheck, lint, and showcase build. Verify shader fallback remains readable. No real provider redirects or authentication claims.

## Planning history

Repository AGENTS.md requires a published GitHub PRD and approved implementation issues before building new features. Both skills' review gates were satisfied by the user's approval. All three issues were published with ready-for-agent before implementation. Local PRD and sequential issue branches were created from the current integration checkout. Changes remain uncommitted, as required by the repository; no release/integration PR has been opened.

## Final implementation and verification

- User follow-up requested visibly animated backgrounds and particle text. Both pages now use SilkFlowBackground at fast speed, with lighter overlays. Landing headlines and the desktop login illustration use ShaderHeroText's particle-follow mode. Pointer movement disperses nearby particles; leaving the text reforms the glyphs.
- The recipe scopes `font-size-adjust: none` to shader headings so the inherited showcase font adjustment does not invalidate canvas glyph masks. A small SSR-safe external-store hook reacts to reduced-motion preference changes and disables both shader enhancements.
- Fixed recipe-local table keyboard access, dialog portal submit propagation, and invalid paragraph/dialog nesting caught by real browser checks.
- Showcase production build and TypeScript passed. Focused ESLint and whitespace checks passed.
- All 12 new Playwright checks passed against the final production build: gallery/source/thumbnails, workflow switching/run/retry, pricing and FAQ, both providers, validation/recovery, no credential submission, responsive/axe/theme/forced-color checks, unavailable WebGL, actual background pixel changes, particle pointer response, reduced-motion canvas release, and no hydration exceptions.
- Existing gallery/full-page regression suite: 18 passed, 3 failed on pre-existing fixed 120px preview-offset expectations. HEAD already defines the header as 88px desktop / 74px mobile; with the 56px recipe bar, the actual offsets are 144px / 130px. The unchanged command-center recipe reproduces these failures. No global header or baseline test assertions were changed.
- Real 1200 × 675 gallery thumbnails regenerated. Desktop dark and mobile light captures were visually reviewed; the external sticky showcase bars are hidden only in isolated product captures so they do not cover the product during screenshot scrolling.
- No new package dependency, component export, registry block or Changeset was necessary for these showcase-only compositions. No commits made.
