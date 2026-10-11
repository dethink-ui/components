import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { AreaChartActiveUsers } from "@/examples/area-chart/active-users";
import { AreaChartMrr } from "@/examples/area-chart/mrr";
import { AreaChartSessions } from "@/examples/area-chart/sessions";
import { areaChartProps } from "@/lib/props/area-chart";

export const metadata: Metadata = {
  title: "Area Chart",
  description:
    "Overlapping or stacked areas on one axis with a gradient wash, crosshair tooltip, keyboard readout, legend filtering and a table view.",
};

export default function AreaChartPage() {
  return (
    <DocsPage
      name="Area Chart"
      description="Volume over time on a single y-axis. Stack series to show how parts build a total, or overlap them to compare shapes. The crosshair, keyboard readout and table view work exactly as in Line Chart."
    >
      <InstallationSection
        registryName="area-chart"
        importCode={'import { AreaChart } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="A stacked composition, two overlapping series, and a single series with gaps."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="area-chart/mrr.tsx"
            title="Stacked MRR by plan"
            description="The top edge reads as total MRR. The tooltip, readout and table list each plan's own value, not the cumulative one. Hiding a plan restacks the rest without repainting them."
          >
            <AreaChartMrr />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="area-chart/sessions.tsx"
            title="Overlapping series"
            description="Washes are drawn first and every line on top, so no fill hides another series' edge. Use two or three series at most when overlapping."
          >
            <AreaChartSessions />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="area-chart/active-users.tsx"
            title="Single series with gaps"
            description="One series needs no legend. Missing readings leave a gap in both the wash and the line."
          >
            <AreaChartActiveUsers />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="AreaChart props" rows={areaChartProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          AreaChart shares Line Chart&apos;s accessible shell. The plot is a
          single tab stop named by aria-label or aria-labelledby. Arrow keys,
          Home and End move the crosshair, Escape clears it, and each move is
          announced through a polite live region listing every series&apos; own
          value, stacked or not. The data table is always present for assistive
          technology and can be shown with Table view. Washes are decorative;
          the legend, tooltip and table name every series, so identity never
          relies on color alone.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
