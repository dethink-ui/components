# Recipe Alignment Follow-up Issues

## Status

- Parent PRD: [#405 — Resolve remaining recipe alignment defects](https://github.com/parveshh/dethink-components/issues/405).
- Audit evidence: `/tmp/dethink-recipe-alignment-audit-2026-07-11`.
- Implementation order follows the stacked issue branches below.

## Local Issue 1 — Security Mobile Proof Clipping

- GitHub: [#406](https://github.com/parveshh/dethink-components/issues/406).
- Status: Completed.
- Correct the clipped monitoring badge and missing separation in the response-team proof.
- Verify at 1440×900 and 390×844, including reduced motion and overflow.

## Local Issue 2 — Checkout Plan-State Indicators

- GitHub: [#407](https://github.com/parveshh/dethink-components/issues/407).
- Status: Completed.
- Give “Most popular” and the selected check distinct, non-overlapping layout positions.
- Verify plan changes, keyboard radios, and desktop/mobile geometry.

## Local Issue 3 — Scheduler Public Preview Header

- GitHub: [#408](https://github.com/parveshh/dethink-components/issues/408).
- Status: Blocked by Local Issue 2 in the branch stack.
- Keep the booking title, navigation, and Week/Day controls legible in the narrow preview rail.
- Verify the main planner width and the public preview at desktop and mobile sizes.

## Local Issue 4 — Login Mobile Task Priority

- GitHub: [#409](https://github.com/parveshh/dethink-components/issues/409).
- Status: Blocked by Local Issue 3 in the branch stack.
- Put the sign-in form first in mobile DOM and visual order while retaining marketing-left/form-right desktop placement.
- Verify keyboard order, responsive geometry, and full content retention.

## Shared Definition of Done

- Affected thumbnails refreshed.
- Desktop and mobile production-route screenshots visually accepted.
- Focused geometry and interaction regression coverage added.
- Existing themes, reduced motion, forced colors, axe scans, and full showcase journeys remain green.
