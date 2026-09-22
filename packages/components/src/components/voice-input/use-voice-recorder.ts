import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceInputStopReason } from "./voice-input";

export type VoiceRecorderState =
  "idle" | "recording" | "paused" | "finalizing" | "ready" | "error";
export type VoiceRecorderStopReason = VoiceInputStopReason | "duration-limit";
export interface VoiceRecording {
  blob: Blob;
  url: string;
  mimeType: string;
  durationMs: number;
  reason: VoiceRecorderStopReason;
}
export interface UseVoiceRecorderOptions {
  /** Active recording time, excluding pauses. Changes apply to the next take. */
  maxDurationMs?: number;
  mimeType?: string;
  onRecording?: (recording: VoiceRecording) => void;
  onError?: (error: unknown) => void;
  /** Synchronize a VoiceInput controller after this hook releases its tracks. */
  onRelease?: () => void;
}
export interface VoiceRecorder {
  state: VoiceRecorderState;
  elapsedMs: number;
  recording: VoiceRecording | null;
  error: unknown;
  start: (stream: MediaStream) => void;
  stop: (reason?: VoiceRecorderStopReason) => void;
  pause: () => void;
  resume: () => void;
  discard: () => void;
}

interface Session {
  recorder: MediaRecorder;
  stream: MediaStream;
  chunks: Blob[];
  elapsed: number;
  since: number | null;
  limit: number;
  finishing: boolean;
  released: boolean;
  reason: VoiceRecorderStopReason;
  timer?: ReturnType<typeof setInterval>;
  deadline?: ReturnType<typeof setTimeout>;
  detach: () => void;
}

function clearClock(session: Session) {
  clearInterval(session.timer);
  clearTimeout(session.deadline);
}
function elapsed(session: Session) {
  return (
    session.elapsed +
    (session.since === null ? 0 : performance.now() - session.since)
  );
}
function pauseClock(session: Session) {
  session.elapsed = elapsed(session);
  session.since = null;
  clearClock(session);
}

