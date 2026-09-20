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
    "Open a focused window above the page for a task or confirmation.",
};

export default function DialogPage() {
  return (
    <DocsPage
      name="Dialog"
      description="Open a focused window above the page for a task or confirmation."
    >
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
} from "@dethink/components";

export function Example() {
  return (
    <Dialog>
      <DialogTrigger>View details</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project details</DialogTitle>
          <DialogDescription>Review your project settings.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Try the examples, then open the code to use them in your app. Open a dialog and Tab around — focus stays inside until it closes."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="dialog/basic.tsx"
            title="Basic"
            description="Use DialogTrigger to open the dialog and DialogClose to close it. Always include a DialogTitle."
          >
            <DialogBasic />
          </ExampleBlock>
          <ExampleBlock
            file="dialog/alert.tsx"
            title="Alert dialog"
            description="Ask users to confirm an action. Clicking outside this dialog does not close it."
          >
            <DialogAlert />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="recipes"
        title="Recipes"
        description="Examples that combine components for common tasks."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="dialog/recipe-wizard.tsx"
            title="Multi-step wizard"
            description="Split a task into three steps. Back and Continue move between steps; closing the dialog resets the form."
          >
            <DialogRecipeWizard />
          </ExampleBlock>
          <ExampleBlock
            file="dialog/recipe-type-to-confirm.tsx"
            title="Type-to-confirm deletion"
            description="Require users to type the project name before enabling Delete."
          >
            <DialogRecipeTypeToConfirm />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Set open state on Dialog. Set width and closing behavior on DialogContent."
      >
        <div className="space-y-8">
          <PropsTable caption="Dialog anatomy" rows={dialogProps} />
          <PropsTable caption="AlertDialog additions" rows={alertDialogProps} />
        </div>
      </DocsSection>
    </DocsPage>
  );
}
