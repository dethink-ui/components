import type { Metadata } from "next";
import Link from "next/link";
import { DocsPage, DocsSection } from "@/components/docs-page";
import { ShaderBackgroundPreview } from "@/examples/shader-backgrounds/preview";

export const metadata: Metadata = {
  title: "Shader backgrounds",
  description: "Five WebGL backgrounds for expressive product heroes.",
};
const effects = [
  "liquid-mesh",
  "silk-flow",
  "caustic-light",
  "contour-field",
  "orbital-glow",
] as const;
export default function Page() {
  return (
    <DocsPage
      name="Shader backgrounds"
      description="Five ways to set the scene. Flowing colors, satin folds, underwater light, evolving contours, and luminous orbits — behind real, usable content."
    >
      <DocsSection id="built-with" title="Built with">
        <p className="text-muted-foreground text-sm leading-6">
          These backgrounds use React and custom WebGL shaders through browser
          APIs. They do not use Three.js or another external graphics engine.
          Each effect’s documentation lists its shared styling dependencies.
        </p>
      </DocsSection>
      <DocsSection
        id="collection"
        title="Set the scene"
        description="Each background is independently installable. Open its documentation for the API, code and full controls."
      >
        <div className="space-y-10">
          {effects.map((effect) => (
            <div key={effect}>
              <ShaderBackgroundPreview effect={effect} compact />
              <Link
                className="text-primary mt-3 inline-block text-sm underline"
                href={`/components/${effect}-background`}
              >
                Open {effect.replaceAll("-", " ")} documentation →
              </Link>
            </div>
          ))}
        </div>
      </DocsSection>
    </DocsPage>
  );
}
