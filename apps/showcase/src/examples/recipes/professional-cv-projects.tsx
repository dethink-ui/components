"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from "@dethink/components";
import { cvProjects } from "./professional-cv-data";

export function CvProjects({
  headingId,
  motionEnabled = false,
}: {
  headingId: string;
  motionEnabled?: boolean;
}) {
  const [filter, setFilter] = useState("All work");
  const visible = cvProjects.filter(
    (project) => filter === "All work" || project.category === filter,
  );
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-muted-foreground mb-4 text-xs tracking-widest uppercase">
            02 / A few recent favourites
          </p>
          <h2
            id={headingId}
            className="text-4xl font-medium tracking-tight sm:text-5xl"
          >
            Selected <span className="font-serif italic">work.</span>
          </h2>
        </div>
        <div
          role="group"
          aria-label="Filter projects"
          className="border-border flex gap-1 rounded-full border p-1"
        >
          {["All work", "Brand", "Digital"].map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "solid" : "ghost"}
              className="rounded-full px-4 text-xs"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
      <p className="sr-only" role="status">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>
      <div
        className="grid items-start gap-7 sm:grid-cols-2"
        aria-label="Selected projects"
      >
        <AnimatePresence initial={false}>
          {visible.map((project) => (
            <motion.div
              key={project.id}
              layout={motionEnabled ? "position" : false}
              initial={motionEnabled ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionEnabled ? 0.25 : 0 }}
            >
              <Card
                as="article"
                border="none"
                shadow="none"
                surface="transparent"
                className="gap-0 overflow-hidden rounded-none"
              >
                <Dialog>
                  <DialogTrigger
                    variant="ghost"
                    className="group focus-visible:ring-ring block h-auto! w-full cursor-pointer rounded-2xl border-0 p-0 text-left whitespace-normal outline-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-offset-4"
                    aria-label={`View ${project.title} case study`}
                  >
                    <span className="bg-muted relative block overflow-hidden rounded-2xl">
                      <Image
                        src={`/recipes/professional-cv/${project.image}`}
                        alt={project.alt}
                        width={1200}
                        height={800}
                        sizes="(max-width: 640px) 90vw, 500px"
                        className="aspect-[3/2] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.035]"
                      />
                      <span className="absolute top-4 left-4 rounded-full bg-[var(--cv-paper)] px-3 py-1 text-[10px] text-[var(--cv-ink)]">
                        {project.category} / {project.year}
                      </span>
                      <span className="absolute right-4 bottom-4 grid size-10 place-items-center rounded-full bg-[var(--cv-paper)] text-[var(--cv-ink)]">
                        <ArrowUpRight aria-hidden className="size-5" />
                      </span>
                    </span>
                    <span className="flex items-start justify-between gap-4 py-5">
                      <span>
                        <span className="block text-xl font-medium">
                          {project.title}
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs leading-6">
                          {project.subtitle}
                        </span>
                      </span>
                      <span className="text-muted-foreground pt-1 text-[10px]">
                        0{cvProjects.indexOf(project) + 1}
                      </span>
                    </span>
                  </DialogTrigger>
                  <DialogContent
                    className="sc-cv-theme"
                    data-motion={motionEnabled ? "enabled" : "paused"}
                    size="lg"
                    scrollBehavior="inside"
                    closeButtonLabel={`Close ${project.title} case study`}
                    showCloseButton
                  >
                    <DialogHeader>
                      <DialogTitle>{project.title} — case study</DialogTitle>
                      <DialogDescription>{project.overview}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 px-6 pb-6">
                      <Image
                        src={`/recipes/professional-cv/${project.image}`}
                        alt={project.alt}
                        width={1200}
                        height={800}
                        sizes="(max-width: 640px) 90vw, 700px"
                        className="w-full rounded-xl"
                      />
                      <p className="text-primary text-xs font-medium">
                        {project.role} / {project.year}
                      </p>
                      <Separator />
                      {[
                        ["The challenge", project.challenge],
                        ["The approach", project.approach],
                        ["The outcome", project.outcome],
                      ].map(([title, body]) => (
                        <section key={title}>
                          <h3 className="mb-2 text-lg font-medium">{title}</h3>
                          <p className="text-muted-foreground text-sm leading-7">
                            {body}
                          </p>
                        </section>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        {project.deliverables.map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Fictional concept project. Artwork generated for this
                        recipe.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose variant="outline">
                        Back to selected work
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
