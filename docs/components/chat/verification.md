# Chat verification

Verified locally on 2026-09-19 for [PRD #446](https://github.com/parveshh/dethink-components/issues/446) and implementation issues #447–#454. The eight slices were implemented on `feature/issue-454-chat-workspace`. These measurements were collected before the user subsequently authorized committing, merging into `main`, and pushing. Deployment is outside that request.

## Runtime surfaces

- `/components/chat`: controlled conversation, composer action slot, full workspace, embedded copilot, API reference, and optional AI SDK integration.
- `/recipes/ai-chat-studio`: full workspace with responsive conversation history and a context rail.
- `/components/chat/performance`: 500-message and 5,000-message fixtures with streaming, history prepends, windowing, and measurements.
- Storybook `AI/Chat`: ConversationFlow and ToolApproval interactions, dark, compact RTL, upload error, and stopped states.
- Vite playground: package-consumer send/read smoke example.

The examples use deterministic sample responses and local upload simulation. The optional SDK example uses a local UI-message stream endpoint; it makes no model requests and executes no tools. It was checked against installed `ai@6.0.286` and `@ai-sdk/react@3.0.289`.

## Automated checks

| Check                                                      | Result                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Complete component Vitest suite                            | 272 files, 2,348 tests passed, including 28 chat tests                             |
| Chat browser flows, Chromium                               | 9 passed                                                                           |
| Recipe gallery and component navigation, Chromium          | 12 passed                                                                          |
| Package, showcase, Storybook, playground TypeScript        | Passed                                                                             |
| Lint on chat source, examples, stories, tests, and scripts | Passed                                                                             |
| Package build                                              | Passed; declarations and optional Markdown entry emitted                           |
| Showcase production build                                  | Passed; 93 static pages plus dynamic local chat endpoint                           |
| Storybook production build and browser interaction checks  | Passed                                                                             |
| Playground production build                                | Passed                                                                             |
| Registry validation                                        | Passed; 85 entries                                                                 |
| Fresh chat registry consumer                               | 37 recursively copied files; dependency install, TypeScript, and Vite build passed |
| Whitespace validation                                      | `git diff --check` passed                                                          |

Browser coverage includes approval acknowledgement, progressive text, sources, preserving a draft while a reply runs, stopping partial output, retrying a failed response, response versions, independent conversation state, background work, rename/delete confirmation, upload failure/retry/removal, mobile history, SDK approval/denial, SDK stop before text, and SDK error recovery.

Unit/rendered tests cover lifecycle ordering and stale events, send acknowledgement/rejection, IME and keyboard input, attachment validation and URL cleanup, action failures, approval errors, safe Markdown/URLs, conversation management, SSR output, and axe checks. The actual Next.js runtime was checked for hydration errors.

## Streaming and scrolling measurements

Local Chromium against the Next.js development server, 90 updates requested at 30 updates/second. These are fixture observations, not an FPS, INP, or production-device guarantee. Host rendering and Markdown complexity affect the result.

| Fixture                                                        |  Elapsed | Completed row re-renders | Mounted rows | React commits | Total measured React render time |
| -------------------------------------------------------------- | -------: | -----------------------: | -----------: | ------------: | -------------------------------: |
| 500 messages, full transcript, 20 prepended + one live message | 2,972 ms |                        0 |          521 |            91 |                           419 ms |
| 5,000 messages, measured windowing + one live message          | 2,971 ms |                        0 |            6 |           113 |                           169 ms |

Browser assertions also verified that prepending history preserves the visible anchor, scrolling up suspends following, new streaming content does not steal composer focus, Jump to latest resumes following, prepended history does not count as new arrivals, and a focused row remains mounted when scrolled outside the virtual window. Completed message objects and render callbacks stay stable in the fixtures and SDK adapter. Resize observers, animation frames, upload timers, stream timers, and preview URLs have cleanup paths.

Windowing is opt-in. Keep the full transcript for browser Find, selecting/copying across messages, and assistive-technology access to all history; a windowed list cannot expose unmounted rows to those features.

## Accessibility and visual checks

- Light desktop, dark desktop, and mobile workspace axe checks passed. Storybook provides compact and RTL states.
- Keyboard interaction checks cover send/newline, approvals, message actions, dialogs, history selection, composer focus while streaming, and explicit Jump to latest focus.
- With reduced motion enabled, all typing dots reported `animation-name: none`; phase text remains visible independently of animation.
- Forced-colors/RTL was visually inspected in Chromium. The browser applied black text on a white system background (`rgb(0, 0, 0)` / `rgb(255, 255, 255)`, `forced-color-adjust: auto`). Axe's forced-colors contrast report used the original dark-theme foreground token against the system background; that report did not match the browser's computed/painted colors. It is recorded rather than reported as a passing forced-colors axe run.
- The gallery capture shows the actual concise Launch strategy response at a 1440×780 desktop viewport, cropped to the existing 1200×675 capture contract. No UI was composited into the image.

**Remaining manual acceptance:** a human screen-reader pass with VoiceOver/Safari and NVDA/Firefox has not been performed. Verify concise/coalesced phase announcements without per-token narration, approval focus after acknowledgement, history navigation, and the full-transcript reading order. Automated axe and focus checks do not replace this acceptance step. Cross-browser and physical touch-device acceptance also remain outside the Chromium evidence above.

## Dependency isolation

Measured with `node packages/components/scripts/check-chat-bundle.mjs` after the package build. Figures are gzip bytes for an esbuild consumer entry, excluding host React and stylesheet delivery. They include each selected component's transitive JavaScript.

| Entry           | Gzip bytes |
| --------------- | ---------: |
| ChatMessage     |     15,409 |
| PromptInput     |     70,115 |
| Chat            |    120,886 |
| MarkdownMessage |     59,148 |

The probe verified that core chat imports retain no AI SDK or Markdown renderer, and that ChatMessage retains neither Motion nor React Aria. PromptInput and Chat compose existing form, select, accordion, and dialog primitives, which account for their larger closures. Markdown is a separate package subpath and registry item with optional peers; the AI SDK is a showcase-only dependency.

Reproduce the registry check with `node scripts/smoke-chat-registry.mjs` and the browser flows with `playwright test e2e/chat.spec.ts`. The registry script creates a fresh temporary consumer rather than using workspace aliases.

## Main integration check

Before the requested main push on 2026-09-19, the latest Relay landing recipe from main was retained alongside Chat Studio and the three workflow recipes. The combined tree passed 38 Chromium checks covering chat, gallery discovery, Relay, workflows, theme persistence, reduced motion, and forced colors. The showcase and component package production builds passed, and registry validation confirmed all 85 entries. The manual screen-reader acceptance limitation above remains unchanged.
