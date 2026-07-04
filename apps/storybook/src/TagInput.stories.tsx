import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Container,
  DethinkProvider,
  FieldDescription,
  Form,
  Stack,
  TagInput,
} from "@dethink/components";

const meta = {
  title: "Components/TagInput",
  component: TagInput,
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    invalid: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TagInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <TagInput
          {...args}
          description="Press Enter, comma, or Tab to add a tag."
          label="Labels"
          name="labels"
          placeholder="Add label"
        />
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Labels/ });

    await userEvent.type(input, "priority{enter}");

    await expect(canvas.getByText("priority")).toBeVisible();
    await expect(input).toHaveValue("");
  },
};

export const ControlledAndPaste: Story = {
  render: function ControlledTagInputStory() {
    const [tags, setTags] = useState(["finance"]);

    return (
      <DethinkProvider theme="light" className="p-6">
        <Container size="sm">
          <Stack gap="3">
            <TagInput
              label="Notification tags"
              name="notificationTags"
              onValueChange={setTags}
              value={tags}
            />
            <FieldDescription>
              Serialized tags: {tags.join(", ") || "none"}
            </FieldDescription>
          </Stack>
        </Container>
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Notification tags/ });

    await userEvent.click(input);
    await userEvent.paste("ops, renewal");

    await expect(canvas.getByText("Serialized tags: finance, ops, renewal")).toBeVisible();
  },
};

export const FormSerialization: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Form action="/labels" method="post">
          <TagInput
            defaultValue={["finance", "priority"]}
            description="Repeated hidden inputs use the same field name."
            label="Case labels"
            name="caseLabels"
          />
        </Form>
      </Container>
    </DethinkProvider>
  ),
};

export const Validation: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <TagInput
          defaultValue={["#finance"]}
          description="Tags must start with # and stay short."
          label="Campaign tags"
          maxTagLength={16}
          name="campaignTags"
          validateTag={(value) =>
            value.startsWith("#") ? null : "Tags must start with #."
          }
        />
      </Container>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole("textbox", { name: /Campaign tags/ }),
      "plain{enter}",
    );

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Tags must start with #.",
    );
  },
};

export const States: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Container size="sm">
        <Stack gap="4">
          <TagInput
            errorMessage="Add at least one recipient tag."
            invalid
            label="Recipient tags"
            required
          />
          <TagInput
            readOnly
            defaultValue={["finance", "renewal"]}
            label="Inherited labels"
          />
          <TagInput
            disabled
            defaultValue={["locked"]}
            label="Locked labels"
          />
        </Stack>
      </Container>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRTL: Story = {
  render: () => (
    <DethinkProvider theme="dark" density="comfortable" dir="rtl" className="p-6">
      <Container size="sm">
        <TagInput
          controlSize="lg"
          defaultValue={["finance", "renewal", "priority"]}
          label="وسوم الحساب"
          name="accountTags"
        />
      </Container>
    </DethinkProvider>
  ),
};

export const ResponsiveChips: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <div className="max-w-64">
        <TagInput
          defaultValue={[
            "finance",
            "renewal",
            "executive-review",
            "customer-success",
          ]}
          label="Wrapped labels"
          name="wrappedLabels"
        />
      </div>
    </DethinkProvider>
  ),
};
