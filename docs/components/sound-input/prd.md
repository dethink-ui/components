# SoundInput Component PRD

Status: Published to GitHub issue tracker.

Tracker issue: https://github.com/parveshh/dethink-components/issues/335

Package target: `@dethink/components`.

## Problem Statement

React teams building SaaS dashboards, internal tools, and AI-native interfaces
need a reusable microphone control that can request voice input, expose a live
audio stream to application code, and communicate recording, muted, permission,
and unsupported states without one-off browser API wiring or inaccessible
visual-only indicators.

## Solution

Ship SoundInput for `@dethink/components`. It renders an icon-first native
button that requests microphone access on first activation, passes the live
`MediaStream` to the consumer, expands from a circular mic control into a pill
with Motion-powered waveform visuals while active, supports externally
controlled mute by disabling audio tracks, and cleans up owned tracks when
stopped, ended, or unmounted.

## User Stories

1. As a frontend engineer, I want a reusable SoundInput component, so that voice
   input controls do not need one-off styling and media permission code.
2. As an AI app engineer, I want the component to pass a live `MediaStream`, so
   that I can feed speech-to-text, WebRTC, or custom processing in real time.
3. As a privacy-conscious user, I want microphone permission requested only after
   I activate the control, so that the page does not prompt for microphone access
   unexpectedly.
4. As a user, I want the control to show idle, permission request, permission
   denied, unsupported, recording, and muted states, so that I understand what
   the microphone is doing.
5. As a user, I want the control to expand into a pill with waveform feedback
   while active, so that recording state is visually obvious.
6. As a user who prefers reduced motion, I want the component to avoid
   non-essential movement, so that the interface remains comfortable.
7. As a keyboard user, I want native button behavior and visible focus, so that I
   can operate voice input without a pointer.
8. As a screen reader user, I want concise state-specific labels and button
   semantics, so that the microphone status is understandable without seeing the
   waveform.
9. As a design-system consumer, I want variants, sizes, theming, density, dark
   mode, and RTL to match the rest of Dethink Components, so that SoundInput fits
   production app chrome.
10. As a maintainer, I want accurate registry metadata and verification, so that
    shadcn-style installs copy all required files and dependencies.

## Implementation Decisions

- SoundInput is a new package component and shadcn-compatible registry item.
- The state model is `idle`, `permission-request`, `permission-denied`,
  `recording`, `muted`, and `unsupported`.
- The component renders a native button through `motion/react` and defaults to
  `type="button"`.
- The component requests microphone access only on first user activation through
  `navigator.mediaDevices.getUserMedia({ audio, video: false })`.
- The consumer receives a live `MediaStream` through `onStream`; V1 does not
  emit recorded Blob chunks and does not use `MediaRecorder`.
- The component owns the stream it requests and stops all tracks on user stop,
  track end, and unmount.
- `muted` is externally controlled. While active, `muted=true` disables each
  audio track and shows the muted state.
- Motion-owned animation uses existing `motion/react` primitives only.
- The separate Motion-Primitives package is out of scope.
- Waveform visuals are decorative. Web Audio analyser data may drive bar height,
  but microphone input must never connect to speakers.

## Testing Decisions

- Test public behavior and DOM semantics rather than private implementation
  details.
- Render tests cover defaults, permission flow, stream callback, denied and
  unsupported states, muted track toggling, cleanup, disabled behavior, labels,
  class merging, and ref forwarding.
- Motion tests cover state-to-variant mapping and reduced-motion behavior.
- Accessibility tests use axe and cover accessible names, decorative content,
  focus visibility, busy/pressed semantics, and non-color-only states.
- SSR tests verify stable server markup and hydration without browser media API
  access or warnings.
- Registry checks cover metadata, files, dependencies, exports, and relative
  imports.

## Out Of Scope

- Speech-to-text transcription.
- Recording or emitting audio Blob chunks.
- Uploading or persisting audio.
- Inline mute button inside the pill.
- Mount-time permission prompts.
- Adding the separate Motion-Primitives package.
