import { forwardRef, useState } from "react";
import type { AnchorHTMLAttributes } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
  commandPaletteContentClassNames,
  commandPaletteItemClassNames,
  commandPaletteTriggerClassNames,
  defaultCommandPaletteFilter,
  getCommandPaletteFilteredCommands,
  getCommandPaletteSourceCommands,
  type CommandPaletteCommand,
} from ".";

const commands: CommandPaletteCommand[] = [
  {
    action: vi.fn(),
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
    group: "Danger",
    key: "delete-workspace",
    label: "Delete workspace",
    destructive: true,
  },
];

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} {...props}>
    {children}
  </a>
));
RouterLink.displayName = "RouterLink";

describe("CommandPalette", () => {
  it("renders data-driven grouped commands with actions, links, shortcuts, and disabled reasons", () => {
    render(
      <CommandPalette
        label="Command menu"
        description="Search app actions"
        commands={commands}
      />,
    );

    const root = screen
      .getByText("Command menu")
      .closest('[data-slot="command-palette"]');

    expect(root).toHaveAttribute("data-mode", "inline");
    expect(screen.getByLabelText("Command menu")).toHaveAttribute(
      "type",
      "search",
    );
    expect(screen.getByText("Actions")).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Create project/ }),
    ).toHaveTextContent("⌘N");
    expect(screen.getByRole("link", { name: "Open settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(
      screen.getByRole("button", { name: /Delete workspace/ }),
    ).toHaveAttribute("data-destructive", "true");
    expect(screen.getByText("Requires owner access")).toBeVisible();
    expect(
      document.querySelectorAll('[data-slot="command-palette-separator"]'),
    ).toHaveLength(2);
  });

  it("filters by labels, aliases, and keywords", async () => {
    const user = userEvent.setup();

    render(<CommandPalette label="Commands" commands={commands} />);

    await user.type(screen.getByLabelText("Commands"), "people");

    expect(
      screen.getByRole("button", { name: "Invite teammate" }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /Create project/ })).toBeNull();

    await user.clear(screen.getByLabelText("Commands"));
    await user.type(screen.getByLabelText("Commands"), "workspace");

    expect(
      screen.getByRole("button", { name: /Create project/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Delete workspace/ }),
    ).toBeVisible();
  });

  it("supports custom filtering, manual filtering, sorting, and result limits", () => {
    expect(defaultCommandPaletteFilter(commands[0], "new")).toBe(true);

    const hidden = getCommandPaletteFilteredCommands(commands, {
      filter: (command) => command.key === "settings",
      query: "anything",
    });

    expect(hidden.map((command) => command.key)).toEqual(["settings"]);

    const manual = getCommandPaletteFilteredCommands(commands, {
      query: "no-match",
      shouldFilter: false,
    });

    expect(manual.map((command) => command.key)).toEqual([
      "create-project",
      "invite",
      "settings",
      "delete-workspace",
    ]);

    const sorted = getCommandPaletteFilteredCommands(commands, {
      limit: 2,
      shouldFilter: false,
      sort: (a, b) => a.key.localeCompare(b.key),
    });

    expect(sorted.map((command) => command.key)).toEqual([
      "create-project",
      "delete-workspace",
    ]);
  });

  it("merges source commands in deterministic source order", () => {
    const mergedBeforeQuery = getCommandPaletteSourceCommands({
      asyncCommands: [{ key: "remote", label: "Remote result" }],
      commands: [
        { key: "settings", label: "Open settings" },
        { key: "create", label: "Create project" },
      ],
      query: "",
      recentCommands: [{ key: "settings", label: "Recent settings" }],
      suggestedCommands: [{ key: "invite", label: "Invite teammate" }],
    });

    expect(mergedBeforeQuery.map((command) => command.key)).toEqual([
      "settings",
      "invite",
      "remote",
      "create",
    ]);
    expect(mergedBeforeQuery.map((command) => command.source)).toEqual([
      "recent",
      "suggested",
      "async",
      "base",
    ]);
    expect(mergedBeforeQuery[0]?.group).toBe("Recent");
    expect(mergedBeforeQuery[1]?.group).toBe("Suggested");
    expect(mergedBeforeQuery[2]?.group).toBe("Results");

    const mergedAfterQuery = getCommandPaletteSourceCommands({
      asyncCommands: [{ key: "remote", label: "Remote result" }],
      commands: [{ key: "create", label: "Create project" }],
      minimumQueryLength: 2,
      query: "re",
      recentCommands: [{ key: "settings", label: "Recent settings" }],
      suggestedCommands: [{ key: "invite", label: "Invite teammate" }],
    });

    expect(mergedAfterQuery.map((command) => command.key)).toEqual([
      "remote",
      "create",
    ]);

    const belowMinimum = getCommandPaletteSourceCommands({
      asyncCommands: [{ key: "remote", label: "Remote result" }],
      commands: [{ key: "create", label: "Create project" }],
      minimumQueryLength: 2,
      query: "r",
    });

    expect(belowMinimum.map((command) => command.key)).toEqual(["create"]);
  });

  it("renders controlled recents and suggestions before a query with source context", async () => {
    const user = userEvent.setup();
    const runRecent = vi.fn();
    const run = vi.fn();

    render(
      <CommandPalette
        label="Commands"
        commands={[{ key: "create", label: "Create project" }]}
        recentCommands={[
          { key: "settings", label: "Open settings", action: runRecent },
        ]}
        suggestedCommands={[{ key: "invite", label: "Invite teammate" }]}
        onCommandRun={run}
      />,
    );

    const recent = screen.getByRole("button", { name: "Open settings" });
    const suggested = screen.getByRole("button", { name: "Invite teammate" });

    expect(screen.getByText("Recent")).toBeVisible();
    expect(screen.getByText("Suggested")).toBeVisible();
    expect(recent).toHaveAttribute("data-source", "recent");
    expect(suggested).toHaveAttribute("data-source", "suggested");

    await user.click(recent);

    expect(runRecent).toHaveBeenCalledWith(
      expect.objectContaining({ key: "settings", source: "recent" }),
      expect.objectContaining({ query: "", source: "recent" }),
    );
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ key: "settings", source: "recent" }),
      expect.objectContaining({ query: "", source: "recent" }),
    );

    await user.type(screen.getByLabelText("Commands"), "cre");

    expect(screen.queryByRole("button", { name: "Open settings" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Invite teammate" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Create project" }),
    ).toHaveAttribute("data-source", "base");
  });

  it("preserves data-driven separator commands", () => {
    render(
      <CommandPalette
        label="Commands"
        commands={[
          { key: "one", label: "One" },
          { key: "after-one", label: "After one", type: "separator" },
          { key: "two", label: "Two" },
        ]}
      />,
    );

    expect(
      document.querySelectorAll('[data-slot="command-palette-separator"]'),
    ).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "After one" })).toBeNull();
  });

  it("removes separator-only empty results after filtering", async () => {
    const user = userEvent.setup();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          { key: "before", label: "Before", type: "separator" },
          { key: "one", label: "One" },
          { key: "between", label: "Between", type: "separator" },
          { key: "two", label: "Two" },
          { key: "after", label: "After", type: "separator" },
        ]}
      />,
    );

    await user.type(screen.getByLabelText("Commands"), "missing");

    expect(screen.getByRole("status")).toHaveTextContent("No commands found.");
    expect(
      document.querySelector('[data-slot="command-palette-separator"]'),
    ).toBeNull();
  });

  it("runs action commands from click and keyboard selection", async () => {
    const user = userEvent.setup();
    const create = vi.fn();
    const run = vi.fn();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          { key: "create", label: "Create", action: create },
          { key: "invite", label: "Invite" },
        ]}
        onCommandRun={run}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(create).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ key: "create" }),
      expect.objectContaining({ query: "", source: "base" }),
    );

    await user.click(screen.getByLabelText("Commands"));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ key: "invite" }),
      expect.objectContaining({ query: "", source: "base" }),
    );
  });

  it("skips disabled commands during keyboard selection and prevents disabled activation", async () => {
    const user = userEvent.setup();
    const enabled = vi.fn();
    const disabled = vi.fn();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          { key: "one", label: "One", action: enabled },
          {
            key: "two",
            label: "Two",
            action: disabled,
            disabled: true,
            disabledReason: "Unavailable",
          },
          { key: "three", label: "Three", action: enabled },
        ]}
      />,
    );

    const input = screen.getByLabelText("Commands");

    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "data-selected",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /Two/ }));
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(disabled).not.toHaveBeenCalled();
    expect(enabled).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("exposes motion preset hooks for pages, groups, results, and selected rows", () => {
    render(
      <CommandPalette
        label="Commands"
        motionPreset="expressive"
        commands={[{ key: "create", label: "Create project" }]}
        recentCommands={[{ key: "settings", label: "Open settings" }]}
        suggestedCommands={[{ key: "invite", label: "Invite teammate" }]}
      />,
    );

    const palette = screen
      .getByLabelText("Commands")
      .closest('[data-slot="command-palette"]');

    expect(palette).toHaveAttribute("data-motion", "expressive");
    expect(
      document.querySelector('[data-slot="command-palette-page"]'),
    ).toHaveAttribute("data-motion", "expressive");
    expect(
      document.querySelector(
        '[data-slot="command-palette-selected-indicator"]',
      ),
    ).toHaveAttribute("data-motion", "expressive");
    expect(
      document.querySelectorAll('[data-slot="command-palette-motion-group"]')
        .length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll('[data-slot="command-palette-motion-result"]')
        .length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      document.querySelectorAll('[data-motion-stagger="true"]').length,
    ).toBeGreaterThan(0);
  });

  it("keeps selected state visible while reduced motion disables stagger hooks", () => {
    render(
      <CommandPalette
        label="Commands"
        motionPreset="expressive"
        reducedMotion
        commands={[
          { key: "create", label: "Create project" },
          { key: "invite", label: "Invite teammate" },
        ]}
      />,
    );

    const selected = screen.getByRole("button", { name: "Create project" });

    expect(selected.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    expect(selected).toHaveAttribute("data-selected", "true");
    expect(
      document.querySelector(
        '[data-slot="command-palette-selected-indicator"]',
      ),
    ).toHaveAttribute("data-reduced-motion", "true");
    expect(
      document.querySelector('[data-slot="command-palette-motion-result"]'),
    ).toHaveAttribute("data-reduced-motion", "true");
    expect(document.querySelector('[data-motion-stagger="true"]')).toBeNull();
  });

  it("supports children-driven compound anatomy and separators", () => {
    render(
      <CommandPalette aria-label="Custom commands">
        <CommandPaletteInput placeholder="Search custom commands" />
        <CommandPaletteList>
          <CommandPaletteGroup heading="Actions">
            <CommandPaletteItem value="create">
              <span aria-hidden="true" />
              <span>
                <CommandPaletteItemLabel>Create issue</CommandPaletteItemLabel>
                <CommandPaletteItemDescription>
                  Opens the issue composer
                </CommandPaletteItemDescription>
              </span>
              <CommandPaletteItemShortcut>G I</CommandPaletteItemShortcut>
            </CommandPaletteItem>
            <CommandPaletteSeparator />
            <CommandPaletteItem href="/issues" value="issues">
              Issues
            </CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>,
    );

    const root = screen
      .getByPlaceholderText("Search custom commands")
      .closest('[data-slot="command-palette"]');

    expect(root).toHaveAttribute("data-slot", "command-palette");
    expect(screen.getByRole("button", { name: /Create issue/ })).toBeVisible();
    expect(screen.getByRole("link", { name: "Issues" })).toHaveAttribute(
      "href",
      "/issues",
    );
    expect(
      screen
        .getByText("G I")
        .closest('[data-slot="command-palette-item-shortcut"]'),
    ).toBeVisible();
    expect(
      document.querySelector('[data-slot="command-palette-separator"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("starts children-driven keyboard navigation on the first item", async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();

    render(
      <CommandPalette aria-label="Custom commands">
        <CommandPaletteInput placeholder="Search custom commands" />
        <CommandPaletteList>
          <CommandPaletteItem onAction={first} value="first">
            First action
          </CommandPaletteItem>
          <CommandPaletteItem onAction={second} value="second">
            Second action
          </CommandPaletteItem>
        </CommandPaletteList>
      </CommandPalette>,
    );

    await user.click(screen.getByPlaceholderText("Search custom commands"));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(first).toHaveBeenCalledWith(
      expect.objectContaining({ key: "first" }),
      expect.objectContaining({ query: "", source: undefined }),
    );
    expect(second).not.toHaveBeenCalled();
  });

  it("wraps children-driven ArrowUp navigation to the last item", async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();

    render(
      <CommandPalette aria-label="Custom commands">
        <CommandPaletteInput placeholder="Search custom commands" />
        <CommandPaletteList>
          <CommandPaletteItem onAction={first} value="first">
            First action
          </CommandPaletteItem>
          <CommandPaletteItem onAction={second} value="second">
            Second action
          </CommandPaletteItem>
        </CommandPaletteList>
      </CommandPalette>,
    );

    await user.click(screen.getByPlaceholderText("Search custom commands"));
    await user.keyboard("{ArrowUp}{Enter}");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(
      expect.objectContaining({ key: "second" }),
      expect.objectContaining({ query: "", source: undefined }),
    );
  });

  it("composes router links through asChild", () => {
    render(
      <CommandPalette aria-label="Router commands">
        <CommandPaletteList>
          <CommandPaletteItem asChild value="projects">
            <RouterLink to="/projects">Projects</RouterLink>
          </CommandPaletteItem>
        </CommandPaletteList>
      </CommandPalette>,
    );

    const link = screen.getByRole("link", { name: "Projects" });

    expect(link).toHaveAttribute("href", "/projects");
    expect(link).toHaveAttribute("data-slot", "command-palette-item");
  });

  it("lets asChild links cancel command activation", async () => {
    const user = userEvent.setup();
    const run = vi.fn();
    const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"] = (
      event,
    ) => {
      event.preventDefault();
    };

    render(
      <CommandPalette aria-label="Router commands" onCommandRun={run}>
        <CommandPaletteList>
          <CommandPaletteItem asChild value="projects">
            <RouterLink onClick={handleClick} to="/projects">
              Projects
            </RouterLink>
          </CommandPaletteItem>
        </CommandPaletteList>
      </CommandPalette>,
    );

    await user.click(screen.getByRole("link", { name: "Projects" }));

    expect(run).not.toHaveBeenCalled();
  });

  it("returns tokenized item class names", () => {
    expect(commandPaletteItemClassNames({ controlSize: "lg" })).toContain(
      "min-h-11",
    );
  });

  it("renders empty state when no commands match", async () => {
    const user = userEvent.setup();

    render(<CommandPalette label="Commands" commands={commands} />);

    await user.type(screen.getByLabelText("Commands"), "nothing");

    const empty = screen.getByRole("status");

    expect(empty).toHaveTextContent("No commands found.");
    expect(empty.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "data-empty",
      "true",
    );
    expect(
      document.querySelector('[data-slot="command-palette-announcer"]'),
    ).toBeNull();
  });

  it("renders empty state for explicit empty command arrays", () => {
    render(
      <CommandPalette
        label="Commands"
        commands={[]}
        emptyMessage="No commands configured."
      />,
    );

    const empty = screen.getByRole("status");

    expect(empty).toHaveTextContent("No commands configured.");
    expect(empty.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "data-empty",
      "true",
    );
  });

  it("renders minimum-query, loading, and stale async states", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CommandPalette
        label="Commands"
        commands={[]}
        asyncCommands={[]}
        minimumQueryLength={2}
      />,
    );

    await user.type(screen.getByLabelText("Commands"), "r");

    let status = screen.getByRole("status");

    expect(status).toHaveTextContent("Type at least 2 characters to search.");
    expect(status.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "data-minimum-query",
      "true",
    );

    rerender(
      <CommandPalette
        label="Commands"
        commands={[]}
        asyncCommands={[]}
        query="re"
        loading
        loadingMessage="Searching server commands..."
        shouldFilter={false}
      />,
    );

    status = screen.getByRole("status");

    expect(status).toHaveTextContent("Searching server commands...");
    expect(status.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "aria-busy",
      "true",
    );

    rerender(
      <CommandPalette
        label="Commands"
        commands={[]}
        asyncCommands={[{ key: "remote", label: "Remote result" }]}
        query="re"
        loading
        shouldFilter={false}
        staleMessage="Updating remote results."
      />,
    );

    expect(
      screen.getByRole("button", { name: "Remote result" }),
    ).toHaveAttribute("data-source", "async");
    status = screen.getByRole("status");

    expect(status).toHaveTextContent("Updating remote results.");
    expect(status.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "data-stale",
      "true",
    );
  });

  it("renders async error and keyboard-reachable retry control", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();

    render(
      <CommandPalette
        label="Commands"
        commands={[]}
        asyncCommands={[]}
        query="server"
        error="Could not load commands."
        onRetry={retry}
        retryLabel="Try again"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Could not load commands.",
    );
    expect(
      screen
        .getByText("Could not load commands.")
        .closest('[data-slot="command-palette"]'),
    ).toHaveAttribute("data-error", "true");

    const retryButton = screen.getByRole("button", { name: "Try again" });

    retryButton.focus();
    expect(retryButton).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("announces result counts, selection, async states, retry availability, and command runs", async () => {
    const user = userEvent.setup();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          { key: "create", label: "Create project" },
          { key: "invite", label: "Invite teammate" },
        ]}
      />,
    );

    const announcer = document.querySelector(
      '[data-slot="command-palette-announcer"]',
    );

    await waitFor(() => {
      expect(announcer).toHaveTextContent("2 commands available.");
      expect(announcer).toHaveTextContent("Selected Create project.");
    });

    await user.type(screen.getByLabelText("Commands"), "invite");

    await waitFor(() => {
      expect(announcer).toHaveTextContent("1 command available for invite.");
      expect(announcer).toHaveTextContent("Selected Invite teammate.");
    });

    await user.click(screen.getByRole("button", { name: "Invite teammate" }));

    expect(announcer).toHaveTextContent("Ran Invite teammate.");
  });

  it("clears stale run announcements when selection changes", async () => {
    const user = userEvent.setup();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          { key: "create", label: "Create project" },
          { key: "invite", label: "Invite teammate" },
        ]}
      />,
    );

    const announcer = document.querySelector(
      '[data-slot="command-palette-announcer"]',
    );

    await user.click(screen.getByRole("button", { name: "Create project" }));

    expect(announcer).toHaveTextContent("Ran Create project.");

    await user.click(screen.getByLabelText("Commands"));
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(announcer).toHaveTextContent("Selected Invite teammate.");
      expect(announcer).not.toHaveTextContent("Ran Create project.");
    });
  });

  it("keeps async result rows compatible with dialog mode", () => {
    render(
      <CommandPaletteDialog defaultOpen>
        <CommandPaletteTrigger>Open commands</CommandPaletteTrigger>
        <CommandPaletteContent title="Async commands">
          <CommandPalette
            label="Async commands"
            asyncCommands={[{ key: "remote", label: "Remote result" }]}
            commands={[]}
            query="remote"
            shouldFilter={false}
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Async commands" });
    const result = within(dialog).getByRole("button", {
      name: "Remote result",
    });

    expect(result).toHaveAttribute("data-source", "async");
    expect(result.closest('[data-slot="command-palette"]')).toHaveAttribute(
      "data-mode",
      "dialog",
    );
  });

  it("keeps dialog mode named when CommandPaletteContent title is omitted", () => {
    render(
      <CommandPaletteDialog defaultOpen>
        <CommandPaletteTrigger>Open commands</CommandPaletteTrigger>
        <CommandPaletteContent>
          <CommandPalette
            label="Fallback named commands"
            commands={[{ key: "create", label: "Create project" }]}
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>,
    );

    expect(screen.getByRole("dialog", { name: "Command menu" })).toBeVisible();
  });

  it("navigates nested page commands without running terminal actions", async () => {
    const user = userEvent.setup();
    const openAlpha = vi.fn();
    const run = vi.fn();
    const pageStackChange = vi.fn();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          {
            key: "projects",
            label: "Projects",
            page: "projects",
            type: "page",
          },
          { key: "invite", label: "Invite teammate" },
        ]}
        pages={[
          {
            commands: [
              {
                action: openAlpha,
                key: "project-alpha",
                label: "Open Alpha",
              },
            ],
            description: "Project-specific commands",
            id: "projects",
            title: "Projects",
          },
        ]}
        onCommandRun={run}
        onPageStackChange={pageStackChange}
      />,
    );

    const input = screen.getByLabelText("Commands");
    const palette = input.closest('[data-slot="command-palette"]');

    await user.type(input, "proj");
    await user.click(screen.getByRole("button", { name: "Projects" }));

    expect(openAlpha).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
    expect(palette).toHaveAttribute("data-page", "projects");
    expect(palette).toHaveAttribute("data-page-depth", "1");
    expect(palette).toHaveAttribute("data-page-direction", "forward");
    expect(pageStackChange).toHaveBeenCalledWith(
      ["projects"],
      expect.objectContaining({
        activePage: "projects",
        direction: "forward",
        previousPage: undefined,
        reason: "push",
      }),
    );
    await waitFor(() => {
      const activePage = document.querySelector<HTMLElement>(
        '[data-slot="command-palette-page"][data-page="projects"]:not([aria-hidden="true"])',
      );

      expect(activePage).toBeInTheDocument();
      expect(
        within(activePage as HTMLElement).getByText(
          "Project-specific commands",
        ),
      ).toBeVisible();
      expect(
        within(activePage as HTMLElement).getByRole("button", {
          name: "Open Alpha",
        }),
      ).toHaveAttribute("data-source", "page");
    });
    expect(
      screen.queryByRole("button", { name: "Invite teammate" }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Open Alpha" }));

    expect(openAlpha).toHaveBeenCalledWith(
      expect.objectContaining({ key: "project-alpha", source: "page" }),
      expect.objectContaining({
        page: "projects",
        pageStack: ["projects"],
        query: "",
        source: "page",
      }),
    );
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ key: "project-alpha", source: "page" }),
      expect.objectContaining({
        page: "projects",
        pageStack: ["projects"],
        query: "",
        source: "page",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(palette).toHaveAttribute("data-page", "root");
    expect(palette).toHaveAttribute("data-page-depth", "0");
    expect(palette).toHaveAttribute("data-page-direction", "back");
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Invite teammate" }),
      ).toBeVisible();
    });
  });

  it("uses Escape to step back from nested dialog pages before closing", async () => {
    const user = userEvent.setup();

    render(
      <CommandPaletteDialog defaultOpen>
        <CommandPaletteTrigger>Open commands</CommandPaletteTrigger>
        <CommandPaletteContent title="Command menu">
          <CommandPalette
            label="Command menu"
            commands={[
              {
                key: "projects",
                label: "Projects",
                page: "projects",
                type: "page",
              },
            ]}
            pages={[
              {
                commands: [{ key: "alpha", label: "Open Alpha" }],
                id: "projects",
                title: "Projects",
              },
            ]}
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Command menu" });
    const input = within(dialog).getByRole("searchbox", {
      name: "Command menu",
    });

    await user.click(input);
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        within(dialog).getByRole("button", { name: "Back" }),
      ).toBeVisible();
      expect(
        within(dialog).getByRole("button", { name: "Open Alpha" }),
      ).toBeVisible();
    });

    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog", { name: "Command menu" })).toBeVisible();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Projects" })).toBeVisible();
      expect(screen.queryByRole("button", { name: "Open Alpha" })).toBeNull();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Command menu" })).toBeNull();
    });
  });

  it("supports controlled page stacks and page-specific empty states", async () => {
    const user = userEvent.setup();
    const pageStackChange = vi.fn();

    function ControlledPageStackExample() {
      const [stack, setStack] = useState(["projects"]);

      return (
        <>
          <CommandPalette
            label="Commands"
            pageStack={stack}
            onPageStackChange={(nextStack, context) => {
              pageStackChange(nextStack, context);
              setStack(nextStack);
            }}
            commands={[
              {
                key: "projects",
                label: "Projects",
                page: "projects",
                type: "page",
              },
            ]}
            pages={[
              {
                commands: [],
                emptyMessage: "No project commands.",
                id: "projects",
                title: "Projects",
              },
            ]}
          />
          <output>{stack.join("/") || "root"}</output>
        </>
      );
    }

    render(<ControlledPageStackExample />);

    expect(screen.getByText("projects")).toBeInTheDocument();
    expect(
      screen
        .getByText("No project commands.")
        .closest('[data-slot="command-palette-empty"]'),
    ).toHaveTextContent("No project commands.");

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(pageStackChange).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        activePage: undefined,
        direction: "back",
        previousPage: "projects",
        reason: "back",
      }),
    );
    expect(screen.getByText("root")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Projects" })).toBeVisible();
    });
  });

  it("renders page-specific error and retry states", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();

    render(
      <CommandPalette
        label="Commands"
        commands={[
          {
            key: "resources",
            label: "Resources",
            page: "resources",
            type: "page",
          },
        ]}
        pageStack={["resources"]}
        pages={[
          {
            commands: [],
            error: "Could not load resources.",
            id: "resources",
            onRetry: retry,
            retryLabel: "Retry resources",
            title: "Resources",
          },
        ]}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Could not load resources.",
    );

    await user.click(screen.getByRole("button", { name: "Retry resources" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("opens labelled dialog mode, focuses the search input, and closes on command run", async () => {
    const user = userEvent.setup();
    const run = vi.fn();

    render(
      <CommandPaletteDialog motionPreset="subtle" reducedMotion>
        <CommandPaletteTrigger className="custom-trigger">
          Open command menu
        </CommandPaletteTrigger>
        <CommandPaletteContent
          className="custom-content"
          overlayClassName="custom-overlay"
          title="Command menu"
          description="Run workspace commands"
        >
          <CommandPalette
            label="Command menu"
            commands={[{ key: "create", label: "Create project", action: run }]}
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>,
    );

    const trigger = screen.getByRole("button", { name: "Open command menu" });

    expect(trigger).toHaveAttribute("data-slot", "command-palette-trigger");
    expect(
      commandPaletteTriggerClassNames({ className: "custom-trigger" }),
    ).toContain("custom-trigger");
    expect(
      commandPaletteContentClassNames({ className: "custom-content" }),
    ).toContain("custom-content");

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "Command menu" });
    const input = within(dialog).getByRole("searchbox", {
      name: "Command menu",
    });
    const content = input.closest<HTMLElement>(
      '[data-slot="command-palette-content"]',
    );
    const palette = input.closest('[data-slot="command-palette"]');
    const overlay = dialog.closest<HTMLElement>('[data-slot="dialog-overlay"]');

    expect(input).toHaveFocus();
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-motion", "subtle");
    expect(content).toHaveAttribute("data-reduced-motion", "true");
    expect(palette).toHaveAttribute("data-mode", "dialog");
    expect(palette).toHaveAttribute("data-motion", "subtle");
    expect(palette).toHaveAttribute("data-reduced-motion", "true");
    expect(palette).toHaveClass("border-0");
    expect(overlay).toHaveAttribute("data-motion", "subtle");
    expect(overlay).toHaveAttribute("data-reduced-motion", "true");
    expect(overlay).toHaveClass("custom-overlay");

    await user.click(screen.getByRole("button", { name: "Create project" }));

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ key: "create" }),
      expect.objectContaining({ query: "", source: "base" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Command menu" })).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it("supports controlled dialog open state and Escape close", async () => {
    const user = userEvent.setup();

    function ControlledCommandPaletteDialog() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <CommandPaletteDialog open={open} onOpenChange={setOpen}>
            <CommandPaletteTrigger>
              Open controlled commands
            </CommandPaletteTrigger>
            <CommandPaletteContent title="Controlled commands">
              <CommandPalette
                label="Controlled commands"
                commands={[{ key: "search", label: "Search records" }]}
              />
            </CommandPaletteContent>
          </CommandPaletteDialog>
          <output>{open ? "open" : "closed"}</output>
        </>
      );
    }

    render(<ControlledCommandPaletteDialog />);

    await user.click(
      screen.getByRole("button", { name: "Open controlled commands" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Controlled commands" }),
    ).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Controlled commands" }),
      ).toBeNull();
    });
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("can keep dialog mode open when closeOnRun is disabled", async () => {
    const user = userEvent.setup();
    const run = vi.fn();

    render(
      <CommandPaletteDialog defaultOpen closeOnRun={false}>
        <CommandPaletteTrigger>Open persistent commands</CommandPaletteTrigger>
        <CommandPaletteContent title="Persistent commands">
          <CommandPalette
            label="Persistent commands"
            commands={[
              { key: "pin", label: "Pin command", action: run },
              {
                key: "close",
                label: "Close command",
                action: run,
                closeOnRun: true,
              },
            ]}
          />
        </CommandPaletteContent>
      </CommandPaletteDialog>,
    );

    await user.click(screen.getByRole("button", { name: "Pin command" }));

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ key: "pin" }),
      expect.objectContaining({ closeOnRun: false, query: "", source: "base" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Persistent commands" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close command" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Persistent commands" }),
      ).toBeNull();
    });
  });
});
