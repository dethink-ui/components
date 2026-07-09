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
import { stepItemProps, stepsProps } from "@/lib/props/steps";

export const metadata: Metadata = {
  title: "Steps",
  description:
    "Build branching workflow indicators with horizontal and vertical layouts, progress, status overrides, optional navigation, custom rendering, and reduced-motion-safe transitions.",
};

export default function StepsPage() {
  return (
    <DocsPage
      name="Steps"
      description="A data-driven process indicator for workflows whose next and future steps can change. You own branch calculation, panels, validation, and controls; Steps owns ordered-list semantics, current-step state, progress, navigation surfaces, responsive layouts, and high-level Motion choreography."
    >
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
            description="Choose a guarded production rollout or a team sandbox. The policy answer replaces only future steps, keeps Policy current, and recalculates ordinal progress against the visible branch."
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

      <InstallationSection
        registryName="steps"
        importCode={`import {
  Steps,
  type StepItemData,
  type StepRenderState,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Steps accepts a typed, consumer-owned visible branch. Current identity and domain status remain separate so exceptional states never obscure which step is current."
      >
        <div className="space-y-6">
          <PropsTable caption="Steps props" rows={stepsProps} />
          <PropsTable caption="StepItemData fields" rows={stepItemProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
