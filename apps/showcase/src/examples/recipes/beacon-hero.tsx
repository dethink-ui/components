"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";
import {
  AvatarGroup,
  Badge,
  Button,
  Card,
  HeroTextAnimation,
  IconButton,
  ScanGridBackground,
  Steps,
  cn,
  type AvatarGroupMember,
  type BadgeTone,
  type StepItemData,
} from "@dethink/components";

/*
 * The Beacon hero shows the product doing its one job: a scripted incident
 * replays from alert to resolution beside the headline. Each phase advances
 * Steps, adds an activity-log entry, pages responders and redraws a latency
 * chart. The replay pauses off-screen and on hidden tabs, has pause and
 * replay controls, and starts on the resolved state for reduced motion.
 */

const PHASE_MS = 2400;
const HOLD_MS = 4200;

type Phase = {
  step: string;
  status: string;
  tone: BadgeTone;
  elapsed: string;
  latency: number[];
};

const phases: Phase[] = [
  {
    step: "triggered",
    status: "Triggered",
    tone: "destructive",
    elapsed: "00:00",
    latency: [320, 330, 310, 340, 360, 910, 1480, 2100, 2350, 2400, 2380, 2420],
  },
  {
    step: "acknowledged",
    status: "Acknowledged",
    tone: "warning",
    elapsed: "00:38",
    latency: [
      330, 310, 340, 360, 910, 1480, 2100, 2350, 2400, 2380, 2420, 2460,
    ],
  },
  {
    step: "acknowledged",
    status: "Investigating",
    tone: "warning",
    elapsed: "02:05",
    latency: [
      340, 360, 910, 1480, 2100, 2350, 2400, 2380, 2420, 2460, 2410, 2390,
    ],
  },
  {
    step: "mitigated",
    status: "Mitigated",
    tone: "info",
    elapsed: "04:51",
    latency: [
      1480, 2100, 2350, 2400, 2380, 2420, 2460, 2410, 1650, 900, 520, 400,
    ],
  },
  {
    step: "resolved",
    status: "Resolved",
    tone: "success",
    elapsed: "06:12",
    latency: [2400, 2380, 2420, 2460, 2410, 1650, 900, 520, 400, 350, 330, 320],
  },
];

const LAST_PHASE = phases.length - 1;
const LATENCY_MAX = 2600;
const SLO_MS = 800;

const stepItems: StepItemData[] = [
  { id: "triggered", label: "Triggered" },
  {
    id: "acknowledged",
    label: (
      <>
        <span className="sm:hidden">Acked</span>
        <span className="max-sm:hidden">Acknowledged</span>
      </>
    ),
  },
  { id: "mitigated", label: "Mitigated" },
  { id: "resolved", label: "Resolved" },
];

const events = [
  {
    id: "alert",
    title: "p95 latency above 2s on checkout",
    detail: "Grouped 14 alerts from Datadog and Sentry",
    time: "09:42:03",
  },
  {
    id: "ack",
    title: "Maya acknowledged",
    detail: "Paged primary on-call · Jon and Priya joined",
    time: "09:42:41",
  },
  {
    id: "cause",
    title: "Copilot: deploy #4812 likely cause",
    detail: "auth-proxy v4.18 shipped 3 min before the spike",
    time: "09:44:08",
  },
  {
    id: "rollback",
    title: "Rolled back to v4.17",
    detail: "Latency recovering in all regions",
    time: "09:46:54",
  },
  {
    id: "resolved",
    title: "Resolved · status page updated",
    detail: "Copilot drafted the update; Maya approved it",
    time: "09:48:15",
  },
];

const responders: AvatarGroupMember[] = [
  { id: "maya", name: "Maya Chen", initials: "MC", tone: "primary" },
  { id: "jon", name: "Jon Alvarez", initials: "JA", tone: "info" },
  { id: "priya", name: "Priya Rao", initials: "PR", tone: "success" },
];

const onCallTeams: AvatarGroupMember[] = [
  { id: "t1", name: "Sam Okafor", initials: "SO", tone: "primary" },
  { id: "t2", name: "Lena Fischer", initials: "LF", tone: "info" },
  { id: "t3", name: "Ravi Menon", initials: "RM", tone: "success" },
  { id: "t4", name: "Ana Lima", initials: "AL", tone: "warning" },
  { id: "t5", name: "Kofi Mensah", initials: "KM", tone: "neutral" },
];

const rotatingKeywords = ["every day.", "on Fridays.", "at 3am.", "at scale."];

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Hydration-safe: the server snapshot (false) is used until hydration ends. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

