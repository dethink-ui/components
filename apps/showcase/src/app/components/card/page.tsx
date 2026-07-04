import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CardWithAction } from "@/examples/card/action";
import { CardBasic } from "@/examples/card/basic";
import { CardSignInForm } from "@/examples/card/form";
import { CardOptions } from "@/examples/card/options";
import { cardProps, cardSubcomponentProps } from "@/lib/props/card";

export const metadata: Metadata = {
  title: "Card",
  description:
    "Group related content with a composable header, title, description, action, content, and footer anatomy.",
};

export default function CardPage() {
  return (
    <DocsPage
      name="Card"
      description="A composable surface for grouping related content. Six anatomy pieces — header, title, description, action, content, footer — plus surface, border, shadow, radius, and density-aware spacing options."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="card/basic.tsx"
            title="Anatomy"
            description="Header, title, description, content, and a footer with justified actions."
          >
            <CardBasic />
          </ExampleBlock>
          <ExampleBlock
            file="card/action.tsx"
            title="Header action"
            description="CardAction pins controls to the end of the header — icon buttons, menus, or badges — while the title and description keep their column."
          >
            <CardWithAction />
          </ExampleBlock>
          <ExampleBlock
            file="card/options.tsx"
            title="Surfaces, borders, and spacing"
            description="Mix surface, border, shadow, radius, and spacing to move between elevated cards, quiet sections, and dense dashboard tiles."
          >
            <CardOptions />
          </ExampleBlock>
          <ExampleBlock
            file="card/form.tsx"
            title="Composition"
            description="Cards compose naturally with other Dethink components — here a sign-in form built from Input and Button."
          >
            <CardSignInForm />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="card"
        importCode={`import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Card and its section components accept all native attributes of the element they render."
      >
        <div className="space-y-8">
          <PropsTable caption="Card props" rows={cardProps} />
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold">Section components</h3>
            <PropsTable
              caption="Card subcomponent props"
              rows={cardSubcomponentProps}
            />
          </div>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
