"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/brand";

export default function SignUpPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [facilityCode, setFacilityCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, facility_code: facilityCode },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Best-effort: tells the right admin (Super Admin for a brand-new
    // facility, or that facility's own admin) that someone is waiting to be
    // let in. Never blocks the "check your email" state on this succeeding.
    if (data.user) {
      fetch("/api/facility-signup-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: data.user.id }),
      }).catch(() => {});
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-sm space-y-3 rounded-lg border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-zinc-950">
          <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Check your email</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We sent a confirmation link to <span className="font-medium">{email}</span>. Click it,
            then{" "}
            <Link href="/login" className="underline">
              sign in
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-xl bg-white p-2">
            <Image src="/logo.png" alt="Emergency Preparedness Solutions" width={72} height={74} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Create account</h1>
            <p className="text-sm text-zinc-500">MEDICS</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label
              htmlFor="first-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              First name
            </label>
            <input
              id="first-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
            />
          </div>

          <div className="flex-1 space-y-1">
            <label
              htmlFor="last-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Last name
            </label>
            <input
              id="last-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="facility-code"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Facility code (leave blank if your organization is new to MEDICS)
          </label>
          <input
            id="facility-code"
            value={facilityCode}
            onChange={(e) => setFacilityCode(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className={`w-full ${BRAND.buttonClass}`}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
