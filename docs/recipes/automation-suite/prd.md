# PRD: Automation landing and social login recipes

## Problem Statement

The showcase needs a complete software automation company experience that demonstrates shader backgrounds and Dethink components together, including the transition from marketing to sign-in.

## Solution

Add two coordinated full-page recipes based on the approved generated concept: an emerald/teal shader-backed automation landing page and a matching social login page. Use real Dethink components and editable source, with deterministic local demonstrations.

## User Stories

1. As a visitor, I want a clear automation-company proposition and product navigation so I can understand the service.
2. As a visitor, I want an atmospheric shader hero with readable fallback so the experience works with or without WebGL.
3. As an evaluator, I want to switch among lead routing, invoice approval, and incident workflows so I can explore use cases.
4. As an evaluator, I want to run a sample workflow and see progress and activity so the product demonstration is meaningful.
5. As a buyer, I want benefits, pricing and FAQ so I can evaluate the fictional offering.
6. As a visitor, I want landing actions to reach the matching sign-in experience.
7. As a user, I want Google and GitHub sign-in controls with honest demo feedback.
8. As a user, I want labelled email/password inputs with validation and password visibility control.
9. As a user, I want pending, failure, retry, and successful demo states without sending credentials.
10. As a user, I want a useful password-recovery demonstration and an obvious return path.
11. As a mobile visitor, I want both pages to reflow without document overflow.
12. As a keyboard or assistive-technology user, I want logical navigation, accessible names, focus management and announced results.
13. As a motion-sensitive user, I want static readable shader alternatives and reduced motion.
14. As a developer, I want both recipes discoverable in the gallery with real thumbnails, component metadata and readable source.
15. As a developer, I want light/dark and forced-color support through local semantic tokens without changing global styling.

## Implementation Decisions

- Use the existing full-page recipe and gallery contracts; preserve existing recipes.
- Compose LiquidMeshBackground and SilkFlowBackground with existing buttons, tabs, table, badges, cards, progress, accordion, fields, inputs and dialogs where appropriate.
- Use the working brand Automation, with copy about workflow automation rather than component-library marketing.
- Keep async demonstrations local, bounded and cancellable. No real OAuth, account creation, credential storage, remote submissions or provider redirects.
- Expose predictable error scenarios through an explicitly labelled demo control, not hidden magic credentials.
- Reuse a small recipe-local visual stylesheet, document copied-source dependencies, and respect semantic tokens and theme inheritance.

## Testing Decisions

The user approved route-level Playwright seams: gallery discovery, workflow switching/run completion, marketing-to-login navigation, both providers, email validation, failure/retry, recovery and return navigation. Verify desktop/mobile geometry, light/dark themes, reduced motion, forced colors, keyboard behavior, axe scans and shader fallback. Run affected lint/typecheck/build and existing recipe gallery/full-page regression checks. Generate actual UI thumbnails after implementation.

## Out of Scope

Real authentication, account creation, external integrations, paid billing, backend persistence, new public component APIs and rasterized UI implementation.

## Further Notes

User approved the visual concept and two vertical slices on 2026-09-20. Generated concept and prompt are retained alongside local planning. Implementation follows the repository's PRD/issue workflow; no commits without user request.
