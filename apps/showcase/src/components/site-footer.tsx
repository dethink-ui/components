import { BrandMark } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-border/70 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm sm:px-6 lg:px-8">
        <p className="flex items-center gap-2.5">
          <BrandMark className="size-5 rounded-md shadow-none" />
          <span>
            Built with{" "}
            <span className="text-foreground font-medium">
              @dethink/components
            </span>{" "}
            — open code, themed by tokens.
          </span>
        </p>
        <a
          href="https://github.com/dethink-ui/components"
          target="_blank"
          rel="noreferrer"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
