# Popover, Tooltip, and DropdownMenu

Status: implemented through PRD #122.

These primitives provide the anchored overlay layer for dashboards and internal
tools:

- `Popover` for anchored interactive panels such as filters and settings.
- `Tooltip` for supplemental non-interactive help text.
- `DropdownMenu` for action menus such as row actions, toolbar actions, and
  workspace/account menus.

They are backed by React Aria Components, use the shared positioned-overlay
helpers, render through the provider-aware portal path, and inherit
`DethinkProvider` theme, density, direction, fonts, and custom `themeConfig`
tokens through the portal host.

## Installation

Registry consumers should install the base payload before copying individual
overlay primitives:

```sh
pnpm registry:validate
pnpm registry:smoke
```

Registry items:

- `popover`
- `tooltip`
- `dropdown-menu`

Each item declares `react-aria` and `react-aria-components` where required,
`dethink-base`, the shared button dependency for trigger styling, the
provider-portal helper, the positioned-overlay helper, and `cn`.

Package consumers can import from the package entrypoint:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dethink/components";
```

## Anatomy

Popover exports:

- `Popover`
- `PopoverTrigger`
- `PopoverContent`
- `PopoverArrow`
- `PopoverClose`
- `PopoverHeader`
- `PopoverFooter`
- `PopoverTitle`
- `PopoverDescription`

Tooltip exports:

- `Tooltip`
- `TooltipTrigger`
- `TooltipContent`
- `TooltipArrow`

DropdownMenu exports:

- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`
- `DropdownMenuItem`
- `DropdownMenuItemIcon`
- `DropdownMenuItemLabel`
- `DropdownMenuItemDescription`
- `DropdownMenuItemShortcut`
- `DropdownMenuSection`
- `DropdownMenuLabel`
- `DropdownMenuSeparator`
- `DropdownMenuSubmenu`
- `DropdownMenuSubmenuContent`
- `DropdownMenuArrow`

All public slots expose stable `data-slot` attributes. Overlay surfaces expose
React Aria placement and motion state attributes where available, including
`data-placement`, `data-entering`, and `data-exiting`.

## API

Shared positioning props:

- `placement`
- `offset`
- `crossOffset`
- `containerPadding`
- `shouldFlip`
- `arrowBoundaryOffset` for arrows
- `showArrow`
- `className` and slot-specific class composition props

Open-state props:

- Popover and DropdownMenu support `open`, `defaultOpen`, and
  `onOpenChange`.
- Tooltip supports `open`, `defaultOpen`, `onOpenChange`, `delay`,
  `closeDelay`, `trigger`, and `disabled`.

Dismissal props:

- Popover supports `keyboardDismissDisabled` and
  `shouldCloseOnInteractOutside`.
- DropdownMenu uses React Aria menu dismissal: item action, Escape, and outside
  interaction close by default.
- Tooltip is supplemental and closes through React Aria hover, focus, Escape,
  delay, and close-delay behavior.

DropdownMenu action props:

- Menu content accepts React Aria menu props such as `disabledKeys`,
  `selectionMode`, and `shouldCloseOnSelect` where intentionally used.
- Items support `onAction`, `disabled`, `destructive`, `id`, `textValue`, refs,
  and class composition.

## Positioning And Collision

The default overlay position contract is centralized in
`packages/components/src/utils/positioned-overlay.tsx`.

- Popover defaults to `placement="bottom"` and `offset={8}`.
- Tooltip defaults to `placement="top"` and `offset={8}`.
- DropdownMenu defaults to `placement="bottom start"` and `offset={8}`.
- DropdownMenu submenus default to `placement="right top"`,
  `offset={-2}`, and `crossOffset={-4}`.
- `containerPadding` defaults to `12`.
- `shouldFlip` defaults to `true`.

Use logical placement names such as `start` and `end` where possible so RTL
screens stay correct.

## Arrows

Popover, Tooltip, and DropdownMenu support optional arrows through `showArrow`.
Arrow slots use the shared `PositionedOverlayArrow` helper and expose a shape
slot for targeted styling.

