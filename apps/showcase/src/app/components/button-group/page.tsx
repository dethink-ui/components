import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { ButtonGroupReviewDesk } from "@/examples/button-group/review-desk";
import { ButtonGroupCanvasControls } from "@/examples/button-group/canvas-controls";
import { ButtonGroupWeekNavigation } from "@/examples/button-group/week-navigation";
import { ButtonGroupBasic } from "@/examples/button-group/basic";
import { ButtonGroupResponsiveActionHandoff } from "@/examples/button-group/responsive-action-handoff";
import {
  buttonGroupProps,
  buttonGroupSeparatorProps,
} from "@/lib/props/button-group";

export const metadata: Metadata = {
  title: "ButtonGroup",
  description: "Keep related buttons together in a row or column.",
};

export default function ButtonGroupPage() {
  return (
    <DocsPage
      name="ButtonGroup"
      description="Keep related buttons together in a row or column."
    >
      <InstallationSection
        registryName="button-group"
        importCode={`import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Attached and separated groups share visual structure, never interaction state."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="button-group/review-desk.tsx"
            title="A considered decision"
            description="Attached decision actions with independent states. Review three documents; each remembers your decision."
          >
            <ButtonGroupReviewDesk />
          </ExampleBlock>
          <ExampleBlock
            file="button-group/canvas-controls.tsx"
            title="A closer look"
            description="A vertical, icon-only group with real zoom controls, boundary states, and a decorative separator."
          >
            <ButtonGroupCanvasControls />
          </ExampleBlock>
          <ExampleBlock
            file="button-group/week-navigation.tsx"
            title="Make room for the week"
            description="Previous, reset, and next actions in a compact attached group. Every button keeps its own Tab stop."
          >
            <ButtonGroupWeekNavigation />
          </ExampleBlock>
          <ExampleBlock
            file="button-group/basic.tsx"
            title="Layouts and states"
            description="Horizontal, vertical, mixed-state, icon-only, and separator compositions using the same two-prop layout contract."
          >
            <ButtonGroupBasic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="responsive-handoff"
        title="Responsive action handoff"
        description="Keep frequent actions visible and move secondary actions into a menu when space is limited."
      >
        <ExampleBlock
          file="button-group/responsive-action-handoff.tsx"
          title="Wide group to narrow overflow"
          description="The same actions work in either layout, including disabled and destructive actions."
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

      <DocsSection id="composition" title="Composition tips">
        <p className="text-muted-foreground max-w-prose text-sm leading-6">
          Use matching button sizes for a clean attached edge. Keep buttons and
          decorative separators as direct children. For narrow screens, let
          separated groups wrap or move secondary actions into a menu; attached
          groups work best on one line. Give each icon button its own accessible
          name.
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
