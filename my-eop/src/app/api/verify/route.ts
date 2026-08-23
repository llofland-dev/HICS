import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createSessionCookie } from "@/lib/eop-session";

// Re-verifies server-side regardless of what the client already checked —
// the client-side lookup (for deciding whether to show a password field) is
// UX only, not a security boundary. This is the only place the org-code +
// password gate is actually enforced.
export async function POST(request: Request) {
  const { code, password } = (await request.json()) as { code?: string; password?: string };

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: orgs, error: lookupError } = await supabase.rpc("eop_lookup_org", {
    p_code: code,
  });

  if (lookupError || !orgs || orgs.length === 0) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  const org = orgs[0] as { id: string; name: string; has_password: boolean };

  if (org.has_password) {
    const { data: ok, error: verifyError } = await supabase.rpc("eop_verify_org_password", {
      p_org_id: org.id,
      p_password: password ?? "",
    });

    if (verifyError || !ok) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
  }

  const cookie = createSessionCookie(org.id);
  const response = NextResponse.json({ ok: true, name: org.name });
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cookie.maxAge,
  });

  return response;
}
