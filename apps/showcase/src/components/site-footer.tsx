export function SiteFooter() {
  return (
    <footer className="border-border/70 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm sm:px-6 lg:px-8">
        <p>
          Built with{" "}
          <span className="text-foreground font-medium">
            @dethink/components
          </span>{" "}
          — open code, themed by tokens.
        </p>
        <a
          href="https://github.com/parveshh/dethink-components"
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
