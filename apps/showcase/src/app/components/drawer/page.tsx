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
  description:
    "Edge-anchored modal and push panels with spring drag-to-dismiss, snap points, background scale, edge-swipe-to-open, and nested-drawer recede.",
};

export default function DrawerPage() {
  return (
    <DocsPage
      name="Drawer"
      description="One unified component family covering all four edge directions through a direction prop, rather than shadcn's split Sheet (side-anchored, CSS-only) and Drawer (vaul, bottom-sheet-only) primitives. Modal mode reuses Dialog's focus-trapping substrate; modal={false} renders a non-modal push panel that shifts sibling layout instead of overlaying it. Snap points, drag-to-dismiss, background scale, edge-swipe, nested drawers, and shared-element morph use Motion as a required runtime dependency while collapsing cleanly to a CSS-only core under reduced motion or motionPreset=&quot;none&quot;."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        description="Production-shaped compositions that go beyond exercising props."
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
            description="Snap points (35%, 65%, fully open) with a draggable handle and controlled active snap point."
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
            description="A drawer opened from inside another drawer automatically recedes its parent."
          >
            <DrawerNestedDrillDownEdit />
          </ExampleBlock>
        </div>
      </DocsSection>

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
        id="props"
        title="Props"
        description="Drawer coordinates the trigger and open state; DrawerContent carries the panel, motion, and dismissal options."
      >
        <PropsTable caption="Drawer anatomy" rows={drawerProps} />
      </DocsSection>
    </DocsPage>
  );
}
