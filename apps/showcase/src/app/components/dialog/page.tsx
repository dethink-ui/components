import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { DialogAlert } from "@/examples/dialog/alert";
import { DialogBasic } from "@/examples/dialog/basic";
import { DialogRecipeTypeToConfirm } from "@/examples/dialog/recipe-type-to-confirm";
import { DialogRecipeWizard } from "@/examples/dialog/recipe-wizard";
import { alertDialogProps, dialogProps } from "@/lib/props/dialog";

export const metadata: Metadata = {
  title: "Dialog",
  description:
    "Modal surfaces with focus trapping, size and dismissal control, plus AlertDialog for explicit confirmation.",
};

export default function DialogPage() {
  return (
    <DocsPage
      name="Dialog"
      description="A modal overlay that traps focus, labels itself from its title and description, restores focus to the trigger on close, and portals above the page. AlertDialog is the confirmation variant: role=alertdialog with backdrop dismissal blocked so the user must choose."
    >
      <DocsSection
        id="examples"
        title="Examples"
        description="Live previews rendered by the exact code shown below each one. Open a dialog and Tab around — focus stays inside until it closes."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="dialog/basic.tsx"
            title="Basic"
            description="Trigger, sized content, header anatomy, and footer with DialogClose buttons."
          >
            <DialogBasic />
          </ExampleBlock>
          <ExampleBlock
            file="dialog/alert.tsx"
            title="Alert dialog"
            description="AlertDialog blocks backdrop dismissal and pairs an explicit cancel with a destructive action."
          >
            <DialogAlert />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Production-shaped compositions that go beyond exercising props."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="dialog/recipe-wizard.tsx"
            title="Multi-step wizard"
            description="A controlled Dialog hosts a three-step flow — the title tracks the step, Back/Continue drive the index, and closing resets so reopening starts clean."
          >
            <DialogRecipeWizard />
          </ExampleBlock>
          <ExampleBlock
            file="dialog/recipe-type-to-confirm.tsx"
            title="Type-to-confirm deletion"
            description="The destructive action stays disabled until the typed project name matches exactly — the confirmation cannot be clicked through on autopilot."
          >
            <DialogRecipeTypeToConfirm />
          </ExampleBlock>
        </div>
      </DocsSection>

      <InstallationSection
        registryName="dialog"
        importCode={`import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@dethink/components";`}
      />

      <DocsSection
        id="props"
        title="Props"
        description="Dialog coordinates the trigger and content; content carries the panel options."
      >
        <div className="space-y-8">
          <PropsTable caption="Dialog anatomy" rows={dialogProps} />
          <PropsTable caption="AlertDialog additions" rows={alertDialogProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
