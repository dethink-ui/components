import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DocsPage, DocsSection } from "@/components/docs-page";

export const metadata: Metadata = {
  title: "Installation",
  description: "Run Dethink locally and use the components in a workspace app.",
};

export default function InstallationPage() {
  return (
    <DocsPage
      name="Installation"
      description="Start with the local workspace. The public npm package and shadcn registry are not published yet."
    >
      <DocsSection
        id="run-locally"
        title="1. Run the docs locally"
        description="Use pnpm 11.7.0. Clone the repository, install dependencies, and start the showcase."
      >
        <CodeBlock
          lang="bash"
          filename="Terminal"
          code={`git clone https://github.com/dethink-ui/components.git
cd components
pnpm install
pnpm --filter @dethink/showcase dev`}
        />
        <p className="text-muted-foreground text-sm leading-6">
          Open <code>http://localhost:3005</code> to browse the examples.
        </p>
      </DocsSection>
      <DocsSection
        id="workspace-package"
        title="2. Use the workspace package"
        description="For an app in this monorepo, add the local package to its dependencies and build it."
      >
        <CodeBlock
          lang="json"
          filename="Your app’s package.json (dependencies)"
          code={`{
  "@dethink/components": "workspace:*"
}`}
        />
        <CodeBlock
          lang="bash"
          filename="Terminal · repository root"
          code={`pnpm install
pnpm --filter @dethink/components build`}
        />
        <p className="text-muted-foreground text-sm leading-6">
          The showcase and playground already use the component source directly.
          They do not need this build step.
        </p>
      </DocsSection>
      <DocsSection
        id="styles-and-provider"
        title="3. Add styles and a provider"
        description="Import the stylesheet once, then wrap your app in DethinkProvider. It sets the theme, spacing, and text direction for the components inside it."
      >
        <CodeBlock
          filename="App.tsx"
          code={`import "@dethink/components/styles.css";
import { Button, DethinkProvider } from "@dethink/components";

export function App() {
  return (
    <DethinkProvider theme="light">
      <Button>Save changes</Button>
    </DethinkProvider>
  );
}`}
        />
        <p className="text-muted-foreground text-sm leading-6">
          If your framework has a root stylesheet or layout, import the styles
          there. Follow the{" "}
          <Link
            href="/docs/theming"
            className="text-foreground underline underline-offset-4"
          >
            theming guide
          </Link>{" "}
          to change colors or density.
        </p>
      </DocsSection>
      <DocsSection id="registry" title="About the registry">
        <p className="text-muted-foreground text-sm leading-6">
          The repository includes shadcn-compatible registry metadata. A public
          registry URL and namespace are still in progress. Use the workspace
          setup above for now.
        </p>
        <p className="text-muted-foreground text-sm leading-6">
          Component examples use imports from <code>@dethink/components</code>.
          If you copy source files into another project, update the imports to
          match their new location and include their dependencies and shared
          styles.
        </p>
        <Link
          href="/components/button"
          className="inline-block text-sm font-medium underline underline-offset-4"
        >
          Try your first component: Button
        </Link>
      </DocsSection>
    </DocsPage>
  );
}
