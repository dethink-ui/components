import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SlotPlannerBasic } from "@/examples/slot-planner/basic";
import { SlotPlannerBookMode } from "@/examples/slot-planner/book-mode";
import { SlotPlannerConstraints } from "@/examples/slot-planner/constraints";
import { SlotPlannerCustomRenderer } from "@/examples/slot-planner/custom-renderer";
import { SlotPlannerTaxonomy } from "@/examples/slot-planner/taxonomy";
import { slotPickerProps, slotPlannerProps } from "@/lib/props/slot-planner";

export const metadata: Metadata = {
  title: "SlotPlanner",
  description:
    "Manage a bookable time-slot inventory with week/day views, recurrence, and constraints, and project the same slots into a viewer's time zone for booking.",
};

export default function SlotPlannerPage() {
  return (
    <DocsPage
      name="SlotPlanner"
      description="A provider-facing manage mode with week/day views, an editor dialog, recurrence, and constraints, plus a consumer-facing book mode that projects the same slot collection into the viewer's time zone."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="SlotPlanner manages the provider-facing inventory; SlotPicker projects the same slots for booking."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="slot-planner/basic.tsx"
            title="Manage mode"
            description="Uncontrolled week view with mixed slot states, capacity, and a pending request."
          >
            <SlotPlannerBasic />
          </ExampleBlock>
          <ExampleBlock
            file="slot-planner/constraints.tsx"
            title="Constraints and cap meter"
            description="A daily requestable cap, minimum notice, and a duration increment surfaced inline as the cap fills."
          >
            <SlotPlannerConstraints />
          </ExampleBlock>
          <ExampleBlock
            file="slot-planner/taxonomy.tsx"
            title="Custom taxonomy"
            description='The same component phrased through a custom vocabulary — "sessions" instead of "slots".'
          >
            <SlotPlannerTaxonomy />
          </ExampleBlock>
          <ExampleBlock
            file="slot-planner/book-mode.tsx"
            title="Book mode with a distinct viewer zone"
            description="SlotPicker projects provider-zone slots into a different viewer time zone and reports requests without mutating the collection itself."
          >
            <SlotPlannerBookMode />
          </ExampleBlock>
          <ExampleBlock
            file="slot-planner/custom-renderer.tsx"
            title="Custom slot card renderer"
            description="Every surface exposes renderDefault() so a custom renderer can decorate the shipped card instead of rebuilding it."
          >
            <SlotPlannerCustomRenderer />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="slot-planner"
        importCode={`import {
  SlotPicker,
  SlotPlanner,
  useSlotPlanner,
  validateSlotPlannerSlots,
  type SlotPlannerConstraints,
  type SlotPlannerSlotData,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="SlotPlanner (manage mode) and SlotPicker (book mode) share the same slot data model and taxonomy/motion/focus props."
      >
        <div className="space-y-6">
          <PropsTable caption="SlotPlanner props" rows={slotPlannerProps} />
          <PropsTable caption="SlotPicker props" rows={slotPickerProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
