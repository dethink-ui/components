export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>
          Built with{" "}
          <span className="font-medium text-foreground">@dethink/components</span> —
          open code, themed by tokens.
        </p>
        <a
          href="https://github.com/parveshh/dethink-components"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
