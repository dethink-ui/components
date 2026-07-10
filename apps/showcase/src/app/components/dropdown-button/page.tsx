import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DropdownButtonBasic } from "@/examples/dropdown-button/basic";
import { dropdownButtonProps } from "@/lib/props/dropdown-button";

export const metadata: Metadata = {
  title: "DropdownButton",
  description:
    "A menu, fixed-split, or selectable-primary action composition built from Button, ButtonGroup, and DropdownMenu with Motion-only state feedback.",
};

export default function DropdownButtonPage() {
  return (
    <DocsPage
      name="DropdownButton"
      description="A policy composition for one menu button, a fixed dominant action, or a selected action that becomes the next primary command. It reuses Button visuals, ButtonGroup anatomy, and the React Aria-backed DropdownMenu instead of creating another menu model."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Menu mode performs no direct action. Split mode keeps one fixed dominant action. Selectable mode deliberately separates choosing the next action from executing it."
      >
        <ExampleBlock
          file="dropdown-button/basic.tsx"
          title="Menu button"
          description="Selectable, menu, controlled, split, disabled, loading, destructive, placed, and Motion-configured action examples."
        >
          <DropdownButtonBasic />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="semantics"
        title="Choose it for actions—not values"
        description="DropdownButton narrows a few often-confused interaction patterns."
      >
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            [
              "DropdownButton (menu)",
              "Use when one labelled button reveals a small set of related commands with similar importance. Selecting an item runs an action.",
            ],
            [
              "DropdownMenu",
              "Use the lower-level primitive when the trigger or surrounding composition is product-specific, such as an icon-only row overflow menu.",
            ],
            [
              "Select or Combobox",
              "Use when the user chooses a value that persists in a field. DropdownButton items are commands, not options, and the trigger label does not become the selected item.",
            ],
            [
              "Toolbar",
              "Use for a command surface with toolbar semantics and roving arrow-key focus. DropdownButton is one normal Tab stop before its menu opens.",
            ],
            [
              "Split button",
              "Use when a dominant direct action must remain beside a separately named alternatives trigger. The primary side never opens the menu, and both native buttons stay in normal Tab order.",
            ],
            [
              "DropdownButton (selectable)",
              "Use when choosing one declared command should make it the later primary action. Choosing updates selection only; a separate primary activation runs the selected handler.",
            ],
            [
              "ToggleGroup",
              "Use for persistent pressed state across peer controls. Selectable DropdownButton chooses one future command; it is not a compact toggle surface.",
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
        title="Keyboard, focus, and reduced motion"
        description="The existing DropdownMenu remains the semantic and behavioral owner."
      >
        <div className="text-muted-foreground max-w-prose space-y-3 text-sm leading-6">
          <p>
            Enter, Space, and supported Up/Down Arrow behavior open the menu.
            Arrow keys, Home/End, typeahead, disabled-item skipping, and item
            activation operate inside it. Escape closes the menu and returns
            focus to the trigger.
          </p>
          <p>
            In split mode, Enter and Space on the primary side run only the
            direct action. The icon-only menu half requires a localizable
            <code> menuLabel</code>. Tab and Shift+Tab visit both native buttons
            in document order; Left/Right Arrow does not move between them.
          </p>
          <p>
            Selectable mode keeps the same two-button anatomy. The menu uses
            single-selection <code>menuitemradio</code> semantics and a visible
            checkmark. Choosing with pointer or keyboard changes the selected
            action, closes the menu, and returns focus to the menu trigger
            without executing the handler. The primary half runs the selected
            handler on a later activation.
          </p>
          <p>
            Menu surface presence and changed item feedback use primitives from
            <code> motion/react</code>. The <code>none</code> preset disables
            choreography; reduced motion keeps a short opacity affordance while
            removing transforms. Open, focus, destructive, and disabled meaning
            never depends on movement.
          </p>
        </div>
      </DocsSection>

      <DocsSection
        id="async"
        title="Async and controlled primary actions"
        description="Loading protects the direct action without silently changing what that action means."
      >
        <div className="text-muted-foreground max-w-prose space-y-3 text-sm leading-6">
          <p>
            <code>loading</code> keeps the primary label readable, exposes
            <code> aria-busy</code>, and prevents duplicate primary activation.
            The default <code>loadingBehavior=&quot;all&quot;</code> disables
            the complete composite while work is running.
          </p>
          <p>
            <code>loadingBehavior=&quot;primary&quot;</code> is an explicit
            opt-in. Use it only when every remaining menu item is safe during
            the running primary operation. Whole-composite, primary-only, and
            menu-only disabled states remain separately controllable.
          </p>
          <p>
            Fixed split applications may update <code>label</code>,
            <code> primaryIcon</code>, and <code>onPrimaryAction</code> without
            changing the menu. Selectable mode instead derives all three from
            the chosen action descriptor. Persisting that choice across sessions
            remains application-owned.
          </p>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="dropdown-button"
        importCode={`import {
  DropdownButton,
  type DropdownButtonSelectableAction,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="The discriminated contract separates menu children, fixed split props, and selectable action descriptors so choosing and execution cannot be conflated accidentally."
      >
        <PropsTable caption="DropdownButton props" rows={dropdownButtonProps} />
      </DocsSection>
    </DocsPage>
  );
}
