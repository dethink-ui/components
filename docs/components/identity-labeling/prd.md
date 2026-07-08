# Identity And Labeling Primitives PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/313.

Package target: `@dethink/components`.

## Problem Statement

Teams building production SaaS dashboards, internal tools, B2B applications,
settings flows, CRM views, notification surfaces, admin tables, and AI-native
React interfaces need small identity and labeling primitives that are consistent
before larger data-display and form components continue to expand.

Badge, Avatar, AvatarGroup, and Label are small individually, but they appear
together throughout real product UI: user rows, assignee lists, account menus,
status chips, moderation queues, workflow labels, table filters, form rows,
settings cards, alerts, comments, and AI conversation metadata. Without a shared
component contract, teams will recreate badge colors, avatar fallback initials,
overlap math, accessible names, native label associations, required markers,
focus styling, density spacing, dark mode, RTL behavior, and registry metadata
in many places.

The library already has Button, IconButton, Link, Typography, layout primitives,
Card, FormField, RevealButton, and several higher-level navigation and feedback
surfaces. This PRD defines one grouped P0-ish component family for identity and
labeling primitives so implementation agents can ship a cohesive vertical slice
without treating Badge, Avatar, AvatarGroup, and standalone Label as unrelated
one-off components.

## Solution

Ship an Identity And Labeling primitives family with four public components:
Badge, Avatar, AvatarGroup, and Label. The family should be dependency-light by
default, shadcn-compatible, token-backed, accessible, SSR-safe, density-aware,
RTL-safe, and installable through the registry as focused items.

Badge should be a mostly static, dependency-free inline status and metadata
primitive. It should provide constrained variants and tones, optional icon
slots, clear state semantics, and recipes for removable or interactive usage
only when native Button or Link semantics remain intact.

Avatar should render a robust user, team, organization, bot, or entity identity
surface with image, fallback, initials, icon, color-safe token variants,
accessible names, loading/error behavior, and optional non-essential motion.
AvatarGroup should compose Avatar for compact groups with overlap, count
overflow, accessible names, keyboard-reachable detail affordances when exposed,
and optional Motion-powered spread or name reveal that never becomes the only
way to access identity information.

Label should be a standalone native-first label primitive. It should render a
native `label` by default, support explicit `htmlFor`, required and optional
markers, disabled and invalid visual state, class merging, ref forwarding, and
composition with existing FieldLabel/FormField semantics. This PRD does not
replace FieldLabel. It defines the standalone Label export and registry item
that FieldLabel can compose or align with.

## User Stories

