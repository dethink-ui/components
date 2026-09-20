import { ImageResponse } from "next/og";

export const alt =
  "Dethink Components — Build interfaces. Own the components. Open-code React components, motion, and complete recipes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse requires inline styles and renders this at build time. This card
// uses the project's own brand geometry and no external image requests.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "58px 64px",
        background: "#071d1c",
        color: "#f4fbf8",
        fontFamily: "sans-serif",
        backgroundImage:
          "radial-gradient(ellipse at top right, #145e54 0%, #071d1c 70%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="38" height="54" viewBox="34 0 242 350" fill="#b6f06b">
          <path d="M 46 201 L 46 161 Q 46 152 54 147 L 133 100 Q 141 95 149 100 L 182 119 Z" />
          <path
            transform="translate(0 18)"
            d="M 46 216 L 46 253 Q 46 263 55 269 L 133 315 Q 141 320 149 315 L 224 271 L 80 186 Z"
          />
          <path d="M 198 60 Q 198 51 206 46 L 264 12 L 264 269 Q 264 279 255 284 L 246 289 L 198 261 L 198 107 L 246 131 L 246 109 L 198 85 Z" />
        </svg>
        <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>
          dethink
        </span>
        <span
          style={{
            fontSize: 22,
            color: "#acc9c2",
            borderLeft: "1px solid #3b5d55",
            paddingLeft: 20,
          }}
        >
          Components
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          <span>Build interfaces.</span>
          <span style={{ color: "#b6f06b" }}>Own the components.</span>
        </div>
        <span style={{ fontSize: 25, color: "#c3d9d3" }}>
          Open-code React components, motion, and complete recipes.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #35544b",
          paddingTop: 24,
          fontSize: 20,
        }}
      >
        <span style={{ color: "#acc9c2" }}>
          React · Tailwind CSS · shadcn registry
        </span>
        <span>components.dethink.co.uk</span>
      </div>
    </div>,
    size,
  );
}
