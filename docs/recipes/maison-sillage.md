# Maison Sillage perfume storefront

A fictional luxury perfume shop at `/recipes/maison-sillage`, composed from 14 Dethink component families: Button, IconButton, Badge, Card, CardScroller, Avatar, Accordion, Separator, Dialog, Drawer, RadioGroup, NumberInput, Progress and Form Field.

## Installation and adaptation

Use the existing Dethink base setup and semantic tokens. Copy `maison-sillage.tsx` and its `-data.ts`, `-product.tsx`, `-bag.tsx`, `-motion.tsx`, `-preferences.ts`, and `.css` companions from the showcase recipe directory. Copy `public/recipes/maison-sillage` to the same public path in your application. The source viewer displays the entry point, so copy the companion modules as well.

The only recipe prop is the showcase `presentation` contract (`embedded` or `full-page`). For standalone use, remove that showcase type import and use the hero as the page h1; the showcase already provides an h1 in its toolbar. The example uses React, Next Image, Motion and Lucide. Outside Next.js, adapt Image while preserving dimensions, responsive sizes, lazy loading for collection images and priority for the hero.

## Data and commerce boundaries

Edit the data module for fragrance names, descriptions, note pyramids, reviews, FAQs and size prices. Prices are integer GBP pence. Each product offers 30 ml, 50 ml and 100 ml. Bag identity is product plus size; duplicate additions merge up to 9 units, while different sizes remain separate. Quantity edits clamp to whole numbers from 1 to 9. Removing an item is explicit. Delivery is a sample £5 below £150 and complimentary at or above £150.

State lasts for the mounted recipe only. Reloading clears the bag. Checkout reviews the current lines and totals, then shows a local completion receipt and clears the bag. No payment, personal details, real order, inventory check, tax calculation or delivery request occurs. Replace sample prices/policies and connect trusted server-side pricing, validation and payment services before using this as a real store. All imagery, products, brand claims and reviews are fictional reference content.

## Interaction, accessibility and themes

- Scent-family filters use pressed buttons and announce the result count.
- Product Dialogs expose top, heart and base notes, native radio size choices, a live selected price, addition feedback and a visible close button. Escape restores the product trigger.
- The bag Drawer exposes named quantity inputs and remove controls. Removing a row moves focus to the bag heading; review/completion moves focus to its heading. Closing returns focus to the bag trigger. Empty state offers a way back to the page.
- Reviews use CardScroller with touch/drag, native keyboard selection and previous/next controls. No autoplay is used.
- Bounded viewport reveals and filtered collection transitions use Motion. The reactive system preference and page pause control disable decorative movement. The drawer also receives the reduced-motion setting. User-initiated CardScroller scrolling follows the system preference.
- Semantic variables define ivory/burgundy light and dark themes, including portal content. Generated photographs retain their original colours. Forced-colour selected filters use an outline.
- Mobile layout stacks the hero and catalog, wraps navigation, and keeps the bag and product dialogs within the viewport.

## Verification

The recipe browser spec checks catalog discovery and source/thumbnail availability, filters, size pricing, variant additions and merging, quantity limits, totals, empty recovery, review/completion, keyboard focus, responsive overflow, reduced motion and axe in both themes. Visually inspect desktop and mobile layouts in addition to automated checks. Manual keyboard acceptance: traverse scent filters, open a fragrance, change size with arrow keys, add to bag, dismiss, open the bag, edit/remove lines, review, return to bag, complete the demo and dismiss.

Generated image prompts and provenance are in `public/recipes/maison-sillage/README.md`. The recipe adds no new public component API or registry item.
