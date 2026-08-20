"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Position, PositionSection, Staff, StaffQualification } from "@/lib/supabase/types";
import { SECTION_COLORS } from "../incidents/[id]/org-chart";

interface StaffRosterProps {
  facilityOrgId: string;
  staff: Staff[];
  positions: Position[];
  qualifications: StaffQualification[];
}

interface StaffFormValues {
  name: string;
  role_title: string;
  phone: string;
  email: string;
  notes: string;
}

const EMPTY_FORM: StaffFormValues = { name: "", role_title: "", phone: "", email: "", notes: "" };

export function StaffRoster({ facilityOrgId, staff, positions, qualifications }: StaffRosterProps) {
  const router = useRouter();
  const supabase = createClient();

  const [newStaff, setNewStaff] = useState<StaffFormValues>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<StaffFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showExpansionPositions, setShowExpansionPositions] = useState(false);
  const [pendingQual, setPendingQual] = useState<string | null>(null);

  const qualifiedSet = useMemo(() => {
    const set = new Set<string>();
    qualifications.forEach((q) => {
      if (q.qualified) set.add(`${q.staff_id}:${q.position_code}`);
    });
    return set;
  }, [qualifications]);

  const positionsBySection = useMemo(() => {
    const visible = positions.filter((p) => showExpansionPositions || p.tier === "core");
    const groups = new Map<PositionSection, Position[]>();
    visible.forEach((p) => {
      if (!groups.has(p.section)) groups.set(p.section, []);
      groups.get(p.section)!.push(p);
    });
    return groups;
  }, [positions, showExpansionPositions]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaff.name.trim()) return;
    setAddError(null);
    setAdding(true);

    const { error } = await supabase.from("staff").insert({
      facility_org_id: facilityOrgId,
      name: newStaff.name.trim(),
      role_title: newStaff.role_title.trim() || null,
      phone: newStaff.phone.trim() || null,
      email: newStaff.email.trim() || null,
      notes: newStaff.notes.trim() || null,
    });

    setAdding(false);

    if (error) {
      setAddError(error.message);
      return;
    }

    setNewStaff(EMPTY_FORM);
    router.refresh();
  }

  function startEdit(s: Staff) {
    setEditingId(s.id);
    setRowError(null);
    setEditValues({
      name: s.name,
      role_title: s.role_title ?? "",
      phone: s.phone ?? "",
      email: s.email ?? "",
      notes: s.notes ?? "",
    });
  }

  async function handleSaveEdit(id: string) {
    if (!editValues.name.trim()) return;
    setSaving(true);
    setRowError(null);

    const { error } = await supabase
      .from("staff")
      .update({
        name: editValues.name.trim(),
        role_title: editValues.role_title.trim() || null,
        phone: editValues.phone.trim() || null,
        email: editValues.email.trim() || null,
        notes: editValues.notes.trim() || null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setRowError(error.message);
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(s: Staff) {
    if (!confirm(`Remove ${s.name} from the roster?`)) return;

    const { error } = await supabase.from("staff").delete().eq("id", s.id);

    if (error) {
      if (error.code === "23503") {
        alert(
          `${s.name} can't be removed — they have incident assignment history. Consider unassigning them from active incidents instead.`
        );
      } else {
        alert(error.message);
      }
      return;
    }

    router.refresh();
  }

  async function toggleQualification(staffId: string, positionCode: string, qualified: boolean) {
    const key = `${staffId}:${positionCode}`;
    setPendingQual(key);

    try {
      if (qualified) {
        const { error } = await supabase
          .from("staff_qualifications")
          .delete()
          .eq("staff_id", staffId)
          .eq("position_code", positionCode);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("staff_qualifications")
          .insert({ staff_id: staffId, position_code: positionCode, qualified: true });
        if (error) throw error;
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update qualification");
    } finally {
      setPendingQual(null);
    }
  }

  function fieldClass() {
    return "rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">Add staff</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-staff-name" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Name
            </label>
            <input
              id="new-staff-name"
              required
              value={newStaff.name}
              onChange={(e) => setNewStaff((v) => ({ ...v, name: e.target.value }))}
              className={`w-44 ${fieldClass()}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-staff-role" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Role / title
            </label>
            <input
              id="new-staff-role"
              value={newStaff.role_title}
              onChange={(e) => setNewStaff((v) => ({ ...v, role_title: e.target.value }))}
              className={`w-40 ${fieldClass()}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-staff-phone" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Phone
            </label>
            <input
              id="new-staff-phone"
              value={newStaff.phone}
              onChange={(e) => setNewStaff((v) => ({ ...v, phone: e.target.value }))}
              className={`w-32 ${fieldClass()}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-staff-email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Email
            </label>
            <input
              id="new-staff-email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff((v) => ({ ...v, email: e.target.value }))}
              className={`w-48 ${fieldClass()}`}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {adding ? "Adding..." : "Add staff"}
          </button>
          {addError && <p className="w-full text-sm text-red-600 dark:text-red-400">{addError}</p>}
        </form>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Roster ({staff.length})
          </h2>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={showExpansionPositions}
              onChange={(e) => setShowExpansionPositions(e.target.checked)}
            />
            Show expansion positions in qualification matrix
          </label>
        </div>

        {staff.length === 0 ? (
          <p className="text-sm text-zinc-500">No staff yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[.03] text-xs text-zinc-600 dark:bg-white/[.04] dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Role / title</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {staff.map((s) => {
                  const isEditing = editingId === s.id;
                  const isExpanded = expandedId === s.id;
                  const qualifiedCount = qualifications.filter(
                    (q) => q.staff_id === s.id && q.qualified
                  ).length;

                  return (
                    <Fragment key={s.id}>
                      <tr className="bg-white dark:bg-zinc-950">
                        {isEditing ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                value={editValues.name}
                                onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                                className={`w-full ${fieldClass()}`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                value={editValues.role_title}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, role_title: e.target.value }))
                                }
                                className={`w-full ${fieldClass()}`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                value={editValues.phone}
                                onChange={(e) => setEditValues((v) => ({ ...v, phone: e.target.value }))}
                                className={`w-full ${fieldClass()}`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="email"
                                value={editValues.email}
                                onChange={(e) => setEditValues((v) => ({ ...v, email: e.target.value }))}
                                className={`w-full ${fieldClass()}`}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleSaveEdit(s.id)}
                                  disabled={saving}
                                  className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                                >
                                  {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 font-medium text-black dark:text-zinc-50">
                              {s.name}
                            </td>
                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                              {s.role_title ?? "—"}
                            </td>
                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                              {s.phone ?? "—"}
                            </td>
                            <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                              {s.email ?? "—"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                                >
                                  Qualified ({qualifiedCount}){isExpanded ? " ▲" : " ▼"}
                                </button>
                                <button
                                  onClick={() => startEdit(s)}
                                  className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/10"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(s)}
                                  className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>

                      {isEditing && rowError && (
                        <tr>
                          <td colSpan={5} className="px-4 pb-2 text-sm text-red-600 dark:text-red-400">
                            {rowError}
                          </td>
                        </tr>
                      )}

                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-black/[.02] px-4 py-3 dark:bg-white/[.03]">
                            <div className="space-y-3">
                              {Array.from(positionsBySection.entries()).map(([section, sectionPositions]) => {
                                const colors = SECTION_COLORS[section];
                                return (
                                  <div key={section}>
                                    <span
                                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}
                                    >
                                      {section}
                                    </span>
                                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                                      {sectionPositions.map((p) => {
                                        const qualified = qualifiedSet.has(`${s.id}:${p.code}`);
                                        const key = `${s.id}:${p.code}`;
                                        return (
                                          <label
                                            key={p.code}
                                            className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={qualified}
                                              disabled={pendingQual === key}
                                              onChange={() => toggleQualification(s.id, p.code, qualified)}
                                            />
                                            {p.title}
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
