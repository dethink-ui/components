import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  Steps,
  StepsProvider,
  useCurrentStep,
  useNextSteps,
  useSteps,
  useStepsState,
  type StepItemData,
} from ".";

type WorkflowData = {
  panelKey: string;
};

const objective: StepItemData<WorkflowData> = {
  id: "objective",
  label: "Objective",
  data: { panelKey: "objective" },
};
const context: StepItemData<WorkflowData> = {
  id: "context",
  label: "Context",
  data: { panelKey: "context" },
};
const policy: StepItemData<WorkflowData> = {
  id: "policy",
  label: "Policy",
  data: { panelKey: "policy" },
};
const security: StepItemData<WorkflowData> = {
  id: "security",
  label: "Security",
  data: { panelKey: "security" },
};
const approval: StepItemData<WorkflowData> = {
  id: "approval",
  label: "Approval",
  data: { panelKey: "approval" },
};
const launch: StepItemData<WorkflowData> = {
  id: "launch",
  label: "Launch",
  data: { panelKey: "launch" },
};

const initialItems = [objective, context, policy, security, approval, launch];

describe("useStepsState", () => {
  it("derives the current step, future suffix, and ordinal progress", () => {
    const { result } = renderHook(() =>
      useStepsState({
        defaultItems: initialItems,
        defaultValue: "policy",
      }),
    );

    expect(result.current.currentStep).toBe(policy);
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.nextSteps.map((step) => step.id)).toEqual([
      "security",
      "approval",
      "launch",
    ]);
    expect(result.current.progress).toBe(50);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
  });

  it("preserves an implicit current id when a controlled collection removes it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result, rerender } = renderHook(
      ({ items }: { items: StepItemData<WorkflowData>[] }) =>
        useStepsState({ items }),
      { initialProps: { items: initialItems } },
    );

    expect(result.current.value).toBe("objective");

    rerender({ items: initialItems.slice(1) });

    expect(result.current.value).toBe("objective");
    expect(result.current.currentStep).toBeUndefined();
    expect(result.current.currentIndex).toBe(-1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'current value "objective" is not present in items',
      ),
    );
    warn.mockRestore();
  });

  it("adds, inserts, removes, replaces, and clears only future steps", () => {
    const { result } = renderHook(() =>
      useStepsState({
        defaultItems: initialItems,
        defaultValue: "policy",
      }),
    );

    act(() => {
      expect(result.current.replaceNextSteps([security, launch])).toBe(true);
    });
    expect(result.current.items.map((step) => step.id)).toEqual([
      "objective",
      "context",
      "policy",
      "security",
      "launch",
    ]);
    expect(result.current.currentStep).toBe(policy);
    expect(result.current.progress).toBe(60);

    act(() => {
      expect(result.current.addNextStep(approval)).toBe(true);
    });
    expect(result.current.nextSteps.map((step) => step.id)).toEqual([
      "security",
      "launch",
      "approval",
    ]);

    act(() => {
      expect(
        result.current.insertNextStep(0, {
          id: "privacy",
          label: "Privacy",
          data: { panelKey: "privacy" },
        }),
      ).toBe(true);
    });
    expect(result.current.nextSteps[0]?.id).toBe("privacy");

    act(() => {
      expect(result.current.removeNextStep("launch")).toBe(true);
    });
    expect(result.current.nextSteps.map((step) => step.id)).toEqual([
      "privacy",
      "security",
      "approval",
    ]);

    act(() => {
      expect(result.current.clearNextSteps()).toBe(true);
    });
    expect(result.current.items.map((step) => step.id)).toEqual([
      "objective",
      "context",
      "policy",
    ]);
    expect(result.current.isLastStep).toBe(true);
    expect(result.current.progress).toBe(100);
  });

  it("composes repeated uncontrolled mutations in one React batch", () => {
    const { result } = renderHook(() =>
      useStepsState({
        defaultItems: initialItems,
        defaultValue: "policy",
      }),
    );

    act(() => {
      expect(
        result.current.addNextStep({
          id: "privacy",
          label: "Privacy",
          data: { panelKey: "privacy" },
        }),
      ).toBe(true);
      expect(
        result.current.addNextStep({
          id: "compliance",
          label: "Compliance",
          data: { panelKey: "compliance" },
        }),
      ).toBe(true);
    });

    expect(result.current.nextSteps.map((step) => step.id)).toEqual([
      "security",
      "approval",
      "launch",
      "privacy",
      "compliance",
    ]);
  });

  it("composes repeated controlled mutations before the parent rerenders", () => {
    const { result } = renderHook(() => {
      const [items, setItems] = useState(initialItems);
      return useStepsState({
        items,
        onItemsChange: setItems,
        value: "policy",
      });
    });

    act(() => {
      expect(
        result.current.insertNextStep(0, {
          id: "privacy",
          label: "Privacy",
          data: { panelKey: "privacy" },
        }),
      ).toBe(true);
      expect(
        result.current.insertNextStep(1, {
          id: "compliance",
          label: "Compliance",
          data: { panelKey: "compliance" },
        }),
      ).toBe(true);
    });

    expect(result.current.nextSteps.map((step) => step.id)).toEqual([
      "privacy",
      "compliance",
      "security",
      "approval",
      "launch",
    ]);
  });

  it("rejects duplicate ids and attempts to remove the current prefix", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useStepsState({
        defaultItems: initialItems,
        defaultValue: "policy",
      }),
    );

    act(() => {
      expect(result.current.addNextStep(policy)).toBe(false);
      expect(result.current.removeNextStep("objective")).toBe(false);
    });

    expect(result.current.items).toEqual(initialItems);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Duplicate ids: policy"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("not a future step"),
    );
    warn.mockRestore();
  });

  it("keeps controlled collections parent-owned and emits the proposed branch", () => {
    const onItemsChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ items }: { items: StepItemData<WorkflowData>[] }) =>
        useStepsState({
          items,
          onItemsChange,
          value: "policy",
        }),
      { initialProps: { items: initialItems } },
    );

    act(() => {
      expect(result.current.replaceNextSteps([launch])).toBe(true);
    });

    expect(result.current.items).toBe(initialItems);
    const proposedItems = onItemsChange.mock.calls[0]?.[0];
    expect(proposedItems?.map((step: StepItemData) => step.id)).toEqual([
      "objective",
      "context",
      "policy",
      "launch",
    ]);

    rerender({ items: proposedItems });

    expect(result.current.items).toBe(proposedItems);
    expect(result.current.nextSteps).toEqual([launch]);
  });

  it("does not select disabled or unknown destinations", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useStepsState({
        defaultItems: [objective, { ...context, disabled: true }, policy],
        defaultValue: "objective",
        onValueChange,
      }),
    );

    act(() => {
      expect(result.current.setValue("context")).toBe(false);
      expect(result.current.setValue("missing")).toBe(false);
      expect(result.current.setValue("policy")).toBe(true);
    });

    expect(result.current.value).toBe("policy");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("policy");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('unknown step "missing"'),
    );
    warn.mockRestore();
  });
});

