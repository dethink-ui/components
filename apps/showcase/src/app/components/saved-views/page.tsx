import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { SavedViewsUrlExample } from "@/examples/saved-views/url-views";
import {
  filterUrlStateProps,
  savedViewsMenuProps,
  savedViewsProps,
} from "@/lib/props/saved-views";

export const metadata: Metadata = {
  title: "Saved views & URL state",
  description:
    "Keep filters in a readable, versioned URL and save them as named views people can return to.",
};

export default function SavedViewsPage() {
  return (
    <DocsPage
      name="Saved views & URL state"
      description="Filters live in the URL as readable text with a schema version, so links can be shared, bookmarked and still work after you rename a field. Saved views give filters a name, show when you've changed one, and apply in a single undo step."
    >
      <InstallationSection
        registryName="saved-views"
        importCode={`import {
  SavedViewsMenu,
  useFilterUrlState,
  useSavedViews,
} from "@dethink/components";`}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="This example writes to this page's URL. Edit the filter, then reload or press back."
      >
        <ExampleBlock
          file="saved-views/url-views.tsx"
          title="URL state and saved views"
          description="Apply a view, change a chip to see it marked edited, then save changes or save it as a new view. The URL updates with each change, and undo still works."
        >
          <SavedViewsUrlExample />
        </ExampleBlock>
      </DocsSection>
      <DocsSection
        id="routers"
        title="Routers"
        description="useFilterUrlState talks to the URL through a small store, so it needs no router dependency."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The default store uses the History API with replaceState, so filter
            edits don&rsquo;t flood the back button. Pass
            createHistoryFilterStore(&#123; mode: &quot;push&quot; &#125;) to
            make each change a history entry, or createMemoryFilterStore() for
            tests and embedded views. With Next.js, pass the page&rsquo;s
            searchParams as initialSearch so the server renders the same filter.
            The docs include store recipes for the Next.js router and nuqs.
          </p>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable caption="useFilterUrlState" rows={filterUrlStateProps} />
          <PropsTable caption="useSavedViews" rows={savedViewsProps} />
          <PropsTable caption="SavedViewsMenu" rows={savedViewsMenuProps} />
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The trigger names the active view and adds &ldquo;edited&rdquo; when
            the filter has changed, so the state isn&rsquo;t shown by the dot
            alone. The menu is a dialog with views grouped under Personal and
            Team headings; each row has an apply button (marked current for the
            active view) and named rename and delete buttons.
          </p>
          <p>
            Rename and save-as forms take focus, submit with Enter and cancel
            with Escape, returning focus to the row. Deleting asks for
            confirmation. Applying or saving closes the menu and returns focus
            to the trigger.
          </p>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
