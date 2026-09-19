# Component interaction and visual quality review

Date: 18 September 2026

The strongest opportunity is to bring everyday controls up to the standard of the existing animated navigation and disclosure components. The library already contains shared-layout indicators, spring presets, reduced-motion paths, and offscreen handling for decorative effects. Consistent feedback, stable geometry, and reliable first rendering should come before adding more effects.

This records the original review and proposed improvement order. The implementation follow-up below records the changes subsequently completed.

## Scope and evidence

- Surveyed the source and motion patterns across 76 component/support directories, with focused reads of controls, overlays, navigation, feedback, motion utilities, foundation configuration, registry metadata, and selected tests.
- Inspected the local showcase in Chromium: Button, Switch, Dialog, Tabs, Accordion, NavDock, Checkbox, and AuroraBackground. Sampled light and dark examples, a 390px Switch viewport, and a fresh Tabs load with reduced motion enabled.
- Sampled rendered positions, dimensions, and animation state for Switch, Button, and Dialog.
- Consulted current Motion documentation through authenticated Context7 and the repository's Modern Web Guidance CSS guide.
- This was a representative review. It did not measure production bundle sizes, frame-time budgets on physical devices, or full Safari/Firefox compatibility. No full test suite was run because this change only records the review.

## Findings to address first

### 1. Reduced-motion Tabs changes structure during hydration — P1

A fresh `/components/tabs` load with reduced motion enabled produced a hydration failure. A fresh normal-motion load did not. The browser diff included the Tabs panel wrapper: the server rendered `data-slot="tabs-panel-content"`, while the first client render put the example content directly inside the panel.

[Tabs motion preference](/Volumes/Projects/dethink-components/packages/components/src/components/tabs/tabs.tsx:495) reads the preference immediately, and [TabsPanel](/Volumes/Projects/dethink-components/packages/components/src/components/tabs/tabs.tsx:912) uses it to choose different element structures. The existing [SSR test](/Volumes/Projects/dethink-components/packages/components/src/components/tabs/tabs.ssr.test.tsx:9) uses `motionPreset="none"`, which bypasses this case. The same page also reported reduced-motion attribute/style differences in RevealButton, DropdownMenu, and the documentation navigation; those need separate checks before assigning a common root cause.

**Recommendation:** keep the initial server/client structure stable and coordinate motion readiness after hydration. Ensure the reduced-motion CSS path prevents spatial movement immediately. Test the default preset with reduced motion set before page load, and fail on hydration errors. Preserve the existing panel-state and focus behavior.

### 2. Switch thumb snaps instead of sliding — P2

The live unchecked-to-checked transition moved the thumb from x=577.5 to x=595.5 on the first sampled frame, with no intermediate positions over the following 234ms. [The thumb styles](/Volumes/Projects/dethink-components/packages/components/src/components/switch/switch.tsx:48) change `margin-inline-start` to `auto`, while trying to transition `margin`.

**Recommendation:** give the thumb a stable layout position and animate a numeric translation calculated from the existing track and thumb size tokens. Use an RTL-aware direction, a quick 160–200ms settle, and immediate positioning under reduced motion. This can remain CSS-only. An optional 1–2px thumb compression during a press would add tactility after the travel is corrected.

### 3. Dialog has no effective entrance animation — P2

The opening Dialog had opacity 1, no translation/scale, and zero active element animations throughout the sampled 266ms. [Its enter styles](/Volumes/Projects/dethink-components/packages/components/src/components/dialog/dialog.tsx:125) specify the same opacity as the resting state. Its exit utilities also use individual `translate` and `scale` properties, while the declared transition lists `transform`.

**Recommendation:** use explicit entering/resting/exiting states with approximately 4–8px travel and scale 0.98 → 1; enter over 180–220ms and exit over 120–160ms. Match the transition property list to the generated CSS, or use the existing CSS keyframe approach from positioned overlays. Preserve focus trapping, Escape behavior, and focus restoration. Verify rapid close/reopen as well as a complete open/close cycle.

### 4. Loading feedback shifts Button geometry — P2

