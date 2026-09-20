import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DethinkProvider,
  Link,
  type LinkUnderline,
  type LinkVariant,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const meta = {
  title: "Components/Link",
  component: Link,
  args: {
    children: "Read docs",
    href: "/docs",
    variant: "default",
    underline: "hover",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "muted", "nav", "destructive"],
    },
    underline: {
      control: "inline-radio",
      options: ["hover", "always", "none"],
    },
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants: LinkVariant[] = ["default", "muted", "nav", "destructive"];
const underlines: LinkUnderline[] = ["hover", "always", "none"];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterLink.displayName = "RouterLink";

export const Base: Story = {};

export const InlineText: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-2xl rounded-lg border p-6"
    >
      <p className="text-foreground text-sm leading-6">
        Build app chrome with semantic navigation. Start with the{" "}
        <Link href="/docs/link" underline="always">
          Link component notes
        </Link>
        , then review the Button guidance for command actions.
      </p>
    </DethinkProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {variants.map((variant) => (
          <Link key={variant} href={`/${variant}`} variant={variant}>
            {variant}
          </Link>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const UnderlineModes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        {underlines.map((underline) => (
          <Link key={underline} href={`/${underline}`} underline={underline}>
            {underline}
          </Link>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const NavigationCurrent: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <nav
        aria-label="Project sections"
        className="flex flex-wrap items-center gap-4"
      >
        <Link
          aria-current="page"
          href="/overview"
          underline="none"
          variant="nav"
        >
          Overview
        </Link>
        <Link href="/activity" underline="none" variant="nav">
          Activity
        </Link>
        <Link href="/settings" underline="none" variant="nav">
          Settings
        </Link>
        <Link href="/billing" underline="none" variant="nav">
          Billing
        </Link>
      </nav>
    </DethinkProvider>
  ),
};

export const ExternalLink: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <p className="text-foreground text-sm leading-6">
        Read the{" "}
        <Link
          href="https://developer.mozilla.org/"
          rel="noreferrer"
          target="_blank"
        >
          MDN Web Docs reference
        </Link>{" "}
        in a new tab.
      </p>
    </DethinkProvider>
  ),
};

export const RouterComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="gap-density-gap flex flex-wrap items-center">
        <Link asChild variant="nav" underline="none">
          <RouterLink to="/dashboard">Router dashboard</RouterLink>
        </Link>
        <Link asChild target="_blank">
          <RouterLink to="/docs/router">Router docs</RouterLink>
        </Link>
      </div>
    </DethinkProvider>
  ),
};

export const DashboardExamples: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <div className="space-y-5">
        <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4 rounded-md border p-3">
          <div className="min-w-0">
            <h2 className="text-foreground truncate text-sm font-semibold">
              Revenue report
            </h2>
            <p className="text-muted-foreground text-sm">
              Updated from pipeline run #428
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/reports/revenue" variant="nav" underline="none">
              View report
            </Link>
            <Link href="/reports/revenue/export" variant="muted">
              Export
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          For risky destinations, use explicit surrounding copy before a{" "}
          <Link href="/projects/archive" variant="destructive">
            destructive navigation link
          </Link>
          .
        </p>
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
        <nav
          aria-label="Dark sections"
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            aria-current="page"
            href="/dark/overview"
            underline="none"
            variant="nav"
          >
            Overview
          </Link>
          <Link href="/dark/activity" underline="none" variant="nav">
            Activity
          </Link>
          <Link href="/dark/docs" variant="default">
            Documentation
          </Link>
        </nav>
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <nav
          aria-label="RTL sections"
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            aria-current="page"
            href="/rtl/overview"
            underline="none"
            variant="nav"
          >
            Overview
          </Link>
          <Link href="/rtl/settings" underline="none" variant="nav">
            Settings
          </Link>
          <Link href="/rtl/help" variant="muted">
            Help center
          </Link>
        </nav>
      </DethinkProvider>
    </div>
  ),
};
