"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ics203Details, Ics203ExternalRep, Ics203HospitalRep } from "@/lib/supabase/types";

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";
}

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-black/10 bg-white p-4 print:break-inside-avoid print:border-none print:bg-transparent print:p-0 dark:border-white/10 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50 print:text-black">{title}</h2>
      {children}
    </section>
  );
}

interface Ics203EditorProps {
  operationalPeriodId: string;
  details: Ics203Details | null;
  externalReps: Ics203ExternalRep[];
  hospitalReps: Ics203HospitalRep[];
  canEdit: boolean;
}

export function Ics203Editor({
  operationalPeriodId,
  details,
  externalReps,
  hospitalReps,
  canEdit,
}: Ics203EditorProps) {
  return (
    <div className="space-y-6">
      <AgencyExecutiveSection operationalPeriodId={operationalPeriodId} details={details} canEdit={canEdit} />
      <ExternalRepsSection operationalPeriodId={operationalPeriodId} reps={externalReps} canEdit={canEdit} />
      <HospitalRepsSection operationalPeriodId={operationalPeriodId} reps={hospitalReps} canEdit={canEdit} />
      <PreparedBySection operationalPeriodId={operationalPeriodId} details={details} canEdit={canEdit} />
    </div>
  );
}

function AgencyExecutiveSection({
  operationalPeriodId,
  details,
  canEdit,
}: {
  operationalPeriodId: string;
  details: Ics203Details | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(details?.agency_executive_name ?? "");
  const [contact, setContact] = useState(details?.agency_executive_contact ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("ics203_details").upsert(
      { operational_period_id: operationalPeriodId, agency_executive_name: name.trim() || null, agency_executive_contact: contact.trim() || null },
      { onConflict: "operational_period_id" }
    );
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title="8. Agency Executive">
      {editing ? (
        <form onSubmit={handleSave} className="flex flex-wrap items-end gap-2 print:hidden">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} />
          <input
            placeholder="Contact info"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className={fieldClass()}
          />
          <button
            type="submit"
            disabled={saving}
            className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="shrink-0 rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-black dark:text-zinc-50">
            {details?.agency_executive_name ?? "—"}
            {details?.agency_executive_contact && ` · ${details.agency_executive_contact}`}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-black/10 px-3 py-1 text-xs print:hidden dark:border-white/10"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </SectionShell>
  );
}

function ExternalRepsSection({
  operationalPeriodId,
  reps,
  canEdit,
}: {
  operationalPeriodId: string;
  reps: Ics203ExternalRep[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [repName, setRepName] = useState("");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyName.trim()) return;
    setSaving(true);
    await supabase.from("ics203_external_reps").insert({
      operational_period_id: operationalPeriodId,
      agency_name: agencyName.trim(),
      representative_name: repName.trim() || null,
      contact_info: contact.trim() || null,
      sort_order: reps.length,
    });
    setSaving(false);
    setAgencyName("");
    setRepName("");
    setContact("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("ics203_external_reps").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="9. External Agency Representative(s) (in the Hospital Command Center)">
      {reps.length > 0 && (
        <ul className="space-y-1 text-sm">
          {reps.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-2">
              <p>
                <span className="font-medium text-black dark:text-zinc-50">{r.agency_name}</span>
                {r.representative_name && ` — ${r.representative_name}`}
                {r.contact_info && ` (${r.contact_info})`}
              </p>
              {canEdit && (
                <button onClick={() => handleDelete(r.id)} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 print:hidden">
            <input required placeholder="Agency" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className={fieldClass()} />
            <input placeholder="Representative name" value={repName} onChange={(e) => setRepName(e.target.value)} className={fieldClass()} />
            <input placeholder="Contact info" value={contact} onChange={(e) => setContact(e.target.value)} className={fieldClass()} />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="shrink-0 rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button onClick={() => setShowAdd(true)} className="rounded-md border border-black/10 px-3 py-1 text-xs print:hidden dark:border-white/10">
            Add representative
          </button>
        ))}
    </SectionShell>
  );
}

function HospitalRepsSection({
  operationalPeriodId,
  reps,
  canEdit,
}: {
  operationalPeriodId: string;
  reps: Ics203HospitalRep[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("ics203_hospital_reps").insert({
      operational_period_id: operationalPeriodId,
      name: name.trim(),
      role: role.trim() || null,
      location: location.trim() || null,
      sort_order: reps.length,
    });
    setSaving(false);
    setName("");
    setRole("");
    setLocation("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("ics203_hospital_reps").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="10. Hospital Representative(s) (in the external Emergency Operations Center)">
      {reps.length > 0 && (
        <ul className="space-y-1 text-sm">
          {reps.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-2">
              <p>
                <span className="font-medium text-black dark:text-zinc-50">{r.name}</span>
                {r.role && ` — ${r.role}`}
                {r.location && ` (${r.location})`}
              </p>
              {canEdit && (
                <button onClick={() => handleDelete(r.id)} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 print:hidden">
            <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} />
            <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} className={fieldClass()} />
            <input placeholder="EOC location" value={location} onChange={(e) => setLocation(e.target.value)} className={fieldClass()} />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="shrink-0 rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button onClick={() => setShowAdd(true)} className="rounded-md border border-black/10 px-3 py-1 text-xs print:hidden dark:border-white/10">
            Add representative
          </button>
        ))}
    </SectionShell>
  );
}

function PreparedBySection({
  operationalPeriodId,
  details,
  canEdit,
}: {
  operationalPeriodId: string;
  details: Ics203Details | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(details?.prepared_by_name ?? "");
  const [signature, setSignature] = useState(details?.prepared_by_signature ?? "");
  const [facility, setFacility] = useState(details?.prepared_by_facility ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("ics203_details").upsert(
      {
        operational_period_id: operationalPeriodId,
        prepared_by_name: name.trim() || null,
        prepared_by_signature: signature.trim() || null,
        prepared_by_facility: facility.trim() || null,
        prepared_at: new Date().toISOString(),
      },
      { onConflict: "operational_period_id" }
    );
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title="11. Prepared By">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2 print:hidden">
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Print name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} />
            <input
              placeholder="Signature (typed name)"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className={fieldClass()}
            />
            <input placeholder="Facility" value={facility} onChange={(e) => setFacility(e.target.value)} className={fieldClass()} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
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
            {details?.prepared_by_name ?? "—"}
            {details?.prepared_by_facility && ` · ${details.prepared_by_facility}`}
            {details?.prepared_at && ` · ${new Date(details.prepared_at).toLocaleString()}`}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-black/10 px-3 py-1 text-xs print:hidden dark:border-white/10"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </SectionShell>
  );
}
