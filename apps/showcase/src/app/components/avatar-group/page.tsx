import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { AvatarGroupBasic } from "@/examples/avatar-group/basic";
import { AvatarGroupOverlapExample } from "@/examples/avatar-group/overlap";
import { AvatarGroupReveal } from "@/examples/avatar-group/reveal";
import { AvatarGroupReviewQueue } from "@/examples/avatar-group/recipe-review-queue";
import { avatarGroupProps } from "@/lib/props/avatar-group";

export const metadata: Metadata = {
  title: "AvatarGroup",
  description: "Show a group of people with overlapping avatars.",
};

export default function AvatarGroupPage() {
  return (
    <DocsPage
      name="AvatarGroup"
      description="Show a group of people with overlapping avatars."
    >
      <InstallationSection
        registryName="avatar-group"
        importCode={`import { AvatarGroup, type AvatarGroupMember } from "@dethink/components";

const members: AvatarGroupMember[] = [
  { name: "Noah Reyes", src: "/avatars/noah.png" },
  { name: "Mira Patel", src: "/avatars/mira.png" },
];

export function Example() {
  return <AvatarGroup label="Reviewers" members={members} max={3} />;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="avatar-group/basic.tsx"
            title="Stacked groups"
            description="Keep the visible cluster compact while the hidden member count remains accessible and readable."
          >
            <AvatarGroupBasic />
          </ExampleBlock>
          <ExampleBlock
            file="avatar-group/overlap.tsx"
            title="Overlap"
            description="Tune overlap for dense tables, roomy cards, or standalone ownership summaries."
            wide
          >
            <AvatarGroupOverlapExample />
          </ExampleBlock>
          <ExampleBlock
            file="avatar-group/reveal.tsx"
            title="Reveal behavior"
            description="Spread reveal is pointer-friendly, while names reveal keeps keyboard focus and reduced-motion behavior readable."
          >
            <AvatarGroupReveal />
          </ExampleBlock>
          <ExampleBlock
            file="avatar-group/recipe-review-queue.tsx"
            title="Review queue recipe"
            description="Combine AvatarGroup and Badge to summarize ownership and workflow status in repeated rows."
            wide
          >
            <AvatarGroupReviewQueue />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="AvatarGroupProps extends div attributes while owning group labelling and member rendering."
      >
        <PropsTable caption="AvatarGroup props" rows={avatarGroupProps} />
      </DocsSection>
    </DocsPage>
  );
}
