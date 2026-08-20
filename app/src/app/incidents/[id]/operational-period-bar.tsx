"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { OperationalPeriod } from "@/lib/supabase/types";

interface OperationalPeriodBarProps {
  incidentId: string;
  periods: OperationalPeriod[];
  selectedPeriod: OperationalPeriod;
  canEdit: boolean;
}

function fieldClass() {
  return "rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function OperationalPeriodBar({
  incidentId,
  periods,
  selectedPeriod,
  canEdit,
}: OperationalPeriodBarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showNew, setShowNew] = useState(false);
  const [dateFrom, setDateFrom] = useState(nowDate());
  const [timeFrom, setTimeFrom] = useState(nowTime());
  const [copyForward, setCopyForward] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedPeriods = [...periods].sort((a, b) => a.period_number - b.period_number);

  function goToPeriod(id: string) {
    router.push(`/incidents/${incidentId}?op=${id}`);
  }

  async function handleCreatePeriod(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: closeError } = await supabase
      .from("operational_periods")
      .update({ status: "closed", date_to: dateFrom, time_to: timeFrom })
      .eq("id", selectedPeriod.id);

    if (closeError) {
      setSubmitting(false);
      setError(closeError.message);
      return;
    }

    const nextNumber = Math.max(...periods.map((p) => p.period_number)) + 1;

    const { data: newPeriod, error: createError } = await supabase
      .from("operational_periods")
      .insert({
        incident_id: incidentId,
        period_number: nextNumber,
        date_from: dateFrom,
        time_from: timeFrom,
      })
      .select("id")
      .single();

    if (createError) {
      setSubmitting(false);
      setError(createError.message);
      return;
    }

    if (copyForward) {
      const { data: currentAssignments, error: fetchError } = await supabase
        .from("assignments")
        .select("position_code, custom_position_id, staff_id")
        .eq("operational_period_id", selectedPeriod.id)
        .is("unassigned_at", null);

      if (fetchError) {
        setSubmitting(false);
        setError(fetchError.message);
        return;
      }

      if (currentAssignments && currentAssignments.length > 0) {
        const { error: copyError } = await supabase.from("assignments").insert(
          currentAssignments.map((a) => ({
            incident_id: incidentId,
            operational_period_id: newPeriod.id,
            position_code: a.position_code,
            custom_position_id: a.custom_position_id,
            staff_id: a.staff_id,
          }))
        );

        if (copyError) {
          setSubmitting(false);
          setError(copyError.message);
          return;
        }
      }
    }

    setSubmitting(false);
    setShowNew(false);
    router.push(`/incidents/${incidentId}?op=${newPeriod.id}`);
    router.refresh();
  }

  return (
    <div className="mb-6 rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod.id}
            onChange={(e) => goToPeriod(e.target.value)}
            className={fieldClass()}
          >
            {sortedPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                Period {p.period_number} · {p.date_from} {p.time_from}
                {p.date_to ? ` → ${p.date_to} ${p.time_to}` : " (active)"}
              </option>
            ))}
          </select>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              selectedPeriod.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {selectedPeriod.status === "active" ? "Active" : "Closed"}
          </span>
        </div>

        {canEdit && selectedPeriod.status === "active" && !showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/10"
          >
            New operational period
          </button>
        )}
      </div>

      {selectedPeriod.status !== "active" && (
        <p className="mt-2 text-xs text-zinc-500">
          Viewing a closed operational period — staffing is read-only. Switch to the active period to make
          changes.
        </p>
      )}

      {showNew && (
        <form onSubmit={handleCreatePeriod} className="mt-3 space-y-2 border-t border-black/10 pt-3 dark:border-white/10">
          <p className="text-xs text-zinc-500">
            Closes Period {selectedPeriod.period_number} and starts a new one.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Start date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={fieldClass()} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Start time</label>
              <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className={fieldClass()} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={copyForward} onChange={(e) => setCopyForward(e.target.checked)} />
            Copy current roster forward to the new period
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {submitting ? "Creating..." : "Create period"}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
