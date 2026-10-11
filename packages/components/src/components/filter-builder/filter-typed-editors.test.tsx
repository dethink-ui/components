import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  defineFilterFieldType,
  defineFilterFields,
  type Filter,
} from ".";

interface Deal {
  amount: number;
  closes: string;
  won: boolean;
  stage: string;
  owner: string;
}

// Wednesday Sep 30, 2026.
const now = Date.UTC(2026, 8, 30, 12);

const deals: Deal[] = [
  {
    amount: 1200,
    closes: "2026-09-30",
    won: true,
    stage: "lead",
    owner: "ada",
  },
  {
    amount: 5400,
    closes: "2026-09-29",
    won: false,
    stage: "lead",
    owner: "lin",
  },
  {
    amount: 900,
    closes: "2026-10-12",
    won: false,
    stage: "proposal",
    owner: "ada",
  },
  {
    amount: 15000,
    closes: "2026-08-01",
    won: true,
    stage: "closed",
    owner: "sam",
  },
];

const ownerType = defineFilterFieldType({
  id: "user",
  operators: [
    {
      id: "is",
      label: "is",
      arity: "single",
      valueKind: "user",
      evaluate: (rowValue, value) => rowValue === value,
    },
  ],
  formatValue: (value) => [`@${String(value)}`],
  renderEditor: ({ onCommit, onValueChange }) => (
    <div role="group" aria-label="Pick an owner">
      {["ada", "lin"].map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => {
            onValueChange(name);
            onCommit();
          }}
        >
          {name}
        </button>
      ))}
    </div>
  ),
});

const fields = defineFilterFields<Deal>([
  { key: "amount", label: "Amount", type: "number" },
  { key: "closes", label: "Closes", type: "date" },
  { key: "won", label: "Won", type: "boolean" },
  {
    key: "stage",
    label: "Stage",
    type: "option",
    options: [
      { value: "lead", label: "Lead" },
      { value: "proposal", label: "Proposal" },
      { value: "closed", label: "Closed" },
    ],
  },
  { key: "owner", label: "Owner", type: ownerType },
]);

function setup(defaultValue?: Filter, extra: { showImpact?: boolean } = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn<(filter: Filter) => void>();

  render(
    <FilterBar
      fields={fields}
      data={deals}
      defaultValue={defaultValue}
      evaluateOptions={{ now }}
      onValueChange={onValueChange}
      {...extra}
    />,
  );

  const last = () => onValueChange.mock.lastCall?.[0].children[0];

  return { last, onValueChange, user };
}

async function addField(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  await user.click(
    screen.getByRole("button", { name: /^(Add filter|Filter)$/ }),
  );
  await user.click(await screen.findByRole("option", { name }));
}

