"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Position, UnitLog, UnitLogEntry, UnitLogResource } from "@/lib/supabase/types";

interface UnitLogsPanelProps {
  incidentId: string;
  positions: Position[];
  unitLogs: UnitLog[];
  resources: UnitLogResource[];
  entries: UnitLogEntry[];
  canEdit: boolean;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toTimeString().slice(0, 5);
}

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";
}

interface NewLogForm {
  unit_name: string;
  position_code: string;
  leader_name: string;
  home_agency: string;
  op_period_date_from: string;
  op_period_date_to: string;
  op_period_time_from: string;
  op_period_time_to: string;
}

function emptyLogForm(): NewLogForm {
  return {
    unit_name: "",
    position_code: "",
    leader_name: "",
    home_agency: "",
    op_period_date_from: today(),
    op_period_date_to: today(),
    op_period_time_from: now(),
    op_period_time_to: "",
  };
}

export function UnitLogsPanel({
  incidentId,
  positions,
  unitLogs,
  resources,
  entries,
  canEdit,
}: UnitLogsPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showNew, setShowNew] = useState(false);
  const [newLog, setNewLog] = useState<NewLogForm>(emptyLogForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newLog.unit_name.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("unit_logs").insert({
      incident_id: incidentId,
      unit_name: newLog.unit_name.trim(),
      position_code: newLog.position_code || null,
      leader_name: newLog.leader_name.trim() || null,
      home_agency: newLog.home_agency.trim() || null,
      op_period_date_from: newLog.op_period_date_from || null,
      op_period_date_to: newLog.op_period_date_to || null,
      op_period_time_from: newLog.op_period_time_from || null,
      op_period_time_to: newLog.op_period_time_to || null,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNewLog(emptyLogForm());
    setShowNew(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              New unit log
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Unit / resource name
                  </label>
                  <input
                    required
                    value={newLog.unit_name}
                    onChange={(e) => setNewLog((v) => ({ ...v, unit_name: e.target.value }))}
                    className={fieldClass()}
                    placeholder="e.g. Facilities Unit"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    ICS position
                  </label>
                  <select
                    value={newLog.position_code}
                    onChange={(e) => setNewLog((v) => ({ ...v, position_code: e.target.value }))}
                    className={fieldClass()}
                  >
                    <option value="">—</option>
                    {positions.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Leader name
                  </label>
                  <input
                    value={newLog.leader_name}
                    onChange={(e) => setNewLog((v) => ({ ...v, leader_name: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Home agency (and unit)
                  </label>
                  <input
                    value={newLog.home_agency}
                    onChange={(e) => setNewLog((v) => ({ ...v, home_agency: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Op period — date from
                  </label>
                  <input
                    type="date"
                    value={newLog.op_period_date_from}
                    onChange={(e) => setNewLog((v) => ({ ...v, op_period_date_from: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Time from
                  </label>
                  <input
                    type="time"
                    value={newLog.op_period_time_from}
                    onChange={(e) => setNewLog((v) => ({ ...v, op_period_time_from: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Date to
                  </label>
                  <input
                    type="date"
                    value={newLog.op_period_date_to}
                    onChange={(e) => setNewLog((v) => ({ ...v, op_period_date_to: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Time to
                  </label>
                  <input
                    type="time"
                    value={newLog.op_period_time_to}
                    onChange={(e) => setNewLog((v) => ({ ...v, op_period_time_to: e.target.value }))}
                    className={fieldClass()}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  {submitting ? "Creating..." : "Create log"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNew(false);
                    setNewLog(emptyLogForm());
                    setError(null);
                  }}
                  className="rounded-md border border-black/10 px-4 py-1.5 text-sm dark:border-white/10"
                >
                  Cancel
                </button>
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>
          )}
        </section>
      )}

      <section className="space-y-4">
        {unitLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">No unit logs yet.</p>
        ) : (
          unitLogs.map((log) => (
            <UnitLogCard
              key={log.id}
              log={log}
              positions={positions}
              resources={resources.filter((r) => r.unit_log_id === log.id)}
              entries={entries.filter((e) => e.unit_log_id === log.id)}
              canEdit={canEdit}
            />
          ))
        )}
      </section>
    </div>
  );
}

function UnitLogCard({
  log,
  positions,
  resources,
  entries,
  canEdit,
}: {
  log: UnitLog;
  positions: Position[];
  resources: UnitLogResource[];
  entries: UnitLogEntry[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const positionTitle = positions.find((p) => p.code === log.position_code)?.title;

  const [showAddResource, setShowAddResource] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [resourcePosition, setResourcePosition] = useState("");
  const [resourceAgency, setResourceAgency] = useState("");
  const [addingResource, setAddingResource] = useState(false);

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryDate, setEntryDate] = useState(today());
  const [entryTime, setEntryTime] = useState(now());
  const [entryActivity, setEntryActivity] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);

  const [showPrepared, setShowPrepared] = useState(false);
  const [preparedName, setPreparedName] = useState("");
  const [preparedPosition, setPreparedPosition] = useState("");
  const [preparedSignature, setPreparedSignature] = useState("");
  const [preparing, setPreparing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!resourceName.trim()) return;
    setAddingResource(true);
    setError(null);

    const { error } = await supabase.from("unit_log_resources").insert({
      unit_log_id: log.id,
      name: resourceName.trim(),
      ics_position: resourcePosition.trim() || null,
      home_agency: resourceAgency.trim() || null,
    });

    setAddingResource(false);

    if (error) {
      setError(error.message);
      return;
    }

    setResourceName("");
    setResourcePosition("");
    setResourceAgency("");
    setShowAddResource(false);
    router.refresh();
  }

  async function handleDeleteResource(id: string) {
    const { error } = await supabase.from("unit_log_resources").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!entryActivity.trim()) return;
    setAddingEntry(true);
    setError(null);

    const { error } = await supabase.from("unit_log_entries").insert({
      unit_log_id: log.id,
      entry_date: entryDate,
      entry_time: entryTime,
      notable_activity: entryActivity.trim(),
    });

    setAddingEntry(false);

    if (error) {
      setError(error.message);
      return;
    }

    setEntryActivity("");
    setEntryDate(today());
    setEntryTime(now());
    setShowAddEntry(false);
    router.refresh();
  }

  async function handleDeleteEntry(id: string) {
    const { error } = await supabase.from("unit_log_entries").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function handlePrepared(e: React.FormEvent) {
    e.preventDefault();
    setPreparing(true);
    setError(null);

    const { error } = await supabase
      .from("unit_logs")
      .update({
        prepared_by_name: preparedName.trim() || null,
        prepared_by_position: preparedPosition.trim() || null,
        prepared_by_signature: preparedSignature.trim() || null,
        prepared_at: new Date().toISOString(),
      })
      .eq("id", log.id);

    setPreparing(false);

    if (error) {
      setError(error.message);
      return;
    }

    setShowPrepared(false);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="grid grid-cols-2 divide-x divide-black/10 border-b border-black/10 dark:divide-white/10 dark:border-white/10">
        <div className="px-3 py-2">
          <span className="block text-xs font-medium text-zinc-500">Name</span>
          <p className="text-black dark:text-zinc-50">{log.unit_name}</p>
        </div>
        <div className="px-3 py-2">
          <span className="block text-xs font-medium text-zinc-500">ICS Position</span>
          <p className="text-black dark:text-zinc-50">
            {log.leader_name ?? "—"}
            {positionTitle && <span className="text-zinc-500"> · {positionTitle}</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-black/10 border-b border-black/10 dark:divide-white/10 dark:border-white/10">
        <div className="px-3 py-2">
          <span className="block text-xs font-medium text-zinc-500">Home Agency (and Unit)</span>
          <p className="text-black dark:text-zinc-50">{log.home_agency ?? "—"}</p>
        </div>
        <div className="px-3 py-2">
          <span className="block text-xs font-medium text-zinc-500">Operational Period</span>
          <p className="text-black dark:text-zinc-50">
            {log.op_period_date_from ?? "—"} {log.op_period_time_from ?? ""} → {log.op_period_date_to ?? "—"}{" "}
            {log.op_period_time_to ?? ""}
          </p>
        </div>
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="block text-xs font-medium text-zinc-500">Resources Assigned</span>
        {resources.length > 0 && (
          <table className="mt-1 w-full text-left text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1 pr-3 font-medium">Name</th>
                <th className="py-1 pr-3 font-medium">ICS Position</th>
                <th className="py-1 pr-3 font-medium">Home Agency (and Unit)</th>
                {canEdit && <th className="py-1" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {resources.map((r) => (
                <tr key={r.id}>
                  <td className="py-1 pr-3 text-black dark:text-zinc-50">{r.name}</td>
                  <td className="py-1 pr-3 text-zinc-700 dark:text-zinc-300">{r.ics_position ?? "—"}</td>
                  <td className="py-1 pr-3 text-zinc-700 dark:text-zinc-300">{r.home_agency ?? "—"}</td>
                  {canEdit && (
                    <td className="py-1 text-right">
                      <button
                        onClick={() => handleDeleteResource(r.id)}
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
        )}

        {canEdit &&
          (showAddResource ? (
            <form onSubmit={handleAddResource} className="mt-2 grid grid-cols-4 gap-2">
              <input
                required
                placeholder="Name"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="ICS Position"
                value={resourcePosition}
                onChange={(e) => setResourcePosition(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Home Agency (and Unit)"
                value={resourceAgency}
                onChange={(e) => setResourceAgency(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingResource}
                  className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddResource(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddResource(true)}
              className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Add resource
            </button>
          ))}
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="block text-xs font-medium text-zinc-500">Activity Log</span>
        {entries.length > 0 && (
          <table className="mt-1 w-full text-left text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="w-32 py-1 pr-3 font-medium">Date/Time</th>
                <th className="py-1 pr-3 font-medium">Notable Activities</th>
                {canEdit && <th className="py-1" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-1 pr-3 align-top text-zinc-500">
                    {entry.entry_date} {entry.entry_time}
                  </td>
                  <td className="whitespace-pre-wrap py-1 pr-3 text-black dark:text-zinc-50">
                    {entry.notable_activity}
                  </td>
                  {canEdit && (
                    <td className="py-1 text-right align-top">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
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
        )}

        {canEdit &&
          (showAddEntry ? (
            <form onSubmit={handleAddEntry} className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className={fieldClass()}
                />
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className={fieldClass()}
                />
              </div>
              <textarea
                required
                rows={2}
                placeholder="Notable activity"
                value={entryActivity}
                onChange={(e) => setEntryActivity(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingEntry}
                  className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  Add entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEntry(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddEntry(true)}
              className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Add entry
            </button>
          ))}
      </div>

      <div className="px-3 py-2">
        <span className="block text-xs font-medium text-zinc-500">Prepared by</span>
        {log.prepared_by_name ? (
          <p className="text-black dark:text-zinc-50">
            {log.prepared_by_name}
            {log.prepared_by_position && ` · ${log.prepared_by_position}`}
            {log.prepared_by_signature && ` · signed: ${log.prepared_by_signature}`}
            {log.prepared_at && ` · ${new Date(log.prepared_at).toLocaleString()}`}
          </p>
        ) : canEdit ? (
          showPrepared ? (
            <form onSubmit={handlePrepared} className="mt-1 space-y-2">
              <input
                required
                placeholder="Name"
                value={preparedName}
                onChange={(e) => setPreparedName(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Position/Title"
                value={preparedPosition}
                onChange={(e) => setPreparedPosition(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Signature (typed name)"
                value={preparedSignature}
                onChange={(e) => setPreparedSignature(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={preparing}
                  className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                >
                  {preparing ? "Saving..." : "Sign"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrepared(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowPrepared(true)}
              className="mt-1 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Sign as prepared by
            </button>
          )
        ) : (
          <p className="text-zinc-500">Not yet signed</p>
        )}
      </div>

      {error && (
        <p className="border-t border-black/10 px-3 py-2 text-xs text-red-600 dark:border-white/10 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
