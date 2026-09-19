---
"@dethink/components": patch
---

Polish control, overlay, selection, and loading transitions with shared timings and reduced-motion handling. Fix Switch travel, Dialog entrance, Dialog and Drawer initial keyboard focus, Accordion, Tabs and Avatar hydration, and loading-button layout stability. Pause decorative backgrounds while the document is hidden and animate progress without changing layout width.

Preserve component modules in package builds so unused widgets and Motion dependencies are removed from lightweight consumers. Keep existing package and CSS exports, and include shared utilities in registry installs.