1. As a frontend engineer, I want a Badge component, so that statuses and metadata chips do not require repeated utility strings.
2. As a frontend engineer, I want Badge to render a non-interactive inline element by default, so that static labels do not expose misleading widget semantics.
3. As a frontend engineer, I want Badge tone variants for neutral, primary, success, warning, destructive, and info, so that common product states are consistent.
4. As a frontend engineer, I want Badge style variants such as solid, soft, outline, and subtle, so that hierarchy can change without custom CSS.
5. As a frontend engineer, I want Badge sizes for dense tables and roomy cards, so that the same primitive works across dashboard layouts.
6. As a frontend engineer, I want Badge to support leading and trailing icons, so that status and metadata can include recognizable visual cues.
7. As an accessibility reviewer, I want Badge state examples to avoid color-only communication, so that success, warning, destructive, and info badges remain understandable.
8. As a dashboard user, I want status badges to remain readable in light and dark modes, so that dense tables can be scanned quickly.
9. As a design-system lead, I want Badge to use semantic tokens instead of hard-coded colors, so that themes can customize status language.
10. As a registry consumer, I want Badge to install without Motion or other runtime dependencies, so that a small status primitive stays lightweight.
11. As a frontend engineer, I want a removable badge recipe that uses a native button for removal, so that chip removal remains keyboard and screen-reader accessible.
12. As a frontend engineer, I want link-like badge recipes to compose with Link rather than overloading Badge, so that navigation semantics stay clear.
13. As a frontend engineer, I want an Avatar component, so that user, team, organization, bot, and entity identities have a consistent visual surface.
14. As a frontend engineer, I want Avatar to support image source and alt text, so that profile photos can render with native image behavior.
15. As a frontend engineer, I want Avatar fallback initials, so that identities remain recognizable when images fail or are absent.
16. As a frontend engineer, I want Avatar fallback icons, so that teams, bots, organizations, and anonymous users can use appropriate identity glyphs.
17. As a frontend engineer, I want deterministic fallback styling from a constrained token map, so that lists do not require random runtime colors.
18. As a frontend engineer, I want Avatar sizes from compact to large, so that table cells, menus, cards, and profile headers can share one component.
19. As a frontend engineer, I want Avatar shapes such as circle, rounded, and square, so that people and non-person entities can be represented appropriately.
20. As a frontend engineer, I want Avatar loading and failed-image behavior to avoid layout shift, so that list rows stay stable.
21. As an accessibility reviewer, I want Avatar to distinguish decorative avatars from named identity avatars, so that screen-reader output is intentional.
22. As an accessibility reviewer, I want Avatar fallback text to avoid duplicate announcements when adjacent visible names already label the identity.
23. As a dashboard user, I want Avatar image, initials, and fallback states to keep the same dimensions, so that tables and menus do not jump.
24. As a design-system lead, I want Avatar to support high-contrast-friendly rings and borders, so that avatars work on layered surfaces.
25. As a frontend engineer, I want Avatar to support optional subtle motion, so that premium identity surfaces can feel responsive without making motion required.
26. As a motion-sensitive user, I want Avatar motion to respect reduced-motion preferences, so that transform-heavy effects are disabled when requested.
27. As a maintainer, I want Avatar to avoid pulling Motion unless the implementation chooses an explicit motion-enabled path, so that static Avatar usage remains small.
28. As a frontend engineer, I want AvatarGroup, so that lists of collaborators, assignees, reviewers, or participants can be shown compactly.
29. As a frontend engineer, I want AvatarGroup overlap spacing to be tokenized and RTL-safe, so that groups look correct in left-to-right and right-to-left layouts.
30. As a frontend engineer, I want AvatarGroup to support a maximum visible count, so that long collaborator lists do not overflow compact surfaces.
31. As a frontend engineer, I want AvatarGroup overflow count labels such as `+3`, so that hidden participants are summarized clearly.
32. As an accessibility reviewer, I want AvatarGroup to expose the group name and member names, so that compact overlap does not hide identity information from assistive technology.
33. As a keyboard user, I want any AvatarGroup reveal behavior to be reachable by focus as well as hover, so that pointer hover is not required.
34. As a touch user, I want AvatarGroup to remain useful without hover, so that mobile users can still identify members through visible text, labels, or explicit detail affordances.
35. As a frontend engineer, I want AvatarGroup to support optional Motion-powered spread or name reveal, so that dense identity clusters can disclose more detail in premium surfaces.
36. As a motion-sensitive user, I want AvatarGroup spread and reveal motion to fall back to stable, non-transform presentation under reduced motion.
37. As a product designer, I want AvatarGroup spacing, ring, and overlap choices to be constrained, so that collaborator clusters stay consistent across products.
38. As a frontend engineer, I want a standalone Label component, so that non-FormField controls can still use a native-first label primitive.
39. As a frontend engineer, I want Label to render a native `label` by default, so that browser label activation and control association work.
40. As a frontend engineer, I want Label to support explicit `htmlFor`, so that labels can associate with controls across composition boundaries.
41. As a frontend engineer, I want Label to support `asChild` only if native label semantics are preserved or explicitly documented, so that composition does not break accessibility.
42. As a frontend engineer, I want Label to render required and optional markers, so that form expectations are clear without bespoke markup.
43. As an accessibility reviewer, I want required and invalid label state to avoid color-only communication, so that status is visible through text, icons, or programmatic state.
44. As an accessibility reviewer, I want Label to avoid replacing FieldLabel, so that existing FormField relationships and error wiring remain stable.
45. As a FormField implementer, I want FieldLabel and standalone Label to share visual language, so that form labels are consistent whether used inside or outside Field.
46. As a settings-page engineer, I want Label to support disabled and invalid visual states, so that labels align with disabled controls and validation state.
47. As a dense-table engineer, I want Badge and Avatar to fit in table cells without resizing rows unexpectedly, so that data grids remain scannable.
48. As a CRM engineer, I want Avatar, AvatarGroup, Badge, and Label to compose inside Card, Table, DataTable, DropdownMenu, CommandPalette, and forms, so that identity metadata is reusable.
49. As an AI product engineer, I want Badge and Avatar to represent model, tool, author, and status metadata, so that AI-native interfaces can use the same primitives as admin UI.
50. As a docs author, I want Storybook examples for status chips, assignees, reviewer groups, form labels, and dense rows, so that consumers can copy realistic patterns.
51. As a package consumer, I want all component prop types and class-name helpers exported from `@dethink/components`, so that APIs are discoverable.
52. As a registry consumer, I want accurate registry metadata for each primitive, so that copied source includes only the required files and dependencies.
53. As an SSR app developer, I want Badge, Avatar, AvatarGroup, and Label to server-render and hydrate without warnings, so that they work in Next.js-style apps.
54. As a QA engineer, I want render, accessibility, SSR, visual, and registry tests for the component family, so that small primitives do not regress silently.
55. As a maintainer, I want this PRD to stay focused on small primitives, so that List, DataList, Table, Field, Input, Tooltip, HoverCard, and user-profile workflows can evolve separately.

