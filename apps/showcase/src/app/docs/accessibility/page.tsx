import type { Metadata } from "next";
import { DocsPage, DocsSection } from "@/components/docs-page";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How Dethink Components approaches accessibility, what automated tests cover, and downloadable Playwright evidence.",
};

const linkStyles =
  "text-primary inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

export default function AccessibilityPage() {
  return (
    <DocsPage
      name="Accessibility"
      description="Accessible components, backed by inspectable evidence. Keyboard behavior, focus management, labels, and reduced-motion preferences are part of the design."
    >
      <DocsSection id="evidence" title="Download the evidence">
        <p className="text-muted-foreground text-sm leading-7">
          The public report is a recorded snapshot, not a live score. It
          includes its date, tested source revision, browser engines, viewport
          sizes, themes, page states, and test outcomes. Full axe results retain
          both violations and incomplete checks that need human review.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              className={linkStyles}
              href="/reports/accessibility-summary.html"
            >
              Read the accessibility test summary
            </a>
          </li>
          <li>
            <a
              className={linkStyles}
              href="/reports/accessibility-report.zip"
              download
            >
              Download the Playwright report (ZIP)
            </a>
          </li>
          <li>
            <a
              className={linkStyles}
              href="https://github.com/dethink-ui/components/actions/workflows/pr-checks.yml"
            >
              View current CI runs and report artifacts on GitHub
            </a>
          </li>
        </ul>
        <p className="text-muted-foreground text-sm leading-7">
          Unzip the download, then run <code>npx playwright show-report</code>{" "}
          followed by the extracted report directory. Open an individual test to
          inspect its axe JSON attachments. GitHub CI artifacts require sign-in
          and are retained for 30 days; the public snapshot is downloadable
          without an account.
        </p>
      </DocsSection>
      <DocsSection id="coverage" title="What we check">
        <ul className="text-muted-foreground list-disc space-y-3 ps-5 text-sm leading-7">
          <li>
            Axe checks tagged WCAG 2.0 and 2.1 A/AA on representative component
            docs and recipes, in the default brand palette's light and dark
            themes at desktop and mobile sizes, using Chromium, Firefox, and
            WebKit.
          </li>
          <li>
            Open dialog and menu states, plus keyboard focus trapping, Escape
            dismissal, and focus return to the trigger.
          </li>
          <li>
            Form descriptions and invalid states, table sorting semantics,
            keyboard interaction, narrow layouts, and enlarged text with RTL.
          </li>
          <li>
            Separate component tests cover accessible names and states. Motion
            tests check reduced-motion behavior on representative surfaces.
          </li>
        </ul>
      </DocsSection>
      <DocsSection id="scope" title="What the results mean">
        <p className="text-muted-foreground text-sm leading-7">
          A passing scan means no violations were detected by the selected rules
          in that rendered state. It does not establish WCAG conformance, cover
          every component variant or theme, or certify an application assembled
          from these components. Incomplete axe results are not passes.
        </p>
        <p className="text-muted-foreground text-sm leading-7">
          Real VoiceOver and NVDA testing has not been completed for this
          release. Automated semantics and keyboard checks cannot replace
          assistive technology testing or evaluation with disabled users. WebKit
          automation is not a native Safari screen-reader test.
        </p>
        <p className="text-muted-foreground text-sm leading-7">
          When adapting components, verify your labels, content, color contrast,
          focus order, error recovery, and complete user journeys. Custom themes
          and application code can change accessibility outcomes.
        </p>
      </DocsSection>
      <DocsSection id="report-an-issue" title="Help improve accessibility">
        <p className="text-muted-foreground text-sm leading-7">
          Include the component, reproduction steps, expected behavior, browser,
          and any assistive technology involved when reporting an issue.
        </p>
        <a
          className={linkStyles}
          href="https://github.com/dethink-ui/components/issues/new/choose"
        >
          Report an accessibility issue
        </a>
      </DocsSection>
    </DocsPage>
  );
}
