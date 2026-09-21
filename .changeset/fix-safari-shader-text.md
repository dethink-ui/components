---
"@dethink/components": patch
---

Fix ShaderHeroText falling back to static text in Safari when a heading wraps or contains line breaks. Ignore zero-width caret rectangles when measuring each character so the text mask preserves the correct lines.
