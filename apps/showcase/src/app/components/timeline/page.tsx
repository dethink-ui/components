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

import {
  TimelineGroupedDetails,
  TimelineLiveFeed,
  TimelineCanvas,
  TimelineCards,
} from "@/examples/timeline/enhanced";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Show events in order with statuses and optional selection.",
};

export default function TimelinePage() {
  return (
    <DocsPage
      name="Timeline"
      description="Show events in order with statuses and optional selection."
    >
      <InstallationSection
        registryName="timeline"
        importCode={`import {
  Timeline,
  type TimelineItemData,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Interactive timelines support arrow keys and Home/End. Use flow for readable histories and canvas when people need to explore a large track."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="timeline/basic.tsx"
            title="Activity history"
            description="Dated milestones with complete, current, and upcoming statuses."
          >
            <TimelineBasic />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/progress.tsx"
            title="Deployment progress"
            description="A readable sequence of completed, current and upcoming stages."
          >
            <TimelineProgress />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/enhanced.tsx"
            title="Grouped release activity"
            description="Scan by date, then expand an event for its owner and commit. Details do not change selection."
          >
            <TimelineGroupedDetails />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/enhanced.tsx"
            title="Live release feed"
            description="Scroll up, then add an event. Your reading position stays put until you choose Jump to latest."
          >
            <TimelineLiveFeed />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/enhanced.tsx"
            title="Bordered cards"
            description="Use cards when events benefit from more separation."
          >
            <TimelineCards />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/enhanced.tsx"
            title="Explore a canvas"
            description="Pan and zoom an explicit canvas. Drag the track or focus a selection control and use the arrow keys."
          >
            <TimelineCanvas />
          </ExampleBlock>
          <ExampleBlock
            file="timeline/flow-reveal.tsx"
            title="Flow presentation with reveal"
            description="Milestones enter as you reach them. Reduced-motion users see the content immediately."
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
        description="Examples that combine components for common tasks."
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

      <DocsSection
        id="migration"
        title="Migration"
        description='Timeline now defaults to a vertical activity list. Set presentation="canvas" to retain pan and zoom, or variant="cards" for bordered flow cards. Reveal defaults are 220ms with a 60ms interval; pass revealOptions to keep your previous timing.'
      >
        <p className="text-muted-foreground text-sm">
          Grouping and expandable details are flow features. Custom renderers
          remain supported; selection and disclosure controls are separate from
          links and actions. TimelineFeed installs separately as timeline-feed
          and owns its scroll panel.
        </p>
      </DocsSection>
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