describe("typed value editors", () => {
  it("adds a number condition and edits a between range", async () => {
    const { last, user } = setup();

    await addField(user, "Amount");

    const input = await screen.findByRole("textbox", { name: "Amount value" });

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    await user.type(input, "1000{Enter}");

    expect(last()).toMatchObject({
      field: "amount",
      operator: "eq",
      value: 1000,
    });

    await user.click(
      screen.getByRole("button", { name: "Change operator, is" }),
    );
    await user.click(await screen.findByRole("option", { name: "is between" }));

    // A range has another value shape, so the value clears and the editor opens.
    const from = await screen.findByRole("textbox", {
      name: "Amount value, From",
    });

    await user.type(from, "500");
    expect(last()).toMatchObject({ operator: "between" });
    expect(last()).not.toHaveProperty("value");

    await user.type(
      screen.getByRole("textbox", { name: "Amount value, To" }),
      "2000{Enter}",
    );

    expect(last()).toMatchObject({ value: [500, 2000] });
    expect(
      await screen.findByRole("group", {
        name: "Amount is between 500 – 2,000",
      }),
    ).toBeInTheDocument();
  });

  it("picks a date preset, a calendar day, a duration and a period", async () => {
    const { last, user } = setup();

    await addField(user, "Closes");
    // Dates default to "is in the last" with duration presets.
    await user.click(await screen.findByRole("option", { name: "7 days" }));
    expect(last()).toMatchObject({
      operator: "inLast",
      value: { amount: 7, unit: "day" },
    });

    await user.click(
      await screen.findByRole("button", {
        name: "Change operator, is in the last",
      }),
    );
    await user.click(await screen.findByRole("option", { name: "is" }));
    await user.click(await screen.findByRole("option", { name: "Yesterday" }));
    expect(last()).toMatchObject({
      operator: "is",
      value: { kind: "relative", amount: -1, unit: "day" },
    });

    await user.click(
      await screen.findByRole("button", { name: "Change value, yesterday" }),
    );

    const calendar = await screen.findByRole("application", {
      name: /Pick a date/,
    });

    await user.click(
      within(calendar).getByRole("button", { name: /September 15/ }),
    );
    expect(last()).toMatchObject({
      value: { kind: "absolute", date: "2026-09-15" },
    });

    await user.click(
      await screen.findByRole("button", { name: "Change operator, is" }),
    );
    await user.click(await screen.findByRole("option", { name: "is in" }));
    await user.click(await screen.findByRole("option", { name: "This week" }));
    expect(last()).toMatchObject({
      operator: "inPeriod",
      value: { kind: "relative", amount: 0, unit: "week" },
    });
    expect(
      await screen.findByRole("group", { name: "Closes is in this week" }),
    ).toBeInTheDocument();
  });

  it("types a custom duration", async () => {
    const { last, user } = setup();

    await addField(user, "Closes");
    await user.type(
      await screen.findByRole("textbox", { name: "Amount" }),
      "2",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Unit" }),
      "week",
    );

    expect(last()).toMatchObject({ value: { amount: 2, unit: "week" } });
  });

  it("picks yes or no with facet counts", async () => {
    const { last, user } = setup();

    await addField(user, "Won");

    const yes = await screen.findByRole("option", { name: "Yes, 2 matching" });

    expect(
      screen.getByRole("option", { name: "No, 2 matching" }),
    ).toBeInTheDocument();
    await user.click(yes);
    expect(last()).toMatchObject({ field: "won", operator: "is", value: true });
  });

  it("shows option counts that apply the other filters", async () => {
    const { user } = setup(
      createFilter({
        id: "root",
        children: [
          createFilterCondition({
            id: "won",
            field: "won",
            operator: "is",
            value: false,
          }),
        ],
      }),
    );

    await addField(user, "Stage");

    // Lost deals: one lead, one proposal, no closed.
    expect(
      await screen.findByRole("option", { name: "Lead, 1 matching" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Proposal, 1 matching" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Closed, 0 matching" }),
    ).toHaveAttribute("data-empty");
  });

  it("leaves out option counts when the new condition joins an OR group", async () => {
    const { user } = setup(
      createFilter({
        id: "root",
        combinator: "or",
        children: [
          createFilterCondition({
            field: "won",
            operator: "is",
            value: false,
          }),
        ],
      }),
    );

    await addField(user, "Stage");

    // Picking Lead would add the won lead, so "Lead, 1 matching" would lie.
    expect(
      await screen.findByRole("option", { name: "Lead" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /matching/ })).toBeNull();
  });

  it("renders a custom type's editor and value text", async () => {
    const { last, user } = setup();

    await addField(user, "Owner");
    await user.click(
      within(
        await screen.findByRole("group", { name: "Pick an owner" }),
      ).getByRole("button", { name: "lin" }),
    );

    expect(last()).toMatchObject({ field: "owner", value: "lin" });
    expect(
      await screen.findByRole("group", { name: "Owner is @lin" }),
    ).toBeInTheDocument();
  });
});

describe("typed editors inside the group editor", () => {
  it("keeps the group editor open while a date or number editor is used", async () => {
    const { last, user } = setup(
      createFilter({
        id: "root",
        children: [
          createFilterCondition({
            id: "closes",
            field: "closes",
            operator: "is",
            value: { kind: "relative", amount: 0, unit: "day" },
          }),
          createFilterCondition({
            id: "amount",
            field: "amount",
            operator: "gt",
            value: 100,
          }),
        ],
      }),
    );

    await user.click(screen.getByRole("button", { name: "Advanced" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Edit filter groups",
    });

    await user.click(
      within(dialog).getByRole("button", { name: "Change value, today" }),
    );
    await user.click(await screen.findByRole("option", { name: "Tomorrow" }));

    expect(last()).toMatchObject({
      value: { kind: "relative", amount: 1, unit: "day" },
    });
    expect(
      screen.getByRole("dialog", { name: "Edit filter groups" }),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "Change value, 100" }),
    );

    const input = await screen.findByRole("textbox", { name: "Amount value" });

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(
      screen.getByRole("dialog", { name: "Edit filter groups", hidden: true }),
    ).toBeInTheDocument();
  });
});

