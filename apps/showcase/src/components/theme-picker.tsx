"use client";

import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
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

export function ThemePicker() {
  const [brand, setBrand] = useState<BrandThemeId | null>(null);

  useEffect(() => {
    setBrand(readStoredBrand());
  }, []);

  function applyBrand(next: BrandThemeId) {
    setBrand(next);
    window.localStorage.setItem(BRAND_STORAGE_KEY, next);
    applyDocumentBrand(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        variant="ghost"
        size="icon"
        aria-label="Brand theme"
        className="text-muted-foreground hover:text-foreground size-8 rounded-md"
      >
        <Palette className="size-4" aria-hidden="true" />
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
