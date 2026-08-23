// Fixed set of top-level home-screen categories that plan_sections group
// under. Deliberately a small closed list (not free text) so the admin
// picks from a dropdown rather than typing a category that silently
// fragments (e.g. "Codes" vs "codes " vs "Code"). Colors reuse the named
// PALETTE entries for visual consistency with the rest of the app.
import type { ComponentType } from "react";
import { AlertIcon, PhoneIcon, SitemapIcon } from "@/components/icons";
import { PALETTE, type PaletteColor } from "@/lib/palette";

export interface CategoryDef {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: PaletteColor;
}

const byKey = new Map(PALETTE.map((c) => [c.key, c]));

// Job Action Sheets is not its own top-level tile — it lives inside HICS as
// a subcategory (see src/lib/category-items.ts), since HICS is expected to
// grow more sub-groups (e.g. Role Responsibilities) alongside it.
export const CATEGORIES: CategoryDef[] = [
  { key: "codes", label: "Codes", icon: AlertIcon, color: byKey.get("red")! },
  { key: "hics", label: "HICS", icon: SitemapIcon, color: byKey.get("blue")! },
  { key: "pots", label: "POTS", icon: PhoneIcon, color: byKey.get("teal")! },
];

export function categoryByKey(key: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.key === key);
}
