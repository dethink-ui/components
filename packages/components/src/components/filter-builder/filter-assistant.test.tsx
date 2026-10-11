import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FilterBar,
  createFilter,
  createFilterCondition,
  printFilterQuery,
  useFilterState,
  type FilterAssistantResult,
} from ".";
import { FilterAssistant } from "./filter-assistant";
import { queryFields } from "./filter-query.fixtures";
import {
  useFilterAssistant,
  type FilterAssistantRequest,
  type UseFilterAssistantOptions,
} from "./use-filter-assistant";

const openBugs: FilterAssistantResult = {
  filter: {
    type: "group",
    combinator: "and",
    children: [
      {
        type: "condition",
        field: "status",
        operator: "isAnyOf",
        value: ["open", "blocked"],
      },
      {
        type: "condition",
        field: "labels",
        operator: "includesAny",
        value: ["bug"],
      },
    ],
  },
};

type Resolve = UseFilterAssistantOptions["resolve"];

function setup(
  resolve: Resolve,
  options: Partial<UseFilterAssistantOptions> = {},
) {
  const user = userEvent.setup();
  let text = () => "";

  function Harness() {
    const state = useFilterState({
      defaultValue: createFilter({
        id: "root",
        children: [
          createFilterCondition({
            id: "s",
            field: "status",
            operator: "isAnyOf",
            value: ["open"],
          }),
          createFilterCondition({
            id: "u",
            field: "urgent",
            operator: "is",
            value: true,
          }),
        ],
      }),
    });
    const assistant = useFilterAssistant({
      fields: queryFields,
      state,
      resolve,
      evaluateOptions: {
        now: Date.UTC(2026, 8, 30),
        timeZone: "Europe/London",
      },
      ...options,
    });

    text = () => printFilterQuery(state.filter, queryFields);

    return (
      <>
        <FilterAssistant assistant={assistant} />
        <FilterBar fields={queryFields} state={state} />
        <button type="button" onClick={state.undo}>
          Undo test
        </button>
        <button
          type="button"
          onClick={() => {
            state.addNode(
              createFilterCondition({
                id: "late",
                field: "amount",
                operator: "gt",
                value: 3,
              }),
            );
          }}
        >
          Add test chip
        </button>
      </>
    );
  }

  render(<Harness />);

  const ask = async (prompt: string) => {
    await user.type(
      screen.getByRole("textbox", { name: "Describe the filter you want" }),
      prompt,
    );
    await user.click(screen.getByRole("button", { name: "Propose" }));
  };

  return { ask, text: () => text(), user };
}

const findStatus = (text: string) =>
  screen.findByText(text, {
    selector: '[data-slot="filter-assistant-status"]',
  });
const proposal = () => screen.getByRole("region", { name: "Proposed changes" });
const changes = () =>
  [...proposal().querySelectorAll('[data-slot="filter-proposal-change"]')].map(
    (item) => `${item.getAttribute("data-proposal")}: ${item.textContent}`,
  );

