import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DethinkProvider,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  type NavigationMenuSize,
  type NavigationMenuVariant,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const meta = {
  title: "Components/NavigationMenu",
  component: NavigationMenu,
  args: {
    variant: "default",
    size: "md",
    orientation: "horizontal",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "quiet", "underline"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants: NavigationMenuVariant[] = ["default", "quiet", "underline"];
const sizes: NavigationMenuSize[] = ["sm", "md", "lg"];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterLink.displayName = "RouterLink";

function ProductNavItems() {
  return (
    <NavigationMenuList>
      <NavigationMenuItem value="overview">
        <NavigationMenuLink current href="/overview">
          Overview
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="projects">
        <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="reports">
        <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="settings">
        <NavigationMenuLink href="/settings">Settings</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  );
}

export const Base: Story = {
  render: (args) => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-6">
      <NavigationMenu {...args} aria-label="Product">
        <ProductNavItems />
      </NavigationMenu>
    </DethinkProvider>
  ),
};

export const DashboardTopNavigation: Story = {
  render: () => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-4">
      <header className="flex items-center justify-between gap-6 rounded-md border border-border bg-muted/30 px-4 py-2">
        <span className="text-sm font-semibold text-foreground">Acme Cloud</span>
        <NavigationMenu aria-label="Dashboard" variant="quiet">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/dashboard">
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/deployments">
                Deployments
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/monitoring">Monitoring</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/team">Team</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <span className="text-sm text-muted-foreground">workspace: prod</span>
      </header>
    </DethinkProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-6">
      <div className="space-y-6">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {variant}
            </p>
            <NavigationMenu aria-label={`${variant} navigation`} variant={variant}>
              <ProductNavItems />
            </NavigationMenu>
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-6">
      <div className="space-y-6">
        {sizes.map((size) => (
          <div key={size} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {size}
            </p>
            <NavigationMenu aria-label={`${size} navigation`} size={size}>
              <ProductNavItems />
            </NavigationMenu>
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const CurrentDisabledAndExternal: Story = {
  render: () => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-6">
      <NavigationMenu aria-label="Workspace">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink current href="/overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink current="location" href="/docs/components">
              Components
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink disabled href="/billing">
              Billing
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink external href="https://status.example.com">
              Status ↗
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </DethinkProvider>
  ),
};

export const VerticalOrientation: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="max-w-xs rounded-lg border border-border p-6"
    >
      <NavigationMenu aria-label="Settings sections" orientation="vertical" variant="quiet">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink current href="/settings/general">
              General
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/settings/members">Members</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/settings/integrations">
              Integrations
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </DethinkProvider>
  ),
};

export const RouterComposition: Story = {
  render: () => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-6">
      <NavigationMenu aria-label="Router navigation">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild current>
              <RouterLink to="/dashboard">Router dashboard</RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <RouterLink to="/docs/router">Router docs</RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="rounded-lg border border-border p-6"
      >
        <NavigationMenu aria-label="Dark navigation" variant="underline">
          <ProductNavItems />
        </NavigationMenu>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="rounded-lg border border-border p-6"
      >
        <NavigationMenu aria-label="RTL navigation">
          <ProductNavItems />
        </NavigationMenu>
      </DethinkProvider>
    </div>
  ),
};
