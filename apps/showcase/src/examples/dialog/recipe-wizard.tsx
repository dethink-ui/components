"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldControl,
  FieldLabel,
  Input,
  Select,
  SelectItem,
} from "@dethink/components";

const steps = ["Name", "Region", "Review"] as const;

/**
 * A controlled Dialog hosting a multi-step flow: the dialog stays open
 * across steps, Back/Continue drive the index, and the flow resets whenever
 * the dialog closes so reopening starts clean.
 */
export function DialogRecipeWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const isLast = step === steps.length - 1;

  return (
    <div className="flex justify-center">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setStep(0);
          }
        }}
      >
        <DialogTrigger>New project…</DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New project — {steps[step]}</DialogTitle>
            <DialogDescription>
              Step {step + 1} of {steps.length}
            </DialogDescription>
          </DialogHeader>
          <div className="px-[var(--dt-space-6)] py-[var(--dt-space-3)]">
            {step === 0 ? (
              <Field id="wiz-name">
                <FieldLabel>Project name</FieldLabel>
                <FieldControl asChild>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="apollo"
                  />
                </FieldControl>
              </Field>
            ) : step === 1 ? (
              <Select
                label="Region"
                placeholder="Choose a region"
                value={region || undefined}
                onValueChange={setRegion}
              >
                <SelectItem value="us-east">US East</SelectItem>
                <SelectItem value="eu-west">EU West</SelectItem>
              </Select>
            ) : (
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd>{name || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Region</dt>
                  <dd>{region || "—"}</dd>
                </div>
              </dl>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (isLast) {
                  setOpen(false);
                  setStep(0);
                } else {
                  setStep(step + 1);
                }
              }}
            >
              {isLast ? "Create project" : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
