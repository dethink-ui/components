import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  AsyncSelect,
  Container,
  DethinkProvider,
  FieldDescription,
  Stack,
} from "@dethink/components";

const accountItems = [
  { label: "Acme Operations", value: "acme" },
  { label: "Dethink Labs", value: "dethink" },
  { label: "Northstar Systems", value: "northstar" },
  { label: "Signal Foundry", value: "signal" },
];

const ownerItems = [
  { label: "Ari Chen", value: "ari" },
  { label: "Mira Patel", value: "mira" },
  { label: "Noah Smith", value: "noah" },
  { label: "Sana Iqbal", value: "sana" },
];

const meta = {
  title: "Components/AsyncSelect",
  component: AsyncSelect,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AsyncSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: function AsyncSelectBaseStory() {
    const [query, setQuery] = useState("");
    const items = useMemo(
      () =>
        accountItems.filter((item) =>
          item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        ),
      [query],
    );

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <AsyncSelect
            inputValue={query}
            items={items}
            label="Account"
            name="account"
            onInputValueChange={setQuery}
            placeholder="Search accounts"
          />
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.type(canvas.getByRole("combobox", { name: /Account/ }), "north");

    await expect(
      await page.findByRole("option", { name: "Northstar Systems" }),
    ).toBeVisible();
  },
};

export const MultipleOwners: Story = {
  render: function AsyncSelectMultipleStory() {
    const [query, setQuery] = useState("");
    const [value, setValue] = useState<string[]>(["mira"]);
    const items = ownerItems.filter((item) =>
      item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <AsyncSelect
              selectionMode="multiple"
              inputValue={query}
              items={items}
              label="Owners"
              name="owners"
              onInputValueChange={setQuery}
              onValueChange={(nextValue) => setValue(nextValue as string[])}
              selectedItems={ownerItems.filter((item) => value.includes(item.value))}
              value={value}
            />
            <FieldDescription>
              Server-owned result windows keep selected labels visible.
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
};

export const AsyncStates: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="md">
        <div className="grid gap-4 md:grid-cols-3">
          <AsyncSelect
            inputValue="ac"
            items={[]}
            label="Loading customer"
            loading
            loadingMessage="Finding customers..."
          />
          <AsyncSelect
            inputValue="missing"
            items={[]}
            label="Empty customer"
            emptyMessage="No customer found."
          />
          <AsyncSelect
            error="Customer lookup failed."
            inputValue="acme"
            items={[]}
            label="Errored customer"
            onRetry={() => undefined}
            retryLabel="Try again"
          />
        </div>
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Finding customers...")).toBeVisible();
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Customer lookup failed.",
    );
  },
};

export const MinQuery: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <AsyncSelect
          inputValue="a"
          items={accountItems}
          label="Server account"
          minQueryLength={3}
          minQueryMessage="Type three characters before searching."
        />
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="compact" dir="rtl" className="p-6">
      <Container size="sm">
        <AsyncSelect
          selectionMode="multiple"
          defaultValue={["ari", "sana"] as string[]}
          items={ownerItems}
          label="مالكو الحساب"
          name="accountOwners"
        />
      </Container>
    </DethinkProvider>
  ),
};
