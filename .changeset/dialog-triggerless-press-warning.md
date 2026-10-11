---
"@dethink/components": patch
---

Stop `Dialog` and `AlertDialog` from logging "A PressResponder was rendered without a pressable child" in development when they're opened from code with no trigger (controlled, or `defaultOpen`). The root now registers with React Aria's trigger itself in that case. Triggers, including custom pressables, are wired as before, and an uncontrolled dialog with nothing to open it still warns.
