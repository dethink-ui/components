import type { PropRow } from "@/components/props-table";

export const voiceInputProps: PropRow[] = [
  {
    prop: "controllerRef",
    type: "Ref<VoiceInputController>",
    defaultValue: "—",
    description:
      "Separate imperative ref with stop() and cancel(); the native ref still points to the button.",
  },
  {
    prop: "getUserMedia",
    type: "VoiceInputMediaRequest",
    defaultValue: "browser API",
    description:
      "Optional instance-scoped acquisition adapter. Returned streams are owned and stopped by VoiceInput.",
  },
  {
    prop: "variant",
    type: '"solid" | "soft" | "outline" | "ghost" | "destructive"',
    defaultValue: '"soft"',
    description: "Visual treatment matching Button and RevealButton variants.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "md" | "lg" | "xl"',
    defaultValue: '"md"',
    description:
      "Circular control size, unchanged while recording. Audio-responsive rays stay inside the button.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard"',
    defaultValue: '"standard"',
    description:
      "Controls the microphone and radial waveform transitions. None keeps the rays still.",
  },
  {
    prop: "muted",
    type: "boolean",
    defaultValue: "false",
    description:
      "Externally controlled mute state. Active audio tracks are disabled while the stream stays open.",
  },
  {
    prop: "audio",
    type: "boolean | MediaTrackConstraints",
    defaultValue: "true",
    description:
      "Audio constraints passed to getUserMedia when the user activates the control.",
  },
  {
    prop: "labels",
    type: "Partial<Record<VoiceInputState, string>>",
    defaultValue: "built-in copy",
    description:
      "State-specific accessible names, including cancellation while requesting and actionable device errors.",
  },
  {
    prop: "onStream",
    type: "(stream: MediaStream) => void",
    defaultValue: "—",
    description:
      "Called with the live stream after microphone permission succeeds.",
  },
  {
    prop: "onStop",
    type: "(stream: MediaStream, reason: VoiceInputStopReason) => void",
    defaultValue: "—",
    description:
      "Called after VoiceInput stops its owned tracks because of user stop, cancellation, disabling, errors, unmount, or track end.",
  },
  {
    prop: "onError",
    type: "(error: unknown, state: VoiceInputState) => void",
    defaultValue: "—",
    description:
      "Receives acquisition or synchronous consumer callback failures with their classified state.",
  },
  {
    prop: "onStateChange",
    type: "(state: VoiceInputState) => void",
    defaultValue: "—",
    description: "Receives the public state whenever VoiceInput changes state.",
  },
  {
    prop: "…native button props",
    type: "ButtonHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real button and supports disabled, type, form, className, and event props except aria-label/aria-labelledby.",
  },
];
