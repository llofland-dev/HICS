import type { PositionSection } from "./supabase/types";

export const SECTION_COLORS: Record<PositionSection, { border: string; badge: string }> = {
  Command: {
    border: "border-violet-400 dark:border-violet-600",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  },
  Operations: {
    border: "border-blue-400 dark:border-blue-600",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  Planning: {
    border: "border-green-400 dark:border-green-600",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  Logistics: {
    border: "border-amber-400 dark:border-amber-600",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  Finance: {
    border: "border-rose-400 dark:border-rose-600",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  },
};
