import { createRef, type FormEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  buttonGroupClassNames,
  buttonGroupSeparatorClassNames,
} from ".";

describe("ButtonGroup", () => {
  it("renders a labelled attached horizontal group by default", () => {
    render(
      <ButtonGroup aria-label="Document actions">
        <Button>Save</Button>
        <Button>Publish</Button>
      </ButtonGroup>,
    );

    const group = screen.getByRole("group", { name: "Document actions" });

    expect(group).toHaveAttribute("data-slot", "button-group");
    expect(group).toHaveAttribute("data-mode", "attached");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveClass("inline-flex", "flex-row", "gap-0");
  });

  it("supports separated and vertical geometry", () => {
    render(
      <ButtonGroup
        aria-label="Record actions"
        mode="separated"
        orientation="vertical"
      >
        <Button>Duplicate</Button>
        <Button>Archive</Button>
      </ButtonGroup>,
    );

    expect(screen.getByRole("group", { name: "Record actions" })).toHaveClass(
      "flex-col",
      "gap-density-gap",
    );
  });

  it("uses an external label through native aria-labelledby passthrough", () => {
    render(
      <>
        <h2 id="actions-label">Project actions</h2>
        <ButtonGroup aria-labelledby="actions-label">
          <Button>Rename</Button>
        </ButtonGroup>
      </>,
    );

    expect(
      screen.getByRole("group", { name: "Project actions" }),
    ).toBeInTheDocument();
  });

  it("keeps children as independent native Tab stops in document order", async () => {
    const user = userEvent.setup();

    render(
      <ButtonGroup aria-label="Editing actions">
        <Button>Cut</Button>
        <Button disabled>Copy</Button>
        <Button loading>Paste</Button>
        <Button>Undo</Button>
      </ButtonGroup>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Cut" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Undo" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Cut" })).toHaveFocus();
  });

  it("preserves native Enter and Space activation for every child", async () => {
    const user = userEvent.setup();
    const firstAction = vi.fn();
    const secondAction = vi.fn();

    render(
      <ButtonGroup aria-label="Playback actions">
        <Button onClick={firstAction}>Previous</Button>
        <Button onClick={secondAction}>Next</Button>
      </ButtonGroup>,
    );

    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });

    previous.focus();
    await user.keyboard("{Enter}");
    next.focus();
    await user.keyboard(" ");

    expect(firstAction).toHaveBeenCalledTimes(1);
    expect(secondAction).toHaveBeenCalledTimes(1);
  });

  it("does not add arrow-key navigation or roving tabindex", async () => {
    const user = userEvent.setup();

    render(
      <ButtonGroup aria-label="Navigation actions">
        <Button>Back</Button>
        <Button>Forward</Button>
      </ButtonGroup>,
    );

    const back = screen.getByRole("button", { name: "Back" });
    const forward = screen.getByRole("button", { name: "Forward" });

    expect(back).not.toHaveAttribute("tabindex");
    expect(forward).not.toHaveAttribute("tabindex");

    back.focus();
    await user.keyboard("{ArrowRight}");

    expect(back).toHaveFocus();
  });

  it("does not clone children or replace form behavior", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={submit}>
        <ButtonGroup aria-label="Form actions">
          <Button name="intent" type="submit" value="save">
            Save form
          </Button>
          <Button type="reset">Reset form</Button>
        </ButtonGroup>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Save form" }));

    expect(submit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Save form" })).toHaveAttribute(
      "name",
      "intent",
    );
  });

  it("renders decorative separators and scopes their axis to the group", () => {
    const { rerender } = render(
      <ButtonGroup aria-label="Horizontal actions">
        <Button>One</Button>
        <ButtonGroupSeparator data-testid="separator" />
        <Button>Two</Button>
      </ButtonGroup>,
    );

    const separator = screen.getByTestId("separator");

    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).toHaveAttribute("role", "presentation");
    expect(separator).toHaveAttribute("data-slot", "button-group-separator");
    expect(separator).toHaveClass("w-px", "self-stretch");
    expect(
      screen.getByRole("group", { name: "Horizontal actions" }).className,
    ).toContain("[&>[data-slot=button-group-separator]]:w-px");

    rerender(
      <ButtonGroup aria-label="Vertical actions" orientation="vertical">
        <Button>One</Button>
        <ButtonGroupSeparator data-testid="separator" />
        <Button>Two</Button>
      </ButtonGroup>,
    );

    expect(
      screen.getByRole("group", { name: "Vertical actions" }).className,
    ).toContain("[&>[data-slot=button-group-separator]]:h-px");
  });

  it("forwards refs and composes consumer classes", () => {
    const groupRef = createRef<HTMLDivElement>();
    const separatorRef = createRef<HTMLSpanElement>();

    render(
      <ButtonGroup
        ref={groupRef}
        aria-label="Ref actions"
        className="custom-group"
      >
        <Button>One</Button>
        <ButtonGroupSeparator ref={separatorRef} className="custom-separator" />
        <Button>Two</Button>
      </ButtonGroup>,
    );

    expect(groupRef.current).toHaveClass("custom-group");
    expect(separatorRef.current).toHaveClass("custom-separator");
  });

  it("exposes static class helpers without animation dependencies", () => {
    const attached = buttonGroupClassNames();
    const separated = buttonGroupClassNames({ mode: "separated" });
    const separator = buttonGroupSeparatorClassNames();

    expect(attached).toContain("rounded-s-md");
    expect(attached).toContain("-ms-px");
    expect(separated).toContain("gap-density-gap");
    expect(separator).toContain("bg-border");
    expect(`${attached} ${separated} ${separator}`).not.toMatch(
      /animate-|transition-|motion/,
    );
  });

  it("rejects selection, loading, role, and unsupported values at the type boundary", () => {
    const valid = <ButtonGroup mode="attached" orientation="vertical" />;
    // @ts-expect-error ButtonGroup is not a selection control.
    const invalidValue = <ButtonGroup value="left" />;
    // @ts-expect-error ButtonGroup has no shared loading state.
    const invalidLoading = <ButtonGroup loading />;
    // @ts-expect-error ButtonGroup always owns role="group".
    const invalidRole = <ButtonGroup role="toolbar" />;
    // @ts-expect-error ButtonGroup supports only attached or separated mode.
    const invalidMode = <ButtonGroup mode="toolbar" />;
    // @ts-expect-error ButtonGroup supports only horizontal or vertical.
    const invalidOrientation = <ButtonGroup orientation="diagonal" />;

    expect(valid).toBeTruthy();
    expect(invalidValue).toBeTruthy();
    expect(invalidLoading).toBeTruthy();
    expect(invalidRole).toBeTruthy();
    expect(invalidMode).toBeTruthy();
    expect(invalidOrientation).toBeTruthy();
  });
});
