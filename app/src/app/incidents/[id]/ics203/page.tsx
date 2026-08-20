import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Assignment,
  CustomPosition,
  Ics203Details,
  Ics203ExternalRep,
  Ics203HospitalRep,
  Incident,
  OperationalPeriod,
  Position,
  PositionSection,
  Profile,
  Staff,
} from "@/lib/supabase/types";
import { SECTION_COLORS } from "@/lib/section-colors";
import { Ics203Editor } from "./ics203-editor";
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

const SECTION_TITLES: Record<PositionSection, string> = {
  Command: "3. Incident Commander(s) and Staff",
  Operations: "4. Operations Section",
  Planning: "5. Planning Section",
  Logistics: "6. Logistics Section",
  Finance: "7. Finance / Administration Section",
};

export default async function Ics203Page({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const canEdit = profile?.org_id === incident.facility_org_id;

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

  const [{ data: assignments }, { data: details }, { data: externalReps }, { data: hospitalReps }] =
    selectedPeriod
      ? await Promise.all([
          supabase
            .from("assignments")
            .select("id, incident_id, position_code, custom_position_id, staff_id, assigned_at, unassigned_at")
            .eq("operational_period_id", selectedPeriod.id)
            .is("unassigned_at", null)
            .returns<Assignment[]>(),
          supabase.from("ics203_details").select("*").eq("operational_period_id", selectedPeriod.id).maybeSingle<Ics203Details>(),
          supabase
            .from("ics203_external_reps")
            .select("*")
            .eq("operational_period_id", selectedPeriod.id)
            .order("sort_order", { ascending: true })
            .returns<Ics203ExternalRep[]>(),
          supabase
            .from("ics203_hospital_reps")
            .select("*")
            .eq("operational_period_id", selectedPeriod.id)
            .order("sort_order", { ascending: true })
            .returns<Ics203HospitalRep[]>(),
        ])
      : [{ data: [] as Assignment[] }, { data: null }, { data: [] as Ics203ExternalRep[] }, { data: [] as Ics203HospitalRep[] }];

  const staffById = new Map((staff ?? []).map((s) => [s.id, s]));
  const assignmentByPosition = new Map((assignments ?? []).map((a) => [a.position_code ?? `custom:${a.custom_position_id}`, a]));
  const orderedPositions = flatten(buildTree(positions ?? []));

  const positionsBySection = new Map<PositionSection, Position[]>();
  orderedPositions.forEach((p) => {
    if (!positionsBySection.has(p.section)) positionsBySection.set(p.section, []);
    positionsBySection.get(p.section)!.push(p);
  });

  const sectionOrder: PositionSection[] = ["Command", "Operations", "Planning", "Logistics", "Finance"];

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8 text-sm print:px-0 print:py-0 print:text-black">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-lg font-semibold text-black dark:text-zinc-50">HICS 203 Organization List</h1>
          <p className="text-sm text-zinc-500">
            {incident.name} · {incident.incident_date}
            {selectedPeriod && ` · Operational Period ${selectedPeriod.period_number}`}
          </p>
        </div>
        <PrintButton />
      </div>

        <div className="hidden print:block">
          <h1 className="text-center text-lg font-bold uppercase">HICS 203 Organization List</h1>
          <p className="text-center text-sm">
            {incident.name}
            {selectedPeriod && ` · Operational Period ${selectedPeriod.period_number}`}
          </p>
        </div>

        {selectedPeriod && (
          <p className="text-xs text-zinc-500 print:text-black">
            <span className="font-semibold">2. Operational Period:</span> {selectedPeriod.date_from}{" "}
            {selectedPeriod.time_from} → {selectedPeriod.date_to ?? "(active)"} {selectedPeriod.time_to ?? ""}
          </p>
        )}

        {sectionOrder.map((section) => {
          const sectionPositions = positionsBySection.get(section) ?? [];
          const colors = SECTION_COLORS[section];
          return (
            <section key={section} className="print:break-inside-avoid">
              <h2
                className={`mb-2 inline-block rounded px-2 py-0.5 text-sm font-semibold ${colors.badge} print:bg-transparent print:px-0 print:text-black`}
              >
                {SECTION_TITLES[section]}
              </h2>
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-black/20 text-zinc-600 dark:text-zinc-400">
                    <th className="py-1 pr-3 font-medium">Position</th>
                    <th className="py-1 pr-3 font-medium">Name</th>
                    <th className="py-1 font-medium">Contact Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {sectionPositions.map((p) => {
                    const assignment = assignmentByPosition.get(p.code);
                    const person = assignment ? staffById.get(assignment.staff_id) : undefined;
                    return (
                      <tr key={p.code}>
                        <td className="py-1 pr-3 align-top">{p.title}</td>
                        <td className="py-1 pr-3 align-top font-medium text-black dark:text-zinc-50">
                          {person?.name ?? "—"}
                        </td>
                        <td className="py-1 align-top text-zinc-600 dark:text-zinc-400">{person?.phone ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}

        {(customPositions ?? []).length > 0 && (
          <section className="print:break-inside-avoid">
            <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Additional / Custom Positions
            </h2>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-black/20 text-zinc-600 dark:text-zinc-400">
                  <th className="py-1 pr-3 font-medium">Position</th>
                  <th className="py-1 pr-3 font-medium">Name</th>
                  <th className="py-1 font-medium">Contact Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {(customPositions ?? []).map((cp) => {
                  const assignment = assignmentByPosition.get(`custom:${cp.id}`);
                  const person = assignment ? staffById.get(assignment.staff_id) : undefined;
                  return (
                    <tr key={cp.id}>
                      <td className="py-1 pr-3 align-top">{cp.title}</td>
                      <td className="py-1 pr-3 align-top font-medium text-black dark:text-zinc-50">
                        {person?.name ?? "—"}
                      </td>
                      <td className="py-1 align-top text-zinc-600 dark:text-zinc-400">{person?.phone ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {selectedPeriod && (
          <Ics203Editor
            operationalPeriodId={selectedPeriod.id}
            details={details}
            externalReps={externalReps ?? []}
            hospitalReps={hospitalReps ?? []}
            canEdit={canEdit}
          />
        )}

      <p className="mt-8 border-t border-black/10 pt-4 text-center text-[10px] text-zinc-400 print:border-black/30 print:text-black">
        © {new Date().getFullYear()} Emergency Preparedness Solutions, LLC
      </p>
    </main>
  );
}
