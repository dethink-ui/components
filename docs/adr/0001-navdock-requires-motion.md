# NavDock requires Motion

NavDock uses `motion/react` as a required runtime dependency because dock
magnification, adjacent-item handoff, submenu presence, and title transitions
are core component behavior rather than optional visual polish. This deliberately
differs from the CSS-only motion decisions in NavigationMenu and Sidebar, so
registry metadata for NavDock must declare Motion whenever the component is
implemented.

## Consequences

Reduced-motion handling remains mandatory: NavDock must preserve destination,
current, focus, open, disabled, and title state without relying on transform-heavy
movement.
