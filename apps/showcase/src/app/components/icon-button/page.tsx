import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { IconButtonBasic } from "@/examples/icon-button/basic";
import { IconButtonRecipePlayer } from "@/examples/icon-button/recipe-player";
import { IconButtonStates } from "@/examples/icon-button/states";
import { iconButtonProps } from "@/lib/props/icon-button";

export const metadata: Metadata = {
  title: "IconButton",
  description:
    "Icon-only actions with enforced accessible names, five variants, five sizes, shapes, and a loading state.",
};

export default function IconButtonPage() {
  return (
    <DocsPage
      name="IconButton"
      description="A square (or circular) button for icon-only actions. Its accessible name is enforced at the type level — aria-label or aria-labelledby is required to compile — so icon buttons can never ship nameless. Pairs naturally with Tooltip for visible hints."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="icon-button/basic.tsx"
            title="Variants and shapes"
            description="The Button variants minus link, plus a circle shape."
          >
            <IconButtonBasic />
          </ExampleBlock>
          <ExampleBlock
            file="icon-button/states.tsx"
            title="Sizes, loading, and disabled"
            description="Five sizes with auto-scaled icons; loading swaps the icon for a spinner and makes the button inert."
          >
            <IconButtonStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="icon-button/recipe-player.tsx"
          title="Player bar"
          description="Toggle buttons done right: the Play button's accessible name flips with its state, likes and repeat carry aria-pressed, and a live region narrates the state for screen readers."
        >
          <IconButtonRecipePlayer />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="icon-button"
        importCode={`import { IconButton } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="IconButton renders a real button element."
      >
        <PropsTable caption="IconButton props" rows={iconButtonProps} />
      </DocsSection>
    </DocsPage>
  );
}
