import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DocsPage, DocsSection } from "@/components/docs-page";

export const metadata: Metadata = {
  title: "Theming",
  description:
    "Change colors, theme, and spacing using shared Dethink settings.",
};

export default function ThemingPage() {
  return (
    <DocsPage
      name="Theming"
      description="Set the look of your app in one place. Components share colors, spacing, and corner sizes through CSS variables."
    >
      <DocsSection
        id="theme"
        title="Light and dark mode"
        description="Set theme to light, dark, or system. The system option follows the device setting."
      >
        <CodeBlock
          filename="App.tsx"
          code={`import { DethinkProvider } from "@dethink/components";

export function App() {
  return (
    <DethinkProvider theme="system">
      {/* Your app */}
    </DethinkProvider>
  );
}`}
        />
      </DocsSection>
      <DocsSection
        id="colors"
        title="Change your colors"
        description="Override the shared color variables after importing the Dethink stylesheet. Set a background color and a readable foreground color for both themes."
      >
        <CodeBlock
          lang="css"
          filename="app.css"
          code={`@import "@dethink/components/styles.css";

:root {
  --dt-color-primary-light: oklch(0.5 0.1 185);
  --dt-color-primary-foreground-light: white;
  --dt-color-primary-dark: oklch(0.8 0.12 178);
  --dt-color-primary-foreground-dark: oklch(0.2 0.04 210);
}`}
        />
        <p className="text-muted-foreground text-sm leading-6">
          Use semantic Tailwind classes such as <code>bg-background</code>,{" "}
          <code>text-foreground</code>, and <code>border-border</code> in your
          own UI. They follow the same theme. Check text contrast after changing
          colors.
        </p>
      </DocsSection>
      <DocsSection
        id="density"
        title="Adjust spacing"
        description="Use compact for dense tables and toolbars, default for everyday screens, or comfortable for more room."
      >
        <CodeBlock
          filename="Compact layout"
          code={`<DethinkProvider density="compact">
  {/* Your app */}
</DethinkProvider>`}
        />
        <p className="text-muted-foreground text-sm leading-6">
          Density changes the shared control height and gap values. Individual
          components may also offer a size prop.
        </p>
      </DocsSection>
      <DocsSection
        id="local-styles"
        title="Style one component"
        description="Use a component’s props first. Add className for local layout or spacing changes."
      >
        <CodeBlock
          filename="Button example"
          code={`<Button variant="outline" size="sm" className="w-full">
  Save changes
</Button>`}
        />
        <p className="text-muted-foreground text-sm leading-6">
          Keep focus indicators visible, and check your changes in both light
          and dark mode.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
