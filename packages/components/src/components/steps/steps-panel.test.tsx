import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Steps,
  StepsPanel,
  StepsProvider,
  useNextSteps,
  useStepsState,
  type StepItemData,
  type StepsPanelRenderContext,
} from ".";

type PanelKey = "brief" | "policy" | "security" | "launch";
type WorkflowData = {
  panelKey: PanelKey;
  summary: string;
};

type PanelProps = StepsPanelRenderContext<WorkflowData>;

const items: StepItemData<WorkflowData>[] = [
  {
    id: "brief",
    label: "Brief",
    data: { panelKey: "brief", summary: "Define the agent." },
  },
  {
    id: "policy",
    label: "Policy",
    data: { panelKey: "policy", summary: "Choose the release path." },
  },
  {
    id: "launch",
    label: "Launch",
    data: { panelKey: "launch", summary: "Release the agent." },
  },
];

function BriefPanel({ step }: PanelProps) {
  return <h2>{step.data?.summary}</h2>;
}

function PolicyPanel({ step }: PanelProps) {
  return <h2>{step.data?.summary}</h2>;
}

function SecurityPanel({ step }: PanelProps) {
  return <h2>{step.data?.summary}</h2>;
}

function LaunchPanel({ step }: PanelProps) {
  return <h2>{step.data?.summary}</h2>;
}

const panelRegistry: Record<PanelKey, ComponentType<PanelProps>> = {
  brief: BriefPanel,
  launch: LaunchPanel,
  policy: PolicyPanel,
  security: SecurityPanel,
};

function RegisteredPanel() {
  return (
    <StepsPanel<WorkflowData>
      aria-live="polite"
      render={(context) => {
        const panelKey = context.step.data?.panelKey;

        if (!panelKey) {
          return null;
        }

        const Panel = panelRegistry[panelKey];
        return <Panel {...context} />;
      }}
    />
  );
}

function DynamicBranchControls() {
  const { insertNextStep } = useNextSteps<WorkflowData>();

  return (
    <button
      type="button"
      onClick={() => {
        insertNextStep(0, {
          id: "security",
          label: "Security",
          data: {
            panelKey: "security",
            summary: "Review tool permissions.",
          },
        });
      }}
    >
      Add security review
    </button>
  );
}

function Workflow() {
  const state = useStepsState({
    defaultItems: items,
    defaultValue: "policy",
  });

  return (
    <StepsProvider state={state}>
      <Steps<WorkflowData>
        interactive
        aria-label="Release workflow"
        {...state.stepsProps}
      />
      <RegisteredPanel />
      <DynamicBranchControls />
    </StepsProvider>
  );
}

describe("StepsPanel", () => {
  it("renders the registered panel for the current step", async () => {
    const user = userEvent.setup();
    render(<Workflow />);

    const panel = screen.getByText("Choose the release path.").parentElement;

    expect(panel).toHaveAttribute("data-slot", "steps-panel");
    expect(panel).toHaveAttribute("data-step-value", "policy");
    expect(panel).not.toHaveAttribute("role", "tabpanel");

    await user.click(screen.getByRole("button", { name: /Launch/ }));

    expect(screen.getByText("Release the agent.")).toBeVisible();
    expect(panel).toHaveAttribute("data-step-value", "launch");
  });

  it("can add a future step and render its registered panel", async () => {
    const user = userEvent.setup();
    render(<Workflow />);

    await user.click(
      screen.getByRole("button", { name: "Add security review" }),
    );
    await user.click(screen.getByRole("button", { name: /Security/ }));

    expect(screen.getByRole("button", { name: /Security/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("Review tool permissions.")).toBeVisible();
  });

  it("renders a fallback when the provider has no current item", () => {
    function EmptyWorkflow() {
      const state = useStepsState<WorkflowData>();

      return (
        <StepsProvider state={state}>
          <StepsPanel
            fallback={<p>No active step</p>}
            render={() => <p>Unexpected panel</p>}
          />
        </StepsProvider>
      );
    }

    render(<EmptyWorkflow />);

    expect(screen.getByText("No active step")).toBeVisible();
    expect(screen.queryByText("Unexpected panel")).toBeNull();
  });

  it("does not preserve local panel state across step identities", async () => {
    const user = userEvent.setup();

    function StatefulPanel({ step }: PanelProps) {
      const [draft, setDraft] = useState("");

      return (
        <label>
          {step.label} draft
          <input
            aria-label="Panel draft"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
        </label>
      );
    }

    function StatefulWorkflow() {
      const state = useStepsState({
        defaultItems: items,
        defaultValue: "policy",
      });

      return (
        <StepsProvider state={state}>
          <Steps interactive {...state.stepsProps} />
          <StepsPanel<WorkflowData>
            render={(context) => <StatefulPanel {...context} />}
          />
        </StepsProvider>
      );
    }

    render(<StatefulWorkflow />);

    const draft = screen.getByRole("textbox", { name: "Panel draft" });
    await user.type(draft, "Policy answer");
    await user.click(screen.getByRole("button", { name: /Launch/ }));

    expect(screen.getByText("Launch draft")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Panel draft" })).toHaveValue(
      "",
    );
  });

  it("forwards root attributes and refs", () => {
    const ref = createRef<HTMLDivElement>();

    function RefWorkflow() {
      const state = useStepsState({ defaultItems: items });

      return (
        <StepsProvider state={state}>
          <StepsPanel
            ref={ref}
            className="custom-panel"
            data-testid="panel"
            render={() => "Panel"}
          />
        </StepsProvider>
      );
    }

    render(<RefWorkflow />);

    expect(ref.current).toBe(screen.getByTestId("panel"));
    expect(ref.current).toHaveClass("custom-panel", "min-w-0");
  });

  it("renders the registered panel during SSR", () => {
    expect(renderToString(<Workflow />)).toContain("Choose the release path.");
  });
});
