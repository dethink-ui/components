---
"@dethink/components": patch
---

Soften Dialog and AlertDialog backdrops with a subtle blur while retaining the
existing overlay dimming. Disable the blur in forced-colors mode. Consumers can
override it using `overlayClassName="backdrop-blur-none"`.
