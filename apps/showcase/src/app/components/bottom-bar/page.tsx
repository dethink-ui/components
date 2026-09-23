import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { BottomBarBasic } from "@/examples/bottom-bar/basic";

export const metadata: Metadata = {
  title: "BottomBar",
  description: "Composable bottom work panels with disclosure and sizing.",
};
export default function BottomBarPage() {
  return (
    <DocsPage
      name="BottomBar"
      description="Keep tools, activity, notes, or logs below your workspace. Compose your own header and content with accessible collapse controls and bounded sizing."
    >
      <InstallationSection
        registryName="bottom-bar"
        importCode={
          'import { BottomBar, BottomBarHeader, BottomBarTrigger, BottomBarContent } from "@dethink/components";'
        }
      />
      <DocsSection id="examples" title="Your markup, inside a bottom bar">
        <ExampleBlock file="bottom-bar/basic.tsx" title="Standalone notes">
          <BottomBarBasic />
        </ExampleBlock>
      </DocsSection>
      <DocsSection id="composition" title="Compose with SidebarShell">
        <div className="text-muted-foreground space-y-5 text-base leading-7">
          <p>
            Place BottomBar directly inside SidebarShell alongside
            SidebarShellMain. Use span="content" for the work area or
            span="shell" to span below navigation too. Fragments are supported;
            if you extract a wrapper component, place it inside
            SidebarShellFooter instead of expecting the shell to discover nested
            regions.
          </p>
          <p>
            BottomBarHeader holds your title, actions and BottomBarTrigger.
            BottomBarContent holds one scrollable region. Use one content region
            per bar and place triggers in the header, outside the region they
            hide. A header-only bar works for persistent status. Omit the entire
            bar to reserve no space.
          </p>
          <p>
            For a plain status footer, continue using SidebarShellFooter.
            BottomBar adds disclosure state and content sizing without requiring
            a sidebar provider or Motion. See the{" "}
            <a
              href="/components/sidebar-shell#make-it-your-workspace"
              className="text-foreground underline underline-offset-4"
            >
              interactive shell example
            </a>{" "}
            for placement, sizing and activity recipes.
          </p>
        </div>
      </DocsSection>
      <DocsSection id="props" title="Props">
        <PropsTable
          caption="BottomBar API"
          rows={[
            {
              prop: "BottomBar",
              type: "div attributes + ref",
              description:
                "Root provider and layout region. Accepts your composed markup, style and className.",
            },
            {
              prop: "open / defaultOpen / onOpenChange",
              type: "boolean / boolean / (open: boolean) => void",
              defaultValue: "defaultOpen: true",
              description:
                "Controlled or uncontrolled disclosure. Content stays mounted while hidden, preserving form state.",
            },
            {
              prop: "size",
              type: '"sm" | "md" | "lg"',
              defaultValue: '"md"',
              description:
                "Preferred content heights of 10rem, 16rem and 24rem, bounded by maxHeight.",
            },
            {
              prop: "height / maxHeight",
              type: "string | number",
              defaultValue: 'maxHeight: "40dvh"',
              description:
                "Custom content height and total bar height limit. Numbers are pixels; strings are CSS lengths. Overrides size. Inside SidebarShell, an additional 50% container-height cap preserves main content. Use valid nonnegative CSS lengths.",
            },
            {
              prop: "span",
              type: '"content" | "shell"',
              defaultValue: '"content"',
              description:
                "Direct SidebarShell placement; content width or full shell width.",
            },
            {
              prop: "contentId",
              type: "string",
              description:
                "Optional stable content ID shared by every trigger; generated automatically with useId otherwise.",
            },
            {
              prop: "BottomBarHeader",
              type: "div attributes + ref",
              description:
                "Wrapping header for your title, actions and trigger.",
            },
            {
              prop: "BottomBarTrigger",
              type: "button attributes + ref",
              description:
                "Native button with synchronized aria-expanded/aria-controls. Custom children replace the chevron. Disabled and preventDefault are respected.",
            },
            {
              prop: "expandLabel / collapseLabel",
              type: "string",
              defaultValue: '"Expand bottom bar" / "Collapse bottom bar"',
              description:
                "Accessible names for the default icon trigger. Custom icon-only children must supply aria-label.",
            },
            {
              prop: "BottomBarContent",
              type: "div attributes + ref (except id/hidden)",
              description:
                "Named, keyboard-scrollable region. Set aria-label or aria-labelledby. Root owns ID and hidden state.",
            },
          ]}
        />
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility and testing">
        <p className="text-muted-foreground text-base leading-7">
          Enter and Space toggle the native button. Tab reaches visible controls
          and the scrollable region; arrow keys scroll it. Closing while focus
          is inside returns focus to an enabled trigger. External actions retain
          their focus. There is no modal focus trap or Escape dismissal. Test
          with your own content and assistive technology; rendered, axe,
          SSR/hydration and browser tests cover the primitives.
        </p>
      </DocsSection>
      <DocsSection id="theming" title="Theming and limits">
        <p className="text-muted-foreground text-base leading-7">
          Use semantic background, foreground, border and ring tokens, density
          spacing, className and style. The --bottom-bar-height and
          --bottom-bar-max-height variables expose sizing. Content scrolls
          inside the height limit; use a concise wrapping header. The bar adds
          no animation, drag resizing, persistence or tab behavior. Existing
          SidebarShellFooter users need no migration; adopt these parts when
          disclosure is needed.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
