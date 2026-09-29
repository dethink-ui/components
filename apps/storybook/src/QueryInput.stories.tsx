import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FilterBar,
  QueryInput,
  createFilter,
  createFilterCondition,
  defineFilterFields,
  useFilterState,
} from "@dethink/components";
import { expect, userEvent, within } from "storybook/test";

const fields = defineFilterFields([
  { key: "title", label: "Title", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "option",
    options: [
      { value: "open", label: "Open" },
      { value: "blocked", label: "Blocked" },
      { value: "done", label: "Done" },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    type: "multiOption",
    options: [
      { value: "bug", label: "Bug" },
      { value: "api", label: "API" },
    ],
  },
  { key: "estimate", label: "Estimate", type: "number" },
  { key: "created", label: "Created", type: "date" },
  { key: "customer", label: "Customer reported", type: "boolean" },
]);

const populated = () =>
  createFilter({
    id: "root",
    children: [
      createFilterCondition({
        id: "status",
        field: "status",
        operator: "isAnyOf",
        value: ["open", "blocked"],
      }),
      createFilterCondition({
        id: "created",
        field: "created",
        operator: "after",
        value: { kind: "relative", amount: -7, unit: "day" },
      }),
      createFilter({
        id: "either",
        combinator: "or",
        children: [
          createFilterCondition({
            id: "bug",
            field: "labels",
            operator: "includesAny",
            value: ["bug"],
          }),
          createFilterCondition({
            id: "customer",
            field: "customer",
            operator: "is",
            value: true,
          }),
        ],
      }),
    ],
  });

const meta = {
  title: "Components/QueryInput",
  component: QueryInput,
  parameters: { layout: "padded" },
  args: { fields },
} satisfies Meta<typeof QueryInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithQuery: Story = {
  args: { defaultValue: populated() },
};

export const Small: Story = {
  args: { defaultValue: populated(), controlSize: "sm" },
};

function SyncedWithChips() {
  const state = useFilterState({ defaultValue: populated() });

  return (
    <div className="grid gap-3">
      <QueryInput fields={fields} state={state} />
      <FilterBar fields={fields} state={state} />
    </div>
  );
}

export const WithFilterBar: Story = {
  render: () => <SyncedWithChips />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Filter query" });

    await userEvent.click(
      canvas.getByRole("button", {
        name: "Remove filter, Status is any of Open, Blocked",
      }),
    );
    await expect(input).toHaveValue(
      "created:>-7d (labels:bug OR customer:yes)",
    );
    await userEvent.type(input, " estimate:>=5{Enter}");
    await expect(
      canvas.getByRole("group", { name: "Estimate is at least 5" }),
    ).toBeInTheDocument();
  },
};

export const AutocompleteFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Filter query" });

    await userEvent.type(input, "sta");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("status:");
    await userEvent.click(
      canvas.getByRole("option", { name: "Blocked, Value" }),
    );
    await expect(input).toHaveValue("status:blocked");
  },
};

export const InvalidQuery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Filter query" });

    await userEvent.type(input, "status:open (estimate:>abc{Enter}");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(
      canvasElement.querySelector('[data-slot="query-input-error"]'),
    ).toHaveTextContent("Expected a number");
  },
};
