"use client";

import { Link } from "@dethink/components";

export function LinkBasic() {
  return (
    <div className="mx-auto max-w-md space-y-2 text-sm">
      <p>
        Read the <Link href="#basic">theming guide</Link> to swap every token,
        or skim the{" "}
        <Link href="#basic" variant="muted">
          changelog
        </Link>{" "}
        for what shipped.
      </p>
      <p>
        <Link href="#basic" underline="always">
          Always underlined
        </Link>{" "}
        ·{" "}
        <Link href="#basic" variant="nav" underline="none">
          Nav link
        </Link>{" "}
        ·{" "}
        <Link href="#basic" variant="destructive">
          Delete account
        </Link>
      </p>
    </div>
  );
}
