# Ollo modular robot landing

A launch page for Ollo, a fictional modular home robot. Open `/recipes/robot-landing` for the full page and source view. As you scroll through a sticky teardown section, the Blender-rendered robot comes apart: first the head, then the hands, the core, and the legs. A feature card beside it follows each part. The page continues with a module card scroller, specification tabs, and a finish configurator.

## Components and interactions

The composition uses HeroTextAnimation, Button, Badge, Card, CardScroller, Progress, Tabs, RadioGroup, Checkbox, Switch, Field components, and Separator, plus Motion for the pinned scene.

- **Pinned scene**: `useScroll` tracks a 640vh section whose sticky stage fills the viewport. The robot starts under the headline on a glowing pedestal, over a perspective grid floor, a rotating colour field, and a giant gradient wordmark.
  - As you scroll, the headline lifts away and the robot rises to the centre. Then the head, hands, core, and legs detach in sequence; each layer maps its own scroll window to `translate`, `rotate`, and `scale`.
  - At extra-large widths each feature callout slides in beside the part it describes and stays listed, with the active one at full strength. The finale shrinks the robot slightly to make room for a closing line.
  - Below that width, the active feature appears in one glass card under the robot.
  - A glass HUD shows Progress and step buttons.
- **Modules**: a CardScroller of the six modules with gradient-edged cards and cropped part renders.
- **Specs**: headline figures and Tabs for body, power, and intelligence.
- **Configurator**: a glass panel where the finish radio group re-tints the render with CSS filters, add-on checkboxes update the total, the assembly switch changes the summary, and Reserve shows a local confirmation. Nothing is stored or sent.

The page uses one vibrant night theme (deep violet with a coral, pink, violet, and cyan gradient) in both light and dark site modes, as a launch stage would.

## How the 3D effect works

Every part is rendered as a full-frame transparent layer from the same camera, so stacking the layers reproduces the assembled robot exactly. The layers are absolutely positioned in one aspect-ratio box. Percentage translates are relative to that box, so the explode scales with the viewport. See `apps/showcase/public/recipes/robot-landing/README.md` for render details. To use your own model, render one layer per detachable part with a locked camera and a transparent film, then adjust `parts` (paint order, scroll window, offset, rotation, label position).

Opacity values use the function form of `useTransform`. Motion can hand a plain scroll-linked `opacity` mapping to a native ScrollTimeline, and with a target-offset scroll that timeline maps the range incorrectly.

## Copying the recipe

Copy `robot-landing.tsx` and `robot-landing.css` from `apps/showcase/src/examples/recipes`, plus the public `recipes/robot-landing` renders. Install the referenced Dethink components, Motion, and Lucide React on top of the documented Tailwind base setup. Replace the showcase-only `RecipePreviewProps` type with your own presentation prop.

`--robot-sticky-top` offsets the sticky stage below the showcase's site header and recipe bar. Set it to `0` or to your own header height. Sticky positioning needs every ancestor of the teardown section to avoid `overflow: hidden`; the recipe root uses `overflow-x: clip` for that reason. Move callouts by editing each feature's `calloutClassName`.

## Motion and accessibility

- With `prefers-reduced-motion`, nothing scrubs, rotates, or slides. The scene switches between two still states: assembled under the headline at the top, then fully exploded with every feature listed once you scroll past the intro. The preference is read with a hydration-safe `useSyncExternalStore` hook, and the stage remounts when it resolves so motion values bound during hydration never drive the still layout.
- Part layers and labels are decorative. The hero and configurator renders have descriptive alt text, and the configurator's alt text names the selected finish.
- Feature callouts are `h2` headings with plain text, and the pinned scene is labelled by the page `h1`. Hero actions become `inert` once they fade out.
- On tablet and desktop, a step navigation lets keyboard users jump straight to any part. On phones it is hidden so the stage fits the viewport; the active feature card and Progress remain.

Keyboard acceptance:

- Tab to the teardown step buttons and press Enter to jump to each part.
- Move through the module scroller with its controls.
- Switch spec tabs with the arrow keys.
- Choose a finish with the arrow keys.
- Toggle add-ons and assembly with Space.
- Activate Reserve and confirm the polite status message.

## Verification

`e2e/showcase-robot-landing.spec.ts` covers:

- gallery, source, thumbnail, and asset availability;
- scroll-driven step changes and part transforms;
- keyboard step navigation;
- reduced motion;
- configurator totals, finish, and reservation;
- narrow-screen overflow;
- light and dark axe scans.

Refresh the thumbnail with `pnpm capture:recipes robot-landing` against a running showcase.
