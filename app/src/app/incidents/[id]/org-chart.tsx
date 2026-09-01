"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SECTION_COLORS } from "@/lib/section-colors";
import { buildPositionTree, type PositionTreeNode } from "@/lib/position-tree";
import type {
  Assignment,
  CustomPosition,
  Position,
  Staff,
  StaffQualification,
} from "@/lib/supabase/types";

type TreeNode = PositionTreeNode;

// Counts a node's descendants that would actually render given the current
// expansion-tier toggle, so a branch's collapse button can say how many
// positions it's hiding without including ones that are separately hidden.
function countVisibleDescendants(node: TreeNode, showExpansion: boolean): number {
  return node.children.reduce((sum, child) => {
    if (child.tier === "expansion" && !showExpansion) return sum;
    return sum + 1 + countVisibleDescendants(child, showExpansion);
  }, 0);
}

// Bundles everything the tree-rendering components below need but don't own
// themselves, so they can live at module scope (required -- components
// defined inside another component's render get recreated, and lose state,
// on every render) without each one repeating a long prop list.
interface ChartContext {
  canEditAssignments: boolean;
  assignmentByPosition: Map<string, Assignment>;
  staffById: Map<string, Staff>;
  qualifiedSet: Set<string>;
  collapsibleCodes: Set<string>;
  collapsed: Set<string>;
  showExpansion: boolean;
  staff: Staff[];
  pending: string | null;
  onAssign: (key: string, positionCode: string | null, customPositionId: string | null, staffId: string) => void;
  onToggleCollapsed: (code: string) => void;
}

