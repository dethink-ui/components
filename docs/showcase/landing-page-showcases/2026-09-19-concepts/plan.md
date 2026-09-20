# Landing page recipe — three directions

Date: 2026-09-19. Status: **Relay selected, implemented, and verified.** Direction 01 is built in the isolated `relay-landing` checkout, with 12 passing browser checks and a passing production build. GitHub PRD #455 and issues #456–#458 track the work. Changes are uncommitted. Forma and Assembly remain unselected alternatives.

## What exists today

Reviewed the current working-tree catalog, recipe route, source loader, presentation contract, exported components, and the six maintained landing-page captures. The catalog contains 17 recipes, six in Marketing:

| Existing recipe | Current direction | Main composition / interaction |
| --- | --- | --- |
| SaaS landing page / Northstar | General SaaS, light teal | Split hero and product preview, feature bento, pricing, FAQ |
| Lumen creative operations | Dark, neon-lime, expressive typography | Kinetic hero, project console, narrative rail, proof deck, NavDock |
| Daymark hospitality launch | Warm cream and orange | Launch-room story, operational cards, guest-note rail, opening-day walkthrough |
| Dethink Labs security | Light teal, technical | Split hero with live monitoring console, tabs, switches, audit dialog |
| HelioGrid energy | Black and lime, operational | Split hero with live dispatch, energy controls, rollout, audit flow |
| Hush & Hearth curated travel | Warm editorial, serif, photography | Split hero, seasonal stays, date/guest planner, curator dialog |

The existing catalog already covers split heroes, technical consoles, bento sections, animated backgrounds, and warm editorial travel/hospitality. The opportunity is a different page silhouette plus a concrete interaction that demonstrates existing components.

Evidence:

- [Current catalog](../../../../apps/showcase/src/lib/recipes-meta.ts)
- [Recipe route and component mapping](../../../../apps/showcase/src/app/recipes/[slug]/page.tsx)
- [Source loader](../../../../apps/showcase/src/lib/example-source.ts)
- [Presentation types](../../../../apps/showcase/src/lib/recipe-presentation.ts)
- [Existing production captures](../../../../apps/showcase/public/recipe-captures/)
- [Full-page layout contract](../../full-page-recipe-implementation-notes.md)
- [Thumbnail capture contract](../../recipe-capture-contract.md)

The Graphify index was used to trace catalog → gallery → recipe route → source mapping. Current files supplied the inventory because the graph predates some working-tree additions. Existing unrelated work is preserved.

## Compare the options

| Direction | Audience and purpose | Distinctive visual | Interaction | Relative effort |
| --- | --- | --- | --- | --- |
| **01 Relay** | Product teams evaluating an AI research workspace | Centred serif headline, paper-and-cobalt palette, wide answer document | Change research topic, inspect cited evidence, try a guided sample | Medium; mostly UI and authored sample content |
| **02 Forma** | Teams commissioning a workplace design studio | Oversized masthead above panoramic architecture, limestone and oxblood | Choose team size and material, carry choices into a project brief | Medium–high; needs consistent photographic assets |
| **03 Assembly — recommended** | Product and design professionals considering an event | Cobalt event poster, condensed type, ruled editorial agenda | Filter sessions, save an agenda, choose a pass, complete a demo reservation | Medium; bounded local interaction and speaker assets |

Assembly adds the clearest new visual and functional category. Relay has the closest fit to the library's AI-native positioning. Forma best demonstrates image-led design and selection controls. These are creative judgments grounded in the current catalog, not market research.

## 01 — Relay: AI research workspace

[Open full-page mockup](mockups/01-relay.png)

**Promise:** “From scattered sources. To a clear next move.”

**Page sequence:** navigation → centred headline and two actions → wide research workspace → three concise capability statements → enlarged source excerpt → FAQ → cobalt conversion band → footer.

**Visual rules:** off-white and ink with a blue primary accent, large serif headline, practical sans-serif controls, fine dividers, modest radii. The answer and its supporting evidence are the hero asset; a separate marketing illustration is unnecessary.

