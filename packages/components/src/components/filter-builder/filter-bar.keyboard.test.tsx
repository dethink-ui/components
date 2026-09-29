import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterBar, createFilter, createFilterCondition } from ".";
import { fields, statusFilter, toolbar } from "./filter-bar.fixtures";

describe("FilterBar keyboard and focus", () => {
  it("keeps a single tab stop and moves between segments with arrow keys", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} defaultValue={statusFilter()} />);

    const items = within(toolbar()).getAllByRole("button");

    expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1);

    await user.tab();

    expect(
      screen.getByRole("button", { name: "Change field, Status" }),
    ).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("button", { name: "Change operator, is any of" }),
    ).toHaveFocus();

    await user.keyboard("{End}");

    expect(screen.getByRole("button", { name: "Clear" })).toHaveFocus();

    await user.keyboard("{Home}");

    expect(
      screen.getByRole("button", { name: "Change field, Status" }),
    ).toHaveFocus();
    expect(
      within(toolbar())
        .getAllByRole("button")
        .filter((item) => item.tabIndex === 0),
    ).toEqual([screen.getByRole("button", { name: "Change field, Status" })]);
  });

  it("removes the focused chip with Backspace and moves focus to the next chip", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} defaultValue={statusFilter()} />);

    await user.tab();
    await user.keyboard("{Backspace}");

    expect(screen.queryByRole("group", { name: /Status/ })).toBeNull();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Change field, Title" }),
      ).toHaveFocus();
    });

    await user.keyboard("{Control>}z{/Control}");

    expect(
      screen.getByRole("group", { name: "Status is any of Open, Blocked" }),
    ).toBeInTheDocument();
  });

  it("opens the add menu from the optional shortcut outside text fields", async () => {
    const user = userEvent.setup();

    render(
      <>
        <input aria-label="Elsewhere" />
        <FilterBar fields={fields} addShortcut="f" />
      </>,
    );

    await user.click(screen.getByRole("textbox", { name: "Elsewhere" }));
    await user.keyboard("f");

    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(document.body);
    await user.keyboard("f");

    expect(
      await screen.findByRole("dialog", { name: "Add a filter" }),
    ).toBeInTheDocument();
  });

  it("moves focus to a neighbour after removing a group chip", async () => {
    const user = userEvent.setup();

    render(
      <FilterBar
        fields={fields}
        defaultValue={createFilter({
          children: [
            createFilter({
              combinator: "or",
              children: [
                createFilterCondition({
                  field: "status",
                  operator: "isAnyOf",
                  value: ["open"],
                }),
                createFilterCondition({ field: "title", operator: "isEmpty" }),
              ],
            }),
            createFilterCondition({
              field: "title",
              operator: "contains",
              value: "api",
            }),
          ],
        })}
      />,
    );

    await user.tab();

    expect(
      screen.getByRole("button", {
        name: "Edit group, Status is Open, or Title is empty",
      }),
    ).toHaveFocus();

    await user.keyboard("{Delete}");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Change field, Title" }),
      ).toHaveFocus();
    });

    await user.keyboard("{Control>}z{/Control}");

    expect(
      screen.getByRole("group", { name: "Status is Open, or Title is empty" }),
    ).toBeInTheDocument();
  });

  it("keeps collapsed chips out of the tab order and re-syncs on resize", () => {
    let hideOverflow = true;
    let onResize: (() => void) | undefined;
    // jsdom has no checkVisibility, so define one that hides collapsed chips.
    Object.defineProperty(HTMLElement.prototype, "checkVisibility", {
      configurable: true,
      value(this: HTMLElement) {
        return !(hideOverflow && this.closest("[data-overflow]"));
      },
    });

    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          onResize = callback;
        }
        observe() {}
        disconnect() {}
      },
    );

    render(
      <FilterBar
        fields={fields}
        collapseAfter={1}
        defaultValue={statusFilter()}
      />,
    );

    const hidden = within(
      screen.getByRole("group", { name: 'Title contains "api"' }),
    ).getAllByRole("button");
    const tabStops = () =>
      within(toolbar())
        .getAllByRole("button")
        .filter((item) => item.tabIndex === 0);

    expect(hidden.every((item) => item.tabIndex === -1)).toBe(true);
    expect(tabStops()).toHaveLength(1);

    // Widening the container reveals the chips without a React render.
    hideOverflow = false;
    onResize?.();

    expect(tabStops()).toHaveLength(1);

    delete (HTMLElement.prototype as Partial<HTMLElement>).checkVisibility;
    vi.unstubAllGlobals();
  });

  it("keeps focus in the toolbar when undo removes the focused control", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} defaultValue={statusFilter()} />);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await user.tab({ shift: true });
    await user.tab();
    await user.keyboard("{ArrowRight}");

    const undo = screen.getByRole("button", { name: "Undo filter change" });

    expect(undo).toHaveFocus();

    // Undo restores the chips and hides its own button.
    await user.keyboard("{Enter}");

    expect(
      screen.queryByRole("button", { name: "Undo filter change" }),
    ).toBeNull();
    expect(toolbar()).toContainElement(document.activeElement as HTMLElement);

    // Keyboard handling still works, so redo clears again.
    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");

    expect(screen.queryByRole("group")).toBeNull();
  });

  it("keeps focus in the toolbar when undo removes a focused chip", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} />);

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(await screen.findByRole("option", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Open" }));
    await user.keyboard("{Escape}");

    // Let the add menu return focus to its trigger before moving to the chip.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Filter" })).toHaveFocus();
    });
    await user.keyboard("{Home}");

    expect(
      screen.getByRole("button", { name: "Change field, Status" }),
    ).toHaveFocus();

    await user.keyboard("{Control>}z{/Control}");

    // Checked right away: focus must never drop to the body in between.
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByRole("button", { name: "Add filter" })).toHaveFocus();
  });
});
