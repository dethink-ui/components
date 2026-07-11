import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CardScrollerFeatures } from "@/examples/card-scroller/features";
import { CardScrollerPricing } from "@/examples/card-scroller/pricing";
import { CardScrollerResponsive } from "@/examples/card-scroller/responsive";
import { CardScrollerThemes } from "@/examples/card-scroller/themes";
import {
  cardScrollerItemProps,
  cardScrollerProps,
} from "@/lib/props/card-scroller";

export const metadata: Metadata = {
  title: "CardScroller",
  description:
    "Select pricing plans or feature groups in a responsive, scroll-snapping row of spotlighted cards.",
};

export default function CardScrollerPage() {
  return (
    <DocsPage
      name="CardScroller"
      description="A selectable row of Card surfaces for SaaS pricing, feature groups, and other visual choices. It adapts to its container, supports grab-to-scroll, snaps one card at a time on narrow screens, and can layer the selected card above its neighbors."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live review surfaces rendered by the exact code shown below each one. Hover or focus a card to inspect spotlight behavior, select a new card, then resize the page to review snapping and controls."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="card-scroller/pricing.tsx"
            title="SaaS pricing selector"
            description="A controlled selection keeps the chosen plan in sync with an action outside the scroller. The selected plan overlaps its neighbors while hover and focus temporarily spotlight another card; drag the row or use the arrow controls to browse."
            wide
          >
            <CardScrollerPricing />
          </ExampleBlock>
          <ExampleBlock
            file="card-scroller/features.tsx"
            title="Feature groups"
            description="The same interaction works for product capabilities, onboarding paths, templates, or any other mutually exclusive visual choice."
            wide
          >
            <CardScrollerFeatures />
          </ExampleBlock>
          <ExampleBlock
            file="card-scroller/responsive.tsx"
            title="Container response"
            description="These side-by-side fixtures make container-query behavior reviewable: the narrow host uses one-card mandatory snapping while the wider host caps its layout at two cards."
            wide
          >
            <CardScrollerResponsive />
          </ExampleBlock>
          <ExampleBlock
            file="card-scroller/themes.tsx"
            title="Theme, density, and direction"
            description="Review the same composition in comfortable light mode and compact dark RTL mode. Controls follow reading direction and every visual state remains token-driven."
            wide
          >
            <CardScrollerThemes />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="card-scroller"
        importCode={`import {
  Card,
  CardScroller,
  CardScrollerItem,
} from "@dethink/components";`}
      />

      <DocsSection
        id="accessibility"
        title="Accessibility"
        description="CardScroller exposes a native single-selection model without turning the Card itself into a nested interactive surface."
      >
        <ul className="text-muted-foreground grid gap-3 text-sm leading-6 sm:grid-cols-2">
          <li className="border-border rounded-lg border p-4">
            Give the radiogroup a specific accessible name and every item a
            concise label.
          </li>
          <li className="border-border rounded-lg border p-4">
            Keep buttons, links, inputs, and menus outside CardScrollerItem; the
            entire card is one radio label.
          </li>
          <li className="border-border rounded-lg border p-4">
            Selection remains visible independently of hover, focus, blur,
            scale, or motion.
          </li>
          <li className="border-border rounded-lg border p-4">
            Reduced-motion and forced-colors preferences receive non-animated,
            non-blurred fallbacks.
          </li>
        </ul>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Both components accept native div attributes in addition to the public props below."
      >
        <div className="space-y-8">
          <PropsTable caption="CardScroller props" rows={cardScrollerProps} />
          <PropsTable
            caption="CardScrollerItem props"
            rows={cardScrollerItemProps}
          />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
