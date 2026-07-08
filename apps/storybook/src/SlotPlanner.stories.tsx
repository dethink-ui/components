import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  DethinkProvider,
  SlotPicker,
  SlotPlanner,
  useSlotPlanner,
  type SlotPlannerSlotData,
} from "@dethink/components";
import {
  slotPlannerClinicTaxonomy,
  slotPlannerMentoringTaxonomy,
  slotPlannerSampleConstraints,
  slotPlannerSampleSlots,
} from "../../../packages/components/src/components/slot-planner/slot-planner-fixtures";

// The canonical fixtures are anchored to the week of Monday 2026-07-06, so
// every story injects a deterministic `now` inside that week. The planner
// parses `now` as a local date-time; the picker anchors to the instant and
// projects it into the viewer zone.
const plannerNow = "2026-07-06T00:30:00";
const pickerNow = "2026-07-06T04:30:00Z";
const mondayIso = "2026-07-06";

const meta = {
  title: "Components/SlotPlanner",
  component: SlotPlanner,
  args: {
    defaultSlots: slotPlannerSampleSlots,
    defaultFocusedDate: mondayIso,
    now: plannerNow,
    title: "Availability",
  },
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["week", "day"],
    },
    reducedMotion: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SlotPlanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ManageWeek: Story = {
  args: {
    constraints: slotPlannerSampleConstraints,
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPlanner {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Day selection through the rail.
    await userEvent.click(canvas.getAllByRole("tab")[1]!);
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Tuesday, July 7, 2026" }),
    ).toBeVisible();

    // Week navigation keeps the same weekday focused.
    await userEvent.click(canvas.getByRole("button", { name: "Next week" }));
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Tuesday, July 14, 2026" }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "This week" }));
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Monday, July 6, 2026" }),
    ).toBeVisible();
  },
};

export const DayView: Story = {
  args: {
    view: "day",
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-md rounded-lg border p-6"
    >
      <SlotPlanner {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("tablist")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Monday, July 6, 2026" }),
    ).toBeVisible();
  },
};

export const CreateSlotFlow: Story = {
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPlanner {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await within(document.body).findByRole("dialog", {
      name: "Add slot",
    });

    await expect(within(dialog).getByLabelText("Date")).toHaveValue(mondayIso);
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    // The editor defaults create a 09:00 one-hour slot on the focused day.
    await expect(await canvas.findByText("09:00 – 10:00")).toBeVisible();
  },
};

export const EditorConstraintViolations: Story = {
  args: {
    constraints: slotPlannerSampleConstraints,
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPlanner {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Add slot to this day" }),
    );

    const dialog = await within(document.body).findByRole("dialog", {
      name: "Add slot",
    });

    // 09:00 today starts sooner than the 12-hour minimum notice, so the
    // editor stays open and lists the violation.
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Starts sooner than the minimum notice period",
    );
    await expect(dialog).toBeVisible();
  },
};

