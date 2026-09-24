# Alex Morgan professional CV

A fictional professional portfolio composed from Dethink components. Open `/recipes/professional-cv` in the showcase or find it under Marketing in the recipe gallery.

Copy the `professional-cv` source and companion data/theme files from `apps/showcase/src/examples/recipes`, plus `public/recipes/professional-cv`. Keep the documented Dethink base CSS and tokens installed. Replace the fictional identity, experience, claims, education and images before personal use.

The recipe uses 14 existing component families: Accordion, Avatar, Badge, Button, Card, CardScroller, Dialog, Form Field, IconButton, Input, Select, Separator, Textarea and Timeline. No new public library API, dependency or registry item is added.

## Copy and customise

Copy `professional-cv.tsx`, `professional-cv-data.ts`, `professional-cv-projects.tsx`, `professional-cv-contact.tsx`, `professional-cv-motion.tsx`, `professional-cv-preferences.ts` and `professional-cv.css` together. Copy all assets under `public/recipes/professional-cv` to the same public URL in your application. The source viewer shows the entry point; the companions are required.

The only recipe prop is the existing showcase `presentation` contract (`embedded` or `full-page`). For standalone use, remove that showcase type import, use the hero as your page's h1, and remove the surrounding recipe toolbar. The supplied showcase already owns its h1. The example uses Next Image, Lucide icons, React and Motion; outside Next.js, replace Image with your framework's image component while retaining dimensions, responsive sizes, lazy loading and hero priority.

Edit the data module for career and case-study content. Replace the portrait, fictional collaborators and testimonial, sample metrics, education and downloadable `alex-morgan-cv.txt`. The TXT download is intentionally plain text and broadly readable; substitute your own accessible PDF if desired.

## Interactions and accessibility

- Section navigation uses ordinary fragment links and unique instance IDs.
- Project filters are pressed buttons. Matching results are announced politely. Each case study uses Dialog for Escape dismissal, focus trapping and trigger restoration.
- The career Timeline is informational, with selection disabled. The process Accordion supports keyboard disclosure.
- Four fictional testimonials use Dethink CardScroller with overlapping cards, native keyboard selection, touch/drag scrolling, and previous/next controls. Two cards fit on desktop and one on narrow screens. The page pause control removes decorative scale/spotlight transitions; system reduced motion also makes scroller navigation immediate. There is no autoplay.
- The contact form validates required fields and focuses the first invalid field. Success focuses the prepared enquiry heading. Nothing is sent or persisted, and closing the dialog clears the sample. Wire a real endpoint, server validation and delivery feedback before offering actual contact submission.
- Light/dark modes use scoped semantic tokens, including portal content. Portrait and artwork retain their original photographic colours. All raster assets are generated samples.
- Decorative viewport reveals and filtered-card transitions use Motion. System reduced motion is reactive; the page pause control disables recipe motion independently. Content is present in server markup and remains readable without animation. CSS handles simple hover states.
- Layout stacks in reading order on mobile. The contact and case-study dialogs scroll within the viewport.

## Verification

`e2e/showcase-professional-cv.spec.ts` covers discovery, source/thumbnail availability, navigation, project filtering, case studies and focus restoration, contact validation and reset, the CV download, disclosure, reactive reduced motion, responsive overflow, and axe checks in both themes. Inspect desktop/mobile captures in addition to automation. For manual keyboard acceptance, traverse navigation and project filters, open/close each case study, expand the process rows, complete the contact form and confirm focus returns to its trigger.

Asset generation prompts and provenance are kept in `public/recipes/professional-cv/README.md`.
