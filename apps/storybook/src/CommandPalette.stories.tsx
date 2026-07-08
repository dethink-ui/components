import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteItemDescription,
  CommandPaletteItemLabel,
  CommandPaletteItemShortcut,
  CommandPaletteList,
  CommandPaletteSeparator,
  CommandPaletteTrigger,
  DethinkProvider,
  defineDethinkTheme,
  type CommandPaletteCommand,
} from "@dethink/components";

const commands: CommandPaletteCommand[] = [
  {
    group: "Actions",
    key: "create-project",
    keywords: ["new", "workspace"],
    label: "Create project",
    shortcut: "⌘N",
  },
  {
    aliases: ["people"],
    group: "Actions",
    key: "invite",
    label: "Invite teammate",
    shortcut: "⌘I",
  },
  {
    group: "Navigate",
    href: "/settings",
    key: "settings",
    label: "Open settings",
    type: "link",
  },
  {
    disabled: true,
    disabledReason: "Requires owner access",
    destructive: true,
    group: "Danger",
    key: "delete-workspace",
    label: "Delete workspace",
  },
];

const recentCommands: CommandPaletteCommand[] = [
  {
    key: "recent-billing",
    label: "Open billing workspace",
    source: "recent",
  },
  {
    key: "recent-data-room",
    label: "Open data room",
    source: "recent",
  },
];

const suggestedCommands: CommandPaletteCommand[] = [
  {
    key: "suggested-audit-log",
    label: "Review audit log",
    source: "suggested",
  },
  {
    key: "suggested-invite",
    label: "Invite teammate",
    source: "suggested",
  },
];

const serverCommands: CommandPaletteCommand[] = [
  {
    description: "Dashboard resource",
    key: "remote-reporting",
    keywords: ["analytics", "dashboard", "report"],
    label: "Open reporting dashboard",
  },
  {
    description: "Project resource",
    key: "remote-infra",
    keywords: ["ops", "service", "project"],
    label: "Open infrastructure rollout",
  },
  {
    description: "People resource",
    key: "remote-customer-health",
    keywords: ["customer", "health", "account"],
    label: "Open customer health review",
  },
];

const nestedRootCommands: CommandPaletteCommand[] = [
  {
    key: "projects",
    label: "Projects",
    page: "projects",
    shortcut: "G P",
    type: "page",
  },
  {
    key: "resources",
    label: "Resources",
    page: "resources",
    shortcut: "G R",
    type: "page",
  },
  {
    key: "create",
    label: "Create project",
    shortcut: "⌘N",
  },
];

const customTheme = defineDethinkTheme({
  colorSchemes: {
    light: {
      background: "oklch(0.985 0.012 180)",
      foreground: "oklch(0.19 0.035 230)",
      muted: "oklch(0.93 0.02 185)",
      mutedForeground: "oklch(0.42 0.045 230)",
      border: "oklch(0.78 0.04 190)",
      input: "oklch(0.82 0.035 190)",
      ring: "oklch(0.58 0.18 195)",
      primary: "oklch(0.43 0.13 195)",
      primaryForeground: "oklch(0.98 0.01 190)",
      destructive: "oklch(0.58 0.2 28)",
    },
  },
  density: {
    comfortable: {
      control: "3rem",
      gap: "0.875rem",
    },
  },
  radii: {
    lg: "0.5rem",
    md: "0.5rem",
  },
});

const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  args: {
    commands,
    label: "Command menu",
    placeholder: "Type a command or search...",
  },
  argTypes: {
    controlSize: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    motionPreset: {
      control: "inline-radio",
      options: ["none", "subtle", "standard", "expressive"],
    },
    reducedMotion: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  render: (args) => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette {...args} />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Command menu");

    await userEvent.type(input, "people");
    await expect(
      canvas.getByRole("button", { name: "Invite teammate" }),
    ).toBeVisible();
  },
};

export const CustomFilteringAndLimit: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Workspace commands"
        commands={commands}
        limit={2}
        filter={(command, query) =>
          command.key.includes(query.toLowerCase()) ||
          command.group?.toLowerCase().includes(query.toLowerCase()) === true
        }
        placeholder="Filter by key or group"
      />
    </DethinkProvider>
  ),
};

