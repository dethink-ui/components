---
"@dethink/components": minor
---

Rename the pre-launch SoundInput API and registry item to VoiceInput / voice-input, including types, CSS variables, and data slots. No compatibility alias is retained.

Harden microphone ownership across permission races, mute/disable changes, callbacks, and cleanup. Add actionable device errors, truthful waveform fallback, controller stop/cancel, and instance-scoped media adapters.

Keep the control circular while recording, with an internal sunlight ring driven by audio levels and still states for silence, mute, and reduced motion.

Export useVoiceRecorder for local recording with pause/resume, active duration limits, finalized Blob metadata, and playback URL cleanup. Add a complete voice memo example with playback, download, and discard.
