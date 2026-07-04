import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TimelineBasic } from "@/examples/timeline/basic";
import { TimelineProgress } from "@/examples/timeline/progress";
import { TimelineRecipeDeployHistory } from "@/examples/timeline/recipe-deploy-history";
import { timelineProps } from "@/lib/props/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "Present event histories and step sequences on an interactive track with statuses, selection, and zoomable viewports.",
};

export default function TimelinePage() {
  return (
    <DocsPage
      name="Timeline"
      description="A data-driven track for time: events mode maps dated items onto a scaled axis, progress mode renders undated step sequences, and items carry status tones, keyboard-navigable selection, and typed payloads. Long histories get a zoom/pan viewport."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Focus the track and use the arrow keys to move between items."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="timeline/basic.tsx"
            title="Events"
            description="Dated milestones with complete, current, and upcoming statuses."
          >
            <TimelineBasic />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/progress.tsx"
            title="Progress"
            description="progress mode drops the dates for an evenly spaced step sequence — pipelines, wizards, order tracking."
          >
            <TimelineProgress />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="timeline/recipe-deploy-history.tsx"
          title="Deployment history"
          description="Statuses carry rollout health — including a rollback marked error — and controlled selection drives a details panel showing each deployment's commit and author from its typed payload."
        >
          <TimelineRecipeDeployHistory />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="timeline"
        importCode={`import {
  Timeline,
  type TimelineItemData,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Timeline is data-driven: items carry the content, and the component handles layout, scale, and interaction."
      >
        <PropsTable caption="Timeline props" rows={timelineProps} />
      </DocsSection>
    </DocsPage>
  );
}
