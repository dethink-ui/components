"use client";

import { Button } from "@dethink/components";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

export function ButtonIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button leftIcon={<Mail />}>Email us</Button>
      <Button variant="soft" rightIcon={<ArrowRight />}>
        Continue
      </Button>
      <Button
        variant="outline"
        leftIcon={<Sparkles />}
        rightIcon={<ArrowRight />}
      >
        Generate
      </Button>
    </div>
  );
}
