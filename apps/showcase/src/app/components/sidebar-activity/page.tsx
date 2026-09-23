import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SidebarActivityExample } from "@/examples/sidebar/activity";

export const metadata: Metadata = {
  title: "SidebarActivity",
  description: "Keep background work visible while you navigate.",
};

export default function SidebarActivityPage() {
  return (
    <DocsPage
      name="SidebarActivity"
      description="Keep background work visible while you navigate. Show AI runs, imports, exports, and work that needs attention in a compact sidebar region."
    >
      <InstallationSection
        registryName="sidebar-activity"
        importCode={
          'import { SidebarActivity, type SidebarActivityItem } from "@dethink/components";'
        }
      />
      <DocsSection
        id="examples"
        title="Background work"
        description="Approve a brief, finish a run, or collapse the sidebar. The compact summary brings you back to the work that needs you."
      >
        <ExampleBlock file="sidebar/activity.tsx" title="Work in progress">
          <SidebarActivityExample />
        </ExampleBlock>
      </DocsSection>
      <DocsSection
        id="composition"
        title="Composition and ownership"
        description="Place SidebarActivity inside SidebarContent so long activity lists can scroll with navigation."
      >
        <div className="text-muted-foreground space-y-3 text-sm">
          <p>
            Use it inside SidebarProvider and a Sidebar or SidebarMobile
            surface. Pass stable item IDs and a short, curated list. Your
            application owns data fetching, task execution, item ordering, and
            persistence. Progress is a percentage; finite values are clamped to
            0–100 and omitted values show indeterminate progress for running
            items.
          </p>
          <p>
            In a collapsed sidebar the summary expands navigation and focuses
            the activity region. Controlled collapse waits for your state
            update. For a permanent rail, pass onOpen to show your own details
            surface; without it the summary is informational. Mobile drawers
            always expose expanded activity details, even when desktop
            navigation is collapsed.
          </p>
          <p>
            Native links handle navigation and native buttons invoke onAction.
            No routing, polling, cancellation, or task execution is built in.
            Keep item order stable while users interact; the example puts
            attention items first without automatically reordering them.
          </p>
        </div>
      </DocsSection>
      <DocsSection id="props" title="Props">
        <PropsTable
          caption="SidebarActivity props"
          rows={[
            {
              prop: "items",
              type: "readonly SidebarActivityItem[]",
              description:
                "Stable id, title, status, optional description, progress and action for each item.",
            },
            {
              prop: "status",
              type: '"running" | "attention" | "complete" | "queued"',
              description:
                "Readable status plus a distinct icon. Only running items display progress.",
            },
            {
              prop: "action",
              type: "{ label, href } | { label, onAction }",
              description: "One native link or button action per item.",
            },
            {
              prop: "label / emptyMessage / openLabel",
              type: "string / ReactNode / string",
              defaultValue: "Activity / All caught up / Open activity",
              description:
                "Section title, empty content, and compact button label.",
            },
            {
              prop: "statusLabels / formatSummary",
              type: "Partial<Record<SidebarActivityStatus, string>> / (counts) => string",
              description:
                "Localize status text and the accessible summary. Summary counts include all four statuses.",
            },
            {
              prop: "onOpen",
              type: "() => void",
              description:
                "Optional compact-summary action replacing expansion; useful for permanent rails.",
            },
            {
              prop: "useSidebarState",
              type: "() => SidebarState",
              description:
                "For custom sidebar extensions: resolved collapsed, side, variant, and setCollapsed. Requires SidebarProvider; respects the current mobile/desktop surface.",
            },
          ]}
        />
      </DocsSection>
      <DocsSection
        id="accessibility"
        title="Accessibility and verification"
        description="Status uses text and icons alongside semantic colors. The list keeps native navigation and button behavior."
      >
        <p className="text-muted-foreground text-sm">
          A polite summary announces changes to status counts, not every
          progress tick. Use statusLabels and formatSummary for localization.
          The region receives focus after compact expansion; native progress
          elements have item-specific accessible names. Tokenized styles inherit
          theme and density. Rendered interaction, axe, SSR/hydration, browser
          focus/mobile checks and registry install smoke tests cover the
          component. This is an additive component with no migration required.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
