// Brand palette: Michigan Wolverine navy + maize — shared with my-eop/Playbook
// (see my-eop/src/lib/palette.ts). Tailwind's build-time scanner needs each
// class name as a complete literal string in source, so these are written
// out in full rather than composed from NAVY/MAIZE at runtime.
export const NAVY = "#00274c";
export const MAIZE = "#FFCB05";

export const BRAND = {
  header: "bg-[#00274c]",
  buttonClass:
    "rounded-md bg-[#00274c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#001a35] disabled:opacity-50",
  buttonClassSm:
    "rounded-md bg-[#00274c] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#001a35] disabled:opacity-50",
  secondaryButtonClassSm:
    "rounded-md border border-[#00274c]/30 px-3 py-1.5 text-sm font-medium text-[#00274c] transition-colors hover:bg-[#00274c]/5 dark:border-[#7ba6d6]/40 dark:text-[#7ba6d6] dark:hover:bg-[#7ba6d6]/10",
  focusBorder: "focus:border-[#00274c] dark:focus:border-[#7ba6d6]",
  link: "text-[#00274c] hover:underline dark:text-[#7ba6d6]",
};

// incident/profile/org status → badge classes.
export const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  closed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};
