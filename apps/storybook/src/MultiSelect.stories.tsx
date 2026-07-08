import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Container,
  DethinkProvider,
  FieldDescription,
  Form,
  MultiSelect,
  MultiSelectItem,
  Stack,
} from "@dethink/components";

const teamItems = [
  { label: "Operations", value: "operations" },
  { label: "Finance", value: "finance" },
  { label: "RevOps", value: "revops" },
  { label: "Customer success", value: "customer-success" },
];

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <MultiSelect
          {...args}
          description="Select every team that should receive the report."
          label="Recipient teams"
          name="recipientTeams"
          placeholder="Choose teams"
        >
          <MultiSelectItem value="operations">Operations</MultiSelectItem>
          <MultiSelectItem value="finance">Finance</MultiSelectItem>
          <MultiSelectItem value="revops">RevOps</MultiSelectItem>
        </MultiSelect>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: /Show options/ }));
    await userEvent.click(
      await page.findByRole("option", { name: "Operations" }),
    );

    await expect(canvas.getByText("Operations")).toBeVisible();
  },
};

export const Controlled: Story = {
  render: function ControlledMultiSelectStory() {
    const [value, setValue] = useState(["finance"]);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <MultiSelect
              label="Default audiences"
              value={value}
              onValueChange={setValue}
            >
              <MultiSelectItem value="operations">Operations</MultiSelectItem>
              <MultiSelectItem value="finance">Finance</MultiSelectItem>
              <MultiSelectItem value="revops">RevOps</MultiSelectItem>
            </MultiSelect>
            <FieldDescription>
              Selected audiences: {value.join(", ") || "none"}
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const FilteringAndForm: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Form action="/filters" method="post">
          <MultiSelect
            defaultValue={["finance"]}
            description="Search filters the option list while preserving selected chips."
            items={teamItems}
            label="Teams"
            name="teams"
          >
            {(item) => (
              <MultiSelectItem key={item.value} value={item.value}>
                {item.label}
              </MultiSelectItem>
            )}
          </MultiSelect>
        </Form>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: /Show options/ }));
    await userEvent.type(
      canvas.getByRole("combobox", { name: /Teams/ }),
      "rev",
    );

    await expect(
      await page.findByRole("option", { name: "RevOps" }),
    ).toBeVisible();
    await expect(
      page.queryByRole("option", { name: "Finance" }),
    ).not.toBeInTheDocument();
  },
};

export const States: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <MultiSelect
            disabledKeys={["finance"]}
            errorMessage="Choose at least one active owner."
            invalid
            label="Active owners"
            required
          >
            <MultiSelectItem value="operations">Operations</MultiSelectItem>
            <MultiSelectItem value="finance">Finance</MultiSelectItem>
            <MultiSelectItem value="revops">RevOps</MultiSelectItem>
          </MultiSelect>
          <MultiSelect
            readOnly
            defaultValue={["operations", "revops"]}
            label="Inherited visibility"
          >
            <MultiSelectItem value="operations">Operations</MultiSelectItem>
            <MultiSelectItem value="revops">RevOps</MultiSelectItem>
          </MultiSelect>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <MultiSelect
          defaultValue={["operations", "finance"]}
          label="فرق التقارير"
          name="reportTeams"
        >
          <MultiSelectItem value="operations">Operations</MultiSelectItem>
          <MultiSelectItem value="finance">Finance</MultiSelectItem>
          <MultiSelectItem value="revops">RevOps</MultiSelectItem>
        </MultiSelect>
      </Container>
    </DethinkProvider>
  ),
};

export const ResponsiveChips: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <div className="max-w-72">
        <MultiSelect
          defaultValue={["operations", "finance", "revops", "customer-success"]}
          items={teamItems}
          label="Wrapped recipients"
          name="wrappedRecipients"
        >
          {(item) => (
            <MultiSelectItem key={item.value} value={item.value}>
              {item.label}
            </MultiSelectItem>
          )}
        </MultiSelect>
      </div>
    </DethinkProvider>
  ),
};
