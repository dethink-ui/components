# Timeline

Timeline displays an ordered history, process or editorial story. Events and progress default to vertical document flow. Choose an explicit canvas for pan/zoom exploration, not for short histories.

## Installation

Install `timeline` from the Dethink registry after the documented base setup. Install `timeline-feed` separately for a contained live feed; it depends on timeline. Workspace consumers import `Timeline`, `TimelineFeed` and their exported prop/data types from `@dethink/components`. Registry consumers import Timeline from `components/dethink/components/timeline` and TimelineFeed from `components/dethink/components/timeline/timeline-feed`.

The timeline registry includes React foundation dependencies, lucide-react status icons, the hydration helper and shared token styles. It does not require Motion.

## Anatomy and examples

An ordered list contains markers and event articles. Each article has a timestamp, title, description and optional image/custom content. Native selection buttons, details disclosures and rich-content actions are siblings. Selection and expansion are independent.

The showcase demonstrates activity history, progress, bordered cards, grouped release details, live feeds, canvas exploration and editorial stories. Storybook also contains interaction and theme/density examples.

## API

- `items: TimelineItemData<T>[]`: unique stable IDs, optional title/description/image, date/dateLabel, status, custom marker, details and typed data.
- `presentation`: `flow` (default) or `canvas`. Story styling always uses flow.
- `variant`: `activity` (default) or `cards`, applying to non-story flow.
- `interactive`: retains the existing default (`true` except story styling). Set false for purely informational feeds. Details still work when selection is disabled.
- `selectedId`, `defaultSelectedId`, `onSelectedIdChange`: selection remains controlled or uncontrolled.
- `details` on items or `renderDetails(item)`: flow-only detail content. The renderer takes precedence; returning null suppresses the disclosure.
- `expandedIds`, `defaultExpandedIds`, `onExpandedIdsChange`: controlled/uncontrolled multiple expansion. Default is an empty array. Disabled items cannot be toggled by the user.
- `getGroup(item)`: returns `{ id, label }` or null. Adds a heading at each contiguous group boundary after ordering. A repeated group ID separated by another group starts another heading; events never move between positions to coalesce groups. No group collapse.
- `renderItem`: custom content with typed payload access. The selection button uses the string title, or ID, as its accessible name for custom rendering.
- `mode`, `scale`, `order`: retain existing sequence/time ordering. Flow is vertically laid out; orientation controls canvas geometry. Provide `dateLabel` for locale/timezone-specific formatting.
- `viewport`: canvas pan/zoom options. Grouping, details and activity/card variants do not apply to explicit canvas.
- `reveal`, `revealOptions`: flow entrances only. Default reveal remains none; enabled entrances use 220ms duration, 60ms stagger, 6px travel. Default stagger delay caps at 300ms. Explicit interval overrides are not capped.

`TimelineFeedProps` reuses Timeline content, grouping, expansion and selection props, but fixes presentation/orientation/order/mode/layout to ascending vertical event flow. `followLatest` defaults true; `viewportClassName` overrides the default 28rem scroll viewport height. `className` styles the shell. Give each dataset its own React key when switching feeds.

## Live-feed behavior

The panel initially follows its end. Scrolling more than 48px from the end pauses following. New appended IDs increment a counter without moving the reader; Jump to latest clears it and resumes following. Scrolling back to the end also resumes following. With `followLatest={false}`, the panel initially opens at the top and does not automatically follow; jumping still works.

Edits and older-history prepends do not add unread events. The first visible event and its offset anchor detached reading across changes, details expansion and image loading. Replacement with a disjoint dataset resets the reading position. Announcements batch new-event counts over 300ms; initial history is not announced. The companion scrolls only its panel, never the page.

## Accessibility and keyboard acceptance

Tab reaches selection buttons, disclosures and embedded actions. Arrow keys and Home/End on the viewport or selection buttons focus and reveal enabled events. Left/right reverse in RTL. Embedded links, inputs and disclosures retain their own keys. External controlled selection does not steal focus. Current status uses aria-current; selection uses aria-pressed. Status has both a symbol and text.

Verify with keyboard alone: enter the timeline, reach the last enabled event with End, return with Home, expand multiple details with Enter/Space, tab into a details action, collapse controlled details and confirm focus returns to its trigger, and jump to latest without losing focus. Canvas additionally supports +/−, F for Fit and 0 for Reset. Drag the background track; cards retain text selection and nested actions.

Reduced motion disables entrances and delays. Focused pending items become visible immediately. Server/no-JavaScript markup does not activate reveal hiding. Interactive controls require JavaScript. Manual reveal is decorative, not access control: content remains in the accessibility tree and becomes visible on focus or reduced-motion preference.

## Theming and density

Uses semantic timeline rail/border, foreground/background, primary and status tokens. Activity rows use density spacing; cards and stories preserve their distinct typography. Supports light/dark, RTL and forced-colour rendering. Use CSS variables and className rather than hard-coded brand colours. Custom markers must not be the only source of meaning; custom renderers should retain meaningful titles.

## Testing and limitations

Public-behavior tests cover ordering, navigation, selection, disclosure, grouping, reveals and feed updates. Browser regressions cover reflow, focus visibility, contained scrolling and reduced/no-JavaScript behavior. Run component tests, a11y/SSR checks, typecheck/build, registry validation and clean-consumer checks before release. Screenshots and axe alone do not establish screen-reader compliance.

Canvas is a spatial exploration surface and may clip unselected neighbours intentionally. Flow is recommended for long text, variable-height details and mobile reading. Timelines are not virtualized. Search, filtering, fetching older data and error/loading states belong to the application.

## Migration

Previous event/progress defaults used canvas. Add `presentation="canvas"` to retain that layout, pan and zoom. Use `variant="cards"` for bordered flow items. Previous reveal timing can be retained with `revealOptions={{ duration: 500, interval: 200 }}`. Native selection controls replace whole-card activation; embedded content no longer accidentally selects its event. Existing public exports, typed payloads, custom markers and renderer signatures remain available.
