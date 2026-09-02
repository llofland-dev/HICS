"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/brand";

// Reached via the link in the password-reset email. Supabase's GoTrue can
// issue recovery links in either shape depending on project config: a
// `?code=` query param (PKCE) or access_token/refresh_token in the URL
// *hash* fragment (implicit flow) — @supabase/ssr's browser client doesn't
// auto-detect the hash-fragment shape, so `updateUser` below would
// otherwise fail with "Auth session missing!" if that's what shows up.
// Establish the session ourselves on mount, handling both shapes.
export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    const establishSession = code
      ? supabase.auth.exchangeCodeForSession(code)
      : accessToken && refreshToken
        ? supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        : Promise.resolve({ error: hashParams.get("error") ? new Error("expired") : null });

    establishSession.then(({ error }) => {
      if (error) setError("This reset link is invalid or has expired. Request a new one.");
      setReady(true);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#00274c] p-8">
        <div className="w-full max-w-sm space-y-3 rounded-xl border border-black/10 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Password updated</h1>
          <p className="text-sm text-zinc-500">You can now sign in with your new password.</p>
          <Link href="/" className="inline-block text-sm underline">
            Go to MEDICS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00274c] px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-black/10 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-zinc-950"
      >
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Set a new password</h1>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/10 ${BRAND.focusBorder}`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirm" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/10 ${BRAND.focusBorder}`}
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={loading || !ready} className={`w-full ${BRAND.buttonClass}`}>
          {!ready ? "Verifying link..." : loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
