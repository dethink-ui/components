import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DethinkProvider,
  Inspector,
  InspectorNumber,
  InspectorProperty,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorText,
  type InspectorValue,
} from "@dethink/components";
import { useState, type ComponentProps } from "react";
import { expect, userEvent, within } from "storybook/test";

const shape = {
  name: "Hero card",
  layout: { x: 24, y: 48, width: 320, height: 180, rotation: 0 },
  appearance: { radius: 12, opacity: 100, blend: "normal" },
  visible: true,
};

function ShapeInspector(props: Partial<ComponentProps<typeof Inspector>>) {
  const [value, setValue] = useState<InspectorValue | null>(shape);

  return (
    <Inspector
      aria-label="Shape properties"
      role="region"
      className="border-border bg-background w-72 rounded-lg border"
      value={value}
      onValueChange={(next) => setValue(next)}
      {...props}
    >
      <InspectorSection title="Layer">
        <InspectorProperty path="name" label="Name">
          <InspectorText />
        </InspectorProperty>
        <InspectorProperty path="visible" label="Visible">
          <InspectorSwitch />
        </InspectorProperty>
      </InspectorSection>
      <InspectorSection title="Layout">
        <InspectorProperty path="layout.width" label="Width">
          <InspectorNumber min={1} unit="px" />
        </InspectorProperty>
        <InspectorProperty path="layout.height" label="Height">
          <InspectorNumber min={1} unit="px" />
        </InspectorProperty>
        <InspectorProperty path="layout.rotation" label="Rotation">
          <InspectorNumber min={-360} max={360} unit="deg" />
        </InspectorProperty>
      </InspectorSection>
      <InspectorSection title="Appearance">
        <InspectorProperty path="appearance.radius" label="Radius">
          <InspectorNumber min={0} unit="px" />
        </InspectorProperty>
        <InspectorProperty path="appearance.opacity" label="Opacity">
          <InspectorNumber min={0} max={100} unit="%" />
        </InspectorProperty>
        <InspectorProperty path="appearance.blend" label="Blend">
          <InspectorSelect
            options={[
              { value: "normal", label: "Normal" },
              { value: "multiply", label: "Multiply" },
              { value: "screen", label: "Screen" },
            ]}
          />
        </InspectorProperty>
      </InspectorSection>
    </Inspector>
  );
}

const meta = {
  title: "Components/Inspector",
  component: ShapeInspector,
  decorators: [
    (Story) => (
      <DethinkProvider className="p-6">
        <Story />
      </DethinkProvider>
    ),
  ],
} satisfies Meta<typeof ShapeInspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const width = canvas.getByRole("spinbutton", { name: "Width" });
    await userEvent.clear(width);
    await userEvent.type(width, "400{Enter}");
    await expect(width).toHaveValue("400");
    await userEvent.keyboard("{ArrowUp}");
    await expect(width).toHaveValue("401");
  },
};

export const InvalidEntry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const height = canvas.getByRole("spinbutton", { name: "Height" });
    await userEvent.clear(height);
    await userEvent.type(height, "tall{Enter}");
    await expect(height).toHaveAccessibleDescription("Enter a number.");
  },
};

export const CollapsedSection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Layout" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Empty: Story = { args: { value: null } };

export const Narrow: Story = {
  args: { className: "w-56 rounded-lg border border-border bg-background" },
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <DethinkProvider theme="dark" className="bg-background p-5">
        <Story />
      </DethinkProvider>
    ),
  ],
};

export const CompactRtl: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl" data-density="compact">
        <Story />
      </div>
    ),
  ],
};