Arrows are visual only. They do not replace accessible labels, descriptions,
or trigger text.

## Accessibility

Popover:

- Use for interactive anchored content.
- Include `PopoverTitle` for a dialog name.
- Include `PopoverDescription` when extra context helps.
- Provide an explicit close path for flows that disable keyboard dismissal.

Tooltip:

- Use only for supplemental, non-interactive text.
- Do not put buttons, links, forms, or focusable content inside Tooltip.
- Do not make Tooltip the only accessible name for an icon-only trigger. The
  trigger must have its own label.
- Do not hide required information exclusively in a tooltip, especially for
  touch users.

DropdownMenu:

- Use for actions, not value selection.
- Use Select, Combobox, or future MultiSelect for choosing values.
- Put visible menu labels inside `DropdownMenuSection` with
  `DropdownMenuLabel`; React Aria headers are section headers.
- Use `destructive` for dangerous actions and pair it with clear text.

## Keyboard And Focus

Popover:

- Trigger opens from pointer and keyboard.
- Escape closes unless `keyboardDismissDisabled` is set.
- Focus returns to the trigger after close.

Tooltip:

- Opens on hover and focus.
- Supports Escape dismissal through React Aria.
- Delay and close-delay should be tested with fake timers.

DropdownMenu:

- Trigger opens from pointer and keyboard.
- Arrow keys move between items.
- Typeahead is handled by React Aria.
- Disabled items are skipped.
- Enter and Space activate items.
- Escape closes the menu.
- Submenus open and close through React Aria submenu behavior.
- Focus returns to the trigger after close.

## Theming

These components do not accept a component-level `theme` prop. Use
`DethinkProvider` instead.

Provider-level tokens used by the overlay group include:

- `--dt-color-background`
- `--dt-color-foreground`
- `--dt-color-muted`
- `--dt-color-muted-foreground`
- `--dt-color-border`
- `--dt-color-ring`
- `--dt-color-primary`
- `--dt-color-primary-foreground`
- `--dt-color-destructive`
- `--dt-color-destructive-foreground`
- `--dt-space-*`
- `--dt-radius-*`
- `--dt-shadow-*`
- `--dt-density-control`
- `--dt-density-gap`

Component-scoped CSS variables are reserved for geometry and sizing:

- `--dt-popover-width`
- `--dt-tooltip-max-width`
- `--dt-dropdown-menu-min-width`
- `--dt-dropdown-menu-max-width`
- `--dt-dropdown-menu-max-height`
- `--dt-overlay-arrow-size`

## Density And RTL

Density is inherited through the provider portal host. Stories cover compact,
default, and comfortable density.

Direction is inherited through the portal host. Prefer logical spacing classes,
logical placement names, and start/end placements. Dropdown submenu chevrons
rotate in RTL through CSS.

## Recipes

Filter popover:

```tsx
<Popover>
  <PopoverTrigger variant="outline">Edit filters</PopoverTrigger>
  <PopoverContent className="[--dt-popover-width:24rem]">
    <PopoverHeader>
      <PopoverTitle>Report filters</PopoverTitle>
      <PopoverDescription>Narrow the invoice report.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>
```

Settings popover:

```tsx
<Popover>
  <PopoverTrigger>Workspace settings</PopoverTrigger>
  <PopoverContent>
    <PopoverTitle>Workspace settings</PopoverTitle>
    <PopoverDescription>Update dashboard defaults.</PopoverDescription>
    <PopoverClose>Done</PopoverClose>
  </PopoverContent>
</Popover>
```

Inline help tooltip:

```tsx
<Tooltip>
  <TooltipTrigger variant="outline">Retention</TooltipTrigger>
  <TooltipContent>Data is retained for 90 days.</TooltipContent>
</Tooltip>
```

Icon-only action tooltip:

