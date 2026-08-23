"use client";

import { useState } from "react";
import type { EopForm } from "@/lib/supabase/types";
import { BRAND } from "@/lib/palette";

export function FormFiller({ form }: { form: EopForm }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function setValue(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const body = form.fields
      .map((field) => {
        const value = values[field.id];
        const display = field.type === "checkbox" ? (value ? "Yes" : "No") : value || "(blank)";
        return `${field.label}: ${display}`;
      })
      .join("\n");

    const subject = encodeURIComponent(form.title);
    const mailBody = encodeURIComponent(body);
    const to = form.recipient_email ?? "";

    window.location.href = `mailto:${to}?subject=${subject}&body=${mailBody}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label
            htmlFor={field.id}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {field.label}
            {field.required && " *"}
          </label>

          {field.type === "select" ? (
            <select
              id={field.id}
              required={field.required}
              value={values[field.id] ?? ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-base outline-none dark:border-white/10 dark:bg-zinc-950 ${BRAND.focusBorder}`}
            >
              <option value="" disabled>
                Select…
              </option>
              {(field.options ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={field.id}
              required={field.required}
              rows={4}
              value={values[field.id] ?? ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-base outline-none dark:border-white/10 dark:bg-zinc-950 ${BRAND.focusBorder}`}
            />
          ) : field.type === "checkbox" ? (
            <input
              id={field.id}
              type="checkbox"
              checked={values[field.id] === "on"}
              onChange={(e) => setValue(field.id, e.target.checked ? "on" : "")}
              className="h-5 w-5"
            />
          ) : (
            <input
              id={field.id}
              type={field.type === "phone" ? "tel" : field.type}
              required={field.required}
              value={values[field.id] ?? ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-base outline-none dark:border-white/10 dark:bg-zinc-950 ${BRAND.focusBorder}`}
            />
          )}
        </div>
      ))}

      {form.fields.length === 0 && (
        <p className="text-sm text-zinc-500">This form has no fields yet.</p>
      )}

      <button
        type="submit"
        className={`w-full rounded-full px-4 py-3 text-base font-medium text-white transition-colors ${BRAND.button} ${BRAND.buttonHover}`}
      >
        Email this form
      </button>

      {sent && (
        <p className="text-sm text-zinc-500">
          Your email app should have opened with this form filled in — send it from there.
        </p>
      )}
    </form>
  );
}
