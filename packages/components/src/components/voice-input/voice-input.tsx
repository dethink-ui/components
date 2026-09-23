import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type Ref,
} from "react";
import {
  motion as motionElement,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
  type Transition,
} from "motion/react";
import type { ButtonVariant } from "../button";
import { cn } from "../../utils/cn";

export type VoiceInputState =
  | "idle"
  | "permission-request"
  | "permission-denied"
  | "device-not-found"
  | "device-busy"
  | "constraints-error"
  | "error"
  | "recording"
  | "muted"
  | "unsupported";

export type VoiceInputVariant = Exclude<ButtonVariant, "link">;
export type VoiceInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type VoiceInputMotion = "none" | "subtle" | "standard";
export type VoiceInputStopReason =
  "user" | "unmount" | "track-ended" | "cancel" | "disabled" | "error";

export interface VoiceInputController {
  stop: () => void;
  cancel: () => void;
}

export type VoiceInputMediaRequest = (
  constraints: MediaStreamConstraints,
) => Promise<MediaStream>;

export interface VoiceInputProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label" | "aria-labelledby" | "onError"
> {
  variant?: VoiceInputVariant;
  size?: VoiceInputSize;
  motion?: VoiceInputMotion;
  muted?: boolean;
  audio?: boolean | MediaTrackConstraints;
  controllerRef?: Ref<VoiceInputController>;
  getUserMedia?: VoiceInputMediaRequest;
  labels?: Partial<Record<VoiceInputState, string>>;
  onStream?: (stream: MediaStream) => void;
  onStop?: (stream: MediaStream, reason: VoiceInputStopReason) => void;
  onError?: (error: unknown, state: VoiceInputState) => void;
  onStateChange?: (state: VoiceInputState) => void;
}

const defaultVoiceInputLabels: Record<VoiceInputState, string> = {
  idle: "Start voice input",
  "permission-request": "Cancel microphone request",
  "permission-denied": "Microphone permission denied",
  "device-not-found": "No microphone found. Connect a microphone and retry",
  "device-busy": "Microphone busy. Close other apps and retry",
  "constraints-error":
    "Microphone settings unavailable. Change settings and retry",
  error: "Voice input failed. Try again",
  recording: "Stop voice input",
  muted: "Voice input muted",
  unsupported: "Microphone unavailable",
};

const voiceInputBaseClasses =
  "relative inline-flex shrink-0 transform-gpu select-none items-center justify-start overflow-hidden border border-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[requesting=true]:cursor-wait data-[reduced-motion=true]:will-change-auto";

const voiceInputVariantClasses: Record<VoiceInputVariant, string> = {
  solid:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
  outline:
    "border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

const voiceInputStateClasses =
  "data-[state=permission-denied]:border-destructive/50 data-[state=permission-denied]:text-destructive data-[state=unsupported]:border-border data-[state=unsupported]:text-muted-foreground data-[state=muted]:opacity-80";

const voiceInputSizeClasses: Record<VoiceInputSize, string> = {
  xs: "[--voice-input-icon-size:0.875rem] [--voice-input-size:1.75rem] text-xs",
  sm: "[--voice-input-icon-size:1rem] [--voice-input-size:2rem] text-sm",
  md: "[--voice-input-icon-size:1rem] [--voice-input-size:var(--dt-density-control)] text-sm",
  lg: "[--voice-input-icon-size:1.125rem] [--voice-input-size:2.75rem] text-base",
  xl: "[--voice-input-icon-size:1.25rem] [--voice-input-size:3rem] text-base",
};

const voiceInputRootSizeClasses =
  "size-[var(--voice-input-size)] min-w-[var(--voice-input-size)] rounded-full";

const voiceInputIconWrapClasses =
  "pointer-events-none absolute inset-0 inline-flex items-center justify-center";

const voiceInputIconClasses =
  "inline-flex size-[var(--voice-input-icon-size)] items-center justify-center [&>svg]:size-full";

const voiceInputWaveformClasses = "pointer-events-none absolute inset-0";

const voiceInputWaveBarClasses =
  "absolute left-1/2 top-[9%] h-[16%] w-[max(1px,calc(var(--voice-input-size)*0.035))] -translate-x-1/2 origin-bottom rounded-full bg-current opacity-90";

const voiceInputTransitions: Record<VoiceInputMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 420, damping: 38, mass: 0.85 },
  standard: { type: "spring", stiffness: 520, damping: 34, mass: 0.75 },
};

