# Comprehensive AI Chat PRD

Status: Approved for implementation. Published PRD: [#446](https://github.com/parveshh/dethink-components/issues/446).

Package target: `@dethink/components`.

## Problem Statement

Dethink has mature controls, overlays, feedback, and application shells, but its AI workspace and support inbox are examples assembled from generic primitives. Consumers still need to build a chat composer, streaming transcript, thinking and working cues, tool output, sources, attachments, cancellation, recovery, and conversation history themselves. The resulting interfaces often hide useful progress, jump while users read, announce every streamed token, or couple their design system to a particular AI backend.

## Solution

Ship a comprehensive, composable Chat family and a complete AI chat workspace example. Make run progress understandable through event-driven thinking, working, approval, and writing states. Pair a polished composer and rich messages with reliable scrolling, stop/retry/edit/regenerate actions, attachments, citations, model selection, and conversation history. Keep the visual components independent of provider, transport, storage, and application authorization.

## User Stories

1. As an application developer, I want a complete Chat composition and separately usable primitives, so that I can build a workspace or embed a copilot panel.
2. As an application developer, I want typed messages, parts, run state, and action callbacks, so that my existing AI backend remains the source of truth.
3. As a user, I want a clear empty state with useful suggestions, so that I know how to begin.
4. As a user, I want a growing multiline composer and reliable send control, so that I can write short questions or detailed prompts.
5. As a keyboard and IME user, I want predictable Enter, Shift+Enter, and composition handling, so that messages are sent only when intended.
6. As a user, I want my draft retained when sending fails, so that I do not lose my work.
7. As a user, I want distinct thinking, working, writing, queued, and waiting-for-approval cues, so that I understand what is happening.
8. As a user, I want expandable public activity summaries, so that I can inspect useful progress without cluttering the answer.
9. As a user, I want named tool cards with input/output summaries and outcomes, so that tool use is understandable.
10. As a user, I want explicit allow/deny controls for proposed tool actions, so that I can respond when the application needs my decision.
11. As a user, I want arriving text to appear smoothly and remain selectable, so that I can start reading before the response is complete.
12. As a user, I want to stop a response and retain its partial text, so that I can interrupt work without losing context.
13. As a user, I want useful error, interruption, and retry states, so that I can recover from failures.
14. As a user, I want to edit a prompt or regenerate an answer and inspect supplied versions, so that I can refine the conversation.
15. As a developer, I want stale events and overlapping run IDs handled predictably, so that a cancelled response cannot corrupt a newer conversation turn.
16. As a user, I want readable Markdown, lists, tables, links, and fenced code, so that complex replies remain useful.
17. As a user, I want copy actions and visible feedback, so that I can reuse an answer or code block and know whether copying worked.
18. As a user, I want named citations and source previews, so that I can inspect the references supplied with an answer.
19. As an integrator, I want a safe default content renderer and custom result slots, so that I can display rich responses without executing untrusted content.
20. As a user, I want to select, paste, or drop attachments and preview or remove them, so that I can include relevant context.
21. As a user, I want clear upload progress and validation/retry feedback, so that I know which files can be sent.
22. As a user, I want to select an available model and understand its supported capabilities, so that I can choose an appropriate option supplied by my application.
23. As an integrator, I want composer action slots, so that I can add an existing SoundInput or application tool without forking the composer.
24. As a reader, I want streaming to follow the latest answer only while I am at the bottom, so that reading older messages is never interrupted.
25. As a reader, I want a Jump to latest affordance and new-message count, so that I can return to current activity when ready.
26. As a user, I want loading older messages and resizing content to preserve my place, so that transcript navigation feels stable.
27. As a user with a long conversation, I want responsive typing and scrolling, so that history does not slow down the current interaction.
28. As a user, I want searchable conversation history with new, rename, and delete actions, so that I can manage my work.
29. As a user, I want separate drafts, scroll positions, and unread/run state per conversation, so that switching threads does not mix context.
30. As a mobile user, I want a usable transcript, composer, and collapsible history with the keyboard open, so that the same workflows work on a small screen.
31. As a keyboard or screen-reader user, I want meaningful message structure, deliberate focus, and coalesced announcements, so that the chat is usable without visual cues.
32. As a motion-sensitive user, I want a static or reduced-motion experience with the same state information, so that animation is optional.
33. As a design-system maintainer, I want theme tokens, density, RTL, forced colors, and documented slots, so that Chat fits different products consistently.
34. As a registry consumer, I want focused installs and accurate dependencies, so that basic chat does not require an AI SDK, provider, or rich rendering runtime.
35. As an AI SDK integrator, I want a tested mapping example, so that I can wire real streamed messages into Dethink without coupling the core package to that SDK.
36. As a contributor, I want deterministic scenarios and behavior-focused tests, so that streaming, approval, cancellation, accessibility, and scrolling regressions are reproducible without a live model.

## Implementation Decisions

- Use the roadmap vocabulary: PromptInput, ChatMessage, MessageList, MessageScroller, ConversationList, AttachmentBubble, TypingIndicator, CitationCard, ToolCallCard, and ModelPicker. Add Chat, MessageContent, MessageActions, and ChatActivity as the composition and presentation surfaces needed to connect them.
- Treat this family as one approved product scope delivered through small vertical slices. Each slice includes its public API, usable example, docs, relevant distribution metadata, and verification.
- Keep messages and side effects controlled by the host. Drafts and disclosure state can be locally managed when the consumer does not control them. No model keys or network transport belong in core components.
- Separate run lifecycle from activity phase. A message may contain ordered text, public summary, tool, source, attachment, and custom parts. Stable conversation/run/message/part IDs prevent stale updates or repeated activity from changing the wrong turn.
- Derive status from host events. Generic submitted work may say Thinking, but specific tool names, summaries, time measurements, progress counts, and terminal outcomes require supplied data. Do not fabricate reasoning or progress.
- Provide cancellation acknowledgement, partial output, failure/retry, regenerate/version, and edit callbacks. Preserve data and drafts across failures. One active run per conversation is the default; other conversations may continue independently.
- Compose existing Dethink controls, overlays, shell, and announcer infrastructure. Use semantic HTML and tokenized Tailwind styling with explicit variant maps and public state attributes.
- Keep plain content lightweight; isolate safe Markdown/code rendering in an optional entry and registry item. Disable raw HTML execution, restrict URL schemes, and document the trust boundary for custom renderers and uploaded files.
- File selection is client UI; upload, storage, server validation, malware scanning, and tool execution remain application responsibilities. Manage preview resources and surface host-driven progress and errors.
- Follow the transcript only when the user is at the bottom, preserve anchors on prepend/resize, and offer Jump to latest. Add pagination and opt-in measured windowing with an accessible non-windowed mode.
- Keep completed message subtrees stable during streaming; limit high-frequency updates to the active message. Coalesce announcements and avoid per-token layout animation or full-history Markdown reparsing.
- Use CSS for simple status and press feedback. Use the existing Motion dependency only where a stateful transition merits it, with hydration-safe reduced-motion behavior and hidden/offscreen suspension.
- Build a responsive AI chat workspace and an embedded example with deterministic activity scenarios. Include a documented, typechecked AI SDK mapping; keep SDK dependencies scoped to that integration example.
- Use current authenticated Context7 guidance for integration APIs. No backend, authentication, storage, or production AI provider is selected by this PRD.

## Testing Decisions

- Prefer existing rendered component and browser workflow seams; test observable behavior and callback contracts rather than private state or class strings.
- Rendered tests cover accepted/rejected sends, draft retention, IME, duplicate submission, actions, file validation, approvals, labels, and controlled/uncontrolled behavior.
- Pure state tests cover lifecycle transitions, cancellation, terminal states, stale IDs, duplicate/out-of-order updates, and attachment eligibility. Use fake clocks for deterministic run simulations.
- Browser tests cover streaming, immediate stop, retry, approve/deny, copy failure, empty states, conversation switching, scroll-up detachment, Jump to latest, history prepend, variable-height media, and mobile keyboard/resize behavior.
- Reuse LiveRegion/Announcer tests for coalescing. Add axe checks plus documented manual VoiceOver/keyboard acceptance for announcement cadence, transcript navigation, focus return, and long-history mode.
- Storybook and showcase states cover light/dark, compact/default density, RTL, forced colors, reduced motion, long content, no messages, loading history, tool success/failure, approval waiting, disconnected state, and partial stopped replies.
- SSR/hydration tests cover timestamps, model preference, reduced motion, initially long transcripts, and multiple Chat instances.
- Security-oriented tests reject unsafe URL schemes, executable HTML, malformed streamed markup, and invalid files in default renderers. Verify object URL and listener/observer cleanup.
- Performance fixtures exercise 500 messages with 30 stream updates per second and 5,000 paginated/windowed messages. Measure typing responsiveness, completed-message stability, mounted row limits, and scroll anchoring; record hardware/tool context with any timing claims.
- Every new distribution surface gets registry validation and clean-consumer install checks. Package and showcase builds/typechecks must pass; optional Markdown and SDK imports must not leak into lightweight core consumers.

## Out of Scope

- Hosted model endpoints, API credentials, auth, database persistence, billing, provider routing, and application authorization.
- Execution of tools or uploading/scanning files on a server. The component displays requests and emits callbacks.
- Exposing or inventing hidden chain-of-thought. Only supplied public summaries and activity records are rendered.
- Speech recognition, text-to-speech, realtime voice/video, collaborative multiplayer chat, and autonomous agent orchestration.
- Executable code sandboxes, automatic URL unfurling, rich text editing, a new generic upload product, and a general artifact editor.
- Designing a durable branching conversation store. The UI supports host-supplied revisions and emits edit/regenerate requests.

## Further Notes

The current AI workspace demonstrates generic run feedback and the support copilot demonstrates inbox/reply behavior; neither is a reusable streaming chat family. No existing Chat or PromptInput GitHub issue was found during the initial title search. GitHub remains the source of truth after approval and publication.

The default demo is local and deterministic. Real AI integration is an optional consumer example rather than a prerequisite for exploring the component.
