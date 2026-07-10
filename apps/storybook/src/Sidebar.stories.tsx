import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState, type SVGProps } from "react";
import {
  DethinkProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupTrigger,
  SidebarHeader,
  SidebarInset,
  SidebarMobile,
  SidebarMobileTrigger,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarSkipLink,
  SidebarTrigger,
  Text,
  type SidebarVariant,
} from "@dethink/components";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "floating", "inset", "rail", "bordered"],
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

const navItems = [
  { href: "/overview", label: "Overview", icon: OverviewIcon, current: true },
  { href: "/pipelines", label: "Pipelines", icon: WorkflowIcon, badge: "8" },
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function OverviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <path d="M4 5h6v6H4z" />
      <path d="M14 5h6v6h-6z" />
      <path d="M4 15h6v4H4z" />
      <path d="M14 15h6v4h-6z" />
    </svg>
  );
}

function WorkflowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <path d="M6 7h12" />
      <path d="M6 12h12" />
      <path d="M6 17h8" />
      <path d="M3 7h.01" />
      <path d="M3 12h.01" />
      <path d="M3 17h.01" />
    </svg>
  );
}

function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15v-4" />
      <path d="M12 15V8" />
      <path d="M16 15v-6" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19 13.5v-3l-2.2-.5a7 7 0 0 0-.8-1.9l1.2-1.9-2.1-2.1-1.9 1.2a7 7 0 0 0-1.9-.8L10.9 2h-3l-.5 2.2a7 7 0 0 0-1.9.8L3.6 3.8 1.5 5.9l1.2 1.9a7 7 0 0 0-.8 1.9L0 10.2v3l2.2.5a7 7 0 0 0 .8 1.9l-1.2 1.9 2.1 2.1 1.9-1.2a7 7 0 0 0 1.9.8l.5 2.2h3l.5-2.2a7 7 0 0 0 1.9-.8l1.9 1.2 2.1-2.1-1.2-1.9a7 7 0 0 0 .8-1.9Z" />
    </svg>
  );
}

function SidebarExample({
  defaultCollapsed = false,
  variant = "default",
}: {
  defaultCollapsed?: boolean;
  variant?: SidebarVariant;
}) {
  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed} variant={variant}>
      <SidebarSkipLink targetId="storybook-sidebar-content" />
      <Sidebar aria-label="Workspace navigation">
        <SidebarHeader>
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-foreground truncate text-sm font-semibold">
                Dethink Ops
              </div>
              <div className="text-muted-foreground truncate text-xs">
                Production workspace
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuLink
                        badge={"badge" in item ? item.badge : undefined}
                        current={"current" in item ? item.current : undefined}
                        href={item.href}
                        icon={<Icon />}
                      >
                        {item.label}
                      </SidebarMenuLink>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton icon={<WorkflowIcon />}>
                    Refresh data
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover label="Refresh options">
                    <SettingsIcon className="size-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup collapsible defaultOpen>
            <SidebarGroupTrigger>Administration</SidebarGroupTrigger>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink href="/users" icon={<WorkflowIcon />}>
                    Users
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink href="/audit" icon={<ChartIcon />}>
                    Audit log
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink badge="2" href="/billing">
                    Billing
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-sm font-medium">
                Platform team
              </div>
              <div className="text-muted-foreground truncate text-xs">
                4 online
              </div>
            </div>
            <SidebarMenuAction aria-label="Open team settings">
              <SettingsIcon className="size-4" />
            </SidebarMenuAction>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset id="storybook-sidebar-content" className="p-6">
        <div className="border-border bg-muted/30 rounded-lg border p-5">
          <Text size="sm" tone="muted">
            SidebarInset gives app content a stable companion surface without
            turning the primitive into a full dashboard shell.
          </Text>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ControlledSidebarExample() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
      <Sidebar aria-label="Controlled navigation">
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuLink
                current
                href="/controlled"
                icon={<OverviewIcon />}
              >
                Controlled state
              </SidebarMenuLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuLink href="/controlled/audit" icon={<WorkflowIcon />}>
                Audit log
              </SidebarMenuLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-6">
        <button
          className="border-border text-foreground rounded-md border px-3 py-2 text-sm"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
        >
          Toggle externally
        </button>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SelectionIndicatorExample() {
  const [currentHref, setCurrentHref] = useState("/overview");

  return (
    <SidebarProvider>
      <Sidebar aria-label="Active route navigation">
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuLink
                    current={currentHref === item.href}
                    href={item.href}
                    icon={<Icon />}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentHref(item.href);
                    }}
                  >
                    {item.label}
                  </SidebarMenuLink>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-6">
        <Text size="sm" tone="muted">
          Selecting an item moves the animated selection indicator to the new
          current route.
        </Text>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const SelectionIndicator: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border h-[24rem] overflow-hidden rounded-lg border"
    >
      <SelectionIndicatorExample />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const analytics = canvas.getByRole("link", { name: "Analytics" });

    await userEvent.click(analytics);

    await expect(analytics).toHaveAttribute("aria-current", "page");
    await expect(
      analytics.querySelector('[data-slot="sidebar-menu-indicator"]'),
    ).not.toBeNull();
  },
};

