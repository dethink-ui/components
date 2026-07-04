import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { AsyncSelectBasic } from "@/examples/async-select/basic";
import { AsyncSelectMultiple } from "@/examples/async-select/multiple";
import { AsyncSelectRecipeServerFilter } from "@/examples/async-select/recipe-server-filter";
import { AsyncSelectStates } from "@/examples/async-select/states";
import { AsyncSelectThemeAndWrapping } from "@/examples/async-select/theme-and-wrapping";
import { asyncSelectProps } from "@/lib/props/async-select";

export const metadata: Metadata = {
  title: "AsyncSelect",
  description:
    "Render app-owned async result windows with loading, empty, min-query, retry, and single or multiple selection.",
};

export default function AsyncSelectPage() {
  return (
    <DocsPage
      name="AsyncSelect"
      description="A thin async state wrapper around Combobox and MultiSelect. Your app owns the query, fetch, cache, loading, error, and result window; AsyncSelect renders the field, status messages, retry affordance, selected labels, and form serialization."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Type to change the app-owned query; the examples filter local arrays to model a server result window."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="async-select/basic.tsx"
            title="Basic"
            description="Single-value search where the app controls the query and result list."
          >
            <AsyncSelectBasic />
          </ExampleBlock>
          <ExampleBlock
            file="async-select/multiple.tsx"
            title="Multiple values"
            description="Multiple mode keeps selected chip labels visible even when the current result window changes."
          >
            <AsyncSelectMultiple />
          </ExampleBlock>
          <ExampleBlock
            file="async-select/states.tsx"
            title="Async states"
            description="Loading, empty, error-with-retry, invalid, required, read-only, and disabled are explicit props."
          >
            <AsyncSelectStates />
          </ExampleBlock>
          <ExampleBlock
            file="async-select/theme-and-wrapping.tsx"
            title="Theme, RTL, and wrapping"
            description="Multiple async selection using compact dark tokens, RTL direction, and narrow chip wrapping."
          >
            <AsyncSelectThemeAndWrapping />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="async-select/recipe-server-filter.tsx"
          title="Server filter"
          description="A form-ready server lookup with min-query guidance and a second field using a stable result."
        >
          <AsyncSelectRecipeServerFilter />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="async-select"
        importCode={`import { AsyncSelect } from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="AsyncSelect accepts a shared item shape: { value, label?, textValue? }."
      >
        <PropsTable caption="AsyncSelect props" rows={asyncSelectProps} />
      </DocsSection>
    </DocsPage>
  );
}
