import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsPage, DocsSection } from "@/components/docs-page";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "Build React interfaces with Dethink Components. Start with setup, try an example, and make it your own.",
};

const startingPoints = [
  {
    href: "/docs/installation",
    title: "Set up your project",
    description: "Run the docs locally and use the workspace package.",
  },
  {
    href: "/components",
    title: "Find a component",
    description: "Try live examples and copy the code into your app.",
  },
  {
    href: "/docs/theming",
    title: "Make it yours",
    description: "Change colors, spacing, and light or dark mode.",
  },
];

export default function IntroductionPage() {
  return (
    <DocsPage
      name="Introduction"
      description="React components for dashboards, forms, and AI apps. Use the source code, try the examples, and adapt them to your product."
    >
      <DocsSection id="start-here" title="Start here">
        <div className="divide-border border-border divide-y rounded-lg border px-5">
          {startingPoints.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-5 py-5"
            >
              <div className="space-y-1">
                <span className="font-medium underline-offset-4 group-hover:underline">
                  {item.title}
                </span>
                <p className="text-muted-foreground text-sm leading-6">
                  {item.description}
                </p>
              </div>
              <ArrowRight
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
            </Link>
          ))}
        </div>
      </DocsSection>
      <DocsSection
        id="using-the-docs"
        title="Using the docs"
        description="Every component page follows the same path."
      >
        <ol className="text-muted-foreground marker:text-foreground list-decimal space-y-3 pl-5 text-sm leading-6">
          <li>
            <strong className="text-foreground font-medium">
              Installation.
            </strong>{" "}
            Set up the package before using a component.
          </li>
          <li>
            <strong className="text-foreground font-medium">Usage.</strong>{" "}
            Start with the import or a small code example.
          </li>
          <li>
            <strong className="text-foreground font-medium">Examples.</strong>{" "}
            Try sizes, states, and common uses. Open the code below any preview
            to copy it.
          </li>
          <li>
            <strong className="text-foreground font-medium">Props.</strong> Look
            up what each option does, its accepted values, and its default.
          </li>
        </ol>
        <p className="text-muted-foreground text-sm leading-6">
          Recipes combine components into larger examples, such as a form or a
          settings panel. Use the page links to jump to the part you need.
        </p>
      </DocsSection>
      <DocsSection id="before-you-start" title="Before you start">
        <p className="text-muted-foreground text-sm leading-6">
          You will need a React project with TypeScript. Dethink uses Tailwind
          CSS v4 and shared CSS variables for styling. The components include
          keyboard and screen reader support; your app still needs clear labels
          and a sensible focus order.
        </p>
        <p className="text-muted-foreground text-sm leading-6">
          Dethink is in active development. You can use it in this repository
          today, or copy components from the public registry. The npm package is
          not published yet.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
