import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { BarList } from "@dethink/components";

const pages = [
  { label: "/", value: 12_940, href: "#home" },
  { label: "/pricing", value: 5_320, href: "#pricing" },
  { label: "/docs/getting-started", value: 4_870, href: "#docs" },
  {
    label: "/blog/launching-dethink-charts-without-a-chart-library",
    value: 2_310,
  },
  { label: "/changelog", value: 1_420 },
  { label: "/careers", value: 640 },
];

const meta = {
  title: "Components/BarList",
  component: BarList,
  args: {
    data: pages,
    "aria-label": "Top pages",
    labelHeader: "Page",
    valueHeader: "Visitors",
    sort: "descending",
    size: "md",
    color: "chart-1",
  },
  argTypes: {
    sort: {
      control: "inline-radio",
      options: ["descending", "ascending", "none"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(100vw-2rem,32rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ShowMore: Story = {
  args: { limit: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    const toggle = canvas.getByRole("button", { name: "Show 3 more" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(6);
  },
};

export const Compact: Story = { args: { size: "sm", color: "chart-3" } };

export const Empty: Story = { args: { data: [], emptyLabel: "No visits yet" } };

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <BarList {...args} />
    </div>
  ),
};

export const NoMotion: Story = { args: { animate: false } };
