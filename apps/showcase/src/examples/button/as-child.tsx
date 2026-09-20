"use client";

import { Button } from "@dethink/components";
import { ExternalLink } from "lucide-react";

export function ButtonAsChild() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button asChild rightIcon={<ExternalLink />}>
        <a
          href="https://github.com/parveshh/dethink-components"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </a>
      </Button>
      <Button asChild variant="link">
        <a href="#installation-heading">Read the install guide</a>
      </Button>
    </div>
  );
}
