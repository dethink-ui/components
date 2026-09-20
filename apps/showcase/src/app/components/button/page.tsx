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
  description: "Run an action, such as saving a form or opening a dialog.",
};

export default function ButtonPage() {
  return (
    <DocsPage
      name="Button"
      description="Run an action, such as saving a form or opening a dialog."
    >
      <InstallationSection
        registryName="button"
        importCode={`import { Button } from "@dethink/components";

export function Example() {
  return <Button variant="soft">Get started</Button>;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="button/variants.tsx"
            title="Variants"
            description="Use solid for the main action, outline for secondary actions, and destructive for actions such as deleting."
          >
            <ButtonVariants />
          </ExampleBlock>
          <ExampleBlock
            file="button/sizes.tsx"
            title="Sizes"
            description="Choose a size from xs to xl. Use IconButton for an action with no visible label."
          >
            <ButtonSizes />
          </ExampleBlock>
          <ExampleBlock
            file="button/icons.tsx"
            title="With icons"
            description="Add an icon before or after the label with leftIcon or rightIcon. Keep the label clear without the icon."
          >
            <ButtonIcons />
          </ExampleBlock>
          <ExampleBlock
            file="button/loading.tsx"
            title="Loading and disabled"
            description="Set loading while an action is running. It shows a spinner and prevents extra clicks."
          >
            <ButtonLoading />
          </ExampleBlock>
          <ExampleBlock
            file="button/as-child.tsx"
            title="As a link"
            description="Use asChild to style a link as a button. The link still takes users to another page."
          >
            <ButtonAsChild />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Also accepts standard button props, such as onClick, type, and aria-label."
      >
        <PropsTable caption="Button props" rows={buttonProps} />
      </DocsSection>
    </DocsPage>
  );
}
