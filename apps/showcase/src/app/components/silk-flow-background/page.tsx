import type { Metadata } from "next";
import { ShaderBackgroundDocs } from "@/components/shader-background-docs";

export const metadata: Metadata = {
  title: "SilkFlowBackground",
  description:
    "Satin folds flow across the surface with gentle directional lighting.",
};

export default function Page() {
  return (
    <ShaderBackgroundDocs
      effect="silk-flow"
      name="SilkFlowBackground"
      description="Satin folds flow across the surface with gentle directional lighting."
    />
  );
}
