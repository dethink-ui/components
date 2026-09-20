# Automation recipes

Two linked showcase recipes for a fictional software automation company, based on the approved [concept board](mockups/automation-concept-v1.png).

- `/recipes/automation-landing`: fast SilkFlowBackground hero and particle-follow headline, three workflow scenarios, step progress, sample activity table, operator avatars, billing interval control, pricing and FAQ.
- `/recipes/automation-login`: fast SilkFlowBackground illustration and particle-follow illustration headline, Google/GitHub demo sign-in, email validation, password visibility, recovery dialog and failure/retry/success states.

## Planning

Approved [PRD #475](https://github.com/parveshh/dethink-components/issues/475), [landing #476](https://github.com/parveshh/dethink-components/issues/476), and [login #477](https://github.com/parveshh/dethink-components/issues/477). Work remains uncommitted on `feature/issue-477-automation-login`, created from the landing issue branch and PRD branch. No remote PR is opened without commits.

## Reuse

Copy the desired TSX recipe from `apps/showcase/src/examples/recipes/` together with `automation-suite.css` and `automation-motion.ts`. Both are showcase compositions, not new registry blocks. Use the existing Dethink package/theme setup; no new runtime dependencies or public component APIs were added. The TSX uses React, Next.js Link and lucide-react. For a different router, replace Link with your router's link and update the two recipe URLs. The `RecipePreviewProps` import is showcase-only: replace it with `{ presentation?: "embedded" | "full-page" }` when copying outside this repo.

The shared stylesheet defines recipe-local semantic brand tokens for light and dark themes and the shader palette. The entire landing recipe and decorative login panel keep a dark palette in both showcase themes, avoiding an abrupt surface change below the hero. The login form still follows the showcase theme. The shader text opts out of the showcase’s inherited font-size adjustment so canvas glyphs match their semantic HTML. Particle Follow responds to a fine pointer and keeps plain text on touch devices. The small motion helper uses an SSR-safe external-store subscription to react to preference changes. No generated image is rendered as UI. The login's GitHub SVG uses the same mark as the showcase header.

## Interaction contract

Workflow tabs cancel any in-flight sample before switching scenarios. A run completes four steps, advances progress, and adds the latest run to activity. Repeated runs increment the sample number; switching scenarios resets it. This is deliberately ephemeral demo state.

Provider buttons simulate a local async result. Email uses native email validity and required checks, linked Field errors and first-invalid-field focus. Password visibility never prevents paste. Password input is cleared when a demo starts. A successful result focuses the completion heading; its return action reaches the landing page. About this sign-in demo exposes a one-shot failure checkbox. Retry completes after the error flag is consumed. Pending work is cancelled on unmount. No credentials are sent, logged or persisted.

Recovery validates an email and describes what a connected app would do; it never claims to send mail. Its submit stops React portal event propagation to the outer sign-in form. Account creation is an explanatory dialog. Real OAuth, sessions, account creation, reset emails and billing must be integrated by the consuming application.

## Accessibility and manual acceptance

- Tab through navigation, CTAs and workflow controls. Arrow keys change the workflow tab and select matching content.
- Run a sample: read progress and the final live announcement. Switch tabs mid-run and verify only the newly selected scenario can complete.
- On a narrow viewport, focus the activity table and use arrow keys to inspect its horizontal content. The document itself does not scroll horizontally.
- Reach pricing and FAQ with the keyboard; selected billing interval has pressed semantics.
- Submit an empty email form; focus moves to Email and errors are linked to the controls. Check password visibility and password pasting.
- Open recovery, submit a sample address, then Escape: focus returns to the trigger and the sign-in form remains idle.
- Exercise both providers, the failure control and retry. Completion focuses the result heading.
- Switch themes, reduced motion and forced colors. Headings, controls and status text remain usable. Reduced motion and unavailable WebGL use the components' static fallback, with no decorative canvas needed.

## Verification

`e2e/showcase-automation-recipes.spec.ts` tests gallery/source/thumbnails, landing-to-login navigation, keyboard workflow selection, cancellation, repeat runs, pricing, FAQ, provider failures/retries, email validation, password visibility, recovery focus, no POST/PUT requests, 1440/390/320px reflow, light/dark axe scans, forced colors, shader motion and fallback.

Gallery thumbnails use the existing capture script and 1200 × 675 contract. Visual review captures are retained under `captures/`. Run the existing gallery/full-page suites for shared-shell regressions alongside the recipe tests. Final results and any baseline limitations are recorded in `plan.md`.
