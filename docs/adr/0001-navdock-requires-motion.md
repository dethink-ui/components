# NavDock requires Motion

NavDock uses `motion/react` as a required runtime dependency because dock
magnification, adjacent-item handoff, submenu presence, and title transitions
are core component behavior rather than optional visual polish. At the time of
this decision, that deliberately differed from the CSS-only motion decisions in
NavigationMenu and Sidebar. Sidebar later adopted Motion narrowly for its
edge-mounted collapse handle in #347; NavDock still uses Motion across its core
dock interactions. Registry metadata must declare Motion for both components.

## Consequences

Reduced-motion handling remains mandatory: NavDock must preserve destination,
current, focus, open, disabled, and title state without relying on transform-heavy
movement.
