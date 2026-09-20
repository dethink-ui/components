# Identity Labeling Recipes And Verification

Suite Storybook surface:
`apps/storybook/src/IdentityLabeling.stories.tsx`.

## Composition Recipes

Use the primitives together in product surfaces where identity and status need
to stay compact but still readable:

- Dense tables: render a visible owner name next to a decorative Avatar, a Badge
  with text and an icon for status, and an AvatarGroup with a useful `label` for
  reviewers or assignees.
- Card headers: keep the title and description as text, place AvatarGroup in the
  header action area, and use Badge only for static metadata such as "Ready",
  "AI assisted", or "4 reviewers".
- Forms: use Label with `htmlFor` and a matching control `id`; keep real
  `required`, `disabled`, and `aria-invalid` state on the control or Field
  owner. Badges may summarize validation or routing state, but they do not
  replace field errors.
- AI/chat metadata: use Avatar for a visible model, tool, or author identity;
  use Badge for model/status metadata; use AvatarGroup for human or automated
  reviewers. Keep names visible in the message header or group description.
- Narrow containers: allow names and metadata to truncate while preserving
  stable Avatar and Badge dimensions. Do not make AvatarGroup reveal the only
  path to hidden names.

## Accessibility Rules

- Prefer native semantics. Label renders a native `label` and should be
  explicitly associated with form controls through `htmlFor` and `id`.
- Identity surfaces need reliable names. If Avatar is the only identity surface,
  pass a useful `name` or `alt`. If visible adjacent text already names the
  entity, make the Avatar decorative with `decorative` and `alt=""`.
- AvatarGroup disclosure cannot be hover-only. Reveal variants must also work
  on focus, and examples must provide member names through visible text, hidden
  member lists, or another explicit non-hover path.
- Keep focus visible for every interactive composition, including
  label-associated controls and focusable AvatarGroup reveal.
- Respect reduced motion. Avatar and AvatarGroup motion is non-essential polish;
  the static and reduced-motion states must communicate the same identity and
  status.
- Do not rely on color alone. Badge statuses, invalid labels, required markers,
  warnings, destructive states, and AI/tool metadata need readable text, icons,
  programmatic state, or descriptions in addition to tone.

## Visual Coverage

The suite story covers these acceptance surfaces:

- Light mode: `OperationsSurface`.
- Dark mode and compact density: `DarkCompactSurface`.
- High contrast token override and RTL direction: `HighContrastRtlSurface`.
- Narrow containers and AI/chat metadata: `NarrowAiMetadata`.
- Dense table cells, card headers, form labels, status badges, owner avatars,
  reviewer groups, and AI metadata appear across the story set.

## Registry And Dependency Rules

Registry metadata is intentionally split by dependency boundary:

| Item           | Runtime dependencies | Registry dependencies    | CSS variables                 |
| -------------- | -------------------- | ------------------------ | ----------------------------- |
| `badge`        | none                 | `dethink-base`           | inherited from `dethink-base` |
| `label`        | none                 | `dethink-base`           | inherited from `dethink-base` |
| `avatar`       | `motion`             | `dethink-base`           | inherited from `dethink-base` |
| `avatar-group` | `motion`             | `dethink-base`, `avatar` | inherited from `dethink-base` |

Badge and Label must stay dependency-free. Avatar and AvatarGroup declare
`motion` because their current implementations import `motion/react` for
non-essential hover, focus, spread, and reveal polish. None of the four items
declare `devDependencies` or component-local `cssVars`; token expectations come
from the base registry item.

`pnpm registry:validate` now verifies the identity-labeling item files,
dependencies, registry dependencies, dev dependency boundaries, registry
dependency names, and the base CSS variable expectations used by this family.

## Verification Commands

Run these before marking the suite complete:

```sh
pnpm --filter @dethink/components exec vitest run src/components/badge src/components/label src/components/avatar src/components/avatar-group src/components/identity-labeling
pnpm --filter @dethink/components typecheck
pnpm --filter @dethink/storybook typecheck
pnpm registry:validate
pnpm exec prettier --check docs/components/identity-labeling/recipes.md apps/storybook/src/IdentityLabeling.stories.tsx packages/components/src/components/identity-labeling/identity-labeling.registry.test.ts scripts/validate-registry.mjs
pnpm --filter @dethink/components build
git diff --check
```
