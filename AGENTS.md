# Repository Agent Guide

## Project Context

This repository is for Dethink Components, a React component library derived from `react_component_library_prd.docx`.

The product direction is a shadcn-compatible, open-code component system for production SaaS dashboards, internal tools, B2B applications, and AI-native React interfaces. The primary distribution model is a custom shadcn-style registry, with optional npm package exports after the registry path is stable.

Current planning artifacts may be mirrored in `docs/`, but GitHub is the source of truth for planned work:

- `docs/component-inventory.md` contains the full component, foundation, utility, and block inventory.
- `docs/development-path.md` defines the component-by-component build order.
- `docs/components/<component>/spec.md` contains the component specification.
- `docs/components/<component>/prd.md` contains the component PRD.
- `docs/components/<component>/issues.md` contains the tracer-bullet implementation issue breakdown.

The implementation scaffold now exists and should stay aligned with the PRD:

- `packages/components` contains the public `@dethink/components` package.
- `apps/storybook` contains component docs, visual states, interaction tests, and a11y checks.
- `apps/playground-vite` contains package and registry smoke checks.
- `registry/` contains shadcn-compatible registry metadata.

Keep future work aligned with the scaffold: TypeScript, React, Tailwind CSS, CSS variables, shadcn registry metadata, Storybook/docs, accessibility tests, visual tests, Vite/package builds, and Changesets.

## Planning And GitHub Workflow

Use the workflow that matches the scope of the change. GitHub PRDs and implementation issues are required for:

- new components;
- new product or component features;
- fundamental changes to public APIs, architecture, design-system foundations, distribution, or broad cross-cutting behavior.

For work in those categories:

1. Use `/Users/pm/.agents/skills/to-prd/SKILL.md` (`to-prd`) to synthesize the PRD from the current context and publish it to GitHub with the expected ready-for-agent triage label.
2. Use `/Users/pm/.agents/skills/to-issues/SKILL.md` (`to-issues`) to break the approved PRD into GitHub issues using tracer-bullet vertical slices.
3. Do not implement until the PRD exists on GitHub and the implementation issues exist on GitHub.
4. Implement only the approved GitHub issues for that PRD.

The following work may proceed directly from the user request, local notes, or a local checklist without creating a GitHub PRD or GitHub issues:

- bug fixes and regressions;
- iterative visual, interaction, responsive, accessibility, documentation, and test improvements;
- maintenance and narrow refactors that preserve the established public contract;
- follow-up polish within an already approved feature or component scope.

Create a GitHub issue for this local-work category only when the user requests it, durable tracking or external coordination is needed, or the investigation reveals that the change is actually a new feature or fundamental change. When uncertain, prefer the local workflow for narrow, reversible work that does not introduce or materially redefine public behavior.

PRD branch workflow:

1. Create a PRD branch from the current integration base using `feature/<work-item-name>`, for example `feature/prd-<prd-number>-<slug>`.
2. Create stacked issue branches for the PRD in dependency order.
3. Branch Issue 1 from the PRD branch using `feature/<work-item-name>`, for example `feature/issue-<issue-number>-<slug>`.
4. Branch Issue 2 from Issue 1, and continue stacking later issue branches from the previous issue branch unless the GitHub issue dependency graph says otherwise.
5. Keep each issue branch scoped to its GitHub issue, including code, docs, registry metadata, tests, and verification needed for that vertical slice.
6. When all issues under the PRD are complete, open the final stacked branch as a pull request targeting the PRD branch.
7. Do not open the final PR to the repository default branch unless the user explicitly asks for that release/integration step.

Branch names must be lowercase, hyphenated, and scoped to the work item. PRD work may use names such as `feature/button-variants`, `feature/issue-123-button-a11y`, or `feature/prd-45-data-table`. Local bug fixes and iterations may use a focused branch such as `fix/recipe-mobile-overflow` or continue on the current task branch when appropriate.

For PRD work, prefer thin vertical slices that include component code, docs, registry metadata, tests, and verification together. A local `docs/components/<component>/prd.md` or `issues.md` file can support that work, but it does not replace the required GitHub PRD or GitHub issues. For local fixes and iterations, keep any implementation notes proportional to the change and verify the affected behavior directly.

