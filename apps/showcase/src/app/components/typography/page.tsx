import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { TypographyRecipeArticle } from "@/examples/typography/recipe-article";
import { TypographyScale } from "@/examples/typography/scale";
import { TypographyTones } from "@/examples/typography/tones";
import { typographyProps } from "@/lib/props/typography";

export const metadata: Metadata = {
  title: "Typography",
  description:
    "Set text hierarchy with Heading, Text, and Typography: levels, sizes, tones, weights, truncation, and clamping.",
};

export default function TypographyPage() {
  return (
    <DocsPage
      name="Typography"
      description="Three pieces cover most text: Heading keeps the document outline honest while visualLevel styles freely, Text handles body copy with sizes, tones, and weights, and Typography offers preset variants on a polymorphic element for everything else."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="typography/scale.tsx"
            title="Headings and body scale"
            description="level sets the semantic element; visualLevel sets the size — outline and appearance decouple cleanly."
          >
            <TypographyScale />
          </ExampleBlock>
          <ExampleBlock
            file="typography/tones.tsx"
            title="Tones, variants, and truncation"
            description="Semantic tones from the token system, preset Typography variants, and single-line truncation."
          >
            <TypographyTones />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="typography/recipe-article.tsx"
          title="Article header"
          description="Kicker, headline, standfirst, byline, and a clamped lede — a complete editorial hierarchy from the semantic pieces, no ad hoc classes."
        >
          <TypographyRecipeArticle />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="typography"
        importCode={`import { Heading, Text, Typography } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="All three render real text elements and accept native attributes."
      >
        <PropsTable caption="Typography props" rows={typographyProps} />
      </DocsSection>
    </DocsPage>
  );
}
