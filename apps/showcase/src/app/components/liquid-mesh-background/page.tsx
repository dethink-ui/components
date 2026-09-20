import type { Metadata } from "next";
import { ShaderBackgroundDocs } from "@/components/shader-background-docs";

export const metadata: Metadata = {
  title: "LiquidMeshBackground",
  description: "Soft pools of color drift and blend behind your content.",
};

export default function Page() {
  return (
    <ShaderBackgroundDocs
      effect="liquid-mesh"
      name="LiquidMeshBackground"
      description="Soft pools of color drift and blend behind your content."
    />
  );
}
