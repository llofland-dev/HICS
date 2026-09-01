import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/lib/supabase/types";
import { TopBar } from "@/components/top-bar";
import { ManageUsersPanel } from "./manage-users-panel";

export default async function ManageUsersPage() {
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
        <TopBar title="Manage users" backHref="/" />
        <main className="mx-auto max-w-2xl px-6 py-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You don&apos;t have access to this page. Only facility administrators can manage
            users.
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

  const { data: members } = await supabase
    .from("profiles")
    .select("id, org_id, role, first_name, last_name, email")
    .eq("org_id", profile.org_id!)
    .returns<Profile[]>();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <TopBar
        title="Manage users"
        subtitle={`Everyone currently in ${facilityOrg?.name ?? "your facility"}.`}
        backHref="/"
      />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <ManageUsersPanel members={members ?? []} currentUserId={user.id} />
      </main>
    </div>
  );
}