export const CapReached: Story = {
  args: {
    constraints: {
      ...slotPlannerSampleConstraints,
      dailyRequestableCap: 2,
    },
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPlanner {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Monday holds two published slots, so a cap of two is reached; the
    // state is stated in text, never by color alone.
    await expect(
      canvas.getByText("Daily cap: 2 / 2 requestable slots"),
    ).toBeVisible();
    await expect(canvas.getByText("Daily cap reached")).toBeVisible();
  },
};

export const TaxonomyVariants: Story = {
  render: (args) => (
    <div className="grid gap-4 xl:grid-cols-2">
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-6"
      >
        <SlotPlanner
          {...args}
          title="Mentoring availability"
          taxonomy={slotPlannerMentoringTaxonomy}
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-6"
      >
        <SlotPlanner
          {...args}
          title="Clinic appointments"
          taxonomy={slotPlannerClinicTaxonomy}
        />
      </DethinkProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Mentoring speaks "session"; the clinic overrides status labels too.
    await expect(
      canvas.getByRole("button", { name: "Add session to this day" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Add appointment" }),
    ).toBeVisible();
  },
};

export const CustomRendererDecoration: Story = {
  args: {
    defaultFocusedDate: "2026-07-08",
    title: "Group sessions",
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPlanner
        {...args}
        renderers={{
          // Decorates the shipped card instead of rebuilding it, and reads a
          // custom `data` key the default renderers deliberately ignore.
          slotCard: ({ occurrence, renderDefault }) => (
            <div className="grid gap-[var(--dt-space-2)]">
              {renderDefault()}
              {typeof occurrence.slot.data?.priceUsd === "number" ? (
                <p
                  data-slot="story-price-line"
                  className="text-primary text-xs font-semibold"
                >
                  {`$${occurrence.slot.data.priceUsd} per seat`}
                </p>
              ) : null}
            </div>
          ),
          tag: ({ tag }) => (
            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-[var(--dt-space-2)] py-0.5 text-xs font-medium">
              {tag}
            </span>
          ),
        }}
      />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("$40 per seat")).toBeVisible();
    // The decorated default keeps the shipped edit affordance.
    await expect(
      canvas.getByRole("button", { name: "Edit slot" }),
    ).toBeVisible();
  },
};

function HeadlessAgendaExample() {
  // Fully custom layout over the headless hook: no shipped DOM, no Motion.
  const planner = useSlotPlanner({
    defaultSlots: slotPlannerSampleSlots,
    defaultFocusedDate: mondayIso,
    now: plannerNow,
    constraints: slotPlannerSampleConstraints,
  });
  const weekdayFormatter = new Intl.DateTimeFormat("en", {
    weekday: "short",
    timeZone: "UTC",
  });

  return (
    <div className="grid max-w-md gap-[var(--dt-space-3)]">
      <div className="flex items-center justify-between gap-[var(--dt-space-2)]">
        <h3 className="text-base font-semibold">Custom agenda</h3>
        <div className="flex gap-[var(--dt-space-1)]">
          <button
            type="button"
            className="border-border rounded-md border px-2 py-1 text-xs"
            onClick={planner.goToPreviousWeek}
          >
            {planner.taxonomy.previousWeek}
          </button>
          <button
            type="button"
            className="border-border rounded-md border px-2 py-1 text-xs"
            onClick={planner.goToNextWeek}
          >
            {planner.taxonomy.nextWeek}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-[var(--dt-space-1)]">
        {planner.weekDays.map((date) => (
          <button
            key={date}
            type="button"
            aria-pressed={date === planner.focusedDate}
            className="border-border aria-pressed:bg-primary aria-pressed:text-primary-foreground rounded-md border px-2 py-1 text-xs"
            onClick={() => planner.setFocusedDate(date)}
          >
            {weekdayFormatter.format(new Date(`${date}T00:00:00Z`))}
          </button>
        ))}
      </div>
      {planner.dailyCap ? (
        <p className="text-muted-foreground text-xs">
          {`${planner.dailyCap.used} / ${planner.dailyCap.cap} used`}
        </p>
      ) : null}
      <ul className="m-0 grid list-none gap-[var(--dt-space-1)] p-0 text-sm">
        {planner.selectedOccurrences.length === 0 ? (
          <li className="text-muted-foreground">{planner.taxonomy.emptyDay}</li>
        ) : (
          planner.selectedOccurrences.map((occurrence) => (
            <li
              key={`${occurrence.slotId}::${occurrence.occurrenceDate}`}
              className="border-border flex items-center justify-between rounded-md border px-[var(--dt-space-3)] py-[var(--dt-space-2)]"
            >
              <span>{occurrence.startTime}</span>
              <span className="text-muted-foreground text-xs">
                {planner.taxonomy.statusLabels[occurrence.status]}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export const HeadlessHookRecipe: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <HeadlessAgendaExample />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("2 / 3 used")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Tue" }));
    await expect(canvas.getByText("09:30")).toBeVisible();
  },
};

function BookModeExample() {
  const [slots, setSlots] = useState(slotPlannerSampleSlots);

  return (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPicker
        title="Book a session"
        slots={slots}
        viewerTimeZone="America/New_York"
        defaultFocusedDate={mondayIso}
        now={pickerNow}
        onBookRequest={({ slotId, occurrenceDate }) => {
          // The app owns the collection: reflect the request by bumping the
          // occurrence's requested count.
          setSlots((previous) =>
            previous.map((slot) => {
              if (slot.id !== slotId) {
                return slot;
              }

              if (slot.date === occurrenceDate) {
                return {
                  ...slot,
                  requestedCount: (slot.requestedCount ?? 0) + 1,
                } satisfies SlotPlannerSlotData;
              }

              const overrides = slot.recurrence?.overrides ?? [];

              return {
                ...slot,
                recurrence: slot.recurrence
                  ? {
                      ...slot.recurrence,
                      overrides: [
                        ...overrides,
                        { occurrenceDate, requestedCount: 1 },
                      ],
                    }
                  : slot.recurrence,
              } satisfies SlotPlannerSlotData;
            }),
          );
        }}
      />
    </DethinkProvider>
  );
}

export const BookMode: Story = {
  render: () => <BookModeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The New York viewer sees the 14:15 Europe/London slot at 09:15 with
    // its provider-zone context line.
    await expect(canvas.getByText("09:15 – 10:15")).toBeVisible();
    await expect(canvas.getByText("14:15 Europe/London")).toBeVisible();

    const card = canvas.getAllByRole("listitem")[0]!;

    await userEvent.click(
      within(card).getByRole("button", { name: "Request slot" }),
    );
    await expect(await within(card).findByText("requested")).toBeVisible();
  },
};

export const BookModeViewerZones: Story = {
  render: () => (
    <div className="grid gap-4 xl:grid-cols-2">
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-6"
      >
        <SlotPicker
          title="London viewer"
          slots={slotPlannerSampleSlots}
          viewerTimeZone="Europe/London"
          defaultFocusedDate={mondayIso}
          now={pickerNow}
          taxonomy={slotPlannerMentoringTaxonomy}
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-6"
      >
        <SlotPicker
          title="Kolkata viewer"
          slots={slotPlannerSampleSlots}
          viewerTimeZone="Asia/Kolkata"
          defaultFocusedDate={mondayIso}
          now={pickerNow}
          taxonomy={slotPlannerMentoringTaxonomy}
        />
      </DethinkProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 14:15 Europe/London (BST) projects to 18:45 Asia/Kolkata.
    await expect(canvas.getByText("14:15 – 15:15")).toBeVisible();
    await expect(canvas.getByText("18:45 – 19:45")).toBeVisible();
  },
};

export const ThemeDensityAndRtl: Story = {
  args: {
    constraints: slotPlannerSampleConstraints,
  },
  render: (args) => (
    <div className="grid gap-4 xl:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-6"
      >
        <SlotPlanner {...args} title="Compact dark" />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <SlotPlanner {...args} title="RTL comfortable" />
      </DethinkProvider>
    </div>
  ),
};

export const ReducedMotion: Story = {
  args: {
    constraints: slotPlannerSampleConstraints,
    reducedMotion: true,
  },
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SlotPlanner {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="slot-planner"]');

    await expect(root).not.toBeNull();
    // Every animation collapses; state stays on text and data attributes.
    await expect(root).toHaveAttribute("data-reduced-motion", "true");
  },
};
