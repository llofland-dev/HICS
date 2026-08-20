"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ics201Action, Ics201Briefing, Ics201Objective, Ics201Resource } from "@/lib/supabase/types";

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";
}

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}

function nowLocalDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

interface Ics201EditorProps {
  operationalPeriodId: string;
  briefing: Ics201Briefing | null;
  objectives: Ics201Objective[];
  actions: Ics201Action[];
  resources: Ics201Resource[];
  canEdit: boolean;
}

interface Ics201TopSectionsProps {
  operationalPeriodId: string;
  briefing: Ics201Briefing | null;
  canEdit: boolean;
}

export function Ics201TopSections({ operationalPeriodId, briefing, canEdit }: Ics201TopSectionsProps) {
  return (
    <div className="space-y-6">
      <EditableTextSection
        title="3. Situation Summary"
        subtitle="For briefings or transfer of command."
        value={briefing?.situation_summary ?? null}
        canEdit={canEdit}
        onSave={async (supabase, text) => {
          await supabase
            .from("ics201_briefings")
            .upsert({ operational_period_id: operationalPeriodId, situation_summary: text }, { onConflict: "operational_period_id" });
        }}
      />

      <EditableTextSection
        title="4. Health and Safety Briefing"
        subtitle="Potential incident health/safety hazards and measures taken to protect responders."
        value={briefing?.health_safety_briefing ?? null}
        canEdit={canEdit}
        onSave={async (supabase, text) => {
          await supabase
            .from("ics201_briefings")
            .upsert({ operational_period_id: operationalPeriodId, health_safety_briefing: text }, { onConflict: "operational_period_id" });
        }}
      />

      <MapSection operationalPeriodId={operationalPeriodId} briefing={briefing} canEdit={canEdit} />
    </div>
  );
}

export function Ics201BottomSections({
  operationalPeriodId,
  briefing,
  objectives,
  actions,
  resources,
  canEdit,
}: Ics201EditorProps) {
  return (
    <div className="space-y-6">
      <ObjectivesSection operationalPeriodId={operationalPeriodId} objectives={objectives} canEdit={canEdit} />

      <ActionsSection operationalPeriodId={operationalPeriodId} actions={actions} canEdit={canEdit} />

      <ResourcesSection operationalPeriodId={operationalPeriodId} resources={resources} canEdit={canEdit} />

      <PreparedBySection operationalPeriodId={operationalPeriodId} briefing={briefing} canEdit={canEdit} />
    </div>
  );
}

function EditableTextSection({
  title,
  subtitle,
  value,
  canEdit,
  onSave,
}: {
  title: string;
  subtitle?: string;
  value: string | null;
  canEdit: boolean;
  onSave: (supabase: ReturnType<typeof createClient>, text: string | null) => Promise<void>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(supabase, text.trim() || null);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title={title}>
      {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={fieldClass()} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {saving ? "Saving..." : "Save"}
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
        <>
          <p className="whitespace-pre-wrap text-sm text-black dark:text-zinc-50">{value ?? "Not yet written."}</p>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Edit
            </button>
          )}
        </>
      )}
    </SectionShell>
  );
}

function MapSection({
  operationalPeriodId,
  briefing,
  canEdit,
}: {
  operationalPeriodId: string;
  briefing: Ics201Briefing | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [attached, setAttached] = useState(briefing?.map_attached ?? false);
  const [note, setNote] = useState(briefing?.map_note ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from("ics201_briefings")
      .upsert(
        { operational_period_id: operationalPeriodId, map_attached: attached, map_note: note.trim() || null },
        { onConflict: "operational_period_id" }
      );
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title="5. Map / Sketch">
      <p className="text-xs text-zinc-500">
        Total area of operations, incident site, impacted/threatened areas, or other situational graphics.
      </p>
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={attached} onChange={(e) => setAttached(e.target.checked)} />
            See attached
          </label>
          <textarea
            rows={2}
            placeholder="Note (e.g. where the attachment is filed)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={fieldClass()}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              Save
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
        <>
          <p className="text-sm text-black dark:text-zinc-50">
            {briefing?.map_attached ? "☑ See attached" : "☐ Not attached"}
            {briefing?.map_note && ` — ${briefing.map_note}`}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Edit
            </button>
          )}
        </>
      )}
    </SectionShell>
  );
}

