"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Ics204AssignmentList,
  Ics204Objective,
  Ics204Unit,
  PositionSection,
} from "@/lib/supabase/types";

const SECTIONS: PositionSection[] = ["Command", "Operations", "Planning", "Logistics", "Finance"];

function fieldClass() {
  return "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]";
}

interface Ics204PanelProps {
  operationalPeriodId: string;
  periodNumber: number;
  periodDateFrom: string;
  periodTimeFrom: string;
  periodDateTo: string | null;
  periodTimeTo: string | null;
  assignmentLists: Ics204AssignmentList[];
  objectives: Ics204Objective[];
  units: Ics204Unit[];
  canEdit: boolean;
}

export function Ics204Panel({
  operationalPeriodId,
  periodNumber,
  periodDateFrom,
  periodTimeFrom,
  periodDateTo,
  periodTimeTo,
  assignmentLists,
  objectives,
  units,
  canEdit,
}: Ics204PanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showNew, setShowNew] = useState(false);
  const [section, setSection] = useState<PositionSection>("Operations");
  const [sectionChiefName, setSectionChiefName] = useState("");
  const [branch, setBranch] = useState("");
  const [branchDirectorName, setBranchDirectorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    await supabase.from("ics204_assignment_lists").insert({
      operational_period_id: operationalPeriodId,
      section,
      section_chief_name: sectionChiefName.trim() || null,
      branch: branch.trim() || null,
      branch_director_name: branchDirectorName.trim() || null,
    });

    setSubmitting(false);
    setSectionChiefName("");
    setBranch("");
    setBranchDirectorName("");
    setShowNew(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">
        Operational Period {periodNumber}: {periodDateFrom} {periodTimeFrom} →{" "}
        {periodDateTo ?? "(active)"} {periodTimeTo ?? ""}
      </p>

      {canEdit && (
        <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#001a35]"
            >
              New assignment list
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as PositionSection)}
                    className={fieldClass()}
                  >
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Section Chief</label>
                  <input
                    value={sectionChiefName}
                    onChange={(e) => setSectionChiefName(e.target.value)}
                    className={fieldClass()}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Branch (if applicable)
                  </label>
                  <input value={branch} onChange={(e) => setBranch(e.target.value)} className={fieldClass()} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Branch Director</label>
                  <input
                    value={branchDirectorName}
                    onChange={(e) => setBranchDirectorName(e.target.value)}
                    className={fieldClass()}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="rounded-md border border-black/10 px-4 py-1.5 text-sm dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {assignmentLists.length === 0 ? (
        <p className="text-sm text-zinc-500">No assignment lists yet.</p>
      ) : (
        <div className="space-y-6">
          {assignmentLists.map((list) => (
            <AssignmentListCard
              key={list.id}
              list={list}
              objectives={objectives.filter((o) => o.assignment_list_id === list.id)}
              units={units.filter((u) => u.assignment_list_id === list.id)}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentListCard({
  list,
  objectives,
  units,
  canEdit,
}: {
  list: Ics204AssignmentList;
  objectives: Ics204Objective[];
  units: Ics204Unit[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showAddObjective, setShowAddObjective] = useState(false);
  const [objective, setObjective] = useState("");
  const [strategies, setStrategies] = useState("");
  const [resources, setResources] = useState("");
  const [unitAssignedTo, setUnitAssignedTo] = useState("");
  const [addingObjective, setAddingObjective] = useState(false);

  const [showAddUnit, setShowAddUnit] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [location, setLocation] = useState("");
  const [membersTeams, setMembersTeams] = useState("");
  const [addingUnit, setAddingUnit] = useState(false);

  const [editingSpecial, setEditingSpecial] = useState(false);
  const [specialInfo, setSpecialInfo] = useState(list.special_info ?? "");
  const [savingSpecial, setSavingSpecial] = useState(false);

  const [showPrepared, setShowPrepared] = useState(false);
  const [preparedName, setPreparedName] = useState("");
  const [preparedSignature, setPreparedSignature] = useState("");
  const [preparedFacility, setPreparedFacility] = useState("");
  const [preparing, setPreparing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleAddObjective(e: React.FormEvent) {
    e.preventDefault();
    if (!objective.trim()) return;
    setAddingObjective(true);

    const { error } = await supabase.from("ics204_objectives").insert({
      assignment_list_id: list.id,
      objective: objective.trim(),
      strategies_tactics: strategies.trim() || null,
      resources_required: resources.trim() || null,
      unit_assigned_to: unitAssignedTo.trim() || null,
      sort_order: objectives.length,
    });

    setAddingObjective(false);
    if (error) {
      setError(error.message);
      return;
    }
    setObjective("");
    setStrategies("");
    setResources("");
    setUnitAssignedTo("");
    setShowAddObjective(false);
    router.refresh();
  }

  async function handleDeleteObjective(id: string) {
    await supabase.from("ics204_objectives").delete().eq("id", id);
    router.refresh();
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!unitName.trim()) return;
    setAddingUnit(true);

    const { error } = await supabase.from("ics204_units").insert({
      assignment_list_id: list.id,
      unit_name: unitName.trim(),
      leader_name: leaderName.trim() || null,
      location: location.trim() || null,
      members_teams: membersTeams.trim() || null,
      sort_order: units.length,
    });

    setAddingUnit(false);
    if (error) {
      setError(error.message);
      return;
    }
    setUnitName("");
    setLeaderName("");
    setLocation("");
    setMembersTeams("");
    setShowAddUnit(false);
    router.refresh();
  }

  async function handleDeleteUnit(id: string) {
    await supabase.from("ics204_units").delete().eq("id", id);
    router.refresh();
  }

  async function handleSaveSpecial(e: React.FormEvent) {
    e.preventDefault();
    setSavingSpecial(true);
    const { error } = await supabase
      .from("ics204_assignment_lists")
      .update({ special_info: specialInfo.trim() || null })
      .eq("id", list.id);
    setSavingSpecial(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingSpecial(false);
    router.refresh();
  }

  async function handlePrepared(e: React.FormEvent) {
    e.preventDefault();
    setPreparing(true);
    const { error } = await supabase
      .from("ics204_assignment_lists")
      .update({
        prepared_by_name: preparedName.trim() || null,
        prepared_by_signature: preparedSignature.trim() || null,
        prepared_by_facility: preparedFacility.trim() || null,
        prepared_at: new Date().toISOString(),
      })
      .eq("id", list.id);
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
      <div className="grid grid-cols-1 divide-y divide-black/10 border-b border-black/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10">
        <div className="px-3 py-2">
          <span className="block text-xs font-medium text-zinc-500">Section</span>
          <p className="text-black dark:text-zinc-50">
            {list.section}
            {list.section_chief_name && ` · ${list.section_chief_name}`}
          </p>
        </div>
        <div className="px-3 py-2">
          <span className="block text-xs font-medium text-zinc-500">Branch (if applicable)</span>
          <p className="text-black dark:text-zinc-50">
            {list.branch ?? "—"}
            {list.branch_director_name && ` · ${list.branch_director_name}`}
          </p>
        </div>
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="block text-xs font-medium text-zinc-500">
          5. Objectives / Strategies / Resources / Assigned Unit
        </span>
        {objectives.length > 0 && (
          <div className="overflow-x-auto">
          <table className="mt-1 w-full text-left text-xs">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1 pr-3 font-medium">Objective</th>
                <th className="py-1 pr-3 font-medium">Strategies / Tactics</th>
                <th className="py-1 pr-3 font-medium">Resources Required</th>
                <th className="py-1 pr-3 font-medium">Unit Assigned to</th>
                {canEdit && <th className="py-1" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {objectives.map((o) => (
                <tr key={o.id}>
                  <td className="py-1 pr-3 align-top text-black dark:text-zinc-50">{o.objective}</td>
                  <td className="py-1 pr-3 align-top text-zinc-700 dark:text-zinc-300">
                    {o.strategies_tactics ?? "—"}
                  </td>
                  <td className="py-1 pr-3 align-top text-zinc-700 dark:text-zinc-300">
                    {o.resources_required ?? "—"}
                  </td>
                  <td className="py-1 pr-3 align-top text-zinc-700 dark:text-zinc-300">
                    {o.unit_assigned_to ?? "—"}
                  </td>
                  {canEdit && (
                    <td className="py-1 text-right align-top">
                      <button
                        onClick={() => handleDeleteObjective(o.id)}
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
          (showAddObjective ? (
            <form onSubmit={handleAddObjective} className="mt-2 space-y-2">
              <textarea
                required
                rows={2}
                placeholder="Objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className={fieldClass()}
              />
              <textarea
                rows={2}
                placeholder="Strategies / tactics"
                value={strategies}
                onChange={(e) => setStrategies(e.target.value)}
                className={fieldClass()}
              />
              <textarea
                rows={2}
                placeholder="Resources required"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Unit assigned to"
                value={unitAssignedTo}
                onChange={(e) => setUnitAssignedTo(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingObjective}
                  className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddObjective(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddObjective(true)}
              className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Add objective
            </button>
          ))}
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="block text-xs font-medium text-zinc-500">
          6. Unit(s) Assigned this Operational Period
        </span>
        {units.length > 0 && (
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {units.map((u) => (
              <div key={u.id} className="rounded-md border border-black/10 p-2 text-xs dark:border-white/10">
                <div className="flex items-start justify-between gap-1">
                  <p className="font-medium text-black dark:text-zinc-50">{u.unit_name}</p>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteUnit(u.id)}
                      className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-zinc-500">Leader: {u.leader_name ?? "—"}</p>
                <p className="text-zinc-500">Location: {u.location ?? "—"}</p>
                <p className="text-zinc-500">Members: {u.members_teams ?? "—"}</p>
              </div>
            ))}
          </div>
        )}

        {canEdit &&
          (showAddUnit ? (
            <form onSubmit={handleAddUnit} className="mt-2 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  required
                  placeholder="Unit name"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className={fieldClass()}
                />
                <input
                  placeholder="Leader name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className={fieldClass()}
                />
                <input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={fieldClass()}
                />
              </div>
              <textarea
                rows={2}
                placeholder="Members / teams"
                value={membersTeams}
                onChange={(e) => setMembersTeams(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingUnit}
                  className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUnit(false)}
                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddUnit(true)}
              className="mt-2 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
            >
              Add unit
            </button>
          ))}
      </div>

      <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="block text-xs font-medium text-zinc-500">
          7. Special Information / Considerations
        </span>
        {editingSpecial ? (
          <form onSubmit={handleSaveSpecial} className="mt-1 space-y-2">
            <textarea
              rows={3}
              value={specialInfo}
              onChange={(e) => setSpecialInfo(e.target.value)}
              className={fieldClass()}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingSpecial}
                className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingSpecial(false)}
                className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="whitespace-pre-wrap text-black dark:text-zinc-50">{list.special_info ?? "—"}</p>
            {canEdit && (
              <button
                onClick={() => setEditingSpecial(true)}
                className="shrink-0 rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2">
        <span className="block text-xs font-medium text-zinc-500">8. Prepared by</span>
        {list.prepared_by_name ? (
          <p className="text-black dark:text-zinc-50">
            {list.prepared_by_name}
            {list.prepared_by_facility && ` · ${list.prepared_by_facility}`}
            {list.prepared_by_signature && ` · signed: ${list.prepared_by_signature}`}
            {list.prepared_at && ` · ${new Date(list.prepared_at).toLocaleString()}`}
          </p>
        ) : canEdit ? (
          showPrepared ? (
            <form onSubmit={handlePrepared} className="mt-1 space-y-2">
              <input
                required
                placeholder="Print name"
                value={preparedName}
                onChange={(e) => setPreparedName(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Signature (typed name)"
                value={preparedSignature}
                onChange={(e) => setPreparedSignature(e.target.value)}
                className={fieldClass()}
              />
              <input
                placeholder="Facility"
                value={preparedFacility}
                onChange={(e) => setPreparedFacility(e.target.value)}
                className={fieldClass()}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={preparing}
                  className="rounded-md bg-[#00274c] px-3 py-1 text-xs font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
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
