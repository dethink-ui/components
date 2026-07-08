import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Activity,
  Bell,
  BookOpen,
  Command,
  Database,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  PanelTop,
  RadioTower,
  Search,
  Settings,
  SlidersHorizontal,
  SquareTerminal,
  Workflow,
} from "lucide-react";
import { forwardRef, useState, type AnchorHTMLAttributes } from "react";
import {
  DethinkProvider,
  CollapseDock,
  NavDock,
  NavDockItem,
  NavDockLink,
  NavDockList,
  NavDockSeparator,
  NavDockSubmenu,
  NavDockSubmenuContent,
  NavDockSubmenuTrigger,
  type NavDockItemData,
  type NavDockMotion,
  type NavDockPlacement,
  type NavDockShowTitle,
  type NavDockSize,
  type NavDockVariant,
} from "@dethink/components";

const meta = {
  title: "Components/NavDock",
  component: NavDock,
  args: {
    motion: "standard",
    placement: "bottom",
    position: "static",
    showTitle: "hover",
    size: "md",
    variant: "default",
  },
  argTypes: {
    motion: {
      control: "inline-radio",
      options: ["none", "subtle", "standard", "expressive"],
    },
    collapseMode: {
      control: "inline-radio",
      options: ["none", "auto", "always"],
    },
    placement: {
      control: "inline-radio",
      options: ["bottom", "top", "left", "right"],
    },
    position: {
      control: "inline-radio",
      options: ["static", "absolute", "fixed"],
    },
    showTitle: {
      control: "inline-radio",
      options: ["never", "hover", "always"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "inline-radio",
      options: ["default", "glass", "solid"],
    },
  },
} satisfies Meta<typeof NavDock>;

export default meta;

type Story = StoryObj<typeof meta>;

const placements: NavDockPlacement[] = ["bottom", "top", "left", "right"];
const variants: NavDockVariant[] = ["default", "glass", "solid"];
const sizes: NavDockSize[] = ["sm", "md", "lg"];
const showTitleModes: NavDockShowTitle[] = ["never", "hover", "always"];
const motionPresets: NavDockMotion[] = [
  "none",
  "subtle",
  "standard",
  "expressive",
];
const overflowLabels = [
  "Overview",
  "Docs",
  "Search",
  "Alerts",
  "Command",
  "Flows",
  "Controls",
  "Console",
  "Activity",
  "Data",
  "Settings",
  "Status",
];

const navDockIconProps = {
  absoluteStrokeWidth: true,
  strokeWidth: 2.15,
};

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterLink.displayName = "RouterLink";

function getItems(onAction: () => void = () => undefined): NavDockItemData[] {
  return [
    {
      href: "/overview",
      icon: <LayoutDashboard {...navDockIconProps} />,
      title: "Overview",
      value: "overview",
    },
    {
      badge: "3",
      icon: <Activity {...navDockIconProps} />,
      onAction,
      title: "Activity",
      value: "activity",
    },
    {
      disabled: true,
      disabledReason: "Reports are available after setup.",
      href: "/reports",
      icon: <FileText {...navDockIconProps} />,
      title: "Reports",
      value: "reports",
    },
    {
      href: "/settings",
      icon: <Settings {...navDockIconProps} />,
      title: "Settings",
      value: "settings",
    },
    {
      external: true,
      href: "https://status.example.com",
      icon: <RadioTower {...navDockIconProps} />,
      title: "Status",
      value: "status",
    },
  ];
}

function getSubmenuItems(
  onAction: () => void = () => undefined,
): NavDockItemData[] {
  return [
    {
      href: "/overview",
      icon: <LayoutDashboard {...navDockIconProps} />,
      title: "Overview",
      value: "overview",
    },
    {
      icon: <BookOpen {...navDockIconProps} />,
      submenu: [
        {
          kind: "label",
          title: "Docs",
          value: "docs-label",
        },
        {
          description: "Component anatomy and props",
          href: "/docs/components",
          title: "Components",
          value: "components",
        },
        {
          badge: "new",
          description: "Registry setup notes",
          href: "/docs/registry",
          title: "Registry",
          value: "registry",
        },
        {
          kind: "separator",
          value: "docs-separator",
        },
        {
          description: "Refresh local docs view",
          kind: "action",
          onAction,
          title: "Refresh docs",
          value: "refresh-docs",
        },
      ],
      title: "Docs",
      value: "docs",
    },
    {
      href: "/data",
      icon: <Database {...navDockIconProps} />,
      title: "Data",
      value: "data",
    },
    {
      href: "/support",
      icon: <LifeBuoy {...navDockIconProps} />,
      title: "Support",
      value: "support",
    },
  ];
}

function getOverflowItems(): NavDockItemData[] {
  const icons = [
    LayoutDashboard,
    Search,
    Bell,
    Command,
    Workflow,
    SlidersHorizontal,
    SquareTerminal,
    Activity,
    BookOpen,
    Database,
    Settings,
    RadioTower,
  ];

  return overflowLabels.map((label, index) => {
    const IconComponent = icons[index % icons.length];
    const value = label.toLowerCase();

    if (label === "Docs") {
      return {
        icon: <IconComponent {...navDockIconProps} />,
        submenu: [
          {
            description: "Component anatomy and props",
            href: "/docs/components",
            title: "Components",
            value: "components",
          },
          {
            description: "Registry setup notes",
            href: "/docs/registry",
            title: "Registry",
            value: "registry",
          },
        ],
        title: label,
        value,
      };
    }

    return {
      href: `/${value}`,
      icon: <IconComponent {...navDockIconProps} />,
      title: label,
      value,
    };
  });
}

export const Base: Story = {
  args: {
    size: "sm",
    collapseMode: "auto",
    placement: "bottom",
  },

  render: (args) => (
    <DethinkProvider
      theme="light"
      className="bg-background flex min-h-screen items-start justify-center px-12 py-24"
    >
      <NavDock {...args} aria-label="Workspace dock" currentValue="dashboard">
        <NavDockList>
          <NavDockItem
            icon={<PanelTop {...navDockIconProps} />}
            title="Dashboard"
            value="dashboard"
          >
            <NavDockLink href="/dashboard" />
          </NavDockItem>
          <NavDockItem
            icon={<Search {...navDockIconProps} />}
            title="Search"
            value="search"
          >
            <NavDockLink href="/search" />
          </NavDockItem>
          <NavDockItem
            icon={<Bell {...navDockIconProps} />}
            title="Alerts"
            value="alerts"
          >
            <NavDockLink href="/alerts" />
          </NavDockItem>
          <NavDockItem
            icon={<Command {...navDockIconProps} />}
            title="Command"
            value="command"
          >
            <NavDockLink href="/command" />
          </NavDockItem>
          <NavDockItem
            icon={<Workflow {...navDockIconProps} />}
            title="Flows"
            value="flows"
          >
            <NavDockLink href="/flows" />
          </NavDockItem>
          <NavDockSeparator />
          <NavDockItem
            icon={<SlidersHorizontal {...navDockIconProps} />}
            title="Controls"
            value="controls"
          >
            <NavDockLink href="/controls" />
          </NavDockItem>
          <NavDockItem
            icon={<SquareTerminal {...navDockIconProps} />}
            title="Console"
            value="console"
          >
            <NavDockLink href="/console" />
          </NavDockItem>
        </NavDockList>
      </NavDock>
    </DethinkProvider>
  ),
};

export const InPageNavigation: Story = {
  render: () => {
    const [currentPanel, setCurrentPanel] = useState("overview");

    return (
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-8"
      >
        <NavDock
          aria-label="Panel dock"
          currentValue={currentPanel}
          items={getItems(() => setCurrentPanel("activity"))}
          showTitle="always"
        />
      </DethinkProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Activity" }));
    await expect(
      canvas.getByRole("button", { name: "Activity" }),
    ).toBeVisible();
  },
};

export const SubmenuDisclosures: Story = {
  args: {
    placement: "top",
    showTitle: "always",
    size: "sm",
    variant: "glass",
  },

  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="min-h-48">
          <NavDock
            {...args}
            aria-label="Docs dock"
            defaultOpenValue="docs"
            items={getSubmenuItems()}
          />
        </div>
        <div className="min-h-48">
          <NavDock {...args} aria-label="Compound submenu dock">
            <NavDockList>
              <NavDockItem
                icon={<Settings {...navDockIconProps} />}
                title="Admin"
                value="admin"
              >
                <NavDockSubmenu>
                  <NavDockSubmenuTrigger />
                  <NavDockSubmenuContent>
                    <a
                      className="text-foreground hover:bg-muted focus-visible:ring-ring rounded-sm px-3 py-2 text-sm no-underline outline-none focus-visible:ring-2"
                      href="/admin/users"
                    >
                      Users
                    </a>
                    <button
                      className="text-foreground hover:bg-muted focus-visible:ring-ring rounded-sm px-3 py-2 text-start text-sm outline-none focus-visible:ring-2"
                      type="button"
                    >
                      Rebuild index
                    </button>
                  </NavDockSubmenuContent>
                </NavDockSubmenu>
              </NavDockItem>
              <NavDockItem
                icon={<LifeBuoy {...navDockIconProps} />}
                title="Support"
                value="support"
              >
                <NavDockLink href="/support" />
              </NavDockItem>
            </NavDockList>
          </NavDock>
        </div>
      </div>
    </DethinkProvider>
  ),

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", { name: /Components/ }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Admin" }));
    await expect(canvas.getByRole("link", { name: "Users" })).toBeVisible();
  },
};

