# SoundInput Component Spec

Status: Published to GitHub issue tracker.

Tracker PRD: https://github.com/parveshh/dethink-components/issues/335

Package target: `@dethink/components`.

## Summary

SoundInput is an icon-first microphone action for AI-native composers, command
bars, and dense app chrome. It requests microphone permission only after user
activation, passes the live `MediaStream` to the app, and shows recording
activity by expanding from a circle into a rounded pill with Motion-powered
waveform bars.

## Public API

```ts
export type SoundInputState =
  | "idle"
  | "permission-request"
  | "permission-denied"
  | "recording"
  | "muted"
  | "unsupported";

export type SoundInputVariant =
  "solid" | "soft" | "outline" | "ghost" | "destructive";

export type SoundInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SoundInputMotion = "none" | "subtle" | "standard";
export type SoundInputStopReason = "user" | "unmount" | "track-ended";

export interface SoundInputProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label" | "aria-labelledby" | "onError"
> {
  variant?: SoundInputVariant;
  size?: SoundInputSize;
  motion?: SoundInputMotion;
  muted?: boolean;
  audio?: boolean | MediaTrackConstraints;
  labels?: Partial<Record<SoundInputState, string>>;
  onStream?: (stream: MediaStream) => void;
  onStop?: (stream: MediaStream, reason: SoundInputStopReason) => void;
  onError?: (error: unknown, state: SoundInputState) => void;
  onStateChange?: (state: SoundInputState) => void;
}
```

Defaults:

- `variant="soft"`
- `size="md"`
- `motion="standard"`
- `muted={false}`
- `audio={true}`
- `type="button"`

## Behavior

- Renders a native button through `motion/react`.
- Does not access `navigator.mediaDevices` during SSR, hydration, or initial
  render.
- First activation requests `getUserMedia({ audio, video: false })`.
- Successful permission stores the owned stream, calls `onStream(stream)`, and
  enters `recording` or `muted`.
- Second activation stops all owned tracks and calls `onStop(stream, "user")`.
- Unmount stops all owned tracks and calls `onStop(stream, "unmount")`.
- Track `ended` events stop the owned stream and call
  `onStop(stream, "track-ended")`.
- `muted=true` disables active audio tracks without discarding permission or the
  stream; `muted=false` reenables them.
- Unsupported media devices enter `unsupported`; rejected permission enters
  `permission-denied`.

## Styling, Motion, And Accessibility

- Uses Tailwind CSS v4 utilities, semantic tokens, stable `data-*` attributes,
  and `cn` class merging.
- Uses existing `motion/react` primitives only: `motion.button`, motion spans,
  motion values, springs, and `useReducedMotion`.
- The waveform is decorative and hidden from assistive technology.
- The accessible name is state-derived from `labels`.
- Active states expose `aria-pressed`; permission request exposes `aria-busy`.
- The microphone source is never connected to audio output.

## Registry

SoundInput is a `registry:ui` item named `sound-input`. It depends on
`dethink-base`, `button`, the shared `cn` helper, and runtime dependency
`motion`.

## Test Requirements

- Render tests for defaults, permission success/failure, unsupported state,
  stream callbacks, stop cleanup, track-ended cleanup, muted track toggling,
  disabled behavior, labels, refs, and class merging.
- Motion tests for state-to-motion mapping and reduced-motion data state.
- Accessibility tests with axe across meaningful variants and states.
- SSR tests for server markup and hydration without media access.
