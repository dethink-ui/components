---
"@dethink/components": patch
---

Fix menus, dialogs and other overlays opened from inside the mobile sidebar drawer. The drawer made every other `<body>` child inert, including the portal containers those overlays render into, so they couldn't be clicked or focused. Portal containers now record their owning component, and the drawer leaves the ones owned by its own content interactive. The rest of the page stays inert as before.
