# Showcase Design Improvements — Implementation Notes

## Status

- Source: UX and design audit of the running Next.js showcase on 10 July 2026.
- Current phase: first approved implementation slice complete.
- GitHub PRD: [#383 — Showcase discovery, documentation, and motion polish](https://github.com/parveshh/dethink-components/issues/383).
- Implementation gate: complete; the PRD and nine approved tracer-bullet issues are published.
- Completed slice: [#384 — Showcase component catalog search and animated filtering](https://github.com/parveshh/dethink-components/issues/384).
- Next queued slice: [#385 — Add component detail quick switching](https://github.com/parveshh/dethink-components/issues/385).

## Outcome

Make the showcase faster to use as a developer tool without losing its distinctive token-workbench identity. The primary journey is:

1. find the relevant component or product recipe;
2. understand its states and intended use;
3. copy installation or source with minimal scrolling;
4. move naturally to a related component or recipe.

The showcase should continue to demonstrate real `@dethink/components` behavior, semantic HTML, the `--dt-*` token contract, responsive layouts, light and dark themes, and reduced-motion-safe interaction.

## Working Principles

- Preserve the workbench visual direction; improve task speed and clarity rather than redesigning the brand.
- Prefer thin, complete improvements that can be tested and reviewed independently.
- Reuse `componentCatalog`, `componentGroups`, `recipesCatalog`, and existing Dethink primitives instead of introducing parallel metadata or a new UI dependency.
- Keep App Router pages server-rendered where possible. Isolate query state and event handling in small Client Components so metadata and static content remain server-owned.
- Prefer native semantics. Search surfaces should use a labelled `type="search"` control inside a `<search>` landmark, links should remain links, and dynamic result status should be concise and non-disruptive.
- Preserve natural keyboard order, visible focus, current-page semantics, touch usability, 200% zoom resilience, and both light and dark schemes.
- Avoid animation as a requirement for discovery or state communication.
- Use Motion for stateful, sequenced, layout-aware, and navigation-handoff animation. Keep static hover/focus states tokenized in CSS.
- Give the showcase a consistent corporate-premium motion identity: decisive rather than bouncy, with a 120ms quick response, 240ms standard transition, 420ms emphasis transition, and a Material-style `(0.2, 0, 0, 1)` signature easing for most on-screen movement.
- Prefer transform and opacity, keep list stagger under 200ms, use stable keys with `AnimatePresence`, and avoid layout animation across the full 57-item catalog when a smaller group-level transition communicates the change.
- Every non-essential animation must use `useReducedMotion`, `MotionConfig`, `motion-safe`/`motion-reduce`, or an equivalent case-specific fallback. Reduced motion must preserve all content, state, focus, and navigation behavior.
- Treat captured recipe imagery as documentation evidence, not decorative approximation.

## Point-by-Point Roadmap

### 1. Component discovery and quick switching

Problem: the 57-component catalog and long desktop navigation have no search, while component navigation disappears on smaller screens.

Implementation direction:

- Add a searchable catalog surface that filters by component name, human-readable display name, description, and group.
- Preserve group context in filtered results and provide a useful no-results state with a clear reset action.
- Show an accurate visible result count without making screen-reader announcements noisy while the user types.
- Add a compact component switcher and previous/next navigation to component detail pages, including mobile layouts.
- Consider a header-level command launcher only after the core catalog search is proven; it should reuse the same metadata and matching logic.
- Render human-readable labels such as “Icon Button” while retaining API names such as `IconButton` where code identity matters.
- Choreograph search results as a restrained transition: the result status updates immediately, outgoing groups leave quickly, incoming groups settle with a short opacity/vertical transform, and reduced-motion users receive the final state without spatial movement.

Why first: this removes the largest recurring friction and creates reusable search/navigation seams for later improvements.

### 2. Progressive disclosure for example source

Problem: expanded source code dominates component pages, especially on mobile, and pushes installation and props far down the page.

Implementation direction:

- Keep live previews visible by default.
- Collapse source by default or provide an explicit Preview/Code switch that remains keyboard-operable.
- Preserve source in the document so copying, deep links, and browser find remain reliable.
- Add a concise page outline for major documentation sections when it materially improves long-page navigation.
- Evaluate moving the first install command closer to the component introduction without duplicating competing calls to action.

### 3. Recipe imagery and differentiation

Problem: generic skeleton thumbnails make materially different recipes look similar.

Implementation direction:

- Replace generic category skeletons with deterministic captures of the actual recipe surfaces.
- Use consistent viewport, crop, aspect ratio, theme, and density rules.
- Give every informative image concise alternative text; use empty alternative text only when adjacent text already provides the same information.
- Define a repeatable capture/update process so imagery does not drift from the runnable recipe.

### 4. Recipe counts and browse-first hierarchy

Problem: the homepage describes six recipes while the catalog contains ten; six is the featured count. The recipe hero also delays search and filtering.

Implementation direction:

- Distinguish total and featured counts wherever they appear.
- Remove or replace the low-value “Registry mode: Showcase” statistic.
- Reduce the recipe hero footprint and bring search/category controls into the first desktop viewport.
- Preserve the existing category and text filtering behavior and empty state.

### 5. Component matrix promise

Problem: “Hover = live preview” conflicts with teasers that are deliberately inert, pointer-disabled, and unavailable as a hover interaction on touch devices.

Implementation direction:

- Immediately correct the label to describe the current state-preview behavior.
- Improve teaser legibility at card size.
- If a larger interactive preview is added later, make selection explicit, keyboard/touch accessible, and separate from the card’s navigation link.

### 6. Mobile homepage density

Problem: the hero consumes most of the first mobile viewport and the primary/secondary actions have inconsistent widths.

Implementation direction:

- Make the CTA pair visually intentional and easy to target.
- Reduce non-essential vertical space and consider a compact install row rather than the full terminal card at narrow widths.
- Keep the positioning statement and a concrete product proof visible without crowding the viewport.

### 7. Dark-theme legibility

Problem: muted copy, navigation labels, borders, and code-adjacent UI appear weaker in dark mode than in light mode.

Implementation direction:

- Measure text and non-text contrast rather than tuning by eye alone.
- Strengthen muted text and essential component boundaries through existing semantic tokens.
- Check focus indicators, current states, destructive states, and disabled states in every brand theme.
- Use `prefers-contrast` only if the baseline token set cannot satisfy the desired hierarchy cleanly.

### 8. Final journey verification

Problem: improvements can easily optimize individual screens while leaving the overall find → assess → copy → continue journey fragmented.

Implementation direction:

- Verify the complete journey at desktop and mobile widths in light and dark themes.
- Confirm component and recipe counts, labels, current-page states, keyboard order, deep links, and empty states.
- Capture accepted comparison screenshots for the final review.
- Run showcase typecheck/build plus the relevant behavior, accessibility, and end-to-end tests.

## Proposed Tracer-Bullet Issues

1. [#384 — Search and filter the component catalog](https://github.com/parveshh/dethink-components/issues/384) — AFK; no blockers. Adds the semantic search surface, group-preserving results, count, resettable no-results state, responsive styling, Motion choreography, and end-to-end coverage.
2. [#385 — Add component detail quick switching](https://github.com/parveshh/dethink-components/issues/385) — AFK; blocked by #384. Reuses catalog matching/metadata, adds mobile component discovery plus previous/next navigation, and verifies current-page behavior.
3. [#386 — Make example source progressively disclosed](https://github.com/parveshh/dethink-components/issues/386) — AFK; no blockers. Changes the default preview/source hierarchy and verifies keyboard, copy, deep-link, Motion, and mobile behavior.
4. [#387 — Correct recipe totals and compress recipe discovery](https://github.com/parveshh/dethink-components/issues/387) — AFK; no blockers. Aligns total/featured language, simplifies the hero, brings filters forward, and adds restrained filter transitions.
5. [#388 — Replace generic recipe thumbnails with maintained captures](https://github.com/parveshh/dethink-components/issues/388) — HITL; blocked by #387. Defines the capture contract, produces initial imagery, and pauses for visual approval before finalizing all recipes.
6. [#389 — Clarify and improve the homepage component matrix](https://github.com/parveshh/dethink-components/issues/389) — AFK; no blockers. Corrects the interaction promise and improves teaser legibility without introducing nested interactive content.
7. [#390 — Tighten the mobile homepage hero](https://github.com/parveshh/dethink-components/issues/390) — AFK; blocked by #389. Improves CTA hierarchy, first-viewport density, and coordinated entrance motion while preserving the workbench identity.
8. [#391 — Strengthen dark-theme legibility and focus states](https://github.com/parveshh/dethink-components/issues/391) — AFK; no blockers. Measures and updates semantic tokens, then verifies affected showcase surfaces across brand themes.
9. [#392 — Run final showcase journey verification](https://github.com/parveshh/dethink-components/issues/392) — AFK; blocked by #384–#391. Covers the complete user journey, final screenshots, accessibility checks, Motion budgets, typecheck, build, and documentation updates.

Motion is part of each applicable vertical slice rather than a separate polish-only issue. Each issue must state the functional purpose of its animation, its reduced-motion behavior, and the performance-sensitive properties it changes.

## Proposed Test Seams

Tests should assert public behavior and visible outcomes rather than component internals.

- **Highest seam — Playwright against the Next.js showcase:** search by name, description, and group; clear search; no-results recovery; navigate from a result; switch components; keyboard-operate disclosures; preserve current-page state; and exercise desktop/mobile viewports.
- **Accessibility seam:** axe checks on changed rendered surfaces, plus manual keyboard acceptance for search, switching, disclosures, mobile navigation, and focus visibility.
- **Responsive/visual seam:** accepted screenshots at 1440×900 and 390×844 in light and dark themes, with explicit checks at 200% zoom for reflow and clipping.
- **Build seam:** `@dethink/showcase` typecheck and production build.
- **Existing component seam:** retain the component package’s unit, rendered behavior, SSR, and accessibility suites when a shared Dethink primitive is changed.
- **Content seam:** assertions that total/featured counts come from canonical metadata and that component/recipe routes remain valid.

## Guidance Applied

- Current Next.js App Router guidance supports keeping route metadata and page composition server-owned while isolating `useRouter`, `usePathname`, or interactive filter state in Client Components.
- The modern web guidance favors a native `<search>` landmark, labelled search input, semantic lists and headings, natural focus order, visible focus, concise live-region behavior, 4.5:1 normal-text contrast, 3:1 essential UI-boundary contrast, and keyboard plus automated accessibility verification.
- Current Motion guidance supports a small App Router Client Component boundary using `motion/react`, stable keyed children in `AnimatePresence`, targeted `layout` animation, transform/opacity for compositor-friendly motion, and `useReducedMotion` for preference-aware variants.

## Explicit Non-Goals

- No new component metadata source or search backend.
- No replacement of the Dethink token system, typography, or brand direction.
- No animation dependency beyond the workspace-standard Motion package.
- No rasterized implementation of interactive UI.
- No redesign of individual recipe products during the thumbnail work.
- No final integration pull request to the repository default branch unless explicitly requested.

## Decision Log

- 2026-07-10: Preserve the workbench direction and optimize the developer journey rather than starting a visual redesign.
- 2026-07-10: Begin with component discovery because it is the highest-frequency friction and unlocks reusable navigation behavior.
- 2026-07-10: Use Playwright against the running showcase as the primary acceptance seam; add lower seams only where they isolate reusable filtering logic or shared primitives.
- 2026-07-10: Keep recipe imagery deterministic and sourced from the actual recipe surfaces.
- 2026-07-10: User approved the nine tracer-bullet slices and proposed test seams.
- 2026-07-10: User requested Motion-led animation to make the showcase impressive. Adopted a corporate-premium motion identity and made purposeful reduced-motion-safe animation a cross-cutting requirement.

## Work Log

- 2026-07-10: Completed desktop and mobile audit captures for the homepage, catalog, Button documentation, recipe gallery, navigation, and light/dark themes.
- 2026-07-10: Confirmed the showcase is a Next.js 16 App Router app backed by shared component and recipe metadata.
- 2026-07-10: Confirmed the repository has Playwright infrastructure but no showcase end-to-end specs yet.
- 2026-07-10: Drafted the implementation roadmap, test seams, and tracer-bullet issue breakdown.
- 2026-07-10: Received approval for the roadmap and verification seams; GitHub PRD and issue publication can proceed.
- 2026-07-10: Published PRD #383 and implementation issues #384–#392 with `ready-for-agent` triage.
- 2026-07-10: Implemented #384 on `feature/issue-384-showcase-catalog-search`: semantic catalog search across API names, display names, descriptions, and groups; exact-name precedence; human-readable labels with API-name context; result count; resettable empty state; responsive layouts; and group-level Motion transitions with reduced-motion behavior.
- 2026-07-10: Kept the page shell server-rendered and isolated query state in `ComponentCatalog`; added Motion as an explicit showcase dependency because the showcase now imports `motion/react` directly.
- 2026-07-10: Verified #384 with direct TypeScript and ESLint checks, a successful Next.js production build covering all 72 routes, and five passing Playwright cases for group spacing, name/purpose/group search, empty-state recovery, result navigation, keyboard order, mobile layout, and reduced motion.
- 2026-07-10: Completed a production-browser visual check at 1440×1000 and 390×844. Both pages rendered meaningful content with no framework error overlay; filtered desktop and mobile states settled to one expected group and one expected result, and home-route navigation remained intact.
- 2026-07-10: Corrected the catalog group rhythm after visual review by restoring a consistent 48px gap between animated sections; added a layout-level regression assertion and confirmed the measured General-to-Layout gap is 48px.
