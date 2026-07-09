"use client";

import type { ReactNode } from "react";

type DemoMediaMode = "granted" | "denied" | "unsupported";

class DemoAudioTrack extends EventTarget {
  enabled = true;
  kind = "audio";
  readyState: MediaStreamTrackState = "live";

  stop() {
    this.readyState = "ended";
    this.dispatchEvent(new Event("ended"));
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

function installSoundInputDemoMedia(mode: DemoMediaMode) {
  if (typeof navigator === "undefined") {
    return;
  }

  if (mode === "unsupported") {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    return;
  }

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia:
        mode === "denied"
          ? async () => {
              throw new DOMException("Permission denied", "NotAllowedError");
            }
          : async () => new DemoMediaStream() as unknown as MediaStream,
    },
  });
}

export function SoundInputDemoMedia({
  children,
  mode = "granted",
}: {
  children: ReactNode;
  mode?: DemoMediaMode;
}) {
  const install = () => {
    installSoundInputDemoMedia(mode);
  };

  return (
    <span
      className="inline-flex"
      onKeyDownCapture={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          install();
        }
      }}
      onPointerDownCapture={install}
    >
      {children}
    </span>
  );
}