const voiceInputWaveLevels = [0.3, 0.3, 0.3, 0.3, 0.3, 0.3];

// Resting ray length held when the microphone hears no sound.
const voiceInputWaveIdleLevel = 0.3;
// Length held for each ray while muted (stream open, tracks disabled).
const voiceInputWaveMutedLevel = 0.3;
// Smoothed loudness below this is treated as silence, so rays stay idle.
const voiceInputSilenceThreshold = 0.06;
// Lowest ray length while sound is present, so active rays never fully collapse.
const voiceInputWaveMinActive = 0.3;

function isActiveState(state: VoiceInputState) {
  return state === "recording" || state === "muted";
}

export function getVoiceInputMotionState(state: VoiceInputState) {
  return isActiveState(state) ? "active" : "idle";
}

export function voiceInputClassNames({
  className,
  size = "md",
  variant = "soft",
}: Pick<VoiceInputProps, "className" | "size" | "variant"> = {}) {
  return cn(
    voiceInputBaseClasses,
    voiceInputRootSizeClasses,
    voiceInputSizeClasses[size],
    voiceInputVariantClasses[variant],
    voiceInputStateClasses,
    className,
  );
}

function DefaultMicrophoneIcon({
  muted = false,
  reducedMotion = false,
  transition,
}: {
  muted?: boolean;
  reducedMotion?: boolean;
  transition?: Transition;
}) {
  const slashTransition = reducedMotion ? { duration: 0 } : transition;

  return (
    <svg aria-hidden="true" fill="none" focusable="false" viewBox="0 0 24 24">
      <path
        d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* Diagonal "mic off" slash, drawn in when muted. */}
      <motionElement.line
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
        initial={false}
        animate={{ pathLength: muted ? 1 : 0, opacity: muted ? 1 : 0 }}
        transition={slashTransition}
      />
    </svg>
  );
}

function setTrackMuted(stream: MediaStream, muted: boolean) {
  for (const track of stream.getAudioTracks()) {
    track.enabled = !muted;
  }
}

function stopMediaStream(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function getMediaDevices() {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    return undefined;
  }

  return navigator.mediaDevices;
}

function getAudioContextConstructor() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.AudioContext;
}

function subscribeReducedMotion(notify: () => void) {
  const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  media?.addEventListener("change", notify);
  return () => media?.removeEventListener("change", notify);
}

function useReducedMotionPreference() {
  // A server snapshot keeps hydration stable and prevents motion before the
  // browser preference is known. Subscribe so OS changes apply to live streams.
  return useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    () => true,
  );
}

