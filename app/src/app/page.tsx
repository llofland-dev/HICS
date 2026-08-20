import { createClient } from "@/lib/supabase/server";
import type { Incident, Organization, Profile } from "@/lib/supabase/types";
import { SignOutButton } from "./sign-out-button";
import { NewIncidentForm } from "./new-incident-form";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // proxy.ts redirects unauthenticated requests to /login before this
    // renders, but keep the render safe if it's ever hit directly.
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  const org = profile?.org_id
    ? (
        await supabase
          .from("organizations")
          .select("id, name, type, parent_org_id, created_at")
          .eq("id", profile.org_id)
          .maybeSingle<Organization>()
      ).data
    : null;

  const incidents = profile?.org_id
    ? (
        await supabase
          .from("incidents")
          .select("id, facility_org_id, event_id, name, incident_date, type, status, created_at")
          .eq("facility_org_id", profile.org_id)
          .order("incident_date", { ascending: false })
          .returns<Incident[]>()
      ).data ?? []
    : [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <div>
          <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
            HICS Incident Tracker
          </h1>
          <p className="text-sm text-zinc-500">
            {fullName || user.email} · {org ? org.name : "No facility assigned"}
          </p>
        </div>
        <SignOutButton />
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {!org ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Your account isn&apos;t linked to a facility yet. Ask your system administrator to
            assign you to an organization.
          </p>
        ) : (
          <>
            <section className="mb-8 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
              <NewIncidentForm facilityOrgId={org.id} />
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Incidents
              </h2>
              {incidents.length === 0 ? (
                <p className="text-sm text-zinc-500">No incidents yet.</p>
              ) : (
                <ul className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950">
                  {incidents.map((incident) => (
                    <li key={incident.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-black dark:text-zinc-50">
                          {incident.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {incident.incident_date} · {incident.type}
                        </p>
                      </div>
                      <span className="rounded-full bg-black/5 px-2 py-1 text-xs capitalize text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
                        {incident.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
