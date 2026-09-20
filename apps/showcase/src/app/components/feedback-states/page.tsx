import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { FeedbackAnnouncer } from "@/examples/feedback-states/announcer";
import { FeedbackLoading } from "@/examples/feedback-states/loading";
import { FeedbackMessaging } from "@/examples/feedback-states/messaging";
import { FeedbackToastWorkflow } from "@/examples/feedback-states/toast-workflow";
import { feedbackStateProps } from "@/lib/props/feedback-states";

export const metadata: Metadata = {
  title: "Feedback States",
  description:
    "Show loading, progress, errors, empty states, and notifications.",
};

export default function FeedbackStatesPage() {
  return (
    <DocsPage
      name="Feedback States"
      description="Show loading, progress, errors, empty states, and notifications."
    >
      <InstallationSection
        registryName="feedback-states"
        importCode={`import {
  Alert,
  Announcer,
  Callout,
  EmptyState,
  LiveRegionProvider,
  Progress,
  ProgressCircle,
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  Spinner,
  ToastProvider,
  ToastViewport,
  useAnnouncer,
  useToast,
} from "@dethink/components";`}
      />

      <DocsSection
        id="examples"
        title="Examples"
        description="Feedback primitives compose across loading, async status, empty data, and mutation confirmation flows."
      >
        <div className="space-y-10">
          <ExampleBlock
            file="feedback-states/loading.tsx"
            title="Loading and progress"
            description="Spinner is decorative unless labelled. Progress exposes determinate or indeterminate progressbar semantics, while Skeleton reserves layout space."
          >
            <FeedbackLoading />
          </ExampleBlock>
          <ExampleBlock
            file="feedback-states/messaging.tsx"
            title="Messaging and empty states"
            description="Alert carries status urgency, Callout stays contextual, and EmptyState keeps action slots predictable."
          >
            <FeedbackMessaging />
          </ExampleBlock>
          <ExampleBlock
            file="feedback-states/announcer.tsx"
            title="Shared announcements"
            description="LiveRegionProvider centralizes polite and assertive announcements and supports debounced result-count updates."
          >
            <FeedbackAnnouncer />
          </ExampleBlock>
          <ExampleBlock
            file="feedback-states/toast-workflow.tsx"
            title="Toast workflow"
            description="Toast uses the shared announcer, explicit dismiss controls, auto-dismiss timers, pause-on-hover/focus, and Motion-powered stack presence."
            wide
          >
            <FeedbackToastWorkflow />
          </ExampleBlock>
        </div>
      </DocsSection>

      <DocsSection
        id="props"
        title="Props"
        description="Feedback state primitives share token-backed styling, stable slots, and reduced-motion-safe behavior."
      >
        <PropsTable caption="Feedback state props" rows={feedbackStateProps} />
      </DocsSection>
    </DocsPage>
  );
}
