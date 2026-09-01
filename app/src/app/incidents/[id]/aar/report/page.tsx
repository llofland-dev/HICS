import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Aar,
  AarActionItem,
  AarCommandHighlight,
  AarCoordinationRole,
  AarCoreElementNote,
  AarTimelineEntry,
  CoreElement,
  Incident,
  Organization,
} from "@/lib/supabase/types";
import { CORE_ELEMENTS } from "@/lib/supabase/types";
import { PrintButton } from "./print-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: incident } = await supabase
    .from("incidents")
    .select("facility_org_id, name")
    .eq("id", id)
    .maybeSingle();

  if (!incident) return {};

  const [{ data: aar }, { data: org }] = await Promise.all([
    supabase.from("aar").select("event_name").eq("incident_id", id).maybeSingle(),
    supabase.from("organizations").select("name").eq("id", incident.facility_org_id).maybeSingle(),
  ]);

  const eventName = aar?.event_name ?? incident.name;
  const title = org?.name ? `${org.name} — ${eventName} AAR` : `${eventName} AAR`;

  return { title };
}

export default async function AarReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const { data: facilityOrg } = await supabase
    .from("organizations")
    .select("id, name, type, parent_org_id, created_at")
    .eq("id", incident.facility_org_id)
    .maybeSingle<Organization>();

  const [
    { data: aar },
    { data: actionItems },
    { data: coreElementNotes },
    { data: commandHighlights },
    { data: coordinationRoles },
    { data: timelineEntries },
  ] = await Promise.all([
    supabase.from("aar").select("*").eq("incident_id", incident.id).maybeSingle<Aar>(),
    supabase
      .from("aar_action_items")
      .select("*")
      .eq("incident_id", incident.id)
      .order("created_at", { ascending: true })
      .returns<AarActionItem[]>(),
    supabase
      .from("aar_core_element_notes")
      .select("*")
      .eq("incident_id", incident.id)
      .order("sort_order", { ascending: true })
      .returns<AarCoreElementNote[]>(),
    supabase
      .from("aar_command_highlights")
      .select("*")
      .eq("incident_id", incident.id)
      .order("sort_order", { ascending: true })
      .returns<AarCommandHighlight[]>(),
    supabase
      .from("aar_coordination_roles")
      .select("*")
      .eq("incident_id", incident.id)
      .order("sort_order", { ascending: true })
      .returns<AarCoordinationRole[]>(),
    supabase
      .from("aar_timeline_entries")
      .select("*")
      .eq("incident_id", incident.id)
      .order("entry_date", { ascending: true })
      .order("entry_time", { ascending: true })
      .returns<AarTimelineEntry[]>(),
  ]);

  const timeline = timelineEntries ?? [];

  const facilityName = facilityOrg?.name ?? "";
  const eventName = aar?.event_name ?? incident.name;
  const notesByElement = new Map<CoreElement, AarCoreElementNote[]>(
    CORE_ELEMENTS.map((el) => [el, (coreElementNotes ?? []).filter((n) => n.core_element === el)])
  );
  const worked = (commandHighlights ?? []).filter((h) => h.kind === "worked");
  const fellShort = (commandHighlights ?? []).filter((h) => h.kind === "fell_short");

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 print:hidden">
        <Link href={`/incidents/${incident.id}/aar`} className="text-sm text-zinc-500 hover:underline">
          ← Edit AAR
        </Link>
        <PrintButton />
      </div>

      <main className="mx-auto max-w-4xl px-8 py-10 text-sm leading-relaxed print:px-0 print:py-0 print:text-black">
        <div className="mb-1 flex justify-between border-b-2 border-[#00274c] pb-2 text-[10px] uppercase tracking-wide text-[#00274c] print:text-black">
          <span>{facilityName}</span>
          <span>{eventName}</span>
        </div>

        <div className="mb-6 border-b border-black/10 pb-6 text-center print:border-black/30">
          <Image
            src="/logo.png"
            alt=""
            width={56}
            height={57}
            className="mx-auto mb-2"
          />
          <h1 className="text-xl font-bold uppercase tracking-tight text-[#00274c] print:text-black">
            {facilityName}
          </h1>
          <h2 className="text-lg font-bold uppercase tracking-tight text-[#00274c] print:text-black">
            {eventName}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-orange-600 print:text-black">
            After Action Review &amp; Improvement Plan
          </p>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-left text-xs sm:grid-cols-2">
            <div className="col-span-2">
              <span className="font-semibold">Event Name </span>
              {eventName}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Event Type: </span>
              {aar?.event_type ?? incident.type}
            </div>
            <div>
              <span className="font-semibold">Date of Event: </span>
              {(aar?.date_from ?? incident.incident_date)} – {(aar?.date_to ?? incident.incident_date)}
            </div>
            <div>
              <span className="font-semibold">Report Date </span>
              {aar?.report_date ?? "—"}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Location: </span>
              {aar?.location ?? facilityName}
            </div>
          </dl>
        </div>

        <ReportSection number="1" title="Executive Summary">
          <p className="whitespace-pre-wrap">{aar?.summary ?? "—"}</p>
        </ReportSection>

        <ReportSection number="2" title="Incident Timeline">
          {timeline.length === 0 ? (
            <p className="text-zinc-500">No timeline entries recorded.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#00274c] text-white print:bg-black">
                  <th className="border border-black/20 px-2 py-1 font-medium">Time</th>
                  <th className="border border-black/20 px-2 py-1 font-medium">Phase</th>
                  <th className="border border-black/20 px-2 py-1 font-medium">Update / Action</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 1 ? "bg-black/[.03] print:bg-transparent" : undefined}>
                    <td className="break-inside-avoid border border-black/20 px-2 py-1 align-top font-medium">
                      {e.entry_date} {e.entry_time}
                    </td>
                    <td className="border border-black/20 px-2 py-1 align-top">{e.phase ?? "—"}</td>
                    <td className="border border-black/20 px-2 py-1 align-top">{e.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </ReportSection>

        <ReportSection number="3" title="Performance Analysis: The Six Core Elements">
          <div className="space-y-4">
            {CORE_ELEMENTS.map((element) => {
              const notes = notesByElement.get(element) ?? [];
              return (
                <div key={element} className="break-inside-avoid">
                  <h3 className="font-semibold text-[#00274c] print:text-black">{element}</h3>
                  {notes.length === 0 ? (
                    <p className="text-zinc-500">—</p>
                  ) : (
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {notes.map((n) => (
                        <li key={n.id}>
                          <span className="font-semibold">{n.label}:</span> {n.narrative}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </ReportSection>

        <ReportSection number="4" title="Analysis of Command Structure">
          <p className="whitespace-pre-wrap">{aar?.command_structure_narrative ?? "—"}</p>

          <div className="mt-3 break-inside-avoid">
            <h3 className="font-semibold text-orange-600 print:text-black">What Worked</h3>
            {worked.length === 0 ? (
              <p className="text-zinc-500">—</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {worked.map((h) => (
                  <li key={h.id}>{h.narrative}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 break-inside-avoid">
            <h3 className="font-semibold text-orange-600 print:text-black">What Fell Short</h3>
            {fellShort.length === 0 ? (
              <p className="text-zinc-500">—</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {fellShort.map((h) => (
                  <li key={h.id}>{h.narrative}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 break-inside-avoid">
            <h3 className="font-semibold text-orange-600 print:text-black">Coordination Roles During the Event</h3>
            {(coordinationRoles ?? []).length === 0 ? (
              <p className="text-zinc-500">—</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {(coordinationRoles ?? []).map((r) => (
                  <li key={r.id}>
                    <span className="font-semibold">
                      {r.role_title}
                      {r.person_name && ` (${r.person_name})`}:
                    </span>{" "}
                    {r.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ReportSection>

        <ReportSection number="5" title="Improvement Plan (IP) Matrix">
          {(actionItems ?? []).length === 0 ? (
            <p className="text-zinc-500">No corrective actions recorded.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#00274c] text-white print:bg-black">
                  <th className="border border-black/20 px-2 py-1 font-medium">Core Element</th>
                  <th className="border border-black/20 px-2 py-1 font-medium">Observation / Deficiency</th>
                  <th className="border border-black/20 px-2 py-1 font-medium">Corrective Action</th>
                  <th className="border border-black/20 px-2 py-1 font-medium">Responsible Entity</th>
                </tr>
              </thead>
              <tbody>
                {(actionItems ?? []).map((item, i) => (
                  <tr key={item.id} className={i % 2 === 1 ? "bg-black/[.03] print:bg-transparent" : undefined}>
                    <td className="break-inside-avoid border border-black/20 px-2 py-1 align-top font-medium">
                      {item.core_element ?? "—"}
                    </td>
                    <td className="border border-black/20 px-2 py-1 align-top">{item.observation ?? "—"}</td>
                    <td className="border border-black/20 px-2 py-1 align-top">{item.corrective_action}</td>
                    <td className="border border-black/20 px-2 py-1 align-top">
                      {item.responsible_entity ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </ReportSection>

        <ReportSection number="6" title="Conclusion">
          <p className="whitespace-pre-wrap">{aar?.conclusion ?? "—"}</p>

          <div className="mt-6 break-inside-avoid">
            <p className="font-semibold">Prepared By:</p>
            <p>{aar?.prepared_by_name ?? "—"}</p>
            {aar?.prepared_by_title && <p>{aar.prepared_by_title}</p>}
            {aar?.prepared_by_organization && <p>{aar.prepared_by_organization}</p>}
            {aar?.prepared_at && <p>{aar.prepared_at}</p>}
          </div>
        </ReportSection>

        <p className="mt-12 border-t border-black/10 pt-4 text-center text-[10px] text-zinc-400 print:border-black/30 print:text-black">
          © {new Date().getFullYear()} Emergency Preparedness Solutions, LLC
        </p>
      </main>
    </>
  );
}

function ReportSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 break-inside-avoid-page">
      <h2 className="mb-2 border-b-2 border-orange-500 pb-1 text-base font-bold text-[#00274c] print:text-black">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
