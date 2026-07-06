import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  useSlotPlanner,
  type SlotPlannerEditorSeriesValues,
  type SlotPlannerSlotData,
  type SlotPlannerViolation,
  type UseSlotPlannerOptions,
} from ".";
import { slotPlannerSampleSlots } from "./slot-planner-fixtures";

// Same deterministic "now" as the component tests: today is 2026-07-06 in
// any test-runner time zone.
const NOW = "2026-07-06T00:30:00";

const baseEditorValues: SlotPlannerEditorSeriesValues = {
  startTime: "10:00",
  durationMinutes: 45,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  timeZone: "Europe/London",
  tags: [],
  note: "",
  recurrence: "none",
  recurrenceUntil: "",
};

function renderPlannerHook(options: UseSlotPlannerOptions = {}) {
  return renderHook(() =>
    useSlotPlanner({
      defaultFocusedDate: "2026-07-06",
      now: NOW,
      ...options,
    }),
  );
}

describe("useSlotPlanner", () => {
  it("resolves taxonomy, week days, occurrences, summaries, and cap info", () => {
    const { result } = renderPlannerHook({
      slots: slotPlannerSampleSlots,
      constraints: { dailyRequestableCap: 3 },
    });

    expect(result.current.taxonomy.slot).toBe("slot");
    expect(result.current.todayIso).toBe("2026-07-06");
    expect(result.current.focusedDate).toBe("2026-07-06");
    expect(result.current.weekDays).toEqual([
      "2026-07-06",
      "2026-07-07",
      "2026-07-08",
      "2026-07-09",
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ]);
    expect(result.current.selectedOccurrences.map((o) => o.startTime)).toEqual([
      "14:15",
      "18:00",
    ]);
    expect(result.current.occurrencesByDate["2026-07-08"]).toHaveLength(1);
    expect(result.current.summarizeDay("2026-07-06").requestable).toBe(2);
    expect(result.current.summarizeDay("2026-07-09").booked).toBe(1);
    expect(result.current.dailyCap).toEqual({ cap: 3, reached: false, used: 2 });
    expect(result.current.slots).toBe(slotPlannerSampleSlots);
  });

  it("reports the cap as reached and omits it without a constraint", () => {
    const capped = renderPlannerHook({
      slots: slotPlannerSampleSlots,
      constraints: { dailyRequestableCap: 2 },
    });

    expect(capped.result.current.dailyCap).toEqual({
      cap: 2,
      reached: true,
      used: 2,
    });

    const uncapped = renderPlannerHook({ slots: slotPlannerSampleSlots });

    expect(uncapped.result.current.dailyCap).toBeUndefined();
  });

  it("navigates weeks and reports focused-date changes", () => {
    const onFocusedDateChange = vi.fn();
    const { result } = renderPlannerHook({ onFocusedDateChange });

    act(() => result.current.goToNextWeek());

    expect(result.current.focusedDate).toBe("2026-07-13");
    expect(result.current.weekDays[0]).toBe("2026-07-13");
    expect(onFocusedDateChange).toHaveBeenCalledWith("2026-07-13");

    act(() => result.current.goToPreviousWeek());
    act(() => result.current.goToPreviousWeek());

    expect(result.current.focusedDate).toBe("2026-06-29");

    act(() => result.current.goToThisWeek());

    expect(result.current.focusedDate).toBe("2026-07-06");

    act(() => result.current.setFocusedDate("2026-07-09"));

    expect(result.current.focusedDate).toBe("2026-07-09");
    expect(onFocusedDateChange).toHaveBeenLastCalledWith("2026-07-09");
  });

  it("validates candidates against the current collection and constraints", () => {
    const { result } = renderPlannerHook({
      slots: slotPlannerSampleSlots,
      constraints: { minDurationMinutes: 60 },
    });

    const tooShort: SlotPlannerSlotData = {
      id: "candidate-1",
      date: "2026-07-11",
      startTime: "09:00",
      durationMinutes: 30,
      timeZone: "Europe/London",
      state: "requestable",
    };

    expect(
      result.current.validate(tooShort).map((violation) => violation.code),
    ).toEqual(["min-duration"]);
    expect(
      result.current.validate({ ...tooShort, durationMinutes: 60 }),
    ).toEqual([]);
  });

  it("returns blocking violations from createSlot without dispatching", () => {
    const onCreateSlot = vi.fn();
    const { result } = renderPlannerHook({
      defaultSlots: [],
      constraints: { minDurationMinutes: 120 },
      onCreateSlot,
    });

    let violations: SlotPlannerViolation[] = [];

    act(() => {
      violations = result.current.createSlot(baseEditorValues);
    });

    expect(violations.map((violation) => violation.code)).toEqual([
      "min-duration",
    ]);
    expect(onCreateSlot).not.toHaveBeenCalled();
    expect(result.current.slots).toEqual([]);
  });

  it("dispatches createSlot, applies uncontrolled state, and announces", () => {
    const onCreateSlot = vi.fn();
    const { result } = renderPlannerHook({
      defaultSlots: [],
      generateSlotId: () => "hook-created-1",
      onCreateSlot,
    });

    act(() => {
      expect(result.current.createSlot(baseEditorValues)).toEqual([]);
    });

    expect(onCreateSlot).toHaveBeenCalledWith({
      slot: {
        id: "hook-created-1",
        date: "2026-07-06",
        startTime: "10:00",
        durationMinutes: 45,
        timeZone: "Europe/London",
        state: "requestable",
      },
    });
    expect(result.current.slots).toHaveLength(1);
    expect(result.current.selectedOccurrences[0]!.startTime).toBe("10:00");
    expect(result.current.announcement).toBe("slot added");

    // Explicit target dates key the pending state per day.
    act(() => {
      result.current.createSlot(baseEditorValues, { date: "2026-07-09" });
    });

    expect(result.current.occurrencesByDate["2026-07-09"]).toHaveLength(1);
  });

  it("dispatches occurrence- and series-scope updates through updateSlot", () => {
    const onUpdateSlot = vi.fn();
    const recurring: SlotPlannerSlotData = {
      id: "rec-1",
      date: "2026-07-06",
      startTime: "10:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
      recurrence: { frequency: "weekly" },
    };
    const { result } = renderPlannerHook({
      defaultSlots: [recurring],
      onUpdateSlot,
    });

    act(() => {
      expect(
        result.current.updateSlot(result.current.selectedOccurrences[0]!, {
          scope: "occurrence",
          startTime: "11:30",
          durationMinutes: 45,
        }),
      ).toEqual([]);
    });

    expect(onUpdateSlot.mock.calls[0]![0].slot.recurrence.overrides).toEqual([
      { occurrenceDate: "2026-07-06", startTime: "11:30", durationMinutes: 45 },
    ]);
    expect(result.current.selectedOccurrences[0]!.startTime).toBe("11:30");
    expect(result.current.announcement).toBe("slot updated");

    act(() => {
      expect(
        result.current.updateSlot(result.current.selectedOccurrences[0]!, {
          scope: "series",
          values: { ...baseEditorValues, recurrence: "weekly" },
        }),
      ).toEqual([]);
    });

    expect(onUpdateSlot.mock.calls[1]![0].slot.startTime).toBe("10:00");
    expect(onUpdateSlot).toHaveBeenCalledTimes(2);
  });

  it("applies uncontrolled deletes and fires the onApplied success hook", () => {
    const onDeleteOccurrence = vi.fn();
    const onApplied = vi.fn();
    const single: SlotPlannerSlotData = {
      id: "single-1",
      date: "2026-07-06",
      startTime: "09:00",
      durationMinutes: 30,
      timeZone: "Europe/London",
      state: "requestable",
    };
    const { result } = renderPlannerHook({
      defaultSlots: [single],
      onDeleteOccurrence,
    });

    act(() => {
      result.current.deleteOccurrence(result.current.selectedOccurrences[0]!, {
        onApplied,
      });
    });

    expect(onDeleteOccurrence).toHaveBeenCalledWith({
      slotId: "single-1",
      occurrenceDate: "2026-07-06",
    });
    expect(onApplied).toHaveBeenCalledTimes(1);
    expect(result.current.slots).toEqual([]);
    expect(result.current.selectedOccurrences).toEqual([]);
    expect(result.current.announcement).toBe("slot deleted");
  });

  it("deletes a whole series through deleteSeries", () => {
    const onDeleteSeries = vi.fn();
    const recurring: SlotPlannerSlotData = {
      id: "rec-2",
      date: "2026-07-06",
      startTime: "10:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
      recurrence: { frequency: "weekly" },
    };
    const { result } = renderPlannerHook({
      defaultSlots: [recurring],
      onDeleteSeries,
    });

    act(() => {
      result.current.deleteSeries(result.current.selectedOccurrences[0]!);
    });

    expect(onDeleteSeries).toHaveBeenCalledWith({ slotId: "rec-2" });
    expect(result.current.slots).toEqual([]);
    expect(result.current.announcement).toBe("slot series deleted");
  });

  it("fires callbacks without self-mutating controlled collections", () => {
    const onCreateSlot = vi.fn();
    const { result } = renderPlannerHook({
      slots: [],
      generateSlotId: () => "controlled-1",
      onCreateSlot,
    });

    act(() => {
      result.current.createSlot(baseEditorValues);
    });

    expect(onCreateSlot).toHaveBeenCalledTimes(1);
    // Controlled: the collection stays until the app passes new slots.
    expect(result.current.slots).toEqual([]);
  });

  it("copies the focused day through copyDay, reporting rejections", () => {
    const onBatchChange = vi.fn();
    let nextId = 0;
    const source: SlotPlannerSlotData = {
      id: "copy-source",
      date: "2026-07-06",
      startTime: "09:00",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
    };
    const wedExisting: SlotPlannerSlotData = {
      id: "wed-existing",
      date: "2026-07-08",
      startTime: "09:30",
      durationMinutes: 60,
      timeZone: "Europe/London",
      state: "requestable",
    };
    const { result } = renderPlannerHook({
      defaultSlots: [source, wedExisting],
      generateSlotId: () => `gen-${++nextId}`,
      onBatchChange,
    });

    act(() => {
      result.current.copyDay(["2026-07-07", "2026-07-08"]);
    });

    const payload = onBatchChange.mock.calls[0]![0];

    expect(payload.createdSlots.map((slot: SlotPlannerSlotData) => slot.date))
      .toEqual(["2026-07-07"]);
    expect(Object.keys(payload.violations)).toEqual(["gen-2"]);
    expect(result.current.occurrencesByDate["2026-07-07"]).toHaveLength(1);
    expect(result.current.announcement).toBe("1 slot added. 1 slot rejected");
  });

  it("tracks pending keys and stores retries for rejected callbacks", async () => {
    const onDeleteOccurrence = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const single: SlotPlannerSlotData = {
      id: "flaky-1",
      date: "2026-07-06",
      startTime: "09:00",
      durationMinutes: 30,
      timeZone: "Europe/London",
      state: "requestable",
    };
    const { result } = renderPlannerHook({
      defaultSlots: [single],
      onDeleteOccurrence,
    });
    const key = result.current.occurrenceKey({
      slotId: "flaky-1",
      occurrenceDate: "2026-07-06",
    });

    await act(async () => {
      result.current.deleteOccurrence(result.current.selectedOccurrences[0]!);
    });

    expect(result.current.pendingKeys.has(key)).toBe(false);
    expect(result.current.slots).toHaveLength(1);

    const retry = result.current.retryByKey.get(key);

    expect(retry).toBeDefined();

    await act(async () => {
      retry!();
    });

    expect(result.current.slots).toEqual([]);
    expect(result.current.retryByKey.has(key)).toBe(false);
  });
});

