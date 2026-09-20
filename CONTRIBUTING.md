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

Changes to `main` go through a pull request and required checks. The maintainer
handles merges. Report security issues through [the private reporting process](SECURITY.md),
not public bug reports. Reuse and contribution licensing terms remain subject
to the repository's license decision; this guide does not grant a license.
