"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CalendarDate, CalendarDateTime, type DateValue } from "@internationalized/date";
import {
  CalendarClock,
  CalendarDays,
  Clock,
  ExternalLink,
  Globe,
  Repeat,
  ShieldBan,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateRangePicker,
  DateTimePicker,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Progress,
  SlotPicker,
  SlotPlanner,
  ToastProvider,
  ToastViewport,
  useToast,
  type SlotPlannerBookRequestPayload,
  type SlotPlannerSlotData,
} from "@dethink/components";

// ----------------------------------------------------------------------------
// Decorative layers (token-only, aria-hidden, non-interactive)
// ----------------------------------------------------------------------------

const washStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(56% 44% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 12%, transparent), transparent 70%)",
    "radial-gradient(50% 40% at 100% 2%, color-mix(in oklab, var(--dt-color-info) 11%, transparent), transparent 72%)",
    "radial-gradient(64% 55% at 92% 108%, color-mix(in oklab, var(--dt-color-success) 9%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 2.5%, transparent), transparent 30%)",
  ].join(", "),
};

const bookingWashStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(90% 70% at 8% 0%, color-mix(in oklab, var(--dt-color-primary) 16%, transparent), transparent 72%)",
    "radial-gradient(80% 70% at 100% 0%, color-mix(in oklab, var(--dt-color-info) 12%, transparent), transparent 74%)",
  ].join(", "),
};

// ----------------------------------------------------------------------------
// Domain data + helpers
// ----------------------------------------------------------------------------

const PLANNER_ZONE = "Europe/London";
const VIEWER_ZONE = "America/New_York";
const HOST_NAME = "Northstar CS";

const initialSlots: SlotPlannerSlotData[] = [
  {
    id: "implementation-review",
    date: "2026-07-06",
    startTime: "09:00",
    durationMinutes: 45,
    timeZone: PLANNER_ZONE,
    state: "requestable",
    recurrence: { frequency: "weekly" },
    capacity: 3,
    requestedCount: 1,
    data: { tags: ["Customer onboarding"] },
  },
  {
    id: "architecture-office-hours",
    date: "2026-07-07",
    startTime: "16:30",
    durationMinutes: 30,
    timeZone: PLANNER_ZONE,
    state: "requestable",
    capacity: 2,
    data: { tags: ["Architecture"] },
  },
  {
    id: "internal-retro",
    date: "2026-07-08",
    startTime: "11:00",
    durationMinutes: 60,
    timeZone: PLANNER_ZONE,
    state: "blocked",
    data: { tags: ["Internal"] },
  },
];

type SlotDisplayStatus = "requestable" | "at-capacity" | "blocked";

const statusMeta: Record<
  SlotDisplayStatus,
  { label: string; dot: string; pill: string }
> = {
  requestable: {
    label: "Requestable",
    dot: "bg-success",
    pill: "bg-success/12 text-success ring-success/25",
  },
  "at-capacity": {
    label: "At capacity",
    dot: "bg-warning",
    pill: "bg-warning/12 text-warning ring-warning/25",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-muted-foreground",
    pill: "bg-muted text-muted-foreground ring-border",
  },
};

function slotStatus(slot: SlotPlannerSlotData): SlotDisplayStatus {
  if (slot.state === "blocked") return "blocked";
  const capacity = slot.capacity ?? 0;
  const requested = slot.requestedCount ?? 0;
  if (capacity > 0 && requested >= capacity) return "at-capacity";
  return "requestable";
}

function slotTitle(slot: SlotPlannerSlotData): string {
  const tags = (slot.data as { tags?: string[] } | undefined)?.tags;
  if (tags && tags[0]) return tags[0];
  return slot.id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatSlotDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const js = new Date(Date.UTC(y, m - 1, d));
  return `${WEEKDAYS[js.getUTCDay()]} ${d} ${MONTHS[m - 1]}`;
}

function formatFocusedDate(value: DateValue | null): string {
  if (!value) return "No date selected";
  const js = new Date(Date.UTC(value.year, value.month - 1, value.day));
  return `${WEEKDAYS[js.getUTCDay()]}, ${value.day} ${MONTHS[value.month - 1]} ${value.year}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function tintedAvatarStyle(tint: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in oklab, ${tint} 18%, var(--dt-color-background))`,
  };
}

// ----------------------------------------------------------------------------
// Header stat tiles
// ----------------------------------------------------------------------------

