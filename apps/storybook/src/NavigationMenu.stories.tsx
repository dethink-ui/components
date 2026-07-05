import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  DethinkProvider,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDescription,
  NavigationMenuFeaturedItem,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLabel,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSection,
  NavigationMenuSeparator,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  type NavigationMenuMotionPreset,
  type NavigationMenuSize,
  type NavigationMenuVariant,
} from "@dethink/components";
import { defineDethinkTheme } from "@dethink/components";
import { forwardRef, useState, type AnchorHTMLAttributes } from "react";

const marketingTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.99 0.01 95)",
      foreground: "oklch(0.2 0.05 60)",
      muted: "oklch(0.94 0.03 90)",
      mutedForeground: "oklch(0.45 0.06 70)",
      border: "oklch(0.85 0.04 90)",
      ring: "oklch(0.6 0.16 55)",
      primary: "oklch(0.55 0.18 45)",
      primaryForeground: "oklch(0.99 0.01 95)",
    },
  },
});

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

function ChartIcon() {
  return (
    <svg fill="none" viewBox="0 0 16 16">
      <path
        d="M2.5 13.5v-5m4 5v-9m4 9v-6m4 6v-11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg fill="none" viewBox="0 0 16 16">
      <path
        d="M8.75 1.5 3.5 9h3.75l-.5 5.5L12 7H8.25l.5-5.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ProductFlyoutNav() {
  return (
    <NavigationMenu aria-label="Product">
      <NavigationMenuList>
        <NavigationMenuItem value="platform">
          <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuFeaturedItem href="/platform">
              Platform overview
              <NavigationMenuDescription>
                Analytics, automation, and reporting in one workspace.
              </NavigationMenuDescription>
            </NavigationMenuFeaturedItem>
            <NavigationMenuSeparator orientation="vertical" />
            <NavigationMenuSection>
              <NavigationMenuLabel>Products</NavigationMenuLabel>
              <NavigationMenuLink href="/analytics" icon={<ChartIcon />}>
                Analytics
                <NavigationMenuDescription>
                  Usage dashboards for every workspace.
                </NavigationMenuDescription>
              </NavigationMenuLink>
              <NavigationMenuLink href="/automation" icon={<BoltIcon />}>
                Automation
                <NavigationMenuDescription>
                  Build workflows that react to events.
                </NavigationMenuDescription>
              </NavigationMenuLink>
              <NavigationMenuLink external href="https://status.example.com">
                Status ↗
              </NavigationMenuLink>
            </NavigationMenuSection>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="solutions">
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuSection>
              <NavigationMenuLabel>By team</NavigationMenuLabel>
              <NavigationMenuLink href="/solutions/product">
                Product teams
              </NavigationMenuLink>
              <NavigationMenuLink href="/solutions/data">
                Data teams
              </NavigationMenuLink>
              <NavigationMenuLink disabled href="/solutions/finance">
                Finance teams
              </NavigationMenuLink>
            </NavigationMenuSection>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const ProductFlyout: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[22rem] rounded-lg border border-border p-6"
    >
      <ProductFlyoutNav />
    </DethinkProvider>
  ),
};

export const DocsFlyout: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[20rem] rounded-lg border border-border p-6"
    >
      <NavigationMenu aria-label="Documentation" defaultValue="guides" variant="quiet">
        <NavigationMenuList>
          <NavigationMenuItem value="guides">
            <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLabel>Getting started</NavigationMenuLabel>
                <NavigationMenuLink current="location" href="/docs/install">
                  Installation
                  <NavigationMenuDescription>
                    Registry setup and base tokens.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
                <NavigationMenuLink href="/docs/theming">
                  Theming
                  <NavigationMenuDescription>
                    Light, dark, density, and brand palettes.
                  </NavigationMenuDescription>
                </NavigationMenuLink>
              </NavigationMenuSection>
              <NavigationMenuSeparator orientation="vertical" />
              <NavigationMenuSection>
                <NavigationMenuLabel>Recipes</NavigationMenuLabel>
                <NavigationMenuLink href="/docs/recipes/forms">
                  Forms
                </NavigationMenuLink>
                <NavigationMenuLink href="/docs/recipes/tables">
                  Tables
                </NavigationMenuLink>
                <NavigationMenuLink href="/docs/recipes/navigation">
                  Navigation
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="reference">
            <NavigationMenuTrigger>Reference</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="/docs/api">
                  Component API
                </NavigationMenuLink>
                <NavigationMenuLink href="/docs/tokens">Tokens</NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/changelog">Changelog</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </DethinkProvider>
  ),
};

export const HoverActivation: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[20rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Hover a trigger to open its panel after a short intent delay. Click,
          Enter, and Space still toggle for keyboard and touch users.
        </p>
        <NavigationMenu
          aria-label="Hover navigation"
          activationMode="hover"
          delay={150}
          closeDelay={300}
        >
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/analytics">
                    Analytics
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/automation">
                    Automation
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="resources">
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/docs">
                    Documentation
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/blog">Blog</NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </DethinkProvider>
  ),
};

