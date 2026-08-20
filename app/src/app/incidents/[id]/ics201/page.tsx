import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SECTION_COLORS } from "@/lib/section-colors";
import type {
  Assignment,
  CustomPosition,
  Ics201Action,
  Ics201Briefing,
  Ics201Objective,
  Ics201Resource,
  Incident,
  OperationalPeriod,
  Position,
  PositionSection,
  Profile,
  Staff,
} from "@/lib/supabase/types";
import { Ics201BottomSections, Ics201TopSections } from "./ics201-editor";

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

const SECTION_ORDER: PositionSection[] = ["Command", "Operations", "Planning", "Logistics", "Finance"];

export default async function Ics201Page({
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

  const [
    { data: assignments },
    { data: briefing },
    { data: objectives },
    { data: actions },
    { data: resources },
  ] = selectedPeriod
    ? await Promise.all([
        supabase
          .from("assignments")
          .select("id, incident_id, position_code, custom_position_id, staff_id, assigned_at, unassigned_at")
          .eq("operational_period_id", selectedPeriod.id)
          .is("unassigned_at", null)
          .returns<Assignment[]>(),
        supabase
          .from("ics201_briefings")
          .select("*")
          .eq("operational_period_id", selectedPeriod.id)
          .maybeSingle<Ics201Briefing>(),
        supabase
          .from("ics201_objectives")
          .select("*")
          .eq("operational_period_id", selectedPeriod.id)
          .order("sort_order", { ascending: true })
          .returns<Ics201Objective[]>(),
        supabase
          .from("ics201_actions")
          .select("*")
          .eq("operational_period_id", selectedPeriod.id)
          .order("sort_order", { ascending: true })
          .returns<Ics201Action[]>(),
        supabase
          .from("ics201_resources")
          .select("*")
          .eq("operational_period_id", selectedPeriod.id)
          .order("sort_order", { ascending: true })
          .returns<Ics201Resource[]>(),
      ])
    : [
        { data: [] as Assignment[] },
        { data: null },
        { data: [] as Ics201Objective[] },
        { data: [] as Ics201Action[] },
        { data: [] as Ics201Resource[] },
      ];

  const staffById = new Map((staff ?? []).map((s) => [s.id, s]));
  const assignmentByPosition = new Map(
    (assignments ?? []).map((a) => [a.position_code ?? `custom:${a.custom_position_id}`, a])
  );
  const orderedPositions = flatten(buildTree(positions ?? []));
  const positionsBySection = new Map<PositionSection, Position[]>();
  orderedPositions.forEach((p) => {
    if (!positionsBySection.has(p.section)) positionsBySection.set(p.section, []);
    positionsBySection.get(p.section)!.push(p);
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">HICS 201 Incident Briefing</h1>
        <p className="text-sm text-zinc-500">
          {selectedPeriod && `Operational Period ${selectedPeriod.period_number}`}
          {!canEdit && " · read-only (different facility)"}
        </p>
      </div>

      {selectedPeriod ? (
          <>
            <p className="text-xs text-zinc-500">
              2. Operational Period: {selectedPeriod.date_from} {selectedPeriod.time_from} →{" "}
              {selectedPeriod.date_to ?? "(active)"} {selectedPeriod.time_to ?? ""}
            </p>

            <Ics201TopSections operationalPeriodId={selectedPeriod.id} briefing={briefing} canEdit={canEdit} />

            <section className="space-y-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
              <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
                6. Current Hospital Incident Management Team
              </h2>
              <p className="text-xs text-zinc-500">
                Reflects the org chart for this operational period —{" "}
                <Link href={`/incidents/${incident.id}?op=${selectedPeriod.id}`} className="underline">
                  edit staffing there
                </Link>
                .
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {SECTION_ORDER.map((section) => {
                  const sectionPositions = positionsBySection.get(section) ?? [];
                  const colors = SECTION_COLORS[section];
                  return (
                    <div key={section}>
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.badge}`}
                      >
                        {section}
                      </span>
                      <ul className="mt-1 space-y-0.5 text-sm">
                        {sectionPositions.map((p) => {
                          const assignment = assignmentByPosition.get(p.code);
                          const person = assignment ? staffById.get(assignment.staff_id) : undefined;
                          return (
                            <li key={p.code} className="flex justify-between gap-2">
                              <span className="text-zinc-600 dark:text-zinc-400">{p.title}</span>
                              <span className="text-black dark:text-zinc-50">{person?.name ?? "Vacant"}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {(customPositions ?? []).length > 0 && (
                <div>
                  <span className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Custom
                  </span>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {(customPositions ?? []).map((cp) => {
                      const assignment = assignmentByPosition.get(`custom:${cp.id}`);
                      const person = assignment ? staffById.get(assignment.staff_id) : undefined;
                      return (
                        <li key={cp.id} className="flex justify-between gap-2">
                          <span className="text-zinc-600 dark:text-zinc-400">{cp.title}</span>
                          <span className="text-black dark:text-zinc-50">{person?.name ?? "Vacant"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>

            <Ics201BottomSections
              operationalPeriodId={selectedPeriod.id}
              briefing={briefing}
              objectives={objectives ?? []}
              actions={actions ?? []}
              resources={resources ?? []}
              canEdit={canEdit}
            />
          </>
      ) : (
        <p className="text-sm text-zinc-500">No operational period found for this incident.</p>
      )}
    </main>
  );
}
