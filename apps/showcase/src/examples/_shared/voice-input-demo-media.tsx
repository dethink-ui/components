"use client";

import { VoiceInput, type VoiceInputProps } from "@dethink/components";

type DemoMediaMode =
  | "granted"
  | "denied"
  | "unsupported"
  | "missing"
  | "busy"
  | "constraints"
  | "pending";

class DemoAudioTrack extends EventTarget {
  enabled = true;
  kind = "audio";
  readyState: MediaStreamTrackState = "live";

  stop() {
    this.readyState = "ended";
  }
}

class DemoMediaStream {
  private readonly track = new DemoAudioTrack();

  getTracks() {
    return [this.track] as unknown as MediaStreamTrack[];
  }

  getAudioTracks() {
    return [this.track] as unknown as MediaStreamTrack[];
  }
}

export function VoiceInputDemoMedia({
  mode = "granted",
  ...props
}: Omit<VoiceInputProps, "getUserMedia"> & {
  mode?: DemoMediaMode;
}) {
  return (
    <VoiceInput
      {...props}
      getUserMedia={async () => {
        if (mode === "pending")
          return new Promise<MediaStream>(() => undefined);
        if (mode === "missing")
          throw new DOMException("No microphone", "NotFoundError");
        if (mode === "busy")
          throw new DOMException("Microphone in use", "NotReadableError");
        if (mode === "constraints")
          throw new DOMException(
            "Settings unavailable",
            "OverconstrainedError",
          );
        if (mode === "denied")
          throw new DOMException("Permission denied", "NotAllowedError");
        if (mode === "unsupported")
          throw new DOMException("Microphone unavailable", "NotSupportedError");
        return new DemoMediaStream() as unknown as MediaStream;
      }}
    />
  );
}
