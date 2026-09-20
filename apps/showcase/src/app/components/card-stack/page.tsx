import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CardStackBasic } from "@/examples/card-stack/basic";
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
      description="Let users browse cards arranged in a stack or fan."
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
            file="card-stack/basic.tsx"
            title="Stacked deck"
            description="The default stack mode layers cards behind the active one and shows previous/next controls automatically when there is more than one card."
          >
            <CardStackBasic />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/open.tsx"
            title="Open fan"
            description="Open mode spreads the deck into an arc — angle controls the per-card rotation, and clicking any visible card brings it to the front."
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
            title="Controlled"
            description="Drive the stack from external state with activeIndex and onActiveIndexChange — here a row of index buttons doubles as a pagination indicator."
          >
            <CardStackControlled />
          </ExampleBlock>
          <ExampleBlock
            file="card-stack/hidden-controls.tsx"
            title="Hidden controls"
            description="Hide the built-in icon buttons when another element drives navigation. showControls={false} hides both, while showPreviousControl/showNextControl hide just one side — here the back chevron is hidden and custom buttons advance the deck."
          >
            <CardStackHiddenControls />
          </ExampleBlock>
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
