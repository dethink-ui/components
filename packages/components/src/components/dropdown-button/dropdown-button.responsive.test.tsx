import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { DropdownMenuItem } from "../dropdown-menu";
import { DropdownButton } from ".";

type ActionId = "preview" | "share" | "export" | "archive";

interface ActionDefinition {
  destructive?: boolean;
  disabled?: boolean;
  id: ActionId;
  label: string;
  run: () => void;
}

const primaryActionIds = new Set<ActionId>(["preview", "share"]);

function createActions(onAction: (id: ActionId) => void): ActionDefinition[] {
  return [
    { id: "preview", label: "Preview", run: () => onAction("preview") },
    { id: "share", label: "Share", run: () => onAction("share") },
    {
      disabled: true,
      id: "export",
      label: "Export pending approval",
      run: () => onAction("export"),
    },
    {
      destructive: true,
      id: "archive",
      label: "Archive",
      run: () => onAction("archive"),
    },
  ];
}

function ResponsiveActionRecipe({ actions }: { actions: ActionDefinition[] }) {
  return (
    <div className="@container">
      <div data-layout="wide" className="hidden @min-3xl:flex">
        <ButtonGroup aria-label="Wide report actions">
          {actions.map((action) => (
            <Button
              key={action.id}
              data-action-id={action.id}
              disabled={action.disabled}
              onClick={action.run}
              variant={action.destructive ? "destructive" : "outline"}
            >
              {action.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div data-layout="narrow" className="flex @min-3xl:hidden">
        <ButtonGroup aria-label="Narrow report actions" mode="separated">
          {actions
            .filter((action) => primaryActionIds.has(action.id))
            .map((action) => (
              <Button
                key={action.id}
                data-action-id={action.id}
                disabled={action.disabled}
                onClick={action.run}
                variant="outline"
              >
                {action.label}
              </Button>
            ))}
          <DropdownButton label="More report actions" size="sm">
            {actions
              .filter((action) => !primaryActionIds.has(action.id))
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  data-action-id={action.id}
                  destructive={action.destructive}
                  disabled={action.disabled}
                  onAction={action.run}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
          </DropdownButton>
        </ButtonGroup>
      </div>
    </div>
  );
}

describe("DropdownButton responsive action recipe", () => {
  it("preserves action identity and policy across wide and narrow layouts", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn<(id: ActionId) => void>();
    const actions = createActions(onAction);

    render(<ResponsiveActionRecipe actions={actions} />);

    const wide = within(
      document.querySelector<HTMLElement>('[data-layout="wide"]')!,
    );
    const narrow = within(
      document.querySelector<HTMLElement>('[data-layout="narrow"]')!,
    );

    expect(wide.getByRole("button", { name: "Preview" })).toHaveAttribute(
      "data-action-id",
      "preview",
    );
    expect(narrow.getByRole("button", { name: "Preview" })).toHaveAttribute(
      "data-action-id",
      "preview",
    );
    expect(
      wide.getByRole("button", { name: "Export pending approval" }),
    ).toBeDisabled();
    expect(wide.getByRole("button", { name: "Archive" })).toHaveAttribute(
      "data-variant",
      "destructive",
    );

    await user.click(wide.getByRole("button", { name: "Archive" }));
    expect(onAction).toHaveBeenLastCalledWith("archive");

    await user.click(
      narrow.getByRole("button", { name: "More report actions" }),
    );

    const disabledExport = await screen.findByRole("menuitem", {
      name: "Export pending approval",
    });
    const narrowArchive = screen.getByRole("menuitem", { name: "Archive" });

    expect(disabledExport).toHaveAttribute("data-action-id", "export");
    expect(disabledExport).toHaveAttribute("data-disabled");
    expect(narrowArchive).toHaveAttribute("data-action-id", "archive");
    expect(narrowArchive).toHaveAttribute("data-destructive");

    await user.click(narrowArchive);
    expect(onAction).toHaveBeenNthCalledWith(2, "archive");
    expect(onAction).toHaveBeenCalledTimes(2);
  });
});
