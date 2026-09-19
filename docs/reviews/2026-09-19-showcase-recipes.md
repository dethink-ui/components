# Recipe review and additions

The starting catalog had 14 recipes: six marketing pages, two AI workspaces, and one each for onboarding, dashboards, CRUD, settings, scheduling, and checkout. The catalog already demonstrates expressive brand treatments and complex navigation well. The command center and support inbox are useful examples of components working together in a real application.

The strongest gap was smaller operational workflows with a clear beginning, decision, and outcome. Adding more landing pages would provide less variety than showing teams how controls, overlays, validation, and feedback fit together.

## Added compositions

| Recipe                         | Interaction to try                                                                     | Components highlighted                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Release readiness / Launchpad  | Complete two remaining checks, review, add a note, approve, and inspect activity.      | Checkbox, Progress, Tabs, Timeline, Dialog, Textarea, Avatar                 |
| Integrations hub / Mesh        | Search, connect Atlas, change its workspace label, save, then reopen and pause sync.   | Tabs, Drawer, Select, Switch, Input, Button pending state, Toast, EmptyState |
| Invoice approval desk / Ledger | Select an invoice, inspect its totals, approve it or request a correction with a note. | Table, Select, Dialog, Textarea, Badge, EmptyState                           |

All examples use existing public components and semantic theme tokens. They add no dependencies, remote services, registry blocks, or library APIs. State is local to each preview and resets on refresh. Source remains available on each recipe page. New gallery images follow the existing 1200×675 production screenshot contract.

## Quality improvements found during review

- Gallery and full-page acceptance tests had a stale ten-recipe inventory. They now check the canonical catalog, including every route and lazy-loaded thumbnail.
- The existing Curated travel recipe had no maintained thumbnail. Its gallery image is now captured from the same production surface as the new examples. Onboarding layout checks now match the current workspace setup flow.
- The shared recipe navigation used a server/client motion preference that caused hydration warnings. Its entrance now uses a reduced-motion-safe CSS fade.
- Avatar now applies the browser motion preference after hydration while keeping explicitly disabled motion deterministic.
- Drawer panels need a real layout box for initial keyboard focus. Replacing `display: contents` fixes immediate Escape dismissal; connector cards use their own DrawerTrigger so focus returns to the right action.
- Readiness and invoice totals are derived from current data rather than duplicated state. The integration save timer is cancelled on dismissal and unmount. Correction notes reject whitespace-only input.

## Acceptance checks

- Complete all three workflows, including keyboard checkbox activation, approval gating, notes, saved preferences, and correction validation.
- Cancel a pending connection and verify it is not saved.
- Close the integration drawer with Escape and verify trigger focus is restored.
- Search to zero results and recover using the visible reset action.
- Check 390px mobile layouts, light/dark themes, reduced motion, hydration, and axe WCAG A/AA findings.
- Check all catalog routes at desktop/mobile widths and verify maintained thumbnails and source availability.
- Run showcase build/typecheck, scoped lint, registry validation, and Avatar/Drawer regression tests.

Future candidates: an incident response room, a team access review, and a file-upload review queue. These would extend the catalog with escalation, permissions, and file-validation workflows without repeating the new examples.

## Verification results

All 27 browser checks passed across the workflow, gallery, and full-page suites. Avatar and Drawer regression coverage passed 144 tests. Showcase and component package production builds, showcase typecheck, scoped recipe lint/formatting, and validation of all 75 registry items passed. The production integration drawer also passed a mobile axe scan and restored trigger focus after Escape. Desktop captures and mobile dark-mode previews were visually inspected.

The existing Avatar image-reset effect still produces its pre-existing lint warning; this change does not alter that effect. Thumbnail requests made before capture files existed required a development server restart; all 17 gallery images then loaded successfully.