export const ChildrenComposition: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette aria-label="Custom command palette">
        <CommandPaletteInput placeholder="Search custom commands" />
        <CommandPaletteList>
          <CommandPaletteGroup heading="Actions">
            <CommandPaletteItem value="create">
              <span
                aria-hidden="true"
                className="text-muted-foreground flex size-4 items-center justify-center"
              >
                <Search aria-hidden="true" />
              </span>
              <span className="grid min-w-0 gap-0.5">
                <CommandPaletteItemLabel>
                  Create saved view
                </CommandPaletteItemLabel>
                <CommandPaletteItemDescription>
                  Save the current filters for this workspace
                </CommandPaletteItemDescription>
              </span>
              <CommandPaletteItemShortcut>G V</CommandPaletteItemShortcut>
            </CommandPaletteItem>
            <CommandPaletteSeparator />
            <CommandPaletteItem href="/settings" value="settings">
              Settings
            </CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </DethinkProvider>
  ),
};

export const GlobalDialog: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <CommandPaletteDialog>
        <CommandPaletteTrigger>Open command menu</CommandPaletteTrigger>
        <CommandPaletteContent
          title="Command menu"
          description="Run workspace commands"
        >
          <CommandPalette label="Command menu" commands={commands} />
        </CommandPaletteContent>
      </CommandPaletteDialog>
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Open command menu" }),
    );
    await expect(
      await within(document.body).findByRole("dialog", {
        name: "Command menu",
      }),
    ).toBeVisible();
  },
};

function ControlledCommandDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <DethinkProvider
      theme="light"
      className="border-border rounded-lg border p-6"
    >
      <CommandPaletteDialog
        open={open}
        onOpenChange={setOpen}
        closeOnRun={false}
      >
        <CommandPaletteTrigger variant="outline">
          Open controlled commands
        </CommandPaletteTrigger>
        <CommandPaletteContent title="Controlled commands">
          <CommandPalette
            label="Controlled commands"
            commands={[
              ...commands,
              {
                key: "close-menu",
                label: "Close command menu",
                action: () => setOpen(false),
                closeOnRun: true,
              },
            ]}
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>
    </DethinkProvider>
  );
}

export const ControlledOpenState: Story = {
  render: () => <ControlledCommandDialogExample />,
};

function AsyncCommandSearchExample() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandPaletteCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRun, setLastRun] = useState("");

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const timeout = window.setTimeout(() => {
      if (normalizedQuery.includes("err")) {
        setResults([]);
        setError("Could not load workspace resources.");
        setLoading(false);
        return;
      }

      setResults(
        serverCommands
          .filter((command) => {
            const searchable = [
              command.key,
              typeof command.label === "string" ? command.label : command.key,
              command.description,
              ...(command.keywords ?? []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchable.includes(normalizedQuery);
          })
          .map((command) => ({
            ...command,
            action: () => {
              setLastRun(
                typeof command.label === "string" ? command.label : command.key,
              );
            },
          })),
      );
      setLoading(false);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, retryCount]);

  return (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <div className="grid gap-3">
        <CommandPalette
          label="Server commands"
          description={lastRun ? `Ran ${lastRun}` : "Workspace resources"}
          commands={commands.slice(0, 2)}
          recentCommands={recentCommands}
          suggestedCommands={suggestedCommands}
          asyncCommands={results}
          query={query}
          onQueryChange={setQuery}
          loading={loading}
          loadingMessage="Searching workspace resources..."
          error={error}
          onRetry={() => setRetryCount((count) => count + 1)}
          retryLabel="Retry search"
          minimumQueryLength={2}
          minimumQueryMessage="Type 2 or more characters to search resources."
          shouldFilter={false}
          staleMessage="Updating workspace resources."
        />
      </div>
    </DethinkProvider>
  );
}

export const AsyncSearchWithSources: Story = {
  render: () => <AsyncCommandSearchExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Server commands");

    await userEvent.type(input, "report");
    await expect(
      await canvas.findByRole("button", { name: /Open reporting dashboard/ }),
    ).toBeVisible();
  },
};

export const AsyncLoadingAndStale: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Updating commands"
        commands={commands.slice(0, 1)}
        asyncCommands={[serverCommands[0]]}
        query="report"
        loading
        shouldFilter={false}
        staleMessage="Updating workspace resources."
      />
    </DethinkProvider>
  ),
};

export const AsyncErrorRetry: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Server commands"
        commands={[]}
        asyncCommands={[]}
        query="error"
        error="Could not load workspace resources."
        onRetry={() => undefined}
        retryLabel="Retry search"
      />
    </DethinkProvider>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Empty commands"
        commands={commands.slice(0, 2)}
        defaultQuery="missing"
        emptyMessage="No matching workspace commands."
      />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("status")).toHaveTextContent(
      "No matching workspace commands.",
    );
  },
};

