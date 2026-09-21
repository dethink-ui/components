import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DrawerAndroidBottomSheet } from "@/examples/drawer/android-bottom-sheet";
import { DrawerBasic } from "@/examples/drawer/basic";
import { DrawerDirectionalSizing } from "@/examples/drawer/directional-sizing";
import { DrawerFilterBottomSheet } from "@/examples/drawer/filter-bottom-sheet";
import { DrawerInspectorRail } from "@/examples/drawer/inspector-rail";
import { DrawerMobileNavigation } from "@/examples/drawer/mobile-navigation";
import { DrawerNestedDrillDownEdit } from "@/examples/drawer/nested-drill-down-edit";
import { DrawerSchedulerEventDetail } from "@/examples/drawer/scheduler-event-detail";
import { drawerProps } from "@/lib/props/drawer";

export const metadata: Metadata = {
  title: "Drawer",
  description: "Open a panel from the edge of the screen.",
};

export default function DrawerPage() {
  return (
    <DocsPage
      name="Drawer"
      description="Open a panel from the edge of the screen."
    >
      <InstallationSection
        registryName="drawer"
        importCode={`import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="drawer/basic.tsx"
            title="Basic"
            description="Trigger, sized content, header anatomy, and footer with DrawerClose buttons."
          >
            <DrawerBasic />
          </ExampleBlock>
          <ExampleBlock
            file="drawer/directional-sizing.tsx"
            title="Direction-aware sizing"
            description="One recipe exercises all four edges plus preset, full-axis, and custom dimension sizing."
          >
            <DrawerDirectionalSizing />
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
            file="drawer/mobile-navigation.tsx"
            title="Mobile navigation drawer"
            description="A left-anchored menu opened via the trigger or an edge swipe from the left."
          >
            <DrawerMobileNavigation />
          </ExampleBlock>
          <ExampleBlock
            file="drawer/filter-bottom-sheet.tsx"
            title="Mobile filter bottom sheet"
            description="Drag or use the size buttons to resize. Filters scroll independently while Apply stays reachable at every snap point."
          >
            <DrawerFilterBottomSheet />
          </ExampleBlock>
          <ExampleBlock
            file="drawer/android-bottom-sheet.tsx"
            title="Compact Android bottom sheet"
            description="A centered 450px-wide bottom sheet with icon-led quick links and light-dismiss."
          >
            <DrawerAndroidBottomSheet />
          </ExampleBlock>
          <ExampleBlock
            file="drawer/inspector-rail.tsx"
            title="Persistent inspector-rail push panel"
            description="modal={false} shifts the record list's layout instead of overlaying it, and never traps focus."
            wide
          >
            <DrawerInspectorRail />
          </ExampleBlock>
          <ExampleBlock
            file="drawer/scheduler-event-detail.tsx"
            title="Scheduler event-detail drawer"
            description="backgroundScale dims and scales the page behind a modal drawer opened from a calendar grid."
          >
            <DrawerSchedulerEventDetail />
          </ExampleBlock>
          <ExampleBlock
            file="drawer/nested-drill-down-edit.tsx"
            title="Nested drill-down edit flow"
            description="Edit and save a record status in a nested drawer, or go Back without saving. The parent remains visible behind the editor."
          >
            <DrawerNestedDrillDownEdit />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Drawer coordinates the trigger and open state; DrawerContent carries the panel, motion, and dismissal options."
      >
        <p className="text-muted-foreground mb-4 text-sm">
          Snap points are fractions of the configured drawer size. Initialize a
          controlled snap point to one of the supplied stops. For a fixed header
          and footer, put scrolling content in a min-h-0 flex-1 overflow-y-auto
          body. Provide buttons alongside drag resizing. With reduced motion,
          the panel opens at its full configured size without drag or spring
          animation, keeping every control accessible.
        </p>
        <PropsTable caption="Drawer anatomy" rows={drawerProps} />
      </DocsSection>
    </DocsPage>
  );
}
