import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

// Publish an explicitly reviewed snapshot, never a fabricated or partial pass.
// Run pnpm test:accessibility:report from a clean, committed source revision first.
const results = JSON.parse(
  await readFile("test-results/accessibility-results.json", "utf8"),
);
assert(results.stats.expected > 0, "No passing tests recorded");
for (const status of ["unexpected", "flaky", "skipped"]) {
  assert.equal(results.stats[status], 0, `Report contains ${status} tests`);
}
assert.equal(results.errors.length, 0, "Report contains runner errors");
const metadata = results.config.metadata;
assert.equal(
  metadata.sourceDirty,
  false,
  "Commit source before recording a snapshot",
);
assert.equal(
  metadata.testedCommit,
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  "Report must match the checked-out source revision",
);

async function attachment(result, name) {
  const entry = result.attachments.find((item) => item.name === name);
  assert(entry, `Missing ${name} attachment`);
  return JSON.parse(
    entry.path
      ? await readFile(entry.path, "utf8")
      : Buffer.from(entry.body, "base64").toString("utf8"),
  );
}

const scans = [];
async function collect(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      const result = test.results.at(-1);
      if (!result.attachments.some((item) => item.name === "axe-results"))
        continue;
      const axe = await attachment(result, "axe-results");
      const context = await attachment(result, "scan-context");
      assert.equal(
        axe.violations.length,
        0,
        "Snapshot contains axe violations",
      );
      scans.push({
        ...context,
        engine: axe.testEngine,
        timestamp: axe.timestamp,
        passes: axe.passes.length,
        incomplete: axe.incomplete.map(({ id, nodes }) => ({
          id,
          nodes: nodes.length,
        })),
      });
    }
  }
  for (const child of suite.suites ?? []) await collect(child);
}
for (const suite of results.suites) await collect(suite);
assert.equal(
  scans.length,
  144,
  "Expected all 12 surfaces × 2 themes × 2 sizes × 3 engines",
);

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
const needsReview = scans.filter((scan) => scan.incomplete.length > 0).length;
const rows = scans
  .map(
    (scan) =>
      `<tr><th scope="row">${escape(scan.route)}<br><small>${escape(scan.state)}</small></th><td>${escape(scan.browser)}<br><small>${escape(scan.browserVersion)}</small></td><td>${escape(scan.theme)} / ${scan.viewport.width}px</td><td>0</td><td>${scan.incomplete.length ? scan.incomplete.map((item) => `${escape(item.id)} (${item.nodes} nodes)`).join("<br>") : "None"}</td></tr>`,
  )
  .join("\n");
const directory = resolve("apps/showcase/public/reports");
await mkdir(directory, { recursive: true });
await writeFile(
  resolve(directory, "accessibility-summary.html"),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dethink Components — accessibility test snapshot</title>
<style>body{font:1rem/1.65 system-ui,sans-serif;color:#172b28;background:#f8faf9;margin:0}main{max-width:75rem;margin:auto;padding:2rem 1rem}h1,h2{line-height:1.2}a{color:#00665b}a:focus-visible{outline:3px solid;outline-offset:4px}code{overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:.875rem}th,td{padding:.75rem;text-align:left;vertical-align:top;border-bottom:1px solid #c5d2ce}small{font-weight:400}.table{overflow:auto}.table:focus-visible{outline:3px solid #00665b}li{margin-block:.5rem}</style></head>
<body><main><h1>Accessibility test snapshot</h1>
<p>Dethink Components · Recorded ${escape(results.stats.startTime)} · <a href="https://github.com/dethink-ui/components/commit/${metadata.testedCommit}">Tested source <code>${metadata.testedCommit}</code></a></p>
<p><strong>${results.stats.expected} tests passed, including ${scans.length} axe scans.</strong> No violations were detected by the selected axe rules. ${needsReview} scans contain incomplete results requiring human review. Incomplete results are not passes.</p>
<p><a href="accessibility-report.zip" download>Download the full Playwright report (ZIP)</a> · <a href="/docs/accessibility">Accessibility approach and limitations</a></p>
<h2>Scope and method</h2><ul>
<li>12 representative page/state combinations, the default brand palette in light and dark themes, 1440×900 and 390×900 viewports, Chromium, Firefox, and WebKit. Full rendered page scanned after fonts and running CSS theme transitions settle; visible dialog/menu included when open. No rules or selectors excluded.</li>
<li>Axe rules tagged wcag2a, wcag2aa, wcag21a, and wcag21aa. Reduced motion was requested for these scans. Each scan attachment records the axe version and complete results.</li>
<li>12 additional browser acceptance tests cover keyboard focus trapping and return, menu navigation, field descriptions and errors, table semantics, 320px and enlarged-text/RTL reflow, and social metadata. These are separate from the axe scan totals.</li>
<li>The report tests a local production build of the source revision above. Later changes need a new run. Browser engine versions are recorded below.</li></ul>
<h2>Limits</h2><p>This is automated evidence, not WCAG certification or a guarantee of accessibility. Real VoiceOver/NVDA testing and evaluation with disabled users have not been completed. The sample does not cover every component, state, theme, application integration, or assistive technology. WebKit automation is not a native Safari screen-reader test. Custom content and styles require their own verification.</p>
<h2>Scan results</h2><p>Incomplete entries include the rule ID and affected node count. Inspect the full axe JSON attachments in the Playwright report for details and manual-review guidance.</p>
<div class="table" role="region" aria-label="Accessibility scan results" tabindex="0"><table><caption>All recorded axe scans</caption><thead><tr><th scope="col">Page and state</th><th scope="col">Browser</th><th scope="col">Theme / width</th><th scope="col">Violations</th><th scope="col">Needs review</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2>Open the full report</h2><p>Unzip the download and run <code>npx playwright show-report</code> followed by the extracted directory. Each axe test includes <code>axe-results</code> and <code>scan-context</code> attachments. Current CI artifacts are available from <a href="https://github.com/dethink-ui/components/actions/workflows/pr-checks.yml">GitHub Actions</a> for 30 days.</p>
</main></body></html>\n`,
);
const archive = resolve(directory, "accessibility-report.zip");
const reportDirectory = resolve("playwright-report/accessibility");
const require = createRequire(import.meta.url);
const playwrightRequire = createRequire(
  require.resolve("@playwright/test/package.json"),
);
const playwrightDirectory = dirname(
  playwrightRequire.resolve("playwright/package.json"),
);
for (const name of ["LICENSE", "NOTICE", "ThirdPartyNotices.txt"]) {
  await copyFile(
    resolve(playwrightDirectory, name),
    resolve(reportDirectory, name),
  );
}
await writeFile(
  resolve(reportDirectory, "README.txt"),
  `Dethink Components accessibility snapshot\nTested source: ${metadata.testedCommit}\nOpen with: npx playwright show-report <this-directory>\n\nThe HTML report viewer is provided by Playwright; its license and notices accompany this archive. Full scan attachments retain incomplete checks requiring human review. This report is automated evidence, not WCAG certification or screen-reader testing.\n`,
);
await rm(archive, { force: true });
execFileSync("zip", ["-qr", archive, "."], {
  cwd: reportDirectory,
});
console.log(
  `Published ${scans.length} scans; ${needsReview} scans need human review. Source: ${metadata.testedCommit}`,
);