function ControlledFlyoutExample() {
  const [value, setValue] = useState<string | null>("platform");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-density-gap">
        <Button size="sm" variant="outline" onClick={() => setValue("platform")}>
          Open platform
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue("solutions")}>
          Open solutions
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setValue(null)}>
          Close
        </Button>
        <span className="text-sm text-muted-foreground">
          value: {value ?? "null"}
        </span>
      </div>
      <NavigationMenu
        aria-label="Controlled navigation"
        value={value}
        onValueChange={setValue}
      >
        <NavigationMenuList>
          <NavigationMenuItem value="platform">
            <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
                <NavigationMenuLink href="/automation">
                  Automation
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="solutions">
            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="/solutions/product">
                  Product teams
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export const ControlledFlyout: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[20rem] rounded-lg border border-border p-6"
    >
      <ControlledFlyoutExample />
    </DethinkProvider>
  ),
};

export const WithViewport: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[22rem] rounded-lg border border-border p-6"
    >
      <NavigationMenu aria-label="Viewport navigation" defaultValue="platform">
        <NavigationMenuList>
          <NavigationMenuItem value="platform">
            <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLabel>Products</NavigationMenuLabel>
                <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
                <NavigationMenuLink href="/automation">
                  Automation
                </NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="company">
            <NavigationMenuTrigger>Company</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSection>
                <NavigationMenuLink href="/about">About</NavigationMenuLink>
                <NavigationMenuLink href="/careers">Careers</NavigationMenuLink>
              </NavigationMenuSection>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </DethinkProvider>
  ),
};

export const KeyboardUsage: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[20rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Tab moves through links and triggers in document order. Enter and
          Space toggle a trigger, Tab continues into the open panel, Escape
          closes the panel and returns focus to its trigger, and moving focus
          out of the navigation closes any open panel.
        </p>
        <ProductFlyoutNav />
      </div>
    </DethinkProvider>
  ),
};

const responsiveSections = [
  { href: "/dashboard", label: "Dashboard", current: true },
  { href: "/deployments", label: "Deployments", current: false },
  { href: "/monitoring", label: "Monitoring", current: false },
  { href: "/team", label: "Team", current: false },
];

