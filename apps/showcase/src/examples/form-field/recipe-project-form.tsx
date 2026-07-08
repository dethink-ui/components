"use client";

import { useState } from "react";
import {
  Button,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@dethink/components";

type Errors = Partial<Record<"name" | "region", string>>;

/**
 * One Field wrapper per control — Input, Select, Textarea, Switch — shows the
 * same anatomy carrying every control type. Validation runs on submit and
 * errors render through FieldError so they are announced with the field.
 */
export function FormFieldRecipeProjectForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [created, setCreated] = useState(false);

  return (
    <Form
      className="mx-auto max-w-sm space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const nextErrors: Errors = {};
        if (!String(data.get("project-name") ?? "").trim()) {
          nextErrors.name = "Give the project a name.";
        }
        if (!data.get("project-region")) {
          nextErrors.region = "Pick a region before creating.";
        }
        setErrors(nextErrors);
        setCreated(Object.keys(nextErrors).length === 0);
      }}
    >
      <Field id="proj-name" invalid={Boolean(errors.name)} required>
        <FieldLabel>Project name</FieldLabel>
        <FieldControl asChild>
          <Input name="project-name" placeholder="apollo" />
        </FieldControl>
        {errors.name ? <FieldError>{errors.name}</FieldError> : null}
      </Field>

      <Select
        label="Region"
        name="project-region"
        placeholder="Choose a region"
        invalid={Boolean(errors.region)}
        errorMessage={errors.region}
        required
      >
        <SelectItem value="us-east">US East</SelectItem>
        <SelectItem value="eu-west">EU West</SelectItem>
      </Select>

      <Field id="proj-desc">
        <FieldLabel>Description</FieldLabel>
        <FieldControl asChild>
          <Textarea name="project-description" rows={2} />
        </FieldControl>
        <FieldDescription>
          Optional, shown on the project card.
        </FieldDescription>
      </Field>

      <Field id="proj-public" orientation="horizontal">
        <FieldControl asChild>
          <Switch name="project-public" />
        </FieldControl>
        <FieldLabel>Public project</FieldLabel>
      </Field>

      <div className="flex items-center justify-between">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {created ? "Project created ✓" : ""}
        </p>
        <Button type="submit">Create project</Button>
      </div>
    </Form>
  );
}