function AssignSelect({
  ctx,
  positionKey,
  positionCode,
  customPositionId,
}: {
  ctx: ChartContext;
  positionKey: string;
  positionCode: string | null;
  customPositionId: string | null;
}) {
  const current = ctx.assignmentByPosition.get(positionKey);

  return (
    <select
      disabled={ctx.pending === positionKey}
      value={current?.staff_id ?? ""}
      onChange={(e) => ctx.onAssign(positionKey, positionCode, customPositionId, e.target.value)}
      className="mt-1 w-full rounded border border-black/10 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
    >
      <option value="">— Vacant —</option>
      {ctx.staff.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

// The card visual is the same at every tier -- only how nodes are arranged
// around each other changes (see BranchColumn/SectionChiefColumn below).
function PositionBox({ ctx, node }: { ctx: ChartContext; node: TreeNode }) {
  const colors = SECTION_COLORS[node.section];
  const key = node.code;
  const current = ctx.assignmentByPosition.get(key);
  const assignedStaff = current ? ctx.staffById.get(current.staff_id) : undefined;
  const isUnqualified = current && !ctx.qualifiedSet.has(`${current.staff_id}:${node.code}`);
  // collapsibleCodes only ever contains Section Chiefs (IC's direct reports
  // that themselves have children), so this never fires for Command staff,
  // branches, or units -- no extra check needed here.
  const isCollapsible = ctx.collapsibleCodes.has(node.code);
  const isCollapsed = isCollapsible && ctx.collapsed.has(node.code);

  return (
    <div
      data-position-code={node.code}
      className={`w-52 shrink-0 rounded-md border-2 bg-white p-2 dark:bg-zinc-950 ${colors.border}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}>
          {node.section}
        </span>
        {node.tier === "expansion" && (
          <span className="text-[10px] text-zinc-400">expansion</span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium text-black dark:text-zinc-50">{node.title}</p>

      {ctx.canEditAssignments ? (
        <AssignSelect ctx={ctx} positionKey={key} positionCode={node.code} customPositionId={null} />
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

      {isCollapsible && (
        <button
          onClick={() => ctx.onToggleCollapsed(node.code)}
          className="mt-1.5 text-[11px] text-[#00274c] underline hover:no-underline dark:text-[#7ba6d6]"
        >
          {isCollapsed
            ? `Show ${countVisibleDescendants(node, ctx.showExpansion)} more ↓`
            : "Hide ↑"}
        </button>
      )}
    </div>
  );
}

// A branch (e.g. Medical Care Branch Director) and its own unit leaders,
// stacked vertically in a single column -- matching the real HICS chart,
// where a branch's units run straight down rather than spreading out
// sideways. Only branches spread horizontally (in SectionChiefColumn
// below); everything under a branch stays in its column.
function BranchColumn({ ctx, node }: { ctx: ChartContext; node: TreeNode }) {
  const visibleChildren = node.children.filter(
    (child) => child.tier !== "expansion" || ctx.showExpansion
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <PositionBox ctx={ctx} node={node} />
      {visibleChildren.map((child) => (
        <div key={child.code} className="flex flex-col items-center gap-2">
          <div className="h-3 w-px bg-black/15 dark:bg-white/15" />
          <PositionBox ctx={ctx} node={child} />
        </div>
      ))}
    </div>
  );
}

// A Section Chief and, when expanded, its branches spread horizontally (one
// column per branch, per BranchColumn above).
function SectionChiefColumn({ ctx, node }: { ctx: ChartContext; node: TreeNode }) {
  const isCollapsed = ctx.collapsed.has(node.code);
  const visibleChildren = node.children.filter(
    (child) => child.tier !== "expansion" || ctx.showExpansion
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <PositionBox ctx={ctx} node={node} />
      {!isCollapsed && visibleChildren.length > 0 && (
        <>
          <div className="h-4 w-px bg-black/15 dark:bg-white/15" />
          <div className="flex gap-4">
            {visibleChildren.map((branch) => (
              <BranchColumn key={branch.code} ctx={ctx} node={branch} />
            ))}
          </div>
        </>
      )}
    </div>
  );
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

  const tree = useMemo(() => buildPositionTree(positions), [positions]);

  // The primary positions (Incident Commander, plus everyone reporting
  // directly to them -- PIO, Safety, Liaison, and the four Section Chiefs)
  // always stay visible. Anything below a Section Chief -- branches, units --
  // is what actually makes the chart wide (Operations alone has ~30
  // positions), so those branches collapse by default, one toggle per
  // Section Chief, rather than hiding individual positions piecemeal.
  const collapsibleCodes = useMemo(() => {
    const codes = new Set<string>();
    tree.forEach((root) => {
      root.children.forEach((child) => {
        if (child.children.length > 0) codes.add(child.code);
      });
    });
    return codes;
  }, [tree]);

  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(collapsibleCodes));

  // IC's direct reports split into two visually distinct groups: Command
  // staff (PIO, Safety, Liaison, M/T Specialist -- leaves, no children) sit
  // in a tight cluster right under the IC card, while Section Chiefs (the
  // ones with their own branches underneath) get the wider row below that.
  // This mirrors the client's real chart, which draws Command staff as a
  // compact block distinct from the section-chief row -- not one flat row
  // of eight equal boxes.
  const ic = tree.find((root) => root.code === "IC") ?? tree[0];
  const icChildren = (ic?.children ?? []).filter(
    (child) => child.tier !== "expansion" || showExpansion
  );
  const commandStaff = icChildren.filter((child) => child.children.length === 0);
  const sectionChiefs = icChildren.filter((child) => child.children.length > 0);

  function toggleCollapsed(code: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  // The Incident Commander's card centers itself above its own (very wide)
  // subtree via `items-center`, so on first load it can sit well to the
  // right of the scroll container's left edge -- the opposite of what a
  // user opening the chart to find "my position" needs. Scroll it to the
  // start once on mount rather than changing the centered layout, which is
  // what makes this read as a tree at all.
  useEffect(() => {
    document
      .querySelector('[data-position-code="IC"]')
      ?.scrollIntoView({ inline: "start", block: "nearest" });
  }, []);

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

  const ctx: ChartContext = {
    canEditAssignments,
    assignmentByPosition,
    staffById,
    qualifiedSet,
    collapsibleCodes,
    collapsed,
    showExpansion,
    staff,
    pending,
    onAssign: handleAssign,
    onToggleCollapsed: toggleCollapsed,
  };

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
              className="w-48 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
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

      {ic && (
        <div className="flex flex-col items-center gap-2">
          <PositionBox ctx={ctx} node={ic} />

          {commandStaff.length > 0 && (
            <>
              <div className="h-3 w-px bg-black/15 dark:bg-white/15" />
              <div className="grid grid-cols-2 gap-3">
                {commandStaff.map((node) => (
                  <PositionBox key={node.code} ctx={ctx} node={node} />
                ))}
              </div>
            </>
          )}

          {sectionChiefs.length > 0 && (
            <>
              <div className="h-4 w-px bg-black/15 dark:bg-white/15" />
              <div className="w-full overflow-x-auto pb-4">
                {/* mx-auto centers when content fits, same as justify-center
                    would -- but unlike justify-center on the scroll
                    container, it doesn't trap part of an overflowing row
                    before the scroll origin where it can't be reached. */}
                <div className="mx-auto flex w-max gap-6">
                  {sectionChiefs.map((node) => (
                    <SectionChiefColumn key={node.code} ctx={ctx} node={node} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

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
                className="w-48 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
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
                    <AssignSelect ctx={ctx} positionKey={key} positionCode={null} customPositionId={cp.id} />
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
