import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { RevealButtonBasic } from "@/examples/reveal-button/basic";
import { RevealButtonRecipeNavbar } from "@/examples/reveal-button/recipe-navbar";
import { RevealButtonRecipeToolbar } from "@/examples/reveal-button/recipe-toolbar";
import { RevealButtonSizes } from "@/examples/reveal-button/sizes";
import { RevealButtonStates } from "@/examples/reveal-button/states";
import { revealButtonProps } from "@/lib/props/reveal-button";

export const metadata: Metadata = {
  title: "RevealButton",
  description:
    "Show an icon that reveals its label on hover or keyboard focus.",
};

export default function RevealButtonPage() {
  return (
    <DocsPage
      name="RevealButton"
      description="Show an icon that reveals its label on hover or keyboard focus."
    >
      <InstallationSection
        registryName="reveal-button"
        importCode={`import { RevealButton } from "@dethink/components";

export function Example() {
  return <RevealButton icon={<SearchIcon />} label="Search" />;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="reveal-button/basic.tsx"
            title="Variants"
            description="Use the same action hierarchy as Button and IconButton while keeping labels available on demand."
          >
            <RevealButtonBasic />
          </ExampleBlock>
          <ExampleBlock
            file="reveal-button/sizes.tsx"
            title="Sizes"
            description="Collapsed dimensions match IconButton sizes; the revealed label expands inline from the icon box."
          >
            <RevealButtonSizes />
          </ExampleBlock>
          <ExampleBlock
            file="reveal-button/states.tsx"
            title="States"
            description="Loading, disabled, always-visible labels, focus styling, and reduced-motion mode."
          >
            <RevealButtonStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="reveal-button/recipe-navbar.tsx"
            title="Production navbar"
            description="A branded workspace header with persistent navigation and RevealButton actions that stay compact until intent is clear."
            wide
          >
            <RevealButtonRecipeNavbar />
          </ExampleBlock>
          <ExampleBlock
            file="reveal-button/recipe-toolbar.tsx"
            title="Document toolbar"
            description="A compact toolbar where actions stay scannable without permanently taking text-button space."
            wide
          >
            <RevealButtonRecipeToolbar />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="RevealButton renders a real button element and owns its accessible name through label."
      >
        <PropsTable caption="RevealButton props" rows={revealButtonProps} />
      </DocsSection>
    </DocsPage>
  );
}