## Implementation Decisions

- The grouped component family is Badge, Avatar, AvatarGroup, and Label.
- The grouping is intentional because the source product PRD and development path mark Badge, Avatar, AvatarGroup, and Label/FieldLabel as P0-ish small primitives that frequently compose together in production UI.
- Badge, Avatar, AvatarGroup, and Label should each have focused public exports from `@dethink/components`, exported prop types, and shadcn-compatible registry metadata.
- Registry metadata may ship as separate installable items when dependency boundaries differ. Badge and Label must remain dependency-free. Avatar should remain dependency-free unless the approved implementation explicitly isolates Motion usage. AvatarGroup may declare Motion only if the implemented optional reveal behavior imports `motion/react`.
- Styling should use Tailwind CSS v4 utilities, semantic tokens, static class maps, shared class-name merging, data attributes, logical properties, and no hard-coded brand colors.
- The family should support light mode, dark mode, high contrast, density, RTL, and responsive wrapping through existing token and utility conventions.
- Components should forward refs, support native attributes appropriate to their rendered element, expose stable `data-slot` attributes, and expose state data attributes where useful.
- Badge is a static data-display primitive by default, not a button, link, checkbox, tab, menu item, or toggle.
- Badge should default to a neutral soft or subtle visual treatment that works inside cards, tables, and command rows.
- Badge should support constrained `variant`, `tone`, `size`, and optional icon placement props. Candidate variants are `solid`, `soft`, `outline`, and `subtle`. Candidate tones are `neutral`, `primary`, `success`, `warning`, `destructive`, and `info`.
- Badge should use clear text or icons in examples for status meaning. Color alone must not be the only indicator of success, warning, destructive, or informational state.
- Badge icon slots should treat icons as decorative by default when the badge text already communicates meaning. Examples requiring icon-only status should use an explicit accessible label or a different component.
- Badge may document removable and interactive recipes, but those recipes must compose native Button, IconButton, Link, or future Tag/Chip components rather than giving static Badge conflicting interaction semantics.
- Avatar should render a stable square box with an image layer, fallback layer, and optional presence of initials or icon content.
- Avatar should preserve dimensions across image loading, image failure, fallback initials, and fallback icon states.
- Avatar should support sizes such as `xs`, `sm`, `md`, `lg`, `xl`, and `2xl`, with dimensions tied to density-aware tokens where practical.
- Avatar should support shapes such as `circle`, `rounded`, and `square`, with the default optimized for person avatars.
- Avatar should support image props that preserve native image behavior, including `src`, `srcSet`, `sizes`, `alt`, `loading`, `decoding`, and custom image attributes where safe.
- Avatar should provide a clear accessible-name strategy. When an adjacent visible name labels the identity, Avatar may be decorative with empty `alt` or `aria-hidden`. When Avatar is the only identity surface, it should expose a useful name.
- Avatar fallback initials should be passed explicitly or generated by a small deterministic helper that handles whitespace, punctuation, and common multi-word names without trying to solve full international name parsing.
- Avatar fallback colors should come from a constrained token map or explicit tone prop. Random colors and user-provided arbitrary color strings are out of scope for v1.
- Avatar should support optional rings, borders, or contrast treatments for layered surfaces and AvatarGroup overlap.
- Avatar may support non-essential motion through a prop such as `motion="none" | "subtle" | "standard"`. Motion should affect transform and opacity only, such as subtle image/fallback scale on hover or focus.
- Avatar motion must be disabled or reduced when the user prefers reduced motion. Reduced-motion behavior must preserve all identity state without relying on animation.
- Avatar should not use Motion for basic image loading, fallback rendering, or static hover color changes if CSS motion-safe utilities are sufficient.
- AvatarGroup should compose Avatar and should not fork an incompatible avatar visual model.
- AvatarGroup should support visible members, max visible count, overflow count, overlap spacing, group label, and optional member name metadata.
- AvatarGroup should use logical spacing and stacking so overlap works correctly in RTL. The visual stack order should be documented and tested.
- AvatarGroup should expose group and member identity information programmatically. A compact visual stack must not be the only representation of names.
- AvatarGroup reveal behavior must work on focus as well as hover. Touch and keyboard users must have an equivalent path to identity information through visible count text, `aria-label`, `aria-labelledby`, `aria-describedby`, title text where appropriate, or composition with Tooltip/HoverCard when those components exist.
- AvatarGroup may support optional Motion-powered overlap spread or name reveal, using patterns similar in spirit to RevealButton's label reveal. The reveal should animate transform and opacity, avoid layout-changing motion where possible, and keep reduced-motion behavior stable.
- AvatarGroup should not require Tooltip, HoverCard, Popover, or DropdownMenu in v1. Recipes can show how to compose with those components later.
- Label should render a native `label` element by default and support `htmlFor`.
- Label should support required and optional markers with configurable marker content or visibility. Markers should be visible text or clearly documented visual affordances, not color-only state.
- Label should support disabled and invalid visual states through props and data attributes. Invalid styling should align with FormField and input-control conventions.
- Label should be usable standalone or through FieldLabel. It should not replace FieldLabel's context wiring, description/error relationships, generated IDs, or Field state propagation.
- FieldLabel may later compose Label internally, but this PRD only defines the standalone public Label contract and alignment requirements.
- Label should avoid a hidden validation model. Required, optional, disabled, and invalid state are presentational and semantic hints; actual control attributes remain owned by the control or FieldControl.
- Label should not invent custom ARIA roles when native label semantics are available.
- The component family should not introduce CSS-in-JS, styled-components, Emotion, arbitrary `sx` props, runtime-generated Tailwind class names, random color generation, form-library dependencies, React Aria, Radix Avatar, Radix Label, or mandatory Motion dependencies for static primitives.
- Existing prior art should inform implementation: FormField for FieldLabel and label/control relationships, IconButton for accessible compact affordances, RevealButton for optional Motion-powered label reveal patterns, Typography for label and metadata text tone, and Card for small structural primitives.

