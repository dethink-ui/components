"use client";

import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SoundInput,
} from "@dethink/components";
import { SoundInputLiveMedia } from "@/examples/_shared/sound-input-live-media";

type MemoStatus =
  | "idle"
  | "recording"
  | "recorded"
  | "playback-error"
  | "denied"
  | "unsupported";

interface VoiceMemo {
  url: string;
  durationMs: number;
  type: string;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function pickMimeType() {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof MediaRecorder.isTypeSupported !== "function"
  ) {
    return undefined;
  }

  // Prefer a container the recording browser can also play back in <audio>.
  // Safari records/plays MP4/AAC (not Opus-in-WebM); Chrome/Firefox use WebM.
  const candidates = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return undefined;
}

export function SoundInputRecipeVoiceMemo() {
  const [status, setStatus] = useState<MemoStatus>("idle");
  const [memo, setMemo] = useState<VoiceMemo | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const memoRef = useRef<VoiceMemo | null>(null);

  // Keep a live ref so cleanup can revoke the object URL without re-subscribing.
  useEffect(() => {
    memoRef.current = memo;
  }, [memo]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (memoRef.current) {
        URL.revokeObjectURL(memoRef.current.url);
      }
    };
  }, []);

  const handleStream = (stream: MediaStream) => {
    if (typeof MediaRecorder === "undefined") {
      setStatus("unsupported");
      return;
    }

    // Drop any previous take so its blob URL is released.
    if (memo) {
      URL.revokeObjectURL(memo.url);
      setMemo(null);
    }

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      // Not a real MediaStream (e.g. a fake demo stream leaked in).
      setStatus("unsupported");
      return;
    }

    chunksRef.current = [];
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    });
    recorder.addEventListener("stop", () => {
      const type = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];

      if (blob.size === 0) {
        return;
      }

      setMemo({
        url: URL.createObjectURL(blob),
        durationMs: Date.now() - startRef.current,
        type,
      });
      setStatus("recorded");
    });

    recorderRef.current = recorder;
    startRef.current = Date.now();
    setElapsedMs(0);
    setStatus("recording");
    // Timeslice so chunks flush during recording, not only at stop.
    recorder.start(1000);

    clearTimer();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
  };

  // Stop the recorder while the mic tracks are still live so the file is
  // finalized cleanly. SoundInput stops its tracks on the click that follows
  // this capture-phase pointerdown, so flushing here avoids a truncated blob.
  const flushBeforeStop = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      clearTimer();
      recorder.stop();
    }
  };

  const handleStop = () => {
    clearTimer();
    const recorder = recorderRef.current;
    // Fallback for track-ended (e.g. unplugged mic) with no preceding tap.
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const discard = () => {
    if (memo) {
      URL.revokeObjectURL(memo.url);
    }
    setMemo(null);
    setStatus("idle");
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Voice memo</CardTitle>
            <CardDescription>
              Record a note and play it back in place.
            </CardDescription>
          </div>
          <Badge
            variant="soft"
            tone={status === "recording" ? "destructive" : "neutral"}
            size="sm"
          >
            {status === "recording" ? "● Live mic" : "Uses your mic"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <SoundInputLiveMedia>
            <span
              className="inline-flex"
              onPointerDownCapture={flushBeforeStop}
              onKeyDownCapture={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  flushBeforeStop();
                }
              }}
            >
              <SoundInput
                variant="solid"
                size="lg"
                onStream={handleStream}
                onStop={handleStop}
                onError={(_error, state) => {
                  clearTimer();
                  setStatus(state === "unsupported" ? "unsupported" : "denied");
                }}
                labels={{
                  idle: "Record voice memo",
                  recording: "Stop recording",
                }}
              />
            </span>
          </SoundInputLiveMedia>
          <div aria-live="polite" className="min-w-0 text-sm">
            {status === "recording" ? (
              <p className="text-foreground font-medium tabular-nums">
                Recording… {formatDuration(elapsedMs)}
              </p>
            ) : status === "recorded" ? (
              <p className="text-muted-foreground">
                Saved a {formatDuration(memo?.durationMs ?? 0)} memo.
              </p>
            ) : status === "playback-error" ? (
              <p className="text-destructive">
                Saved, but this browser can&apos;t play the recording back.
              </p>
            ) : status === "denied" ? (
              <p className="text-destructive">
                Microphone permission was denied.
              </p>
            ) : status === "unsupported" ? (
              <p className="text-muted-foreground">
                Recording isn&apos;t supported in this browser.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Tap the mic to start. Tap again to stop.
              </p>
            )}
          </div>
        </div>

        {memo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- user-recorded audio has no caption track.
          <audio
            className="w-full"
            controls
            preload="metadata"
            src={memo.url}
            aria-label="Voice memo playback"
            onError={() => setStatus("playback-error")}
          />
        ) : null}
      </CardContent>

      {memo ? (
        <CardFooter justify="between">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            {memo.type.replace("audio/", "")}
          </span>
          <Button size="sm" variant="ghost" onClick={discard}>
            Discard
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
