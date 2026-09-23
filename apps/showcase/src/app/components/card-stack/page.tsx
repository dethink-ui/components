import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CardStackBasic } from "@/examples/card-stack/basic";
import { CardStackBounded } from "@/examples/card-stack/bounded";
import { CardStackBoundaries } from "@/examples/card-stack/boundaries";
import { CardStackControlled } from "@/examples/card-stack/controlled";
import { CardStackHiddenControls } from "@/examples/card-stack/hidden-controls";
import { CardStackOpen } from "@/examples/card-stack/open";
import { cardStackProps } from "@/lib/props/card-stack";

export const metadata: Metadata = {
  title: "CardStack",
  description: "Let users browse cards arranged in a stack or fan.",
};

export default function CardStackPage() {
  return (
    <DocsPage
      name="CardStack"
      description="A focused deck for release stories, customer proof, and a shortlist of ideas."
    >
      <InstallationSection
        registryName="card-stack"
        importCode={`import { Card, CardStack } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Focus a stack and use Arrow, Home, and End keys to navigate."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="card-stack/bounded.tsx"
            title="A bounded collection"
            description="Seven chapters, three visible cards. Names explain where navigation leads, and your notes stay intact when their cards leave the visible deck."
          >
            <CardStackBounded />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/basic.tsx"
            title="Release stories"
            description="Give each update a product preview, a clear next action, and a place in the deck. Navigation stays below the cards so narrow screens keep room for the story."
          >
            <CardStackBasic />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/open.tsx"
            title="Design shortlist"
            description="Browse a few visual directions in a restrained fan. Select a rear card or use the controls, then open the active recipe to explore it."
          >
            <CardStackOpen />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/boundaries.tsx"
            title="Boundaries and custom labels"
            description="With loop disabled the controls disable at either end, and previousLabel/nextLabel rename them for assistive technology. stackOffset deepens the deck."
          >
            <CardStackBoundaries />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/controlled.tsx"
            title="Customer proof"
            description="Portraits, a memorable quote, and a little context. External pagination uses activeIndex and onActiveIndexChange, with meaningful names and an announced selected state."
          >
            <CardStackControlled />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/hidden-controls.tsx"
            title="Guided walkthrough"
            description="Use showControls={false} when your own actions drive the deck. This sample has progress, a clear finish, and a way to start again."
          >
            <CardStackHiddenControls />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="guidance"
        title="Usage guidance"
        description="Use a stack for a small collection people browse one card at a time. Use a grid or table when they need to compare details side by side."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-6">
          <p>
            Keep cards concise and similarly sized. Every card remains mounted,
            so this is not a virtualized list. Direct Card children are
            required; wrapper components and fragments are not supported.
          </p>
          <p>
            Give the deck an accessible name. Arrow, Home, and End keys navigate
            while the deck itself has focus. Enter or Space selects a rear fan
            card and returns focus to the deck, ready for further navigation.
            Nested links and form controls retain their own keyboard behavior.
          </p>
          <p>
            Only the active card is interactive; other card contents are inert.
            Position changes are announced politely. Motion follows
            reduced-motion preferences, and the resting deck stays still.
            Include explicit controls when the fan edges are difficult to
            select.
          </p>
          <p>
            For directional handoffs, optional swipe, and actionable briefing or
            review recipes, see the{" "}
            <a
              href="/components/card-stack-animated"
              className="text-primary underline underline-offset-4"
            >
              animated Card Stack
            </a>
            .
          </p>
          <p>
            The preview images and portraits in these examples are local
            showcase assets. Replace their paths and destination links with your
            own content when copying a recipe.
          </p>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="CardStack renders a div and accepts all native div attributes. Inactive cards are inert and hidden from assistive technology; only the active card is interactive."
      >
        <PropsTable caption="CardStack props" rows={cardStackProps} />
      </DocsSection>
    </DocsPage>
  );
}
