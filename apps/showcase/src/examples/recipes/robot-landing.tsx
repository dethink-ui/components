"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  BatteryFull,
  Check,
  Cpu,
  Eye,
  Footprints,
  Hand,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardScroller,
  CardScrollerItem,
  CardTitle,
  Checkbox,
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  HeroTextAnimation,
  HeroTextAnimationProvider,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Switch,
  Tabs,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";
import "./robot-landing.css";

const asset = (name: string) => `/recipes/robot-landing/${name}.webp`;

interface PartMotion {
  id: string;
  /** Scroll window (0–1 of the teardown section) in which the part detaches. */
  window: readonly [number, number];
  x: string;
  y: string;
  rotate: number;
  scale?: number;
}

// Paint order matters: the renders share one camera, so far parts go first.
const parts: readonly PartMotion[] = [
  { id: "leg-left", window: [0.62, 0.76], x: "-16%", y: "11%", rotate: -8 },
  { id: "leg-right", window: [0.62, 0.76], x: "16%", y: "11%", rotate: 8 },
  { id: "arm-left", window: [0.28, 0.42], x: "-24%", y: "-5%", rotate: -18 },
  {
    id: "torso",
    window: [0.46, 0.58],
    x: "0%",
    y: "0%",
    rotate: 0,
    scale: 1.06,
  },
  { id: "head", window: [0.1, 0.24], x: "4%", y: "-17%", rotate: -10 },
  { id: "arm-right", window: [0.28, 0.42], x: "24%", y: "-5%", rotate: 18 },
];

interface Feature {
  until: number;
  /** When the callout starts to appear; null for steps without a callout. */
  appear: number | null;
  eyebrow: string;
  title: string;
  body: string;
  icon: typeof Eye;
  specs: readonly string[];
  /** Desktop callout position around the centred stage. */
  calloutClassName: string;
  side: "left" | "right";
}

const features: readonly Feature[] = [
  {
    until: 0.1,
    appear: null,
    eyebrow: "Assembled",
    title: "One robot. Six modules.",
    body: "Every part clicks out, so Ollo can be repaired, upgraded, and kept for a decade.",
    icon: Sparkles,
    specs: [],
    calloutClassName: "",
    side: "left",
  },
  {
    until: 0.27,
    appear: 0.2,
    eyebrow: "Vision head",
    title: "Sees the room, not your face.",
    body: "Stereo depth cameras and a 12-mic array map spaces and hear requests. Recognition never leaves the robot.",
    icon: Eye,
    specs: ["120° depth view", "12 mics", "Privacy shutter"],
    calloutClassName: "top-[3%] right-0",
    side: "right",
  },
  {
    until: 0.45,
    appear: 0.38,
    eyebrow: "Hands",
    title: "Gentle enough for glassware.",
    body: "Force-sensing grippers lift 4 kg and fold a towel without a crease.",
    icon: Hand,
    specs: ["4 kg payload", "0.2 N touch", "Tool tips"],
    calloutClassName: "top-[12%] left-0",
    side: "left",
  },
  {
    until: 0.61,
    appear: 0.54,
    eyebrow: "Core",
    title: "A heart that lasts all day.",
    body: "An 18-hour battery and a neural processor that plans every move on-device.",
    icon: BatteryFull,
    specs: ["18 h runtime", "45 min charge", "40 TOPS"],
    calloutClassName: "top-[46%] right-0",
    side: "right",
  },
  {
    until: 0.79,
    appear: 0.72,
    eyebrow: "Legs",
    title: "Stairs are not a problem.",
    body: "Elastic knees and wide feet climb stairs, step over toys, and shrug off a nudge.",
    icon: Footprints,
    specs: ["20 cm steps", "1.4 m/s", "Self-righting"],
    calloutClassName: "top-[52%] left-0",
    side: "left",
  },
  {
    until: 1.01,
    appear: null,
    eyebrow: "Modular",
    title: "Swap any part in thirty seconds.",
    body: "Each module slides off one latch. Click in a new one and Ollo recalibrates itself.",
    icon: Cpu,
    specs: ["30 s swap", "Auto calibration", "10-year parts"],
    calloutClassName: "",
    side: "left",
  },
];

