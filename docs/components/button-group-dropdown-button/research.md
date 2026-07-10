# ButtonGroup And DropdownButton Research

Status: Approved research direction; published under GitHub PRD #371.

Tracker issue: https://github.com/parveshh/dethink-components/issues/371

Research date: 10 July 2026.

## Executive Recommendation

Build ButtonGroup and DropdownButton as one action-composition family with two
separate registry items:

- ButtonGroup is a semantic layout primitive for adjacent native actions. It
  does not own selection, roving focus, action state, or responsive overflow.
- DropdownButton is a policy component that composes Button, ButtonGroup, and
  DropdownMenu. It has an explicit `menu` mode and an explicit `split` mode so
  consumers cannot accidentally blur a menu trigger and a primary action.
- The differentiation should come from semantic guardrails, independent async
  state, group-anchored menu geometry, RTL and density fidelity, and an
  intentional responsive handoff recipe rather than a larger variant catalog.
- Any animation added or changed by this component family should use Motion
  primitives from `motion/react`. ButtonGroup itself should remain static and
  should not require Motion.

This direction is more useful than creating another styling-only group or a
model-driven SplitButton monolith. It also preserves the original PRD boundary
between ButtonGroup, ToggleGroup, Toolbar, and DropdownMenu.

## Source PRD Findings

The initial Word PRD establishes the following contract:

- ButtonGroup is a P1 general component for related actions or segmented visual
  variants. It supports attached and separated modes plus horizontal and
  vertical orientation.
- Individual buttons keep their native semantics. Roving focus is only an
  optional toolbar-like concern in the initial table, and the July addendum
  later names Toolbar as the proper APG roving-focus primitive.
- ToggleGroup is explicitly distinct from ButtonGroup: ToggleGroup owns pressed
  selection state; ButtonGroup owns layout grouping.
- DropdownMenu is a P0 action-menu primitive with menu semantics, roving focus,
  typeahead, Escape dismissal, and disabled-item behavior.
- All overlays need explicit focus, dismissal, outside-interaction, and focus
  return behavior. Animation must respect reduced motion.
- Native Popover and CSS Anchor Positioning are progressive-enhancement targets,
  while the existing library-based overlay foundation remains the baseline.

Relevant source pages are 7, 9-10, 13, and 34-35 of
`react_component_library_prd.docx`.

## Current Repository Findings

The important prerequisites already exist:

- Button ships native semantics, six visual variants, six sizes, loading,
  disabled behavior, icons, `asChild`, stable slots, and shared class helpers.
- DropdownMenu ships on React Aria Components with controlled and uncontrolled
  open state, collision-aware positioning, provider-aware portals, action
  items, sections, shortcuts, submenus, disabled and destructive states, RTL,
  SSR coverage, and stable slots.
- Motion is already a package dependency and is imported from `motion/react` in
  components where motion is part of the contract.
- The current DropdownMenu surface and item feedback still use Tailwind CSS
  animation and transition utilities. A strict Motion-only interpretation for
  DropdownButton therefore requires a small migration of the reused
  DropdownMenu animation layer rather than layering Motion on top of existing
  CSS animation.

No existing GitHub PRD or implementation issue specifically covers ButtonGroup
or DropdownButton.

## Ecosystem Scan

| System       | What it provides                                                                                                                                                       | Remaining gap                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui    | A role-group wrapper, orientation, separators, text, nested groups, split and DropdownMenu recipes, and RTL examples.                                                  | Split behavior is a recipe rather than a policy component; async coordination, menu geometry, and responsive action handoff remain consumer work.   |
| Material UI  | ButtonGroup owns shared size, color, variant, orientation, and disabled styling. Its split button is a demo composed from ButtonGroup and Menu.                        | The split contract is not first-class, so accessible labeling, async behavior, and state coordination are reimplemented per product.                |
| PrimeReact   | A monolithic SplitButton with a default action, a model-driven menu, loading, disabled, variants, and documented keyboard behavior.                                    | The model API duplicates menu concerns and is less open to rich composition; loading and action policy are coupled to one component.                |
| Fluent 2     | Strong distinctions among Button, Menu Button, Split Button, Toggle Button, and Compound Button, plus useful content and accessibility guidance.                       | Guidance is excellent, but it does not solve open-code registry composition or Dethink's provider, density, SSR, and action-state contracts.        |
| Carbon       | Menu Button, Combo Button, and Overflow Menu are separated by action hierarchy and surface scale. Menu width and responsive placement guidance are unusually concrete. | The component family is design-system-specific and does not expose a small shadcn-style compositional contract.                                     |
| WAI-ARIA APG | Defines native Button, Menu Button, Menu, and Toolbar behavior.                                                                                                        | There is no special split-button role. A correct split button is two adjacent native buttons, with the second implementing the menu-button pattern. |

## Recommended Product Position

### 1. Semantic honesty

ButtonGroup should render `role="group"`, accept an accessible label, and leave
every child in the normal tab order. It should not add arrow-key navigation.
Arrow-key navigation belongs to Toolbar; pressed selection belongs to
ToggleGroup.

DropdownButton should use a discriminated public API:

- `mode="menu"`: one visible button opens a menu and performs no direct action.
- `mode="split"`: the primary button performs the dominant action and a
  separately named icon button opens related actions.

This prevents the common ambiguous component where the same visible area both
acts and opens a menu.

### 2. Composition instead of a second menu system

DropdownButton should render the existing DropdownMenu primitives internally
and accept DropdownMenu content as React children. It should not introduce a
second menu-item model, a second positioning engine, or a second portal path.

The convenience component should own only the policy that a recipe cannot
reliably enforce:

