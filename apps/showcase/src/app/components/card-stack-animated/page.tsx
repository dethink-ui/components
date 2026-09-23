import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import {
  CardStackBriefing,
  CardStackReviewQueue,
} from "@/examples/card-stack/actionable";
import { cardStackProps } from "@/lib/props/card-stack";

export const metadata: Metadata = {
  title: "CardStackAnimated",
  description:
    "Directional card decks for briefings and reversible review workflows.",
};

export default function CardStackAnimatedPage() {
  return (
    <DocsPage
      name="CardStackAnimated"
      description="A quiet, directional handoff for stories worth reading. Optional touch navigation, with the same accessible Card Stack foundation."
    >
      <InstallationSection
        registryName="card-stack-animated"
        importCode={
          'import { Card, CardStackAnimated } from "@dethink/components";'
        }
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Move through findings at your own pace. No autoplay, no background movement, and explicit controls throughout."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="card-stack/actionable.tsx"
            title="An evidence-led briefing"
            description="Each finding separates the takeaway, its evidence, and what remains uncertain. On touch screens, swipe horizontally or use the buttons."
          >
            <CardStackBriefing />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/actionable.tsx"
            title="A reversible review queue"
            description="Save promising experiments or defer them, undo a decision, and finish with a clear summary. Gestures never make a decision for you."
          >
            <CardStackReviewQueue />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection
        id="guidance"
        title="Interaction and accessibility"
        description="The base Card Stack remains CSS-only. Install this separate variant when directional movement helps readers follow a change."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-6">
          <p>
            All CardStack props apply. Direct Card children need stable keys
            when inserting or removing items. The wrapper forwards its ref to
            the deck’s focusable group. Controlled state remains authoritative,
            including during an animation.
          </p>
          <p>
            Motion uses a brief transform and opacity handoff. Rapid input
            interrupts it; reduced-motion users get immediate selection with the
            same position announcements. There is no entrance animation or
            autoplay.
          </p>
          <p>
            Set swipe to enable deliberate horizontal touch and pen gestures.
            Mouse dragging keeps native text selection. Vertical scrolling,
            pinch zoom, links, buttons, and fields retain their native behavior.
            Use data-card-stack-no-swipe on custom interactive regions.
            Cancellation and short gestures do not navigate.
          </p>
          <p>
            Keep previous/next controls available. Focus the group and use
            Arrow, Home, or End; nested fields retain their keys. Direction
            follows RTL. When focused content is removed, focus returns to the
            deck; your completion view should receive focus when the deck itself
            is removed.
          </p>
          <p>
            Cards stay mounted, including hidden neighbours. visibleCount bounds
            the visual deck, not memory use. Use a table or list for large
            collections or comparison. Tokens, density, and className follow the
            base component’s theming contract.
          </p>
        </div>
      </DocsSection>
      <DocsSection
        id="props"
        title="Props"
        description="A drop-in optional variant. Existing CardStack consumers require no migration."
      >
        <PropsTable
          caption="CardStackAnimated props"
          rows={[
            {
              prop: "swipe",
              type: "boolean",
              defaultValue: "false",
              description:
                "Opt-in horizontal touch/pen navigation. Does not approve or dismiss cards.",
            },
            ...cardStackProps,
          ]}
        />
      </DocsSection>
    </DocsPage>
  );
}
