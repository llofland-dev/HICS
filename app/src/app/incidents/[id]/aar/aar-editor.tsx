"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Aar,
  AarActionItem,
  AarCommandHighlight,
  AarCoordinationRole,
  AarCoreElementNote,
  AarTimelineEntry,
  CoreElement,
  UnitLogEntry,
} from "@/lib/supabase/types";
import { CORE_ELEMENTS } from "@/lib/supabase/types";

interface AarEditorProps {
  incidentId: string;
  incidentName: string;
  incidentDate: string;
  incidentType: string;
  facilityName: string;
  systemName: string | null;
  aar: Aar | null;
  actionItems: AarActionItem[];
  coreElementNotes: AarCoreElementNote[];
  commandHighlights: AarCommandHighlight[];
  coordinationRoles: AarCoordinationRole[];
  timelineEntries: AarTimelineEntry[];
  importableEntries: (UnitLogEntry & { unit_name: string })[];
  canEdit: boolean;
}

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}

export function AarEditor({
  incidentId,
  incidentName,
  incidentDate,
  incidentType,
  facilityName,
  systemName,
  aar,
  actionItems,
  coreElementNotes,
  commandHighlights,
  coordinationRoles,
  timelineEntries,
  importableEntries,
  canEdit,
}: AarEditorProps) {
  return (
    <div className="space-y-6">
      <HeaderSection
        incidentId={incidentId}
        incidentName={incidentName}
        incidentDate={incidentDate}
        incidentType={incidentType}
        facilityName={facilityName}
        aar={aar}
        canEdit={canEdit}
      />

      <CoreElementsSection incidentId={incidentId} notes={coreElementNotes} canEdit={canEdit} />

      <CommandStructureSection
        incidentId={incidentId}
        narrative={aar?.command_structure_narrative ?? null}
        highlights={commandHighlights}
        roles={coordinationRoles}
        canEdit={canEdit}
      />

      <TimelineEditor
        incidentId={incidentId}
        entries={timelineEntries}
        importableEntries={importableEntries}
        canEdit={canEdit}
      />

      <ImprovementMatrixSection incidentId={incidentId} items={actionItems} canEdit={canEdit} />

      <EditableTextareaSection
        title="Conclusion"
        value={aar?.conclusion ?? null}
        canEdit={canEdit}
        onSave={async (supabase, text) => {
          await supabase.from("aar").upsert({ incident_id: incidentId, conclusion: text }, { onConflict: "incident_id" });
        }}
      />

      <PreparedBySection
        incidentId={incidentId}
        aar={aar}
        systemName={systemName}
        canEdit={canEdit}
      />
    </div>
  );
}

