# ButtonGroup And DropdownButton Manual Acceptance

Run this matrix in light and dark themes, compact and comfortable density, LTR
and RTL, forced/high contrast, 200% zoom, and reduced motion.

## ButtonGroup Keyboard

- The group has a concise `aria-label` or `aria-labelledby`.
- Tab and Shift+Tab visit enabled children in DOM/visual order.
- Disabled and loading native buttons are skipped.
- Enter and Space activate only the focused child.
- Left/Right/Up/Down Arrow do not move focus between group children.
- Attached seams retain a visible focus indicator around each child.

## DropdownButton Menu Mode

- There is one visible menu button with an accurate accessible name.
- Enter and Space open the menu; supported Up/Down Arrow opening focuses the
  expected first/last item.
- Arrow keys, Home/End, and typeahead move within the menu.
- Disabled items remain discoverable but cannot activate.
- Destructive items have explicit text and are not identified by color alone.
- Escape and item activation close the menu and restore focus to the trigger.

## DropdownButton Split Mode

- The primary and separately named menu trigger are two native Tab stops.
- The icon-only menu trigger announces `menuLabel` and expanded/collapsed
  state.
- Enter/Space on the primary performs only the direct action.
- Enter/Space and supported Up/Down Arrow on the menu half open the menu.
- Left/Right Arrow does not move between the two controls.
- The menu aligns to and is at least as wide as the complete composite in LTR
  and RTL, including long labels and narrow containers.
- Escape returns focus to the menu half, not the primary half.

## DropdownButton Selectable Mode

- The selected primary and separately named menu trigger are two native Tab
  stops. The primary name always matches the selected action label.
- Opening the menu announces a single-selection action menu. Each choice is a
  `menuitemradio`; the selected choice is announced as checked and also shows a
  visible checkmark.
- Pointer, Enter, or Space selection updates the primary label and selected
  checkmark, closes the menu, and returns focus to the menu trigger without
  invoking the action handler.
- A later pointer, Enter, or Space activation on the primary half invokes only
  the currently selected handler.
- Arrow keys, Home/End, and typeahead move through choices. Disabled choices
  remain discoverable, are skipped by keyboard navigation where expected, and
  cannot replace the selected action.
- Escape cancels an open menu without changing selection and returns focus to
  the menu trigger. Reopening retains the current selected announcement.
- Controlled selection follows application state. Uncontrolled selection does
  not reset when `defaultSelectedActionId` changes after mount.
- A disabled selected action remains named and checked, disables only the
  primary half, and leaves the menu available for choosing an enabled action.
- A destructive selected action uses the destructive composite treatment; the
  action label and context communicate risk without relying on color.
- The menu aligns to and is at least as wide as the complete composite in LTR
  and RTL. Long labels/descriptions wrap without clipping at narrow widths and
  200% zoom.

## Loading And Disabled State

- `loading` retains the primary text, announces busy state, and prevents repeat
  activation.
- Default whole-composite loading disables both halves.
- Primary-only loading disables the direct action while declared-safe menu
  alternatives remain operable.
- `disabled`, `primaryDisabled`, and `menuDisabled` produce the documented
  combinations without corrupting open state.
- Selectable mode resolves current label, icon, handler, disabled, and
  destructive state by stable action ID when descriptors update; no stale
  action can execute during Motion exit.
- If an open menu becomes unavailable, it closes; focus moves to an available
  primary action when possible.
- Fixed split controlled label/icon/handler updates do not retain an old
  accessible name during Motion exit. Fixed split menu items are never
  promoted; selectable mode promotes only through its explicit selection API.

## Visual And Motion

- Attached borders and logical radii remain coherent for every relevant Button
  variant and size.
- Focus, disabled, busy, destructive, and open states remain clear in forced
  colors/high contrast.
- RTL mirrors logical seams and placements; the submenu arrow also mirrors.
- Reduced motion removes transform choreography; label and busy state remain
  immediately readable, and the menu surface uses only brief opacity feedback.
- `motionPreset="none"` leaves the busy indicator static as well as disabling
  label, icon, selected-check, chevron, and menu-surface animation.
- No state is communicated by motion alone.

## Responsive Recipe

- Below the declared container threshold, the narrow action group and overflow
  DropdownButton are visible.
- Above it, the full ButtonGroup is visible.
- Matching action IDs keep the same label, permission/disabled rule,
  destructive meaning, and handler in both representations.
- With container queries unavailable, the narrow representation remains the
  usable fallback.
- No measurement observer, automatic child hiding, or priority inference runs.

## Screen Reader Smoke

- Verify with VoiceOver/Safari and one Windows pairing such as NVDA/Firefox.
- The group relationship, split primary name, menu trigger name, busy state,
  selectable primary name, checked choice, menu item count/labels, disabled
  state, submenu expansion, and Escape focus return are announced without
  duplicate names.
- Portal content remains associated with the trigger and does not lose the
  provider theme/direction context.
