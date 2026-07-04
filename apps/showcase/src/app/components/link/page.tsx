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
  description:
    "Navigate with tokenized anchor styling, underline control, and asChild composition for framework routers.",
};

export default function LinkPage() {
  return (
    <DocsPage
      name="Link"
      description="A styled anchor with variant and underline control. The type system requires an href — unless asChild hands rendering to a child element, which is how framework router links (Next.js, React Router) get the styling without losing client-side navigation."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one."
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
        description="Production-shaped compositions that go beyond exercising props."
      >
        <ExampleBlock
          file="link/recipe-breadcrumbs.tsx"
          title="Breadcrumbs"
          description="nav-variant links in a labeled breadcrumb list — the current page is plain text with aria-current, not a link to itself."
        >
          <LinkRecipeBreadcrumbs />
        </ExampleBlock>
      </DocsSection>

      <InstallationSection
        registryName="link"
        importCode={`import { Link } from "@dethink/components";`}
      />

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
