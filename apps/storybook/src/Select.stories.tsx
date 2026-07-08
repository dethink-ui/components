import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  DethinkProvider,
  FieldDescription,
  Form,
  Select,
  SelectItem,
  Stack,
} from "@dethink/components";

const workspaceItems = [
  { label: "Production", value: "production" },
  { label: "Staging", value: "staging" },
  { label: "Sandbox", value: "sandbox" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Select {...args} label="Workspace" name="workspace">
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="sandbox">Sandbox</SelectItem>
        </Select>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: /Workspace/ });

    await userEvent.click(trigger);
    await expect(
      await page.findByRole("option", { name: "Production" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("option", { name: "Production" }));
    await expect(trigger).toHaveTextContent("Production");
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(
      await page.findByRole("option", { name: "Staging" }),
    ).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(trigger).toHaveTextContent("Staging");
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: function ControlledSelectStory() {
    const [value, setValue] = useState("staging");

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Select
              label="Default environment"
              value={value}
              onValueChange={setValue}
            >
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="sandbox">Sandbox</SelectItem>
            </Select>
            <FieldDescription>Selected environment: {value}</FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const Placeholder: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Select label="Region" placeholder="Choose a region" name="region">
          <SelectItem value="us-east">US East</SelectItem>
          <SelectItem value="eu-west">EU West</SelectItem>
          <SelectItem value="ap-south">AP South</SelectItem>
        </Select>
      </Container>
    </DethinkProvider>
  ),
};

export const DataDriven: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Select
          label="Workspace"
          items={workspaceItems}
          defaultValue="production"
          name="workspace"
        >
          {(item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          )}
        </Select>
      </Container>
    </DethinkProvider>
  ),
};

export const InvalidRequired: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Select
          errorMessage="Choose an available model family."
          invalid
          label="Model family"
          name="modelFamily"
          required
        >
          <SelectItem value="fast">Fast</SelectItem>
          <SelectItem value="balanced">Balanced</SelectItem>
          <SelectItem value="reasoning">Reasoning</SelectItem>
        </Select>
      </Container>
    </DethinkProvider>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <Select
            disabled
            label="Billing workspace"
            name="billingWorkspace"
            defaultValue="production"
          >
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </Select>
          <Select
            readOnly
            label="Inherited role"
            name="role"
            defaultValue="viewer"
          >
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </Select>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const disabledTrigger = canvas.getByRole("button", {
      name: /Billing workspace/,
    });
    const readOnlyTrigger = canvas.getByRole("button", {
      name: /Inherited role/,
    });

    await expect(disabledTrigger).toBeDisabled();
    await userEvent.click(disabledTrigger);
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();

    await expect(readOnlyTrigger).not.toBeDisabled();
    await userEvent.click(readOnlyTrigger);
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <Select
          defaultOpen
          defaultValue="staging"
          label="Workspace direction"
          name="workspaceDirection"
        >
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="sandbox">Sandbox</SelectItem>
        </Select>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const listbox = await page.findByRole("listbox");
    const portalHost = listbox.closest<HTMLElement>(
      '[data-slot="select-portal-container"]',
    );

    if (!portalHost) {
      throw new Error("Select story expected a provider-aware portal host.");
    }

    await expect(portalHost).toHaveAttribute("data-theme", "dark");
    await expect(portalHost).toHaveAttribute("data-density", "compact");
    await expect(portalHost).toHaveAttribute("dir", "rtl");
  },
};

export const SettingsFilterCard: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <Card as="section">
          <CardHeader>
            <CardTitle>Workspace defaults</CardTitle>
            <CardDescription>
              Select keeps one-of-many settings compact while preserving form
              submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form action="/settings" method="post">
              <Select
                description="Used for dashboards, alerts, and deployment filters."
                label="Default workspace"
                name="defaultWorkspace"
                defaultValue="production"
              >
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="sandbox">Sandbox</SelectItem>
              </Select>
              <Select label="AI model" name="model" defaultValue="balanced">
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="reasoning">Reasoning</SelectItem>
              </Select>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </DethinkProvider>
  ),
};
