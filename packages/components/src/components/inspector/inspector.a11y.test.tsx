import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { expect, it } from "vitest";
import {
  Inspector,
  InspectorNumber,
  InspectorProperty,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorText,
} from ".";

it("has no automated accessibility violations when open, collapsed, invalid, and empty", async () => {
  const { container, getByRole, rerender } = render(
    <Inspector aria-label="Shape properties" role="region" value={{ w: 1 }}>
      <InspectorSection title="Layout" description="Size and position">
        <InspectorProperty path="name" label="Name" error="Name is required.">
          <InspectorText />
        </InspectorProperty>
        <InspectorProperty path="w" label="Width">
          <InspectorNumber unit="px" min={0} />
        </InspectorProperty>
        <InspectorProperty
          path="locked"
          label="Locked"
          disabled
          disabledReason="Locked by an admin."
        >
          <InspectorSwitch />
        </InspectorProperty>
        <InspectorProperty path="align" label="Align">
          <InspectorSelect options={[{ value: "start", label: "Start" }]} />
        </InspectorProperty>
      </InspectorSection>
      <InspectorSection title="Effects" defaultOpen={false}>
        <InspectorProperty path="shadow" label="Shadow">
          <InspectorSwitch />
        </InspectorProperty>
      </InspectorSection>
    </Inspector>,
  );
  expect((await axe(container)).violations).toEqual([]);

  await userEvent.click(getByRole("button", { name: "Layout" }));
  expect((await axe(container)).violations).toEqual([]);

  rerender(<Inspector aria-label="Shape properties" value={null} />);
  expect((await axe(container)).violations).toEqual([]);
});