export const CompoundRouterComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <NavDock aria-label="Router dock" currentValue="docs" showTitle="always">
        <NavDockList>
          <NavDockItem
            icon={<LayoutDashboard {...navDockIconProps} />}
            title="Docs"
            value="docs"
          >
            <NavDockLink asChild>
              <RouterLink to="/docs">Docs</RouterLink>
            </NavDockLink>
          </NavDockItem>
          <NavDockItem
            icon={<Settings {...navDockIconProps} />}
            title="Settings"
            value="settings"
          >
            <NavDockLink href="/settings" />
          </NavDockItem>
        </NavDockList>
      </NavDock>
    </DethinkProvider>
  ),
};

export const Placements: Story = {
  args: {
    showTitle: "never",
    placement: "right",
  },

  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {placements.map((placement) => (
          <div
            key={placement}
            className="border-border min-h-40 rounded-md border p-4"
          >
            <NavDock
              aria-label={`${placement} dock`}
              currentValue="overview"
              items={getItems()}
              placement={placement}
              showTitle="always"
            />
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const OverflowAndPositioning: Story = {
  args: {
    placement: "bottom",
    position: "fixed",
    showTitle: "always",
    size: "sm",
    variant: "glass",
  },

  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border bg-background min-h-[72vh] rounded-lg border p-8"
    >
      <div className="grid gap-8">
        <div className="border-border w-80 rounded-md border p-4">
          <NavDock
            aria-label="Overflow dock"
            currentValue="overview"
            items={getOverflowItems()}
            placement={args.placement}
            showTitle="always"
            size={args.size}
            variant={args.variant}
          />
        </div>
        <div className="border-border relative min-h-64 rounded-md border border-dashed p-4">
          <NavDock
            {...args}
            aria-label="Fixed placement dock"
            currentValue="overview"
            items={getItems()}
          />
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const ResponsiveCollapsedMode: Story = {
  args: {
    collapseMode: "always",
    placement: "left",
    showTitle: "always",
    size: "sm",
    variant: "glass",
  },

  render: ({ collapseMode, ...args }) => {
    const [currentPanel, setCurrentPanel] = useState("overview");

    return (
      <DethinkProvider
        theme="light"
        className="border-border bg-background grid min-h-[30rem] content-start gap-6 rounded-lg border p-8"
      >
        <div className="flex min-h-80 items-end">
          <NavDock
            {...args}
            aria-label="Mobile workspace dock"
            currentValue={currentPanel}
          >
            <CollapseDock
              collapseLabel="Close dock"
              collapseMode={collapseMode}
              items={getItems(() => setCurrentPanel("activity"))}
              triggerIcon={<Menu {...navDockIconProps} />}
              triggerLabel="Open dock"
            />
          </NavDock>
        </div>
        <div className="border-border bg-muted/40 text-muted-foreground max-w-sm rounded-md border p-4 text-sm">
          <strong className="text-foreground block">Current panel</strong>
          {currentPanel}
        </div>
      </DethinkProvider>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Open dock" }));
    await expect(
      canvas.getByRole("button", { name: "Close dock" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Activity" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close dock" }));
    await waitFor(() =>
      expect(
        canvas.queryByRole("button", { name: "Activity" }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Open dock" }));
    await userEvent.click(canvas.getByRole("button", { name: "Activity" }));
    await expect(canvas.getByText("activity")).toBeVisible();
    canvas.getByRole("button", { name: "Activity" }).focus();
    await userEvent.keyboard("{Escape}");
    await expect(
      canvas.getByRole("button", { name: "Open dock" }),
    ).toBeVisible();
  },
};

export const VariantsSizesAndTitles: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-4">
          {variants.map((variant) => (
            <NavDock
              key={variant}
              aria-label={`${variant} dock`}
              currentValue="overview"
              items={getItems()}
              showTitle="always"
              variant={variant}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {sizes.map((size) => (
            <NavDock
              key={size}
              aria-label={`${size} dock`}
              currentValue="overview"
              items={getItems()}
              showTitle="always"
              size={size}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {showTitleModes.map((showTitle) => (
            <NavDock
              key={showTitle}
              aria-label={`${showTitle} dock`}
              currentValue="overview"
              items={getItems()}
              showTitle={showTitle}
            />
          ))}
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const MotionPresetsAndHoverTitles: Story = {
  args: {
    size: "sm",
  },

  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-8"
    >
      <div className="flex flex-wrap items-center gap-6">
        {motionPresets.map((motion) => (
          <NavDock
            key={motion}
            aria-label={`${motion} motion dock`}
            defaultValue="overview"
            items={getItems()}
            motion={motion}
            showTitle="hover"
            variant={motion === "expressive" ? "glass" : "default"}
          />
        ))}
      </div>
    </DethinkProvider>
  ),

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getAllByRole("link", { name: "Overview" })[1]);
    await expect(
      canvasElement.querySelector('[data-slot="navdock-hover-title"]'),
    ).toHaveTextContent("Overview");
  },
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-8"
      >
        <NavDock
          aria-label="Dark compact dock"
          currentValue="overview"
          items={getItems()}
          showTitle="always"
          variant="glass"
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-8"
      >
        <NavDock
          aria-label="RTL comfortable dock"
          currentValue="settings"
          items={getItems()}
          showTitle="always"
          variant="solid"
        />
      </DethinkProvider>
    </div>
  ),
};

export const CustomCurrentMatchingAndLongLabels: Story = {
  render: () => {
    const items: NavDockItemData[] = [
      {
        href: "/workspace/insights",
        icon: <Activity {...navDockIconProps} />,
        title: "Daily retention insights",
        value: "insights",
      },
      {
        href: "/workspace/automation",
        icon: <Workflow {...navDockIconProps} />,
        title: "Automation workflows",
        value: "automation",
      },
      {
        disabled: true,
        disabledReason: "Data exports require owner access.",
        href: "/workspace/data-exports",
        icon: <Database {...navDockIconProps} />,
        title: "Long-running data exports",
        value: "exports",
      },
      {
        external: true,
        href: "https://status.example.com",
        icon: <RadioTower {...navDockIconProps} />,
        title: "External platform status",
        value: "status",
      },
    ];

    return (
      <DethinkProvider
        theme="light"
        className="border-border rounded-lg border p-8"
      >
        <NavDock
          aria-label="Workspace pathname dock"
          currentValue="/workspace/insights/daily-retention"
          isItemCurrent={(item, { currentValue }) => {
            if (!("href" in item) || !currentValue) {
              return undefined;
            }

            return currentValue === item.href ||
              currentValue.startsWith(`${item.href}/`)
              ? "location"
              : undefined;
          }}
          items={items}
          motion="none"
          showTitle="always"
          variant="glass"
        />
      </DethinkProvider>
    );
  },
};
