import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  useFilterState,
} from ".";
import { queryFields } from "./filter-query.fixtures";
import { SavedViewsMenu, type SavedViewsMenuProps } from "./saved-views-menu";
import { useSavedViews, type SavedView } from "./use-saved-views";

const views: SavedView[] = [
  {
    id: "mine",
    name: "My open",
    version: 1,
    scope: "personal",
    filter: createFilter({
      children: [
        createFilterCondition({
          id: "open",
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        }),
      ],
    }),
  },
  {
    id: "bugs",
    name: "Team bugs",
    version: 1,
    scope: "team",
    filter: createFilter({
      children: [
        createFilterCondition({
          id: "bug",
          field: "labels",
          operator: "includesAny",
          value: ["bug"],
        }),
      ],
    }),
  },
];

function Harness(props: Partial<SavedViewsMenuProps>) {
  const [list, setList] = useState(views);
  const state = useFilterState();
  const savedViews = useSavedViews({
    state,
    fields: queryFields,
    views: list,
    createId: () => "new-view",
    onCreate: (view) => setList((current) => [...current, view]),
    onUpdate: (view) =>
      setList((current) =>
        current.map((item) => (item.id === view.id ? view : item)),
      ),
    onDelete: (view) =>
      setList((current) => current.filter((item) => item.id !== view.id)),
  });

  return (
    <>
      <SavedViewsMenu savedViews={savedViews} {...props} />
      <FilterBar fields={queryFields} state={state} />
    </>
  );
}

const trigger = (name: RegExp | string) => screen.getByRole("button", { name });

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    document.querySelector('[data-slot="saved-views-trigger"]') as HTMLElement,
  );

  return screen.findByRole("dialog", { name: "Saved views" });
}

describe("SavedViewsMenu", () => {
  it("lists views by scope and applies one", async () => {
    const user = userEvent.setup();

    render(<Harness />);

    const dialog = await openMenu(user);

    expect(
      within(dialog).getByRole("heading", { name: "Personal" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: "Team" }),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "Apply view Team bugs" }),
    );

    expect(trigger("Team bugs")).toHaveFocus();
    expect(
      screen.getByRole("group", { name: "Labels includes Bug" }),
    ).toBeInTheDocument();
  });

  it("marks the view edited and saves changes", async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(
      within(await openMenu(user)).getByRole("button", {
        name: "Apply view My open",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Remove filter, Status is Open" }),
    );

    expect(trigger("My open, edited")).toHaveAttribute("data-dirty");

    const dialog = await openMenu(user);

    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );
    expect(trigger("My open")).not.toHaveAttribute("data-dirty");

    const reopened = await openMenu(user);

    expect(
      within(reopened).getByRole("button", { name: "Save changes" }),
    ).toBeDisabled();
  });

  it("saves the filter as a new view with a scope", async () => {
    const user = userEvent.setup();

    render(<Harness scopes={["personal", "team"]} />);

    const dialog = await openMenu(user);

    await user.click(
      within(dialog).getByRole("button", { name: "Save as new view" }),
    );

    const name = within(dialog).getByRole("textbox", { name: "View name" });

    expect(name).toHaveFocus();
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeDisabled();
    await user.type(name, "Shared");
    await user.click(within(dialog).getByRole("radio", { name: "Team" }));
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(trigger("Shared")).toHaveFocus();

    const reopened = await openMenu(user);
    const team = within(reopened)
      .getByRole("heading", { name: "Team" })
      .closest("section") as HTMLElement;

    expect(
      within(team).getByRole("button", { name: "Apply view Shared" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("renames with Enter and cancels with Escape", async () => {
    const user = userEvent.setup();

    render(<Harness />);

    const dialog = await openMenu(user);

    await user.click(
      within(dialog).getByRole("button", { name: "Rename view My open" }),
    );

    const input = within(dialog).getByRole("textbox", {
      name: "Rename view My open",
    });

    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, "Mine{Enter}");

    expect(
      within(dialog).getByRole("button", { name: "Apply view Mine" }),
    ).toHaveFocus();

    await user.click(
      within(dialog).getByRole("button", { name: "Rename view Mine" }),
    );
    await user.keyboard("x{Escape}");
    expect(
      within(dialog).getByRole("button", { name: "Apply view Mine" }),
    ).toHaveFocus();
    expect(screen.getByRole("dialog", { name: "Saved views" })).toBeVisible();
  });

  it("deletes a view after confirming", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);

    const dialog = await openMenu(user);

    await user.click(
      within(dialog).getByRole("button", { name: "Delete view Team bugs" }),
    );

    const confirm = within(dialog).getByRole("group", {
      name: 'Delete "Team bugs"?',
    });

    await user.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(
      within(dialog).getByRole("button", { name: "Delete view Team bugs" }),
    ).toHaveFocus();

    await user.click(
      within(dialog).getByRole("button", { name: "Delete view Team bugs" }),
    );
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(
      within(dialog).queryByRole("button", { name: /Team bugs/ }),
    ).toBeNull();
    expect(container).toBeTruthy();
  });

  it("shows an empty state and leaves a view without changing the filter", async () => {
    const user = userEvent.setup();
    const onActive = vi.fn();

    function Empty() {
      const state = useFilterState();
      const savedViews = useSavedViews({
        state,
        fields: queryFields,
        views: [],
        onActiveViewChange: onActive,
      });

      return <SavedViewsMenu savedViews={savedViews} />;
    }

    render(<Empty />);

    const dialog = await openMenu(user);

    expect(dialog).toHaveTextContent("No saved views yet.");
    expect(
      within(dialog).queryByRole("button", { name: "Save changes" }),
    ).toBeNull();
    expect(onActive).not.toHaveBeenCalled();
  });
});