## Testing Decisions

- Tests should assert public DOM behavior, accessibility relationships, state attributes, class composition, refs, and registry metadata rather than private implementation details.
- Badge render tests should cover default rendering, variants, tones, sizes, leading icon, trailing icon, class merging, refs, custom attributes, and stable `data-slot`/state attributes.
- Badge accessibility tests should cover static semantics, axe smoke, icon handling, status examples that do not rely on color alone, and recipes that use native Button or Link for interaction.
- Badge visual and Storybook coverage should include neutral, primary, success, warning, destructive, info, solid, soft, outline, subtle, icon badges, dense table badges, dark mode, density, high contrast, and RTL.
- Avatar render tests should cover image rendering, fallback initials, fallback icon, image failure fallback, loading attributes, alt text, decorative usage, sizes, shapes, rings, class merging, refs, and stable dimensions.
- Avatar accessibility tests should cover named and decorative avatar patterns, axe smoke, adjacent visible name patterns, fallback text announcement behavior, and non-color-only identity examples where status is present.
- Avatar motion tests should cover `motion="none"` and any enabled motion presets, reduced-motion behavior, focus/hover state attributes, transform/opacity-only targets where practical, and no animation-only state communication.
- Avatar SSR tests should cover server rendering and hydration for image, fallback initials, fallback icons, and generated deterministic initials without mismatch warnings.
- Avatar visual and Storybook coverage should include image, initials, icon fallback, failed image, sizes, shapes, rings, entity types, dark mode, density, RTL, and AI/user/team examples.
- AvatarGroup render tests should cover composition with Avatar, max visible count, overflow count, overlap spacing, group label, member labels, RTL order, class merging, refs, and stable dimensions.
- AvatarGroup accessibility tests should cover group accessible names, member name exposure, overflow count naming, keyboard focus behavior for any reveal affordance, touch-safe non-hover access, axe smoke, and no hover-only information.
- AvatarGroup motion tests should cover optional spread or reveal presets, reduced-motion fallback, focus and hover triggers, non-layout-changing transform/opacity motion where practical, and stable static presentation when motion is disabled.
- AvatarGroup visual and Storybook coverage should include two-person groups, larger groups, overflow counts, compact tables, reviewer clusters, assignee lists, organization avatars, dark mode, density, high contrast, RTL, reduced motion, and optional reveal examples.
- Label render tests should cover native `label` output, `htmlFor`, children, required marker, optional marker, disabled state, invalid state, size or tone variants if included, class merging, refs, and custom attributes.
- Label accessibility tests should cover native label/control association, click-to-focus activation, required/optional marker readability, invalid state that is not color-only, axe smoke, and standalone composition with native inputs.
- Label composition tests should cover usage near existing FormField/FieldLabel patterns without breaking FieldLabel's context-owned IDs, descriptions, errors, or invalid state behavior.
- SSR tests should cover Badge, Avatar, AvatarGroup, and Label server rendering and hydration without browser-only access or generated ID mismatches.
- Type-level tests should verify constrained variants, tones, sizes, shapes, marker options, motion presets, and unsupported values where practical.
- Registry validation should verify every exported primitive has accurate files, dependencies, devDependencies, registry dependencies, CSS variable expectations, package exports, and clean consumer install behavior.
- Package build and typecheck coverage should verify the family exports from `@dethink/components` and remains tree-shakeable.
- Storybook interaction tests should cover keyboard focus on Label-associated controls, AvatarGroup reveal on focus if reveal is implemented, removable Badge recipes using native buttons, and reduced-motion scenarios.
- Documentation should include manual keyboard acceptance criteria for Label activation and AvatarGroup reveal behavior if the reveal path is interactive.
- Visual regression coverage should include light, dark, density, high contrast, RTL, narrow containers, table cells, card headers, and AI/chat metadata examples.