In the showcase, “Save changes” measured 127.8px wide and “Saving…” measured 116.2px wide. Both the example's label change and [Button's conditional spinner insertion](/Volumes/Projects/dethink-components/packages/components/src/components/button/button.tsx:128) contribute to changing intrinsic width. A text-only button with unchanged text gains a spinner slot and gap on loading.

**Recommendation:** preserve the action's footprint through idle, loading, and completion. For the default control, overlay/crossfade visual content while retaining a sizing layer; examples with changing labels should reserve space for their longest state. Add a subtle press response, around scale 0.98, to Button and IconButton. Provide equivalent keyboard feedback, and keep disabled/loading controls inert. Success feedback belongs to the owning action or an approved recipe.

### 5. Dark overlays lighten the page — visual refinement

The dark Dialog screenshot visibly washes the surrounding page toward light gray. [Dialog](/Volumes/Projects/dethink-components/packages/components/src/components/dialog/dialog.tsx:126) and [Drawer](/Volumes/Projects/dethink-components/packages/components/src/components/drawer/drawer.tsx:242) derive the scrim from `foreground`, which becomes light in dark themes.

**Recommendation:** use a dedicated overlay/scrim color role so dimming is independently art-directed in each theme. Tune the panel border and shadow alongside it. This should create a clear foreground surface without flattening the whole screen. The sampled light controls also stack light borders, near-white surfaces, and small shadows; review the elevation hierarchy together so inputs, selected controls, cards, and floating surfaces remain distinct.

## Proposed motion direction

Aim for quick acknowledgment, a controlled settle, and restrained travel. Use a common set of semantic timing and easing values while allowing the amount of movement to suit the size and purpose of each component.

The following are starting values for visual tuning, not measured performance guarantees:

| Role                        | Starting timing               | Character                                 |
| --------------------------- | ----------------------------- | ----------------------------------------- |
| Press acknowledgment        | 80–120ms                      | Small compression; immediate state update |
| Hover, border, checkmark    | 140–180ms                     | Smooth ease-out, no delay                 |
| Indicator or small overlay  | 180–240ms                     | Tight settle, little overshoot            |
| Drawer or larger disclosure | 240–320ms                     | Slightly more weight; interruptible       |
| Exit                        | Usually shorter than entrance | Clear the view promptly                   |
| Reduced motion              | Immediate or brief opacity    | Stable geometry, readable state           |

There is already a shared CSS spring and overlay animation in [styles.css](/Volumes/Projects/dethink-components/packages/components/src/styles.css:48), while Tabs, Accordion, Drawer, Toast, and NavDock each have local motion settings. Consolidate common intent first. A spring appropriate for a small navigation marker should not blindly drive a full-width panel.

## Component improvements by family

