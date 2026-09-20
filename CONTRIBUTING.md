# Contributing

Open an issue describing the problem, expected behavior, and a small reproduction
before proposing a large change. For bugs, include the component, browser,
React version, installation method, and copied source revision when available.
Follow [AGENTS.md](AGENTS.md) for new components and public API proposals.

For focused fixes, branch from `main`, keep changes scoped, and update affected
component tests, docs, stories, and registry metadata. Install with the committed
pnpm version and lockfile:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm registry:validate
pnpm registry:test
pnpm audit --audit-level=moderate
```

For showcase or interaction changes, also run `pnpm test:e2e`; install Playwright
browsers first. Describe verification and known limitations in the pull request.
Do not include credentials, generated build output, or private customer data.

Pull requests run unit tests, lint, formatting, type checks, builds, registry
validation, and the dependency audit. Browser tests run manually: open GitHub
Actions, choose **Browser checks**, select **Run workflow**, and choose a branch.
This runs showcase smoke checks, the three-browser accessibility suite, and
clean registry consumer checks. Download `accessibility-report` from the run's
artifacts to inspect the results; artifacts are kept for 30 days. You can also
generate the accessibility report locally with `pnpm test:accessibility:report`.

`pnpm lint` and `pnpm lint:fix` require zero warnings. Unused lint suppressions
also fail CI. Fix the underlying behavior first; when a rule cannot understand
a valid component pattern, keep any exception scoped to that code and explain
why it is safe. Keyboard, accessibility, and SSR tests should cover the behavior.
Library and showcase runtime source also use type-aware checks for floating
promises and async callbacks passed to synchronous APIs. Explicitly discarding a
promise with `void` does not handle rejection; handle expected failures inside
the operation or with `.catch()`.

Changes to `main` go through a pull request and required checks. The maintainer
handles merges. Report security issues through [the private reporting process](SECURITY.md),
not public bug reports. Code and documentation contributions are accepted under
the repository's [MIT License](LICENSE). Preserve third-party notices and only
contribute material you have permission to distribute under the applicable terms.
