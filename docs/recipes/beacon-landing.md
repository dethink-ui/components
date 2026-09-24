# Beacon incident-response landing

A fictional product landing page at `/recipes/beacon-landing`. The hero replays a real-looking incident from alert to resolution beside a rotating headline. The centrepiece below it is a pinned, scroll-driven stage that assembles a working incident-response app from real Dethink components while a seven-step story scrolls past. Around them sit a conventional marketing flow: navigation, customer proof, feature tabs, pricing, customer stories, FAQ and a trial sign-up.

Component families used: NavigationMenu, HeroTextAnimation (rotating keyword), ScanGridBackground, Steps, AvatarGroup, IconButton, Sidebar, Breadcrumb, Card, Progress, Table, Badge, Toast, CommandPalette, Chat (ChatMessage, TypingIndicator), Tabs, Switch, CardScroller, Avatar, Accordion, Form Field, Input, Button and RevealButton.

## Installation and adaptation

Use the existing Dethink base setup and semantic tokens. Copy `beacon-landing.tsx` and its companions `beacon-hero.tsx` and `beacon-assembly.tsx` from the showcase recipe directory. The source viewer shows only the entry point, so copy the companions as well. The example uses React, Motion and Lucide.

The only recipe prop is the showcase `presentation` contract (`embedded` or `full-page`). For standalone use, remove that showcase type import. The hero headline renders the page `h1`.

The pinned stage and step cards stick below `--beacon-sticky-top` (default `0px`). Set it on an ancestor when your page has a sticky header; the showcase sets it to its site header plus the recipe toolbar.

## How the hero replay works

- A scripted incident, INC-2048, moves through five phases: triggered, acknowledged, investigating, mitigated and resolved. Each phase updates the status Badge, the Steps tracker, a latency bar chart against a dashed SLO line, the responder AvatarGroup, the elapsed time and a newest-first activity log.
- Phases advance every 2.4 seconds and the resolved state holds for 4.2 seconds before looping.
- The replay pauses automatically when the card is off-screen or the tab is hidden. Pause/play and replay IconButtons give viewers control, as required for content that moves for more than five seconds.
- The headline rotates its closing words ("every day.", "on Fridays.", "at 3am.", "at scale.") and exposes the full sentence as its accessible name.
- The scanning grid sits only behind the replay card so it never crosses the headline. Pulse rings radiate from behind the card on large screens.

## How the assembly works

- An `IntersectionObserver` watches a thin band just below the middle of the viewport and marks the step crossing it as active.
- The stage shows every layer up to the active step: blueprint placeholders, then navigation, metrics and the incident queue, a toast, the command palette, the copilot panel and a final "live" stamp.
- Layers enter with tokenized CSS transitions on transform and opacity only. Motion is used for one thing: the incident table's layout animation when it re-sorts by severity.
- The stage is a fixed 1040×640 canvas scaled to its column with a `ResizeObserver`, so it keeps desktop proportions at every width. On large screens it is vertically centred beside the story; on small screens it pins above the steps.
- The copilot reply streams on a timer after a short typing indicator. It restarts when you scroll back above the copilot step.

## Accessibility and motion

- The replay card is a labelled region ("INC-2048"). It is not a live region, so the autoplay never interrupts a screen reader; the activity log is a labelled list viewers can read at their own pace.
- With reduced motion, the replay starts paused on the resolved state with the full log, the headline keyword stays static, and the pulse rings are hidden. Pressing play still runs the replay on request.
- The reduced-motion preference is read with `useSyncExternalStore`, so the server HTML and first client render always match.
- The assembly stage is decorative: `aria-hidden="true"` and `inert`, so none of its controls can be focused or announced. The ordered step list carries the story, and the active step has `aria-current="step"`.
- Active steps are emphasised with border, ring and shadow rather than opacity, so every step keeps full text contrast.
- With `prefers-reduced-motion: reduce`, the assembly's transitions are removed, the table sorts immediately and the copilot reply appears in full.
- Navigation, feature Tabs, the pricing Switch (labelled "Monthly … Annual"), the CardScroller and the FAQ Accordion keep their Dethink keyboard models.
- The sign-up field has a visually hidden label. An invalid email sets `aria-invalid`, shows a field error and returns focus to the input. A valid email clears the field and raises a success toast.

## Data boundaries

Beacon, its customers, quotes, metrics and prices are fictional. The sign-up form sends nothing; it only raises a local toast. Replace the copy and connect a real sign-up endpoint before using this as a production page.

## Verification

`e2e/showcase-beacon-landing.spec.ts` covers gallery discovery, source and thumbnail availability, the hero replay advancing, pausing and replaying, the reduced-motion resolved start state, the stage advancing through all seven steps with `aria-current` in sync, the stage staying `aria-hidden` and `inert`, reduced-motion end states, the pricing toggle, sign-up validation and success, and an axe scan of the surface.

Manual acceptance: scroll the story slowly on desktop and a phone-sized viewport, and check that each step's layer appears as its card becomes active. Scroll back up and check that the layers retract. Repeat with reduced motion enabled, and in dark mode.

The recipe adds no new public component API or registry item.
