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
import { CardStackOpen } from "@/examples/card-stack/open";
import { cardStackProps } from "@/lib/props/card-stack";

export const metadata: Metadata = {
  title: "CardStack",
  description:
    "Cycle Card children as a layered deck or fanned arc with looping, built-in controls, and a controllable index.",
};

export default function CardStackPage() {
  return (
    <DocsPage
      name="CardStack"
      description="A focusable group that cycles direct Card children as a layered deck or a fanned arc. Navigation works three ways: the built-in previous/next controls, Arrow/Home/End keys while the group has focus, and clicking a visible card in open mode."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Focus a stack and use Arrow, Home, and End keys to navigate."
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
        </div>
      </DocsSection>

      <InstallationSection
        registryName="card-stack"
        importCode={`import { Card, CardStack } from "@dethink/components";`}
      />

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