## Out of Scope

- Implementing source code as part of this PRD drafting task.
- Replacing FormField, Field, FieldLabel, FieldControl, FieldDescription, or FieldError.
- Input, Textarea, NumberInput, Checkbox, RadioGroup, Switch, Select, Combobox, DatePicker, FileUpload, or other concrete input widgets.
- TagInput, MultiSelect token rendering, full Chip component, filter pills, segmented controls, tabs, menu items, or selectable list options.
- Presence indicators, online/offline status logic, user availability subscriptions, collaboration cursors, notifications, or realtime identity updates.
- User profile cards, HoverCard, Tooltip, Popover, DropdownMenu, account menus, people pickers, organization switchers, and assignee selectors.
- Uploading, cropping, editing, compressing, validating, or moderating avatar images.
- Gravatar, OAuth profile fetching, remote identity providers, permissions, analytics, or data-fetching behavior.
- International name parsing beyond a simple fallback-initial helper. Consumers can pass explicit initials for names that need custom handling.
- Arbitrary user-defined colors, random runtime color generation, CSS color strings, gradient avatars, image filters, or brand artwork processing.
- Mandatory Motion dependency for Badge or Label.
- Motion-driven Badge behavior.
- Tooltip-dependent AvatarGroup naming in v1. Tooltip or HoverCard recipes can be added after those components exist.
- Layout-changing AvatarGroup expansion that pushes surrounding content around in dense tables or toolbars.
- Validation engines, form-library adapters, schema validation, async submit behavior, or automatic required attribute propagation from Label.
- CSS-in-JS, styled-components, Emotion, `sx`, arbitrary responsive object props, or runtime class generation.

## Further Notes

- The source product PRD marks Badge, Avatar, AvatarGroup, and Label/FieldLabel as P0-ish small primitives. The current development path lists Badge at item 14, Avatar/AvatarGroup at item 15, and Field/Label/HelpText/ErrorMessage at item 19.
- Label already exists as FieldLabel inside FormField. This PRD defines a standalone Label export and registry item that composes with FormField rather than replacing FieldLabel or its context wiring.
- Existing prior art: `docs/components/form-field/prd.md` defines FieldLabel semantics and label/control/error wiring; `docs/components/icon-button/prd.md` defines accessible compact affordances; `packages/components/src/components/reveal-button/reveal-button.tsx` demonstrates optional `motion/react` label reveal with reduced-motion handling; `docs/components/typography/prd.md` defines text semantics; `docs/components/card/prd.md` defines small structural primitive boundaries.
- Modern web guidance for this family: prefer semantic HTML and native labels, use explicit label/control association, preserve visible focus, do not use color alone for state, use tokenized CSS, animate transform and opacity rather than layout where motion is needed, and respect reduced motion.
- Context7 research resolved Motion to `/websites/motion_dev`. Motion React gesture documentation supports `whileHover` and `whileTap` for hover and tap gesture animation. Motion accessibility documentation supports reduced-motion handling through `MotionConfig reducedMotion="user"` and `useReducedMotion`, with transform/layout motion disabled or replaced by less disruptive opacity behavior.
- Motion should be used only where useful. Badge and Label should not import Motion unless a concrete future requirement changes their scope. Avatar can optionally use Motion for subtle non-essential image or fallback zoom. AvatarGroup can optionally use Motion for overlap spread or name reveal, but names and accessibility must remain available without hover-only motion.
- The most important accessibility invariants are native label semantics for Label, reliable accessible names for identity surfaces, no hover-only identity disclosure, visible focus for any interactive recipe, and status communication that is not color-only.
