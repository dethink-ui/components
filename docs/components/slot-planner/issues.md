# SlotPlanner Implementation Issues

Status: Published to GitHub issue tracker.

Parent PRD: https://github.com/parveshh/dethink-components/issues/242

All issues carry the `ready-for-agent` label and are AFK tracer-bullet
vertical slices, stacked linearly in dependency order.

| # | Issue | Title | Blocked by |
| - | ----- | ----- | ---------- |
| 1 | [#243](https://github.com/parveshh/dethink-components/issues/243) | JSON contract, types, fixtures, and docs skeleton | None |
| 2 | [#244](https://github.com/parveshh/dethink-components/issues/244) | Core week view manage mode (read and navigate) | #243 |
| 3 | [#245](https://github.com/parveshh/dethink-components/issues/245) | Slot editor, CRUD callbacks, and recurrence | #244 |
| 4 | [#246](https://github.com/parveshh/dethink-components/issues/246) | Constraints engine, cap meter, and copy operations | #245 |
| 5 | [#247](https://github.com/parveshh/dethink-components/issues/247) | Custom renderers and headless hook | #246 |
| 6 | [#248](https://github.com/parveshh/dethink-components/issues/248) | Motion layer | #247 |
| 7 | [#249](https://github.com/parveshh/dethink-components/issues/249) | Book mode SlotPicker | #248 |
| 8 | [#250](https://github.com/parveshh/dethink-components/issues/250) | Registry, Storybook, a11y, SSR, and package export | #249 |

## Slice summaries

1. **Contract docs (#243)** — public JSON contract and exported types (slot
   record core + open `data` bag, constraints, taxonomy, callback payloads),
   canonical JSON fixture module, docs skeleton, inventory/development-path
   updates.
2. **Core week view (#244)** — week/day views from JSON: toolbar + week nav,
   day rail with summaries and arrow-key selection, day panel with slot
   cards, recurrence expansion (wall-clock + IANA zone), taxonomy defaults,
   controlled/uncontrolled collections, empty/past/locked presentation.
3. **Editor + CRUD (#245)** — Dialog slot editor, create/edit/delete with
   occurrence-vs-series semantics and per-occurrence overrides, JSON callback
   payloads, promise-driven pending/error affordances, focus management,
   live announcements.
4. **Constraints + copy (#246)** — exported Motion-free constraints utility
   (caps, buffer-aware overlap, duration, notice, horizon, blackouts,
   DST-gap detection), inline violation surfacing, cap meter, copy day/week,
   clear day with batch payloads.
5. **Renderers + headless (#247)** — render props over every surface with
   typed context and `renderDefault`, `data`-bag passthrough, exported
   headless hook, accessibility invariants protected from overrides.
6. **Motion (#248)** — directional week transitions (RTL-correct),
   shared-layout day selection indicator, slot enter/exit + layout settling,
   copy stagger, animated cap meter; reduced-motion collapse; Motion kept
   out of headless/constraints modules.
7. **Book mode (#249)** — SlotPicker with viewer-timezone display,
   book-request JSON callback, unavailable/full/expired states, remaining
   seats for capacity > 1, shared taxonomy/renderers.
8. **Distribution (#250)** — registry metadata + install smoke, package
   export, full Storybook coverage, SSR smoke, visual regression, final
   docs per the component definition of done.
