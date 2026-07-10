# ButtonGroup And DropdownButton Verification

Verified on 2026-07-10 from the final stacked issue branch.

## Passing Gates

- workspace TypeScript typecheck;
- focused Button, ButtonGroup, DropdownMenu, and DropdownButton rendered,
  Motion, SSR, responsive, and accessibility tests: 102 tests across 7 files;
- full accessibility suite: 150 tests across 68 files;
- registry schema validation: 66 items;
- registry dependency and copied-source portability smoke;
- package declaration/production build and Vite clean-consumer build;
- Storybook production build;
- showcase Next.js production build and static generation for the ButtonGroup
  and DropdownButton routes;
- built-Storybook browser execution of the existing DropdownButton flows plus
  five selectable `play` flows: choose-then-execute, controlled selection,
  short/long label width changes, disabled/loading/destructive policies, and
  disabled-choice/Escape focus return;
- built-Storybook computed geometry confirms exact primary/trigger height pairs
  of 28, 32, 40, 44, and 48 pixels for `xs` through `xl`; a browser trace
  confirms Motion interpolates the label viewport from 42 to 375 pixels;
- closed/open source-to-implementation visual comparisons at matched component
  scale with a passing project-root `design-qa.md` record;
- ESLint (exit 0 with the repository's existing warning baseline), Prettier on
  every changed file, and `git diff --check`.

## Documented Repository Blocker

The complete `@dethink/components` unit suite has one reproducible failure in
the pre-existing Sidebar test `Sidebar > animates the mobile drawer out before
unmounting`. The test expects the dialog to remain mounted immediately after
Escape, but the current Sidebar Motion path has already removed it. Neither
Sidebar source nor Sidebar tests differ between the PRD base and this stack.

This blocker does not affect the ButtonGroup, DropdownMenu, or DropdownButton
family: the focused 102-test selection passes, as does the full accessibility
suite. Fixing Sidebar's exit-test contract remains outside issues #376 and
#381.