function ResponsiveTopbar() {
  return (
    <header className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-4 py-2">
      <span className="text-sm font-semibold text-foreground">Acme Cloud</span>
      <NavigationMenu
        aria-label="Dashboard"
        className="max-md:hidden"
        size="sm"
        variant="quiet"
      >
        <NavigationMenuList>
          {responsiveSections.map((section) => (
            <NavigationMenuItem key={section.href}>
              <NavigationMenuLink current={section.current} href={section.href}>
                {section.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger size="sm" variant="outline">
            Menu
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Navigate</DialogTitle>
            <div className="px-[var(--dt-space-6)] pb-[var(--dt-space-6)]">
              <NavigationMenu
                aria-label="Dashboard"
                orientation="vertical"
                variant="quiet"
              >
                <NavigationMenuList>
                  {responsiveSections.map((section) => (
                    <NavigationMenuItem key={section.href}>
                      <NavigationMenuLink
                        current={section.current}
                        href={section.href}
                      >
                        {section.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

export const CompactAppTopbar: Story = {
  render: () => (
    <DethinkProvider theme="light" className="rounded-lg border border-border p-4">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Resize the viewport: the quiet nav renders inline on wide screens and
          hands off to a Dialog below the md breakpoint. NavigationMenu stays a
          navigation primitive — the Dialog owns the mobile overlay.
        </p>
        <ResponsiveTopbar />
      </div>
    </DethinkProvider>
  ),
};

export const OverflowCollapse: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[16rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Secondary destinations collapse behind a More disclosure below the lg
          breakpoint and render inline when space allows.
        </p>
        <NavigationMenu aria-label="Product">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/overview">
                Overview
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="lg:hidden" value="more">
              <NavigationMenuTrigger>More</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
                  <NavigationMenuLink href="/audit">Audit log</NavigationMenuLink>
                  <NavigationMenuLink href="/settings">
                    Settings
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="max-lg:hidden">
              <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="max-lg:hidden">
              <NavigationMenuLink href="/audit">Audit log</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="max-lg:hidden">
              <NavigationMenuLink href="/settings">Settings</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </DethinkProvider>
  ),
};

export const MobileComposedThemes: Story = {
  render: () => (
    <div className="grid gap-4 xl:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="rounded-lg border border-border p-4"
      >
        <ResponsiveTopbar />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="rounded-lg border border-border p-4"
      >
        <ResponsiveTopbar />
      </DethinkProvider>
    </div>
  ),
};

export const AnimatedIndicator: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[20rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          The indicator tracks the open trigger, or the current link when no
          panel is open, and slides between items with a CSS transform
          transition. With reduced motion it snaps without animating.
        </p>
        <NavigationMenu aria-label="Indicator navigation" variant="quiet">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/overview">
                Overview
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/analytics">
                    Analytics
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/automation">
                    Automation
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="resources">
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/docs">
                    Documentation
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuIndicator />
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </DethinkProvider>
  ),
};

export const ViewportMorph: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[24rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          The shared viewport measures each panel and animates its width and
          height between differently sized panels.
        </p>
        <NavigationMenu aria-label="Morphing navigation" defaultValue="platform">
          <NavigationMenuList>
            <NavigationMenuItem value="platform">
              <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuFeaturedItem href="/platform">
                  Platform overview
                  <NavigationMenuDescription>
                    Analytics, automation, and reporting.
                  </NavigationMenuDescription>
                </NavigationMenuFeaturedItem>
                <NavigationMenuSection>
                  <NavigationMenuLabel>Products</NavigationMenuLabel>
                  <NavigationMenuLink href="/analytics" icon={<ChartIcon />}>
                    Analytics
                    <NavigationMenuDescription>
                      Usage dashboards for every workspace.
                    </NavigationMenuDescription>
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/automation" icon={<BoltIcon />}>
                    Automation
                    <NavigationMenuDescription>
                      Build workflows that react to events.
                    </NavigationMenuDescription>
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="company">
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/about">About</NavigationMenuLink>
                  <NavigationMenuLink href="/careers">Careers</NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>
    </DethinkProvider>
  ),
};

export const DirectionalTransitions: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[20rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Switching between open triggers slides the next panel in from the
          direction of travel using the data-motion attribute. In RTL the
          directions flip automatically.
        </p>
        <ProductFlyoutNav />
      </div>
    </DethinkProvider>
  ),
};

const motionPresets: NavigationMenuMotionPreset[] = [
  "none",
  "subtle",
  "standard",
  "expressive",
];

export const MotionPresets: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="rounded-lg border border-border p-6"
    >
      <div className="space-y-8">
        {motionPresets.map((preset) => (
          <div key={preset} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {preset}
            </p>
            <NavigationMenu
              aria-label={`${preset} navigation`}
              motion={preset}
              className="min-h-[3rem]"
            >
              <NavigationMenuList>
                <NavigationMenuItem value="products">
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuSection>
                      <NavigationMenuLink href="/analytics">
                        Analytics
                      </NavigationMenuLink>
                      <NavigationMenuLink href="/automation">
                        Automation
                      </NavigationMenuLink>
                      <NavigationMenuLink href="/reports">
                        Reports
                      </NavigationMenuLink>
                    </NavigationMenuSection>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem value="resources">
                  <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuSection>
                      <NavigationMenuLink href="/docs">
                        Documentation
                      </NavigationMenuLink>
                    </NavigationMenuSection>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="min-h-[18rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          All NavigationMenu animation is gated behind motion-safe utilities.
          With prefers-reduced-motion enabled, panels appear and disappear
          instantly, the indicator snaps between items, and the viewport
          resizes without morphing — no state is communicated by animation
          alone. Enable reduced motion in your OS settings to verify.
        </p>
        <ProductFlyoutNav />
      </div>
    </DethinkProvider>
  ),
};

export const FlyoutThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 xl:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="min-h-[20rem] rounded-lg border border-border p-6"
      >
        <NavigationMenu
          aria-label="Dark flyout navigation"
          defaultValue="products"
          variant="underline"
        >
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/dark/analytics">
                    Analytics
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/dark/automation">
                    Automation
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/dark/overview">
                Overview
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="min-h-[20rem] rounded-lg border border-border p-6"
      >
        <NavigationMenu aria-label="RTL flyout navigation" defaultValue="products">
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>منتجات</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/rtl/analytics">
                    التحليلات
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/rtl/automation">
                    الأتمتة
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/rtl/overview">
                نظرة عامة
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </DethinkProvider>
    </div>
  ),
};

export const CustomThemeOverrides: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      themeConfig={marketingTheme}
      className="min-h-[18rem] rounded-lg border border-border p-6"
    >
      <div className="space-y-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          NavigationMenu inherits brand palettes through provider tokens — the
          underline indicator, hover surfaces, and focus rings all follow the
          themeConfig override with no component-specific setup.
        </p>
        <NavigationMenu aria-label="Marketing" variant="underline" defaultValue="platform">
          <NavigationMenuList>
            <NavigationMenuItem value="platform">
              <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuSection>
                  <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
                  <NavigationMenuLink href="/automation">
                    Automation
                  </NavigationMenuLink>
                </NavigationMenuSection>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink current href="/pricing">
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuIndicator />
          </NavigationMenuList>
        </NavigationMenu>
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