// A fully custom layout built only on the headless hook: plain buttons for
// the week days, a plain occurrence list, and direct dispatch wiring.
function HeadlessWeek(props: UseSlotPlannerOptions) {
  const planner = useSlotPlanner({
    defaultFocusedDate: "2026-07-06",
    now: NOW,
    ...props,
  });

  return (
    <div>
      <button type="button" onClick={planner.goToNextWeek}>
        advance week
      </button>
      {planner.weekDays.map((day) => (
        <button
          key={day}
          type="button"
          aria-pressed={day === planner.focusedDate}
          onClick={() => planner.setFocusedDate(day)}
        >
          {day}
        </button>
      ))}
      <ul aria-label="occurrences">
        {planner.selectedOccurrences.map((occurrence) => (
          <li key={planner.occurrenceKey(occurrence)}>
            <span>{occurrence.startTime}</span>
            <button
              type="button"
              onClick={() => planner.deleteOccurrence(occurrence)}
            >
              {`drop ${occurrence.startTime}`}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => planner.createSlot(baseEditorValues)}
      >
        {`add to ${planner.focusedDate}`}
      </button>
      <output>{planner.announcement}</output>
    </div>
  );
}

describe("useSlotPlanner headless layout", () => {
  it("drives navigation, create dispatch, and uncontrolled deletes", async () => {
    const user = userEvent.setup();
    const onCreateSlot = vi.fn();
    const single: SlotPlannerSlotData = {
      id: "headless-existing",
      date: "2026-07-06",
      startTime: "08:00",
      durationMinutes: 30,
      timeZone: "Europe/London",
      state: "requestable",
    };

    render(
      <HeadlessWeek
        defaultSlots={[single]}
        generateSlotId={() => "headless-created"}
        onCreateSlot={onCreateSlot}
      />,
    );

    // Navigation: selecting a day and advancing the week both re-render.
    expect(
      screen.getByRole("button", { name: "2026-07-06" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "2026-07-09" }));

    expect(
      screen.getByRole("button", { name: "2026-07-09" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "advance week" }));

    expect(
      screen.getByRole("button", { name: "2026-07-16" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Create dispatches the same payload shape as the shipped editor flow.
    await user.click(
      screen.getByRole("button", { name: "add to 2026-07-16" }),
    );

    expect(onCreateSlot).toHaveBeenCalledWith({
      slot: {
        id: "headless-created",
        date: "2026-07-16",
        startTime: "10:00",
        durationMinutes: 45,
        timeZone: "Europe/London",
        state: "requestable",
      },
    });

    const list = screen.getByRole("list", { name: "occurrences" });

    expect(within(list).getByText("10:00")).toBeInTheDocument();

    // Uncontrolled delete applies to hook state.
    await user.click(
      within(list).getByRole("button", { name: "drop 10:00" }),
    );

    expect(within(list).queryByText("10:00")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("slot deleted");
  });
});
