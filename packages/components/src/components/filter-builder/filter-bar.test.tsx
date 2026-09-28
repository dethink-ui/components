import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FilterAddMenu,
  FilterBar,
  FilterBarChips,
  createFilter,
  createFilterCondition,
  type Filter,
} from ".";
import { fields, statusFilter, toolbar } from "./filter-bar.fixtures";

describe("FilterBar", () => {
  it("renders each condition as a sentence with editable segments", () => {
    render(<FilterBar fields={fields} defaultValue={statusFilter()} />);

    const chip = screen.getByRole("group", {
      name: "Status is any of Open, Blocked",
    });

    expect(chip).toHaveAttribute("data-slot", "filter-chip");
    expect(
      within(chip).getByRole("button", { name: "Change field, Status" }),
    ).toHaveAttribute("aria-haspopup", "dialog");
    expect(
      within(chip).getByRole("button", { name: "Change operator, is any of" }),
    ).toBeInTheDocument();
    expect(
      within(chip).getByRole("button", { name: "Change value, Open, Blocked" }),
    ).toBeInTheDocument();
    expect(
      within(chip).getByRole("button", {
        name: "Remove filter, Status is any of Open, Blocked",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: 'Title contains "api"' }),
    ).toBeInTheDocument();
    expect(toolbar()).toHaveAccessibleDescription(
      'Status is any of Open, Blocked, and Title contains "api"',
    );
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });

  it("adds an option filter through field then value, undoable in one step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(<FilterBar fields={fields} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(await screen.findByRole("option", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Open" }));

    // The open editor hides the page from assistive tech, so query hidden.
    expect(
      screen.getByRole("group", { name: "Status is Open", hidden: true }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Blocked" }));
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("group", { name: "Status is any of Open, Blocked" }),
    ).toBeInTheDocument();
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        children: [
          expect.objectContaining({
            field: "status",
            operator: "isAnyOf",
            value: ["open", "blocked"],
          }),
        ],
      }),
    );

    await user.click(
      screen.getByRole("button", { name: "Undo filter change" }),
    );

    expect(screen.queryByRole("group", { name: /Status/ })).toBeNull();
  });

  it("adds a text filter and closes on Enter", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} />);

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(await screen.findByRole("option", { name: "Title" }));
    await user.type(
      await screen.findByRole("textbox", { name: "Title value" }),
      "latency{Enter}",
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("group", { name: 'Title contains "latency"' }),
    ).toBeInTheDocument();
  });

  it("adds nothing when the add menu closes without a value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<FilterBar fields={fields} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(await screen.findByRole("option", { name: "Labels" }));
    await user.click(
      await screen.findByRole("button", { name: "Back to fields" }),
    );

    expect(
      await screen.findByRole("option", { name: "Status" }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("filters the field list by search text", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} />);

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.type(
      await screen.findByRole("searchbox", { name: "Filter by…" }),
      "lab",
    );

    expect(screen.getByRole("option", { name: "Labels" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Status" })).toBeNull();
  });

  it("changes operator and field from chip segments", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} defaultValue={statusFilter(["open"])} />);

    await user.click(
      screen.getByRole("button", { name: "Change operator, is" }),
    );
    await user.click(await screen.findByRole("option", { name: "is not" }));

    expect(
      await screen.findByRole("group", { name: "Status is not Open" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Change field, Status" }),
    );
    await user.click(await screen.findByRole("option", { name: "Labels" }));

    // Changing the field resets the operator and moves on to the value.
    expect(
      await screen.findByRole("option", { name: "Bug" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Bug" }));
    await user.keyboard("{Escape}");

    expect(
      await screen.findByRole("group", { name: "Labels includes Bug" }),
    ).toBeInTheDocument();
  });

  it("removes chips with the remove button and clears all", async () => {
    const user = userEvent.setup();

    render(<FilterBar fields={fields} defaultValue={statusFilter()} />);

    await user.click(
      screen.getByRole("button", {
        name: 'Remove filter, Title contains "api"',
      }),
    );

    expect(screen.queryByRole("group", { name: /Title/ })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add filter" })).toHaveFocus();
    });
  });

  it("supports controlled values", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [value, setValue] = useState(statusFilter());

      return (
        <>
          <FilterBar fields={fields} value={value} onValueChange={setValue} />
          <output>{value.children.length}</output>
        </>
      );
    }

    render(<Controlled />);

    await user.click(
      screen.getByRole("button", {
        name: 'Remove filter, Title contains "api"',
      }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("1");
  });

  it("announces result counts politely", () => {
    const { rerender } = render(<FilterBar fields={fields} resultCount={12} />);

    const region = document.querySelector('[data-slot="filter-bar-status"]');

    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("12 results");

    rerender(<FilterBar fields={fields} resultCount={1} />);

    expect(region).toHaveTextContent("1 result");
  });

  it("shows or-separators, group summaries and unknown fields", () => {
    render(
      <FilterBar
        fields={fields}
        defaultValue={createFilter({
          combinator: "or",
          children: [
            createFilterCondition({
              field: "status",
              operator: "isAnyOf",
              value: ["done"],
            }),
            createFilter({
              children: [
                createFilterCondition({
                  field: "labels",
                  operator: "includesAny",
                  value: ["bug"],
                }),
                createFilterCondition({
                  field: "title",
                  operator: "isEmpty",
                }),
              ],
            }),
            createFilterCondition({
              field: "ghost",
              operator: "is",
              value: "x",
            }),
          ],
        })}
      />,
    );

    expect(toolbar()).toHaveTextContent(/Done.*or.*Labels/);
    expect(
      screen.getByRole("group", {
        name: "Labels includes Bug, and Title is empty",
      }),
    ).toHaveAttribute("data-slot", "filter-group-chip");
    expect(screen.getByRole("group", { name: "ghost is x" })).toHaveAttribute(
      "data-invalid",
    );
  });

  it("marks incomplete chips and collapses extra chips for narrow containers", () => {
    render(
      <FilterBar
        fields={fields}
        collapseAfter={1}
        defaultValue={createFilter({
          children: [
            createFilterCondition({ field: "status", operator: "isAnyOf" }),
            createFilterCondition({
              field: "title",
              operator: "contains",
              value: "x",
            }),
          ],
        })}
      />,
    );

    const incomplete = screen.getByRole("group", {
      name: "Status is any of (no value)",
    });

    expect(incomplete).toHaveAttribute("data-incomplete");
    expect(
      within(incomplete).getByRole("button", { name: "Change value, Select…" }),
    ).toHaveTextContent("Select…");
    expect(
      screen.getByRole("group", { name: 'Title contains "x"' }),
    ).toHaveAttribute("data-overflow");
    expect(screen.getByRole("button", { name: "+1 more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("supports custom composition and labels", () => {
    render(
      <FilterBar
        fields={fields}
        defaultValue={statusFilter()}
        labels={{ toolbar: "Issue filters", addFirst: "Nouveau filtre" }}
      >
        <FilterAddMenu>New</FilterAddMenu>
        <FilterBarChips
          renderChip={(condition) =>
            condition.field === "title" ? <span>custom</span> : undefined
          }
        />
      </FilterBar>,
    );

    expect(
      screen.getByRole("toolbar", { name: "Issue filters" }),
    ).toHaveTextContent(/^New.*custom$/);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("shows negated conditions and a negated root visibly", () => {
    render(
      <FilterBar
        fields={fields}
        defaultValue={createFilter({
          not: true,
          children: [
            createFilterCondition({
              field: "status",
              operator: "isAnyOf",
              value: ["open"],
              not: true,
            }),
          ],
        })}
      />,
    );

    const chip = screen.getByRole("group", { name: "not (Status is Open)" });

    expect(chip).toHaveAttribute("data-negated");
    expect(
      chip.querySelector('[data-slot="filter-chip-not"]'),
    ).toHaveTextContent("not");
    expect(toolbar()).toHaveTextContent(/^Not matching/);
    expect(toolbar()).toHaveAccessibleDescription("not (not (Status is Open))");
  });

  it("requires parts to render inside FilterBar", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<FilterAddMenu />)).toThrow(
      "FilterAddMenu must be rendered inside <FilterBar>.",
    );
  });
});
