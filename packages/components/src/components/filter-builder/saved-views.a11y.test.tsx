import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { DethinkProvider } from "../../foundation/dethink-provider";
import { createFilter, useFilterState } from ".";
import { queryFields } from "./filter-query.fixtures";
import { SavedViewsMenu } from "./saved-views-menu";
import { useSavedViews, type SavedView } from "./use-saved-views";

expect.extend(toHaveNoViolations);

const views: SavedView[] = [
  {
    id: "a",
    name: "Mine",
    version: 1,
    scope: "personal",
    filter: createFilter(),
  },
  { id: "b", name: "Team", version: 1, scope: "team", filter: createFilter() },
  { id: "c", name: "Loose", version: 1, filter: createFilter() },
];

function Menu() {
  const state = useFilterState();
  const savedViews = useSavedViews({ state, fields: queryFields, views });

  return (
    <SavedViewsMenu savedViews={savedViews} scopes={["personal", "team"]} />
  );
}

async function setup() {
  const user = userEvent.setup();
  const { container } = render(
    <DethinkProvider>
      <Menu />
    </DethinkProvider>,
  );

  return { container, user };
}

describe("SavedViewsMenu accessibility", () => {
  it("has no axe violations closed and open", async () => {
    const { container, user } = await setup();

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "Views" }));
    await screen.findByRole("dialog", { name: "Saved views" });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("has no axe violations while renaming, confirming and saving as", async () => {
    const { user } = await setup();

    await user.click(screen.getByRole("button", { name: "Views" }));

    const dialog = await screen.findByRole("dialog", { name: "Saved views" });

    await user.click(
      within(dialog).getByRole("button", { name: "Rename view Mine" }),
    );
    expect(await axe(document.body)).toHaveNoViolations();
    await user.keyboard("{Escape}");

    await user.click(
      within(dialog).getByRole("button", { name: "Delete view Team" }),
    );
    expect(await axe(document.body)).toHaveNoViolations();

    await user.click(
      within(dialog).getByRole("button", { name: "Save as new view" }),
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
