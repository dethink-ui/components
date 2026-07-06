import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { CommandPaletteAiCommandMenu } from "@/examples/command-palette/ai-command-menu";
import { CommandPaletteBasic } from "@/examples/command-palette/basic";
import { CommandPaletteDashboardActions } from "@/examples/command-palette/dashboard-actions";
import { CommandPaletteGlobalLauncher } from "@/examples/command-palette/global-launcher";
import { CommandPaletteNavigationHandoff } from "@/examples/command-palette/navigation-handoff";
import { CommandPaletteProjectSwitcher } from "@/examples/command-palette/project-switcher";
import { CommandPaletteSidebarSearch } from "@/examples/command-palette/sidebar-search";
import { commandPaletteProps } from "@/lib/props/command-palette";

export const metadata: Metadata = {
  title: "CommandPalette",
  description:
    "Run action, link, and nested page commands with async sources, recents, suggestions, live announcements, and Motion-aware dialog mode.",
};

export default function CommandPalettePage() {
  return (
    <DocsPage
      name="CommandPalette"
      description="A command workflow layer for dashboards and app shells: typed command records, composition primitives, nested pages, source windows, async feedback, and dialog mode without copying cmdk patterns."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="CommandPalette can render directly from typed data or be composed from anatomy primitives when a row needs app-owned markup."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="command-palette/basic.tsx"
            title="Basic"
            description="Grouped action and link commands with shortcuts, disabled reasons, and destructive state."
          >
            <CommandPaletteBasic />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped recipes for app shells, dashboards, and AI-native command workflows."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="command-palette/global-launcher.tsx"
            title="Global launcher"
            description="Dialog mode owns focus containment, restoration, close-on-run behavior, and the command surface."
          >
            <CommandPaletteGlobalLauncher />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="command-palette/sidebar-search.tsx"
            title="Sidebar inline search"
            description="A scoped command palette embedded in Sidebar navigation without turning navigation into a form control."
          >
            <CommandPaletteSidebarSearch />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="command-palette/dashboard-actions.tsx"
            title="Dashboard action runner"
            description="Contextual commands run against the active dashboard and report execution through app state."
          >
            <CommandPaletteDashboardActions />
          </ExampleBlock>
          <ExampleBlock
            file="command-palette/project-switcher.tsx"
            title="Project and resource switcher"
            description="Nested pages, recents, and suggestions create a compact resource browser with Back and Escape handling."
          >
            <CommandPaletteProjectSwitcher />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="command-palette/navigation-handoff.tsx"
            title="NavigationMenu handoff"
            description="NavigationMenu keeps persistent links visible while CommandPalette handles keyboard command discovery."
          >
            <CommandPaletteNavigationHandoff />
          </ExampleBlock>
          <ExampleBlock
            file="command-palette/ai-command-menu.tsx"
            title="AI command menu"
            description="Manual filtering with an app-owned async result window, loading, empty, error, retry, and live status announcements."
          >
            <CommandPaletteAiCommandMenu />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="command-palette"
        importCode={`import {
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteDialog,
  CommandPaletteTrigger,
  type CommandPaletteCommand,
} from "@dethink/components";`}
      />

      <DocsSection
        id="guides"
        title="Guides"
        description="Developer notes for the choices that make CommandPalette different from shadcn's command primitive."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [
              "Schema and execution",
              "Use CommandPaletteCommand for action, link, page, and separator records. onCommandRun receives source, query, page stack, and close helpers.",
            ],
            [
              "Filtering and async",
              "Keep built-in filtering for local commands, or set shouldFilter=false when a server owns the result window. Loading, stale, error, empty, and retry states are first-class props.",
            ],
            [
              "Recents and suggestions",
              "recentCommands, suggestedCommands, and asyncCommands merge into predictable source groups with data-source hooks for styling and analytics.",
            ],
            [
              "Nested pages",
              "Page commands push typed page definitions onto a stack. Back buttons, Escape handling, page announcements, and controlled pageStack are built in.",
            ],
            [
              "Accessibility",
              "Use label or aria-label. Dialog mode restores focus, visible statuses use role=status, and the announcer reports selection, execution, result counts, and page changes.",
            ],
            [
              "Theming and motion",
              "All surfaces use provider tokens. motionPreset controls selected-row, result, and page choreography; reducedMotion can force static rendering.",
            ],
            [
              "App-shell recipes",
              "Global launchers, Sidebar inline search, NavigationMenu handoff, dashboard action runners, project switchers, and AI menus should stay command workflows rather than form controls.",
            ],
            [
              "Migration boundaries",
              "Unlike a shadcn Command copy, this component does not expose cmdk internals or become a Combobox replacement. Keep form selection in Combobox, Select, AsyncSelect, or MultiSelect.",
            ],
          ].map(([title, body]) => (
            <section
              key={title}
              className="rounded-lg border border-border bg-muted/30 p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="The root data API and the dialog composition API are both exported. Import anatomy primitives when you need custom rows or page frames."
      >
        <PropsTable caption="CommandPalette props" rows={commandPaletteProps} />
      </DocsSection>
    </DocsPage>
  );
}
