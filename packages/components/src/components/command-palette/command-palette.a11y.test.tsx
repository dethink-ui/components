import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
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
  CommandPaletteTrigger,
} from ".";

expect.extend(toHaveNoViolations);

describe("CommandPalette accessibility", () => {
  it("has no axe violations for labelled inline commands", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <CommandPalette
          label="Command menu"
          commands={[
            { key: "create", label: "Create project", action: () => undefined },
            { key: "settings", label: "Open settings", href: "/settings" },
          ]}
        />
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for custom rows, disabled reasons, and destructive commands", async () => {
    const { container } = render(
      <DethinkProvider theme="dark">
        <CommandPalette aria-label="Workspace commands">
          <CommandPaletteInput placeholder="Search workspace commands" />
          <CommandPaletteList>
            <CommandPaletteGroup heading="Actions">
              <CommandPaletteItem value="invite">
                <span aria-hidden="true" />
                <span>
                  <CommandPaletteItemLabel>Invite teammate</CommandPaletteItemLabel>
                  <CommandPaletteItemDescription>
                    Send a workspace invitation
                  </CommandPaletteItemDescription>
                </span>
                <CommandPaletteItemShortcut>G I</CommandPaletteItemShortcut>
              </CommandPaletteItem>
              <CommandPaletteItem
                destructive
                disabled
                disabledReason="Requires owner access"
                value="delete"
              >
                Delete workspace
              </CommandPaletteItem>
            </CommandPaletteGroup>
          </CommandPaletteList>
        </CommandPalette>
      </DethinkProvider>,
    );

    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for empty search results", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
        <CommandPalette
          label="Command menu"
          commands={[{ key: "create", label: "Create project" }]}
        />
      </DethinkProvider>,
    );

    await user.type(screen.getByLabelText("Command menu"), "missing");

    expect(screen.getByRole("status")).toHaveTextContent("No commands found.");
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for labelled dialog mode", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <CommandPaletteDialog defaultOpen>
          <CommandPaletteTrigger>Open command menu</CommandPaletteTrigger>
          <CommandPaletteContent
            title="Command menu"
            description="Run workspace commands"
          >
            <CommandPalette
              label="Command menu"
              commands={[
                { key: "create", label: "Create project", action: () => undefined },
                { key: "settings", label: "Open settings", href: "/settings" },
              ]}
            />
          </CommandPaletteContent>
        </CommandPaletteDialog>
      </DethinkProvider>,
    );

    expect(screen.getByRole("dialog", { name: "Command menu" })).toBeVisible();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("manages dialog focus and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <DethinkProvider theme="light">
        <CommandPaletteDialog>
          <CommandPaletteTrigger>Open command menu</CommandPaletteTrigger>
          <CommandPaletteContent title="Command menu">
            <CommandPalette
              label="Dialog commands"
              commands={[
                { key: "create", label: "Create project", action: () => undefined },
                { key: "settings", label: "Open settings", href: "/settings" },
              ]}
            />
          </CommandPaletteContent>
        </CommandPaletteDialog>
      </DethinkProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Open command menu" });

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "Command menu" });

    expect(within(dialog).getByLabelText("Dialog commands")).toHaveFocus();
    await expect(axe(document.body)).resolves.toHaveNoViolations();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Command menu" })).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it("has no axe violations for async states and retry controls", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
        <CommandPalette
          label="Async commands"
          commands={[]}
          asyncCommands={[
            {
              disabled: true,
              disabledReason: "Requires project access",
              key: "remote-disabled",
              label: "Remote disabled command",
            },
          ]}
          query="remote"
          error="Could not load more commands."
          onRetry={() => undefined}
          retryLabel="Retry command search"
          shouldFilter={false}
        />
      </DethinkProvider>,
    );

    expect(
      screen.getByRole("button", { name: /Remote disabled command/ }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Retry command search" }),
    ).toBeVisible();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("has no axe violations for nested page headers and back controls", async () => {
    const { container } = render(
      <DethinkProvider theme="light">
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
          pageStack={["projects"]}
          pages={[
            {
              commands: [{ key: "alpha", label: "Open Alpha" }],
              description: "Project-specific commands",
              id: "projects",
              title: "Projects",
            },
          ]}
        />
      </DethinkProvider>,
    );

    expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Open Alpha" })).toBeVisible();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("announces selection and nested page changes through a polite live region", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DethinkProvider theme="light">
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
      </DethinkProvider>,
    );

    await waitFor(() => {
      const announcer = container.querySelector(
        '[data-slot="command-palette-announcer"]',
      );

      expect(announcer).toHaveAttribute("aria-live", "polite");
      expect(announcer).toHaveAttribute("aria-atomic", "true");
      expect(announcer).toHaveTextContent("Selected Projects.");
    });

    await user.click(screen.getByRole("button", { name: "Projects" }));

    await waitFor(() => {
      const announcer = container.querySelector(
        '[data-slot="command-palette-announcer"]',
      );

      expect(announcer).toHaveTextContent("Opened Projects.");
      expect(announcer).toHaveTextContent("Selected Open Alpha");
    });
  });
});
