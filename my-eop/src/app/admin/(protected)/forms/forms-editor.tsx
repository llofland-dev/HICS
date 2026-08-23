"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EopForm, FormField, FormFieldType } from "@/lib/supabase/types";

const fieldClass =
  "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-black/30 dark:border-white/10 dark:focus:border-white/30";

const FIELD_TYPES: FormFieldType[] = ["text", "phone", "email", "textarea", "checkbox", "date", "select"];

function newFieldId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `f${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export function FormsEditor({ orgId, forms }: { orgId: string; forms: EopForm[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedId, setSelectedId] = useState<string | null>(forms[0]?.id ?? null);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local draft of the selected form's editable fields, so typing doesn't
  // round-trip to the server on every keystroke — saved explicitly.
  const selected = forms.find((f) => f.id === selectedId) ?? null;
  const [draft, setDraft] = useState<{
    title: string;
    description: string;
    recipient_email: string;
    fields: FormField[];
  } | null>(null);

  function selectForm(form: EopForm) {
    setSelectedId(form.id);
    setDraft({
      title: form.title,
      description: form.description ?? "",
      recipient_email: form.recipient_email ?? "",
      fields: form.fields,
    });
  }

  async function addForm(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
    setError(null);

    const nextOrder = forms.reduce((max, f) => Math.max(max, f.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("forms")
      .insert({ org_id: orgId, title: newTitle.trim(), fields: [], sort_order: nextOrder })
      .select("id, org_id, title, description, recipient_email, fields, sort_order, created_at")
      .single();

    setBusy(false);
    if (error) return setError(error.message);
    setNewTitle("");
    selectForm(data as EopForm);
    router.refresh();
  }

  async function deleteForm(form: EopForm) {
    if (!confirm(`Delete "${form.title}"?`)) return;
    const { error } = await supabase.from("forms").delete().eq("id", form.id);
    if (error) return setError(error.message);
    if (selectedId === form.id) {
      setSelectedId(null);
      setDraft(null);
    }
    router.refresh();
  }

  function updateDraftField(index: number, patch: Partial<FormField>) {
    setDraft((d) => {
      if (!d) return d;
      const fields = d.fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
      return { ...d, fields };
    });
  }

  function addDraftField() {
    setDraft((d) =>
      d
        ? { ...d, fields: [...d.fields, { id: newFieldId(), label: "", type: "text", required: false }] }
        : d
    );
  }

  function removeDraftField(index: number) {
    setDraft((d) => (d ? { ...d, fields: d.fields.filter((_, i) => i !== index) } : d));
  }

  function moveDraftField(index: number, direction: -1 | 1) {
    setDraft((d) => {
      if (!d) return d;
      const fields = [...d.fields];
      const target = index + direction;
      if (target < 0 || target >= fields.length) return d;
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...d, fields };
    });
  }

  async function saveDraft() {
    if (!selected || !draft) return;
    setBusy(true);
    setError(null);

    const { error } = await supabase
      .from("forms")
      .update({
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        recipient_email: draft.recipient_email.trim() || null,
        fields: draft.fields,
      })
      .eq("id", selected.id);

    setBusy(false);
    if (error) return setError(error.message);
    router.refresh();
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Forms</h3>
        <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950">
          {forms.map((form) => (
            <div key={form.id} className="flex items-center justify-between gap-1 px-3 py-2">
              <button
                onClick={() => selectForm(form)}
                className={`truncate text-left text-sm ${
                  selectedId === form.id ? "font-medium text-black dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {form.title}
              </button>
              <button onClick={() => deleteForm(form)} className="shrink-0 text-xs text-red-600 dark:text-red-400">
                ✕
              </button>
            </div>
          ))}
          {forms.length === 0 && <p className="px-3 py-2 text-sm text-zinc-500">None yet.</p>}
        </div>

        <form onSubmit={addForm} className="space-y-1.5">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New form title"
            className={fieldClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Add form
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {!draft ? (
          <p className="text-sm text-zinc-500">Select or create a form to edit it.</p>
        ) : (
          <>
            <div className="space-y-2 rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Title</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => d && { ...d, title: e.target.value })}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
                <input
                  value={draft.description}
                  onChange={(e) => setDraft((d) => d && { ...d, description: e.target.value })}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Recipient email
                </label>
                <input
                  type="email"
                  value={draft.recipient_email}
                  onChange={(e) => setDraft((d) => d && { ...d, recipient_email: e.target.value })}
                  placeholder="Pre-fills the To: field"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Fields</h4>
              {draft.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-zinc-950"
                >
                  <input
                    value={field.label}
                    onChange={(e) => updateDraftField(index, { label: e.target.value })}
                    placeholder="Field label"
                    className={`flex-1 ${fieldClass}`}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateDraftField(index, { type: e.target.value as FormFieldType })}
                    className={fieldClass}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateDraftField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  {field.type === "select" && (
                    <input
                      value={(field.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateDraftField(index, {
                          options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Options (comma-separated)"
                      className={`w-full ${fieldClass}`}
                    />
                  )}
                  <div className="flex gap-1 text-xs text-zinc-500">
                    <button onClick={() => moveDraftField(index, -1)} disabled={index === 0} className="disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      onClick={() => moveDraftField(index, 1)}
                      disabled={index === draft.fields.length - 1}
                      className="disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button onClick={() => removeDraftField(index)} className="text-red-600 dark:text-red-400">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addDraftField}
                className="rounded-md border border-dashed border-black/20 px-3 py-1.5 text-xs text-zinc-600 dark:border-white/20 dark:text-zinc-400"
              >
                + Add field
              </button>
            </div>

            <button
              onClick={saveDraft}
              disabled={busy}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {busy ? "Saving..." : "Save form"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