**Main journey:** choose Customer feedback, Market signals, or Product decisions; the question, answer, and source set update together. Select a citation to open a labelled evidence dialog at the matching excerpt. “Try the workspace” opens a guided local sample; completing it announces a visible outcome. Use authored fixtures, with no AI service required.

**Existing components to compose:** Tabs, Card, Badge, Button, Dialog, Field/Input if source filtering is retained, Accordion, and Toast. Keep the first version independent of the in-progress Chat components in the working tree.

**Mobile plan:** headline scales into short lines; topic controls remain reachable; the answer leads and sources become a labelled disclosure/dialog. No miniature desktop side rail. CTA controls stack when needed. Evidence returns focus to the citation that opened it.

**Acceptance focus:** topic changes cannot retain mismatched citations; every citation opens the right evidence; closing restores focus; all sample outcomes are identified as demo content. If the generated search, Add, or overflow controls are retained, each needs a bounded working action; otherwise omit them from the implementation.

## 02 — Forma: workplace design studio

[Open full-page mockup](mockups/02-forma.png)

**Promise:** “Good space. Better work.”

**Page sequence:** quiet navigation → typographic masthead → panoramic workplace image → configuration strip → two project stories → three-step process → FAQ → dark closing invitation → footer.

**Visual rules:** limestone surfaces, espresso text, oxblood action colour, sage upholstery and oak in imagery. Flat editorial sections and thin rules; gentle rounding only where it serves controls. This is a workplace service, distinct from the existing travel recipe.

**Main journey:** select team size and Oak, Ash, or Walnut; update the selected-material summary and a material-specific preview/detail. “Build your brief” opens a dialog containing those choices plus labelled contact and project fields. Review and save a local demo brief with an explicit success state. No message is sent.

**Existing components to compose:** Select, RadioGroup, Button, Dialog, Field, Input, Textarea, Accordion, Badge, and Toast. Project photography can use simple semantic figures; a carousel is unnecessary for two stories.

**Mobile plan:** keep masthead → photograph → controls reading order; use a deliberate image crop; stack team-size and material controls; retain text names and checked states for materials; stack project stories and process stages.

**Asset plan:** after approval, source or generate a coherent hero and two project images separately from the UI mockup, then create any material-specific detail images needed for the selected interaction. Store final assets locally, provide descriptive alt text and responsive sizes, and avoid rendering whole UI screenshots as product imagery.

**Acceptance focus:** selections carry into the brief, remain intact after a cancelled dialog, and match the visible summary; invalid contact fields receive clear errors; successful completion is visibly a local demo. Photo cropping must preserve the main subject on narrow screens.

## 03 — Assembly: product and design conference

[Open full-page mockup](mockups/03-assembly.png)

**Promise:** “Better together. By design.”

**Page sequence:** navigation → cobalt typographic poster → short event strip → speaker portraits → interactive programme → pass selection → FAQ → bold closing band and footer.

**Visual rules:** cobalt, warm white, ink, and a restrained yellow CTA accent; large condensed type; monospace event metadata; firm alignment and ruled sections. Keep the loop motif as simple code-native vector decoration when implemented. The event is fictional.

**Main journey:** switch between two days and filter Design, Product, or AI sessions; save/unsave sessions with a count and a “My agenda” view. Choose Day pass or Full gathering using a radio group. “Reserve a pass” opens a summary and labelled name/email form; completing it displays a demo confirmation. Saving across filter/day changes works within the current preview. Refresh may reset state, with that behaviour documented. No ticket purchase or real booking occurs.

**Existing components to compose:** Tabs for day selection, RadioGroup for track and pass choices, Button/IconButton for saved sessions, Badge, Avatar or semantic portrait images, Dialog, Field/Input, Accordion, and Toast. A semantic agenda list is sufficient; no calendar or scheduling engine is required.

**Mobile plan:** reduce the poster type while preserving its line breaks; simplify the decorative loops; move portraits into a single-column editorial sequence; stack time/title/save controls in agenda rows; keep filter labels visible. Stack passes above the reservation action and preserve the selected state.

