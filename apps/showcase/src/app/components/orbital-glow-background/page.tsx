import type { Metadata } from "next";
import { ShaderBackgroundDocs } from "@/components/shader-background-docs";

export const metadata: Metadata = {
  title: "OrbitalGlowBackground",
  description:
    "Luminous elliptical rings surround a soft, slowly shifting core.",
};

export default function Page() {
  return (
    <ShaderBackgroundDocs
      effect="orbital-glow"
      name="OrbitalGlowBackground"
      description="Luminous elliptical rings surround a soft, slowly shifting core."
    />
  );
}
