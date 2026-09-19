# Chat implementation slices

Status: All eight slices implemented; the user authorized committing and integrating into `main` on 2026-09-19. Automated and browser verification is recorded in [verification.md](./verification.md); human screen-reader acceptance remains outstanding. Published PRD: [#446](https://github.com/parveshh/dethink-components/issues/446).

Parent: [Comprehensive AI Chat PRD #446](https://github.com/parveshh/dethink-components/issues/446).

All slices were approved as AFK: no additional product/design decision was expected during implementation; that does not grant permission to merge or deploy. The original acceptance checklists below remain the integration checklist, including the manual checks that cannot be inferred from automated results. Every slice includes public types, a runnable example, documentation, Storybook states/interactions, relevant tests, package exports, and accurate registry files/dependencies.

| Slice | Title                                               | Type | Blocked by | User stories            |
| ----- | --------------------------------------------------- | ---- | ---------- | ----------------------- |
| 1     | Send and read an accessible conversation            | AFK  | None       | 1–6, 31, 33–34, 36      |
| 2     | Thinking, working, and tool approval activity       | AFK  | 1          | 7–10, 15, 31–32, 36     |
| 3     | Stream, stop, recover, and revise a reply           | AFK  | 2          | 6, 11–15, 17, 31–32, 36 |
| 4     | Rich answers with code, sources, and custom results | AFK  | 3          | 16–19, 33–34, 36        |
| 5     | Attachment and model-aware composer                 | AFK  | 4          | 4–6, 20–23, 30–31, 36   |
| 6     | Stable scrolling and long conversation history      | AFK  | 5          | 24–27, 30–32, 36        |
| 7     | Switch and manage independent conversations         | AFK  | 6          | 28–31, 33, 36           |
| 8     | Complete AI workspace and optional SDK integration  | AFK  | 7          | 1–36                    |

The stack is deliberately linear because later examples build on the previous slice and the repository asks for stacked issue branches. It can be split into independent branches later if the approved implementation graph changes.

## 1. Send and read an accessible conversation

### What to build

A usable basic chat: empty-state suggestions, a labelled growing PromptInput, a typed controlled transcript, named ChatMessage content, and accepted/rejected send callbacks. Demonstrate a host-supplied reply with no network dependency. Establish stable conversation, message, part, and run identity for subsequent slices.

### Acceptance criteria

- [ ] Render user, assistant, and system messages with readable labels and deterministic identity.
- [ ] Submit by explicit action or Enter, preserve Shift+Enter and IME composition, reject empty/duplicate sends, and retain rejected drafts.
- [ ] Bound composer growth, allow the next draft during a pending run, and expose clear read-only/disabled states.
- [ ] Demonstrate both controlled data and the documented local draft option without switching ownership mid-render.
- [ ] Supply a minimal package and registry consumer example, light/dark and compact stories, a showcase section, axe, and SSR/hydration coverage.

Blocked by: None — can start after parent/slices are approved and published.

## 2. Thinking, working, and tool approval activity

### What to build

An event-driven ChatActivity surface, TypingIndicator, and ToolCallCard. Show a prompt moving through waiting, thinking, tool execution, an optional approval request, and completion. Support concise public summaries and custom tool results without exposing raw payloads by default.

### Acceptance criteria

- [ ] Visible cues follow supplied lifecycle/activity events and never invent tool steps or progress percentages.
- [ ] Activity has stable IDs, ordered history, readable completed/error states, and a compact collapsed summary.
- [ ] Approve/deny controls invoke a typed host callback, prevent duplicate pending decisions, and display host acknowledgement or rejection.
- [ ] Tool failure can coexist with a continuing run; terminal run state comes from the host.
- [ ] Nonessential animation respects reduced motion, hydration, hidden pages, and offscreen content; phase announcements are coalesced.
- [ ] Include a runnable tool/approval scenario, stories, keyboard/axe checks, deterministic lifecycle tests, and install metadata.

Blocked by: Slice 1.

## 3. Stream, stop, recover, and revise a reply

### What to build

A deterministic streaming conversation that supports stopping, preserving partial output, failure/retry, edit/regenerate requests, response-version selection, copy, and feedback. Demonstrate correct identity and interruption behavior across multiple attempts.

### Acceptance criteria

- [ ] Text arrives in a stable message without reanimating previous output or losing selection/focus.
- [ ] Stop requests move through acknowledgement to stopped or host-declared completion/error; partial text remains visible.
- [ ] Retrying and regenerating identify the original attempt and the new run, and late events cannot mutate a terminal or different run.
- [ ] Edit and answer-version UI emit explicit callback payloads and preserve supplied history; unsupported actions are hidden.
- [ ] Copy and feedback report success or rejection, including denied clipboard access.
- [ ] Tests cover stopping before the first token, stopping during tool work, stop/finish races, rejected retry, and unmount cleanup through a runnable example.

Blocked by: Slice 2.

## 4. Rich answers with code, sources, and custom results

### What to build

A source-backed answer using an optional safe Markdown renderer, fenced code with copy, tables, source references, CitationCard previews, and application-rendered tool results. Preserve useful content while markup is incomplete during streaming.

### Acceptance criteria

- [ ] Render ordinary Markdown and fenced code without executing raw HTML or unsafe URLs.
- [ ] Incomplete fences, links, and lists stay readable during streaming and settle correctly on completion.
- [ ] Copy operates on source text, not decorative labels; long code/table content scrolls inside the message.
- [ ] Citations have stable references and meaningful accessible links; previews require supplied metadata and never fetch arbitrary URLs.
- [ ] Custom content/results receive typed context and a documented trust boundary.
- [ ] Rich-renderer dependencies are optional and absent from plain-message installs; verify safe rendering, SSR, axe, examples, and registry consumers.

Blocked by: Slice 3.

## 5. Attachment and model-aware composer

### What to build

A complete prompt with files/images, host-driven upload progress, attachment removal/retry, available model selection, and custom composer actions. Use a local fake upload scenario to show success and failure without a backend.

### Acceptance criteria

- [ ] File picker, paste, and drop share count/type/size validation and visible accessible errors.
- [ ] Selected, uploading, ready, and failed files remain distinct; unfinished/rejected files cannot be submitted.
- [ ] Preview object URLs are revoked on replacement, removal, and unmount; previews reserve space and have useful names.
- [ ] Attachment-only send behavior and model capabilities are explicitly configurable by the host.
- [ ] Model choices expose disabled/unavailable reasons and never silently discard an incompatible draft or attachment.
- [ ] Demonstrate a SoundInput/action slot without enabling microphone access automatically; include touch/IME, upload cancellation, failed upload, theme, registry, and a11y tests.

Blocked by: Slice 4.

## 6. Stable scrolling and long conversation history

### What to build

MessageScroller and MessageList behavior for an ongoing, long conversation. Users can read older messages, load more history, return to current activity, and keep typing while streaming continues.

### Acceptance criteria

- [ ] Initial/latest positioning moves only the transcript viewport; scrolling up suspends following.
- [ ] New-message count and Jump to latest work without stealing keyboard focus; explicit jumping re-enables following.
- [ ] Prepending history, image loading, composer growth, viewport changes, and expanded tools preserve the reader's anchor.
- [ ] History loading has explicit busy, error/retry, and exhausted states without duplicate requests.
- [ ] Opt-in measured windowing preserves focused rows and logical positions; document a non-windowed accessibility/find/copy mode.
- [ ] Run the 500-message/30-updates-per-second and 5,000-message fixtures; record completed-row stability, mounted rows, responsiveness, cleanup, and anchor correctness.
- [ ] Ship the behavior with a runnable long-history example, mobile/RTL/reduced-motion checks, docs, and install verification.

Blocked by: Slice 5.

## 7. Switch and manage independent conversations

### What to build

A searchable ConversationList alongside Chat, with new/rename/delete actions and independent draft, scroll, unread, and run state per conversation. Compose existing responsive shell and drawer behavior.

### Acceptance criteria

- [ ] Selecting a conversation restores its messages and draft; switching never transfers a draft or late event to another conversation.
- [ ] New, rename, and delete emit host callbacks with pending/error handling and explicit destructive confirmation.
- [ ] Deleting the selected conversation chooses a documented fallback and restores meaningful focus.
- [ ] Search, empty results, history loading, unread state, and background-running state are visible and keyboard-operable.
- [ ] Mobile history closes after selection and returns users to the transcript/composer without losing context.
- [ ] Include a multi-conversation simulation with concurrent background work, rendered/browser tests, axe, SSR, theme stories, and clean installs.

Blocked by: Slice 6.

## 8. Complete AI workspace and optional SDK integration

### What to build

A flagship full chat recipe and an embedded copilot example using the same public components. Add an optional, typechecked AI SDK mapping that exercises a real stream contract against a deterministic local test endpoint, without requiring credentials or paid requests.

### Acceptance criteria

- [ ] The workspace demonstrates thinking, tool work, approval, streaming, code/citations, attachments, stop/retry, response versions, and conversation switching with clear sample data.
- [ ] The embedded view demonstrates the same core behavior in a bounded panel with responsive controls and stable scrolling.
- [ ] SDK messages, text/tool/source/file parts, status, send/stop, errors, and approval callbacks map to the public contract at a documented supported SDK version.
- [ ] The SDK is an optional example dependency and does not enter basic package/registry consumers.
- [ ] Publish complete overview, installation, anatomy, API, accessibility, theming, recipes, testing, and migration notes; all recipe controls have meaningful outcomes.
- [ ] Complete browser and manual keyboard/screen-reader acceptance, safe rendering, SSR, performance evidence, Storybook/build/typecheck, registry validation/install smoke, and dependency isolation checks.
- [ ] Capture the full-page recipe for the gallery and include a Changeset for public package additions.

Blocked by: Slice 7.

## Approval record

The user approved the scope, test seams, and eight slices on 2026-09-19. The PRD and all children were published with `ready-for-agent` before implementation. Work was completed on `feature/issue-454-chat-workspace`; the intermediate branch refs shared their base because commits were not initially authorized. The user subsequently requested committing, merging into `main`, and pushing. See `verification.md` for implementation and verification evidence. No deployment is part of this request.

## Published implementation issues

- [447: Send and read an accessible conversation](https://github.com/parveshh/dethink-components/issues/447)
- [448: Thinking, working, and tool approval activity](https://github.com/parveshh/dethink-components/issues/448)
- [449: Stream, stop, recover, and revise a reply](https://github.com/parveshh/dethink-components/issues/449)
- [450: Rich answers with code, sources, and custom results](https://github.com/parveshh/dethink-components/issues/450)
- [451: Attachment and model-aware composer](https://github.com/parveshh/dethink-components/issues/451)
- [452: Stable scrolling and long conversation history](https://github.com/parveshh/dethink-components/issues/452)
- [453: Switch and manage independent conversations](https://github.com/parveshh/dethink-components/issues/453)
- [454: Complete AI workspace and optional SDK integration](https://github.com/parveshh/dethink-components/issues/454)
