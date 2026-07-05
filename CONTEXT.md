# Dethink Components

Dethink Components is a React component library for production SaaS dashboards,
internal tools, B2B applications, and AI-native interfaces.

## Language

**NavDock**:
A dock-style navigation surface for quick access to primary destinations from
an edge of a product interface. It is distinct from NavigationMenu flyouts and
Sidebar app-shell navigation because its defining concept is compact, icon-first
spatial navigation.
_Avoid_: Dock, dock menu, navigation dock, app dock

**Current navigation item**:
The navigation item that represents the user's present route or location. Use
current state for route-derived navigation status rather than selected state.
_Avoid_: Selected nav item, selected route, active route

**NavDock submenu**:
A disclosure panel attached to a NavDock item that exposes related navigation
destinations or explicitly declared actions. It is not an application menu by
default.
_Avoid_: Dock menu, ARIA menu, menuitem submenu

**In-page navigation**:
Navigation or view switching within the current page context, such as changing
sections, panels, or local modes without changing the application route.
_Avoid_: Command, mutation, destructive action

**Responsive collapsed mode**:
A NavDock behavior where the dock presents a compact entry point on small or
coarse-pointer devices and expands before item activation. It is a NavDock
interaction state, not a Sidebar or drawer handoff.
_Avoid_: Mobile drawer, sidebar collapse, double-tap navigation
