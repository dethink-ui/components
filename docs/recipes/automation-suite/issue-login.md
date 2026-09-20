## Parent

https://github.com/parveshh/dethink-components/issues/475

## What to build

Deliver the matching split-layout login recipe with a shader illustration, Google and GitHub demo sign-in, labelled email/password form, visibility control, validation, pending/error/retry/success feedback and local recovery. Integrate the landing journey, gallery/source/thumbnail and documentation; verify end to end.

Type: AFK. User stories: 6–15. Approved by the user on 2026-09-20.

## Acceptance criteria

- [ ] Landing CTA reaches the matching login recipe and return navigation works.
- [ ] Both social providers and email flow provide explicit local-demo pending and completion states.
- [ ] Failure can be deliberately simulated and retried; recovery never claims a real email was sent.
- [ ] Form uses native semantics, autocomplete, required fields, password masking and linked validation errors.
- [ ] No credentials are persisted or sent over the network.
- [ ] Keyboard, mobile, light/dark, reduced-motion, forced-color, axe and regression checks pass.
- [ ] Gallery metadata, source dependencies, real thumbnail and documentation are complete.

## Blocked by

https://github.com/parveshh/dethink-components/issues/476