/** Autoplaying replay that pauses when hidden, off-screen, or paused by the user. */
function useIncidentReplay(reduceMotion: boolean) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Until the viewer acts, reduced motion starts paused on the resolved state.
  const [phaseChoice, setPhase] = useState<number | null>(null);
  const [pausedChoice, setPaused] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const phase = phaseChoice ?? (reduceMotion ? LAST_PHASE : 0);
  const userPaused = pausedChoice ?? reduceMotion;
  const playing = !userPaused && inView && pageVisible;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry?.isIntersecting ?? true),
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timeoutId = window.setTimeout(
      () => setPhase(phase >= LAST_PHASE ? 0 : phase + 1),
      phase >= LAST_PHASE ? HOLD_MS : PHASE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [phase, playing]);

  return {
    cardRef,
    phase,
    userPaused,
    togglePaused: () => setPaused(!userPaused),
    replay: () => {
      setPhase(0);
      setPaused(false);
    },
  };
}

function LatencyChart({
  values,
  resolved,
}: {
  values: number[];
  resolved: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>checkout · p95 latency</span>
        <span className="text-foreground flex items-center gap-1.5 font-mono font-medium">
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              resolved ? "bg-success" : "bg-destructive",
            )}
          />
          {values.at(-1)?.toLocaleString("en-GB")} ms
        </span>
      </div>
      <div
        aria-hidden="true"
        className="border-border/70 relative flex h-16 items-end gap-1 border-b"
      >
        <span
          className="border-muted-foreground/40 absolute inset-x-0 border-t border-dashed"
          style={{ bottom: `${(SLO_MS / LATENCY_MAX) * 100}%` }}
        />
        {values.map((value, index) => (
          <span
            key={index}
            className={cn(
              "h-full flex-1 origin-bottom rounded-t-sm transition-[scale,background-color] duration-700 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
              value > SLO_MS ? "bg-destructive/70" : "bg-success/70",
            )}
            style={{ scale: `1 ${Math.max(value / LATENCY_MAX, 0.04)}` }}
          />
        ))}
      </div>
    </div>
  );
}

