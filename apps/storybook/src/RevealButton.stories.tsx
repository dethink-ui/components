import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Archive,
  Bell,
  Bookmark,
  Copy,
  Download,
  Pencil,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import {
  DethinkProvider,
  RevealButton,
  type RevealButtonMotion,
  type RevealButtonSize,
  type RevealButtonVariant,
} from "@dethink/components";

const meta = {
  title: "Components/RevealButton",
  component: RevealButton,
  args: {
    icon: <Search />,
    label: "Search",
    labelVisibility: "hover",
    motion: "standard",
    size: "md",
    variant: "ghost",
  },
  argTypes: {
    labelVisibility: {
      control: "inline-radio",
      options: ["hover", "always"],
    },
    motion: {
      control: "inline-radio",
      options: ["none", "subtle", "standard"],
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    variant: {
      control: "inline-radio",
      options: ["solid", "soft", "outline", "ghost", "destructive"],
    },
  },
} satisfies Meta<typeof RevealButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants: RevealButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: RevealButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const motions: RevealButtonMotion[] = ["none", "subtle", "standard"];

export const Base: Story = {};

export const Variants: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {variants.map((variant) => (
          <RevealButton
            key={variant}
            icon={variant === "destructive" ? <Trash2 /> : <Search />}
            label={`${variant} action`}
            variant={variant}
          />
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {sizes.map((size) => (
          <RevealButton
            key={size}
            icon={<Search />}
            label={`${size.toUpperCase()} search`}
            size={size}
            variant="outline"
          />
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const States: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        <RevealButton icon={<Search />} label="Hover or focus" />
        <RevealButton
          className="ring-ring ring-offset-background ring-2 ring-offset-2"
          icon={<Settings />}
          label="Focused"
          variant="outline"
        />
        <RevealButton
          icon={<Bookmark />}
          label="Always visible"
          labelVisibility="always"
          variant="soft"
        />
        <RevealButton
          disabled
          icon={<RefreshCw />}
          label="Disabled"
          variant="outline"
        />
        <RevealButton
          icon={<RefreshCw />}
          label="Loading"
          loading
          variant="outline"
        />
        <RevealButton icon={<Bell />} label="No motion" motion="none" />
      </div>
    </DethinkProvider>
  ),
};

export const MotionPresets: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {motions.map((motion) => (
          <RevealButton
            key={motion}
            icon={<Bell />}
            label={`${motion} motion`}
            motion={motion}
            variant="outline"
          />
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const DocumentToolbar: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="border-border bg-muted/30 flex items-center justify-between gap-4 rounded-md border p-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-sm font-semibold">
            Customer insight report
          </h2>
          <p className="text-muted-foreground text-sm">
            Draft updated just now
          </p>
        </div>
        <div
          aria-label="Report actions"
          className="flex shrink-0 items-center gap-1"
          role="toolbar"
        >
          <RevealButton icon={<Pencil />} label="Edit" variant="ghost" />
          <RevealButton icon={<Copy />} label="Duplicate" variant="ghost" />
          <RevealButton icon={<Share2 />} label="Share" variant="ghost" />
          <RevealButton icon={<Download />} label="Export" variant="outline" />
          <RevealButton
            icon={<Archive />}
            label="Archive"
            variant="destructive"
          />
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-6"
      >
        <div className="gap-density-gap flex flex-wrap items-center">
          {variants.map((variant) => (
            <RevealButton
              key={variant}
              icon={variant === "destructive" ? <Trash2 /> : <Search />}
              label={`Dark ${variant}`}
              variant={variant}
            />
          ))}
        </div>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <div className="gap-density-gap flex flex-wrap items-center">
          <RevealButton icon={<Search />} label="Search" variant="ghost" />
          <RevealButton icon={<Bell />} label="Notify" variant="outline" />
          <RevealButton icon={<Settings />} label="Settings" variant="soft" />
        </div>
      </DethinkProvider>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <RevealButton icon={<Search />} label="Search docs" />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Search docs" });

    await expect(button).toHaveAttribute("data-state", "collapsed");

    await userEvent.hover(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "revealed"),
    );

    await userEvent.unhover(button);
    await waitFor(() =>
      expect(button).toHaveAttribute("data-state", "collapsed"),
    );

    button.focus();
    await expect(button).toHaveAttribute("data-state", "revealed");
  },
};
