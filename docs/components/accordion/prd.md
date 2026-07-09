# Accordion PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/321.

Package target: `@dethink/components`.

## Problem Statement

Dethink Components needs a P0 vertical Accordion for production SaaS
dashboards, internal tools, B2B applications, and AI-native React interfaces.
The source component-library PRD lists Accordion as a required Disclosure
primitive, but the repository currently only has `HorizontalAccordion`, which
solves a different spatial pattern. Teams need a distinctive, token-backed,
accessible Accordion whose expanded content remains inside rounded blade
containers instead of looking like a generic internet accordion.

## Solution

Create an `Accordion` component family as a vertical rounded-blade disclosure
component. Each blade contains a native button trigger and, when open,
arbitrary content inside the same rounded container. The component supports
single-open and multiple-open modes, controlled and uncontrolled state,
icon/text blade composition, Motion-powered layout and presence animation,
reduced-motion behavior, Storybook coverage, accessibility tests, SSR safety,
package exports, and shadcn-compatible registry metadata with the Motion
dependency declared.

## User Stories

1. As a product engineer, I want a rounded-blade Accordion, so that disclosure sections feel distinctive and polished.
2. As a developer, I want arbitrary content inside an expanded blade, so that forms, lists, media, and custom layouts work.
3. As a developer, I want icon and text blade composition, so that each section can communicate quickly.
4. As a developer, I want single-open mode, so that dense pages can keep only one section expanded.
5. As a developer, I want multiple-open mode, so that users can compare several sections at once.
6. As a user, I want clicking an open blade to close it, so that I control what remains visible.
7. As a keyboard user, I want Tab, Enter, Space, ArrowUp/Down, Home, and End support.
8. As a screen-reader user, I want accurate expanded/collapsed state and labelled content regions.
9. As a motion-sensitive user, I want reduced-motion behavior with equivalent visual state.
10. As a registry user, I want accurate Motion dependency metadata, so installation works first time.

## Implementation Decisions

- Component family: `Accordion`, `AccordionItem`, `AccordionBlade`,
  `AccordionBladeIcon`, `AccordionBladeText`, and `AccordionContent`.
- All parts are exported as both static properties on `Accordion` and named
  exports from the package.
- Root props include `type`, `value`, `defaultValue`, `onValueChange`,
  `collapsible`, `disabled`, `motionPreset`, `className`, `style`, and native
  div props.
- Single mode uses `string | undefined` values. Multiple mode uses `string[]`
  values.
- Single mode defaults to collapsible. Multiple mode always allows each open
  blade to close on click.
- Blades render native buttons with `aria-expanded` and `aria-controls`.
  Contents render labelled regions with `aria-labelledby`.
- Closed content unmounts by default after exit handling; `forceMount`
  preserves content DOM while hidden.
- Motion is required: `LayoutGroup`, `MotionConfig`, `motion`, and
  `AnimatePresence` power layout, content presence, icon rotation, and
  hover/press feedback.
- Styling is Tailwind-first and token-backed. No hard-coded brand colors,
  CSS-in-JS, or additional styling runtime.
- Public styling/testing attributes include `data-slot`,
  `data-state="open|closed"`, `data-disabled`, `data-motion-preset`, and
  `data-orientation="vertical"`.
- Registry metadata declares `motion` and depends on `dethink-base`.
- This component remains separate from `HorizontalAccordion`; no horizontal
  blade tray, compact horizontal layout, or tabs-like interaction model.

## Testing Decisions

- Behavior tests cover controlled/uncontrolled state, single vs multiple mode,
  active-blade close, non-collapsible single mode, disabled items,
  `forceMount`, callbacks, and composition errors.
- Keyboard tests cover ArrowUp/Down focus movement, Home/End movement,
  disabled skipping, and focus return when content closes around focused
  content. Enter and Space are covered through native button activation.
- Accessibility automation covers text, icon + text, icon-only, disabled,
  single, and multiple compositions.
- SSR tests cover closed and open server-rendered markup without browser-only
  access during render.
- Registry validation, package typecheck, Storybook, and playground smoke
  checks gate the installable surface.

## Out of Scope

- Replacing or merging with `HorizontalAccordion`.
- Flat classic accordion visual variant in v1.
- Horizontal blade tray, compact horizontal fallback, or tabs-like semantics.
- Persisting open state to URL/router or storage.
- Drag/reorder behavior.
- New headless primitive dependencies beyond Motion.

## Further Notes

- GitHub implementation issues: #322 through #326.
- The default visual style is the rounded-blade treatment.
- Motion documentation supports using `LayoutGroup` for accordion sibling
  layout coordination, `AnimatePresence` for exit animation, and
  `MotionConfig` for reduced-motion preferences.
