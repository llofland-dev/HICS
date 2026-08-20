import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Assignment,
  CustomPosition,
  Incident,
  OperationalPeriod,
  Position,
  Staff,
} from "@/lib/supabase/types";
import { PrintButton } from "./print-button";

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

function flatten(nodes: TreeNode[]): Position[] {
  const out: Position[] = [];
  for (const node of nodes) {
    out.push(node);
    out.push(...flatten(node.children));
  }
  return out;
}

interface CommsRow {
  name: string;
  position: string;
  roleTitle: string | null;
  phone: string | null;
}

export default async function CommunicationsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ op?: string }>;
}) {
  const { id } = await params;
  const { op } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: incident } = await supabase
    .from("incidents")
    .select("id, facility_org_id, event_id, name, incident_date, type, status, created_at")
    .eq("id", id)
    .maybeSingle<Incident>();

  if (!incident) notFound();

  const [{ data: positions }, { data: customPositions }, { data: staff }, { data: periods }] =
    await Promise.all([
      supabase
        .from("positions")
        .select("code, title, section, reports_to_code, tier, description")
        .returns<Position[]>(),
      supabase
        .from("custom_positions")
        .select("id, facility_org_id, title, created_at")
        .eq("facility_org_id", incident.facility_org_id)
        .returns<CustomPosition[]>(),
      supabase
        .from("staff")
        .select("id, facility_org_id, name, role_title, phone, email, notes")
        .eq("facility_org_id", incident.facility_org_id)
        .returns<Staff[]>(),
      supabase
        .from("operational_periods")
        .select("id, incident_id, period_number, date_from, time_from, date_to, time_to, status, created_at")
        .eq("incident_id", incident.id)
        .order("period_number", { ascending: true })
        .returns<OperationalPeriod[]>(),
    ]);

  const selectedPeriod =
    (op ? periods?.find((p) => p.id === op) : undefined) ??
    periods?.find((p) => p.status === "active") ??
    periods?.[periods.length - 1] ??
    null;

  const { data: assignments } = selectedPeriod
    ? await supabase
        .from("assignments")
        .select("id, incident_id, position_code, custom_position_id, staff_id, assigned_at, unassigned_at")
        .eq("operational_period_id", selectedPeriod.id)
        .is("unassigned_at", null)
        .returns<Assignment[]>()
    : { data: [] as Assignment[] };

  const staffById = new Map((staff ?? []).map((s) => [s.id, s]));
  const orderedPositions = flatten(buildTree(positions ?? []));

  const rows: CommsRow[] = [];

  for (const position of orderedPositions) {
    const assignment = (assignments ?? []).find((a) => a.position_code === position.code);
    if (!assignment) continue;
    const person = staffById.get(assignment.staff_id);
    if (!person) continue;
    rows.push({
      name: person.name,
      position: position.title,
      roleTitle: person.role_title,
      phone: person.phone,
    });
  }

  for (const customPosition of customPositions ?? []) {
    const assignment = (assignments ?? []).find((a) => a.custom_position_id === customPosition.id);
    if (!assignment) continue;
    const person = staffById.get(assignment.staff_id);
    if (!person) continue;
    rows.push({
      name: person.name,
      position: customPosition.title,
      roleTitle: person.role_title,
      phone: person.phone,
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8 print:px-0 print:py-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-zinc-50 print:text-black">
              Communications List
            </h1>
            <p className="text-sm text-zinc-500 print:text-black">
              {incident.name} · {incident.incident_date} · ICS 205A
              {selectedPeriod && ` · Operational Period ${selectedPeriod.period_number}`}
            </p>
          </div>
          <PrintButton />
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500 print:text-black">No positions assigned yet.</p>
        ) : (
          <table className="w-full text-left text-sm print:text-black">
            <thead className="border-b border-black/20 text-xs text-zinc-600 print:text-black dark:text-zinc-400">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Position</th>
                <th className="py-2 pr-4 font-medium">Normal Role</th>
                <th className="py-2 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10 print:divide-black/20">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 font-medium text-black dark:text-zinc-50 print:text-black">
                    {row.name}
                  </td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300 print:text-black">
                    {row.position}
                  </td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300 print:text-black">
                    {row.roleTitle ?? "—"}
                  </td>
                  <td className="py-2 text-zinc-700 dark:text-zinc-300 print:text-black">
                    {row.phone ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-12 text-center text-xs text-zinc-400 print:text-black">
          © {new Date().getFullYear()} Emergency Preparedness Solutions, LLC
        </p>
      </main>
  );
}
