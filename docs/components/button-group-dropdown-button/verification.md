# ButtonGroup And DropdownButton Verification

Verified on 2026-07-10 from the final stacked issue branch.

## Passing Gates

- workspace TypeScript typecheck;
- Button, ButtonGroup, DropdownMenu, and DropdownButton rendered, Motion, SSR,
  responsive, and accessibility tests: 89 tests across 13 files;
- full accessibility suite: 148 tests across 68 files;
- registry schema validation: 66 items;
- registry dependency and copied-source portability smoke;
- package declaration/production build and Vite clean-consumer build;
- Storybook production build;
- showcase Next.js production build and static generation for the ButtonGroup
  and DropdownButton routes;
- built-Storybook browser execution of eight DropdownButton `play` flows:
  menu, split, async, controlled primary, controlled open, responsive handoff,
  Motion presets, and reduced motion;
- ESLint (exit 0 with the repository's existing warning baseline), Prettier on
  every changed file, and `git diff --check`.

## Documented Repository Blocker

The complete `@dethink/components` unit suite has one reproducible failure in
the pre-existing Sidebar test `Sidebar > animates the mobile drawer out before
unmounting`. The test expects the dialog to remain mounted immediately after
Escape, but the current Sidebar Motion path has already removed it. Neither
Sidebar source nor Sidebar tests differ between the PRD base and this stack.

This blocker does not affect the ButtonGroup, DropdownMenu, or DropdownButton
family: their complete 88-test selection passes, as does the full accessibility
suite. Fixing Sidebar's exit-test contract is intentionally outside issue #376.
