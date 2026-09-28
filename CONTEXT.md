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

**Filter**:
The serializable tree that narrows a data set. Its root is always a group of
conditions and nested groups. Every filter surface (chips, text query, group
editor, AI proposals, URL state and saved views) reads and writes the same
filter.
_Avoid_: Query object, filter state, filter model (in public docs)

**Condition**:
One field, operator and value test in a filter, such as "Status is any of Open,
Blocked". A condition with no value yet is incomplete and filters nothing.
_Avoid_: Rule, predicate, clause

**Filter group**:
A set of conditions or nested groups joined by one combinator, "and" or "or",
and optionally negated.
_Avoid_: Rule group, block, bracket

**Filter chip**:
The visual form of a condition in a FilterBar: field, operator and value
segments plus a remove action, each editable in place.
_Avoid_: Pill, token, tag

**Query**:
The text form of a filter, such as `status:open created:>-7d (assignee:ada OR
labels:bug)`. Parsing a query gives a filter, and printing a filter gives its
canonical query; the two round-trip. "Term" is one `field:value` part.
_Avoid_: Search string, expression, DSL (in public docs)

**Operator token**:
The short text after `field:` that picks an operator in a query, such as `>`
in `estimate:>5` or `!` in `status:!done`.
_Avoid_: Symbol, prefix

**Saved view**:
A named filter someone can return to, stored with the schema version it was
saved in and an optional personal or team scope. A saved view is "edited" when
the current filter does something different from it.
_Avoid_: Preset, bookmark, saved search

**Filter version**:
The schema version written beside a filter in URLs (`v`) and saved views, so
filters written before a field or operator was renamed can be migrated.
_Avoid_: Revision, schema id

**Proposal**:
A set of filter changes suggested by the assistant (added, changed and
removed chips) that someone reviews, accepts or rejects per change, and
applies as one undo step. A proposal never changes the filter by itself.
_Avoid_: Suggestion, AI filter, draft

**Needs-input chip**:
A proposed condition whose field and operator are known but whose value
couldn't be used, added without a value for the person to fill in.
_Avoid_: Partial chip, placeholder
