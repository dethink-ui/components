# Chat

A provider-independent conversation UI for full AI workspaces and embedded copilots. The app owns messages, runs, uploads, authorization, transport, and persistence. Components own presentation and local interaction feedback.

Approved scope: [PRD #446](https://github.com/parveshh/dethink-components/issues/446), implemented through [#447–#454](https://github.com/parveshh/dethink-components/issues/447).

## Installation

Use the `chat` registry item for the full family, or install `prompt-input`, `chat-message`, `chat-activity`, `message-scroller`, `chat-attachment`, `model-picker`, or `conversation-list` separately. The shared `chat-core` item supplies types and lifecycle helpers. Install the existing `dethink-base` styles/tokens as for other components.

The package exports all core components from `@dethink/components`. Rich Markdown is deliberately separate:

```sh
pnpm add react-markdown@^10 remark-gfm@^4
```

```tsx
import { Chat } from "@dethink/components";
import { MarkdownMessage } from "@dethink/components/chat-markdown";

<Chat
  conversationId={conversation.id}
  messages={messages}
  run={run}
  activity={{ items: activity, onApproval: approveTool }}
  renderPart={(part) =>
    part.type === "text" ? <MarkdownMessage text={part.text} /> : undefined
  }
  prompt={{
    value: draft,
    onValueChange: setDraft,
    onSend: acceptPrompt,
    onStop: requestStop,
  }}
/>;
```

`acceptPrompt` acknowledges acceptance, not the end of generation. Start the transport and return immediately after accepting the prompt. Return `false` or reject to retain the draft and show an error. New text typed while acceptance is pending is never cleared. An accepted send clears text only; the host clears accepted attachments.

## Anatomy and API

| Component          | Main props and behavior                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Chat`             | `conversationId`, `messages`, `run`, `activity`, `prompt`, `messageActions`, `renderPart`, `history`, `scroll`, `header`, `emptyState`, `composer`. A bounded, named conversation section with its own LiveRegionProvider.                                                  |
| `PromptInput`      | Controlled `value/onValueChange` or local `defaultValue`; `onSend`, `onStop`, `disabled`, `readOnly`, `submitOnEnter` (true), `maxHeight` (192px). Key standalone inputs by conversation ID. `actions` accepts host controls, including an explicitly activated SoundInput. |
| `ChatMessage`      | `message`, `renderPart`, `actions`, `avatar`. Named user/assistant/system articles; memoized to preserve completed rows.                                                                                                                                                    |
| `MessageContent`   | Plain text, sources, attachments, or a typed part renderer. Returning `undefined` uses the default renderer; `null` hides a part.                                                                                                                                           |
| `MessageActions`   | Optional copy, feedback, edit, retry, regenerate, and version callbacks. Rejection is visible. ChatMessage limits these actions to relevant roles/states.                                                                                                                   |
| `ChatActivity`     | `run`, ordered `items`, `onApproval`, `renderResult`. Compact status and expandable public activity history.                                                                                                                                                                |
| `TypingIndicator`  | `label`, `active`. Motion stops for reduced motion, hidden pages, and offscreen indicators.                                                                                                                                                                                 |
| `ToolCallCard`     | `activity`, `onApproval`, `children`. Pending decisions wait for host acknowledgement. Raw tool payloads are never dumped.                                                                                                                                                  |
| `CitationCard`     | Supplied `citation`, optional `index`. Safe external links and metadata; no preview fetching.                                                                                                                                                                               |
| `AttachmentBubble` | Controlled `attachment`, `onRemove/onRetry`. Selected/uploading/ready/error states, bounded previews, and object URL cleanup.                                                                                                                                               |
| `ModelPicker`      | `models`, `value`, `onValueChange`, `disabled`. Availability reasons and capability metadata stay under host control.                                                                                                                                                       |
| `MessageScroller`  | Owns the transcript viewport. `initialPosition/onPositionChange` preserve per-conversation scroll state. `revision` updates positioning; `messageCount/lastMessageId` distinguish new arrivals from prepended history.                                                      |
| `MessageList`      | `messages`, `renderPart`, `actions`, `windowed` (false), `overscan` (5), `estimatedRowHeight` (160px), `hasOlder`, `loadingOlder`, `historyError`, `onLoadOlder`. Windowing requires a surrounding MessageScroller.                                                         |
| `ConversationList` | Controlled `conversations/value/onValueChange`, optional new/rename/delete/load-more callbacks, loading/error states. Delete requires explicit confirmation. The host chooses the fallback conversation.                                                                    |

Public types include `ChatMessageData`, `ChatMessagePart`, `ChatRun`, `ChatActivityItem`, `ChatApproval`, `ChatPrompt`, `ChatAttachment`, `ChatModel`, `ChatConversation`, `ChatState`, `ChatEvent`, `ChatPartRenderer`, and all component props. Metadata and custom part data are explicit application trust boundaries.

## Lifecycle and integration

Run states: `idle → submitted → running → stopping → stopped`, or `completed/error`. Submitted means Thinking…; a running tool can say Searching workspace…; streaming can say Writing…. An explicit `needs-input` event shows approval. Labels must describe actual supplied events; do not fabricate work, percentages, or private reasoning.

`chatReducer` is an optional host utility. Every event carries conversation/run identity and a monotonically increasing sequence. It ignores stale events, duplicate sequence numbers, mismatched runs, and updates after a terminal state. Stop requests reject later text while allowing completion to win an acknowledgement race. Starting a new run requires a fresh run ID and a terminal/idle previous run. Completed message objects remain unchanged as one message streams.

Stop does not abort a network request by itself. The host cancels the transport and acknowledges `stopped`, `completed`, or `error`. It must also cancel tool work/uploads when appropriate. Retry, regenerate, edit, and version callbacks identify the original message; the host decides how to preserve and display versions. Never replace conversation IDs with array indices.

The showcase's `sdk-adapter.ts`, `sdk-example.tsx`, and `/api/chat-demo` demonstrate AI SDK **6** with `@ai-sdk/react` **3**. Text, tool status/approval, sources, files, errors, stop, and regenerate use a real local UI-message stream. Reasoning parts are intentionally omitted. The SDK is a showcase dependency and is absent from the component package and basic registry installs. The sample endpoint calls no model and persists nothing.

## Attachments and security boundaries

Picker, paste, and drop share `validateChatFiles`. Defaults are five files, 10 MB each, and no type restriction; supply `fileRules.accept/maxFiles/maxFileSize`. Rules are UX checks. The host must enforce authorization, file signatures, size, storage policy, and malware/sanitization requirements on the server. Filenames/MIME types are not trusted proof of content.

`onFiles` hands accepted Files to the host. Publish controlled attachment states and progress from the real upload. Send stays unavailable while files are unfinished/failed or incompatible with the selected model. Files and drafts are preserved when switching models. `allowAttachmentOnly` defaults to false. Removal should abort the host upload. Local raster-image preview URLs are revoked on replacement/unmount; host-supplied URLs remain the host's responsibility. SVG/data URL previews are not rendered.

Markdown disables raw HTML, unsafe URL schemes, and automatic remote image loading. GFM tables and incomplete code fences remain readable during streaming. Code copy uses source text. No arbitrary plugins or HTML passthrough are exposed. Custom renderers and custom tool results are trusted application code: validate unknown data before rendering and never use unsafe HTML injection. Citation metadata is supplied, never scraped.

## Accessibility and keyboard acceptance

- Enter submits; Shift+Enter adds a line. Composition events and key code 229 preserve IME input. Set `submitOnEnter={false}` for explicit-send-only experiences.
- The composer is labelled; validation is associated with it. Buttons expose accessible names, disabled states, and action failures.
- Transcript updates never focus a message or scroll the outer page. A polite, coalesced channel announces phase changes and completion, not every token. Messages remain ordinary readable articles in a list.
- Approve/deny are explicit named actions, with pending and acknowledged states. Public summaries explain the action; no hidden reasoning is implied.
- Search, model selection, rename dialogs, destructive confirmation, mobile history, code/table scrolling, and Jump to latest are keyboard reachable.
- Manual screen-reader acceptance: verify one phase announcement per change, normal transcript reading, no token announcements, approval labels, file errors, and meaningful focus after dialog deletion. Automated axe and DOM focus checks do not substitute for a human assistive-technology pass.
- Disable `windowed` for browser find, full transcript copy, or complete screen-reader traversal. Measured windowing provides logical positions and retains a focused row but intentionally omits offscreen content.

## Scrolling and performance

The transcript follows only near the bottom. Scrolling away detaches following; Jump to latest explicitly resumes it. Visible-row anchors preserve position when history is prepended or content resizes. Each scroller owns and cleans up its ResizeObserver/animation frames. Virtualized lists use measured row heights, prefix sums, binary search, overscan, and a pinned focused row.

Keep completed message references and renderer/action callbacks stable. Stream into the active message, preferably in bounded batches. Avoid per-character elements or layout animation across the transcript. Pagination is useful even with windowing. The showcase includes 500-message/30-update-per-second and 5,000-message fixtures at `/components/chat/performance`; measurements are recorded in `verification.md`.

## Theming and motion

All surfaces use existing semantic background/foreground/muted/border/primary/success/destructive/ring tokens. Tailwind utilities are the styling contract; pass classes to adapt dimensions. Existing density, dark, RTL, and forced-color behavior flows through the primitives. No hard-coded brand palette is required.

Simple feedback uses tokenized CSS transitions; activity disclosure composes Accordion's reduced-motion-aware transitions. Typing dots animate opacity only and are decorative. Streaming text does not reanimate existing characters.

## Recipes, testing, and migration

See `/components/chat` for basic, complete, embedded, SDK, and API examples; `/recipes/ai-chat-studio` for the full workspace. Sample controls never call a paid model or external upload service. Fake upload failure is recoverable by Retry.

Tests cover reducer identity/races, keyboard and IME submission, draft recovery, approval acknowledgements, safe Markdown, file validation/URL cleanup, rendered axe, hydration, browser workflows, scrolling, windowing, and SDK streaming. Registry installation and package bundle checks ensure optional Markdown and SDK dependencies stay isolated.

This is an additive API. Existing support-inbox and AI workspace recipes remain available. Migrate an existing UI incrementally: MessageContent/ChatMessage first, then PromptInput, then the controlled Chat layout. No data migration or provider migration is required.