**Asset plan:** three consistent fictional speaker portraits with visible names and roles; properly licensed local fonts or existing project font alternatives. Asset generation and font selection follow approval.

**Acceptance focus:** filtering has an empty state and recovery path; saved sessions persist across filters and day tabs; the saved count reflects unique sessions; selected pass and displayed total agree; repeated saves/reservations cannot create duplicate state; errors and completion are announced; dialog closing returns focus.

## Shared implementation boundaries after approval

- Compose one recipe from existing public Dethink components. A new component API, package dependency, or registry block is not currently proposed.
- Register the selected recipe in the existing catalog and route mapping, expose its actual source, and populate the current component, accessibility, responsive, and motion metadata.
- Preserve the full-page contract: fluid content capped at 1200px, the shared showcase and demo bars, and details/source below the live product.
- Treat these mockup palettes as concept references. Map the chosen palette to scoped semantic CSS variables and existing tokens; retain coherent light/dark, brand, focus, forced-colour, and density behaviour.
- Use one readable primary heading, semantic landmarks, labelled inputs, visible focus, meaningful link destinations, and real actions for every visible control. Selection and success states must work without colour alone.
- Keep motion restrained and optional. Prefer existing component behaviour and simple tokenized transitions; respect reduced motion. Decorative motion cannot hide or delay essential content.
- Keep state local and data fictional. No backend, AI calls, payments, mail, uploads, or external reservations are required for these recipes.
- The generated pages are art-direction references. Their extra copy, invented statistics, dates, footer years, and incidental controls are not approved requirements. Replace those with deliberate fictional fixtures and current metadata. For Relay, reconcile source numbering; for all three, remove or implement every visible affordance.
- These desktop images do not establish mobile, dark-mode, keyboard, or runtime quality. Those are planned acceptance work, not completed checks.

## Delivery plan after a direction is approved

1. Confirm the selected direction and any visual changes. Publish the selected scope as a GitHub PRD with `to-prd`, then create dependency-ordered implementation issues with `to-issues`, following the repository workflow before implementation.
2. **Slice 1 — complete page and gallery journey:** responsive composition, navigation and CTA path, assets, catalog metadata, route, source display, and desktop/mobile geometry checks.
3. **Slice 2 — meaningful interaction:** selected concept's interactive core, dialog/form completion, feedback, empty/error states, keyboard checks, and public-behaviour tests.
4. **Slice 3 — polish and verification:** token/theme states, reduced motion, visual review, axe checks, full gallery → recipe → details → source journey, production build/typecheck, and a real 1200×675 gallery capture using the existing contract.

Each slice should include the docs and verification necessary for its behaviour. Before UI implementation, retrieve the required Modern Web Guidance and current library documentation through the repository's authenticated Context7 workflow; use the motion skill if adding motion beyond current component behaviour. The present pass is a source and visual audit, not a library/API guidance task.

Suggested viewport checks: 390px mobile, 768px tablet, 1440px desktop, and a wide monitor to confirm the existing 1200px cap. Verify no page-level horizontal overflow, readable reflow, reachable navigation and actions, light/dark themes, reduced motion, and focus restoration.

## Generated deliverables and review

Three separate built-in imagegen generations were produced and visually reviewed. Each output is 1024×1536 PNG, retaining the requested 2:3 full-page composition; pixel dimensions differ from the approximate size requested in the prompts. Each has navigation, hero, supporting sections, an interaction preview, and a closing section. The intended centred-document, photographic-masthead, and conference-poster silhouettes are clearly distinct.

- [Relay mockup](mockups/01-relay.png)
- [Forma mockup](mockups/02-forma.png)
- [Assembly mockup](mockups/03-assembly.png)
- [Exact generation prompts](prompts.md)

All outputs are saved with this plan. No application code, existing captures, package configuration, or Git history was changed during the exploration. The user subsequently selected Relay, authorizing its implementation; the other directions remain reference material.
