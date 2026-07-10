import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ButtonGroupBasic } from "@/examples/button-group/basic";
import { ButtonGroupResponsiveActionHandoff } from "@/examples/button-group/responsive-action-handoff";
import {
  buttonGroupProps,
  buttonGroupSeparatorProps,
} from "@/lib/props/button-group";

export const metadata: Metadata = {
  title: "ButtonGroup",
  description:
    "Group related native actions in attached or separated horizontal and vertical layouts without changing their behavior.",
};

export default function ButtonGroupPage() {
  return (
    <DocsPage
      name="ButtonGroup"
      description="A semantic action-layout primitive that makes related Buttons read as one unit while preserving normal Tab order, native activation, form behavior, disabled and loading states, and RTL geometry."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Attached and separated groups share visual structure, never interaction state."
      >
        <ExampleBlock
          file="button-group/basic.tsx"
          title="Action groups"
          description="Horizontal, vertical, mixed-state, icon-only, and separator compositions using the same two-prop layout contract."
        >
          <ButtonGroupBasic />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="responsive-handoff"
        title="Responsive action handoff"
        description="The product declares one container threshold and keeps action ownership stable across representations."
      >
        <ExampleBlock
          file="button-group/responsive-action-handoff.tsx"
          title="Wide group to narrow overflow"
          description="The narrow representation is the no-container-query fallback. At the declared container threshold, the same action definitions render in ButtonGroup; IDs, labels, disabled rules, destructive meaning, and handlers are preserved."
        >
          <ButtonGroupResponsiveActionHandoff />
        </ExampleBlock>
        <p className="text-muted-foreground mt-4 max-w-prose text-sm leading-6">
          This is an application recipe, not automatic component behavior.
          ButtonGroup never measures children, infers priority, hides actions,
          installs a ResizeObserver, or becomes a Toolbar. Choose the threshold
          and the always-visible action IDs from product requirements.
        </p>
      </DocsSection>

      <DocsSection
        id="semantics"
        title="Choose the semantic owner"
        description="ButtonGroup is deliberately narrower than the components it is often confused with."
      >
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            [
              "ButtonGroup",
              "Use for a small set of related independent actions. Every enabled control stays in the normal Tab order; arrow keys do nothing special.",
            ],
            [
              "ToggleGroup",
              "Use when controls represent single or multiple pressed selections and the selected value belongs to the group.",
            ],
            [
              "Toolbar",
              "Use for a command surface that requires toolbar semantics, roving focus, and arrow-key navigation.",
            ],
            [
              "DropdownButton",
              "Use when a visible action opens a menu, or when a primary action and its alternatives form a split button.",
            ],
            [
              "InputGroup",
              "Use when controls are attached to an input and participate in a field's labelling, validation, or editing workflow.",
            ],
          ].map(([term, description]) => (
            <div key={term} className="border-border rounded-lg border p-4">
              <dt className="font-semibold">{term}</dt>
              <dd className="text-muted-foreground mt-1 leading-6">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection
        id="accessibility"
        title="Accessibility and keyboard behavior"
        description="Label the relationship; leave each action's behavior native."
      >
        <div className="text-muted-foreground max-w-prose space-y-3 text-sm leading-6">
          <p>
            Supply <code>aria-label</code> or <code>aria-labelledby</code> on
            every group. Icon-only children still need their own accessible
            names.
          </p>
          <p>
            Tab and Shift+Tab visit each enabled child in document order. Enter
            and Space activate the focused native button. ButtonGroup does not
            add arrow-key navigation, selection values, pressed state, shared
            loading, child measurement, or automatic overflow.
          </p>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="button-group"
        importCode={`import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
} from "@dethink/components";`}
      />

      <DocsSection id="props" title="Props">
        <div className="space-y-8">
          <PropsTable caption="ButtonGroup props" rows={buttonGroupProps} />
          <PropsTable
            caption="ButtonGroupSeparator props"
            rows={buttonGroupSeparatorProps}
          />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
