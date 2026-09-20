import type { Metadata } from "next";
import { ShaderBackgroundDocs } from "@/components/shader-background-docs";

export const metadata: Metadata = {
  title: "CausticLightBackground",
  description: "Moving water-like ridges cast a field of caustic light.",
};

export default function Page() {
  return (
    <ShaderBackgroundDocs
      effect="caustic-light"
      name="CausticLightBackground"
      description="Moving water-like ridges cast a field of caustic light."
    />
  );
}
