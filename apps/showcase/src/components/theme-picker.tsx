"use client";

import { useSyncExternalStore } from "react";
import { Check, ChevronDown } from "lucide-react";
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

  function applyBrand(next: BrandThemeId) {
    window.localStorage.setItem(BRAND_STORAGE_KEY, next);
    applyDocumentBrand(next);
    window.dispatchEvent(new Event(BRAND_CHANGE_EVENT));
  }

  const activeBrand =
    brandThemes.find((theme) => theme.id === brand) ?? brandThemes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="theme-reveal-button"
        aria-label={`Brand theme: ${activeBrand.label}`}
        variant="outline"
        size="sm"
        className="bg-background/60 hover:bg-muted/60 h-8 w-28 rounded-lg px-2.5 shadow-none"
      >
        <span className="flex items-center gap-2 text-xs">
          <span
            aria-hidden="true"
            className="border-foreground/15 size-3 shrink-0 rounded-full border"
            style={{ backgroundColor: activeBrand.swatch }}
          />
          <span className="min-w-9 text-start">{activeBrand.label}</span>
          <ChevronDown
            aria-hidden="true"
            className="text-muted-foreground size-3 shrink-0"
          />
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