## Required Skills

### Modern Web Guidance

Use `.agents/skills/modern-web-guidance/SKILL.md` before implementing any HTML, CSS, client-side JavaScript, React UI, layout, forms, advanced input, scroll, motion, performance, or browser API work.

Run a search first:

```sh
npx -y modern-web-guidance@latest search "<action-oriented query>" --skill-version 2026_05_16-c5e7870
```

Then retrieve the best matching guide:

```sh
npx -y modern-web-guidance@latest retrieve "<guide-id>"
```

If results are vague or low-similarity, list guides:

```sh
npx -y modern-web-guidance@latest list
```

Apply the retrieved guidance to the implementation. Do not invent ad hoc browser behavior when a relevant guide exists. Default browser policy is Baseline Widely Available. For newer features, follow the guide's fallback or progressive enhancement recommendations unless the repo later documents a different support policy.

### Motion / Framer Motion

Use `.agents/skills/motion-framer/SKILL.md` when adding animation, micro-interactions, transitions, gesture behavior, layout animations, drag interactions, or scroll-based effects.

Motion rules for this repo:

- Prefer tokenized CSS transitions for simple, static component states.
- Use Motion when behavior is stateful, gesture-driven, sequenced, layout-aware, or hard to express cleanly in CSS.
- Animate transform and opacity properties where possible.
- Respect `prefers-reduced-motion` for all non-essential movement.
- Use `AnimatePresence` for exit animations and stable keys for animated lists.
- Use layout animations sparingly and only where they improve interaction clarity.
- Keep Motion dependencies out of components that do not need them. Registry metadata must not pull Motion into basic components unnecessarily.

### Image Generation / Mockups

Use `/Users/pm/.codex/skills/.system/imagegen/SKILL.md` when a component task benefits from generated raster visuals such as high-quality mockups, state boards, theme explorations, or product-style component previews.

Image generation rules for this repo:

- Use the built-in `image_gen` tool by default for mockups and visual explorations.
- Use imagegen for Button and other component state/theme boards when a visual decision needs approval before implementation.
- Treat generated mockups as reference material, not as implementation assets for the component itself.
- Implement final components with React, Tailwind CSS, tokens, and registry files rather than rasterizing UI into the product.
- Do not use imagegen for deterministic SVG icons, code-native diagrams, simple shapes, or visuals that should be built directly in HTML/CSS/canvas.
- If a generated image is project-bound, copy the selected output from `$CODEX_HOME/generated_images/...` into the workspace before referencing it in docs.
- Keep mockups under the relevant component docs folder, for example `docs/components/button/mockups/`.
- Do not use the imagegen CLI fallback unless the user explicitly asks for CLI/API/model control or confirms a true native-transparency fallback that requires `OPENAI_API_KEY`.

## Tailwind CSS

Use Tailwind CSS as the default styling layer for components. Treat CSS variables and Tailwind utilities as the public styling contract, not a private implementation detail.

Tailwind rules for this repo:

- Target Tailwind CSS v4 by default.
- Use the CSS-first theme model with `@import "tailwindcss";` and `@theme` for shared token definitions when building the scaffold.
- Expose semantic design tokens through CSS custom properties and Tailwind utilities so components can use names like background, foreground, border, ring, primary, destructive, muted, success, warning, info, and chart tokens.
- Keep shadcn registry `cssVars` aligned with the Tailwind theme variables and component-specific CSS variables.
- Prefer utility classes in component source for layout, spacing, typography, state, and responsive behavior.
- Use `@layer base`, `@layer components`, or `@layer utilities` only for shared reset styles, token bridges, or repeated low-level primitives that would otherwise be duplicated.
- Use a shared class name merge helper and variant recipe helper for component variants and sizes.
- Avoid dynamic class names that Tailwind cannot statically detect. Use explicit variant maps instead of interpolating class fragments.
- Use data attributes and ARIA/state selectors for component states where useful, for example `data-state`, `data-disabled`, `data-invalid`, and `aria-invalid`.
- Support light, dark, high-contrast, density, RTL, and responsive states through tokens and variants.
- Do not introduce CSS-in-JS, styled-components, Emotion, or large styling runtimes unless the component PRD explicitly justifies the dependency.
- Keep component CSS portable through registry installation. A copied component must not depend on hidden global styles except the documented base setup.

