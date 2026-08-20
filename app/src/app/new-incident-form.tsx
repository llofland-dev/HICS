"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { IncidentType } from "@/lib/supabase/types";

export function NewIncidentForm({ facilityOrgId }: { facilityOrgId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<IncidentType>("incident");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.from("incidents").insert({
      facility_org_id: facilityOrgId,
      name,
      incident_date: incidentDate,
      type,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="incident-name" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Name
        </label>
        <input
          id="incident-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-56 rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
          placeholder="e.g. Regional flooding response"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="incident-date" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Date
        </label>
        <input
          id="incident-date"
          type="date"
          required
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="incident-type" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Type
        </label>
        <select
          id="incident-type"
          value={type}
          onChange={(e) => setType(e.target.value as IncidentType)}
          className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
        >
          <option value="incident">Incident</option>
          <option value="exercise">Exercise</option>
          <option value="tabletop">Tabletop</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {submitting ? "Creating..." : "New incident"}
      </button>

      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