function IncidentReplay() {
  const reduceMotion = usePrefersReducedMotion();
  const { cardRef, phase, userPaused, togglePaused, replay } =
    useIncidentReplay(reduceMotion);
  const current = phases[phase] ?? phases[0]!;
  const resolved = phase === LAST_PHASE;

  const stepIndex = stepItems.findIndex((item) => item.id === current.step);
  const steps = stepItems.map((item, index) => ({
    ...item,
    status:
      index < stepIndex || (resolved && index === stepIndex)
        ? ("complete" as const)
        : undefined,
  }));
  // Newest first; each new event slides in at the top of the log.
  const log = events.slice(0, phase + 1).reverse();

  return (
    <ScanGridBackground
      ref={cardRef}
      tone="primary"
      intensity="subtle"
      density="normal"
      speed="slow"
      className="border-border/70 rounded-3xl border p-3 sm:p-6"
    >
      <Card
        as="section"
        shadow="md"
        aria-labelledby="beacon-replay-title"
        aria-describedby="beacon-replay-note"
        className="bg-background ring-border/60 relative overflow-hidden ring-1"
      >
        <div className="border-border flex items-center gap-3 border-b px-4 py-3">
          <span aria-hidden="true" className="relative flex size-2.5">
            <span
              className={cn(
                "bg-destructive/60 absolute inline-flex size-full rounded-full motion-safe:animate-ping",
                (userPaused || resolved) && "hidden",
              )}
            />
            <span
              className={cn(
                "relative inline-flex size-2.5 rounded-full transition-colors duration-500",
                resolved ? "bg-success" : "bg-destructive",
              )}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="beacon-replay-title" className="text-sm font-semibold">
              INC-2048
            </h2>
            <p
              id="beacon-replay-note"
              className="text-muted-foreground truncate text-xs"
            >
              Checkout slowdown · sample replay
            </p>
          </div>
          <Badge tone={current.tone} variant="soft" size="sm">
            {current.status}
          </Badge>
          <div className="flex items-center">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={
                userPaused ? "Play incident replay" : "Pause incident replay"
              }
              onClick={togglePaused}
            >
              {userPaused ? <Play /> : <Pause />}
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Replay incident from the start"
              onClick={replay}
            >
              <RotateCcw />
            </IconButton>
          </div>
        </div>

        <div className="space-y-5 p-4">
          <Steps
            aria-label="Incident progress"
            items={steps}
            value={current.step}
            size="sm"
            motionPreset={reduceMotion ? "none" : "subtle"}
            className="[&_[data-slot=steps-item]]:min-w-0 [&_[data-slot=steps-label]]:text-xs [&_[data-slot=steps-list]]:w-full [&_[data-slot=steps-list]]:min-w-0 [&_[data-slot=steps-surface]]:px-0"
          />

          <LatencyChart values={current.latency} resolved={resolved} />

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-h-8 items-center gap-2 text-xs">
              <span className="text-muted-foreground">Responders</span>
              {phase >= 1 ? (
                <AvatarGroup
                  label="Responders on INC-2048"
                  members={responders}
                  size="sm"
                  ring="border"
                  overlap="sm"
                />
              ) : (
                <span className="text-muted-foreground italic">paging…</span>
              )}
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              elapsed{" "}
              <span className="text-foreground font-semibold">
                {current.elapsed}
              </span>
            </span>
          </div>

          <ol
            aria-label="INC-2048 activity"
            className="border-border h-[9.5rem] space-y-3 overflow-hidden border-t [mask-image:linear-gradient(to_bottom,black_75%,transparent)] pt-4"
          >
            {log.map((event, index) => (
              <li
                key={event.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 motion-safe:animate-[beacon-row-in_0.5s_cubic-bezier(0.2,0,0,1)]"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-2 rounded-full",
                    index === 0 && !resolved
                      ? "bg-primary ring-primary/25 ring-4"
                      : "bg-success",
                  )}
                />
                <div className="min-w-0">
                  <p className="flex items-baseline justify-between gap-3 text-sm font-medium">
                    <span className="truncate">{event.title}</span>
                    <time className="text-muted-foreground shrink-0 font-mono text-[11px] font-normal">
                      {event.time}
                    </time>
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {event.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </ScanGridBackground>
  );
}

export function BeaconHero({
  onStart,
  onTour,
}: {
  onStart: () => void;
  onTour: () => void;
}) {
  return (
    <section
      id="beacon-hero"
      aria-labelledby="beacon-hero-heading"
      className="border-border relative overflow-hidden border-b"
    >
      <style>{`
        @keyframes beacon-pulse { 0% { opacity: .6; scale: .6 } 100% { opacity: 0; scale: 1.25 } }
        @keyframes beacon-row-in { from { opacity: 0; translate: 0 -.5rem } }
      `}</style>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(50% 60% at 78% 45%, color-mix(in oklab, var(--dt-color-primary) 16%, transparent), transparent 70%)",
            "radial-gradient(40% 50% at 8% 0%, color-mix(in oklab, var(--dt-color-info) 10%, transparent), transparent 70%)",
          ].join(", "),
        }}
      />
      {/* Beacon pulse rings radiating from behind the replay */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[-10%] hidden aspect-square w-[60rem] -translate-y-1/2 lg:grid"
      >
        {[0, 1, 2].map((ring) => (
          <span
            key={ring}
            className="border-primary/20 col-start-1 row-start-1 size-full rounded-full border opacity-0 motion-safe:animate-[beacon-pulse_6s_ease-out_infinite]"
            style={{ animationDelay: `${ring * 2}s` }}
          />
        ))}
      </span>

      <div className="relative grid items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-12 lg:px-10 lg:py-24">
        <div>
          <Badge
            tone="primary"
            variant="soft"
            icon={<Sparkles aria-hidden="true" />}
          >
            New: copilot status drafts
          </Badge>

          <HeroTextAnimation
            id="beacon-hero-heading"
            animation="rotating-keyword"
            ariaLabel="Calm incident response for teams that ship every day, on Fridays, at 3am, and at scale."
            text="Calm incident response for teams that ship every day."
            rotatingKeywordPrefix="Calm incident response for teams that ship "
            rotatingKeywordOptions={rotatingKeywords}
            autoRotateKeywords
            rotatingKeywordInterval={2.2}
            reducedMotionStrategy="static"
            className="font-heading [&_[data-slot=hero-text-animation-rotating-keyword]]:text-primary mt-6 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]"
          />

          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7 text-pretty sm:text-lg">
            Beacon pages the right person, gives every incident a focused room,
            and writes the first draft of the update, so your team gets back to
            building.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" rightIcon={<ArrowRight />} onClick={onStart}>
              Start free trial
            </Button>
            <Button size="lg" variant="outline" onClick={onTour}>
              See how it works
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <AvatarGroup
              label="On-call engineers using Beacon"
              members={onCallTeams}
              size="md"
              ring="border"
              overlap="sm"
            />
            <div className="text-sm">
              <p className="flex items-center gap-1">
                <span className="sr-only">Rated 4.9 out of 5</span>
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    aria-hidden="true"
                    className="fill-warning text-warning size-3.5"
                  />
                ))}
                <span aria-hidden="true" className="ms-1 font-semibold">
                  4.9
                </span>
              </p>
              <p className="text-muted-foreground">from 1,200+ on-call teams</p>
            </div>
          </div>
        </div>

        <IncidentReplay />
      </div>
    </section>
  );
}
