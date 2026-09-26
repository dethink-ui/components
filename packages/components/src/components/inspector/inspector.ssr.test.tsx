// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import {
  Inspector,
  InspectorNumber,
  InspectorProperty,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
} from ".";

it("renders sections, values, and units without browser APIs", () => {
  const html = renderToString(
    <Inspector value={{ layout: { width: 120 }, visible: true, align: "end" }}>
      <InspectorSection title="Layout">
        <InspectorProperty path="layout.width" label="Width">
          <InspectorNumber unit="px" />
        </InspectorProperty>
        <InspectorProperty path="visible" label="Visible">
          <InspectorSwitch />
        </InspectorProperty>
        <InspectorProperty path="align" label="Align">
          <InspectorSelect options={[{ value: "end", label: "End" }]} />
        </InspectorProperty>
      </InspectorSection>
    </Inspector>,
  );

  expect(html).toContain("Layout");
  expect(html).toContain('value="120"');
  expect(html).toContain("px");
  expect(html).toContain('aria-expanded="true"');
});

it("renders collapsed sections as inert", () => {
  const html = renderToString(
    <Inspector value={{ name: "Card" }}>
      <InspectorSection title="Layout" defaultOpen={false}>
        <InspectorProperty path="name" label="Name">
          <InspectorNumber />
        </InspectorProperty>
      </InspectorSection>
    </Inspector>,
  );

  expect(html).toMatch(/data-slot="inspector-section-region"[^>]*inert=""/);
});

it("renders the empty state on the server", () => {
  expect(renderToString(<Inspector value={null} />)).toContain(
    "Nothing selected",
  );
});