function HeaderSection({
  incidentId,
  incidentName,
  incidentDate,
  incidentType,
  facilityName,
  aar,
  canEdit,
}: {
  incidentId: string;
  incidentName: string;
  incidentDate: string;
  incidentType: string;
  facilityName: string;
  aar: Aar | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [eventName, setEventName] = useState(aar?.event_name ?? incidentName);
  const [eventType, setEventType] = useState(aar?.event_type ?? incidentType);
  const [dateFrom, setDateFrom] = useState(aar?.date_from ?? incidentDate);
  const [dateTo, setDateTo] = useState(aar?.date_to ?? incidentDate);
  const [reportDate, setReportDate] = useState(aar?.report_date ?? today());
  const [location, setLocation] = useState(aar?.location ?? facilityName);
  const [summary, setSummary] = useState(aar?.summary ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await supabase.from("aar").upsert(
      {
        incident_id: incidentId,
        event_name: eventName.trim() || null,
        event_type: eventType.trim() || null,
        date_from: dateFrom || null,
        date_to: dateTo || null,
        report_date: reportDate || null,
        location: location.trim() || null,
        summary: summary.trim() || null,
      },
      { onConflict: "incident_id" }
    );

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <SectionShell title="Header & Executive Summary">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-zinc-500">Event Name</dt>
            <dd className="text-black dark:text-zinc-50">{aar?.event_name ?? incidentName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">Event Type</dt>
            <dd className="text-black dark:text-zinc-50">{aar?.event_type ?? incidentType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">Date of Event</dt>
            <dd className="text-black dark:text-zinc-50">
              {(aar?.date_from ?? incidentDate)} – {(aar?.date_to ?? incidentDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500">Report Date</dt>
            <dd className="text-black dark:text-zinc-50">{aar?.report_date ?? "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-medium text-zinc-500">Location</dt>
            <dd className="text-black dark:text-zinc-50">{aar?.location ?? facilityName}</dd>
          </div>
        </dl>
        <div>
          <p className="text-xs font-medium text-zinc-500">Executive Summary</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-black dark:text-zinc-50">
            {aar?.summary ?? "Not yet written."}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Edit
          </button>
        )}
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Header & Executive Summary">
      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Event Name</label>
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Event Type</label>
            <input value={eventType} onChange={(e) => setEventType(e.target.value)} className={fieldClass()} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Report Date</label>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className={fieldClass()} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={fieldClass()} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Executive Summary</label>
          <textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} className={fieldClass()} />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
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
    </SectionShell>
  );
}

function CoreElementsSection({
  incidentId,
  notes,
  canEdit,
}: {
  incidentId: string;
  notes: AarCoreElementNote[];
  canEdit: boolean;
}) {
  return (
    <SectionShell title="Performance Analysis: The Six Core Elements">
      <div className="space-y-4">
        {CORE_ELEMENTS.map((element) => (
          <CoreElementBlock
            key={element}
            incidentId={incidentId}
            element={element}
            notes={notes.filter((n) => n.core_element === element)}
            canEdit={canEdit}
          />
        ))}
      </div>
    </SectionShell>
  );
}

function CoreElementBlock({
  incidentId,
  element,
  notes,
  canEdit,
}: {
  incidentId: string;
  element: CoreElement;
  notes: AarCoreElementNote[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [narrative, setNarrative] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !narrative.trim()) return;
    setSaving(true);

    await supabase.from("aar_core_element_notes").insert({
      incident_id: incidentId,
      core_element: element,
      label: label.trim(),
      narrative: narrative.trim(),
      sort_order: notes.length,
    });

    setSaving(false);
    setLabel("");
    setNarrative("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("aar_core_element_notes").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="border-t border-black/10 pt-3 first:border-t-0 first:pt-0 dark:border-white/10">
      <h3 className="text-sm font-medium text-black dark:text-zinc-50">{element}</h3>
      {notes.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {notes.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-2 text-sm">
              <p>
                <span className="font-medium text-black dark:text-zinc-50">{n.label}:</span>{" "}
                <span className="text-zinc-700 dark:text-zinc-300">{n.narrative}</span>
              </p>
              {canEdit && (
                <button
                  onClick={() => handleDelete(n.id)}
                  className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="mt-2 space-y-2">
            <input
              required
              placeholder="Label (e.g. Initial Notification)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={fieldClass()}
            />
            <textarea
              required
              rows={2}
              placeholder="Finding / observation"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className={fieldClass()}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Add finding
          </button>
        ))}
    </div>
  );
}

function EditableTextareaSection({
  title,
  value,
  canEdit,
  onSave,
}: {
  title: string;
  value: string | null;
  canEdit: boolean;
  onSave: (supabase: ReturnType<typeof createClient>, text: string) => Promise<void>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(supabase, text.trim());
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title={title}>
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} className={fieldClass()} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
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
          <p className="whitespace-pre-wrap text-sm text-black dark:text-zinc-50">
            {value ?? "Not yet written."}
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

function CommandStructureSection({
  incidentId,
  narrative,
  highlights,
  roles,
  canEdit,
}: {
  incidentId: string;
  narrative: string | null;
  highlights: AarCommandHighlight[];
  roles: AarCoordinationRole[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const worked = highlights.filter((h) => h.kind === "worked");
  const fellShort = highlights.filter((h) => h.kind === "fell_short");

  const [editingNarrative, setEditingNarrative] = useState(false);
  const [narrativeText, setNarrativeText] = useState(narrative ?? "");
  const [savingNarrative, setSavingNarrative] = useState(false);

  async function handleSaveNarrative(e: React.FormEvent) {
    e.preventDefault();
    setSavingNarrative(true);
    await supabase
      .from("aar")
      .upsert({ incident_id: incidentId, command_structure_narrative: narrativeText.trim() || null }, { onConflict: "incident_id" });
    setSavingNarrative(false);
    setEditingNarrative(false);
    router.refresh();
  }

  return (
    <SectionShell title="Analysis of Command Structure">
      {editingNarrative ? (
        <form onSubmit={handleSaveNarrative} className="space-y-2">
          <textarea
            rows={4}
            value={narrativeText}
            onChange={(e) => setNarrativeText(e.target.value)}
            className={fieldClass()}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingNarrative}
              className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingNarrative(false)}
              className="rounded-md border border-black/10 px-4 py-1.5 text-sm dark:border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm text-black dark:text-zinc-50">
            {narrative ?? "Not yet written."}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditingNarrative(true)}
              className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Edit
            </button>
          )}
        </>
      )}

      <HighlightList
        title="What Worked"
        incidentId={incidentId}
        kind="worked"
        items={worked}
        canEdit={canEdit}
      />
      <HighlightList
        title="What Fell Short"
        incidentId={incidentId}
        kind="fell_short"
        items={fellShort}
        canEdit={canEdit}
      />

      <CoordinationRolesList incidentId={incidentId} roles={roles} canEdit={canEdit} />
    </SectionShell>
  );
}

function HighlightList({
  title,
  incidentId,
  kind,
  items,
  canEdit,
}: {
  title: string;
  incidentId: string;
  kind: "worked" | "fell_short";
  items: AarCommandHighlight[];
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
      .from("aar_command_highlights")
      .insert({ incident_id: incidentId, kind, narrative: text.trim(), sort_order: items.length });
    setSaving(false);
    setText("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("aar_command_highlights").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="border-t border-black/10 pt-3 dark:border-white/10">
      <h3 className="text-sm font-medium text-black dark:text-zinc-50">{title}</h3>
      {items.length > 0 && (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {items.map((h) => (
            <li key={h.id} className="flex items-start justify-between gap-2">
              <span className="text-zinc-700 dark:text-zinc-300">{h.narrative}</span>
              {canEdit && (
                <button
                  onClick={() => handleDelete(h.id)}
                  className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="mt-2 flex gap-2">
            <input required value={text} onChange={(e) => setText(e.target.value)} className={fieldClass()} />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="shrink-0 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Add
          </button>
        ))}
    </div>
  );
}

function CoordinationRolesList({
  incidentId,
  roles,
  canEdit,
}: {
  incidentId: string;
  roles: AarCoordinationRole[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [personName, setPersonName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!roleTitle.trim()) return;
    setSaving(true);
    await supabase.from("aar_coordination_roles").insert({
      incident_id: incidentId,
      role_title: roleTitle.trim(),
      person_name: personName.trim() || null,
      description: description.trim() || null,
      sort_order: roles.length,
    });
    setSaving(false);
    setRoleTitle("");
    setPersonName("");
    setDescription("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("aar_coordination_roles").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="border-t border-black/10 pt-3 dark:border-white/10">
      <h3 className="text-sm font-medium text-black dark:text-zinc-50">Coordination Roles During the Event</h3>
      {roles.length > 0 && (
        <ul className="mt-1 space-y-1.5 text-sm">
          {roles.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-2">
              <p>
                <span className="font-medium text-black dark:text-zinc-50">
                  {r.role_title}
                  {r.person_name && ` (${r.person_name})`}:
                </span>{" "}
                <span className="text-zinc-700 dark:text-zinc-300">{r.description}</span>
              </p>
              {canEdit && (
                <button
                  onClick={() => handleDelete(r.id)}
                  className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit &&
        (showAdd ? (
          <form onSubmit={handleAdd} className="mt-2 space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                required
                placeholder="Role (e.g. Incident Commander)"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className={fieldClass()}
              />
            </div>
            <textarea
              rows={2}
              placeholder="What they did"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass()}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Add role
          </button>
        ))}
    </div>
  );
}

function TimelineEditor({
  incidentId,
  entries,
  importableEntries,
  canEdit,
}: {
  incidentId: string;
  entries: AarTimelineEntry[];
  importableEntries: (UnitLogEntry & { unit_name: string })[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const importedIds = new Set(entries.map((e) => e.source_unit_log_entry_id).filter(Boolean));
  const pendingImport = importableEntries.filter((e) => !importedIds.has(e.id));

  const [importing, setImporting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleImport() {
    if (pendingImport.length === 0) return;
    setImporting(true);
    await supabase.from("aar_timeline_entries").insert(
      pendingImport.map((e) => ({
        incident_id: incidentId,
        entry_date: e.entry_date,
        entry_time: e.entry_time,
        description: `${e.unit_name}: ${e.notable_activity}`,
        source_unit_log_entry_id: e.id,
      }))
    );
    setImporting(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("aar_timeline_entries").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="Incident Timeline">
      <p className="text-xs text-zinc-500">
        A curated timeline for this report — separate from the raw{" "}
        <Link href={`/incidents/${incidentId}/unit-logs`} className="underline">
          ICS 214 unit logs
        </Link>
        . Pull in new activity, then clean up wording, add day/phase labels, or add entries (like
        Command stand-up/stand-down) that never lived in a specific unit&apos;s log.
      </p>

      {canEdit && (
        <button
          onClick={handleImport}
          disabled={importing || pendingImport.length === 0}
          className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10 disabled:opacity-50"
        >
          {importing
            ? "Importing..."
            : pendingImport.length === 0
              ? "No new unit log entries to import"
              : `Import ${pendingImport.length} new entr${pendingImport.length === 1 ? "y" : "ies"} from unit logs`}
        </button>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">No timeline entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="w-36 py-1 pr-3 font-medium">Time</th>
                <th className="w-32 py-1 pr-3 font-medium">Phase</th>
                <th className="py-1 pr-3 font-medium">Update / Action</th>
                {canEdit && <th className="w-20 py-1 font-medium" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {entries.map((e) =>
                editingId === e.id ? (
                  <TimelineRowEditor key={e.id} entry={e} onDone={() => setEditingId(null)} />
                ) : (
                  <tr key={e.id}>
                    <td className="py-1 pr-3 align-top text-zinc-500">
                      {e.entry_date} {e.entry_time}
                    </td>
                    <td className="py-1 pr-3 align-top text-zinc-500">{e.phase ?? "—"}</td>
                    <td className="py-1 pr-3 align-top text-black dark:text-zinc-50">
                      {e.description}
                    </td>
                    {canEdit && (
                      <td className="py-1 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(e.id)}
                            className="text-zinc-400 hover:text-black dark:hover:text-zinc-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {canEdit &&
        (showAdd ? (
          <TimelineAddForm incidentId={incidentId} onDone={() => setShowAdd(false)} />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Add entry
          </button>
        ))}
    </SectionShell>
  );
}

function TimelineAddForm({ incidentId, onDone }: { incidentId: string; onDone: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [date, setDate] = useState(today());
  const [time, setTime] = useState("");
  const [phase, setPhase] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !time) return;
    setSaving(true);
    await supabase.from("aar_timeline_entries").insert({
      incident_id: incidentId,
      entry_date: date,
      entry_time: time,
      phase: phase.trim() || null,
      description: description.trim(),
    });
    setSaving(false);
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={handleAdd} className="space-y-2 rounded-md border border-black/10 p-3 dark:border-white/10">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass()}
        />
        <input
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={fieldClass()}
        />
        <input
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          placeholder="Phase (e.g. Day 1 - 6/24)"
          className={`${fieldClass()} sm:col-span-2`}
        />
      </div>
      <input
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Update / action"
        className={fieldClass()}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TimelineRowEditor({ entry, onDone }: { entry: AarTimelineEntry; onDone: () => void }) {
  const router = useRouter();
  const supabase = createClient();

  const [date, setDate] = useState(entry.entry_date);
  const [time, setTime] = useState(entry.entry_time.slice(0, 5));
  const [phase, setPhase] = useState(entry.phase ?? "");
  const [description, setDescription] = useState(entry.description);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!description.trim() || !time) return;
    setSaving(true);
    await supabase
      .from("aar_timeline_entries")
      .update({
        entry_date: date,
        entry_time: time,
        phase: phase.trim() || null,
        description: description.trim(),
      })
      .eq("id", entry.id);
    setSaving(false);
    onDone();
    router.refresh();
  }

  return (
    <tr>
      <td className="py-1 pr-3 align-top">
        <div className="flex flex-col gap-1">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass()} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass()} />
        </div>
      </td>
      <td className="py-1 pr-3 align-top">
        <input value={phase} onChange={(e) => setPhase(e.target.value)} className={fieldClass()} />
      </td>
      <td className="py-1 pr-3 align-top">
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldClass()}
        />
      </td>
      <td className="py-1 align-top">
        <div className="flex flex-col gap-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[#00274c] px-2 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={onDone}
            className="rounded-md border border-black/10 px-2 py-1 text-xs dark:border-white/10"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

function ImprovementMatrixSection({
  incidentId,
  items,
  canEdit,
}: {
  incidentId: string;
  items: AarActionItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAdd, setShowAdd] = useState(false);
  const [coreElement, setCoreElement] = useState<CoreElement>(CORE_ELEMENTS[0]);
  const [observation, setObservation] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [responsibleEntity, setResponsibleEntity] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!correctiveAction.trim()) return;
    setSaving(true);
    await supabase.from("aar_action_items").insert({
      incident_id: incidentId,
      core_element: coreElement,
      observation: observation.trim() || null,
      corrective_action: correctiveAction.trim(),
      responsible_entity: responsibleEntity.trim() || null,
    });
    setSaving(false);
    setObservation("");
    setCorrectiveAction("");
    setResponsibleEntity("");
    setShowAdd(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("aar_action_items").delete().eq("id", id);
    router.refresh();
  }

  return (
    <SectionShell title="Improvement Plan (IP) Matrix">
      {items.length > 0 && (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="text-zinc-500">
            <tr>
              <th className="w-32 py-1 pr-3 font-medium">Core Element</th>
              <th className="py-1 pr-3 font-medium">Observation / Deficiency</th>
              <th className="py-1 pr-3 font-medium">Corrective Action</th>
              <th className="w-32 py-1 pr-3 font-medium">Responsible Entity</th>
              {canEdit && <th className="py-1" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-1.5 pr-3 align-top text-zinc-500">{item.core_element ?? "—"}</td>
                <td className="py-1.5 pr-3 align-top text-zinc-700 dark:text-zinc-300">
                  {item.observation ?? "—"}
                </td>
                <td className="py-1.5 pr-3 align-top text-black dark:text-zinc-50">
                  {item.corrective_action}
                </td>
                <td className="py-1.5 pr-3 align-top text-zinc-500">{item.responsible_entity ?? "—"}</td>
                {canEdit && (
                  <td className="py-1.5 align-top text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
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
          <form onSubmit={handleAdd} className="mt-2 space-y-2">
            <select
              value={coreElement}
              onChange={(e) => setCoreElement(e.target.value as CoreElement)}
              className={fieldClass()}
            >
              {CORE_ELEMENTS.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
            <textarea
              rows={2}
              placeholder="Observation / deficiency"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className={fieldClass()}
            />
            <textarea
              required
              rows={2}
              placeholder="Corrective action"
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              className={fieldClass()}
            />
            <input
              placeholder="Responsible entity (e.g. Facilities; Safety & Security)"
              value={responsibleEntity}
              onChange={(e) => setResponsibleEntity(e.target.value)}
              className={fieldClass()}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
          >
            Add row
          </button>
        ))}
    </SectionShell>
  );
}

function PreparedBySection({
  incidentId,
  aar,
  systemName,
  canEdit,
}: {
  incidentId: string;
  aar: Aar | null;
  systemName: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(aar?.prepared_by_name ?? "");
  const [title, setTitle] = useState(aar?.prepared_by_title ?? "");
  const [organization, setOrganization] = useState(aar?.prepared_by_organization ?? systemName ?? "");
  const [date, setDate] = useState(aar?.prepared_at ?? today());
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("aar").upsert(
      {
        incident_id: incidentId,
        prepared_by_name: name.trim() || null,
        prepared_by_title: title.trim() || null,
        prepared_by_organization: organization.trim() || null,
        prepared_at: date || null,
      },
      { onConflict: "incident_id" }
    );
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <SectionShell title="Prepared By">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass()} />
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass()}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              placeholder="Organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className={fieldClass()}
            />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass()} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
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
            {aar?.prepared_by_name ?? "—"}
            {aar?.prepared_by_title && <><br />{aar.prepared_by_title}</>}
            {aar?.prepared_by_organization && <><br />{aar.prepared_by_organization}</>}
            {aar?.prepared_at && <><br />{aar.prepared_at}</>}
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
