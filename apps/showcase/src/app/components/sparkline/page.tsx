import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { CodeBlock } from "@/components/code-block";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SparklineMetricsTable } from "@/examples/sparkline/metrics-table";
import { SparklinePalette } from "@/examples/sparkline/palette";
import { SparklineVariants } from "@/examples/sparkline/variants";
import { sparklineProps } from "@/lib/props/sparkline";

export const metadata: Metadata = {
  title: "Sparkline",
  description:
    "Compact line, area and bar trends drawn in the Dethink chart palette.",
};

const themingCode = `/* Override any slot, per theme, after the Dethink base styles. */
:root {
  --dt-color-chart-1-light: oklch(0.55 0.2 265);
  --dt-color-chart-1-dark: oklch(0.68 0.17 265);
}

/* Or scope a palette to one dashboard. */
.finance-dashboard {
  --dt-color-chart-1: var(--brand-ink);
}`;

export default function SparklinePage() {
  return (
    <DocsPage
      name="Sparkline"
      description="A trend without the chart chrome. Put it beside a number, inside a table row, or at the foot of a KPI tile."
    >
      <InstallationSection
        registryName="sparkline"
        importCode={'import { Sparkline } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Three shapes for the same data, trends that sit inside table rows, and the full chart palette."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="sparkline/variants.tsx"
            title="Line, area and bar"
            description="Line for continuous trends, a gradient area for volume, and bars for discrete periods with the latest emphasized."
          >
            <SparklineVariants />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="sparkline/metrics-table.tsx"
            title="Inline in a table"
            description="Each metric keeps its own slot. A missing week stays a visible gap instead of an invented value."
          >
            <SparklineMetricsTable />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="sparkline/palette.tsx"
            title="Chart palette"
            description="Eight categorical slots, assigned in order. Series keep their slot when others are filtered out."
          >
            <SparklinePalette />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="Sparkline props" rows={sparklineProps} />
      </DocsSection>
      <DocsSection id="theming" title="Chart palette tokens">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every Dethink chart reads its colors from{" "}
            <code>--dt-color-chart-1</code> to <code>--dt-color-chart-8</code>,
            plus <code>-grid</code>, <code>-axis</code> and{" "}
            <code>-crosshair</code> for chart chrome. Each slot has separate
            light and dark values, and Tailwind exposes them as{" "}
            <code>bg-chart-3</code>, <code>stroke-chart-3</code> and so on. The
            default order is validated for color-vision deficiency on both
            surfaces. Aqua, yellow and magenta sit below 3:1 contrast on white,
            so pair them with labels or a table. If you replace the palette,
            re-check it for adjacent-pair separation before shipping.
          </p>
          <CodeBlock lang="css" filename="globals.css" code={themingCode} />
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          A Sparkline is an image with a generated summary: the count, first and
          last values, low and high. Set label to name the metric and period,
          and formatValue to match how the value appears elsewhere. Inside a
          tile or row whose text already states the numbers, set decorative so
          screen readers do not hear them twice. The draw-in animation is
          skipped when reduced motion is requested.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