export const Dashboard: Story = {
  render: ({ variant }) => (
    <DethinkProvider
      theme="light"
      className="border-border h-[30rem] overflow-hidden rounded-lg border"
    >
      <SidebarExample variant={variant} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Collapse sidebar" });

    await userEvent.click(trigger);

    await expect(
      canvas.getByRole("button", { name: "Expand sidebar" }),
    ).toBeVisible();
  },
};

export const CollapsedRail: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border h-[30rem] overflow-hidden rounded-lg border"
    >
      <SidebarExample defaultCollapsed />
    </DethinkProvider>
  ),
};

export const EdgeHandleStates: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-3">
      {(
        [
          { collapsed: false, label: "Left expanded", side: "left" },
          { collapsed: true, label: "Left collapsed", side: "left" },
          { collapsed: false, label: "Right expanded", side: "right" },
        ] as const
      ).map(({ collapsed, label, side }) => {
        const sidebar = (
          <Sidebar aria-label={`${label} navigation`} side={side}>
            <SidebarHeader>
              <div className="flex min-w-0 items-center gap-2">
                <span className="bg-primary/10 text-primary grid size-8 shrink-0 place-items-center rounded-md">
                  <OverviewIcon className="size-4" />
                </span>
                <span className="truncate text-sm font-semibold">
                  Dethink Ops
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    current
                    href={`/${side}/${String(collapsed)}`}
                    icon={<WorkflowIcon />}
                  >
                    Pipelines
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
        );
        const inset = (
          <SidebarInset className="bg-muted/20 p-4">
            <Text size="xs" tone="muted">
              {label}
            </Text>
          </SidebarInset>
        );

        return (
          <DethinkProvider
            key={label}
            theme="light"
            className="border-border h-56 overflow-hidden rounded-lg border"
          >
            <SidebarProvider
              defaultCollapsed={collapsed}
              motion="expressive"
              side={side}
            >
              {side === "right" ? inset : sidebar}
              {side === "right" ? sidebar : inset}
            </SidebarProvider>
          </DethinkProvider>
        );
      })}
    </div>
  ),
};

export const ControlledState: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border h-[24rem] overflow-hidden rounded-lg border"
    >
      <ControlledSidebarExample />
    </DethinkProvider>
  ),
};

export const MobileDrawer: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <SidebarProvider>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-foreground text-sm font-semibold">
              Mobile app shell
            </div>
            <div className="text-muted-foreground text-xs">
              Trigger opens a dismissible navigation drawer.
            </div>
          </div>
          <SidebarMobileTrigger />
        </div>
        <SidebarMobile label="Mobile workspace navigation">
          <SidebarHeader>
            <div className="text-foreground pe-10 text-sm font-semibold">
              Dethink Ops
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuLink
                      current={"current" in item ? item.current : undefined}
                      href={item.href}
                      icon={<Icon />}
                    >
                      {item.label}
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </SidebarMobile>
      </SidebarProvider>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Open sidebar" }));
    await expect(
      canvas.getByRole("dialog", { name: "Mobile workspace navigation" }),
    ).toBeVisible();
  },
};

export const MotionPresets: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      {(
        [
          { animate: true, label: "none", motion: "none", slug: "none" },
          { animate: true, label: "subtle", motion: "subtle", slug: "subtle" },
          {
            animate: true,
            label: "standard",
            motion: "standard",
            slug: "standard",
          },
          {
            animate: true,
            label: "expressive",
            motion: "expressive",
            slug: "expressive",
          },
          {
            animate: false,
            label: "animate false",
            motion: "expressive",
            slug: "animate-false",
          },
        ] as const
      ).map(({ animate, label, motion, slug }) => (
        <DethinkProvider
          key={label}
          theme="light"
          className="border-border h-64 overflow-hidden rounded-lg border"
        >
          <SidebarProvider
            animate={animate}
            defaultCollapsed={motion === "none" || !animate}
            motion={motion}
          >
            <Sidebar aria-label={`${label} motion navigation`}>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>{label}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuLink
                          current
                          href={`/${slug}`}
                          icon={<OverviewIcon />}
                        >
                          Motion preset
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarRail />
            </Sidebar>
            <SidebarInset className="p-5">
              <Text size="sm" tone="muted">
                The preset and animate flag coordinate the Motion edge handle
                with the Sidebar&apos;s CSS choreography.
              </Text>
            </SidebarInset>
          </SidebarProvider>
        </DethinkProvider>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      {(["default", "bordered", "floating", "inset"] as SidebarVariant[]).map(
        (variant) => (
          <DethinkProvider
            key={variant}
            theme="light"
            className="border-border h-64 overflow-hidden rounded-lg border"
          >
            <SidebarExample variant={variant} />
          </DethinkProvider>
        ),
      )}
    </div>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border h-[28rem] overflow-hidden rounded-lg border"
      >
        <SidebarExample />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border h-[28rem] overflow-hidden rounded-lg border"
      >
        <SidebarProvider side="right" variant="bordered">
          <Sidebar aria-label="RTL navigation">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuLink
                    current
                    href="/rtl/overview"
                    icon={<OverviewIcon />}
                  >
                    Overview
                  </SidebarMenuLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuLink href="/rtl/settings" icon={<SettingsIcon />}>
                    Settings
                  </SidebarMenuLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="p-6">
            <Text size="sm" tone="muted">
              Right side placement keeps public side behavior explicit in RTL.
            </Text>
          </SidebarInset>
        </SidebarProvider>
      </DethinkProvider>
    </div>
  ),
};
