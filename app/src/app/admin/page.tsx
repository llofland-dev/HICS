import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/lib/supabase/types";
import { AdminUsersPanel } from "./admin-users-panel";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profile?.role !== "facility_admin") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <header className="border-b border-black/10 px-6 py-4 dark:border-white/10">
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            ← Home
          </Link>
        </header>
        <main className="mx-auto max-w-2xl px-6 py-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You don&apos;t have access to this page. Only facility administrators can assign new
            users to a facility.
          </p>
        </main>
      </div>
    );
  }

  const { data: facilityOrg } = await supabase
    .from("organizations")
    .select("id, name, type, parent_org_id, created_at")
    .eq("id", profile.org_id!)
    .maybeSingle<Organization>();

  const { data: pending } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email")
    .is("org_id", null)
    .returns<Profile[]>();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/10 px-6 py-4 dark:border-white/10">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Home
        </Link>
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Pending users</h1>
        <p className="text-sm text-zinc-500">
          New sign-ups waiting to be assigned to {facilityOrg?.name ?? "your facility"}.
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <AdminUsersPanel pending={pending ?? []} facilityName={facilityOrg?.name ?? "your facility"} />
      </main>
    </div>
  );
}
