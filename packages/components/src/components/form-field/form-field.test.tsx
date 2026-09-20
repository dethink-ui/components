import { createRef, StrictMode, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
  Form,
  fieldClassNames,
  formClassNames,
} from ".";

describe("Field", () => {
  it("keeps independent description IDs stable through child and parent rerenders", async () => {
    const user = userEvent.setup();
    function DynamicDescription() {
      const [expanded, setExpanded] = useState(false);
      return (
        <>
          <FieldDescription>
            {expanded ? "Expanded help" : "Short help"}
          </FieldDescription>
          <button type="button" onClick={() => setExpanded(!expanded)}>
            Toggle help
          </button>
        </>
      );
    }
    const fixture = (label: string) => (
      <StrictMode>
        <Field invalid>
          <FieldLabel>{label}</FieldLabel>
          <FieldControl asChild>
            <input />
          </FieldControl>
          <FieldDescription>Permanent help</FieldDescription>
          <DynamicDescription />
          <FieldError>Required value</FieldError>
        </Field>
      </StrictMode>
    );
    const { rerender } = render(fixture("Name"));
    const input = screen.getByRole("textbox");
    const permanentId = screen.getByText("Permanent help").id;
    const dynamicId = screen.getByText("Short help").id;
    const errorId = screen.getByText("Required value").id;
    expect(new Set([permanentId, dynamicId, errorId]).size).toBe(3);
    await user.click(screen.getByRole("button", { name: "Toggle help" }));
    expect(screen.getByText("Expanded help")).toHaveAttribute("id", dynamicId);
    rerender(fixture("Full name"));
    expect(screen.getByText("Permanent help")).toHaveAttribute(
      "id",
      permanentId,
    );
    expect(screen.getByText("Expanded help")).toHaveAttribute("id", dynamicId);
    expect(screen.getByText("Required value")).toHaveAttribute("id", errorId);
    for (const id of [permanentId, dynamicId, errorId]) {
      expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(id);
    }
    expect(input).toHaveAttribute("aria-errormessage", errorId);
  });

  it("renders a native form with native attributes and spacing", () => {
    const ref = createRef<HTMLFormElement>();

    render(
      <Form
        ref={ref}
        action="/settings"
        method="post"
        spacing="lg"
        className="custom-form"
      >
        <button type="submit">Save settings</button>
      </Form>,
    );

    const form = screen
      .getByRole("button", { name: "Save settings" })
      .closest("form");

    expect(form).toHaveAttribute("data-slot", "form");
    expect(form).toHaveAttribute("data-spacing", "lg");
    expect(form).toHaveAttribute("action", "/settings");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveClass("custom-form");
    expect(
      formClassNames({ spacing: "lg", className: "custom-form" }),
    ).toContain("custom-form");
    expect(ref.current).toBe(form);
  });

  it("renders a structural field with safe defaults", () => {
    render(
      <Field>
        <FieldLabel>Workspace name</FieldLabel>
        <FieldControl asChild>
          <input />
        </FieldControl>
      </Field>,
    );

    const field = screen
      .getByText("Workspace name")
      .closest('[data-slot="field"]');
    const input = screen.getByLabelText("Workspace name");

    expect(field).toHaveAttribute("data-slot", "field");
    expect(field).toHaveAttribute("data-orientation", "vertical");
    expect(field).not.toHaveAttribute("role");
    expect(field).not.toHaveAttribute("tabindex");
    expect(input).toHaveAttribute("data-slot", "field-control");
    expect(input.id).toBeTruthy();
  });

  it("uses explicit IDs for label and control association", async () => {
    const user = userEvent.setup();

    render(
      <Field id="workspace-slug">
        <FieldLabel>Workspace slug</FieldLabel>
        <FieldControl asChild>
          <input id="ignored-child-id" />
        </FieldControl>
      </Field>,
    );

    const label = screen.getByText("Workspace slug");
    const input = screen.getByLabelText("Workspace slug");

    expect(label).toHaveAttribute("for", "workspace-slug");
    expect(input).toHaveAttribute("id", "workspace-slug");

    await user.click(label);

    expect(input).toHaveFocus();
  });

  it("uses Field IDs as the relationship source over control and child IDs", () => {
    render(
      <Field id="account-name">
        <FieldLabel>Account name</FieldLabel>
        <FieldControl asChild id="ignored-control-id">
          <input id="ignored-child-id" />
        </FieldControl>
        <FieldDescription id="account-name-help">
          This ID is stable for tests and form libraries.
        </FieldDescription>
      </Field>,
    );

    const label = screen.getByText("Account name");
    const input = screen.getByLabelText("Account name");

    expect(label).toHaveAttribute("for", "account-name");
    expect(input).toHaveAttribute("id", "account-name");
    expect(input).toHaveAttribute("aria-describedby", "account-name-help");
  });

  it("composes description and error relationships for invalid controls", async () => {
    render(
      <Field id="email" invalid required>
        <FieldLabel>Email</FieldLabel>
        <FieldControl asChild>
          <input type="email" aria-describedby="existing-help" />
        </FieldControl>
        <FieldDescription id="email-help">
          Use your work email.
        </FieldDescription>
        <FieldError id="email-error">Enter a valid email address.</FieldError>
      </Field>,
    );

    const input = screen.getByLabelText(/Email/);

    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");

    await waitFor(() => {
      expect(input).toHaveAttribute(
        "aria-describedby",
        "existing-help email-help email-error",
      );
    });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage", "email-error");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("data-invalid", "true");
    expect(screen.getByText("Enter a valid email address.")).toHaveAttribute(
      "data-invalid",
      "true",
    );
  });

  it("does not reference visible errors while the field is valid", async () => {
    render(
      <Field id="project">
        <FieldLabel>Project</FieldLabel>
        <FieldControl asChild>
          <input />
        </FieldControl>
        <FieldDescription id="project-help">
          Pick an active project.
        </FieldDescription>
        <FieldError id="project-error">Project is required.</FieldError>
      </Field>,
    );

    const input = screen.getByLabelText("Project");

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-describedby", "project-help");
    });

    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-errormessage");
    expect(input).not.toHaveAttribute("aria-describedby", "project-error");
  });

  it("propagates disabled, required, and read-only state", () => {
    render(
      <Field id="review-note" disabled required readOnly>
        <FieldLabel>Review note</FieldLabel>
        <FieldControl asChild>
          <input />
        </FieldControl>
      </Field>,
    );

    const field = screen
      .getByText("Review note")
      .closest('[data-slot="field"]');
    const input = screen.getByLabelText(/Review note/);

    expect(field).toHaveAttribute("data-disabled", "true");
    expect(field).toHaveAttribute("data-required", "true");
    expect(field).toHaveAttribute("data-readonly", "true");
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("data-disabled", "true");
    expect(input).toHaveAttribute("data-required", "true");
    expect(input).toHaveAttribute("data-readonly", "true");
  });

  it("renders error lists from form-library shaped errors", () => {
    render(
      <Field id="name" invalid>
        <FieldLabel>Name</FieldLabel>
        <FieldControl asChild>
          <input />
        </FieldControl>
        <FieldError
          errors={[
            { message: "Name is required." },
            { message: "Name must be under 80 characters." },
          ]}
        />
      </Field>,
    );

    expect(screen.getByText("Name is required.").closest("li")).not.toBeNull();
    expect(
      screen.getByText("Name must be under 80 characters.").closest("li"),
    ).not.toBeNull();
  });

  it("composes consumer classes and forwards refs", () => {
    const fieldRef = createRef<HTMLElement>();
    const controlRef = createRef<HTMLInputElement>();

    render(
      <Field ref={fieldRef} id="team" className="custom-field">
        <FieldLabel>Team</FieldLabel>
        <FieldControl ref={controlRef} asChild className="custom-control">
          <input className="consumer-control" />
        </FieldControl>
      </Field>,
    );

    const input = screen.getByLabelText("Team");

    expect(fieldClassNames({ className: "custom-field" })).toContain(
      "custom-field",
    );
    expect(fieldRef.current).toHaveAttribute("data-slot", "field");
    expect(controlRef.current).toBe(input);
    expect(input).toHaveClass("custom-control", "consumer-control");
  });

  it("rejects asChild usage without a direct element child", () => {
    const invalidChild = "Text" as never;

    expect(() =>
      render(<FieldControl asChild>{invalidChild}</FieldControl>),
    ).toThrow(
      "FieldControl with asChild expects a single React element child.",
    );
  });

  it("renders field groups, fieldsets, and legends with native semantics", () => {
    const fieldSetRef = createRef<HTMLFieldSetElement>();

    render(
      <FieldSet
        ref={fieldSetRef}
        disabled
        aria-describedby="preferences-help"
        className="custom-fieldset"
      >
        <FieldLegend variant="label">Preferences</FieldLegend>
        <FieldDescription id="preferences-help">
          Choose every notification channel to enable.
        </FieldDescription>
        <FieldGroup gap="sm">
          <Field id="email-notifications">
            <FieldLabel>Email notifications</FieldLabel>
            <FieldControl asChild>
              <input type="checkbox" />
            </FieldControl>
          </Field>
        </FieldGroup>
      </FieldSet>,
    );

    const fieldset = screen.getByText("Preferences").closest("fieldset");
    const legend = screen.getByText("Preferences");
    const group = screen
      .getByText("Email notifications")
      .closest('[data-slot="field-group"]');
    const checkbox = screen.getByLabelText("Email notifications");

    expect(fieldset).toHaveAttribute("data-slot", "field-set");
    expect(fieldset).toHaveAttribute("aria-describedby", "preferences-help");
    expect(fieldset).toHaveAttribute("data-disabled", "true");
    expect(fieldset).toHaveClass("custom-fieldset");
    expect(fieldSetRef.current).toBe(fieldset);
    expect(legend.tagName).toBe("LEGEND");
    expect(legend).toHaveAttribute("data-slot", "field-legend");
    expect(legend).toHaveAttribute("data-variant", "label");
    expect(group).toHaveAttribute("data-gap", "sm");
    expect(group).not.toHaveAttribute("role");
    expect(checkbox).toBeDisabled();
  });

  it("supports horizontal field content rows", () => {
    render(
      <Field id="sync" orientation="horizontal">
        <FieldContent>
          <FieldTitle>Sync reports</FieldTitle>
          <FieldDescription>
            Keep reports refreshed in the background.
          </FieldDescription>
        </FieldContent>
        <FieldControl asChild>
          <input type="checkbox" />
        </FieldControl>
      </Field>,
    );

    const field = screen
      .getByText("Sync reports")
      .closest('[data-slot="field"]');
    const content = screen
      .getByText("Sync reports")
      .closest('[data-slot="field-content"]');
    const title = screen.getByText("Sync reports");

    expect(field).toHaveAttribute("data-orientation", "horizontal");
    expect(field?.className).toContain(
      "data-[orientation=horizontal]:grid-cols-[minmax(0,1fr)_auto]",
    );
    expect(content).toHaveAttribute("data-slot", "field-content");
    expect(title).toHaveAttribute("data-slot", "field-title");
    expect(title.tagName).toBe("DIV");
  });

  it("keeps horizontal option controls next to and aligned with their labels", () => {
    render(
      <Field id="updates" orientation="horizontal">
        <FieldControl asChild>
          <input type="checkbox" />
        </FieldControl>
        <FieldLabel>Receive product updates</FieldLabel>
      </Field>,
    );

    const field = screen
      .getByText("Receive product updates")
      .closest('[data-slot="field"]');
    const checkbox = screen.getByLabelText("Receive product updates");

    expect(field).toHaveAttribute("data-orientation", "horizontal");
    expect(checkbox).toHaveAttribute("data-slot", "field-control");
    expect(field?.className).toContain(
      "data-[orientation=horizontal]:[&:has(>[data-slot=field-control]:first-child)]:grid-cols-[auto_minmax(0,1fr)]",
    );
    expect(field?.className).toContain(
      "data-[orientation=horizontal]:[&:has(>[data-slot=field-control]:first-child+[data-slot=field-label])]:items-center",
    );
  });
});
