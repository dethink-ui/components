import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
} from "react";
import {
  motion as motionElement,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
  type Transition,
} from "motion/react";
import type { ButtonVariant } from "../button";
import { cn } from "../../utils/cn";

export type SoundInputState =
  | "idle"
  | "permission-request"
  | "permission-denied"
  | "recording"
  | "muted"
  | "unsupported";

export type SoundInputVariant = Exclude<ButtonVariant, "link">;
export type SoundInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SoundInputMotion = "none" | "subtle" | "standard";
export type SoundInputStopReason = "user" | "unmount" | "track-ended";

export interface SoundInputProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
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

const defaultSoundInputLabels: Record<SoundInputState, string> = {
  idle: "Start voice input",
  "permission-request": "Requesting microphone permission",
  "permission-denied": "Microphone permission denied",
  recording: "Stop voice input",
  muted: "Voice input muted",
  unsupported: "Microphone unavailable",
};

const soundInputBaseClasses =
  "relative inline-flex shrink-0 transform-gpu select-none items-center justify-start overflow-hidden border border-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[requesting=true]:cursor-wait data-[reduced-motion=true]:will-change-auto";

const soundInputVariantClasses: Record<SoundInputVariant, string> = {
  solid:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
  outline:
    "border-border bg-background text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

const soundInputStateClasses =
  "data-[state=permission-denied]:border-destructive/50 data-[state=permission-denied]:text-destructive data-[state=unsupported]:border-border data-[state=unsupported]:text-muted-foreground data-[state=muted]:opacity-80";

const soundInputSizeClasses: Record<SoundInputSize, string> = {
  xs: "[--sound-input-expanded:5.75rem] [--sound-input-icon-size:0.875rem] [--sound-input-size:1.75rem] text-xs",
  sm: "[--sound-input-expanded:6.25rem] [--sound-input-icon-size:1rem] [--sound-input-size:2rem] text-sm",
  md: "[--sound-input-expanded:7rem] [--sound-input-icon-size:1rem] [--sound-input-size:var(--dt-density-control)] text-sm",
  lg: "[--sound-input-expanded:7.75rem] [--sound-input-icon-size:1.125rem] [--sound-input-size:2.75rem] text-base",
  xl: "[--sound-input-expanded:8.25rem] [--sound-input-icon-size:1.25rem] [--sound-input-size:3rem] text-base",
};

const soundInputRootSizeClasses =
  "h-[var(--sound-input-size)] min-w-[var(--sound-input-size)] rounded-full";

const soundInputIconWrapClasses =
  "pointer-events-none inline-flex h-[var(--sound-input-size)] w-[var(--sound-input-size)] shrink-0 items-center justify-center";

const soundInputIconClasses =
  "inline-flex size-[var(--sound-input-icon-size)] items-center justify-center [&>svg]:size-full";

const soundInputWaveformClasses =
  "pointer-events-none flex min-w-0 flex-1 items-center gap-[calc(var(--dt-space-1)*0.75)] pe-[var(--dt-space-3)]";

const soundInputWaveBarClasses =
  "h-[calc(var(--sound-input-size)*0.52)] w-[0.1875rem] origin-center rounded-full bg-current opacity-90";

const soundInputTransitions: Record<SoundInputMotion, Transition> = {
  none: { duration: 0 },
  subtle: { type: "spring", stiffness: 420, damping: 38, mass: 0.85 },
  standard: { type: "spring", stiffness: 520, damping: 34, mass: 0.75 },
};

const soundInputWaveLevels = [0.38, 0.62, 0.82, 0.56, 0.74, 0.48];

// Flat resting height held when the microphone hears no sound.
const soundInputWaveIdleLevel = 0.16;
// Height held for each bar while muted (stream open, tracks disabled).
const soundInputWaveMutedLevel = 0.22;
// Smoothed loudness below this is treated as silence, so bars stay idle.
const soundInputSilenceThreshold = 0.06;
// Lowest bar height while sound is present, so active bars never fully collapse.
const soundInputWaveMinActive = 0.2;

function isActiveState(state: SoundInputState) {
  return state === "recording" || state === "muted";
}

export function getSoundInputMotionState(state: SoundInputState) {
  return isActiveState(state) ? "active" : "idle";
}

export function soundInputClassNames({
  className,
  size = "md",
  variant = "soft",
}: Pick<SoundInputProps, "className" | "size" | "variant"> = {}) {
  return cn(
    soundInputBaseClasses,
    soundInputRootSizeClasses,
    soundInputSizeClasses[size],
    soundInputVariantClasses[variant],
    soundInputStateClasses,
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
  const level0 = useMotionValue(soundInputWaveLevels[0]);
  const level1 = useMotionValue(soundInputWaveLevels[1]);
  const level2 = useMotionValue(soundInputWaveLevels[2]);
  const level3 = useMotionValue(soundInputWaveLevels[3]);
  const level4 = useMotionValue(soundInputWaveLevels[4]);
  const level5 = useMotionValue(soundInputWaveLevels[5]);
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
          muted ? soundInputWaveMutedLevel : soundInputWaveLevels[index],
        );
      });
      return undefined;
    }

    let frame = 0;
    let audioContext: AudioContext | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    let analyser: AnalyserNode | undefined;
    let data: Uint8Array<ArrayBuffer> | undefined;
    const AudioContextConstructor = getAudioContextConstructor();

    if (stream && AudioContextConstructor) {
      try {
        audioContext = new AudioContextConstructor();
        analyser = audioContext.createAnalyser();
        // 128 bins give each of the six bars a distinct frequency band.
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.7;
        data = new Uint8Array(analyser.frequencyBinCount);
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch {
        audioContext = undefined;
        source = undefined;
        analyser = undefined;
        data = undefined;
      }
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

      // Fallback with no real audio graph (demos, tests): simulate speech
      // bursts separated by silent gaps so idle-vs-active stays observable.
      const now = performance.now();
      const burst = Math.sin(now / 900);
      return burst > 0
        ? burst * (0.55 + 0.45 * Math.abs(Math.sin(now / 180)))
        : 0;
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

      const now = performance.now();
      return (
        envelope * (0.5 + 0.5 * Math.abs(Math.sin(now / 160 + index * 1.3)))
      );
    };

    const update = () => {
      const amplitude = readAmplitude();
      envelope += (amplitude - envelope) * (amplitude > envelope ? 0.4 : 0.12);

      if (envelope <= soundInputSilenceThreshold) {
        // Silence: hold the flat idle position with no oscillation.
        levels.forEach((level) => level.set(soundInputWaveIdleLevel));
      } else {
        const now = performance.now();
        levels.forEach((level, index) => {
          const band = readBand(index);
          // Scale the liveliness wobble by loudness so it fades out with sound.
          const life = Math.sin(now / 150 + index * 1.1) * 0.1 * envelope;
          level.set(
            Math.max(
              soundInputWaveMinActive,
              Math.min(1, soundInputWaveIdleLevel + band * 1.2 + life),
            ),
          );
        });
      }

      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frame);
      source?.disconnect();
      analyser?.disconnect();
      void audioContext?.close();
    };
  }, [active, levels, muted, reducedMotion, stream]);

  return springs;
}

