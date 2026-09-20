import type { Metadata } from "next";
import { ShaderBackgroundDocs } from "@/components/shader-background-docs";

export const metadata: Metadata = {
  title: "ContourFieldBackground",
  description: "Topographic contours evolve through a warped noise field.",
};

export default function Page() {
  return (
    <ShaderBackgroundDocs
      effect="contour-field"
      name="ContourFieldBackground"
      description="Topographic contours evolve through a warped noise field."
    />
  );
}
