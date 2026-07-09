import type { PropRow } from "@/components/props-table";

export const soundInputProps: PropRow[] = [
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
      "Collapsed control size. The active pill expands inline from the same height.",
  },
  {
    prop: "motion",
    type: '"none" | "subtle" | "standard"',
    defaultValue: '"standard"',
    description:
      "Controls the pill and waveform choreography with Motion primitives.",
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
    type: "Partial<Record<SoundInputState, string>>",
    defaultValue: "built-in copy",
    description:
      "State-specific accessible names for idle, requesting, denied, recording, muted, and unsupported states.",
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
    type: '(stream, reason: "user" | "unmount" | "track-ended") => void',
    defaultValue: "—",
    description:
      "Called after SoundInput stops its owned tracks because of user stop, unmount, or track end.",
  },
  {
    prop: "onError",
    type: "(error: unknown, state: SoundInputState) => void",
    defaultValue: "—",
    description:
      "Called when microphone access is unsupported or permission is rejected.",
  },
  {
    prop: "onStateChange",
    type: "(state: SoundInputState) => void",
    defaultValue: "—",
    description: "Receives the public state whenever SoundInput changes state.",
  },
  {
    prop: "…native button props",
    type: "ButtonHTMLAttributes",
    defaultValue: "—",
    description:
      "Renders a real button and supports disabled, type, form, className, and event props except aria-label/aria-labelledby.",
  },
];