| Component family                                         | Existing foundation                                       | Recommended refinement                                                                                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button / IconButton / ButtonGroup                        | Color feedback; loading and disabled semantics            | Subtle press/release, stable loading width, icon crossfade. Keep grouped edges stationary.                                                                                                      |
| Switch / Checkbox / RadioGroup                           | Native input semantics; tokenized color changes           | Transform-based thumb travel; persistent checkmark/dot layers with short opacity/scale transitions. Keep the label and focus ring still.                                                        |
| Input / Textarea / NumberInput / FormField               | Focus and invalid styling                                 | Consistent focus treatment; brief error-message reveal; reserve predictable message space where appropriate. Avoid shaking forms.                                                               |
| Select / Combobox / AsyncSelect                          | Existing positioned-overlay infrastructure                | Consistent chevron rotation and popup origin; stable popup size during loading; quiet empty/loading/result changes. Keep typing immediate.                                                      |
| MultiSelect / TagInput                                   | Token and field styling                                   | Small chip entrance/removal, preserved input focus, and controlled local reflow. Prefer a lightweight CSS entrance; evaluate presence/layout support only where removal continuity warrants it. |
| Tabs / Steps / Sidebar / NavigationMenu                  | Moving indicators and existing motion presets             | Align settle speed and distance; check repeated rapid navigation. For Tabs, fix hydration first, then evaluate unequal panel heights without delaying selection.                                |
| Accordion / HorizontalAccordion                          | Expansion, icon rotation, and local presets already exist | Tune reversal midway through expansion, long content, nested focus, and coordinated opacity. Preserve natural text size during expansion.                                                       |
| Dialog / Drawer / Popover / Tooltip / DropdownMenu       | Accessible overlay primitives and exit handling           | Complete Dialog entrance; consistent depth, scrim, origin, and quicker exits. Tooltips should use less travel than a dialog.                                                                    |
| Toast / Alert / Progress / Skeleton                      | Toast presence/layout motion; loading states              | Consistent toast stack settling; calm loading rhythm; transform-based linear progress where useful; stable skeleton-to-content geometry.                                                        |
| Card / CardStack / CardScroller / Carousel               | Static Card plus richer specialist compositions           | Add lift only to clearly interactive cards; tune specialist surfaces for interrupted gestures and touch. Keep reading content stable.                                                           |
| Calendar / Pagination / DataTable                        | Existing state and hover styling                          | Brief month/content changes, sort-direction feedback, selection feedback, and focused row updates. Avoid animating every table row during filtering.                                            |
| Avatar / AvatarGroup / Badge                             | Existing identity and group motion                        | Consistent overlap/elevation and short status changes; avoid recurring motion around names.                                                                                                     |
| NavDock / RevealButton / HeroTextAnimation / backgrounds | Expressive motion already exists                          | Keep these as the more expressive end of the system. Tune pointer and touch behavior, text readability, and rendering cost before increasing effect strength.                                   |
| Layout primitives / Typography / Separator               | Stable composition building blocks                        | Keep defaults steady; place movement in the component that owns the interaction.                                                                                                                |

## Optimization priorities

