"use client";
import {
  Button,
  Inspector,
  InspectorNumber,
  InspectorProperty,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorText,
  type InspectorValue,
} from "@dethink/components";
import { useState } from "react";

type Shape = {
  name: string;
  visible: boolean;
  locked: boolean;
  layout: { width: number; height: number; rotation: number };
  appearance: { radius: number; opacity: number; fill: string };
};

const fills = [
  { value: "primary", label: "Primary", className: "bg-primary" },
  { value: "info", label: "Info", className: "bg-info" },
  { value: "success", label: "Success", className: "bg-success" },
  { value: "warning", label: "Warning", className: "bg-warning" },
] as const;

const initialShape: Shape = {
  name: "Hero card",
  visible: true,
  locked: false,
  layout: { width: 160, height: 104, rotation: -6 },
  appearance: { radius: 16, opacity: 90, fill: "primary" },
};

export function InspectorShapePanel() {
  const [shape, setShape] = useState<Shape | null>(initialShape);
  const fillClass =
    fills.find((fill) => fill.value === shape?.appearance.fill)?.className ??
    "bg-primary";

  return (
    <div className="grid w-full gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="border-border bg-muted/30 relative grid min-h-72 place-items-center overflow-hidden rounded-lg border p-6">
        {shape ? (
          <button
            type="button"
            aria-label={`${shape.name}, selected. Click to deselect.`}
            onClick={() => setShape(null)}
            className={`${fillClass} ring-ring ring-offset-background max-w-full shadow-lg ring-2 ring-offset-2 motion-safe:transition-[width,height,rotate,border-radius,opacity] motion-safe:duration-200`}
            style={{
              width: shape.layout.width,
              height: shape.layout.height,
              rotate: `${shape.layout.rotation}deg`,
              borderRadius: shape.appearance.radius,
              opacity: shape.visible ? shape.appearance.opacity / 100 : 0.15,
            }}
          />
        ) : (
          <Button variant="outline" onClick={() => setShape(initialShape)}>
            Select the hero card
          </Button>
        )}
      </div>
      <Inspector
        aria-label="Shape properties"
        role="region"
        className="border-border bg-background rounded-lg border"
        value={shape}
        onValueChange={(next: InspectorValue) => setShape(next as Shape)}
      >
        <InspectorSection title="Layer">
          <InspectorProperty path="name" label="Name">
            <InspectorText
              validate={(text) => (text.trim() ? null : "Name the layer.")}
            />
          </InspectorProperty>
          <InspectorProperty path="visible" label="Visible">
            <InspectorSwitch />
          </InspectorProperty>
          <InspectorProperty path="locked" label="Locked">
            <InspectorSwitch />
          </InspectorProperty>
        </InspectorSection>
        <InspectorSection title="Layout">
          <InspectorProperty
            path="layout.width"
            label="Width"
            disabled={shape?.locked}
            disabledReason="Unlock the layer to resize it."
          >
            <InspectorNumber min={24} max={240} unit="px" />
          </InspectorProperty>
          <InspectorProperty
            path="layout.height"
            label="Height"
            disabled={shape?.locked}
            disabledReason="Unlock the layer to resize it."
          >
            <InspectorNumber min={24} max={200} unit="px" />
          </InspectorProperty>
          <InspectorProperty path="layout.rotation" label="Rotation">
            <InspectorNumber min={-180} max={180} unit="deg" />
          </InspectorProperty>
        </InspectorSection>
        <InspectorSection title="Appearance">
          <InspectorProperty path="appearance.fill" label="Fill">
            <InspectorSelect
              options={fills.map(({ value, label }) => ({ value, label }))}
            />
          </InspectorProperty>
          <InspectorProperty path="appearance.radius" label="Radius">
            <InspectorNumber min={0} max={64} unit="px" />
          </InspectorProperty>
          <InspectorProperty path="appearance.opacity" label="Opacity">
            <InspectorNumber min={0} max={100} step={5} unit="%" />
          </InspectorProperty>
        </InspectorSection>
      </Inspector>
    </div>
  );
}