export const MotionPresets: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="light"
        className="border-border max-w-lg rounded-lg border p-6"
      >
        <CommandPalette
          label="Subtle motion"
          motionPreset="subtle"
          commands={commands}
          recentCommands={recentCommands}
          suggestedCommands={suggestedCommands}
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        className="border-border max-w-lg rounded-lg border p-6"
      >
        <CommandPalette
          label="Expressive motion"
          motionPreset="expressive"
          commands={commands}
          recentCommands={recentCommands}
          suggestedCommands={suggestedCommands}
        />
      </DethinkProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expressiveInput = canvas.getByLabelText("Expressive motion");
    const expressivePalette = expressiveInput.closest(
      '[data-slot="command-palette"]',
    );

    await expect(expressivePalette).not.toBeNull();

    await userEvent.click(expressiveInput);
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      within(expressivePalette as HTMLElement).getByRole("button", {
        name: "Open data room",
      }),
    ).toHaveAttribute("data-selected", "true");
  },
};

function NestedPagesExample() {
  const [lastRun, setLastRun] = useState("");

  return (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Workspace commands"
        description={lastRun || "Drill into project and resource command pages"}
        motionPreset="expressive"
        commands={nestedRootCommands}
        pages={[
          {
            commands: [
              {
                key: "alpha",
                label: "Open Alpha rollout",
                action: () => setLastRun("Opened Alpha rollout"),
              },
              {
                key: "beta",
                label: "Open Beta migration",
                action: () => setLastRun("Opened Beta migration"),
              },
            ],
            description: "Project switcher commands",
            id: "projects",
            title: "Projects",
          },
          {
            commands: [
              {
                key: "reporting",
                label: "Open reporting dashboard",
                action: () => setLastRun("Opened reporting dashboard"),
              },
              {
                key: "audit-log",
                label: "Review audit log",
                action: () => setLastRun("Opened audit log"),
              },
            ],
            description: "Dashboards and operational records",
            id: "resources",
            title: "Resources",
          },
        ]}
      />
    </DethinkProvider>
  );
}

export const NestedPages: Story = {
  render: () => <NestedPagesExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Projects/ }));
    await expect(canvas.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /Open Alpha rollout/ }),
    ).toBeVisible();
  },
};

export const ReducedMotion: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Reduced motion"
        motionPreset="expressive"
        reducedMotion
        commands={nestedRootCommands}
        recentCommands={recentCommands}
        suggestedCommands={suggestedCommands}
        pages={[
          {
            commands: [
              { key: "project-alpha", label: "Open Alpha rollout" },
              { key: "project-beta", label: "Open Beta migration" },
            ],
            description: "Project switcher commands",
            id: "projects",
            title: "Projects",
          },
        ]}
      />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Reduced motion")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Open billing workspace" }),
    ).toHaveAttribute("data-selected", "true");
  },
};

function ControlledPageStackExample() {
  const [pageStack, setPageStack] = useState(["resources"]);

  return (
    <DethinkProvider
      theme="light"
      density="compact"
      className="border-border max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        label="Controlled stack"
        motionPreset="standard"
        reducedMotion
        commands={nestedRootCommands}
        pageStack={pageStack}
        onPageStackChange={setPageStack}
        pages={[
          {
            commands: [],
            emptyMessage: "No resource commands match this page.",
            id: "resources",
            title: "Resources",
          },
        ]}
      />
    </DethinkProvider>
  );
}

export const ControlledPageStack: Story = {
  render: () => <ControlledPageStackExample />,
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider
        theme="dark"
        density="compact"
        className="border-border max-w-lg rounded-lg border p-6"
      >
        <CommandPalette
          controlSize="sm"
          label="Compact commands"
          commands={commands}
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="border-border max-w-lg rounded-lg border p-6"
      >
        <CommandPalette
          controlSize="lg"
          label="RTL commands"
          commands={commands}
        />
      </DethinkProvider>
    </div>
  ),
};

export const CustomThemeOverride: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      density="comfortable"
      themeConfig={customTheme}
      className="border-border bg-background max-w-lg rounded-lg border p-6"
    >
      <CommandPalette
        controlSize="lg"
        label="Themed commands"
        motionPreset="subtle"
        commands={commands}
        recentCommands={recentCommands}
        suggestedCommands={suggestedCommands}
      />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("Themed commands")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Open billing workspace" }),
    ).toHaveAttribute("data-selected", "true");
  },
};