function useWaveformMotionValues({
  active,
  muted,
  reducedMotion,
  stream,
}: {
  active: boolean;
  muted: boolean;
  reducedMotion: boolean;
  stream: MediaStream | null;
}) {
  const level0 = useMotionValue(voiceInputWaveLevels[0]);
  const level1 = useMotionValue(voiceInputWaveLevels[1]);
  const level2 = useMotionValue(voiceInputWaveLevels[2]);
  const level3 = useMotionValue(voiceInputWaveLevels[3]);
  const level4 = useMotionValue(voiceInputWaveLevels[4]);
  const level5 = useMotionValue(voiceInputWaveLevels[5]);
  const levels = useMemo(
    () => [level0, level1, level2, level3, level4, level5],
    [level0, level1, level2, level3, level4, level5],
  );
  const spring0 = useSpring(level0, { stiffness: 520, damping: 42, mass: 0.6 });
  const spring1 = useSpring(level1, { stiffness: 520, damping: 42, mass: 0.6 });
  const spring2 = useSpring(level2, { stiffness: 520, damping: 42, mass: 0.6 });
  const spring3 = useSpring(level3, { stiffness: 520, damping: 42, mass: 0.6 });
  const spring4 = useSpring(level4, { stiffness: 520, damping: 42, mass: 0.6 });
  const spring5 = useSpring(level5, { stiffness: 520, damping: 42, mass: 0.6 });
  const springs = useMemo(
    () => [spring0, spring1, spring2, spring3, spring4, spring5],
    [spring0, spring1, spring2, spring3, spring4, spring5],
  );

  useEffect(() => {
    if (!active || muted || reducedMotion) {
      levels.forEach((level, index) => {
        level.set(
          muted ? voiceInputWaveMutedLevel : voiceInputWaveLevels[index],
        );
      });
      return undefined;
    }

    let frame = 0;
    let audioContext: AudioContext | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    let analyser: AnalyserNode | undefined;
    let data: Uint8Array<ArrayBuffer> | undefined;
    let disposed = false;
    const AudioContextConstructor = getAudioContextConstructor();
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      source?.disconnect();
      analyser?.disconnect();
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close().catch(() => undefined);
      }
    };
    const rest = () =>
      levels.forEach((level) => level.set(voiceInputWaveIdleLevel));

    if (stream && AudioContextConstructor) {
      try {
        audioContext = new AudioContextConstructor();
        analyser = audioContext.createAnalyser();
        // 128 bins give each of the six ray groups a distinct frequency band.
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.7;
        data = new Uint8Array(analyser.frequencyBinCount);
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        if (audioContext.state === "suspended") {
          void audioContext.resume().catch(() => {
            if (disposed) return;
            window.cancelAnimationFrame(frame);
            rest();
            dispose();
          });
        }
      } catch {
        dispose();
        audioContext = undefined;
        source = undefined;
        analyser = undefined;
        data = undefined;
      }
    }

    if (!analyser || !data) {
      rest();
      return dispose;
    }

    // Voice energy sits in the lower spectrum, so ignore the sparse high bins.
    const usableBins = data ? Math.max(1, Math.floor(data.length * 0.7)) : 0;
    // Smoothed loudness envelope: quick to rise, slower to settle into idle.
    let envelope = 0;

    const readAmplitude = () => {
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        let total = 0;
        for (let index = 0; index < usableBins; index += 1) {
          total += data[index];
        }
        return Math.min(1, (total / usableBins / 255) * 2.6);
      }

      return 0;
    };

    const readBand = (index: number) => {
      if (analyser && data) {
        const from = Math.floor((index / levels.length) * usableBins);
        const to = Math.max(
          from + 1,
          Math.floor(((index + 1) / levels.length) * usableBins),
        );
        let sum = 0;
        for (let bin = from; bin < to; bin += 1) {
          sum += data[bin];
        }
        return sum / (to - from) / 255;
      }

      return 0;
    };

    const update = () => {
      if (disposed) return;
      const amplitude = readAmplitude();
      envelope += (amplitude - envelope) * (amplitude > envelope ? 0.4 : 0.12);

      if (envelope <= voiceInputSilenceThreshold) {
        // Silence: hold the flat idle position with no oscillation.
        levels.forEach((level) => level.set(voiceInputWaveIdleLevel));
      } else {
        levels.forEach((level, index) => {
          const band = readBand(index);
          level.set(
            Math.max(
              voiceInputWaveMinActive,
              Math.min(
                1,
                voiceInputWaveIdleLevel + band * 1.2 + envelope * 0.2,
              ),
            ),
          );
        });
      }

      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frame);
      dispose();
    };
  }, [active, levels, muted, reducedMotion, stream]);

  return reducedMotion ? levels : springs;
}

function VoiceInputWaveform({
  active,
  muted,
  reducedMotion,
  stream,
}: {
  active: boolean;
  muted: boolean;
  reducedMotion: boolean;
  stream: MediaStream | null;
}) {
  const levels = useWaveformMotionValues({
    active,
    muted,
    reducedMotion,
    stream,
  });

  return (
    <span
      aria-hidden="true"
      data-slot="voice-input-waveform"
      className={voiceInputWaveformClasses}
      style={{ opacity: muted ? 0.5 : 1 }}
    >
      {Array.from({ length: 24 }, (_, index) => (
        <span
          key={index}
          className="absolute inset-0"
          style={{ transform: `rotate(${index * 15}deg)` }}
        >
          <motionElement.span
            data-slot="voice-input-wave-bar"
            className={voiceInputWaveBarClasses}
            style={{
              scaleY: levels[index % levels.length] as MotionValue<number>,
            }}
          />
        </span>
      ))}
    </span>
  );
}