## Component Definition Of Done

A component is not complete until all relevant surfaces are handled:

- Public TypeScript API and exported prop/data types.
- Tailwind CSS implementation using tokenized CSS variables and no hard-coded brand colors.
- Light, dark, density, and responsive states where relevant.
- Accessibility behavior, labels, focus management, keyboard support, and documented limitations.
- Registry metadata with accurate files, dependencies, devDependencies, registryDependencies, and CSS variables.
- Optional package export when package builds exist.
- Docs covering overview, installation, anatomy, examples, API, accessibility, theming, recipes, testing, and migration notes.
- Storybook stories or equivalent examples for meaningful variants and states.
- Tests and verification listed below.

## Testing Requirements

Use the highest practical seam and test public behavior rather than implementation details.

Required for most components:

- Unit tests for utilities, reducers, controlled/uncontrolled state, formatting, validation, and type-driven behavior.
- Rendered component tests for public props, events, disabled states, invalid states, loading states, and keyboard behavior.
- Accessibility automation with axe or the chosen equivalent.
- Manual keyboard acceptance criteria documented for complex components.
- Storybook interaction tests for open/close, selection, form interaction, sorting, filtering, drag, or other user flows.
- Visual regression coverage for variants, sizes, light/dark mode, density, empty/loading/error states, and responsive layouts.
- Tailwind class and token coverage in stories or tests for variant maps, responsive states, dark mode, and density modes.
- SSR/hydration smoke tests for components that may render in Next.js or Vite SSR contexts.
- Registry install smoke tests in a clean consumer app to verify dependency metadata, aliases, CSS variables, and copied files.
- Package build/typecheck tests once npm package exports exist.

Advanced components need additional tests:

- Virtualization and performance fixtures for long lists, tables, grids, calendars, schedulers, and message scrollers.
- Screen-reader and focus-management smoke checks for overlays, complex widgets, and AI/chat streaming surfaces.
- Upload, editor, rich text, and file-related components must include security-oriented docs and tests for validation/sanitization boundaries where applicable.
- Motion-heavy components must verify reduced-motion behavior and avoid animation-only state communication.

When scripts exist, run the relevant checks before finalizing changes. Until scripts exist, document the expected test seams in the component PRD and implementation issue.

## Documentation Freshness

When work depends on a library, framework, SDK, API, CLI, or cloud service, use `ctx7` to fetch current documentation before answering, planning, implementing, or searching the web. Context7 must be the first documentation source for library/framework/tool behavior.

Always use Context7 while logged in:

```sh
npx ctx7 whoami
```

If this does not report a logged-in user, do not silently continue with anonymous Context7 requests. Run or ask the user to run:

```sh
npx ctx7 login
```

For CI or non-interactive environments, use `CONTEXT7_API_KEY` instead. Logged-in Context7 has higher limits and is the expected mode for this repository.

Documentation lookup workflow:

1. Check login status with `npx ctx7 whoami`.
2. Resolve the library first:

   ```sh
   npx ctx7@latest library "<official library name>" "<user's full question>"
   ```

3. Pick the best matching Context7-compatible library ID.
4. Fetch docs:

   ```sh
   npx ctx7@latest docs <libraryId> "<user's full question>"
   ```

5. If the answer is incomplete, retry once with `--research`.
6. Search the web only after Context7 has been tried first, or when the task is not documentation/API/library/tool guidance.

Do not include secrets, API keys, passwords, or private credentials in Context7 queries. For version-specific work, use the versioned library ID from Context7 when available.

## Git And Files

- Do not revert user changes.
- Keep edits scoped to the component, docs, or tooling slice being worked on.
- Use `rg` for searches.
- Prefer `apply_patch` for manual edits.
- Do not commit unless the user asks.
- When committing, use Conventional Commits, for example `feat: add button variants`, `fix: correct focus ring state`, `docs: update component API`, `test: cover disabled state`, `chore: update registry metadata`, or `refactor: simplify variant map`.
