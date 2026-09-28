import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  defineFilterFields,
} from "@dethink/components";
import { expect, userEvent, within } from "storybook/test";

const fields = defineFilterFields([
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
  { key: "title", label: "Title", type: "text" },
]);

const populated = createFilter({
  id: "root",
  children: [
    createFilterCondition({
      id: "status",
      field: "status",
      operator: "isAnyOf",
      value: ["open", "blocked"],
    }),
    createFilterCondition({
      id: "labels",
      field: "labels",
      operator: "includesAll",
      value: ["bug", "api"],
    }),
    createFilterCondition({
      id: "title",
      field: "title",
      operator: "contains",
      value: "latency",
    }),
  ],
});

const meta = {
  title: "Components/FilterBar",
  component: FilterBar,
  parameters: { layout: "padded" },
  args: { fields },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithFilters: Story = {
  args: { defaultValue: populated, resultCount: 12 },
};

export const Small: Story = {
  args: { defaultValue: populated, size: "sm" },
};

export const Incomplete: Story = {
  args: {
    defaultValue: createFilter({
      children: [
        createFilterCondition({ field: "status", operator: "isAnyOf" }),
        createFilterCondition({ field: "ghost", operator: "is", value: "x" }),
      ],
    }),
  },
};

export const MatchAny: Story = {
  args: {
    defaultValue: { ...populated, combinator: "or" },
  },
};

export const NarrowCollapsed: Story = {
  args: { defaultValue: populated, collapseAfter: 1 },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const AddFilterFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Add filter" }));
    await userEvent.click(await body.findByRole("option", { name: "Status" }));
    await userEvent.click(await body.findByRole("option", { name: "Blocked" }));
    await userEvent.keyboard("{Escape}");

    await expect(
      await canvas.findByRole("group", { name: "Status is Blocked" }),
    ).toBeInTheDocument();
  },
};

export const KeyboardRemoveAndUndo: Story = {
  args: { defaultValue: populated },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    canvas.getByRole("button", { name: "Change field, Status" }).focus();
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.queryByRole("group", { name: /Status/ })).toBeNull();

    await userEvent.keyboard("{Control>}z{/Control}");
    await expect(
      canvas.getByRole("group", { name: "Status is any of Open, Blocked" }),
    ).toBeInTheDocument();
  },
};

const grouped = createFilter({
  id: "grouped",
  children: [
    createFilterCondition({
      id: "g-status",
      field: "status",
      operator: "isNoneOf",
      value: ["done"],
    }),
    createFilter({
      id: "g-labels",
      combinator: "or",
      children: [
        createFilterCondition({
          id: "g-bug",
          field: "labels",
          operator: "includesAny",
          value: ["bug"],
        }),
        createFilterCondition({
          id: "g-title",
          field: "title",
          operator: "contains",
          value: "api",
        }),
      ],
    }),
  ],
});

export const Groups: Story = {
  args: { defaultValue: grouped },
};

export const GroupEditorFlow: Story = {
  args: { defaultValue: grouped },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Advanced" }));

    const dialog = within(
      await body.findByRole("dialog", { name: "Edit filter groups" }),
    );

    await userEvent.click(
      dialog.getByRole("button", { name: "Wrap in group, Status is not Done" }),
    );
    await userEvent.keyboard("{Escape}");

    await expect(
      await canvas.findByRole("group", { name: "Status is not Done" }),
    ).toHaveAttribute("data-slot", "filter-group-chip");
  },
};
