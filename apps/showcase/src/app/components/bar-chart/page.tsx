import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { BarChartNetRevenue } from "@/examples/bar-chart/net-revenue";
import { BarChartSignups } from "@/examples/bar-chart/signups";
import { BarChartTickets } from "@/examples/bar-chart/tickets";
import { barChartProps } from "@/lib/props/bar-chart";

export const metadata: Metadata = {
  title: "Bar Chart",
  description:
    "Grouped or stacked bars on a zero-based axis with per-bar hover, a keyboard readout, legend filtering and a table view.",
};

export default function BarChartPage() {
  return (
    <DocsPage
      name="Bar Chart"
      description="Compare values across categories or periods. Group series side by side to compare them directly, or stack them so each bar reads as a total. Bars always grow from zero."
    >
      <InstallationSection
        registryName="bar-chart"
        importCode={'import { BarChart } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Grouped series, a stacked chart with negative values, and a single series."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="bar-chart/signups.tsx"
            title="Grouped by channel"
            description="Hovering anywhere in a month highlights it and lists every channel; the bar under the pointer is emphasised in the tooltip and the other series dim."
          >
            <BarChartSignups />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="bar-chart/net-revenue.tsx"
            title="Stacked with negatives"
            description="Positive values stack up and negative values stack down from zero. Segments are separated by a 2px surface gap and only the outermost segment on each side is rounded."
          >
            <BarChartNetRevenue />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="bar-chart/tickets.tsx"
            title="Single series"
            description="One series needs no legend. Bars stay at most 24px thick however wide the chart is."
          >
            <BarChartTickets />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="BarChart props" rows={barChartProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          BarChart shares Line Chart&apos;s accessible shell. The plot is a
          single tab stop named by aria-label or aria-labelledby. Arrow keys,
          Home and End move between categories, Escape clears the highlight, and
          each move is announced through a polite live region listing every
          series&apos; own value. The data table is always present for assistive
          technology and can be shown with Table view. The legend, tooltip and
          table name every series, so identity never relies on color alone.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