function StatTile({
  label,
  value,
  hint,
  tint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  tint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-border/70 bg-background/70 relative overflow-hidden rounded-lg border p-4 shadow-sm backdrop-blur">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: tint }}
      />
      <div className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="font-heading mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {hint ? (
        <div className="text-muted-foreground mt-1 text-xs">{hint}</div>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

// ----------------------------------------------------------------------------

function BookingWorkflow() {
  const { toast } = useToast();
  const [slots, setSlots] = useState(initialSlots);
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(
    new CalendarDate(2026, 7, 6),
  );

  function book(payload: SlotPlannerBookRequestPayload) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === payload.slotId
          ? { ...slot, requestedCount: (slot.requestedCount ?? 0) + 1 }
          : slot,
      ),
    );
    toast({
      title: "Booking requested",
      description: `Requested ${payload.slotId} on ${payload.occurrenceDate}.`,
      tone: "success",
    });
  }

  const summary = useMemo(() => {
    const bookable = slots.filter((s) => slotStatus(s) === "requestable").length;
    const blocked = slots.filter((s) => s.state === "blocked").length;
    const capacityTotal = slots.reduce(
      (sum, s) => (s.state === "blocked" ? sum : sum + (s.capacity ?? 0)),
      0,
    );
    const requestedTotal = slots.reduce(
      (sum, s) => sum + (s.requestedCount ?? 0),
      0,
    );
    const utilization =
      capacityTotal > 0
        ? Math.round((requestedTotal / capacityTotal) * 100)
        : 0;
    const zones = new Set(slots.map((s) => s.timeZone));
    zones.add(VIEWER_ZONE);
    return {
      bookable,
      blocked,
      capacityTotal,
      requestedTotal,
      utilization,
      zoneCount: zones.size,
    };
  }, [slots]);

  const featured = slots.find((s) => s.id === "implementation-review");
  const featuredCapacity = featured?.capacity ?? 3;
  const featuredRequested = featured?.requestedCount ?? 0;
  const featuredUtilization =
    featuredCapacity > 0
      ? Math.round((featuredRequested / featuredCapacity) * 100)
      : 0;

  const upcoming = useMemo(
    () => [...slots].sort((a, b) => a.date.localeCompare(b.date)),
    [slots],
  );

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        style={washStyle}
        className="pointer-events-none absolute -inset-x-6 -top-6 bottom-0 -z-10"
      />

      <div className="space-y-6">
        {/* Header band */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-muted-foreground inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
              <Sparkles className="text-primary size-3.5" aria-hidden="true" />
              Scheduling · Customer success
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Availability &amp; booking
              </h2>
              <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                This week
              </span>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              An internal availability planner paired with the public booking
              page a customer actually sees — capacity, recurrence, blocked
              periods, and cross-time-zone previews in one console.
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Bookable slots"
            value={String(summary.bookable)}
            hint="Open for requests this week"
            tint="var(--dt-color-success)"
          />
          <StatTile
            label="Requested / capacity"
            value={`${summary.requestedTotal} / ${summary.capacityTotal}`}
            tint="var(--dt-color-primary)"
          >
            <Progress
              size="sm"
              aria-label={`Utilization at ${summary.utilization}%`}
              value={summary.utilization}
              tone={
                summary.utilization >= 80
                  ? "warning"
                  : summary.utilization >= 40
                    ? "primary"
                    : "info"
              }
            />
          </StatTile>
          <StatTile
            label="Blocked periods"
            value={String(summary.blocked)}
            hint="Held for internal focus"
            tint="var(--dt-color-warning)"
          />
          <StatTile
            label="Time zones"
            value={String(summary.zoneCount)}
            hint="Host + viewer coverage"
            tint="var(--dt-color-info)"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <main className="space-y-5">
            {/* Availability planner */}
            <Card
              shadow="sm"
              className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarClock
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  Availability planner
                </CardTitle>
                <CardDescription>
                  Manage bookable slots, constraints, recurrence, capacity, and
                  blocked periods from one planner.
                </CardDescription>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  {(
                    ["requestable", "at-capacity", "blocked"] as const
                  ).map((key) => {
                    const meta = statusMeta[key];
                    return (
                      <span
                        key={key}
                        className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"
                      >
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${meta.dot}`}
                        />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent>
                <SlotPlanner
                  title="Customer success availability"
                  defaultSlots={initialSlots}
                  defaultFocusedDate="2026-07-06"
                  now="2026-07-06T08:00:00+01:00"
                />
              </CardContent>
            </Card>

            {/* Campaign window */}
            <Card shadow="sm" className="ring-border/60 ring-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Timer className="text-info size-4" aria-hidden="true" />
                  Campaign window
                </CardTitle>
                <CardDescription>
                  Pair scheduling with the date suite for wider business
                  context.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <DateRangePicker label="Booking campaign" />
                <DateTimePicker
                  label="Launch briefing"
                  defaultValue={new CalendarDateTime(2026, 7, 14, 9, 30)}
                />
              </CardContent>
            </Card>
          </main>

          <aside className="space-y-5">
            {/* Booking preview — public booking page */}
            <Card
              shadow="sm"
              className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
            >
              <div
                aria-hidden="true"
                style={bookingWashStyle}
                className="pointer-events-none absolute inset-x-0 top-0 h-28"
              />
              <CardHeader className="relative">
                <div className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.16em] uppercase">
                  Public booking page · preview
                </div>
                <div className="border-border/70 bg-background/70 flex items-center gap-3 rounded-lg border p-3 shadow-sm backdrop-blur">
                  <span
                    aria-hidden="true"
                    className="border-border/60 text-foreground/80 grid size-10 shrink-0 place-items-center rounded-full border text-sm font-semibold"
                    style={tintedAvatarStyle("var(--dt-color-primary)")}
                  >
                    {initials(HOST_NAME)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground truncate text-sm font-semibold">
                      Book with {HOST_NAME}
                    </div>
                    <div className="text-muted-foreground inline-flex items-center gap-1 truncate text-xs">
                      <Globe className="size-3" aria-hidden="true" />
                      Shown in {VIEWER_ZONE.replace(/_/g, " ")}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="relative flex size-2.5"
                    title="Accepting bookings"
                  >
                    <span className="bg-success/60 absolute inline-flex size-full rounded-full motion-safe:animate-ping" />
                    <span className="bg-success relative inline-flex size-2.5 rounded-full" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <SlotPicker
                  title="Book an implementation review"
                  slots={slots}
                  viewerTimeZone={VIEWER_ZONE}
                  defaultFocusedDate="2026-07-06"
                  now="2026-07-06T08:00:00-04:00"
                  onBookRequest={book}
                />
              </CardContent>
            </Card>

            {/* Focused date + upcoming sessions */}
            <Card shadow="sm" className="ring-border/60 ring-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  Focused date
                </CardTitle>
                <CardDescription>
                  A compact scheduling companion alongside the day&apos;s
                  sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <Calendar
                    aria-label="Focused scheduling date"
                    value={selectedDate}
                    onValueChange={setSelectedDate}
                  />
                </div>
                <div className="border-border/70 bg-muted/30 rounded-lg border p-3">
                  <div className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                    Selected
                  </div>
                  <div className="text-foreground mt-0.5 text-sm font-semibold">
                    {formatFocusedDate(selectedDate)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                    Upcoming sessions
                  </div>
                  <ul className="space-y-1.5">
                    {upcoming.map((slot) => {
                      const meta = statusMeta[slotStatus(slot)];
                      return (
                        <li
                          key={slot.id}
                          className="border-border/60 bg-background/60 flex items-center gap-3 rounded-md border px-3 py-2"
                        >
                          <span
                            aria-hidden="true"
                            className={`size-2 shrink-0 rounded-full ${meta.dot}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="text-foreground block truncate text-sm font-medium">
                              {slotTitle(slot)}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {formatSlotDate(slot.date)} · {slot.startTime}
                            </span>
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ring-1 ring-inset ${meta.pill}`}
                          >
                            {meta.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Event detail drawer */}
            <Drawer direction="right">
              <DrawerTrigger variant="outline">
                <Clock className="size-4" aria-hidden="true" />
                Review event detail
              </DrawerTrigger>
              <DrawerContent size="sm">
                <DrawerHeader>
                  <DrawerTitle>Event detail</DrawerTitle>
                  <DrawerDescription>
                    Drawers work well for event detail without leaving the
                    planner.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-5 px-6 py-3">
                  {/* Session summary header */}
                  <div className="border-border/70 bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                    <span
                      aria-hidden="true"
                      className="border-border/60 text-primary grid size-11 shrink-0 place-items-center rounded-lg border"
                      style={tintedAvatarStyle("var(--dt-color-primary)")}
                    >
                      <CalendarClock className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground truncate text-sm font-semibold">
                        Implementation review
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        Customer onboarding
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${statusMeta.requestable.pill}`}
                    >
                      Requestable
                    </span>
                  </div>

                  {/* Detail list */}
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground inline-flex items-center gap-2">
                        <Clock className="size-3.5" aria-hidden="true" />
                        Time
                      </dt>
                      <dd className="text-foreground text-right">
                        Mon 6 Jul, 09:00 London
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground inline-flex items-center gap-2">
                        <Timer className="size-3.5" aria-hidden="true" />
                        Duration
                      </dt>
                      <dd className="text-foreground text-right">45 minutes</dd>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted-foreground inline-flex items-center gap-2">
                          <Users className="size-3.5" aria-hidden="true" />
                          Capacity
                        </dt>
                        <dd className="text-foreground text-right tabular-nums">
                          {featuredRequested} / {featuredCapacity} requested
                        </dd>
                      </div>
                      <Progress
                        size="sm"
                        aria-label={`Capacity at ${featuredUtilization}%`}
                        value={featuredUtilization}
                        tone={featuredUtilization >= 80 ? "warning" : "primary"}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground inline-flex items-center gap-2">
                        <Globe className="size-3.5" aria-hidden="true" />
                        Time zone
                      </dt>
                      <dd className="text-foreground text-right">
                        {PLANNER_ZONE.replace(/_/g, " ")}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground inline-flex items-center gap-2">
                        <Repeat className="size-3.5" aria-hidden="true" />
                        Recurrence
                      </dt>
                      <dd className="text-foreground text-right">Weekly</dd>
                    </div>
                  </dl>

                  <div className="border-border/60 text-muted-foreground flex items-start gap-2 rounded-md border border-dashed p-3 text-xs">
                    <ShieldBan
                      className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    Blocked periods held for internal focus are hidden from the
                    public booking page.
                  </div>
                </div>
                <DrawerFooter>
                  <Button rightIcon={<ExternalLink />}>
                    Open booking page
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function SchedulerAndBookingRecipe() {
  return (
    <ToastProvider motion="standard">
      <BookingWorkflow />
      <ToastViewport />
    </ToastProvider>
  );
}
