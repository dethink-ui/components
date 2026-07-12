"use client";

import { useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "@dethink/components";
import {
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND,
  brandThemes,
  isBrandThemeId,
  type BrandThemeId,
} from "@/lib/brand-themes";

const BRAND_CHANGE_EVENT = "dethink-brand-change";

function readStoredBrand(): BrandThemeId {
  const stored = window.localStorage.getItem(BRAND_STORAGE_KEY);
  return isBrandThemeId(stored) ? stored : DEFAULT_BRAND;
}

function applyDocumentBrand(next: BrandThemeId) {
  if (next === DEFAULT_BRAND) {
    delete document.documentElement.dataset.brand;
  } else {
    document.documentElement.dataset.brand = next;
  }
}

function subscribeToBrand(onStoreChange: () => void) {
  window.addEventListener(BRAND_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(BRAND_CHANGE_EVENT, onStoreChange);
  };
}

export function ThemePicker() {
  const brand = useSyncExternalStore(
    subscribeToBrand,
    readStoredBrand,
    () => DEFAULT_BRAND,
  );
  const [open, setOpen] = useState(false);

  function applyBrand(next: BrandThemeId) {
    window.localStorage.setItem(BRAND_STORAGE_KEY, next);
    applyDocumentBrand(next);
    window.dispatchEvent(new Event(BRAND_CHANGE_EVENT));
  }

  const activeBrand =
    brandThemes.find((theme) => theme.id === brand) ?? brandThemes[0];

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger
        data-slot="theme-reveal-button"
        aria-label={activeBrand.label}
        variant="ghost"
        size="sm"
        className="group text-muted-foreground hover:text-foreground min-w-8 justify-start gap-0! overflow-hidden px-0"
      >
        <span
          aria-hidden="true"
          className={`inline-flex size-8 shrink-0 items-center justify-center transition-transform duration-200 motion-reduce:transform-none motion-reduce:transition-none ${
            open
              ? "translate-x-1"
              : "group-hover:translate-x-1 group-focus-visible:translate-x-1"
          }`}
        >
          <span
            className="border-foreground/20 size-4 rounded-full border shadow-sm"
            style={{ backgroundColor: activeBrand.swatch }}
          />
        </span>
        <span
          aria-hidden="true"
          className={`overflow-hidden transition-[max-width,opacity] duration-200 motion-reduce:transition-none ${
            open
              ? "max-w-20 opacity-100"
              : "max-w-0 opacity-0 group-hover:max-w-20 group-hover:opacity-100 group-focus-visible:max-w-20 group-focus-visible:opacity-100"
          }`}
        >
          <span className="block ps-1 pe-3">{activeBrand.label}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        aria-label="Brand theme"
        placement="bottom end"
        selectionMode="single"
        selectedKeys={brand ? [brand] : []}
      >
        <DropdownMenuSection>
          <DropdownMenuLabel>Brand theme</DropdownMenuLabel>
          {brandThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              id={theme.id}
              textValue={theme.label}
              onAction={() => applyBrand(theme.id)}
            >
              <DropdownMenuItemIcon>
                <span
                  aria-hidden="true"
                  className="border-foreground/15 size-3 rounded-full border"
                  style={{ backgroundColor: theme.swatch }}
                />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>{theme.label}</DropdownMenuItemLabel>
              {brand === theme.id ? (
                <Check className="text-primary size-4" aria-hidden="true" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
