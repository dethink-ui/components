# Forma AI agents studio

Forma is a fictional automation and AI agent studio. Open `/recipes/forma-ai` for its full landing page and source view. It combines an imagegen ribbon hero, animated headline and light streaks, an interactive workflow lab, capability cards, specialist selection, engagement scopes, FAQ and a local project brief.

## Components and interactions

The composition uses HeroTextAnimation, LightStreaksBackground, NavigationMenu, RevealButton, Button, IconButton, Badge, Card, CardScroller, Tabs, Progress, Steps, AvatarGroup, Accordion, Dialog, FormField, Input, Textarea, Select, Separator and LiveRegion.

Research, Support and Operations samples advance through three preparation steps. Output stays in review until a person explicitly approves it. Reset and scenario changes cancel pending preparation. These are deterministic local examples; they do not invoke an AI service or change external systems. Integration dialogs describe possible connections without connecting accounts.

Specialist cards update a detail panel. Discovery, Build and Partner tabs change the engagement scope and the brief's initial selection. The brief validates a name, email and description, then displays a local summary. Closing clears the fields. No request, email or persistent storage is created.

## Copying the recipe

Copy `forma-ai.tsx`, `forma-ai-data.ts`, `forma-ai-lab.tsx`, `forma-ai-brief.tsx` and `forma-ai.css` from `apps/showcase/src/examples/recipes`, plus the public `recipes/forma-ai` assets. Install the referenced Dethink components, Motion and Lucide React with the documented Tailwind base setup. Replace the showcase-only RecipePreviewProps type with your own presentation prop. This example uses Next.js Image; other React hosts can use a responsive image with the same dimensions and empty decorative alt text.

The stylesheet scopes Forma's semantic token overrides to the recipe, with light, dark, inverse and forced-color treatments. It does not change the public component API or registry.

## Motion and accessibility

A visible pause control stops nonessential motion. The page responds to changes in `prefers-reduced-motion`, including after mount. Animation never conveys workflow status by itself: steps, progress and text provide the same information. Timed sample processing continues when visual motion is paused.

Keyboard acceptance: follow the skip and section links; switch lab tabs using arrows; run and review a sample; close its dialog with Escape and verify focus returns; select specialist cards with keyboard; switch engagement tabs; expand an FAQ; submit invalid and valid project briefs and check error/success focus. Dialogs have accessible titles and return focus to their triggers. Text feedback is announced through a live region.

## Verification

`e2e/showcase-forma-ai.spec.ts` covers gallery/source/thumbnail integration, all three sample approvals, cancellation, specialist and engagement selection, local brief validation and focus, integration previews, FAQ, reduced motion, responsive widths and light/dark accessibility. Run with the repository Playwright configuration. Refresh the gallery thumbnail with `pnpm capture:recipes forma-ai` against a running showcase (or set `SHOWCASE_BASE_URL`).

For production, replace sample copy with reviewed company content and connect the brief and agent flows to your own services. Define authentication, authorization, data handling, execution boundaries and human approval before enabling real actions.