export const VoiceInput = forwardRef<HTMLButtonElement, VoiceInputProps>(
  (
    {
      "aria-busy": ariaBusy,
      audio = true,
      className,
      controllerRef,
      getUserMedia,
      disabled = false,
      labels,
      motion = "standard",
      muted = false,
      onClick,
      onError,
      onStateChange,
      onStop,
      onStream,
      size = "md",
      type = "button",
      variant = "soft",
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotionPreference();
    const reducedMotion = motion === "none" || prefersReducedMotion === true;
    const transition = reducedMotion
      ? voiceInputTransitions.none
      : voiceInputTransitions[motion];
    const [state, setState] = useState<VoiceInputState>("idle");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(false);
    const requestIdRef = useRef(0);
    const removeTrackListenersRef = useRef<() => void>(() => undefined);
    const current = useRef({
      muted,
      disabled,
      audio,
      onStream,
      onStop,
      onError,
      onStateChange,
      getUserMedia,
    });
    useEffect(() => {
      current.current = {
        muted,
        disabled,
        audio,
        onStream,
        onStop,
        onError,
        onStateChange,
        getUserMedia,
      };
    });
    const stateRef = useRef<VoiceInputState>("idle");
    const resolvedLabels = { ...defaultVoiceInputLabels, ...labels };
    const active = isActiveState(state);
    const requesting = state === "permission-request";
    const activationDisabled = disabled;
    const motionState = getVoiceInputMotionState(state);

    const reportError = useCallback((error: unknown, next: VoiceInputState) => {
      // A consumer error handler must not create an unhandled async rejection.
      try {
        current.current.onError?.(error, next);
      } catch (callbackError) {
        console.error("VoiceInput onError callback failed", callbackError);
      }
    }, []);

    const updateState = useCallback((next: VoiceInputState) => {
      if (stateRef.current === next) return;
      stateRef.current = next;
      if (mountedRef.current) setState(next);
      current.current.onStateChange?.(next);
    }, []);

    const release = useCallback(
      (reason: VoiceInputStopReason) => {
        requestIdRef.current += 1;
        removeTrackListenersRef.current();
        removeTrackListenersRef.current = () => undefined;
        const owned = streamRef.current;
        streamRef.current = null;
        if (mountedRef.current) setStream(null);
        if (owned) {
          stopMediaStream(owned);
          try {
            current.current.onStop?.(owned, reason);
          } catch (error) {
            reportError(error, "error");
          }
        }
      },
      [reportError],
    );

    const fail = useCallback(
      (error: unknown, next: VoiceInputState = "error") => {
        release("error");
        try {
          updateState(next);
        } catch (callbackError) {
          reportError(callbackError, "error");
        }
        reportError(error, next);
      },
      [release, reportError, updateState],
    );

    const stopOwnedStream = useCallback(
      (reason: VoiceInputStopReason) => {
        release(reason);
        try {
          updateState("idle");
        } catch (error) {
          fail(error);
        }
      },
      [fail, release, updateState],
    );

    useImperativeHandle(
      controllerRef,
      () => ({
        stop: () => stopOwnedStream("user"),
        cancel: () => stopOwnedStream("cancel"),
      }),
      [stopOwnedStream],
    );

    const startStream = useCallback(async () => {
      if (
        current.current.disabled ||
        streamRef.current ||
        stateRef.current === "permission-request"
      )
        return;
      const requestId = ++requestIdRef.current;
      const mediaDevices = getMediaDevices();
      const acquire =
        current.current.getUserMedia ??
        mediaDevices?.getUserMedia.bind(mediaDevices);
      if (!acquire) {
        fail(
          new Error(
            "Microphone access requires a supported browser and a secure context.",
          ),
          "unsupported",
        );
        return;
      }
      try {
        updateState("permission-request");
      } catch (error) {
        fail(error);
        return;
      }
      if (requestId !== requestIdRef.current) return;
      let nextStream: MediaStream;
      // Only browser acquisition errors belong to the permission/device taxonomy.
      try {
        nextStream = await acquire({
          audio: current.current.audio,
          video: false,
        });
      } catch (error) {
        if (mountedRef.current && requestId === requestIdRef.current) {
          const name =
            typeof error === "object" && error !== null && "name" in error
              ? error.name
              : "";
          const next: VoiceInputState =
            name === "NotAllowedError" || name === "SecurityError"
              ? "permission-denied"
              : name === "NotSupportedError"
                ? "unsupported"
                : name === "NotFoundError"
                  ? "device-not-found"
                  : name === "NotReadableError" || name === "AbortError"
                    ? "device-busy"
                    : name === "OverconstrainedError" || name === "TypeError"
                      ? "constraints-error"
                      : "error";
          fail(error, next);
        }
        return;
      }
      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current ||
        current.current.disabled
      ) {
        stopMediaStream(nextStream);
        return;
      }
      streamRef.current = nextStream;
      try {
        if (
          !nextStream
            .getAudioTracks()
            .some((track) => track.readyState !== "ended")
        ) {
          throw new Error("The microphone returned no live audio track.");
        }
        setTrackMuted(nextStream, current.current.muted);
        const ended = () => stopOwnedStream("track-ended");
        const tracks = nextStream.getTracks();
        tracks.forEach((track) => track.addEventListener("ended", ended));
        removeTrackListenersRef.current = () =>
          tracks.forEach((track) => track.removeEventListener("ended", ended));
        setStream(nextStream);
        updateState(current.current.muted ? "muted" : "recording");
        // State callbacks may synchronously stop/cancel the newly acquired stream.
        if (streamRef.current === nextStream)
          current.current.onStream?.(nextStream);
      } catch (error) {
        fail(error);
      }
    }, [fail, stopOwnedStream, updateState]);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
        release("unmount");
        stateRef.current = "idle";
      };
    }, [release]);

    useEffect(() => {
      if (disabled) {
        stopOwnedStream("disabled");
        return;
      }
      const owned = streamRef.current;
      if (owned) {
        setTrackMuted(owned, muted);
        try {
          updateState(muted ? "muted" : "recording");
        } catch (error) {
          fail(error);
        }
      }
    }, [disabled, muted, fail, stopOwnedStream, updateState]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (activationDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (streamRef.current || stateRef.current === "permission-request") {
        stopOwnedStream(
          stateRef.current === "permission-request" ? "cancel" : "user",
        );
      } else {
        void startStream();
      }
    };

    return (
      <motionElement.button
        {...(props as HTMLMotionProps<"button">)}
        ref={ref}
        type={type}
        disabled={disabled}
        aria-label={resolvedLabels[state]}
        aria-busy={requesting ? true : ariaBusy}
        aria-pressed={active ? true : undefined}
        data-slot="voice-input"
        data-state={state}
        data-motion-state={motionState}
        data-variant={variant}
        data-size={size}
        data-motion={motion}
        data-active={active ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-muted={state === "muted" ? "true" : undefined}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        data-requesting={requesting ? "true" : undefined}
        className={voiceInputClassNames({ className, size, variant })}
        initial={false}
        whileTap={
          activationDisabled || reducedMotion ? undefined : { scale: 0.96 }
        }
        transition={transition}
        onClick={handleClick}
      >
        <span
          aria-hidden="true"
          data-slot="voice-input-icon-wrap"
          className={voiceInputIconWrapClasses}
        >
          <motionElement.span
            data-slot="voice-input-icon"
            className={voiceInputIconClasses}
            animate={{
              opacity: active && state !== "muted" ? 0.92 : 1,
              scale: active ? 0.65 : 1,
            }}
            transition={transition}
          >
            <DefaultMicrophoneIcon
              muted={state === "muted"}
              reducedMotion={reducedMotion}
              transition={transition}
            />
          </motionElement.span>
        </span>
        <motionElement.span
          data-slot="voice-input-waveform-motion"
          className="pointer-events-none absolute inset-0"
          animate={{
            opacity: active ? 1 : 0,
          }}
          transition={transition}
        >
          <VoiceInputWaveform
            active={active}
            muted={state === "muted"}
            reducedMotion={reducedMotion}
            stream={stream}
          />
        </motionElement.span>
      </motionElement.button>
    );
  },
);

VoiceInput.displayName = "VoiceInput";
