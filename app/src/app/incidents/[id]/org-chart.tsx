"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Assignment,
  CustomPosition,
  Position,
  PositionSection,
  Staff,
  StaffQualification,
} from "@/lib/supabase/types";

export const SECTION_COLORS: Record<PositionSection, { border: string; badge: string }> = {
  Command: {
    border: "border-violet-400 dark:border-violet-600",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  },
  Operations: {
    border: "border-blue-400 dark:border-blue-600",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  Planning: {
    border: "border-green-400 dark:border-green-600",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  Logistics: {
    border: "border-amber-400 dark:border-amber-600",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  Finance: {
    border: "border-rose-400 dark:border-rose-600",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  },
};

interface TreeNode extends Position {
  children: TreeNode[];
}

function buildTree(positions: Position[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>();
  positions.forEach((p) => nodes.set(p.code, { ...p, children: [] }));

  const roots: TreeNode[] = [];
  nodes.forEach((node) => {
    if (node.reports_to_code && nodes.has(node.reports_to_code)) {
      nodes.get(node.reports_to_code)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

interface OrgChartProps {
  incidentId: string;
  operationalPeriodId: string;
  facilityOrgId: string;
  positions: Position[];
  customPositions: CustomPosition[];
  staff: Staff[];
  assignments: Assignment[];
  qualifications: StaffQualification[];
  canEdit: boolean;
  canEditAssignments: boolean;
}

export function OrgChart({
  incidentId,
  operationalPeriodId,
  facilityOrgId,
  positions,
  customPositions,
  staff,
  assignments,
  qualifications,
  canEdit,
  canEditAssignments,
}: OrgChartProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showExpansion, setShowExpansion] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [newStaffName, setNewStaffName] = useState("");
  const [newPositionTitle, setNewPositionTitle] = useState("");

  const tree = useMemo(() => buildTree(positions), [positions]);

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const assignmentByPosition = useMemo(() => {
    const map = new Map<string, Assignment>();
    assignments.forEach((a) => {
      const key = a.position_code ?? `custom:${a.custom_position_id}`;
      map.set(key, a);
    });
    return map;
  }, [assignments]);

  const qualifiedSet = useMemo(() => {
    const set = new Set<string>();
    qualifications.forEach((q) => {
      if (q.qualified) set.add(`${q.staff_id}:${q.position_code}`);
    });
    return set;
  }, [qualifications]);

  async function handleAssign(key: string, positionCode: string | null, customPositionId: string | null, staffId: string) {
    setPending(key);

    const current = assignmentByPosition.get(key);

    try {
      if (current && current.staff_id === staffId) {
        return; // no-op
      }

      if (current) {
        const { error } = await supabase
          .from("assignments")
          .update({ unassigned_at: new Date().toISOString() })
          .eq("id", current.id);
        if (error) throw error;
      }

      if (staffId) {
        const { error } = await supabase.from("assignments").insert({
          incident_id: incidentId,
          operational_period_id: operationalPeriodId,
          position_code: positionCode,
          custom_position_id: customPositionId,
          staff_id: staffId,
        });
        if (error) throw error;
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update assignment");
    } finally {
      setPending(null);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const { error } = await supabase
      .from("staff")
      .insert({ facility_org_id: facilityOrgId, name: newStaffName.trim() });

    if (error) {
      alert(error.message);
      return;
    }

    setNewStaffName("");
    router.refresh();
  }

  async function handleAddCustomPosition(e: React.FormEvent) {
    e.preventDefault();
    if (!newPositionTitle.trim()) return;

    const { error } = await supabase
      .from("custom_positions")
      .insert({ facility_org_id: facilityOrgId, title: newPositionTitle.trim() });

    if (error) {
      alert(error.message);
      return;
    }

    setNewPositionTitle("");
    router.refresh();
  }

  function AssignSelect({
    positionKey,
    positionCode,
    customPositionId,
  }: {
    positionKey: string;
    positionCode: string | null;
    customPositionId: string | null;
  }) {
    const current = assignmentByPosition.get(positionKey);

    return (
      <select
        disabled={pending === positionKey}
        value={current?.staff_id ?? ""}
        onChange={(e) => handleAssign(positionKey, positionCode, customPositionId, e.target.value)}
        className="mt-1 w-full rounded border border-black/10 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
      >
        <option value="">— Vacant —</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    );
  }

  function PositionCard({ node }: { node: TreeNode }) {
    if (node.tier === "expansion" && !showExpansion) return null;

    const colors = SECTION_COLORS[node.section];
    const key = node.code;
    const current = assignmentByPosition.get(key);
    const assignedStaff = current ? staffById.get(current.staff_id) : undefined;
    const isUnqualified =
      current && !qualifiedSet.has(`${current.staff_id}:${node.code}`);

    const visibleChildren = node.children.filter(
      (child) => child.tier !== "expansion" || showExpansion
    );

    return (
      <div className="flex flex-col items-center">
        <div className={`w-52 shrink-0 rounded-md border-2 bg-white p-2 dark:bg-zinc-950 ${colors.border}`}>
          <div className="flex items-center justify-between gap-1">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}>
              {node.section}
            </span>
            {node.tier === "expansion" && (
              <span className="text-[10px] text-zinc-400">expansion</span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-black dark:text-zinc-50">{node.title}</p>

          {canEditAssignments ? (
            <AssignSelect positionKey={key} positionCode={node.code} customPositionId={null} />
          ) : (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {assignedStaff?.name ?? "Vacant"}
            </p>
          )}

          {isUnqualified && assignedStaff && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-500">
              ⚠ not marked qualified
            </p>
          )}
        </div>

        {visibleChildren.length > 0 && (
          <>
            {/* stub connecting this box down to the children's shared rail */}
            <div className="h-4 w-px bg-black/15 dark:bg-white/15" />

            <div className="flex">
              {visibleChildren.map((child, i) => (
                <div key={child.code} className="flex flex-col items-center px-3">
                  {/* rail segment: full width for interior children, half width
                      (toward center) for the first/last so the line only spans
                      from the first child's center to the last child's center */}
                  <div className="relative h-px w-full bg-black/15 dark:bg-white/15">
                    {i === 0 && (
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-zinc-50 dark:bg-black" />
                    )}
                    {i === visibleChildren.length - 1 && (
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-zinc-50 dark:bg-black" />
                    )}
                  </div>
                  <div className="h-4 w-px bg-black/15 dark:bg-white/15" />
                  <PositionCard node={child} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={showExpansion}
            onChange={(e) => setShowExpansion(e.target.checked)}
          />
          Show expansion positions
        </label>

        {canEdit && (
          <form onSubmit={handleAddStaff} className="flex items-center gap-2">
            <input
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              placeholder="Add staff member (name)"
              className="w-48 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
            />
            <button
              type="submit"
              className="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/10"
            >
              Add
            </button>
          </form>
        )}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6">
          {tree.map((root) => (
            <PositionCard key={root.code} node={root} />
          ))}
        </div>
      </div>

      <section className="space-y-3 border-t border-black/10 pt-6 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Custom / local positions
          </h2>
          {canEdit && (
            <form onSubmit={handleAddCustomPosition} className="flex items-center gap-2">
              <input
                value={newPositionTitle}
                onChange={(e) => setNewPositionTitle(e.target.value)}
                placeholder="New position title"
                className="w-48 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
              />
              <button
                type="submit"
                className="rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/10"
              >
                Add
              </button>
            </form>
          )}
        </div>

        {customPositions.length === 0 ? (
          <p className="text-sm text-zinc-500">No custom positions for this facility yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {customPositions.map((cp) => {
              const key = `custom:${cp.id}`;
              const current = assignmentByPosition.get(key);
              const assignedStaff = current ? staffById.get(current.staff_id) : undefined;

              return (
                <div
                  key={cp.id}
                  className="w-52 rounded-md border-2 border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Custom
                  </span>
                  <p className="mt-1 text-sm font-medium text-black dark:text-zinc-50">
                    {cp.title}
                  </p>
                  {canEditAssignments ? (
                    <AssignSelect positionKey={key} positionCode={null} customPositionId={cp.id} />
                  ) : (
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {assignedStaff?.name ?? "Vacant"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