/** Local recording only. Owns handed-in tracks until stop, discard, or unmount. */
export function useVoiceRecorder(
  options: UseVoiceRecorderOptions = {},
): VoiceRecorder {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recording, setRecording] = useState<VoiceRecording | null>(null);
  const [error, setError] = useState<unknown>(null);
  const current = useRef(options);
  const sessionRef = useRef<Session | null>(null);
  const urlRef = useRef<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    current.current = options;
  });

  const revoke = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);
  const report = useCallback((cause: unknown) => {
    if (mounted.current) {
      setError(cause);
      setState("error");
    }
    try {
      current.current.onError?.(cause);
    } catch (callbackError) {
      console.error("useVoiceRecorder onError callback failed", callbackError);
    }
  }, []);
  const release = useCallback(
    (session: Session) => {
      if (session.released) return;
      session.released = true;
      session.stream.getTracks().forEach((track) => track.stop());
      try {
        current.current.onRelease?.();
      } catch (cause) {
        report(cause);
      }
    },
    [report],
  );
  const dispose = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (!session) return;
    clearClock(session);
    session.detach();
    try {
      if (session.recorder.state !== "inactive") session.recorder.stop();
    } finally {
      release(session);
    }
  }, [release]);
  const fail = useCallback(
    (cause: unknown) => {
      try {
        dispose();
      } finally {
        report(cause);
      }
    },
    [dispose, report],
  );

  const stop = useCallback(
    (reason: VoiceRecorderStopReason = "user") => {
      const session = sessionRef.current;
      if (!session || session.finishing) return;
      session.finishing = true;
      session.reason = reason;
      pauseClock(session);
      setElapsedMs(Math.min(session.elapsed, session.limit));
      setState("finalizing");
      try {
        if (session.recorder.state !== "inactive") session.recorder.stop();
        release(session);
      } catch (cause) {
        fail(cause);
      }
    },
    [fail, release],
  );

  const runClock = useCallback(
    (session: Session) => {
      session.since = performance.now();
      session.timer = setInterval(() => {
        if (sessionRef.current === session)
          setElapsedMs(Math.min(elapsed(session), session.limit));
      }, 100);
      if (Number.isFinite(session.limit)) {
        session.deadline = setTimeout(
          () => {
            if (sessionRef.current === session) stop("duration-limit");
          },
          Math.max(0, session.limit - session.elapsed),
        );
      }
    },
    [stop],
  );

  const start = useCallback(
    (stream: MediaStream) => {
      if (!mounted.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      // Dispose first: queued final events from the previous take cannot publish.
      dispose();
      revoke();
      setRecording(null);
      setElapsedMs(0);
      setError(null);
      let session: Session | null = null;
      try {
        if (typeof MediaRecorder === "undefined")
          throw new Error("Audio recording is not supported in this browser.");
        const requested = current.current.mimeType;
        if (requested && !MediaRecorder.isTypeSupported(requested))
          throw new Error("The requested recording format is not supported.");
        const mimeType =
          requested ??
          ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"].find(
            (type) => MediaRecorder.isTypeSupported(type),
          );
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        const max = current.current.maxDurationMs;
        if (
          max !== undefined &&
          (!Number.isFinite(max) || max <= 0 || max > 2_147_483_647)
        )
          throw new Error(
            "maxDurationMs must be a positive finite duration below 2^31 milliseconds.",
          );
        session = {
          recorder,
          stream,
          chunks: [],
          elapsed: 0,
          since: null,
          limit: max ?? Infinity,
          finishing: false,
          released: false,
          reason: "user",
          detach: () => undefined,
        };
        const take = session;
        const data = (event: BlobEvent) => {
          if (sessionRef.current === take && event.data.size)
            take.chunks.push(event.data);
        };
        const ended = () => stop("track-ended");
        const failed = () =>
          fail(
            new Error("Recording failed. Check your microphone and try again."),
          );
        const done = () => {
          if (!mounted.current || sessionRef.current !== take) return;
          if (!take.finishing) {
            take.reason = "track-ended";
            pauseClock(take);
          }
          take.detach();
          sessionRef.current = null;
          release(take);
          try {
            const blob = new Blob(take.chunks, {
              type:
                recorder.mimeType ||
                take.chunks[0]?.type ||
                "application/octet-stream",
            });
            if (!blob.size)
              throw new Error("No audio was recorded. Try a longer recording.");
            revoke();
            const url = URL.createObjectURL(blob);
            urlRef.current = url;
            const result: VoiceRecording = {
              blob,
              url,
              mimeType: blob.type,
              durationMs: Math.min(take.elapsed, take.limit),
              reason: take.reason,
            };
            setElapsedMs(result.durationMs);
            setRecording(result);
            setState("ready");
            current.current.onRecording?.(result);
          } catch (cause) {
            report(cause);
          }
        };
        take.detach = () => {
          recorder.removeEventListener("dataavailable", data);
          recorder.removeEventListener("stop", done);
          recorder.removeEventListener("error", failed);
          stream
            .getTracks()
            .forEach((track) => track.removeEventListener("ended", ended));
        };
        sessionRef.current = take;
        recorder.addEventListener("dataavailable", data);
        recorder.addEventListener("stop", done);
        recorder.addEventListener("error", failed);
        stream
          .getTracks()
          .forEach((track) => track.addEventListener("ended", ended));
        recorder.start(1000);
        setState("recording");
        runClock(take);
      } catch (cause) {
        if (!session) {
          stream.getTracks().forEach((track) => track.stop());
          try {
            current.current.onRelease?.();
          } catch (releaseError) {
            report(releaseError);
          }
        }
        fail(cause);
      }
    },
    [dispose, fail, release, report, revoke, runClock, stop],
  );

  const pause = useCallback(() => {
    const take = sessionRef.current;
    if (!take || take.finishing || take.recorder.state !== "recording") return;
    try {
      take.recorder.pause();
      pauseClock(take);
      setElapsedMs(take.elapsed);
      setState("paused");
    } catch (cause) {
      fail(cause);
    }
  }, [fail]);
  const resume = useCallback(() => {
    const take = sessionRef.current;
    if (!take || take.finishing || take.recorder.state !== "paused") return;
    try {
      take.recorder.resume();
      runClock(take);
      setState("recording");
    } catch (cause) {
      fail(cause);
    }
  }, [fail, runClock]);
  const discard = useCallback(() => {
    dispose();
    revoke();
    setRecording(null);
    setElapsedMs(0);
    setError(null);
    setState("idle");
  }, [dispose, revoke]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      dispose();
      revoke();
    };
  }, [dispose, revoke]);

  return {
    state,
    elapsedMs,
    recording,
    error,
    start,
    stop,
    pause,
    resume,
    discard,
  };
}
