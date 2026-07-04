import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SwitchBasic } from "@/examples/switch/basic";
import { SwitchRecipeSettings } from "@/examples/switch/recipe-settings";
import { SwitchStates } from "@/examples/switch/states";
import { switchProps } from "@/lib/props/switch";

export const metadata: Metadata = {
  title: "Switch",
  description:
    "Flip settings on and off with a native-input toggle that announces as a switch.",
};

export default function SwitchPage() {
  return (
    <DocsPage
      name="Switch"
      description="An on/off toggle built on a real checkbox input with role=switch — immediate-effect settings rather than form choices. Three sizes, invalid state, and Field composition for labels and descriptions."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="switch/basic.tsx"
            title="With Field anatomy"
            description="Field wiring gives the switch its label and an optional description."
          >
            <SwitchBasic />
          </ExampleBlock>
          <ExampleBlock
            file="switch/states.tsx"
            title="States and sizes"
            description="On, off, disabled, invalid, and the three control sizes."
          >
            <SwitchStates />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="switch/recipe-settings.tsx"
          title="Settings panel with dependent toggles"
          description="Child switches only apply while the master switch is on, so they disable — and visually recede — instead of silently doing nothing. Disabled state is real, so assistive tech announces it."
        >
          <SwitchRecipeSettings />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="switch"
        importCode={`import { Switch } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Switch renders a real input element, so native form behavior applies."
      >
        <PropsTable caption="Switch props" rows={switchProps} />
      </DocsSection>
    </DocsPage>
  );
}
