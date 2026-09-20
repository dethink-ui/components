import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { AvatarBasic } from "@/examples/avatar/basic";
import { AvatarProfileRow } from "@/examples/avatar/recipe-profile-row";
import { AvatarSizes } from "@/examples/avatar/sizes";
import { AvatarStates } from "@/examples/avatar/states";
import { avatarProps } from "@/lib/props/avatar";

export const metadata: Metadata = {
  title: "Avatar",
  description: "Represent a person or team with an image or initials.",
};

export default function AvatarPage() {
  return (
    <DocsPage
      name="Avatar"
      description="Represent a person or team with an image or initials."
    >
      <InstallationSection
        registryName="avatar"
        importCode={`import { Avatar } from "@dethink/components";

export function Example() {
  return <Avatar name="Noah Reyes" src="/avatars/noah.png" ring="border" />;
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="avatar/basic.tsx"
            title="Identity rows"
            description="Use a real image when available, then fall back to generated initials without changing the surrounding layout."
          >
            <AvatarBasic />
          </ExampleBlock>
          <ExampleBlock
            file="avatar/sizes.tsx"
            title="Sizes, shapes, and rings"
            description="Size follows density tokens, shape controls clipping, and ring adds separation on layered surfaces."
          >
            <AvatarSizes />
          </ExampleBlock>
          <ExampleBlock
            file="avatar/states.tsx"
            title="Fallback states"
            description="Avatar handles loaded images, generated initials, icon identities, organization shapes, and failed image sources."
          >
            <AvatarStates />
          </ExampleBlock>
          <ExampleBlock
            file="avatar/recipe-profile-row.tsx"
            title="Profile list recipe"
            description="A production row pairs Avatar with Badge and recency metadata for review and access workflows."
            wide
          >
            <AvatarProfileRow />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="AvatarProps extends span attributes while owning image accessibility and layout-sensitive image props."
      >
        <PropsTable caption="Avatar props" rows={avatarProps} />
      </DocsSection>
    </DocsPage>
  );
}