1. **Preserve lightweight primitives.** Button, IconButton, Checkbox, Switch, and Dialog registry entries currently avoid a Motion dependency. Their proposed basic feedback can remain CSS-only. Use Motion for shared layout, interruptible gestures, and coordinated presence.
2. **Measure consumer bundles.** Compare a clean Button-only install with Tabs, NavDock, and the full showcase. A root package dependency alone does not establish what a consumer ships. Explore `LazyMotion` plus `m` only after measurement, with the appropriate feature set: `domAnimation` does not include layout/drag support. Do not wrap existing full `motion` imports and assume this shrinks them. See [Motion's bundle guide](https://motion.dev/docs/react-reduce-bundle-size).
3. **Reduce avoidable layout work.** [Progress](/Volumes/Projects/dethink-components/packages/components/src/components/progress/progress.tsx:223) currently animates width. Consider a transform-based fill, preserving rounded caps and RTL. Disclosure height changes are sometimes necessary; bound and profile them instead of scaling text. Small color changes on controls are reasonable.
4. **Manage promoted layers deliberately.** [CardStack](/Volumes/Projects/dethink-components/packages/components/src/components/card-stack/card-stack.tsx:64) applies `will-change-transform` permanently. Profile large stacks and release hints at rest where useful. [HeroTextAnimation already has a rest-state cleanup pattern](/Volumes/Projects/dethink-components/packages/components/src/components/hero-text-animation/hero-text-animation.tsx:534). See [browser animation performance guidance](https://web.dev/articles/animations-guide).
5. **Build on the existing offscreen policy.** Background sources already gate motion using hydration, reduced motion, and IntersectionObserver. Extend profiling to hidden tabs and pages with multiple effects. Assess blur area, layer count, and density on actual mobile hardware before choosing stronger defaults.
6. **Make reduced motion consistent across CSS and JS.** Disable nonessential spatial motion while retaining visible feedback. A `MotionConfig` policy covers Motion components; CSS animations need their own media-query behavior. See [Motion accessibility guidance](https://motion.dev/docs/react-accessibility).

## Verification needed for implementation

- Check real intermediate frames, not just the presence of a transition class. Switch and Dialog illustrate why that matters.
- Add fresh-page hydration coverage for default presets with reduced motion set before load; cover initial-open overlays as well.
- Compare control bounds through loading/complete states and check neighboring content for movement.
- Exercise rapid repeat clicks, reversing an animation, close/reopen, keyboard focus, disabled states, RTL, and coarse pointers.
- Capture light/dark, compact/default density, mobile, and forced-colors states. Keep a normal-motion interaction pass alongside static screenshots taken with motion disabled.
- Profile production builds under CPU throttling and on representative devices. Set frame-time and bundle budgets from those measurements; this review does not establish an FPS or byte baseline.

## Suggested implementation order

1. Fix reduced-motion hydration, Switch travel, and Dialog entrance.
2. Polish Button/IconButton loading and pressing, then Checkbox/RadioGroup state changes and overlay depth.
3. Consolidate internal timing/easing values and tune navigation/disclosure transitions against the same reference examples.
4. Refine async feedback, chips, calendar changes, and interactive card recipes.
5. Measure consumer bundle cost and profile decorative effects before further optimization.

The first two batches fit the repository's local bug-fix and visual-polish workflow where existing public behavior is preserved. A new public motion provider/configuration API, new interaction feature, or changed distribution contract should follow the repository's GitHub PRD and implementation-issue workflow.

## Implementation follow-up

Completed the existing-contract polish pass on `codex/component-interaction-polish`. See [component motion](../component-motion.md) for the resulting behavior, token values, and verification commands.

The first five findings are addressed: stable reduced-motion hydration; numeric RTL-aware Switch travel; effective Dialog entrance/exit and browser initial focus; loading-button geometry; and an independent dark scrim. Control indicators, error/chip/status reveals, interactive Card feedback, calendar changes, sort arrows, and progress received restrained feedback. Backgrounds stop their animated subtree while hidden, and CardStack no longer carries permanent layer hints. Existing advanced navigation/disclosure presets remain available; no new Motion dependency was added to the basic controls.

Browser verification also found that `display: contents` prevented Dialog from receiving initial focus. A real panel box now receives focus, and Escape works immediately after opening. A moving documentation search trigger could dismiss its popup during filtering; its entrance now fades without moving the anchor. Mobile property tables are keyboard-scrollable.

### Consumer bundle measurements

The original single-file package build kept unrelated component initialization reachable. The build now preserves internal modules and externalizes declared dependencies, retaining the same public package and CSS exports. This matches the source/registry path's ability to discard unused modules.

An esbuild consumer probe (minified ESM, production mode, React/React DOM external, CSS excluded) measured:

| Import  | Before build fix, gzip bytes | After build fix, gzip bytes |
| ------- | ---------------------------: | --------------------------: |
| Button  |                      345,686 |        approximately 10,300 |
| Tabs    |                      345,701 |                      53,184 |
| NavDock |                      345,698 |                      64,198 |

The committed Vite consumer probe has its own consistent byte budgets and measured 10,339 / 52,240 / 62,941 gzip bytes respectively. The Button probe also rejects retained Motion, React Aria, or table runtimes. These are component/dependency JS costs, not whole-page transfer sizes. The package stylesheet remains separate. A LazyMotion migration was unnecessary for the measured basic-control dependency leak.

### Verification results

- All 266 component test files passed: 2,320 tests, including accessibility and SSR suites.
- All 13 focused browser checks passed: motion, keyboard selection/focus, RTL, loading geometry, reduced-motion hydration, documentation navigation, and a seven-page mobile dark-mode accessibility sweep.
- Package, playground, and Storybook builds passed; component, showcase, and Storybook typechecks passed.
- Registry validation and smoke checks passed for 75 items. The shared text utility missing from copied selection components is now included by the base registry item.
- Sampled Aurora inline transforms changed after its stagger delay, became static when document visibility was set to hidden, and resumed on return. The shared visibility hook also has a pause/resume test.
- Changed-file lint has no errors; existing repository warnings remain. Formatting and diff whitespace checks passed.

No Safari/Firefox or physical-device frame-rate claim is made. Broader gesture tuning, dynamic panel-height choreography, chip removal presence, and stronger decorative effects remain profiling/design follow-ups rather than blanket changes to every component.