function SoundInputWaveform({
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
      data-slot="sound-input-waveform"
      className={soundInputWaveformClasses}
    >
      {levels.map((level, index) => (
        <motionElement.span
          key={index}
          data-slot="sound-input-wave-bar"
          className={soundInputWaveBarClasses}
          style={{ scaleY: level as MotionValue<number> }}
        />
      ))}
    </span>
  );
}

export const SoundInput = forwardRef<HTMLButtonElement, SoundInputProps>(
  (
    {
      "aria-busy": ariaBusy,
      audio = true,
      className,
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
    const prefersReducedMotion = useReducedMotion();
    const reducedMotion = motion === "none" || prefersReducedMotion === true;
    const transition = reducedMotion
      ? soundInputTransitions.none
      : soundInputTransitions[motion];
    const [state, setState] = useState<SoundInputState>("idle");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(false);
    const requestIdRef = useRef(0);
    const removeTrackListenersRef = useRef<() => void>(() => undefined);
    // Latest onStop, so the unmount cleanup never re-subscribes on prop-identity
    // changes and tears down a live stream mid-recording.
    const onStopRef = useRef(onStop);
    const resolvedLabels = { ...defaultSoundInputLabels, ...labels };
    const active = isActiveState(state);
    const requesting = state === "permission-request";
    const activationDisabled = disabled || requesting;
    const motionState = getSoundInputMotionState(state);

    const setSoundInputState = useCallback(
      (nextState: SoundInputState) => {
        setState(nextState);
        onStateChange?.(nextState);
      },
      [onStateChange],
    );

    const stopOwnedStream = useCallback(
      (reason: SoundInputStopReason) => {
        const currentStream = streamRef.current;

        requestIdRef.current += 1;
        removeTrackListenersRef.current();
        removeTrackListenersRef.current = () => undefined;
        streamRef.current = null;
        setStream(null);

        if (!currentStream) {
          if (state !== "idle") {
            setSoundInputState("idle");
          }
          return;
        }

        stopMediaStream(currentStream);
        setSoundInputState("idle");
        onStop?.(currentStream, reason);
      },
      [onStop, setSoundInputState, state],
    );

    const attachTrackListeners = useCallback(
      (nextStream: MediaStream) => {
        removeTrackListenersRef.current();

        const removers: Array<() => void> = [];
        const handleEnded = () => {
          stopOwnedStream("track-ended");
        };

        for (const track of nextStream.getTracks()) {
          track.addEventListener?.("ended", handleEnded);
          removers.push(() => {
            track.removeEventListener?.("ended", handleEnded);
          });
        }

        removeTrackListenersRef.current = () => {
          for (const remove of removers) {
            remove();
          }
        };
      },
      [stopOwnedStream],
    );

    const startStream = useCallback(async () => {
      const mediaDevices = getMediaDevices();
      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;

      if (!mediaDevices) {
        setSoundInputState("unsupported");
        onError?.(
          new Error("navigator.mediaDevices.getUserMedia is not available."),
          "unsupported",
        );
        return;
      }

      setSoundInputState("permission-request");

      try {
        const nextStream = await mediaDevices.getUserMedia({
          audio,
          video: false,
        });

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          stopMediaStream(nextStream);
          return;
        }

        setTrackMuted(nextStream, muted);
        streamRef.current = nextStream;
        setStream(nextStream);
        attachTrackListeners(nextStream);
        onStream?.(nextStream);
        setSoundInputState(muted ? "muted" : "recording");
      } catch (error) {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setSoundInputState("permission-denied");
        onError?.(error, "permission-denied");
      }
    }, [
      attachTrackListeners,
      audio,
      muted,
      onError,
      onStream,
      setSoundInputState,
    ]);

    useEffect(() => {
      onStopRef.current = onStop;
    }, [onStop]);

    useEffect(() => {
      mountedRef.current = true;

      return () => {
        mountedRef.current = false;
        const currentStream = streamRef.current;

        requestIdRef.current += 1;
        removeTrackListenersRef.current();
        removeTrackListenersRef.current = () => undefined;
        streamRef.current = null;

        if (currentStream) {
          stopMediaStream(currentStream);
          onStopRef.current?.(currentStream, "unmount");
        }
      };
    }, []);

    useEffect(() => {
      const currentStream = streamRef.current;

      if (!currentStream) {
        return;
      }

      setTrackMuted(currentStream, muted);
      setSoundInputState(muted ? "muted" : "recording");
    }, [muted, setSoundInputState]);

    useEffect(() => {
      if (disabled && streamRef.current) {
        stopOwnedStream("user");
      }
    }, [disabled, stopOwnedStream]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (activationDisabled) {
        event.preventDefault();
        return;
      }

      if (active) {
        stopOwnedStream("user");
      } else {
        void startStream();
      }

      onClick?.(event);
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
        data-slot="sound-input"
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
        className={soundInputClassNames({ className, size, variant })}
        initial={false}
        animate={{
          width: active
            ? "var(--sound-input-expanded)"
            : "var(--sound-input-size)",
        }}
        whileTap={
          activationDisabled || reducedMotion ? undefined : { scale: 0.96 }
        }
        transition={transition}
        onClick={handleClick}
      >
        <span
          aria-hidden="true"
          data-slot="sound-input-icon-wrap"
          className={soundInputIconWrapClasses}
        >
          <motionElement.span
            data-slot="sound-input-icon"
            className={soundInputIconClasses}
            animate={{
              opacity: active && state !== "muted" ? 0.92 : 1,
              scale: active && !reducedMotion ? 0.92 : 1,
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
          data-slot="sound-input-waveform-motion"
          className="min-w-0 flex-1 overflow-hidden"
          animate={{
            opacity: active ? 1 : 0,
            width: active ? "auto" : 0,
          }}
          transition={transition}
        >
          <SoundInputWaveform
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

SoundInput.displayName = "SoundInput";
