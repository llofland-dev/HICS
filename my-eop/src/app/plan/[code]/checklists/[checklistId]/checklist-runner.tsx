"use client";

import { useEffect, useState } from "react";
import type { Checklist, ChecklistItem } from "@/lib/supabase/types";
import { BRAND } from "@/lib/palette";

// Check-off state lives in localStorage only — it's for stepping through a
// checklist during one drill/event on one device, not a synced record, so
// there's no server round-trip here at all (works offline by construction).
export function ChecklistRunner({
  checklist,
  items,
}: {
  checklist: Checklist;
  items: ChecklistItem[];
}) {
  const storageKey = `eop-checklist-${checklist.id}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reading localStorage during the initial render (instead of here)
    // would mismatch the server-rendered HTML, since localStorage doesn't
    // exist during SSR — syncing from it after mount is the standard fix.
    try {
      const raw = window.localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function reset() {
    setChecked({});
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  const doneCount = items.filter((item) => checked[item.id]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          {doneCount} of {items.length} complete
        </span>
        <button onClick={reset} className="underline">
          Reset
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex min-h-14 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-950"
          >
            <input
              type="checkbox"
              checked={Boolean(checked[item.id])}
              onChange={() => toggle(item.id)}
              className={`h-5 w-5 shrink-0 ${BRAND.accent}`}
            />
            <span
              className={`text-base ${
                checked[item.id]
                  ? "text-zinc-400 line-through dark:text-zinc-600"
                  : "text-black dark:text-zinc-50"
              }`}
            >
              {item.text}
            </span>
          </label>
        ))}
      </div>

      {items.length === 0 && <p className="text-sm text-zinc-500">This checklist is empty.</p>}
    </div>
  );
}
