import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DeltaBadgeFormats } from "@/examples/delta-badge/formats";
import { DeltaBadgeMeanings } from "@/examples/delta-badge/meanings";
import { deltaBadgeProps } from "@/lib/props/delta-badge";

export const metadata: Metadata = {
  title: "Delta Badge",
  description:
    "A signed change with a direction icon, colored by whether the change is good.",
};

export default function DeltaBadgePage() {
  return (
    <DocsPage
      name="Delta Badge"
      description="Up is not always good. DeltaBadge colors a change by what it means for the metric, and always shows the direction with an icon and a sign."
    >
      <InstallationSection
        registryName="delta-badge"
        importCode={'import { DeltaBadge } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Meaning across variants, and custom units."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="delta-badge/meanings.tsx"
            title="Direction and meaning"
            description="Churn falling and latency rising both flip color when positiveDirection is down. The error-budget change sits under the neutral threshold."
          >
            <DeltaBadgeMeanings />
          </ExampleBlock>
          <ExampleBlock
            file="delta-badge/formats.tsx"
            title="Units"
            description="Percent by default. Pass formatValue for currency, durations or points; the sign and icon are added for you."
          >
            <DeltaBadgeFormats />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <PropsTable caption="DeltaBadge props" rows={deltaBadgeProps} />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Direction never depends on color: every badge has an arrow icon and a
          sign, using a true minus. Screen readers hear one sentence, such as
          &ldquo;Down 0.8% vs last month&rdquo;, instead of symbols. Whether a
          change is good is shown by tone, so name the metric nearby. Text stays
          in the foreground color for contrast; only the tint and icon carry the
          status color.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
