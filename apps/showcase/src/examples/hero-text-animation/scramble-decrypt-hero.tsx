"use client";

import {
  Button,
  HeroTextAnimation,
  HeroTextAnimationProvider,
} from "@dethink/components";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";

const gridStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(var(--dt-color-border) 1px, transparent 1px), linear-gradient(90deg, var(--dt-color-border) 1px, transparent 1px)",
  backgroundSize: "2.75rem 2.75rem",
  maskImage: "radial-gradient(120% 90% at 30% 0%, black, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(120% 90% at 30% 0%, black, transparent 75%)",
};

const certifications = [
  { icon: ShieldCheck, label: "SOC 2 Type II" },
  { icon: Lock, label: "ISO 27001" },
  { icon: Fingerprint, label: "Zero-trust" },
];

const logLines = [
  { tone: "info", text: "handshake — TLS 1.3 established" },
  { tone: "info", text: "identity — device attested" },
  { tone: "ok", text: "keys — rotated 4m ago" },
  { tone: "muted", text: "secret — sk_live_••••••••••••4e2a" },
];

export function HeroTextAnimationScrambleDecryptHero() {
  return (
    <HeroTextAnimationProvider>
      <section
        aria-labelledby="hero-text-scramble-heading"
        className="bg-background text-foreground border-border relative overflow-hidden rounded-md border"
      >
        <span
          aria-hidden="true"
          style={gridStyle}
          className="pointer-events-none absolute inset-0 opacity-60"
        />

        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-10 lg:py-20">
          <div className="min-w-0">
            <span className="border-border bg-background/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs backdrop-blur">
              <KeyRound
                aria-hidden="true"
                className="text-info size-3.5"
              />
              End-to-end encrypted by default
            </span>

            <HeroTextAnimation
              animation="scramble-decrypt"
              duration={1}
              id="hero-text-scramble-heading"
              repeat
              repeatDelay={1.8}
              text="Decrypt threats before they move."
              className="font-heading text-foreground mt-6 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            />
            <p className="text-muted-foreground mt-6 max-w-lg text-base leading-7 sm:text-lg">
              Runtime detection that resolves noise into signal. Continuous
              posture, automated key rotation, and audit trails your security
              team can actually read.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {certifications.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="border-border bg-background/70 text-foreground inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs font-medium"
                >
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground size-3.5"
                  />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" rightIcon={<ArrowRight />}>
                <a href="#installation">Request access</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#props">Read the security model</a>
              </Button>
            </div>
          </div>

          <div className="border-border bg-background/80 min-w-0 rounded-lg border shadow-sm backdrop-blur">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-medium">
                <span className="relative flex size-2">
                  <span className="bg-success/60 absolute inline-flex size-full animate-ping rounded-full motion-reduce:hidden" />
                  <span className="bg-success relative inline-flex size-2 rounded-full" />
                </span>
                All systems encrypted
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                live
              </span>
            </div>
            <ul className="space-y-3 px-4 py-4 font-mono text-xs">
              {logLines.map(({ tone, text }, index) => (
                <li key={index} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`size-1.5 shrink-0 rounded-full ${
                      tone === "ok"
                        ? "bg-success"
                        : tone === "info"
                          ? "bg-info"
                          : "bg-muted-foreground/50"
                    }`}
                  />
                  <span
                    className={
                      tone === "muted"
                        ? "text-muted-foreground truncate"
                        : "text-foreground truncate"
                    }
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-border text-muted-foreground border-t px-4 py-2.5 font-mono text-[11px]">
              audit log · 2,481 events today
            </div>
          </div>
        </div>
      </section>
    </HeroTextAnimationProvider>
  );
}
