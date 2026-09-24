# The Current news outlet

A fictional news homepage demonstrating Dethink components in a dense editorial layout. Open `/recipes/news-outlet` in the showcase for the full-page recipe and source view.

## Composition

The recipe uses NavigationMenu, Typography (Heading/Text), Card, Badge, Button, IconButton, Separator, Tabs, Avatar, Dialog, FormField, Input, EmptyState, and LiveRegion. The page combines a masthead, topic links, developing-story strip, photographic lead, latest/most-read rail, top stories, feature, Watch previews, culture/science, opinion, politics, and a newsletter.

Topic links navigate to their corresponding content within the page. Headline buttons open article previews. Search matches titles, summaries, categories and writers. Bookmarks share an in-memory reading list across all story appearances; refresh clears it. Video cards open still previews with a sample transcript, not a working video stream. Newsletter signup validates locally and never sends or persists the email address.

## Copying the recipe

Copy these files from the showcase examples:

- `news-outlet.tsx`: responsive composition and shared story presentation.
- `news-outlet-data.ts`: typed fictional stories and film concepts.
- `news-outlet-reader.tsx`: shared bookmarks, search and focus-managed dialogs.
- `news-outlet-newsletter.tsx`: local newsletter form.
- `news-outlet.css`: scoped semantic theme tokens.

Copy `apps/showcase/public/recipes/news-outlet` into your public asset folder. The asset README contains the imagegen prompts and provenance. Install the referenced Dethink components, Lucide React and the documented Dethink/Tailwind base setup. This showcase uses Next.js Image for responsive image delivery. In another React host, replace it with a responsive image element while preserving alt text, dimensions, eager loading for the lead and lazy loading below the fold. Replace the showcase-only RecipePreviewProps import with an optional `presentation: "embedded" | "full-page"` prop.

The recipe itself is a source-copy example; it does not introduce a public package API or a new registry component. Existing registry components remain unchanged.

## Theming and accessibility

The CSS overrides the standard semantic variables locally, including background, foreground, border, muted, primary and ring. Light/dark themes follow the showcase preference; inverse bands theme their nested controls. Layout and type styles use Tailwind utilities. The static editorial design requires no animation runtime beyond the existing components, and Tabs explicitly disables animation.

Keyboard acceptance: use the skip link; follow each topic link; operate the news tabs with arrow keys; open and close an article with Enter/Escape and check return focus; search for a story and open the nested article, returning to the search result; save a story and remove it from the reading list; submit an invalid then valid email. Named dialogs and controls, semantic headings, labelled fields, text feedback and a shared live region support assistive technology. Removing the focused saved item moves focus to the reading-list heading.

The story grid stacks without horizontal page scrolling. Section links wrap on mobile. Images reserve aspect ratio before loading. No automatic ticker, autoplay, or continually updating announcements compete with reading.

## Verification

`e2e/showcase-news-outlet.spec.ts` covers gallery/source integration, article focus restoration, search and empty-state recovery, bookmark synchronization and removal, keyboard tabs, preview transcripts, local newsletter validation, responsive layouts, image loading, theme contrast and accessibility scans. Run it against the showcase with the root Playwright configuration. Refresh the gallery image with `pnpm capture:recipes news-outlet` while the showcase is running on port 3015.

## Production integration

Replace fictional content and generated illustrations with reviewed reporting and suitable media rights. Connect article routes, search and newsletter submission to your services. If adding playback, provide captioned media and a genuine transcript. Define consent and persistence behavior before storing reader data. These integrations are intentionally outside this local recipe.
