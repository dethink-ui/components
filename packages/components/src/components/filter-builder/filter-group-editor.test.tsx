import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  FilterBarChips,
  FilterGroupEditor,
  createFilter,
  createFilterCondition,
  type Filter,
} from ".";
import { fields } from "./filter-bar.fixtures";

function grouped(): Filter {
  return createFilter({
    id: "root",
    children: [
      createFilterCondition({
        id: "status",
        field: "status",
        operator: "isAnyOf",
        value: ["open"],
      }),
      createFilter({
        id: "labels",
        combinator: "or",
        children: [
          createFilterCondition({
            id: "bug",
            field: "labels",
            operator: "includesAny",
            value: ["bug"],
          }),
          createFilterCondition({
            id: "title",
            field: "title",
            operator: "contains",
            value: "api",
          }),
        ],
      }),
    ],
  });
}

const groupSentence = 'Labels includes Bug, or Title contains "api"';

async function openAdvanced(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Advanced" }));

  return screen.findByRole("dialog", { name: "Edit filter groups" });
}

describe("FilterGroupEditor", () => {
  it("opens a group chip's editor and changes its combinator in one undo step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={grouped()}
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: `Edit group, ${groupSentence}` }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: `Edit group, ${groupSentence}`,
    });
    const combinator = within(dialog).getByRole("combobox", {
      name: "Match of the following",
    });

    expect(combinator).toHaveValue("or");
    // The edited group itself is removed from the bar, not from its editor.
    expect(
      within(dialog).queryByRole("button", { name: /^Ungroup/ }),
    ).toBeNull();

    await user.selectOptions(combinator, "and");

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        children: [
          expect.anything(),
          expect.objectContaining({ id: "labels", combinator: "and" }),
        ],
      }),
    );

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await user.click(
      screen.getByRole("button", { name: "Undo filter change" }),
    );

    expect(
      screen.getByRole("group", { name: groupSentence }),
    ).toBeInTheDocument();
  });

  it("adds a group and a condition inside it from the advanced editor", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={grouped()}
        onValueChange={onValueChange}
      />,
    );

    const dialog = await openAdvanced(user);
    const rootGroup = within(dialog).getByRole("group", {
      name: "Edit filter groups",
    });
    const addGroupButtons = within(rootGroup).getAllByRole("button", {
      name: "Group",
    });

    // The last "Group" button belongs to the root group.
    await user.click(addGroupButtons.at(-1)!);

    const emptyGroup = await within(dialog).findByRole("group", {
      name: "Edit group, Empty group",
    });
    const addCondition = within(emptyGroup).getByRole("button", {
      name: "Condition",
    });

    await waitFor(() => {
      expect(addCondition).toHaveFocus();
    });

    await user.click(addCondition);
    await user.click(await screen.findByRole("option", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Done" }));
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          children: [
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
              type: "group",
              children: [
                expect.objectContaining({
                  field: "status",
                  value: ["done"],
                }),
              ],
            }),
          ],
        }),
      );
    });
  });

  it("wraps, moves, negates and ungroups nodes, each as one undo step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={grouped()}
        onValueChange={onValueChange}
      />,
    );

    const dialog = await openAdvanced(user);
    const last = () => onValueChange.mock.lastCall?.[0];

    await user.click(
      within(dialog).getByRole("button", {
        name: "Wrap in group, Status is Open",
      }),
    );
    expect(last()?.children[0]).toMatchObject({
      type: "group",
      children: [{ id: "status" }],
    });

    await user.keyboard("{Control>}z{/Control}");
    expect(last()?.children[0]).toMatchObject({ id: "status" });

    const moveDown = within(dialog).getByRole("button", {
      name: "Move down, Status is Open",
    });

    await user.click(moveDown);
    expect(last()?.children.map((child) => child.id)).toEqual([
      "labels",
      "status",
    ]);
    // Now last, so Move down is disabled and focus moves to Move up.
    await waitFor(() => {
      expect(
        within(dialog).getByRole("button", {
          name: "Move up, Status is Open",
        }),
      ).toHaveFocus();
    });

    await user.click(
      within(dialog).getByRole("button", { name: "Not, Status is Open" }),
    );
    expect(last()?.children[1]).toMatchObject({ id: "status", not: true });
    expect(
      within(dialog).getByRole("button", { name: "Not, not (Status is Open)" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(
      within(dialog).getByRole("button", { name: `Ungroup, ${groupSentence}` }),
    );
    expect(last()?.children.map((child) => child.id)).toEqual([
      "bug",
      "title",
      "status",
    ]);

    await user.keyboard("{Control>}z{/Control}");
    expect(last()?.children.map((child) => child.id)).toEqual([
      "labels",
      "status",
    ]);
  });

  it("moves the focused row with Alt+Arrow keys and keeps focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={grouped()}
        onValueChange={onValueChange}
      />,
    );

    const dialog = await openAdvanced(user);
    const field = within(dialog).getByRole("button", {
      name: "Change field, Title",
    });

    field.focus();
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");

    const labels = onValueChange.mock.lastCall?.[0].children[1];

    expect(
      labels?.type === "group" && labels.children.map((child) => child.id),
    ).toEqual(["title", "bug"]);
    await waitFor(() => {
      expect(
        within(dialog).getByRole("button", { name: "Change field, Title" }),
      ).toHaveFocus();
    });
  });

  it("removes only the condition when Backspace is pressed on a chip inside the editor", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={grouped()}
        onValueChange={onValueChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: `Edit group, ${groupSentence}` }),
    );

    const dialog = await screen.findByRole("dialog");

    within(dialog).getByRole("button", { name: "Change field, Title" }).focus();
    await user.keyboard("{Backspace}");

    const labels = onValueChange.mock.lastCall?.[0].children[1];

    expect(labels).toMatchObject({ id: "labels", children: [{ id: "bug" }] });
  });

  it("keeps the group editor open while a nested text value editor is used", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={grouped()}
        onValueChange={onValueChange}
      />,
    );

    const dialog = await openAdvanced(user);

    await user.click(
      within(dialog).getByRole("button", { name: 'Change value, "api"' }),
    );

    const input = await screen.findByRole("textbox", { name: "Title value" });

    expect(
      screen.getByRole("dialog", { name: "Edit filter groups", hidden: true }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    await user.clear(input);
    await user.type(input, "latency{Enter}");

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        children: [
          expect.anything(),
          expect.objectContaining({
            children: [
              expect.anything(),
              expect.objectContaining({ id: "title", value: "latency" }),
            ],
          }),
        ],
      }),
    );
    // Enter closes only the value editor; the group editor stays open.
    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: "Title value" })).toBeNull();
    });
    expect(
      screen.getByRole("dialog", { name: "Edit filter groups" }),
    ).toBeInTheDocument();
  });

  it("keeps edits from the bar and an inline editor as separate undo steps", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <FilterBar
        fields={fields}
        defaultValue={createFilter({
          id: "root",
          children: [
            createFilterCondition({
              id: "title",
              field: "title",
              operator: "contains",
              value: "api",
            }),
          ],
        })}
        onValueChange={onValueChange}
      >
        <FilterBarChips />
        <FilterGroupEditor />
      </FilterBar>,
    );

    const title = () =>
      (onValueChange.mock.lastCall?.[0].children[0] as { value?: string })
        .value;
    const edit = async (index: number, value: string) => {
      await user.click(
        screen.getAllByRole("button", { name: /^Change value/ })[index]!,
      );

      const input = await screen.findByRole("textbox", {
        name: "Title value",
      });

      await user.clear(input);
      await user.type(input, `${value}{Enter}`);
      await waitFor(() => {
        expect(
          screen.queryByRole("textbox", { name: "Title value" }),
        ).toBeNull();
      });
    };

    await edit(0, "one");
    expect(title()).toBe("one");
    await edit(1, "two");
    expect(title()).toBe("two");

    await user.keyboard("{Control>}z{/Control}");

    expect(title()).toBe("one");
  });

  it("applies the depth limit to adding and wrapping groups", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} defaultValue={grouped()} maxDepth={2} />);

    const dialog = await openAdvanced(user);
    const nested = within(dialog).getByRole("group", {
      name: `Edit group, ${groupSentence}`,
    });

    expect(
      within(nested).getByRole("button", { name: "Group" }),
    ).toBeDisabled();
    expect(
      within(nested).getByRole("button", {
        name: "Wrap in group, Labels includes Bug",
      }),
    ).toBeDisabled();
    expect(
      within(dialog).getByRole("button", {
        name: "Wrap in group, Status is Open",
      }),
    ).toBeEnabled();
    expect(
      within(dialog).getByRole("button", {
        name: `Wrap in group, ${groupSentence}`,
      }),
    ).toBeDisabled();
  });

  it("renders standalone inside a custom FilterBar composition", () => {
    render(
      <FilterBar fields={fields} defaultValue={grouped()}>
        <FilterBarChips />
        <FilterGroupEditor groupId="labels" />
      </FilterBar>,
    );

    expect(
      screen.getByRole("group", { name: `Edit group, ${groupSentence}` }),
    ).toHaveAttribute("data-slot", "filter-group");
    expect(
      document.querySelector('[data-slot="filter-group-editor"]'),
    ).toHaveAttribute("data-filter-focus-scope");

    // Inline editor controls keep their own tab order, apart from the
    // toolbar's single tab stop.
    const editor = document.querySelector<HTMLElement>(
      '[data-slot="filter-group-editor"]',
    )!;

    expect(
      within(editor)
        .getAllByRole("button")
        .filter((button) => button.tabIndex === -1),
    ).toEqual([]);
  });
});
