"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ics215aAnalysis, Ics215aHazard } from "@/lib/supabase/types";

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]";
}

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}

interface Ics215aPanelProps {
  operationalPeriodId: string;
  analysis: Ics215aAnalysis | null;
  hazards: Ics215aHazard[];
  canEdit: boolean;
}

export function Ics215aPanel({ operationalPeriodId, analysis, hazards, canEdit }: Ics215aPanelProps) {
  return (
    <div className="space-y-6">
      <HazardsSection operationalPeriodId={operationalPeriodId} hazards={hazards} canEdit={canEdit} />

      <SignOffSection
        title="4. Prepared by (Safety Officer)"
        name={analysis?.prepared_by_name ?? null}
        signature={analysis?.prepared_by_signature ?? null}
        at={analysis?.prepared_at ?? null}
        facility={analysis?.prepared_by_facility ?? null}
        canEdit={canEdit}
        onSave={async (supabase, fields) => {
          await supabase.from("ics215a_analyses").upsert(
            {
              operational_period_id: operationalPeriodId,
              prepared_by_name: fields.name,
              prepared_by_signature: fields.signature,
              prepared_by_facility: fields.facility,
              prepared_at: new Date().toISOString(),
            },
            { onConflict: "operational_period_id" }
          );
        }}
      />

      <SignOffSection
        title="5. Approved by (Incident Commander)"
        name={analysis?.approved_by_name ?? null}
        signature={analysis?.approved_by_signature ?? null}
        at={analysis?.approved_at ?? null}
        facility={analysis?.approved_by_facility ?? null}
        canEdit={canEdit}
        onSave={async (supabase, fields) => {
          await supabase.from("ics215a_analyses").upsert(
            {
              operational_period_id: operationalPeriodId,
              approved_by_name: fields.name,
              approved_by_signature: fields.signature,
              approved_by_facility: fields.facility,
              approved_at: new Date().toISOString(),
            },
            { onConflict: "operational_period_id" }
          );
        }}
      />
    </div>
  );
}

function HazardsSection({
  operationalPeriodId,
  hazards,
  canEdit,
}: {
  operationalPeriodId: string;
  hazards: Ics215aHazard[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [hazard, setHazard] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [mitigation, setMitigation] = useState("");
  const [saving, setSaving] = useState(false);

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedNote, setCompletedNote] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!hazard.trim()) return;
    setSaving(true);
    await supabase.from("ics215a_hazards").insert({
      operational_period_id: operationalPeriodId,
      hazard: hazard.trim(),
      affected_area: affectedArea.trim() || null,
      mitigation: mitigation.trim() || null,
      sort_order: hazards.length,
    });
    setSaving(false);
    setHazard("");
    setAffectedArea("");
    setMitigation("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("ics215a_hazards").delete().eq("id", id);
    router.refresh();
  }

  async function handleComplete(e: React.FormEvent, id: string) {
    e.preventDefault();
    await supabase
      .from("ics215a_hazards")
      .update({ completed: true, completed_note: completedNote.trim() || null })
      .eq("id", id);
    setCompletingId(null);
    setCompletedNote("");
    router.refresh();
  }

  return (
    <SectionShell title="3. Hazard Mitigation">
      {hazards.length > 0 && (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-1 pr-3 font-medium">Potential / Actual Hazards</th>
              <th className="py-1 pr-3 font-medium">Affected Section / Branch / Unit and Location</th>
              <th className="py-1 pr-3 font-medium">Mitigations</th>
              <th className="w-40 py-1 pr-3 font-medium">Mitigation Completed</th>
              {canEdit && <th className="py-1" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {hazards.map((h) => (
              <tr key={h.id}>
                <td className="py-1.5 pr-3 align-top text-black dark:text-zinc-50">{h.hazard}</td>
                <td className="py-1.5 pr-3 align-top text-zinc-700 dark:text-zinc-300">
                  {h.affected_area ?? "—"}
                </td>
                <td className="py-1.5 pr-3 align-top text-zinc-700 dark:text-zinc-300">
                  {h.mitigation ?? "—"}
                </td>
                <td className="py-1.5 pr-3 align-top">
                  {h.completed ? (
                    <span className="text-green-700 dark:text-green-500">
                      ✓ {h.completed_note ?? "Completed"}
                    </span>
                  ) : canEdit ? (
                    completingId === h.id ? (
                      <form onSubmit={(e) => handleComplete(e, h.id)} className="space-y-1">
                        <input
                          autoFocus
                          placeholder="Initials/date/time"
                          value={completedNote}
                          onChange={(e) => setCompletedNote(e.target.value)}
                          className={fieldClass()}
                        />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            className="rounded-md bg-[#00274c] px-2 py-0.5 text-[11px] font-medium text-white hover:bg-[#001a35]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompletingId(null)}
                            className="rounded-md border border-black/10 px-2 py-0.5 text-[11px] dark:border-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setCompletingId(h.id);
                          setCompletedNote("");
                        }}
                        className="rounded-md border border-black/10 px-2 py-0.5 text-[11px] dark:border-white/10"
                      >
                        Mark complete
                      </button>
                    )
                  ) : (
                    <span className="text-zinc-400">Open</span>
                  )}
                </td>
                {canEdit && (
                  <td className="py-1.5 text-right align-top">
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <textarea
              required
              rows={2}
              placeholder="Potential / actual hazard"
              value={hazard}
              onChange={(e) => setHazard(e.target.value)}
              className={fieldClass()}
            />
            <input
              placeholder="Affected section / branch / unit and location"
              value={affectedArea}
              onChange={(e) => setAffectedArea(e.target.value)}
              className={fieldClass()}
            />
            <textarea
              rows={2}
              placeholder="Mitigations (e.g. restricting access, PPE)"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              className={fieldClass()}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#00274c] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Add hazard
          </button>
        ))}
    </SectionShell>
  );
}

function SignOffSection({
  title,
  name,
  signature,
  at,
  facility,
  canEdit,
  onSave,
}: {
  title: string;
  name: string | null;
  signature: string | null;
  at: string | null;
  facility: string | null;
  canEdit: boolean;
  onSave: (
    supabase: ReturnType<typeof createClient>,
    fields: { name: string | null; signature: string | null; facility: string | null }
  ) => Promise<void>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(name ?? "");
  const [signatureValue, setSignatureValue] = useState(signature ?? "");
  const [facilityValue, setFacilityValue] = useState(facility ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(supabase, {
      name: nameValue.trim() || null,
      signature: signatureValue.trim() || null,
      facility: facilityValue.trim() || null,
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title={title}>
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              placeholder="Print name"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className={fieldClass()}
            />
            <input
              placeholder="Signature (typed name)"
              value={signatureValue}
              onChange={(e) => setSignatureValue(e.target.value)}
              className={fieldClass()}
            />
          </div>
          <input
            placeholder="Facility"
            value={facilityValue}
            onChange={(e) => setFacilityValue(e.target.value)}
            className={fieldClass()}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Sign"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-black/10 px-4 py-1.5 text-sm dark:border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-black dark:text-zinc-50">
            {name ?? "—"}
            {facility && ` · ${facility}`}
            {at && ` · ${new Date(at).toLocaleString()}`}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </SectionShell>
  );
}