describe("number editors with a controlled value", () => {
  const amountFilter = (value: number | [number, number]) =>
    createFilter({
      id: "root",
      children: [
        createFilterCondition({
          id: "amount",
          field: "amount",
          operator: Array.isArray(value) ? "between" : "eq",
          value,
        }),
      ],
    });

  function renderControlled(value: Filter) {
    const user = userEvent.setup();
    const view = render(
      <FilterBar
        fields={fields}
        value={value}
        evaluateOptions={{ now }}
        onValueChange={vi.fn()}
      />,
    );
    const rerender = (next: Filter) => {
      view.rerender(
        <FilterBar
          fields={fields}
          value={next}
          evaluateOptions={{ now }}
          onValueChange={vi.fn()}
        />,
      );
    };

    return { rerender, user };
  }

  it("follows value changes while the number editor is open", async () => {
    const { rerender, user } = renderControlled(amountFilter(10));

    await user.click(screen.getByRole("button", { name: /Change value, 10/ }));

    const input = await screen.findByRole("textbox", { name: "Amount value" });

    expect(input).toHaveValue("10");
    rerender(amountFilter(20));
    expect(input).toHaveValue("20");
  });

  it("follows value changes in the range editor", async () => {
    const { rerender, user } = renderControlled(amountFilter([1, 5]));

    await user.click(screen.getByRole("button", { name: /Change value/ }));

    const from = await screen.findByRole("textbox", {
      name: "Amount value, From",
    });

    rerender(amountFilter([2, 8]));
    expect(from).toHaveValue("2");
    expect(
      screen.getByRole("textbox", { name: "Amount value, To" }),
    ).toHaveValue("8");
  });

  it("keeps incomplete typing that still stands for the value", async () => {
    const { user } = setup();

    await addField(user, "Amount");

    const input = await screen.findByRole("textbox", { name: "Amount value" });

    await user.type(input, "12.");
    expect(input).toHaveValue("12.");
    await user.clear(input);
    await user.type(input, "-");
    expect(input).toHaveValue("-");
  });

  it("follows value changes in the duration editor", async () => {
    const duration = (amount: number) =>
      createFilter({
        id: "root",
        children: [
          createFilterCondition({
            id: "closes",
            field: "closes",
            operator: "inLast",
            value: { amount, unit: "week" },
          }),
        ],
      });
    const { rerender, user } = renderControlled(duration(2));

    await user.click(screen.getByRole("button", { name: /Change value/ }));

    const amount = await screen.findByRole("textbox", { name: "Amount" });

    expect(amount).toHaveValue("2");
    rerender(duration(3));
    expect(amount).toHaveValue("3");
    expect(screen.getByRole("combobox", { name: "Unit" })).toHaveValue("week");
  });
});

describe("impact counts and rescue", () => {
  const lostProposals = () =>
    createFilter({
      id: "root",
      children: [
        createFilterCondition({
          id: "stage",
          field: "stage",
          operator: "isAnyOf",
          value: ["lead"],
        }),
        createFilterCondition({
          id: "won",
          field: "won",
          operator: "is",
          value: false,
        }),
      ],
    });

  it("shows how many rows each chip removes, when asked", () => {
    setup(lostProposals(), { showImpact: true });

    const stage = screen.getByRole("group", { name: "Stage is Lead" });

    // Without "Stage is Lead", lost deals are b and c: the chip hides c.
    expect(stage).toHaveTextContent("−1");
    expect(stage).toHaveAccessibleDescription("removes 1 row");
    expect(
      document.querySelector('[data-slot="filter-bar-status"]'),
    ).toHaveTextContent("1 result");
  });

  it("shows chips in an OR group as adding rows", () => {
    setup(
      createFilter({
        id: "root",
        combinator: "or",
        children: lostProposals().children,
      }),
      { showImpact: true },
    );

    const stage = screen.getByRole("group", { name: "Stage is Lead" });

    // Leads or lost deals are a, b and c; without "Stage is Lead", only b, c.
    expect(stage).toHaveTextContent("+1");
    expect(stage).not.toHaveTextContent("−");
    expect(stage).toHaveAccessibleDescription("adds 1 row");
  });

  it("hides impact counts by default", () => {
    setup(lostProposals());

    expect(
      document.querySelector('[data-slot="filter-chip-impact"]'),
    ).toBeNull();
  });

  it("offers to relax the most restrictive chip when nothing matches", async () => {
    const { user } = setup(
      createFilter({
        id: "root",
        children: [
          createFilterCondition({
            id: "closed",
            field: "stage",
            operator: "isAnyOf",
            value: ["closed"],
          }),
          createFilterCondition({
            id: "lost",
            field: "won",
            operator: "is",
            value: false,
          }),
        ],
      }),
    );

    const status = document.querySelector('[data-slot="filter-bar-status"]');

    // Dropping "Won is No" shows 1 closed deal; dropping "Stage is Closed"
    // shows the 2 lost deals, so the stage chip is the most restrictive.
    expect(status).toHaveTextContent(
      "0 results No results. Removing “Stage is Closed” would show 2.",
    );

    await user.click(
      screen.getByRole("button", { name: "Relax: Stage is Closed" }),
    );

    expect(screen.queryByRole("group", { name: /Stage/ })).toBeNull();
    expect(status).toHaveTextContent("2 results");
    expect(
      document.querySelector('[data-slot="filter-bar-rescue"]'),
    ).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Undo filter change" }),
    );

    expect(
      screen.getByRole("group", { name: "Stage is Closed" }),
    ).toBeInTheDocument();
  });
});
