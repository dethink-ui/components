import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { FilterAssistantReview } from "@/examples/filter-assistant/assistant-review";
import {
  filterAssistantProps,
  useFilterAssistantProps,
} from "@/lib/props/filter-assistant";

export const metadata: Metadata = {
  title: "FilterAssistant",
  description:
    "Ask for a filter in words and review the proposed chips before anything changes.",
};

export default function FilterAssistantPage() {
  return (
    <DocsPage
      name="FilterAssistant"
      description="Describe a filter in plain words and get a proposal to review: each chip it would add, change or remove, with Accept and Reject. Nothing changes until you apply, and applying is one undo step. Bring any model through a single callback."
    >
      <InstallationSection
        registryName="filter-assistant"
        importCode={`import {
  FilterAssistant,
  useFilterAssistant,
} from "@dethink/components";`}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="This example uses a small offline stand-in for a model."
      >
        <ExampleBlock
          file="filter-assistant/assistant-review.tsx"
          title="Review before applying"
          description="Try “big open or blocked bugs from last week”, “ada or lin api work”, “customer issues” (asks a question), “p1 mobile bugs” (a field and a value it can't use), then accept or reject each change."
        >
          <FilterAssistantReview />
        </ExampleBlock>
      </DocsSection>
      <DocsSection
        id="security"
        title="Security boundary"
        description="The assistant can only propose filters."
      >
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            Model output is untrusted. Every answer is rebuilt against your
            fields: unknown fields, operators and values are dropped and listed
            under “Couldn&rsquo;t use”, text is stripped of control characters
            and shortened, and counts and nesting are capped. Everything the
            model says renders as plain text, never HTML.
          </p>
          <p>
            A prompt injection can at worst propose a filter, which the person
            sees and must apply. The assistant never runs actions, fetches URLs
            or changes anything else. Keep your API key on the server and call
            your model from a route that only returns the answer.
          </p>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable
            caption="useFilterAssistant"
            rows={useFilterAssistantProps}
          />
          <PropsTable caption="FilterAssistant" rows={filterAssistantProps} />
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            Status changes are announced politely. Each change is labelled Add,
            Change or Remove in text, removals are struck through, and Accept
            and Reject are toggle buttons with a pressed state, so nothing
            relies on colour. Escape or Stop cancels a request.
          </p>
          <p>
            Choosing a clarification moves focus to the new proposal; applying
            or discarding returns focus to the prompt.
          </p>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
