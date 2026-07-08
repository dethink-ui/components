import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ButtonAsChild } from "@/examples/button/as-child";
import { ButtonIcons } from "@/examples/button/icons";
import { ButtonLoading } from "@/examples/button/loading";
import { ButtonSizes } from "@/examples/button/sizes";
import { ButtonVariants } from "@/examples/button/variants";
import { buttonProps } from "@/lib/props/button";

export const metadata: Metadata = {
  title: "Button",
  description:
    "Trigger actions with six variants, five sizes, icon slots, and a built-in loading state.",
};

export default function ButtonPage() {
  return (
    <DocsPage
      name="Button"
      description="The workhorse action component: six visual variants, five sizes plus an icon size, decorative icon slots, an accessible loading state, and asChild composition for links."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="button/variants.tsx"
            title="Variants"
            description="Pick emphasis by intent: solid for the primary action, soft and outline for secondary actions, ghost and link for quiet ones, destructive for irreversible operations."
          >
            <ButtonVariants />
          </ExampleBlock>
          <ExampleBlock
            file="button/sizes.tsx"
            title="Sizes"
            description="From xs to xl, plus a square icon size. The md height follows the active density token, so buttons tighten automatically in compact layouts."
          >
            <ButtonSizes />
          </ExampleBlock>
          <ExampleBlock
            file="button/icons.tsx"
            title="With icons"
            description="leftIcon and rightIcon render decorative icons that are hidden from assistive technology; the label carries the meaning."
          >
            <ButtonIcons />
          </ExampleBlock>
          <ExampleBlock
            file="button/loading.tsx"
            title="Loading and disabled"
            description="Setting loading swaps in a spinner, sets aria-busy, and blocks clicks. Try the first button."
          >
            <ButtonLoading />
          </ExampleBlock>
          <ExampleBlock
            file="button/as-child.tsx"
            title="As a link"
            description="asChild merges the button's styling and accessibility attributes onto your own element — typically an anchor or a router link."
          >
            <ButtonAsChild />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="button"
        importCode={`import { Button } from "@dethink/components";

export function Example() {
  return <Button variant="soft">Get started</Button>;
}`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, so every native button prop works too."
      >
        <PropsTable caption="Button props" rows={buttonProps} />
      </DocsSection>
    </DocsPage>
  );
}
