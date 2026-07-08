import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Combobox,
  ComboboxItem,
  Container,
  DethinkProvider,
  FieldDescription,
  Stack,
} from "@dethink/components";

const workspaceItems = [
  { label: "Production", value: "production" },
  { label: "Staging", value: "staging" },
  { label: "Sandbox", value: "sandbox" },
];

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
    menuTrigger: {
      control: "inline-radio",
      options: ["input", "focus", "manual"],
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Combobox {...args} label="Workspace" name="workspace">
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
          <ComboboxItem value="sandbox">Sandbox</ComboboxItem>
        </Combobox>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: /Workspace/ });
    const button = canvas.getByRole("button", { name: /Show options/ });

    await userEvent.click(button);
    await expect(
      await page.findByRole("option", { name: "Production" }),
    ).toBeVisible();
    await userEvent.click(page.getByRole("option", { name: "Production" }));
    await expect(input).toHaveValue("Production");
    await waitFor(() => {
      expect(page.queryByRole("listbox")).not.toBeInTheDocument();
    });
    await expect(input).toHaveFocus();

    await userEvent.clear(input);
    await userEvent.type(input, "Sta");
    await expect(
      await page.findByRole("option", { name: "Staging" }),
    ).toBeVisible();
  },
};

export const Controlled: Story = {
  render: function ControlledComboboxStory() {
    const [value, setValue] = useState<string | null>("staging");
    const [inputValue, setInputValue] = useState("Staging");
    const itemLabels: Record<string, string> = {
      production: "Production",
      sandbox: "Sandbox",
      staging: "Staging",
    };
    const handleValueChange = (nextValue: string | null) => {
      setValue(nextValue);
      setInputValue(nextValue ? itemLabels[nextValue] : "");
    };

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <Combobox
              label="Default environment"
              value={value}
              inputValue={inputValue}
              onValueChange={handleValueChange}
              onInputValueChange={setInputValue}
            >
              <ComboboxItem value="production">Production</ComboboxItem>
              <ComboboxItem value="staging">Staging</ComboboxItem>
              <ComboboxItem value="sandbox">Sandbox</ComboboxItem>
            </Combobox>
            <FieldDescription>
              Selected environment: {value ?? "none"}
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const CustomValue: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Combobox
          allowsCustomValue
          description="Unlisted values submit the typed text."
          formValue="text"
          label="Project tag"
          name="projectTag"
          placeholder="Search or enter a tag"
        >
          <ComboboxItem value="frontend">Frontend</ComboboxItem>
          <ComboboxItem value="platform">Platform</ComboboxItem>
          <ComboboxItem value="design-system">Design system</ComboboxItem>
        </Combobox>
      </Container>
    </DethinkProvider>
  ),
};

export const DataDriven: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Combobox
          label="Workspace"
          items={workspaceItems}
          defaultValue="production"
          name="workspace"
        >
          {(item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </Combobox>
      </Container>
    </DethinkProvider>
  ),
};

export const InvalidRequired: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Combobox
          errorMessage="Choose an available model family."
          invalid
          label="Model family"
          name="modelFamily"
          required
        >
          <ComboboxItem value="fast">Fast</ComboboxItem>
          <ComboboxItem value="balanced">Balanced</ComboboxItem>
          <ComboboxItem value="reasoning">Reasoning</ComboboxItem>
        </Combobox>
      </Container>
    </DethinkProvider>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <Combobox
            disabled
            label="Billing workspace"
            name="billingWorkspace"
            defaultValue="production"
          >
            <ComboboxItem value="production">Production</ComboboxItem>
            <ComboboxItem value="staging">Staging</ComboboxItem>
          </Combobox>
          <Combobox
            readOnly
            label="Inherited role"
            name="role"
            defaultValue="viewer"
          >
            <ComboboxItem value="viewer">Viewer</ComboboxItem>
            <ComboboxItem value="admin">Admin</ComboboxItem>
          </Combobox>
        </Stack>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const disabledInput = canvas.getByRole("combobox", {
      name: /Billing workspace/,
    });
    const readOnlyInput = canvas.getByRole("combobox", {
      name: /Inherited role/,
    });

    await expect(disabledInput).toBeDisabled();
    await userEvent.click(disabledInput);
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();

    await expect(readOnlyInput).not.toBeDisabled();
    await userEvent.click(readOnlyInput);
    await expect(page.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <Combobox
          defaultValue="staging"
          label="Workspace direction"
          name="workspaceDirection"
        >
          <ComboboxItem value="production">Production</ComboboxItem>
          <ComboboxItem value="staging">Staging</ComboboxItem>
          <ComboboxItem value="sandbox">Sandbox</ComboboxItem>
        </Combobox>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole("button", { name: /Show options/ });

    await userEvent.click(button);

    const listbox = await page.findByRole("listbox");
    const portalHost = listbox.closest<HTMLElement>(
      '[data-slot="combobox-portal-container"]',
    );

    if (!portalHost) {
      throw new Error("Combobox story expected a provider-aware portal host.");
    }

    await expect(portalHost).toHaveAttribute("data-theme", "dark");
    await expect(portalHost).toHaveAttribute("data-density", "compact");
    await expect(portalHost).toHaveAttribute("dir", "rtl");
  },
};