describe("StepsProvider hooks", () => {
  function WorkflowConsumer() {
    const steps = useSteps<WorkflowData>();
    const current = useCurrentStep<WorkflowData>();
    const future = useNextSteps<WorkflowData>();

    return (
      <>
        <Steps<WorkflowData>
          interactive
          showProgress
          aria-label="Agent workflow"
          {...steps.stepsProps}
        />
        <output data-testid="current-step">{current.currentStep?.id}</output>
        <output data-testid="next-steps">
          {future.nextSteps.map((step) => step.id).join(",")}
        </output>
        <button type="button" onClick={() => future.replaceNextSteps([launch])}>
          Use short branch
        </button>
      </>
    );
  }

  function Workflow() {
    const state = useStepsState({
      defaultItems: initialItems,
      defaultValue: "policy",
    });

    return (
      <StepsProvider state={state}>
        <WorkflowConsumer />
      </StepsProvider>
    );
  }

  it("shares the same state with the visual indicator and focused hooks", async () => {
    const user = userEvent.setup();
    render(<Workflow />);

    expect(screen.getByTestId("current-step")).toHaveTextContent("policy");
    expect(screen.getByTestId("next-steps")).toHaveTextContent(
      "security,approval,launch",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );

    await user.click(screen.getByRole("button", { name: "Use short branch" }));

    expect(screen.getByTestId("next-steps")).toHaveTextContent("launch");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "75",
    );

    await user.click(screen.getByRole("button", { name: /Launch/ }));

    expect(screen.getByTestId("current-step")).toHaveTextContent("launch");
  });

  it("renders the provider and hooks during SSR", () => {
    expect(renderToString(<Workflow />)).toContain("Agent workflow");
  });
});
