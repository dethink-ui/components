# Ollo robot renders

Original renders of a fictional modular robot, made in Blender 5.2 through the Blender MCP server on 2026-09-27. Rendered in Cycles (GPU, 128 samples, denoised, AgX "Punchy") at 1200 × 1500 with a transparent film, then exported to WebP (quality 86) with Pillow.

- `layer-*.webp`: one full-frame layer per part (`head`, `torso`, `arm-left`, `arm-right`, `leg-left`, `leg-right`), all rendered from the same camera. Stacked in paint order, they form the assembled robot. The page moves each layer independently to explode the robot on scroll.
- `layer-robot.webp`: the assembled robot in one image, used in the hero and configurator.
- `part-*.webp`: each part cropped to its bounds (max 640 px) for the module cards.

Rendering the parts separately means there are no cast shadows between them, which is what lets them separate cleanly. The source `.blend` (scene "Robot", one collection per part) and the full-resolution PNGs are in the ignored `test-results/design-references/robot-landing` directory.

Materials: glossy porcelain shell, graphite joints, orange accent (re-tinted in the page with CSS filters), black glass visor, and cyan emissive eyes and core.
