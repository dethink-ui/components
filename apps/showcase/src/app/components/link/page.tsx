import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { LinkBasic } from "@/examples/link/basic";
import { LinkRecipeBreadcrumbs } from "@/examples/link/recipe-breadcrumbs";
import { LinkRouter } from "@/examples/link/router";
import { linkProps } from "@/lib/props/link";

export const metadata: Metadata = {
  title: "Link",
  description: "Take users to another page or a section on the same page.",
};

export default function LinkPage() {
  return (
    <DocsPage
      name="Link"
      description="Take users to another page or a section on the same page."
    >
      <InstallationSection
        registryName="link"
        importCode={`import { Link } from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="link/basic.tsx"
            title="Variants and underline"
            description="default, muted, nav, and destructive variants with hover, always, and none underline modes."
          >
            <LinkBasic />
          </ExampleBlock>
          <ExampleBlock
            file="link/router.tsx"
            title="Router composition and external links"
            description="asChild merges styling onto a Next.js Link; external links pair a visual indicator with screen-reader-only context."
          >
            <LinkRouter />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <ExampleBlock
          file="link/recipe-breadcrumbs.tsx"
          title="Breadcrumbs"
          description="nav-variant links in a labeled breadcrumb list — the current page is plain text with aria-current, not a link to itself."
        >
          <LinkRecipeBreadcrumbs />
        </ExampleBlock>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Link renders a real anchor element (or its asChild child)."
      >
        <PropsTable caption="Link props" rows={linkProps} />
      </DocsSection>
    </DocsPage>
  );
}
