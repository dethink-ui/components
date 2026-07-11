# Settings and Billing Recipe — Implementation Notes

## Status

- GitHub PRD: [#402 — Refine settings and billing recipe alignment](https://github.com/parveshh/dethink-components/issues/402).
- Implementation slice: [#403 — Tighten settings and billing recipe spacing and state alignment](https://github.com/parveshh/dethink-components/issues/403).

## Observed Problems

- The Form primitive already renders a tokenized grid gap, while the recipe also applied `space-y-6`. Those independent spacing systems accumulated between every child and stretched the form vertically.
- The workspace identity block and plan summary were bottom-aligned, placing the plan badge beside the description instead of the title line.
- The current-plan summary duplicated the plan name instead of deriving it from the controlled radio-group state.
- Plan price and cadence text could wrap independently from the option title at constrained widths.
- The mobile single-column grid used an implicit auto-sized track, allowing a child minimum width to expand the settings card beyond the recipe canvas where it was clipped rather than reflowed.

## Implementation Decisions

- Use the Form primitive's `spacing="md"` contract as the only gap between General, Feature controls, Approvals, dividers, and the save row.
- Keep local `gap-4` group spacing inside each section, where proximity communicates the heading-to-control relationship.
- Align the header from the top and offset the desktop plan summary to the title line while leaving mobile stacking in document order.
- Align the stacked mobile plan summary with the workspace title column using logical inline padding.
- Derive the current-plan label from the controlled radio value and announce changes politely.
- Keep plan price and cadence together without changing radio semantics or the existing responsive grid.
- Define the base content track as `minmax(0, 1fr)` and allow both columns to shrink with `min-w-0`, so narrow layouts reflow without hidden overflow.

## Test Seams

- Workspace and Plan card top-edge alignment at desktop width.
- Compact Form height as a regression guard against doubled spacing.
- Initial Growth selection, current-plan agreement, and a Starter selection update.
- Mobile header stacking and document-level overflow.
- Mobile workspace and plan panel bounds, guarding against content that is clipped before it reaches the document scroll width while preserving the invoices table's intentional internal scroll container.
- Existing recipe keyboard, reduced-motion, theme, and axe coverage.
