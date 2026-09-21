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
    "Manage available time slots and let users request bookings in their time zone.",
};

export default function SlotPlannerPage() {
  return (
    <DocsPage
      wide
      name="SlotPlanner"
      description="Manage available time slots and let users request bookings in their time zone."
    >
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
        id="examples"
        title="Examples"
        description="SlotPlanner manages the provider-facing inventory; SlotPicker projects the same slots for booking."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="slot-planner/basic.tsx"
            title="Manage mode"
            description="Compare availability across the week. Select a slot to manage its day; narrow containers show a daily agenda."
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

      <DocsSection
        id="interaction"
        title="Using the planner"
        description="Choose a date, then add or manage its slots."
      >
        <div className="text-muted-foreground space-y-4 text-sm leading-7">
          <p>
            The weekly calendar appears when the component has at least 620px of
            space. Select Saturday or Sunday to show the weekend. Select an
            appointment to open its day. The appointment menu contains Edit and
            Delete; Day actions contains copy and clear options. Choose Week to
            return to the calendar. Narrow containers show a date strip and
            daily agenda.
          </p>
          <p>
            The calendar projects appointments into the time zone shown above
            it. The day editor uses the original appointment’s zone and date.
            Pass timeZone explicitly for consistent server and browser
            rendering. Slots crossing midnight appear on each affected day.
            Short slots have a minimum hit target and overlaps use separate
            lanes; the written times give the exact duration.
          </p>
          <p>
            The editor includes duration presets and a custom duration field.
            More options contains capacity, buffers, time zone, tags, and notes.
            The end-time preview updates as you edit. New slots must meet the
            notice period and start in the future. Existing recurring
            appointments retain the choice between one occurrence and the whole
            series.
          </p>
          <p>
            Use Tab to reach calendar controls and appointments, and Enter or
            Space to activate them. In the compact date strip, use arrow keys,
            Home, and End. Dialogs contain focus, close with Escape, and return
            focus to their trigger. Status labels communicate availability
            alongside colour. Motion follows reduced-motion preferences.
          </p>
          <p>
            SlotPicker shows Request sent after its callback succeeds and
            prevents repeat activation for that occurrence while the picker
            stays mounted. This acknowledgement is local to the current picker.
            Your application owns authentication, persistent request state, seat
            enforcement, cancellation, and duplicate prevention across sessions.
          </p>
          <p>
            Set weekLayout="agenda" to retain the earlier weekday-rail
            presentation. Providing custom renderers also retains that
            presentation, including the existing tab, list-item, and renderer
            semantics. The slot data model and mutation callback payloads are
            unchanged.
          </p>
        </div>
      </DocsSection>
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