const modules = [
  {
    id: "head",
    name: "Vision head",
    summary: "Depth cameras, mic array, and an expressive visor.",
    spec: "Privacy shutter",
  },
  {
    id: "torso",
    name: "Core",
    summary: "Battery, neural processor, and the glowing status ring.",
    spec: "18 h battery",
  },
  {
    id: "arm-right",
    name: "Dexterous arm",
    summary: "Seven joints and force-sensing fingers for delicate work.",
    spec: "4 kg payload",
  },
  {
    id: "arm-left",
    name: "Workshop arm",
    summary: "Swap in hardened tips for tools, garden, and garage.",
    spec: "Tool-ready tips",
  },
  {
    id: "leg-right",
    name: "Stride leg",
    summary: "Elastic knee and wide foot for stairs and soft rugs.",
    spec: "20 cm steps",
  },
  {
    id: "leg-left",
    name: "Balance leg",
    summary: "Inertial sensors that keep Ollo upright after a bump.",
    spec: "Self-righting",
  },
] as const;

const specGroups = [
  {
    value: "body",
    label: "Body",
    rows: [
      ["Height", "118 cm"],
      ["Weight", "21 kg"],
      ["Shell", "Recycled polymer, matte coat"],
      ["Modules", "6, tool-free"],
    ],
  },
  {
    value: "power",
    label: "Power",
    rows: [
      ["Battery", "1.2 kWh swappable core"],
      ["Runtime", "Up to 18 h mixed use"],
      ["Charging", "0–80% in 45 min"],
      ["Dock", "Self-docking wireless pad"],
    ],
  },
  {
    value: "mind",
    label: "Intelligence",
    rows: [
      ["Processor", "40 TOPS neural core"],
      ["Processing", "On-device by default"],
      ["Updates", "Monthly, opt-in"],
      ["Privacy", "Physical camera shutter"],
    ],
  },
] as const;

const finishes = [
  { value: "sunset", label: "Sunset", swatch: "bg-[oklch(0.76_0.16_42)]" },
  { value: "ocean", label: "Ocean", swatch: "bg-[oklch(0.7_0.13_230)]" },
  { value: "graphite", label: "Graphite", swatch: "bg-[oklch(0.55_0.01_260)]" },
] as const;

const addOns = [
  {
    id: "workshop",
    label: "Workshop hands",
    description: "Hardened tips for tools and garden work.",
    price: 290,
  },
  {
    id: "battery",
    label: "Spare core battery",
    description: "Hot-swap for all-day, every-day use.",
    price: 190,
  },
  {
    id: "care",
    label: "Five-year care",
    description: "Free replacement modules for five years.",
    price: 240,
  },
] as const;

const basePrice = 2490;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(listener: () => void) {
  const preference = window.matchMedia(motionQuery);
  preference.addEventListener("change", listener);
  return () => preference.removeEventListener("change", listener);
}

/** Hydration-safe: the server and first client render agree, then it updates. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
}

function rampBetween(value: number, start: number, end: number) {
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

function BrandMark() {
  return (
    <a
      href="#robot-teardown"
      className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-full bg-[image:var(--robot-gradient)]"
      >
        <span className="bg-background size-3 rounded-full" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-[-0.04em]">
        Ollo
      </span>
    </a>
  );
}

function PartLayer({
  part,
  progress,
  reduced,
  exploded,
}: {
  part: PartMotion;
  progress: MotionValue<number>;
  reduced: boolean;
  /** Reduced motion only: jump between assembled and exploded, no scrubbing. */
  exploded: boolean;
}) {
  const [start, end] = part.window;
  const x = useTransform(progress, [start, end], ["0%", part.x]);
  const y = useTransform(progress, [start, end], ["0%", part.y]);
  const rotate = useTransform(progress, [start, end], [0, part.rotate]);
  const scale = useTransform(progress, [start, end], [1, part.scale ?? 1]);

  return (
    <motion.div
      className="sc-robot-part absolute inset-0 will-change-transform"
      data-robot-part={part.id}
      style={
        reduced
          ? exploded
            ? {
                x: part.x,
                y: part.y,
                rotate: part.rotate,
                scale: part.scale ?? 1,
              }
            : { x: "0%", y: "0%", rotate: 0, scale: 1 }
          : { x, y, rotate, scale }
      }
    >
      <Image
        src={asset(`layer-${part.id}`)}
        alt=""
        fill
        sizes="(min-width: 1024px) 520px, 80vw"
        className="object-contain"
      />
    </motion.div>
  );
}

