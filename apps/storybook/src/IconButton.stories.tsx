import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DethinkProvider,
  IconButton,
  type IconButtonShape,
  type IconButtonSize,
  type IconButtonVariant,
} from "@dethink/components";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  args: {
    "aria-label": "Refresh metrics",
    variant: "ghost",
    size: "md",
    shape: "square",
    children: <RefreshIcon />,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["solid", "soft", "outline", "ghost", "destructive"],
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: {
      control: "inline-radio",
      options: ["square", "circle"],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants: IconButtonVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "destructive",
];
const sizes: IconButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const shapes: IconButtonShape[] = ["square", "circle"];

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M13 4.5V1.75h-2.75M3 11.5v2.75h2.75M12.15 6A4.5 4.5 0 0 0 4.2 3.7L3 5M3.85 10A4.5 4.5 0 0 0 11.8 12.3L13 11"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="m11.25 11.25 2.25 2.25M7.25 12a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5Z"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M2.5 4h11M4.5 8h7M6.5 12h3"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M8 10.25A2.25 2.25 0 1 0 8 5.75a2.25 2.25 0 0 0 0 4.5Z"
        strokeWidth="1.5"
      />
      <path
        d="M8 1.75v1.3M8 12.95v1.3M3.58 3.58l.92.92M11.5 11.5l.92.92M1.75 8h1.3M12.95 8h1.3M3.58 12.42l.92-.92M11.5 4.5l.92-.92"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M2.5 4.5h11M6.5 2.5h3M6 7v4M10 7v4M4 4.5l.5 9h7l.5-9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BoldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M5 3h3.4a2.1 2.1 0 0 1 0 4.2H5V3ZM5 7.2h4a2.4 2.4 0 0 1 0 4.8H5V7.2Z"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M7 3h5M4 13h5M9.5 3 6.5 13"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export const Base: Story = {};

export const Variants: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {variants.map((variant) => (
          <IconButton
            key={variant}
            aria-label={`${variant} action`}
            variant={variant}
          >
            {variant === "destructive" ? <TrashIcon /> : <RefreshIcon />}
          </IconButton>
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
          <IconButton
            key={size}
            aria-label={`${size} action`}
            size={size}
            variant="outline"
          >
            <SearchIcon />
          </IconButton>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const Shapes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {shapes.map((shape) => (
          <IconButton
            key={shape}
            aria-label={`${shape} action`}
            shape={shape}
            variant="soft"
          >
            <SettingsIcon />
          </IconButton>
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
        <IconButton aria-label="Refresh metrics" variant="ghost">
          <RefreshIcon />
        </IconButton>
        <IconButton
          aria-label="Focused refresh"
          className="ring-ring ring-offset-background ring-2 ring-offset-2"
          variant="outline"
        >
          <RefreshIcon />
        </IconButton>
        <IconButton aria-label="Disabled refresh" disabled variant="outline">
          <RefreshIcon />
        </IconButton>
        <IconButton aria-label="Loading refresh" loading variant="outline">
          <RefreshIcon />
        </IconButton>
        <IconButton aria-label="Delete row" variant="destructive">
          <TrashIcon />
        </IconButton>
      </div>
    </DethinkProvider>
  ),
};

export const ToggleToolbar: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div
        aria-label="Text formatting"
        className="border-border bg-background inline-flex items-center gap-1 rounded-md border p-1"
        role="toolbar"
      >
        <IconButton
          aria-label="Bold"
          aria-pressed="true"
          size="sm"
          variant="soft"
        >
          <BoldIcon />
        </IconButton>
        <IconButton
          aria-label="Italic"
          aria-pressed="false"
          size="sm"
          variant="ghost"
        >
          <ItalicIcon />
        </IconButton>
        <IconButton
          aria-label="Open formatting settings"
          size="sm"
          variant="ghost"
        >
          <SettingsIcon />
        </IconButton>
      </div>
    </DethinkProvider>
  ),
};

export const DashboardToolbar: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="border-border bg-muted/30 flex items-center justify-between gap-4 rounded-md border p-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-sm font-semibold">
            Revenue report
          </h2>
          <p className="text-muted-foreground text-sm">Updated 2 minutes ago</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton aria-label="Search report" variant="ghost">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Filter report" variant="ghost">
            <FilterIcon />
          </IconButton>
          <IconButton aria-label="Refresh report" variant="outline">
            <RefreshIcon />
          </IconButton>
          <IconButton
            aria-label="Report settings"
            shape="circle"
            variant="soft"
          >
            <SettingsIcon />
          </IconButton>
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
            <IconButton
              key={variant}
              aria-label={`Dark ${variant}`}
              variant={variant}
            >
              {variant === "destructive" ? <TrashIcon /> : <RefreshIcon />}
            </IconButton>
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
          <IconButton aria-label="Search" variant="ghost">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Filter" variant="outline">
            <FilterIcon />
          </IconButton>
          <IconButton aria-label="Refresh" shape="circle" variant="soft">
            <RefreshIcon />
          </IconButton>
        </div>
      </DethinkProvider>
    </div>
  ),
};
