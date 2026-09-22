"use client";

import { useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  VoiceInput,
  useVoiceRecorder,
  type VoiceInputController,
  type VoiceInputState,
} from "@dethink/components";

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function VoiceInputRecipeVoiceMemo() {
  const controller = useRef<VoiceInputController>(null);
  const [inputState, setInputState] = useState<VoiceInputState>("idle");
  const [inputError, setInputError] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const recorder = useVoiceRecorder({
    maxDurationMs: 60_000,
    onRelease: () => controller.current?.stop(),
  });
  const busy = recorder.state === "recording" || recorder.state === "paused";
  const memo = recorder.recording;
  const extension = memo?.mimeType.includes("mp4")
    ? "m4a"
    : memo?.mimeType.includes("ogg")
      ? "ogg"
      : "webm";
  const status =
    inputError ??
    (recorder.error instanceof Error ? recorder.error.message : null) ??
    (inputState === "permission-request"
      ? "Waiting for microphone permission. Activate again to cancel."
      : recorder.state === "recording"
        ? "Recording your voice."
        : recorder.state === "paused"
          ? "Paused. Your microphone remains open."
          : recorder.state === "finalizing"
            ? "Finishing your recording…"
            : recorder.state === "ready"
              ? "Your recording is ready."
              : "Ready when you are. Activate the microphone to begin.");

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Voice memo</CardTitle>
            <CardDescription>
              A thought worth keeping. Up to one minute.
            </CardDescription>
          </div>
          <Badge
            variant="soft"
            tone={busy ? "destructive" : "neutral"}
            size="sm"
          >
            {busy ? "Mic is on" : "On this device"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <VoiceInput
              controllerRef={controller}
              variant="solid"
              size="lg"
              disabled={recorder.state === "finalizing"}
              onStateChange={(state) => {
                setInputState(state);
                if (state === "permission-request") setInputError(null);
              }}
              onStream={(stream) => {
                setInputError(null);
                setPlaybackError(false);
                recorder.start(stream);
              }}
              onStop={(_stream, reason) => recorder.stop(reason)}
              onError={(_error, state) => {
                const messages: Partial<Record<VoiceInputState, string>> = {
                  "permission-denied":
                    "Allow microphone access in your browser settings, then try again.",
                  "device-not-found": "Connect a microphone, then try again.",
                  "device-busy":
                    "Close other apps using your microphone, then try again.",
                  "constraints-error":
                    "Your microphone cannot use these settings. Try another microphone.",
                  unsupported:
                    "Microphone access requires a supported browser and HTTPS.",
                };
                setInputError(
                  messages[state] ?? "Voice input failed. Please try again.",
                );
              }}
              labels={{
                idle: memo ? "Record another voice memo" : "Record voice memo",
                recording: "Stop recording",
              }}
            />
            <div>
              <p
                className="text-foreground text-2xl font-medium tabular-nums"
                role="timer"
                aria-label="Recording duration"
                aria-live="off"
              >
                {formatDuration(recorder.elapsedMs)}
              </p>
              <p className="text-muted-foreground text-xs">
                of 1:00 · pauses excluded
              </p>
            </div>
          </div>
          {busy ? (
            <Button
              size="sm"
              variant="outline"
              onClick={
                recorder.state === "paused" ? recorder.resume : recorder.pause
              }
            >
              {recorder.state === "paused" ? "Resume" : "Pause"}
            </Button>
          ) : null}
        </div>
        <p role="status" className="text-muted-foreground text-sm">
          {status}
        </p>
        {memo ? (
          <div className="space-y-2">
            {/* User-recorded local audio has no generated transcript. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              key={memo.url}
              className="w-full"
              controls
              preload="metadata"
              src={memo.url}
              aria-label="Voice memo playback"
              onError={() => setPlaybackError(true)}
            />
            {playbackError ? (
              <p role="alert" className="text-destructive text-sm">
                Playback is unavailable. You can still download this take.
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex-wrap gap-3" justify="between">
        <p className="text-muted-foreground text-xs">
          Audio stays here until you download it.
        </p>
        <div className="flex flex-wrap gap-2">
          {memo ? (
            <a
              className="text-primary focus-visible:ring-ring rounded px-2 py-1 text-sm font-medium underline underline-offset-4 focus-visible:ring-2"
              href={memo.url}
              download={`voice-memo.${extension}`}
            >
              Download
            </a>
          ) : null}
          {busy || memo || recorder.state === "error" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                recorder.discard();
                setInputError(null);
                setPlaybackError(false);
              }}
            >
              Discard
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
