## Problem Statement

Dethink's landing recipes show split heroes, operational consoles, and travel/hospitality stories. Developers need an AI research marketing example where the product story is an inspectable answer supported by sources, with a distinct centred editorial composition.

## Solution

Build the user-selected Relay concept as one responsive marketing recipe. Preserve the approved paper-and-cobalt direction, large serif headline, wide research workspace, evidence section, FAQ, and closing CTA. Visitors can switch sample research topics, inspect matching source passages, and complete a guided local sample.

## User Stories

1. As a developer, I can discover Relay in Marketing and open its canonical recipe route.
2. As a visitor, I can understand Relay's purpose through its centred headline and product preview.
3. As a visitor, I can explore a sample directly from the hero.
4. As a visitor, I can switch Customer feedback, Market signals, and Product decisions.
5. As a visitor, I see matching questions, findings, recommendations, and sources for each topic.
6. As a visitor, I can search the current source titles and recover from no results.
7. As a visitor, I can select a citation and inspect the matching source excerpt.
8. As a keyboard user, I can operate tabs, source actions, FAQ, and dialogs with clear focus.
9. As a keyboard user, closing evidence restores focus to the action that opened it.
10. As a visitor, I can try a guided sample with labelled inputs and a visible completion state.
11. As a visitor, I understand the research data and completed sample are fictional, local demonstrations.
12. As a mobile visitor, I can read the answer and reach sources without a squeezed desktop sidebar.
13. As a visitor, I can use the page in light/dark mode and with reduced motion or forced colours.
14. As a developer, I can inspect the exact recipe source and its component and accessibility notes.
15. As a developer, I see a maintained gallery capture of the actual rendered recipe.
16. As a visitor, I can navigate all product sections and FAQ without dead controls or links.

## Implementation Decisions

- Add a showcase recipe, catalog metadata, canonical route mapping, source disclosure, and maintained thumbnail. Preserve the existing full-page canvas capped at 1200px.
- Compose existing public Tabs, Card, Badge, Button, Dialog, Field, Input, Accordion, and feedback primitives. No new library API, dependency, backend, or registry block.
- Use authored topic fixtures with stable source identifiers; derive questions, findings, and citations from the selected topic. Filter source titles locally. Topic changes reset source filtering so previous searches do not hide the new topic's sources.
- Evidence uses a labelled Dethink Dialog with the source identity, matching passage, and focus restoration. Every source and inline citation has an actual working action.
- The guided sample uses local state and sensible labelled fields; it produces an explicit demo result without a network request or sending a message.
- Use scoped semantic tokens for the approved cobalt art direction with light/dark counterparts. Reuse existing fonts and icon primitives; build the UI as live content rather than a raster image.
- On mobile place the answer before sources and retain the complete reading and keyboard path. Native links handle section navigation.
- Carry the user's approved plan in three dependency-ordered vertical slices: page/evidence path; topic/search/guided-sample paths; gallery and theme/accessibility acceptance.

## Testing Decisions

- Use existing showcase Playwright seams to verify public behaviour on the real recipe route, with axe checks and screenshots where useful.
- Verify topic/source/citation consistency, search recovery and reset, matching evidence, keyboard activation, Escape dismissal, focus restoration, sample validation and completion, and reset/retry.
- Verify 390px, 768px, 1440px and wide layouts, light/dark, reduced motion, forced colours, no document overflow, source disclosure, and gallery discovery.
- Run scoped lint/format, showcase typecheck and production build. Capture the real production recipe using the existing 1200×675 thumbnail contract.
- Tests assert visible outcomes and user interactions, not internal state shapes or Tailwind class strings.

## Out of Scope

Real AI generation, file uploads, paid plans, account creation, outbound messages, payments, persistent data, new Chat APIs, implementing Forma or Assembly, and redesigning existing recipes.

## Further Notes

The user selected Relay from three imagegen concepts on 2026-09-19 after requesting design approval before implementation. The approved local plan includes the test seams and three delivery slices. Generated incidental copy, dated footer text, statistics, and unused controls are not requirements. Keep all research examples explicitly fictional. Existing unrelated working-tree changes remain untouched; implementation uses an isolated checkout from the current main integration base.
