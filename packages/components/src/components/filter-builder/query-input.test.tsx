import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  useFilterState,
  type Filter,
  type FilterQueryError,
} from ".";
import { QueryInput } from "./query-input";
import { queryFields, stripIds } from "./filter-query.fixtures";

const openFilter = () =>
  createFilter({
    id: "root",
    children: [
      createFilterCondition({
        id: "open",
        field: "status",
        operator: "isAnyOf",
        value: ["open"],
      }),
    ],
  });

function setup(defaultValue?: Filter) {
  const user = userEvent.setup();
  const onValueChange = vi.fn<(filter: Filter) => void>();
  const onQueryError = vi.fn<(error: FilterQueryError) => void>();

  render(
    <QueryInput
      fields={queryFields}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onQueryError={onQueryError}
    />,
  );

  const input = screen.getByRole("combobox", { name: "Filter query" });
  const last = () => {
    const filter = onValueChange.mock.lastCall?.[0];

    return filter ? stripIds(filter) : undefined;
  };

  return { input, last, onQueryError, onValueChange, user };
}

describe("QueryInput", () => {
  it("shows the filter as text and commits typed text on Enter", async () => {
    const { input, last, user } = setup(openFilter());

    expect(input).toHaveValue("status:open");

    await user.type(input, " amount:>5{Enter}");

    expect(last()).toEqual({
      type: "group",
      combinator: "and",
      children: [
        {
          type: "condition",
          field: "status",
          operator: "isAnyOf",
          value: ["open"],
        },
        { type: "condition", field: "amount", operator: "gt", value: 5 },
      ],
    });
    expect(input).toHaveValue("status:open amount:>5");
  });

  it("keeps the filter and underlines the error when text is invalid", async () => {
    const { input, onQueryError, onValueChange, user } = setup(openFilter());

    await user.type(input, " nope:1{Enter}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onQueryError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "unknown-field", start: 12, end: 16 }),
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription('Unknown field "nope"');
    expect(screen.getByRole("alert")).toHaveTextContent('Unknown field "nope"');
    expect(
      document.querySelector(
        '[data-slot="query-input-highlight"] [data-error]',
      ),
    ).toHaveTextContent("nope");

    // Fixing the text clears the error as you type, and blur commits.
    await user.clear(input);
    await user.type(input, "urgent:yes");
    expect(input).not.toHaveAttribute("aria-invalid");
    await user.tab();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("suggests fields, then values, as an ARIA combobox", async () => {
    const { input, last, user } = setup();

    await user.type(input, "st");

    const listbox = screen.getByRole("listbox", { name: "Suggestions" });

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(within(listbox).getAllByRole("option")).toHaveLength(1);

    await user.keyboard("{ArrowDown}");

    const status = screen.getByRole("option", { name: "Status, Field" });

    expect(status).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", status.id);

    await user.keyboard("{Enter}");
    expect(input).toHaveValue("status:");
    expect(
      screen.getByRole("option", { name: "Blocked, Value" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Blocked, Value" }));
    expect(input).toHaveValue("status:blocked");
    expect(input).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{Enter}");
    expect(last()).toMatchObject({
      children: [{ field: "status", value: ["blocked"] }],
    });
  });

  it("reverts an edit with Escape once the list is closed", async () => {
    const { input, onValueChange, user } = setup(openFilter());

    await user.type(input, " nope");
    await user.keyboard("{Escape}{Escape}");

    expect(input).toHaveValue("status:open");
    await user.tab();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("does not record a change when the text means the same filter", async () => {
    const { input, onValueChange, user } = setup(openFilter());

    await user.clear(input);
    await user.type(input, "Status:Open{Enter}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("status:open");
  });
});

describe("QueryInput guards", () => {
  it("never edits or commits while read-only", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(filter: Filter) => void>();

    render(
      <QueryInput
        fields={queryFields}
        readOnly
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Filter query" });

    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}{ArrowDown}{Enter}");
    await user.tab();

    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("leaves Enter, arrows and Escape to an IME composition", async () => {
    const { input, last, onValueChange, user } = setup();

    await user.type(input, "st");
    fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });
    expect(input).not.toHaveAttribute("aria-activedescendant");

    await user.clear(input);
    await user.type(input, "status:open");
    await user.keyboard("{Escape}");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(input, { key: "Escape", isComposing: true });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("status:open");

    await user.keyboard("{Enter}");
    expect(last()).toMatchObject({ children: [{ field: "status" }] });
  });
});

function Synced({ onChange }: { onChange?: (filter: Filter) => void }) {
  const state = useFilterState({
    defaultValue: openFilter(),
    onValueChange: onChange,
  });

  return (
    <>
      <QueryInput fields={queryFields} state={state} />
      <FilterBar fields={queryFields} state={state} />
    </>
  );
}

describe("QueryInput with FilterBar", () => {
  it("keeps text and chips in sync both ways, keeping chip ids", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(filter: Filter) => void>();

    render(<Synced onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Filter query" });

    await user.type(input, " (urgent:yes OR -labels:bug){Enter}");

    expect(
      screen.getByRole("group", { name: "Status is Open" }),
    ).toBeInTheDocument();
    // The unchanged condition keeps its id, so its chip is not remounted.
    expect(onChange.mock.lastCall?.[0].children[0]?.id).toBe("open");

    await user.click(
      screen.getByRole("button", { name: "Remove filter, Status is Open" }),
    );
    expect(input).toHaveValue("urgent:yes OR -labels:bug");

    await user.keyboard("{Meta>}z{/Meta}");
    expect(input).toHaveValue("status:open (urgent:yes OR -labels:bug)");
  });
});