describe("FilterAssistant", () => {
  it("shows a proposal without touching the filter, then applies it as one undo step", async () => {
    const resolve = vi.fn<Resolve>(async () => openBugs);
    const { ask, text, user } = setup(resolve);

    await ask("open or blocked bugs");

    expect(await findStatus("3 changes proposed")).toBeInTheDocument();
    expect(text()).toBe("status:open urgent:yes");
    expect(changes()).toEqual([
      "changed: ChangeStatus is any of Open, Blockedwas Status is OpenAcceptReject",
      "added: AddLabels includes BugAcceptReject",
      "removed: RemoveUrgent is YesAcceptReject",
    ]);

    await user.click(screen.getByRole("button", { name: "Apply 3 changes" }));

    expect(text()).toBe("status:open,blocked labels:bug");
    expect(
      screen.queryByRole("region", { name: "Proposed changes" }),
    ).toBeNull();
    expect(
      screen.getByRole("textbox", { name: "Describe the filter you want" }),
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Undo test" }));
    expect(text()).toBe("status:open urgent:yes");
  });

  it("applies only accepted changes, or all of them", async () => {
    const { ask, text, user } = setup(async () => openBugs);

    await ask("bugs");

    const removal = within(proposal()).getByRole("group", {
      name: "Keep this change? Urgent is Yes",
    });

    await user.click(within(removal).getByRole("button", { name: "Reject" }));
    expect(
      within(removal).getByRole("button", { name: "Reject" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      proposal().querySelector('[data-proposal="removed"]'),
    ).toHaveAttribute("data-decision", "rejected");

    await user.click(screen.getByRole("button", { name: "Apply 2 changes" }));
    // The added chip goes where the proposal put it.
    expect(text()).toBe("status:open,blocked labels:bug urgent:yes");
  });

  it("lists what couldn't be used and marks chips that need a value", async () => {
    const { ask, text, user } = setup(async () => ({
      filter: {
        type: "group",
        combinator: "and",
        children: [
          {
            type: "condition",
            field: "status",
            operator: "isAnyOf",
            value: ["open"],
          },
          { type: "condition", field: "urgent", operator: "is", value: true },
          {
            type: "condition",
            field: "priority",
            operator: "isAnyOf",
            value: ["p1"],
          },
          {
            type: "condition",
            field: "labels",
            operator: "includesAny",
            value: ["acme"],
          },
        ],
      },
    }));

    await ask("p1 acme issues");

    const region = proposal();

    expect(within(region).getByText("Couldn't use")).toBeInTheDocument();
    expect(region).toHaveTextContent("priority (no such field)");
    expect(region).toHaveTextContent("Labels: acme (no matching value)");
    expect(
      region.querySelector('[data-proposal="added"][data-needs-input]'),
    ).toHaveTextContent("Needs a value");

    await user.click(screen.getByRole("button", { name: "Apply 1 change" }));
    // The incomplete chip is added for the person to fill in.
    expect(
      screen.getByRole("group", { name: /^Labels includes/ }),
    ).toBeInTheDocument();
    expect(text()).toBe("status:open urgent:yes");
  });

  it("renders model text as text only", async () => {
    const injection = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    const { ask } = setup(async () => ({
      message: injection,
      unresolved: [{ text: injection }],
      clarifications: [
        {
          id: "x",
          question: injection,
          choices: [
            { id: "a", label: injection },
            { id: "b", label: "B" },
          ],
        },
      ],
    }));

    await ask("anything");

    const region = proposal();

    expect(region.querySelector("img, script")).toBeNull();
    expect(
      within(region).getByText(injection, {
        selector: '[data-slot="filter-proposal-message"]',
      }),
    ).toBeInTheDocument();
    expect(
      await findStatus("The assistant needs a choice to continue."),
    ).toBeInTheDocument();
  });

  it("reports a declined request and a failed one without showing the error", async () => {
    const onError = vi.fn();
    const resolve = vi
      .fn<Resolve>()
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(new Error("secret stack trace"));
    const { ask, text, user } = setup(resolve, { onError });

    await ask("nonsense");
    expect(
      await findStatus(
        "The assistant couldn't turn that into a filter. Try rephrasing.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Propose" }));
    expect(
      await findStatus("Something went wrong. Try again."),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("secret stack trace");
    expect(onError).toHaveBeenCalledWith(new Error("secret stack trace"));
    expect(text()).toBe("status:open urgent:yes");
  });

  it("shows the error even when onError throws", async () => {
    const onError = vi.fn(() => {
      throw new Error("host bug");
    });
    const unhandled = vi.fn();

    process.on("unhandledRejection", unhandled);

    try {
      const { ask } = setup(
        async () => {
          throw new Error("model down");
        },
        { onError },
      );

      await ask("bugs");
      expect(
        await findStatus("Something went wrong. Try again."),
      ).toBeInTheDocument();
      expect(onError).toHaveBeenCalledTimes(1);
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });

  it("stops a request and ignores its late answer", async () => {
    let finish: (result: FilterAssistantResult) => void = () => undefined;
    let signal: AbortSignal | undefined;
    let calls = 0;
    const resolveCalls = () => calls;
    const { ask, text, user } = setup(
      (request) =>
        new Promise((resolve) => {
          calls += 1;
          signal = request.signal;
          finish = resolve;
        }),
    );

    await ask("bugs");
    expect(await findStatus("Working on a proposal…")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(signal?.aborted).toBe(true);
    // Stopping doesn't submit the prompt again.
    expect(resolveCalls()).toBe(1);

    await act(async () => {
      finish(openBugs);
    });

    expect(
      screen.queryByRole("region", { name: "Proposed changes" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Propose" })).toBeInTheDocument();
    expect(text()).toBe("status:open urgent:yes");
  });

  it("asks clarifying questions with one-tap choices", async () => {
    const requests: FilterAssistantRequest[] = [];
    const resolve = vi.fn<Resolve>(async (request) => {
      requests.push(request);

      return request.answers.length === 0
        ? {
            clarifications: [
              {
                id: "which",
                question: "Which labels?",
                choices: [
                  { id: "bug", label: "Bugs" },
                  { id: "api", label: "API work" },
                ],
              },
            ],
          }
        : openBugs;
    });
    const { ask, user } = setup(resolve);

    await ask("the usual");

    const question = screen.getByRole("group", { name: "Which labels?" });

    await user.click(within(question).getByRole("button", { name: "Bugs" }));

    expect(requests[1]).toMatchObject({
      prompt: "the usual",
      answers: [{ question: "Which labels?", answer: "Bugs" }],
    });
    expect(await findStatus("3 changes proposed")).toBeInTheDocument();
    expect(proposal()).toHaveFocus();
  });

  it("sends the prompt, current filter, schema, fields, time and a signal", async () => {
    const resolve = vi.fn<Resolve>(async () => openBugs);
    const { ask } = setup(resolve);

    await ask("  bugs  ");

    const [request] = resolve.mock.calls[0] ?? [];

    expect(request).toMatchObject({
      prompt: "bugs",
      answers: [],
      now: Date.UTC(2026, 8, 30),
      timeZone: "Europe/London",
      current: { id: "root", children: [{ id: "s" }, { id: "u" }] },
      schema: { type: "object" },
    });
    expect(request?.fields.map((field) => field.key)).toContain("status");
    expect(request?.signal).toBeInstanceOf(AbortSignal);
  });

  it("previews the result count for the selected changes", async () => {
    const onPreviewCount = vi.fn(async (filter) =>
      printFilterQuery(filter, queryFields).includes("urgent") ? 7 : 12,
    );
    const { ask, user } = setup(async () => openBugs, { onPreviewCount });

    await ask("bugs");
    expect(await screen.findByText("About 12 results")).toBeInTheDocument();

    const removal = screen.getByRole("group", {
      name: "Keep this change? Urgent is Yes",
    });

    await user.click(within(removal).getByRole("button", { name: "Reject" }));
    expect(await screen.findByText("About 7 results")).toBeInTheDocument();
  });

  it("marks a changed chip that needs a value", async () => {
    const { ask } = setup(async () => ({
      filter: {
        type: "group",
        combinator: "and",
        children: [
          {
            type: "condition",
            field: "status",
            operator: "isAnyOf",
            value: ["pending"],
          },
          { type: "condition", field: "urgent", operator: "is", value: true },
        ],
      },
    }));

    await ask("pending ones");

    const changed = proposal().querySelector('[data-proposal="changed"]');

    expect(changed).toHaveAttribute("data-needs-input");
    expect(changed).toHaveTextContent("Needs a value");
  });

  it("doesn't bring back a proposal discarded while a clarification loads", async () => {
    let finish: (result: FilterAssistantResult) => void = () => undefined;
    const resolve = vi.fn<Resolve>(async (request) =>
      request.answers.length === 0
        ? {
            filter: openBugs.filter,
            clarifications: [
              {
                id: "x",
                question: "Which?",
                choices: [
                  { id: "a", label: "A" },
                  { id: "b", label: "B" },
                ],
              },
            ],
          }
        : new Promise<FilterAssistantResult>((done) => {
            finish = done;
          }),
    );
    const { ask, text, user } = setup(resolve);

    await ask("bugs");
    await user.click(screen.getByRole("button", { name: "A" }));

    // While the answer loads, the old proposal can't be applied.
    expect(
      screen.getByRole("button", { name: "Apply 3 changes" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Discard" }));
    await act(async () => {
      finish(openBugs);
    });

    expect(
      screen.queryByRole("region", { name: "Proposed changes" }),
    ).toBeNull();
    expect(text()).toBe("status:open urgent:yes");
  });

  it("previews against the live filter and keeps focus in the prompt", async () => {
    const onPreviewCount = vi.fn(async () => 3);
    const { ask, user } = setup(async () => openBugs, { onPreviewCount });

    await ask("bugs");
    expect(
      screen.getByRole("textbox", { name: "Describe the filter you want" }),
    ).toHaveFocus();
    await screen.findByText("About 3 results");

    // Editing the filter while the proposal is open recounts on it.
    const calls = onPreviewCount.mock.calls.length;

    await user.click(
      screen.getByRole("button", { name: "Remove filter, Urgent is Yes" }),
    );
    expect(onPreviewCount.mock.calls.length).toBeGreaterThan(calls);
  });

  it("diffs against the filter sent, keeping chips added while it thinks", async () => {
    let finish: (result: FilterAssistantResult) => void = () => undefined;
    const { ask, text, user } = setup(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );

    await ask("bugs");
    await user.click(screen.getByRole("button", { name: "Add test chip" }));
    await act(async () => {
      finish(openBugs);
    });

    expect(changes().some((change) => change.includes("Amount"))).toBe(false);

    await user.click(screen.getByRole("button", { name: "Apply 3 changes" }));
    expect(text()).toBe("status:open,blocked labels:bug amount:>3");
  });

  it("doesn't re-render or recount in a loop with an inline preview callback", async () => {
    const user = userEvent.setup();
    const counted = vi.fn();
    let renders = 0;

    function Inline() {
      renders += 1;

      const state = useFilterState();
      const assistant = useFilterAssistant({
        fields: queryFields,
        state,
        resolve: async () => openBugs,
        // A new function every render.
        onPreviewCount: async () => {
          counted();
          return 5;
        },
      });

      return <FilterAssistant assistant={assistant} />;
    }

    render(<Inline />);

    const settle = async () => {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
      });
    };

    await settle();

    const idleRenders = renders;

    await settle();
    expect(renders).toBe(idleRenders);

    await user.type(
      screen.getByRole("textbox", { name: "Describe the filter you want" }),
      "bugs{Enter}",
    );
    expect(await screen.findByText("About 5 results")).toBeInTheDocument();
    await settle();

    const calls = counted.mock.calls.length;
    const proposalRenders = renders;

    await settle();
    expect(counted.mock.calls.length).toBe(calls);
    expect(calls).toBe(1);
    expect(renders).toBe(proposalRenders);
  });

  it("discards a proposal and returns focus to the prompt", async () => {
    const { ask, text, user } = setup(async () => openBugs);

    await ask("bugs");
    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(
      screen.queryByRole("region", { name: "Proposed changes" }),
    ).toBeNull();
    expect(
      screen.getByRole("textbox", { name: "Describe the filter you want" }),
    ).toHaveFocus();
    expect(text()).toBe("status:open urgent:yes");
  });
});
