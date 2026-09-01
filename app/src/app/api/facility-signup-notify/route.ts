import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface NotificationTarget {
  kind: "new_facility" | "existing_facility";
  org_id: string | null;
  org_name: string | null;
  recipient_emails: string[];
  applicant_name: string;
  applicant_email: string;
  requested_code: string | null;
}

// Fires right after signUp() -- deliberately does NOT gate on auth.getUser()
// like every other route in this app, because no session exists yet at
// this point (email confirmation is pending). facility_signup_notification_targets
// is intentionally callable by anon, keyed by the new profile's unguessable
// uuid rather than the (public, guessable) facility code, so this route
// can't be used to enumerate admin emails per facility code from the
// browser. See supabase/migrations/20260830120000_facility_request_functions.sql.
export async function POST(request: Request) {
  const supabase = await createClient();

  const { profileId } = (await request.json()) as { profileId?: string };
  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  const { data: target, error } = await supabase
    .rpc("facility_signup_notification_targets", { p_profile_id: profileId })
    .maybeSingle<NotificationTarget>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!target || target.recipient_emails.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    // Not configured yet -- signup itself must never fail because of this.
    return NextResponse.json({ ok: true, skipped: true, reason: "Email not configured" });
  }

  const origin = new URL(request.url).origin;
  const reviewUrl =
    target.kind === "new_facility" ? `${origin}/admin/facility-requests` : `${origin}/admin`;
  const subject =
    target.kind === "new_facility"
      ? "New MEDICS facility request"
      : `New user request for ${target.org_name}`;
  const applicant = target.applicant_name || target.applicant_email;
  const text =
    `${applicant} (${target.applicant_email}) requested access` +
    (target.requested_code ? ` with code "${target.requested_code}"` : "") +
    `.\n\nReview: ${reviewUrl}`;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: target.recipient_emails,
    subject,
    text,
  });

  if (sendError) {
    return NextResponse.json({ error: sendError.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
