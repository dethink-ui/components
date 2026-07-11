"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleUserRound,
  Compass,
  LayoutDashboard,
  Rocket,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import {
  Button,
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Form,
  Input,
  Link as DethinkLink,
  Steps,
  type StepItemData,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

type OnboardingPath = "solo" | "team";

type OnboardingStepData = {
  eyebrow: string;
  title: string;
  description: string;
};

const navigationLinks = [
  { href: "#product", label: "Product" },
  { href: "#solutions", label: "Solutions" },
  { href: "#resources", label: "Resources" },
  { href: "#pricing", label: "Pricing" },
];

function createOnboardingSteps(
  path: OnboardingPath,
): StepItemData<OnboardingStepData>[] {
  const sharedItems: StepItemData<OnboardingStepData>[] = [
    {
      id: "workspace",
      label: "Workspace",
      description: "Name your space.",
      icon: <LayoutDashboard aria-hidden="true" className="size-4" />,
      data: {
        eyebrow: "Step 1",
        title: "Create your workspace",
        description:
          "Start with the place where your projects, teammates, and work will live.",
      },
    },
    {
      id: "profile",
      label: "Profile",
      description: "Make it yours.",
      icon: <CircleUserRound aria-hidden="true" className="size-4" />,
      data: {
        eyebrow: "Step 2",
        title: "Set up your profile",
        description:
          "A few details help us tailor the workspace to the way you work.",
      },
    },
  ];

  const pathItems: StepItemData<OnboardingStepData>[] =
    path === "team"
      ? [
          {
            id: "invite",
            label: "Invite",
            description: "Bring in teammates.",
            icon: <UserRoundPlus aria-hidden="true" className="size-4" />,
            data: {
              eyebrow: "Team setup",
              title: "Invite your team",
              description:
                "Share the workspace with the people who will build alongside you.",
            },
          },
          {
            id: "roles",
            label: "Roles",
            description: "Choose access.",
            icon: <UsersRound aria-hidden="true" className="size-4" />,
            data: {
              eyebrow: "Team setup",
              title: "Choose a starting access level",
              description:
                "You can refine individual permissions later without slowing down setup now.",
            },
          },
        ]
      : [
          {
            id: "focus",
            label: "Focus",
            description: "Pick a starting point.",
            icon: <Compass aria-hidden="true" className="size-4" />,
            data: {
              eyebrow: "Personal setup",
              title: "Choose your first focus",
              description:
                "We will open your workspace with a helpful starting view instead of an empty canvas.",
            },
          },
        ];

  return [
    ...sharedItems,
    ...pathItems,
    {
      id: "finish",
      label: "Finish",
      description: "Open your workspace.",
      icon: <Rocket aria-hidden="true" className="size-4" />,
      data: {
        eyebrow: "Almost there",
        title: "Your workspace is ready",
        description:
          "Review the setup and open a workspace that is ready for your next step.",
      },
    },
  ];
}

function OnboardingNavbar() {
  return (
    <header className="border-border bg-background/90 rounded-2xl border px-3 shadow-sm backdrop-blur sm:px-4">
      <div className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-1 sm:flex-nowrap">
        <DethinkLink
          href="#onboarding"
          className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-1.5 text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg shadow-sm"
          >
            <Sparkles className="size-4" />
          </span>
          Orbit
        </DethinkLink>

        <nav
          aria-label="Main navigation"
          className="order-3 -mx-1 w-full overflow-x-auto px-1 sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:px-0"
        >
          {/* Safari drops list semantics from flex-based lists without this role. */}
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ul
            role="list"
            className="flex w-max items-center gap-1 py-1 sm:mx-auto sm:w-fit"
          >
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <DethinkLink
                  href={link.href}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium no-underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {link.label}
                </DethinkLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-1.5">
          <DethinkLink
            href="#sign-in"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium no-underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Sign in
          </DethinkLink>
          <DethinkLink
            href="#onboarding"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium no-underline shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Get started
          </DethinkLink>
        </div>
      </div>
    </header>
  );
}

function OnboardingFlow() {
  const [path, setPath] = useState<OnboardingPath>("team");
  const [currentValue, setCurrentValue] = useState("workspace");
  const [workspaceName, setWorkspaceName] = useState("Orbit workspace");
  const [firstName, setFirstName] = useState("");
  const [teamRole, setTeamRole] = useState("member");
  const [personalFocus, setPersonalFocus] = useState("project");
  const [isComplete, setIsComplete] = useState(false);
  const items = useMemo(() => createOnboardingSteps(path), [path]);
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === currentValue),
  );
  const currentStep = items[currentIndex]!;
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === items.length - 1;

  function selectStep(value: string) {
    setCurrentValue(value);
    setIsComplete(false);
  }

  function goBack() {
    const previousStep = items[currentIndex - 1];
    if (previousStep) {
      selectStep(previousStep.id);
    }
  }

  function advance() {
    const nextStep = items[currentIndex + 1];
    if (nextStep) {
      selectStep(nextStep.id);
      return;
    }

    setIsComplete(true);
  }

  function updatePath(nextPath: OnboardingPath) {
    // Workspace is always the current step when this control is available, so
    // only future items are replaced. The Steps value therefore stays valid.
    setPath(nextPath);
    setIsComplete(false);
  }

  return (
    <section
      aria-labelledby="onboarding-title"
      className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm"
    >
      <div className="border-border bg-muted/30 flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl"
          >
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Welcome to Orbit
            </p>
            <h1
              id="onboarding-title"
              className="font-heading mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
            >
              Set up a workspace that fits your team.
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              A guided setup with a route that adapts when you choose a solo or
              shared workspace.
            </p>
          </div>
        </div>
        <span className="border-border bg-background text-muted-foreground rounded-full border px-3 py-1.5 text-xs font-medium">
          About 3 minutes
        </span>
      </div>

      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.55fr)]">
        <div className="min-w-0 space-y-7">
          <Steps<OnboardingStepData>
            interactive
            showProgress
            aria-label="Workspace onboarding progress"
            items={items}
            motionPreset="subtle"
            value={currentValue}
            onValueChange={selectStep}
            formatProgress={(percentage, context) =>
              `${context.currentIndex + 1} of ${context.count} · ${Math.round(percentage)}%`
            }
          />

          <Form
            onSubmit={(event) => {
              event.preventDefault();
              advance();
            }}
            className="border-border bg-muted/20 rounded-xl border"
          >
            <section
              aria-labelledby="onboarding-panel-title"
              className="min-h-72 px-5 py-6 sm:min-h-80 sm:px-6"
            >
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                {currentStep.data?.eyebrow}
              </p>
              <h2
                id="onboarding-panel-title"
                className="font-heading mt-1 text-xl font-semibold tracking-tight"
              >
                {currentStep.data?.title}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
                {currentStep.data?.description}
              </p>

              {currentStep.id === "workspace" ? (
                <div className="mt-6 space-y-6">
                  <Field id="onboarding-workspace-name">
                    <FieldLabel>Workspace name</FieldLabel>
                    <FieldControl asChild>
                      <Input
                        autoComplete="organization"
                        value={workspaceName}
                        onChange={(event) =>
                          setWorkspaceName(event.target.value)
                        }
                        required
                      />
                    </FieldControl>
                    <FieldDescription id="onboarding-workspace-name-description">
                      You can rename this later from workspace settings.
                    </FieldDescription>
                  </Field>

                  <fieldset>
                    <legend className="text-sm font-medium">
                      Who is this workspace for?
                    </legend>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Your answer changes the remaining onboarding steps.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="border-border bg-background has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-background flex min-h-28 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2">
                        <input
                          checked={path === "team"}
                          className="sr-only"
                          name="onboarding-path"
                          onChange={() => updatePath("team")}
                          type="radio"
                          value="team"
                        />
                        <span
                          aria-hidden="true"
                          className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg"
                        >
                          <UsersRound className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            A team workspace
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs leading-5">
                            Invite people and choose an initial access level.
                          </span>
                        </span>
                      </label>

                      <label className="border-border bg-background has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-background flex min-h-28 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2">
                        <input
                          checked={path === "solo"}
                          className="sr-only"
                          name="onboarding-path"
                          onChange={() => updatePath("solo")}
                          type="radio"
                          value="solo"
                        />
                        <span
                          aria-hidden="true"
                          className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg"
                        >
                          <Compass className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            Just me for now
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs leading-5">
                            Skip invitations and start with a personal focus.
                          </span>
                        </span>
                      </label>
                    </div>
                    <p
                      aria-live="polite"
                      className="text-muted-foreground mt-3 text-xs"
                    >
                      {path === "team"
                        ? "Team setup adds Invite and Roles after your profile."
                        : "Personal setup adds one Focus step after your profile."}
                    </p>
                  </fieldset>
                </div>
              ) : null}

              {currentStep.id === "profile" ? (
                <div className="mt-6 max-w-md">
                  <Field id="onboarding-first-name">
                    <FieldLabel>First name</FieldLabel>
                    <FieldControl asChild>
                      <Input
                        autoComplete="given-name"
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Alex"
                        required
                        value={firstName}
                      />
                    </FieldControl>
                    <FieldDescription id="onboarding-first-name-description">
                      This is how collaborators will see you in the workspace.
                    </FieldDescription>
                  </Field>
                </div>
              ) : null}

              {currentStep.id === "invite" ? (
                <div className="mt-6 max-w-md">
                  <Field id="onboarding-invite-email">
                    <FieldLabel>Invite a teammate</FieldLabel>
                    <FieldControl asChild>
                      <Input
                        autoComplete="email"
                        placeholder="teammate@company.com"
                        type="email"
                      />
                    </FieldControl>
                    <FieldDescription id="onboarding-invite-email-description">
                      Optional for now — you can invite more people from the
                      workspace at any time.
                    </FieldDescription>
                  </Field>
                </div>
              ) : null}

              {currentStep.id === "roles" ? (
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    Default teammate access
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        checked={teamRole === "member"}
                        className="peer sr-only"
                        id="onboarding-role-member"
                        name="onboarding-role"
                        onChange={() => setTeamRole("member")}
                        type="radio"
                        value="member"
                      />
                      <label
                        htmlFor="onboarding-role-member"
                        className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background block cursor-pointer rounded-xl border p-4 text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                      >
                        Member
                        <span className="text-muted-foreground mt-1 block text-xs leading-5 font-normal">
                          Can collaborate on projects and create new work.
                        </span>
                      </label>
                    </div>
                    <div>
                      <input
                        checked={teamRole === "viewer"}
                        className="peer sr-only"
                        id="onboarding-role-viewer"
                        name="onboarding-role"
                        onChange={() => setTeamRole("viewer")}
                        type="radio"
                        value="viewer"
                      />
                      <label
                        htmlFor="onboarding-role-viewer"
                        className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background block cursor-pointer rounded-xl border p-4 text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                      >
                        Viewer
                        <span className="text-muted-foreground mt-1 block text-xs leading-5 font-normal">
                          Can follow progress without editing workspace data.
                        </span>
                      </label>
                    </div>
                  </div>
                </fieldset>
              ) : null}

              {currentStep.id === "focus" ? (
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    What would you like to do first?
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        checked={personalFocus === "project"}
                        className="peer sr-only"
                        id="onboarding-focus-project"
                        name="onboarding-focus"
                        onChange={() => setPersonalFocus("project")}
                        type="radio"
                        value="project"
                      />
                      <label
                        htmlFor="onboarding-focus-project"
                        className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background block cursor-pointer rounded-xl border p-4 text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                      >
                        Plan a project
                        <span className="text-muted-foreground mt-1 block text-xs leading-5 font-normal">
                          Start from a focused project planning view.
                        </span>
                      </label>
                    </div>
                    <div>
                      <input
                        checked={personalFocus === "explore"}
                        className="peer sr-only"
                        id="onboarding-focus-explore"
                        name="onboarding-focus"
                        onChange={() => setPersonalFocus("explore")}
                        type="radio"
                        value="explore"
                      />
                      <label
                        htmlFor="onboarding-focus-explore"
                        className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-background block cursor-pointer rounded-xl border p-4 text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                      >
                        Explore templates
                        <span className="text-muted-foreground mt-1 block text-xs leading-5 font-normal">
                          Browse a handful of starting workflows.
                        </span>
                      </label>
                    </div>
                  </div>
                </fieldset>
              ) : null}

              {currentStep.id === "finish" ? (
                <div className="border-border bg-background mt-6 flex items-start gap-3 rounded-xl border p-4">
                  <span
                    aria-hidden="true"
                    className="bg-success/15 text-success grid size-9 shrink-0 place-items-center rounded-full"
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {workspaceName || "Your workspace"} is ready to open.
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {path === "team"
                        ? "Your team path includes a shared starting space and editable access settings."
                        : "Your personal path opens with a tailored starting view."}
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            <footer className="border-border bg-background flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
              <p aria-live="polite" className="text-muted-foreground text-sm">
                {isComplete
                  ? "Workspace ready — you can start building."
                  : `Step ${currentIndex + 1} of ${items.length}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFirstStep}
                  leftIcon={<ArrowLeft aria-hidden="true" />}
                  onClick={goBack}
                >
                  Back
                </Button>
                <Button
                  rightIcon={
                    isLastStep ? (
                      <Rocket aria-hidden="true" />
                    ) : (
                      <ArrowRight aria-hidden="true" />
                    )
                  }
                  type="submit"
                >
                  {isLastStep
                    ? isComplete
                      ? "Workspace ready"
                      : "Open workspace"
                    : "Continue"}
                </Button>
              </div>
            </footer>
          </Form>
        </div>

        <aside className="border-border bg-muted/30 h-fit rounded-xl border p-5 sm:p-6">
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Setup preview
          </p>
          <h2 className="font-heading mt-2 text-lg font-semibold tracking-tight">
            A calmer first day.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            The onboarding path stays short, while the content adjusts to the
            way this workspace will be used.
          </p>

          <ul className="mt-5 space-y-3">
            {[
              "A named workspace with editable settings",
              path === "team"
                ? "A teammate invitation and starter access choice"
                : "A personal starting view chosen for your goal",
              "A clear next action after setup",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="border-border bg-background mt-6 rounded-lg border p-4">
            <p className="text-sm font-semibold">Need help?</p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              You can skip any optional setup and adjust it from workspace
              settings later.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function LoginAndOnboardingRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const fullPage = presentation === "full-page";

  return (
    <div
      data-recipe-surface="login-and-onboarding"
      className={
        fullPage
          ? "bg-muted/20 min-h-[calc(100dvh-7rem)] p-4 sm:p-6 lg:p-8"
          : ""
      }
    >
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <a
          href="#onboarding"
          className="bg-background text-foreground focus:ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow-sm outline-none focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:ring-2 focus:ring-offset-2"
        >
          Skip to onboarding
        </a>
        <OnboardingNavbar />
        <main id="onboarding" tabIndex={-1}>
          <OnboardingFlow />
        </main>
      </div>
    </div>
  );
}