```tsx
<Tooltip>
  <TooltipTrigger aria-label="Refresh report" size="icon">
    R
  </TooltipTrigger>
  <TooltipContent>Refresh report data</TooltipContent>
</Tooltip>
```

Table row action menu:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger aria-label="Open row actions" size="icon">
    ...
  </DropdownMenuTrigger>
  <DropdownMenuContent placement="bottom end">
    <DropdownMenuItem>Open row</DropdownMenuItem>
    <DropdownMenuItem>Duplicate row</DropdownMenuItem>
    <DropdownMenuItem destructive>Delete row</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Account or workspace menu:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Workspace</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuSection>
      <DropdownMenuLabel>Workspace</DropdownMenuLabel>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Sync now</DropdownMenuItem>
    </DropdownMenuSection>
  </DropdownMenuContent>
</DropdownMenu>
```

Grouped toolbar menu:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger variant="outline">View</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuSection>
      <DropdownMenuLabel>Columns</DropdownMenuLabel>
      <DropdownMenuItem>Show amount</DropdownMenuItem>
      <DropdownMenuItem>Show owner</DropdownMenuItem>
    </DropdownMenuSection>
    <DropdownMenuSeparator />
    <DropdownMenuSection>
      <DropdownMenuLabel>Layout</DropdownMenuLabel>
      <DropdownMenuItem>Compact rows</DropdownMenuItem>
    </DropdownMenuSection>
  </DropdownMenuContent>
</DropdownMenu>
```

Submenu:

```tsx
<DropdownMenuSubmenu>
  <DropdownMenuItem textValue="Move to">Move to</DropdownMenuItem>
  <DropdownMenuSubmenuContent>
    <DropdownMenuItem>Inbox</DropdownMenuItem>
    <DropdownMenuItem>Archive</DropdownMenuItem>
  </DropdownMenuSubmenuContent>
</DropdownMenuSubmenu>
```

## Testing

Required verification for this PRD:

- Component tests for public props, slots, class composition, controlled and
  uncontrolled state, provider portal inheritance, dark mode, density, RTL,
  disabled states, destructive states, focus return, and positioning props.
- Accessibility tests for labelled Popover content, accessible Tooltip
  triggers, DropdownMenu action groups, disabled items, and destructive item
  examples.
- Tooltip fake-timer tests for `delay` and `closeDelay`.
- SSR render and hydration tests for closed overlays.
- Storybook interaction tests for pointer and keyboard open/close, Escape,
  outside dismissal, Tooltip hover/focus, DropdownMenu action callbacks,
  submenus, focus return, provider portal context, reduced-motion class
  coverage, and responsive positioning smoke.
- Registry validation and registry smoke.
- Playground build smoke through package exports.

## Migration Notes

- Replace local ad hoc action popovers with `DropdownMenu`.
- Replace interactive tooltip content with Popover.
- Replace value-picking dropdowns with Select or Combobox.
- Use section labels inside `DropdownMenuSection`.
- Use provider-level theme overrides, not component-level theme props.

## Out Of Scope

- Drawer, ContextMenu, Menubar, NavigationMenu, CommandPalette, Select,
  Combobox, MultiSelect, Toast, HoverCard, and a global OverlayManager.
- Native browser Popover API, `popover="hint"`, CSS Anchor Positioning,
  interest invokers, and anchored container queries as runtime requirements.
- Interactive Tooltip content.
- Checkbox and radio menu item public APIs.
- Virtualized, async, searchable, or form-submitting menus.

## Follow-Up Cleanup

Select, Combobox, and DateTimePicker still have older overlay code paths that
predate this shared positioned-overlay helper:

- Select uses a component-specific React Aria Popover path.
- Combobox uses a component-specific explicit portal container.
- DateTimePicker uses React Aria Popover directly.

Those are stable today and remain outside PRD #122. A later cleanup PRD should
evaluate migrating them onto `DethinkPortalProvider`,
`useProviderPortalRoot`, and `positioned-overlay` only if it reduces real
duplication without regressing their listbox/calendar semantics.
