import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { StepsApprovalRouting } from "@/examples/steps/approval-routing";
import { StepsBranchingAgentLaunch } from "@/examples/steps/branching-agent-launch";
import { StepsDeploymentCommandCenter } from "@/examples/steps/deployment-command-center";
import {
  stepItemProps,
  stepsPanelProps,
  stepsProps,
  stepsStateProps,
} from "@/lib/props/steps";

export const metadata: Metadata = {
  title: "Steps",
  description: "Show the current step and progress through a task.",
};

export default function StepsPage() {
  return (
    <DocsPage
      name="Steps"
      description="Show the current step and progress through a task."
    >
      <InstallationSection
        registryName="steps"
        importCode={`import {
  Steps,
  StepsPanel,
  StepsProvider,
  useCurrentStep,
  useNextSteps,
  useSteps,
  useStepsState,
  type StepItemData,
  type StepRenderState,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Production-oriented flows that keep domain state outside the component while preserving stable step identity."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            codeCollapsible
            codeDefaultOpen={false}
            file="steps/branching-agent-launch.tsx"
            title="Branching agent launch"
            description="Choose a guarded production rollout or a team sandbox, then insert or remove an optional Privacy review. Provider hooks preserve Policy while the future suffix changes, and each step's typed panel key resolves through a consumer-owned component registry."
          >
            <StepsBranchingAgentLaunch />
          </ExampleBlock>
          <ExampleBlock
            wide
            codeCollapsible
            codeDefaultOpen={false}
            file="steps/deployment-command-center.tsx"
            title="Deployment command center"
            description="A vertical operational flow starts at an error gate. Retry restores the current stage, unlocks the canary, and lets the operator complete or explicitly skip an optional observation hold."
          >
            <StepsDeploymentCommandCenter />
          </ExampleBlock>
          <ExampleBlock
            wide
            codeCollapsible
            codeDefaultOpen={false}
            file="steps/approval-routing.tsx"
            title="Typed approval routing"
            description="Domain data drives owner and due-date labels through renderItem. Security and Budget approvals unlock later destinations while product-specific progress tracks approvals rather than the current ordinal."
          >
            <StepsApprovalRouting />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Use the visual component alone or connect it to the optional headless controller. Current identity remains separate from domain status, and future mutations cannot remove the current prefix."
      >
        <div className="space-y-6">
          <PropsTable caption="Steps props" rows={stepsProps} />
          <PropsTable caption="StepItemData fields" rows={stepItemProps} />
          <PropsTable caption="useStepsState options" rows={stepsStateProps} />
          <PropsTable caption="StepsPanel props" rows={stepsPanelProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
