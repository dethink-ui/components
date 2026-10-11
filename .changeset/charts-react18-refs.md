---
"@dethink/components": patch
---

Fix a React 18 type error in registry installs of `chart`, `sparkline` and `stat-tile`: `useChartSize` now returns a plain mutable ref instead of React 19's `RefObject`, which React 18's types mark read-only.
