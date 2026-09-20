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
      description="Accessible components with keyboard navigation, focus management, accessible labels, and reduced-motion support. Explore the test results below."
    >
      <DocsSection id="evidence" title="Download the report">
        <p className="text-muted-foreground text-sm leading-7">
          The report includes the test date, code revision, browsers, screen
          sizes, themes, and results. Each accessibility scan includes its axe
          results, with any detected issues and checks that need manual review.
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
              View the latest test runs on GitHub
            </a>
          </li>
        </ul>
        <p className="text-muted-foreground text-sm leading-7">
          Download and unzip the report. Run{" "}
          <code>npx playwright show-report</code> followed by the extracted
          folder path. Select a test to view its results and axe JSON
          attachments.
        </p>
        <p className="text-muted-foreground text-sm leading-7">
          To download a report from GitHub, sign in, open a test run, and select
          the <code>accessibility-report</code> artifact. These reports are kept
          for 30 days.
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
          A passing scan means the selected rules found no violations on the
          tested page. Results apply to the listed examples, themes, and states.
          Checks marked incomplete need manual review. WCAG conformance requires
          a full accessibility assessment.
        </p>
        <p className="text-muted-foreground text-sm leading-7">
          VoiceOver, NVDA, and testing with disabled users remain to be
          completed. The report covers automated browser, semantics, and
          keyboard checks.
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
