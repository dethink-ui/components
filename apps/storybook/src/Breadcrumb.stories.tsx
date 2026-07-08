import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DethinkProvider,
  type BreadcrumbItemData,
  type BreadcrumbSeparatorVariant,
  type BreadcrumbSize,
} from "@dethink/components";
import { forwardRef, type AnchorHTMLAttributes } from "react";

const angleSeparator = (
  <span className="text-info font-mono text-[0.7em] font-semibold">{"<>"}</span>
);

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [
      { key: "home", label: "Home", href: "/" },
      { key: "workspaces", label: "Workspaces", href: "/workspaces" },
      { key: "current", label: "Revenue report" },
    ],
    separator: "chevron",
    size: "md",
  },
  argTypes: {
    separator: {
      control: "select",
      options: ["chevron", "slash", "dot", "none", "angle"],
      mapping: {
        angle: angleSeparator,
      },
      labels: {
        angle: "<> custom ReactNode",
      },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

const sizes: BreadcrumbSize[] = ["sm", "md", "lg"];
const separators: BreadcrumbSeparatorVariant[] = ["chevron", "slash", "dot"];

const longItems: BreadcrumbItemData[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "platform", label: "Platform", href: "/platform" },
  { key: "workspaces", label: "Workspaces", href: "/platform/workspaces" },
  {
    key: "operations",
    label: "Operations",
    href: "/platform/workspaces/operations",
  },
  {
    key: "reports",
    label: "Reports",
    href: "/platform/workspaces/operations/reports",
  },
  { key: "current", label: "Revenue pipeline detail" },
];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
RouterLink.displayName = "RouterLink";

function HomeIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="M2.75 7.25 8 3l5.25 4.25v5.5a.75.75 0 0 1-.75.75h-3v-4h-3v4h-3a.75.75 0 0 1-.75-.75z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export const Base: Story = {
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Breadcrumb {...args} />
    </DethinkProvider>
  ),
};

export const CurrentLinkAndPage: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid gap-4 rounded-lg border p-6"
    >
      <Breadcrumb
        aria-label="Current page as text"
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "settings", label: "Settings", href: "/settings" },
          { key: "billing", label: "Billing" },
        ]}
      />
      <Breadcrumb
        aria-label="Current page as link"
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "settings", label: "Settings", href: "/settings" },
          {
            key: "billing",
            label: "Billing",
            href: "/settings/billing",
            current: true,
          },
        ]}
      />
    </DethinkProvider>
  ),
};

export const SeparatorsAndSizes: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid gap-5 rounded-lg border p-6"
    >
      {sizes.map((size) => (
        <div key={size} className="grid gap-3">
          {separators.map((separator) => (
            <Breadcrumb
              key={`${size}-${separator}`}
              items={[
                { key: "home", label: "Home", href: "/" },
                { key: "library", label: "Library", href: "/library" },
                { key: "current", label: `${size} ${separator}` },
              ]}
              separator={separator}
              size={size}
            />
          ))}
        </div>
      ))}
    </DethinkProvider>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Breadcrumb
        separator={angleSeparator}
        items={[
          { key: "home", label: "Home", href: "/" },
          { key: "workspaces", label: "Workspaces", href: "/workspaces" },
          { key: "current", label: "Angle separator" },
        ]}
      />
    </DethinkProvider>
  ),
};

export const IconsAndActions: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Breadcrumb
        items={[
          { key: "home", label: "Home", href: "/", icon: <HomeIcon /> },
          {
            key: "workspace",
            label: "Operations",
            onAction: () => undefined,
          },
          { key: "current", label: "Revenue report" },
        ]}
      />
    </DethinkProvider>
  ),
};

export const RouterComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Breadcrumb aria-label="Router breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <RouterLink to="/">Home</RouterLink>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem current>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </DethinkProvider>
  ),
};

export const CollapsedOverflow: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <Breadcrumb
        items={longItems}
        maxItems={4}
        overflowLabel="Show hidden breadcrumb items"
      />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Show hidden breadcrumb items" }),
    );
    await expect(
      await page.findByRole("dialog", { name: "Show hidden breadcrumb items" }),
    ).toBeVisible();
  },
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border rounded-lg border p-6"
      >
        <Breadcrumb items={longItems.slice(0, 4)} size="sm" />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border rounded-lg border p-6"
      >
        <Breadcrumb items={longItems.slice(0, 4)} separator="slash" />
      </DethinkProvider>
    </div>
  ),
};
