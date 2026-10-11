import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { StatTileDashboardRow } from "@/examples/stat-tile/dashboard-row";
import { StatTileSeparate } from "@/examples/stat-tile/separate-tiles";
import { StatTileStates } from "@/examples/stat-tile/states";
import { kpiGroupProps, statTileProps } from "@/lib/props/stat-tile";

export const metadata: Metadata = {
  title: "Stat Tile",
  description:
    "KPI tiles with a headline value, a change indicator and an inline trend.",
};

export default function StatTilePage() {
  return (
    <DocsPage
      name="Stat Tile"
      description="The number first, then what changed, then how it got here. Group tiles into a KPI row that wraps cleanly from phone to wide dashboard."
    >
      <InstallationSection
        registryName="stat-tile"
        importCode={'import { KpiGroup, StatTile } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="A joined KPI panel, linked cards with compact trends, and loading, missing and large-value states."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="stat-tile/dashboard-row.tsx"
            title="KPI row"
            description="A joined panel of four metrics. Churn and latency set positiveDirection to down, so an increase in latency reads as a regression."
          >
            <StatTileDashboardRow />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="stat-tile/separate-tiles.tsx"
            title="Linked tiles"
            description="Separate cards that navigate to a detail view, with the trend beside the value. A tiny change below the threshold reads as flat."
          >
            <StatTileSeparate />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="stat-tile/states.tsx"
            title="Loading, missing and large values"
            description="Skeletons keep the layout while loading. Missing data shows a dash with an explanation instead of a zero."
          >
            <StatTileStates />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable caption="StatTile props" rows={statTileProps} />
          <PropsTable caption="KpiGroup props" rows={kpiGroupProps} />
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Each tile is a group named by its label. The delta is announced as a
          sentence such as &ldquo;Up 8.2% vs last month&rdquo;, so the visible
          comparison is not read twice. The trend is an image with a summary of
          its range. Linked tiles are a single link whose name includes the
          label and value. Wrap a tile in your router&rsquo;s link and set
          interactive to get the same hover and focus treatment. Loading tiles
          set aria-busy and keep their size, so nothing shifts when data
          arrives.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
