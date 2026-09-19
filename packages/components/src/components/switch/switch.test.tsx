import { act, createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../form-field";
import { Switch, switchClassNames } from ".";

describe("Switch", () => {
  it("renders a native checkbox input with switch semantics, attributes, classes, and refs", () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <>
        <label htmlFor="feature-flag">Feature flag</label>
        <Switch
          ref={ref}
          className="custom-switch"
          controlSize="lg"
          defaultChecked
          id="feature-flag"
          name="featureFlag"
          value="enabled"
        />
      </>,
    );

    const switchInput = screen.getByRole("switch", { name: "Feature flag" });
    const root = switchInput.closest("[data-slot='switch']");
    const track = root?.querySelector("[data-slot='switch-track']");
    const thumb = root?.querySelector("[data-slot='switch-thumb']");

    expect(switchInput.tagName).toBe("INPUT");
    expect(switchInput).toHaveAttribute("data-slot", "switch-input");
    expect(switchInput).toHaveAttribute("data-size", "lg");
    expect(switchInput).toHaveAttribute("name", "featureFlag");
    expect(switchInput).toHaveAttribute("type", "checkbox");
    expect(switchInput).toHaveAttribute("value", "enabled");
    expect(switchInput).toHaveAttribute("aria-checked", "true");
    expect(switchInput).toBeChecked();
    expect(root).toHaveAttribute("data-state", "checked");
    expect(root).toHaveClass("custom-switch");
    expect(track).toHaveAttribute("data-state", "checked");
    expect(thumb).toHaveAttribute("data-state", "checked");
    expect(switchClassNames({ className: "custom-switch" })).toContain(
      "custom-switch",
    );
    expect(ref.current).toBe(switchInput);
  });

  it("preserves controlled checked behavior", async () => {
    const user = userEvent.setup();

    function ControlledSwitch() {
      const [checked, setChecked] = useState(false);

      return (
        <>
          <label htmlFor="controlled-switch">Enable guardrails</label>
          <Switch
            id="controlled-switch"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <output>{checked ? "enabled" : "disabled"}</output>
        </>
      );
    }

    render(<ControlledSwitch />);

    const switchInput = screen.getByRole("switch", {
      name: "Enable guardrails",
    });

    await user.click(switchInput);

    expect(switchInput).toBeChecked();
    expect(screen.getByText("enabled")).toBeInTheDocument();
  });

  it("participates in native form data", () => {
    render(
      <form aria-label="Switch form">
        <Switch name="twoFactor" value="enabled" defaultChecked />
        <Switch name="digest" value="enabled" />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Switch form" });
    const formData = new FormData(form as HTMLFormElement);

    expect(formData.get("twoFactor")).toBe("enabled");
    expect(formData.get("digest")).toBeNull();
  });

  it("exposes invalid, disabled, required, and read-only state", () => {
    render(
      <>
        <label htmlFor="locked-switch">Locked switch</label>
        <Switch
          id="locked-switch"
          disabled
          invalid
          readOnly
          required
          defaultChecked
        />
      </>,
    );

    const switchInput = screen.getByRole("switch", { name: "Locked switch" });
    const root = switchInput.closest("[data-slot='switch']");

    expect(switchInput).toBeDisabled();
    expect(switchInput).toBeRequired();
    expect(switchInput).toHaveAttribute("readonly");
    expect(switchInput).toHaveAttribute("aria-invalid", "true");
    expect(switchInput).toHaveAttribute("aria-readonly", "true");
    expect(root).toHaveAttribute("data-disabled", "true");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveAttribute("data-readonly", "true");
    expect(root).toHaveAttribute("data-required", "true");
  });

  it("prevents read-only user changes without emitting checked changes", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();
    const handleChange = vi.fn();

    render(
      <>
        <label htmlFor="readonly-switch">Read-only switch</label>
        <Switch
          id="readonly-switch"
          readOnly
          defaultChecked
          onChange={handleChange}
          onCheckedChange={handleCheckedChange}
        />
      </>,
    );

    const switchInput = screen.getByRole("switch", {
      name: "Read-only switch",
    });

    await user.click(switchInput);

    expect(switchInput).toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it("supports keyboard toggling through the native input", async () => {
    const user = userEvent.setup();

    render(
      <>
        <label htmlFor="keyboard-switch">Keyboard switch</label>
        <Switch id="keyboard-switch" />
      </>,
    );

    const switchInput = screen.getByRole("switch", { name: "Keyboard switch" });

    switchInput.focus();
    await user.keyboard("[Space]");

    expect(switchInput).toBeChecked();
  });

  it("preserves native onChange before emitting checked changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleCheckedChange = vi.fn();

    render(
      <>
        <label htmlFor="change-switch">Change switch</label>
        <Switch
          id="change-switch"
          onChange={handleChange}
          onCheckedChange={handleCheckedChange}
        />
      </>,
    );

    await user.click(screen.getByRole("switch", { name: "Change switch" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it("composes with FieldControl relationships", () => {
    render(
      <Field id="two-factor" invalid required orientation="horizontal">
        <FieldContent>
          <FieldLabel>Multi-factor authentication</FieldLabel>
          <FieldDescription>
            Require a second verification step.
          </FieldDescription>
          <FieldError>Enable this setting for admins.</FieldError>
        </FieldContent>
        <FieldControl asChild>
          <Switch name="twoFactor" value="enabled" />
        </FieldControl>
      </Field>,
    );

    const switchInput = screen.getByRole("switch", {
      name: "Multi-factor authentication",
    });
    const root = switchInput.closest("[data-slot='field-control']");

    expect(switchInput).toHaveAttribute("id", "two-factor");
    expect(switchInput).toHaveAttribute(
      "aria-describedby",
      "two-factor-description two-factor-error",
    );
    expect(switchInput).toHaveAttribute(
      "aria-errormessage",
      "two-factor-error",
    );
    expect(switchInput).toHaveAttribute("aria-invalid", "true");
    expect(switchInput).toBeRequired();
    expect(root).toHaveClass(switchClassNames());
  });
});

describe("Switch spring", () => {
  it("keeps keyboard, form data and controlled state synchronous", async () => {
    const user = userEvent.setup();
    function Form() {
      const [checked, setChecked] = useState(false);
      return (
        <form aria-label="Spring form">
          <Switch
            spring
            aria-label="Spring setting"
            name="setting"
            value="on"
            checked={checked}
            onCheckedChange={setChecked}
          />
        </form>
      );
    }
    await act(async () => {
      render(<Form />);
    });
    const input = screen.getByRole("switch", { name: "Spring setting" });
    expect(input).not.toHaveAttribute("spring");
    input.focus();
    await user.keyboard("[Space]");
    expect(input).toBeChecked();
    expect(input).toHaveFocus();
    expect(
      new FormData(screen.getByRole("form") as HTMLFormElement).get("setting"),
    ).toBe("on");
    await user.keyboard("[Space]");
    expect(input).not.toBeChecked();
  });

  it("preserves read-only and disabled state with a spring", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    await act(async () => {
      render(
        <>
          <Switch
            spring
            readOnly
            defaultChecked
            aria-label="Read only"
            onCheckedChange={change}
          />
          <Switch
            spring
            disabled
            aria-label="Disabled"
            onCheckedChange={change}
          />
        </>,
      );
    });
    await user.click(screen.getByRole("switch", { name: "Read only" }));
    await user.click(screen.getByRole("switch", { name: "Disabled" }));
    expect(screen.getByRole("switch", { name: "Read only" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Disabled" })).not.toBeChecked();
    expect(change).not.toHaveBeenCalled();
  });

  it("preserves checked state when opting in and out at runtime", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Switch aria-label="Motion setting" defaultChecked />,
    );
    await act(async () => {
      rerender(<Switch spring aria-label="Motion setting" defaultChecked />);
    });
    const input = screen.getByRole("switch", { name: "Motion setting" });
    expect(input).toBeChecked();
    await user.click(input);
    rerender(<Switch aria-label="Motion setting" defaultChecked />);
    expect(input).not.toBeChecked();
  });
});
