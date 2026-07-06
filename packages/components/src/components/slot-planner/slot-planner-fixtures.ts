import type {
  SlotPlannerConstraints,
  SlotPlannerSlotData,
  SlotPlannerTaxonomyInput,
} from "./slot-planner-contract";

/**
 * Canonical SlotPlanner sample data shared by Storybook, playground smoke
 * checks, and consumer demos. Not part of the package's public entry —
 * import this module directly (or receive it via the registry item). The
 * dataset is anchored to the week of Monday 2026-07-06 (the reference
 * design's week) and intentionally covers:
 *
 * - recurring weekly and biweekly series, one with per-occurrence overrides
 *   including a cancelled occurrence and a fully booked occurrence
 * - every stored slot state, plus booking/requested/past data that derives
 *   every occurrence status
 * - multiple IANA zones (Europe/London, America/New_York, Asia/Kolkata)
 * - a weekly series that spans the Europe/London DST end on 2026-10-25,
 *   so wall-clock expansion across a transition is exercised
 * - capacity > 1 with partial booking
 * - conventional `data` keys (tags, note) plus a custom key that default
 *   renderers must ignore
 */
export const slotPlannerSampleSlots: SlotPlannerSlotData[] = [
  {
    id: "mon-morning-architecture",
    date: "2026-07-06",
    startTime: "14:15",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    data: {
      tags: [
        "Frontend Architecture Review",
        "Data structure and algorithms",
        "Staff Full-Stack Engineer Mock Interview",
        "Playwright",
      ],
    },
  },
  {
    id: "mon-evening-architecture",
    date: "2026-07-06",
    startTime: "18:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
    recurrence: { frequency: "weekly" },
    data: {
      tags: ["Frontend Architecture Review", "Playwright"],
      note: "Runs until the autumn cohort ends.",
    },
  },
  {
    // requestedCount derives occurrence status "requested".
    id: "tue-pairing",
    date: "2026-07-07",
    startTime: "09:30",
    durationMinutes: 45,
    timeZone: "Europe/London",
    state: "requestable",
    requestedCount: 1,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 5,
    data: { tags: ["Pair Programming"] },
  },
  {
    id: "wed-group-systems",
    date: "2026-07-08",
    startTime: "17:00",
    durationMinutes: 90,
    timeZone: "America/New_York",
    state: "requestable",
    recurrence: {
      frequency: "biweekly",
      until: "2026-12-16",
      overrides: [
        { occurrenceDate: "2026-08-05", cancelled: true },
        { occurrenceDate: "2026-09-02", startTime: "18:00" },
        // Fully booked occurrence: derives status "booked" for this date.
        { occurrenceDate: "2026-07-22", bookedCount: 4 },
      ],
    },
    capacity: 4,
    bookedCount: 2,
    data: {
      tags: ["System Design", "Group Session"],
      // Custom key outside the conventional contract; default renderers
      // must ignore it while custom renderers receive it untouched.
      priceUsd: 40,
    },
  },
  {
    // bookedCount at capacity (default 1) derives occurrence status "booked".
    id: "thu-booked-review",
    date: "2026-07-09",
    startTime: "11:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
    bookedCount: 1,
    data: { tags: ["Frontend Architecture Review"] },
  },
  {
    id: "fri-blocked-admin",
    date: "2026-07-10",
    startTime: "13:00",
    durationMinutes: 120,
    timeZone: "Europe/London",
    state: "blocked",
    data: { note: "Held for internal planning." },
  },
  {
    // Past date derives occurrence status "expired" at render time.
    id: "past-intro-call",
    date: "2026-06-29",
    startTime: "10:00",
    durationMinutes: 30,
    timeZone: "Europe/London",
    state: "requestable",
  },
  {
    id: "cancelled-office-hours",
    date: "2026-07-15",
    startTime: "16:00",
    durationMinutes: 60,
    timeZone: "Asia/Kolkata",
    state: "cancelled",
    data: { tags: ["Office Hours"] },
  },
  {
    id: "autumn-dst-spanning-clinic",
    // Weekly Sunday-morning series whose occurrences straddle the
    // Europe/London DST end (2026-10-25): wall-clock 09:00 stays 09:00
    // across the transition while the UTC offset changes.
    date: "2026-10-18",
    startTime: "09:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    state: "requestable",
    recurrence: { frequency: "weekly", until: "2026-11-08" },
    data: { tags: ["Career Clinic"] },
  },
  {
    id: "draft-new-offering",
    date: "2026-07-13",
    startTime: "08:00",
    durationMinutes: 30,
    timeZone: "Europe/London",
    state: "draft",
    data: { tags: ["Speed Mentoring"], note: "Not published yet." },
  },
];

/** Constraints matching the reference design's "2 / 3 requestable" cap. */
export const slotPlannerSampleConstraints: SlotPlannerConstraints = {
  dailyRequestableCap: 3,
  weeklyRequestableCap: 12,
  minDurationMinutes: 15,
  maxDurationMinutes: 180,
  durationIncrementMinutes: 15,
  minNoticeMinutes: 720,
  bookingHorizonDays: 90,
  blackoutDates: ["2026-12-25", "2026-12-26"],
};

/** Mentoring vocabulary matching the reference design. */
export const slotPlannerMentoringTaxonomy: SlotPlannerTaxonomyInput = {
  slot: "session",
  slotPlural: "sessions",
  addSlot: "Add session to this day",
  announceCreated: "Session added",
  announceUpdated: "Session updated",
  announceDeleted: "Session deleted",
};

/** Clinic vocabulary example used in docs and stories. */
export const slotPlannerClinicTaxonomy: SlotPlannerTaxonomyInput = {
  slot: "appointment",
  slotPlural: "appointments",
  statusLabels: { requestable: "open", booked: "scheduled" },
  addSlot: "Add appointment",
};
