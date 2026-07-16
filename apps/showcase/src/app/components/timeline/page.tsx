import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TimelineBasic } from "@/examples/timeline/basic";
import { TimelineFlowReveal } from "@/examples/timeline/flow-reveal";
import { TimelineProgress } from "@/examples/timeline/progress";
import { TimelineRevealStreaming } from "@/examples/timeline/reveal-streaming";
import { TimelineRecipeDeployHistory } from "@/examples/timeline/recipe-deploy-history";
import { TimelineRecipeOriginStory } from "@/examples/timeline/recipe-origin-story";
import { timelineProps } from "@/lib/props/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "Present event histories and step sequences on an interactive track with statuses, selection, zoomable viewports, and animated flow reveals.",
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
          <ExampleBlock
            file="timeline/flow-reveal.tsx"
            title="Flow presentation with reveal"
            description='presentation="flow" swaps the pan/zoom viewport for a static document-flow list, and reveal="stagger" with the in-view trigger animates the items in one by one as they scroll into view. Reduced-motion users see everything immediately.'
          >
            <TimelineFlowReveal />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/reveal-streaming.tsx"
            title="Streaming reveal"
            description="Appending to the items array animates only the new points in — built for live sources like agent runs, deploy logs, or activity feeds."
          >
            <TimelineRevealStreaming />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="timeline/recipe-origin-story.tsx"
            title="LLM story"
            description="A publication-style vertical history showing how LLMs moved from research architecture to everyday product workflows."
          >
            <TimelineRecipeOriginStory />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/recipe-deploy-history.tsx"
            title="Deployment history"
            description="Statuses carry rollout health — including a rollback marked error — and controlled selection drives a details panel showing each deployment's commit and author from its typed payload."
          >
            <TimelineRecipeDeployHistory />
          </ExampleBlock>
        </div>
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
