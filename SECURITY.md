# Security policy

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/dethink-ui/components/security/advisories/new)
for suspected security issues. Include the affected component or registry item,
the source revision or installation date, reproduction steps, and impact. Avoid
posting exploit details or credentials in public issues.

## Supported source

This project is in active development. Security fixes target the current `main`
branch and hosted registry. There are no maintained historical release lines or
published npm releases yet.

Registry installation copies source into your application. Updates to this
repository do not automatically patch that copy. Track the source revision and
review security notices, dependency changes, and local modifications before
applying an update. Back up local changes before reinstalling a component.

## Maintainer checks

Pull-request checks audit workspace dependencies and validate source, tests,
builds, and clean registry consumers. GitHub secret scanning and push protection
are enabled. Never commit credentials or use real customer data in examples.

Investigate audit findings instead of adding blanket ignores. Any temporary
exception should record the advisory, affected path, applicability evidence,
owner, and expiry date. A passing audit is not a guarantee that code has no
vulnerabilities.
