# Chat component family

Status: Approved for implementation. Published PRD: [#446](https://github.com/parveshh/dethink-components/issues/446).

Package target: `@dethink/components`.

## Product direction

A complete, polished AI conversation surface composed from independently useful components. Support a full workspace, an embedded copilot panel, and individual message/composer primitives. Keep AI providers, network transport, tool execution, and persistence in the consuming application.

This work brings the AI / Chat family forward from the roadmap at the user's request. It extends the existing component library; it does not replace the support inbox or turn the showcase into a hosted AI service.

## Anatomy

| Export                        | Responsibility                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Chat                          | Scope for conversation identity, labels, current run, and composition; convenient full conversation layout.               |
| PromptInput                   | Growing multiline composer, suggestions, attachment tray, model/action slots, send and stop controls.                     |
| ChatMessage                   | Named user/assistant/system message with stable identity, status, content, and actions.                                   |
| MessageContent                | Readable text and optional rich content renderer; safe Markdown extension.                                                |
| MessageActions                | Copy, feedback, edit, retry, regenerate, and response-version selection when callbacks/data are provided.                 |
| ChatActivity                  | Compact current status and expandable, ordered activity history.                                                          |
| TypingIndicator               | A lightweight, labelled waiting cue, including a static reduced-motion presentation.                                      |
| ToolCallCard                  | Tool name, concise input/output summaries, progress/error state, optional approval controls, and custom result rendering. |
| CitationCard                  | Named, numbered source links and optional source previews.                                                                |
| AttachmentBubble              | File/image metadata, preview, progress, remove/retry, and validation feedback.                                            |
| MessageList / MessageScroller | Semantic transcript plus bounded scrolling, new-message affordance, history loading, and position preservation.           |
| ConversationList              | Searchable history, selected conversation, rename/delete callbacks, unread state, and empty/loading states.               |
| ModelPicker                   | Application-supplied model choices and capability/availability metadata.                                                  |

Use named exports and typed renderer slots. Avoid a second, competing set of public aliases. Reuse Button, IconButton, Textarea, Avatar, Badge, Accordion, Select/Combobox, Dialog, Drawer, SidebarShell, and the shared LiveRegion/Announcer where they fit.

## Activity contract

Separate transport/run lifecycle from the work being presented. A run has a stable ID, conversation ID, lifecycle status, optional start/end times, and ordered activity items. An assistant message can contain several text, summary, tool, attachment, and source parts without becoming several unrelated messages.

| Run state or event                  | Default visible cue                                           | Actions / outcome                                                        |
| ----------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Submitted, no specific activity yet | Thinking…                                                     | Stop remains available. No invented task details.                        |
| Explicit queued event               | Queued                                                        | Explain waiting when the host supplies a reason.                         |
| Explicit reasoning phase            | Thinking…                                                     | Expand only an application-supplied public summary.                      |
| Tool running                        | Working… or a supplied label such as Searching documents…     | Inspect tool activity without displacing the answer.                     |
| Approval requested                  | Needs your approval                                           | Show the proposed action and allow/deny controls.                        |
| Text arriving                       | Writing…                                                      | Render arriving text and allow Stop.                                     |
| Stop requested                      | Stopping…                                                     | Prevent repeated stop requests while the host acknowledges cancellation. |
| Completed                           | Final answer; activity becomes a compact completed disclosure | Copy, feedback, regenerate, and citations where supplied.                |
| Stopped                             | Stopped                                                       | Preserve partial content; offer retry/new prompt as supported.           |
| Failed                              | Couldn’t finish                                               | Preserve partial output and show a useful error and retry action.        |

Run states are `idle`, `submitted`, `running`, `stopping`, `completed`, `stopped`, and `error`. Activity kinds include thinking, tool, writing, and approval. Activity item states include pending, running, needs-input, completed, error, and cancelled. Exact TypeScript names can be refined without changing these behaviors before the first implementation slice is published.

Activity follows supplied events. Do not cycle fictional stages on a timer, manufacture reasoning, or show percentage progress when no denominator exists. Elapsed time uses a supplied timestamp. Public summaries are separate from raw model internals. Raw tool inputs/outputs are opt-in renderer content, not an automatic dump.

If tool work and answer streaming overlap, show both in the activity history; a pending approval takes priority in the compact status. A tool failure does not automatically mean the entire run failed. The host declares the terminal run outcome. Terminal runs reject late updates, and new runs cannot modify old messages.

## Public behavior

- The host owns messages, conversations, run state, selected model, persisted drafts, uploads, and side effects. Local uncontrolled state is allowed for presentation details such as expanded activity and unsaved composer text.
- Messages and parts use stable IDs; typed metadata and render callbacks carry application data. Actions include conversation, run, message, and part IDs as relevant.
- Sending calls a host callback. Clear the draft only after the host accepts it, retain it on rejection, and prevent duplicate submission. Attachment-only sending is a configurable capability.
- Enter sends on desktop; Shift+Enter adds a line; IME composition never submits. Touch keyboards have an explicit send button. The composer grows to a bounded height, then scrolls internally.
- The composer stays editable during a run so users can prepare the next prompt. Sending a second concurrent run in the same conversation is disabled in v1; stopping remains available.
- Stop, retry, edit, regenerate, feedback, rename, delete, model selection, and tool approval are typed host callbacks. Buttons only appear when supported. The UI does not perform those remote actions itself.
- Retry references a failed attempt; regenerate requests a new answer version. Editing an earlier message emits a replacement request and lets the host choose the new conversation branch. Provided answer versions remain navigable without deleting prior data.
- Conversations keep independent drafts, scroll positions, unread counts, and run identity. Switching conversations does not leak a draft or abort background work implicitly.
- Suggestions populate or submit only through an explicit, documented action. Empty, loading-history, no-search-results, unavailable-model, blocked-send, and disconnected/error states have visible paths forward.

## Rich output and attachments

- Base content handles plain text and application-supplied React content. A separate optional Markdown renderer supports paragraphs, lists, links, headings, tables, block quotes, and fenced code. It must tolerate incomplete streamed blocks without blanking the response.
- Raw HTML execution is disabled. Default links and image sources use an explicit safe URL policy. Custom renderers document their own trust boundary.
- Code blocks have language labels, horizontal overflow, and copy feedback. Copy uses source text, reports clipboard failure, and excludes activity summaries and hidden tool payloads unless explicitly requested.
- Citations preserve stable references and meaningful link labels. Source metadata is supplied by the host; the component does not fetch arbitrary URLs for previews.
- File selection, paste, and drop share validation for allowed types, count, and size. Display selected/uploading/ready/error states from the host. Do not submit unfinished or rejected uploads.
- Preview object URLs are released on remove, replacement, and unmount. Reserve image dimensions; expose file name, type, size, and accessible preview text. Client checks supplement server validation.
- Model choices and capability flags are provided by the host. No hard-coded provider list, pricing, or model availability. SoundInput can be composed in an action slot; speech transcription is outside this component.

## Scroll and performance

- Use a dedicated, focusable transcript viewport. Initial latest-message positioning affects that viewport only and does not scroll the containing page.
- Follow arriving content only while the user is at the bottom. Scrolling up suspends following immediately. Show a new-message count and Jump to latest action without moving focus.
- Preserve the visible anchor when older history is prepended, images resolve, the composer grows, or the viewport resizes. Explicit Jump to latest re-enables following.
- Coordinate ResizeObserver, scroll listeners, and requestAnimationFrame so layout reads/writes are bounded and cleaned up. Do not smooth-scroll for each token.
- Keep completed message rendering stable during streamed updates. Scope subscriptions to the active message/run; do not rerender or reparse the entire history on every chunk.
- Provide history pagination and an opt-in windowed long-history mode with overscan and measured rows. Preserve the focused row, logical list positions, and a documented non-windowed mode for browser find, copy-all, and assistive technology.
- Verify a 500-message transcript at 30 streamed updates per second and a 5,000-message paginated/windowed fixture. Record profiler evidence, input responsiveness, mounted-row limits, and anchor correctness. Do not claim a frame rate without measurement.

## Visual and motion direction

A calm reading surface with a centred, bounded message column; lightly tinted user messages; unboxed assistant prose; a rounded composer with a clear focus treatment; and compact activity beneath the assistant identity. Offer a compact embedded treatment through existing density tokens.

Use a quiet pulse or shimmer for current activity, a short opacity transition between status labels, subtle message entrance, and restrained disclosure motion. Completed text remains selectable and still. Avoid per-character animation spans, full-transcript layout animation, blinking cursors that never stop, and motion-only status communication.

All movement respects reduced motion. Pause nonessential animation while hidden or offscreen. Support light/dark, high contrast/forced colors, RTL, density, 320px widths, touch keyboards, and 200% zoom. Essential controls remain available without hover.

## Accessibility and verification

Messages form a readable semantic transcript with author labels and optional machine-readable timestamps. Do not announce every token or the full transcript repeatedly. Reuse the existing coalesced announcer for phase changes, complete replies, errors, approval requests, and attachment validation. Keep focus in the composer after sending and preserve it during streaming.

Use current rendered behavior, axe, Storybook interactions, Playwright showcase workflows, SSR/hydration, registry installation, and package-build seams. Verify cancellation races, stale events, IME, keyboard order, clipboard rejection, unsafe content, attachment cleanup, scroll anchoring, and conversation switching. Manual screen-reader checks remain necessary for announcement cadence and long-history usability.

## Distribution and integration

Publish focused registry items and an aggregate chat install. Shared helpers must be included by declared registry dependencies. Basic message/composer use must not install an AI provider or an animation runtime solely for a decorative cue. Keep rich Markdown dependencies confined to the optional renderer.

Provide a documented, typechecked AI SDK integration example that maps messages, parts, status, send, stop, and tool callbacks to the same public contract. Keep SDK/provider packages out of the core chat registry and runtime. Confirm the exact SDK version and mapping when implementing the adapter.

Deliver a deterministic showcase simulation with slow reply, tool work, approval, source-backed answer, stop, retry, and attachment failure scenarios. The simulation is visibly labelled and makes no paid requests.