- valid menu versus split anatomy;
- required accessible naming of the split trigger;
- coordinated open, disabled, loading, variant, and size state;
- group-level geometry and state slots;
- menu anchoring to the complete composite rather than only the narrow chevron
  button.

### 3. Async continuity

Split-button loading should distinguish the primary action from the menu
trigger. A proposed `loadingBehavior` contract supports:

- `all` (default): a running primary action disables both halves, preventing
  conflicting work;
- `primary`: the primary action is busy and disabled while the menu remains
  available for explicitly safe alternatives.

The busy label remains readable, `aria-busy` is exposed on the primary button,
and the menu trigger retains its own accessible name.

### 4. Group-anchored overlay geometry

The menu should be collision-aware and align using logical start/end placement.
Its minimum width should match the full DropdownButton composite, not merely
the icon trigger. It may grow to fit longer item labels within the existing
overlay maximums. This creates a more intentional result in dense headers and
RTL layouts.

### 5. Predictable primary actions

DropdownButton should not automatically remember or promote the last selected
menu action. Products may control the visible primary label and handler when
that behavior is genuinely useful, but persistence should remain application
state. The library should not silently change the dominant action beneath the
user.

### 6. Responsive action handoff

Do not add ResizeObserver-based automatic overflow to ButtonGroup v1. That
would turn a small layout primitive into a Toolbar or action-bar system.

Instead, documentation should ship a tested recipe that changes an explicitly
declared action layout into a DropdownButton or overflow menu at a product-owned
container threshold. Labels and action IDs must remain stable across both
representations. A future ResponsiveActionGroup can own measurement and
priority if repeated product usage proves the need.

### 7. Motion as state communication

ButtonGroup has no intrinsic animation. DropdownButton may use Motion for:

- chevron rotation tied to menu open state;
- primary label or busy-indicator presence when application state changes;
- menu surface presence after the shared DropdownMenu animation path is
  migrated.

Use `motion`, `AnimatePresence`, and `useReducedMotion` or provider-level
`MotionConfig` from `motion/react`. Avoid CSS keyframes, Tailwind `animate-*`,
and `transition-*` utilities in the new or migrated paths. Reduced motion
removes transforms and preserves immediate state, focus, labels, and opacity
where useful.

## Proposed Public Shape

The exact TypeScript surface belongs in the approved PRD, but the intended
consumer shape is:

```tsx
<ButtonGroup mode="attached" aria-label="Record actions">
  <Button variant="outline">Archive</Button>
  <Button variant="outline">Duplicate</Button>
</ButtonGroup>

<DropdownButton mode="menu" label="Create">
  <DropdownMenuItem onAction={createProject}>Project</DropdownMenuItem>
  <DropdownMenuItem onAction={createWorkspace}>Workspace</DropdownMenuItem>
</DropdownButton>

<DropdownButton
  mode="split"
  label="Save"
  menuLabel="More save options"
  onPrimaryAction={save}
  loading={saving}
  loadingBehavior="all"
>
  <DropdownMenuItem onAction={saveAsTemplate}>
    Save as template
  </DropdownMenuItem>
  <DropdownMenuItem onAction={saveAndClose}>Save and close</DropdownMenuItem>
</DropdownButton>
```

## Deliberate Non-Goals

- ToggleButton or ToggleGroup selection state.
- APG Toolbar semantics or roving focus.
- A generic InputGroup or mixed input/button addon system.
- Automatic action measurement, overflow, or priority ranking.
- Built-in persistence of the last selected action.
- A new menu item model, menu role implementation, portal system, or
  positioning engine.
- Animation that communicates essential state only through movement.

## Proposed Testing Seams

These seams should be approved before the GitHub PRD is published:

1. Rendered public-behavior tests for orientation, attached/separated geometry,
   child semantics, menu/split modes, controlled open state, primary actions,
   loading behavior, disabled behavior, and group-anchored placement props.
2. Keyboard interaction tests for native Button activation, two Tab stops in
   split mode, Enter/Space and optional Up/Down menu opening, menu navigation,
   Escape close, disabled-item skipping, typeahead, and focus return.
3. Axe tests plus manual screen-reader acceptance for labelled groups, visible
   menu buttons, icon-only split triggers, busy state, destructive actions, and
   focus restoration.
4. Storybook interaction and visual coverage for menu/split anatomy, every
   Button size and relevant variant, light/dark/high-contrast modes, density,
   RTL, long labels, narrow containers, loading, disabled, open, focus-visible,
   reduced motion, and the explicit responsive handoff recipe.
5. Motion contract tests proving Motion primitives own new/migrated animation,
   reduced motion removes transform choreography, and no state is communicated
   by animation alone.
6. SSR/hydration tests for closed, default-open, menu, split, loading, and
   provider-portalled states.
7. Registry validation and clean-consumer smoke tests for separate
   `button-group` and `dropdown-button` items, accurate Button/DropdownMenu
   registry dependencies, Motion only where required, CSS variables, package
   exports, and copied-source portability.

## Research Sources

- [shadcn/ui Button Group](https://ui.shadcn.com/docs/components/base/button-group)
- [Material UI Button Group](https://mui.com/material-ui/react-button-group/)
- [PrimeReact SplitButton](https://primereact.org/splitbutton/)
- [Fluent 2 Button guidance](https://fluent2.microsoft.design/components/web/react/core/button/usage)
- [Carbon Menu Buttons](https://carbondesignsystem.com/components/menu-buttons/usage/)
- [WAI-ARIA Menu Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [WAI-ARIA Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
- [Motion for React accessibility](https://motion.dev/docs/react-accessibility)
- [Motion for React AnimatePresence](https://motion.dev/docs/react-animate-presence)
- Context7 React Aria documentation fetched 10 July 2026.
- Modern Web Guidance `resilient-context-menus-and-nested-dropdowns` fetched
  10 July 2026.
