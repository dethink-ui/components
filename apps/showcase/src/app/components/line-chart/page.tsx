import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { LineChartLatency } from "@/examples/line-chart/latency";
import { LineChartRevenue } from "@/examples/line-chart/revenue";
import { LineChartTableView } from "@/examples/line-chart/table-view";
import { lineChartProps } from "@/lib/props/line-chart";

export const metadata: Metadata = {
  title: "Line Chart",
  description:
    "Multi-series trends on one axis with a crosshair tooltip, keyboard readout, legend filtering and a table view.",
};

export default function LineChartPage() {
  return (
    <DocsPage
      name="Line Chart"
      description="Trends over time on a single y-axis. The crosshair finds the x position so readers never aim at a 2px line, and every value is also available as a table."
    >
      <InstallationSection
        registryName="line-chart"
        importCode={'import { LineChart } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Three series in currency, a single series with gaps, and controlled filtering with the table view."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="line-chart/revenue.tsx"
            title="Revenue vs spend"
            description="Hover, or focus the chart and use the arrow keys: the tooltip lists every series at that month. Hovering a legend item dims the others; clicking it hides that series without repainting the rest."
          >
            <LineChartRevenue />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="line-chart/latency.tsx"
            title="Single series with gaps"
            description="One series needs no legend. Missing readings stay gaps, and includeZero={false} fits the axis to the data."
          >
            <LineChartLatency />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="line-chart/table-view.tsx"
            title="Controlled filters and table view"
            description="hiddenSeries and showTable can be controlled, for example to persist them in the URL."
          >
            <LineChartTableView />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="LineChart props" rows={lineChartProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          The plot is a single tab stop named by aria-label or aria-labelledby,
          with a description listing the series and range. Arrow keys move the
          crosshair one point at a time, Home and End jump to the ends, and
          Escape clears it; each move is announced through a polite live region,
          listing every series. The data table is always in the page for
          assistive technology and can be shown visually with Table view. Legend
          items are toggle buttons with aria-pressed. Series identity never
          relies on color alone: the legend, tooltip and table all name each
          series. Tooltip content renders as text, never HTML.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