function ObjectivesSection({
  operationalPeriodId,
  objectives,
  canEdit,
}: {
  operationalPeriodId: string;
  objectives: Ics201Objective[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    await supabase
      .from("ics201_objectives")
      .insert({ operational_period_id: operationalPeriodId, objective: text.trim(), sort_order: objectives.length });
    setSaving(false);
    setText("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("ics201_objectives").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="7. Incident Objectives">
      {objectives.length > 0 && (
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {objectives.map((o) => (
            <li key={o.id} className="flex items-start justify-between gap-2">
              <span className="text-black dark:text-zinc-50">{o.objective}</span>
              {canEdit && (
                <button onClick={() => handleDelete(o.id)} className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                  ✕
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
            <input required value={text} onChange={(e) => setText(e.target.value)} className={fieldClass()} />
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
          <button onClick={() => setShowAdd(true)} className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10">
            Add objective
          </button>
        ))}
    </SectionShell>
  );
}

function ActionsSection({
  operationalPeriodId,
  actions,
  canEdit,
}: {
  operationalPeriodId: string;
  actions: Ics201Action[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    await supabase.from("ics201_actions").insert({
      operational_period_id: operationalPeriodId,
      action_time: time || null,
      description: description.trim(),
      sort_order: actions.length,
    });
    setSaving(false);
    setTime("");
    setDescription("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("ics201_actions").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="8. Summary of Current and Planned Actions">
      {actions.length > 0 && (
        <table className="w-full text-left text-xs">
          <thead className="text-zinc-500">
            <tr>
              <th className="w-20 py-1 pr-3 font-medium">Time</th>
              <th className="py-1 pr-3 font-medium">Actions</th>
              {canEdit && <th className="py-1" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {actions.map((a) => (
              <tr key={a.id}>
                <td className="py-1 pr-3 align-top text-zinc-500">{a.action_time ?? "—"}</td>
                <td className="py-1 pr-3 align-top text-black dark:text-zinc-50">{a.description}</td>
                {canEdit && (
                  <td className="py-1 text-right align-top">
                    <button onClick={() => handleDelete(a.id)} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`w-28 ${fieldClass()}`} />
            <input
              required
              placeholder="Action"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass()}
            />
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
          <button onClick={() => setShowAdd(true)} className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10">
            Add action
          </button>
        ))}
    </SectionShell>
  );
}

function ResourcesSection({
  operationalPeriodId,
  resources,
  canEdit,
}: {
  operationalPeriodId: string;
  resources: Ics201Resource[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [resource, setResource] = useState("");
  const [ordered, setOrdered] = useState("");
  const [eta, setEta] = useState("");
  const [arrived, setArrived] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!resource.trim()) return;
    setSaving(true);
    await supabase.from("ics201_resources").insert({
      operational_period_id: operationalPeriodId,
      resource: resource.trim(),
      date_time_ordered: ordered ? new Date(ordered).toISOString() : null,
      eta: eta ? new Date(eta).toISOString() : null,
      date_time_arrived: arrived ? new Date(arrived).toISOString() : null,
      notes: notes.trim() || null,
      sort_order: resources.length,
    });
    setSaving(false);
    setResource("");
    setOrdered("");
    setEta("");
    setArrived("");
    setNotes("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("ics201_resources").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="9. Summary of Resources Requested and Assigned">
      {resources.length > 0 && (
        <table className="w-full text-left text-xs">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-1 pr-3 font-medium">Resource</th>
              <th className="py-1 pr-3 font-medium">Ordered</th>
              <th className="py-1 pr-3 font-medium">ETA</th>
              <th className="py-1 pr-3 font-medium">Arrived</th>
              <th className="py-1 pr-3 font-medium">Notes</th>
              {canEdit && <th className="py-1" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {resources.map((r) => (
              <tr key={r.id}>
                <td className="py-1 pr-3 align-top text-black dark:text-zinc-50">{r.resource}</td>
                <td className="py-1 pr-3 align-top text-zinc-500">
                  {r.date_time_ordered ? new Date(r.date_time_ordered).toLocaleString() : "—"}
                </td>
                <td className="py-1 pr-3 align-top text-zinc-500">
                  {r.eta ? new Date(r.eta).toLocaleString() : "—"}
                </td>
                <td className="py-1 pr-3 align-top text-zinc-500">
                  {r.date_time_arrived ? new Date(r.date_time_arrived).toLocaleString() : "—"}
                </td>
                <td className="py-1 pr-3 align-top text-zinc-700 dark:text-zinc-300">{r.notes ?? "—"}</td>
                {canEdit && (
                  <td className="py-1 text-right align-top">
                    <button onClick={() => handleDelete(r.id)} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400">
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              required
              placeholder="Resource"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              className={fieldClass()}
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date/Time ordered</label>
                <input type="datetime-local" value={ordered} onChange={(e) => setOrdered(e.target.value)} className={fieldClass()} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">ETA</label>
                <input type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} className={fieldClass()} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date/Time arrived</label>
                <input type="datetime-local" value={arrived} onChange={(e) => setArrived(e.target.value)} className={fieldClass()} />
              </div>
            </div>
            <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass()} />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
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
          <button onClick={() => setShowAdd(true)} className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10">
            Add resource
          </button>
        ))}
    </SectionShell>
  );
}

function PreparedBySection({
  operationalPeriodId,
  briefing,
  canEdit,
}: {
  operationalPeriodId: string;
  briefing: Ics201Briefing | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(briefing?.prepared_by_name ?? "");
  const [signature, setSignature] = useState(briefing?.prepared_by_signature ?? "");
  const [briefingAt, setBriefingAt] = useState(nowLocalDateTime());
  const [facility, setFacility] = useState(briefing?.prepared_by_facility ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("ics201_briefings").upsert(
      {
        operational_period_id: operationalPeriodId,
        prepared_by_name: name.trim() || null,
        prepared_by_signature: signature.trim() || null,
        briefing_at: briefingAt ? new Date(briefingAt).toISOString() : null,
        prepared_by_facility: facility.trim() || null,
      },
      { onConflict: "operational_period_id" }
    );
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title="10. Prepared by (Incident Commander)">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Print name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} />
            <input
              placeholder="Signature (typed name)"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className={fieldClass()}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Briefing date/time</label>
              <input
                type="datetime-local"
                value={briefingAt}
                onChange={(e) => setBriefingAt(e.target.value)}
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Facility</label>
              <input value={facility} onChange={(e) => setFacility(e.target.value)} className={fieldClass()} />
            </div>
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
            {briefing?.prepared_by_name ?? "—"}
            {briefing?.prepared_by_facility && ` · ${briefing.prepared_by_facility}`}
            {briefing?.briefing_at && ` · ${new Date(briefing.briefing_at).toLocaleString()}`}
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