function FeatureCallout({
  feature,
  index,
  active,
  listed,
  progress,
  reduced,
}: {
  feature: Feature;
  index: number;
  active: boolean;
  /** Reduced motion only: whether the exploded view (all callouts) is showing. */
  listed: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const appear = feature.appear ?? 0;
  // Function form keeps this on the JS path; Motion's native ScrollTimeline
  // acceleration for opacity mis-maps the range of a target-offset scroll.
  const opacity = useTransform(() =>
    rampBetween(progress.get(), appear, appear + 0.05),
  );
  const x = useTransform(
    progress,
    [appear, appear + 0.05],
    [feature.side === "left" ? -32 : 32, 0],
  );
  const Icon = feature.icon;

  return (
    <motion.article
      data-robot-callout={feature.eyebrow}
      style={reduced ? { opacity: active || listed ? 1 : 0 } : { opacity, x }}
      className={
        "sc-robot-glass absolute w-[17.5rem] rounded-2xl " +
        feature.calloutClassName
      }
    >
      {/* Dimming lives on an inner wrapper: the article's inline scroll
          opacity would otherwise override it. */}
      <div className="sc-robot-callout p-4" data-active={active}>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="text-primary-foreground grid size-9 shrink-0 place-items-center rounded-xl bg-[image:var(--robot-gradient)]"
          >
            <Icon className="size-4.5" />
          </span>
          <p className="text-muted-foreground text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
            {String(index).padStart(2, "0")} · {feature.eyebrow}
          </p>
        </div>
        <h2 className="font-heading mt-3 text-lg leading-snug font-semibold tracking-tight">
          {feature.title}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm leading-6">
          {feature.body}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {feature.specs.map((spec) => (
            <li key={spec}>
              <Badge variant="outline" size="sm">
                {spec}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

function Teardown() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(() =>
    rampBetween(scrollYProgress.get(), 0.07, 0.02),
  );
  const introY = useTransform(scrollYProgress, [0.02, 0.08], [0, -60]);
  const robotY = useTransform(
    scrollYProgress,
    [0, 0.09, 0.8, 0.88],
    ["20%", "0%", "0%", "-9%"],
  );
  const robotScale = useTransform(
    scrollYProgress,
    [0, 0.09, 0.8, 0.88],
    [0.78, 1, 1, 0.82],
  );
  const robotRotate = useTransform(scrollYProgress, [0.8, 1], [0, -5]);
  const wordmarkScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const backdropRotate = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const coreGlow = useTransform(() =>
    rampBetween(scrollYProgress.get(), 0.46, 0.58),
  );
  const finaleOpacity = useTransform(() =>
    rampBetween(scrollYProgress.get(), 0.82, 0.88),
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const index = features.findIndex((step) => value < step.until);
    setActive(index === -1 ? features.length - 1 : index);
  });

  const jumpTo = (index: number) => {
    const section = sectionRef.current;

    if (!section) return;

    const start = index === 0 ? 0 : features[index - 1].until;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + travel * Math.min(start + 0.03, 1),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const exploded = reduced && active > 0;
  const step = features[active];
  const StepIcon = step.icon;
  const finale = features[features.length - 1];

  return (
    <section
      ref={sectionRef}
      id="robot-teardown"
      aria-labelledby="robot-hero-heading"
      className="relative h-[640vh]"
      data-robot-step={active}
    >
      {/* Remount when the motion preference resolves after hydration, so motion
          values bound on the first render never drive the still layout. */}
      <div
        key={reduced ? "still" : "scroll"}
        className="sc-robot-sticky @container sticky overflow-hidden"
      >
        <motion.div
          aria-hidden="true"
          className="sc-robot-backdrop absolute inset-[-20%]"
          style={{ rotate: reduced ? 0 : backdropRotate }}
        />
        <div
          aria-hidden="true"
          className="sc-robot-floor absolute inset-x-[-30%] top-[72%] h-[60%]"
        />
        <motion.p
          aria-hidden="true"
          style={{ scale: reduced ? 1 : wordmarkScale }}
          className="sc-robot-wordmark font-heading pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center text-[30cqw] font-bold whitespace-nowrap select-none"
        >
          OLLO
        </motion.p>

        <motion.div
          style={
            reduced
              ? { opacity: exploded ? 0 : 1 }
              : { opacity: introOpacity, y: introY }
          }
          className="absolute inset-x-0 top-[5%] z-20 mx-auto max-w-3xl px-5 text-center"
        >
          <Badge
            tone="primary"
            variant="soft"
            className="sc-robot-glass text-foreground"
          >
            Shipping spring 2027
          </Badge>
          <HeroTextAnimation
            animation="kinetic-emphasis-pop"
            ariaLabel="Meet Ollo. The helper you can take apart."
            emphasisWords={["apart"]}
            id="robot-hero-heading"
            text="Meet Ollo. The helper you can take apart."
            className="sc-robot-hero-title font-heading mx-auto mt-4 text-4xl leading-[0.95] font-semibold tracking-[-0.06em] text-balance sm:text-6xl"
          />
          <div
            inert={active > 0}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            <Button
              size="lg"
              rightIcon={<ArrowRight />}
              onClick={() => scrollToId("robot-reserve")}
            >
              Reserve Ollo
            </Button>
            <Button
              size="lg"
              variant="outline"
              rightIcon={<ArrowDown />}
              className="sc-robot-glass hidden sm:inline-flex"
              onClick={() => jumpTo(1)}
            >
              Scroll to open it up
            </Button>
          </div>
        </motion.div>

        <div className="absolute inset-0 grid place-items-center pb-40 sm:pb-24 xl:pb-10">
          <motion.div
            className="relative aspect-[4/5] h-[min(46dvh,22rem)] sm:h-[min(58dvh,30rem)] xl:h-[min(70dvh,38rem)]"
            style={
              reduced
                ? exploded
                  ? { y: "-9%", scale: 0.82 }
                  : { y: "20%", scale: 0.78 }
                : { y: robotY, scale: robotScale, rotate: robotRotate }
            }
          >
            <div
              aria-hidden="true"
              className="sc-robot-pedestal absolute bottom-[4%] left-1/2 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%]"
            />
            <div className="absolute inset-0" aria-hidden="true">
              {parts.map((part) => (
                <PartLayer
                  key={part.id}
                  part={part}
                  progress={scrollYProgress}
                  reduced={reduced}
                  exploded={exploded}
                />
              ))}
              <motion.span
                className="absolute top-[43%] left-[46%] size-[22%] -translate-1/2 rounded-full bg-[radial-gradient(circle,var(--robot-core),transparent_65%)] mix-blend-screen"
                style={{ opacity: reduced ? (exploded ? 0.8 : 0) : coreGlow }}
              />
            </div>
          </motion.div>
        </div>

        {/* Desktop: every feature stays listed around the exploded robot. */}
        <div className="pointer-events-none absolute inset-0 z-10 mx-auto hidden max-w-7xl px-10 xl:block">
          <div className="relative h-full">
            {features.map((feature, index) =>
              feature.appear === null ? null : (
                <FeatureCallout
                  key={feature.eyebrow}
                  feature={feature}
                  index={index}
                  active={index === active || active === features.length - 1}
                  listed={exploded}
                  progress={scrollYProgress}
                  reduced={reduced}
                />
              ),
            )}
          </div>
        </div>
        <motion.div
          style={{ opacity: reduced ? (exploded ? 1 : 0) : finaleOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-24 z-10 hidden text-center xl:block"
        >
          <p className="font-heading sc-robot-gradient-text text-4xl font-semibold tracking-[-0.05em]">
            {finale.title}
          </p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
            {finale.body}
          </p>
        </motion.div>

        {/* Below xl: the active feature in a single card. */}
        <div className="absolute inset-x-4 bottom-20 z-10 mx-auto max-w-md xl:hidden">
          <AnimatePresence mode="wait" initial={false}>
            {active > 0 ? (
              <motion.div
                key={active}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="sc-robot-glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="text-primary-foreground grid size-9 shrink-0 place-items-center rounded-xl bg-[image:var(--robot-gradient)]"
                  >
                    <StepIcon className="size-4.5" />
                  </span>
                  <p className="text-muted-foreground text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
                    {String(active).padStart(2, "0")} · {step.eyebrow}
                  </p>
                </div>
                <h2 className="font-heading mt-2.5 text-lg leading-snug font-semibold tracking-tight">
                  {step.title}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {step.body}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
          <div className="sc-robot-glass flex w-full max-w-2xl items-center gap-4 rounded-full py-2 ps-5 pe-2">
            <Progress
              aria-label="Teardown progress"
              className="min-w-24 flex-1"
              size="sm"
              value={Math.round((active / (features.length - 1)) * 100)}
            />
            <nav aria-label="Teardown steps" className="hidden sm:block">
              <ol className="flex gap-1">
                {features.map((item, index) => (
                  <li key={item.eyebrow}>
                    <button
                      type="button"
                      aria-current={index === active ? "step" : undefined}
                      onClick={() => jumpTo(index)}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring aria-[current=step]:text-primary-foreground rounded-full px-2.5 py-1 text-xs font-medium outline-none focus-visible:ring-2 aria-[current=step]:bg-[image:var(--robot-gradient)]"
                    >
                      {item.eyebrow}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

function Configurator() {
  const [finish, setFinish] = useState<string>("sunset");
  const [selected, setSelected] = useState<string[]>(["battery"]);
  const [assembled, setAssembled] = useState(true);
  const [reserved, setReserved] = useState(false);
  const total =
    basePrice +
    addOns
      .filter((item) => selected.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  const finishLabel =
    finishes.find((item) => item.value === finish)?.label ?? finish;

  return (
    <section
      id="robot-reserve"
      aria-labelledby="robot-reserve-heading"
      data-finish={finish}
      className="sc-robot-finish relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="sc-robot-backdrop absolute inset-0 -z-10 opacity-60"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:px-10 lg:py-28">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div
            aria-hidden="true"
            className="sc-robot-pedestal absolute bottom-[5%] left-1/2 h-[9%] w-[60%] -translate-x-1/2 rounded-[50%]"
          />
          <Image
            src={asset("layer-robot")}
            alt={`Ollo in the ${finishLabel} finish`}
            fill
            sizes="(min-width: 1024px) 384px, 80vw"
            className="sc-robot-tint sc-robot-part object-contain"
          />
        </div>

        <div className="sc-robot-glass sc-robot-edge min-w-0 rounded-3xl p-6 sm:p-8">
          <p className="sc-robot-gradient-text text-xs font-semibold tracking-[0.16em] uppercase">
            Reserve
          </p>
          <h2
            id="robot-reserve-heading"
            className="font-heading mt-3 text-4xl leading-[1] font-semibold tracking-[-0.05em] text-balance sm:text-5xl"
          >
            Make it yours.
          </h2>

          <div className="mt-8 space-y-7">
            <FieldSet>
              <FieldLegend>Finish</FieldLegend>
              <RadioGroup
                name="robot-finish"
                orientation="horizontal"
                value={finish}
                onValueChange={setFinish}
              >
                <div className="flex flex-wrap gap-5">
                  {finishes.map((item) => (
                    <Field
                      key={item.value}
                      id={`robot-finish-${item.value}`}
                      orientation="horizontal"
                    >
                      <FieldControl asChild>
                        <RadioGroupItem value={item.value} />
                      </FieldControl>
                      <FieldLabel className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={"size-3 rounded-full " + item.swatch}
                        />
                        {item.label}
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              </RadioGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Add-ons</FieldLegend>
              <FieldGroup>
                {addOns.map((item) => (
                  <Field
                    key={item.id}
                    id={`robot-addon-${item.id}`}
                    orientation="horizontal"
                  >
                    <FieldControl asChild>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={(value) =>
                          setSelected((current) =>
                            value === true
                              ? [...current, item.id]
                              : current.filter((id) => id !== item.id),
                          )
                        }
                      />
                    </FieldControl>
                    <FieldContent>
                      <FieldLabel>
                        {item.label}{" "}
                        <span className="text-muted-foreground font-normal">
                          +{currency.format(item.price)}
                        </span>
                      </FieldLabel>
                      <FieldDescription>{item.description}</FieldDescription>
                    </FieldContent>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>

            <Field id="robot-assembled" orientation="horizontal">
              <FieldControl asChild>
                <Switch checked={assembled} onCheckedChange={setAssembled} />
              </FieldControl>
              <FieldContent>
                <FieldLabel>Ship fully assembled</FieldLabel>
                <FieldDescription>
                  Or unbox the modules and click Ollo together yourself.
                </FieldDescription>
              </FieldContent>
            </Field>
          </div>

          <Separator className="my-7" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Estimated total</p>
              <p
                className="font-heading text-3xl font-semibold tracking-tight tabular-nums"
                data-robot-total=""
              >
                {currency.format(total)}
              </p>
            </div>
            <Button
              size="lg"
              rightIcon={reserved ? <Check /> : <ArrowRight />}
              onClick={() => setReserved(true)}
            >
              {reserved ? "Reserved" : "Reserve with $99"}
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-sm" aria-live="polite">
            {reserved
              ? `Ollo in ${finishLabel}, ${assembled ? "assembled" : "as a kit"}, is on your list. This demo stores nothing.`
              : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

export function RobotLandingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <HeroTextAnimationProvider>
      <div
        data-recipe-surface="robot-landing"
        className={
          "sc-robot-theme overflow-x-clip border " +
          (fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
            : "rounded-xl")
        }
      >
        <header className="relative z-30 mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
          <BrandMark />
          <nav
            aria-label="Ollo page navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {[
              ["Inside", "#robot-teardown"],
              ["Modules", "#robot-modules"],
              ["Specs", "#robot-specs"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2"
              >
                {label}
              </a>
            ))}
          </nav>
          <Button size="sm" onClick={() => scrollToId("robot-reserve")}>
            Reserve
          </Button>
        </header>

        <Teardown />

        <section
          id="robot-modules"
          aria-labelledby="robot-modules-heading"
          className="relative"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
              <div>
                <p className="sc-robot-gradient-text text-xs font-semibold tracking-[0.16em] uppercase">
                  The modules
                </p>
                <h2
                  id="robot-modules-heading"
                  className="font-heading mt-3 text-4xl leading-[1] font-semibold tracking-[-0.05em] text-balance sm:text-6xl"
                >
                  Upgrade the part.{" "}
                  <span className="sc-robot-gradient-text">
                    Keep the robot.
                  </span>
                </h2>
              </div>
              <p className="text-muted-foreground max-w-xl text-base leading-7">
                Every module is sold separately and backed for ten years. Swipe
                through what makes Ollo, Ollo.
              </p>
            </div>

            <div className="mt-12">
              <CardScroller
                aria-label="Ollo modules"
                defaultValue="head"
                maxVisibleCards={3}
                nextLabel="Show next module"
                previousLabel="Show previous module"
                showControls
              >
                {modules.map((item) => (
                  <CardScrollerItem
                    key={item.id}
                    label={item.name}
                    value={item.id}
                  >
                    <Card
                      as="article"
                      className="sc-robot-edge bg-muted/70 min-h-96 overflow-hidden border-transparent"
                      shadow="none"
                    >
                      <div className="sc-robot-module-art relative h-56">
                        <Image
                          src={asset(`part-${item.id}`)}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 320px, 80vw"
                          className="sc-robot-part object-contain p-6"
                        />
                      </div>
                      <CardHeader>
                        <Badge
                          tone="primary"
                          variant="soft"
                          size="sm"
                          className="w-fit"
                        >
                          {item.spec}
                        </Badge>
                        <CardTitle className="mt-3 text-lg">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="mt-1 leading-6">
                          {item.summary}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </CardScrollerItem>
                ))}
              </CardScroller>
            </div>
          </div>
        </section>

        <section
          id="robot-specs"
          aria-labelledby="robot-specs-heading"
          className="relative"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-10 lg:py-24">
            <div>
              <p className="sc-robot-gradient-text text-xs font-semibold tracking-[0.16em] uppercase">
                Specifications
              </p>
              <h2
                id="robot-specs-heading"
                className="font-heading mt-3 text-4xl leading-[1] font-semibold tracking-[-0.05em] text-balance sm:text-5xl"
              >
                The numbers behind the smile.
              </h2>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  ["18 h", "battery"],
                  ["6", "modules"],
                  ["4 kg", "per hand"],
                ].map(([value, label]) => (
                  <div key={label} className="flex flex-col-reverse">
                    <dt className="text-muted-foreground text-xs leading-5">
                      {label}
                    </dt>
                    <dd className="font-heading sc-robot-gradient-text text-3xl font-semibold tracking-tight">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <Tabs defaultValue="body">
              <Tabs.List aria-label="Specification groups">
                {specGroups.map((group) => (
                  <Tabs.Trigger key={group.value} value={group.value}>
                    {group.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {specGroups.map((group) => (
                <Tabs.Panel key={group.value} value={group.value}>
                  <dl className="sc-robot-glass divide-border mt-3 divide-y rounded-2xl">
                    {group.rows.map(([term, detail]) => (
                      <div
                        key={term}
                        className="flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <dt className="text-muted-foreground text-sm">
                          {term}
                        </dt>
                        <dd className="text-end text-sm font-medium">
                          {detail}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Tabs.Panel>
              ))}
            </Tabs>
          </div>
        </section>

        <Configurator />

        <footer className="border-border/70 border-t">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <BrandMark />
            <p className="text-muted-foreground text-sm">
              Ollo is a fictional product. Renders made in Blender.
            </p>
          </div>
        </footer>
      </div>
    </HeroTextAnimationProvider>
  );
}
