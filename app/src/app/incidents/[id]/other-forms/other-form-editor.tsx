"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRAND } from "@/lib/brand";
import type { FieldDef, OtherFormDef } from "@/lib/other-forms";

interface StoredData {
  fields: Record<string, unknown>;
  grids: Record<string, Record<string, Record<string, unknown>>>;
  repeating: Record<string, Record<string, unknown>[]>;
}

function emptyData(): StoredData {
  return { fields: {}, grids: {}, repeating: {} };
}

const fieldClass =
  "w-full rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/10 " +
  BRAND.focusBorder;

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className={`h-4 w-4 shrink-0 accent-[#00274c]`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        <option value=""></option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={fieldClass}
      />
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type}
      value={(value as string | number) ?? ""}
      onChange={(e) => onChange(field.type === "number" ? e.target.valueAsNumber || null : e.target.value)}
      className={fieldClass}
    />
  );
}

function FieldsSection({
  fields,
  data,
  onChange,
}: {
  fields: FieldDef[];
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((f) => (
        <label key={f.key} className={f.type === "checkbox" ? "flex items-center gap-2 text-sm" : "space-y-1 text-sm"}>
          {f.type === "checkbox" ? (
            <>
              <FieldInput field={f} value={data[f.key]} onChange={(v) => onChange(f.key, v)} />
              <span>{f.label}</span>
            </>
          ) : (
            <>
              <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">{f.label}</span>
              <FieldInput field={f} value={data[f.key]} onChange={(v) => onChange(f.key, v)} />
            </>
          )}
        </label>
      ))}
    </div>
  );
}

function GridSection({
  rowLabels,
  columns,
  data,
  onChange,
}: {
  rowLabels: string[];
  columns: FieldDef[];
  data: Record<string, Record<string, unknown>>;
  onChange: (row: string, col: string, value: unknown) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-black/10 p-2 text-left dark:border-white/10"></th>
            {columns.map((c) => (
              <th key={c.key} className="border-b border-black/10 p-2 text-left font-medium dark:border-white/10">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((row) => (
            <tr key={row}>
              <td className="border-b border-black/10 p-2 align-top dark:border-white/10">{row}</td>
              {columns.map((c) => (
                <td key={c.key} className="border-b border-black/10 p-2 align-top dark:border-white/10">
                  <FieldInput field={c} value={data[row]?.[c.key]} onChange={(v) => onChange(row, c.key, v)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RepeatingSection({
  fields,
  rows,
  onChangeRow,
  onAddRow,
  onRemoveRow,
}: {
  fields: FieldDef[];
  rows: Record<string, unknown>[];
  onChangeRow: (index: number, key: string, value: unknown) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="rounded-md border border-black/10 p-3 dark:border-white/10">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Row {index + 1}</span>
            <button
              onClick={() => onRemoveRow(index)}
              className="text-xs text-red-600 underline dark:text-red-400"
              type="button"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className="space-y-1 text-sm">
                <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">{f.label}</span>
                <FieldInput field={f} value={row[f.key]} onChange={(v) => onChangeRow(index, f.key, v)} />
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={onAddRow}
        type="button"
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      >
        Add row
      </button>
    </div>
  );
}

export function OtherFormEditor({
  def,
  incidentId,
  recordId,
  initialData,
}: {
  def: OtherFormDef;
  incidentId: string;
  recordId?: string;
  initialData?: Record<string, unknown>;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<StoredData>(() => ({ ...emptyData(), ...(initialData as Partial<StoredData>) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function sectionKey(title: string | undefined, index: number) {
    return title ?? `section-${index}`;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    if (recordId) {
      const { error } = await supabase
        .from("other_form_submissions")
        .update({ data, updated_at: new Date().toISOString() })
        .eq("id", recordId);
      setSaving(false);
      if (error) return setError(error.message);
      setSaved(true);
      router.refresh();
    } else {
      const { data: inserted, error } = await supabase
        .from("other_form_submissions")
        .insert({ incident_id: incidentId, form_code: def.code, data })
        .select("id")
        .single();
      setSaving(false);
      if (error) return setError(error.message);
      router.push(`/incidents/${incidentId}/other-forms/${def.code}/${inserted.id}`);
    }
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {def.sections.map((section, index) => {
        if (section.kind === "fields") {
          return (
            <section key={index}>
              {section.title && <h3 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{section.title}</h3>}
              <FieldsSection
                fields={section.fields}
                data={data.fields}
                onChange={(key, value) => setData((d) => ({ ...d, fields: { ...d.fields, [key]: value } }))}
              />
            </section>
          );
        }

        if (section.kind === "grid") {
          const key = sectionKey(section.title, index);
          return (
            <section key={index}>
              {section.title && <h3 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{section.title}</h3>}
              <GridSection
                rowLabels={section.rowLabels}
                columns={section.columns}
                data={data.grids[key] ?? {}}
                onChange={(row, col, value) =>
                  setData((d) => ({
                    ...d,
                    grids: { ...d.grids, [key]: { ...d.grids[key], [row]: { ...d.grids[key]?.[row], [col]: value } } },
                  }))
                }
              />
            </section>
          );
        }

        const key = sectionKey(section.title, index);
        const rows = data.repeating[key] ?? [];
        return (
          <section key={index}>
            {section.title && <h3 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{section.title}</h3>}
            <RepeatingSection
              fields={section.fields}
              rows={rows}
              onChangeRow={(rowIndex, fieldKey, value) =>
                setData((d) => {
                  const next = [...(d.repeating[key] ?? [])];
                  next[rowIndex] = { ...next[rowIndex], [fieldKey]: value };
                  return { ...d, repeating: { ...d.repeating, [key]: next } };
                })
              }
              onAddRow={() =>
                setData((d) => ({ ...d, repeating: { ...d.repeating, [key]: [...(d.repeating[key] ?? []), {}] } }))
              }
              onRemoveRow={(rowIndex) =>
                setData((d) => ({
                  ...d,
                  repeating: { ...d.repeating, [key]: (d.repeating[key] ?? []).filter((_, i) => i !== rowIndex) },
                }))
              }
            />
          </section>
        );
      })}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {saved && <p className="text-sm text-zinc-500">Saved.</p>}

      <button onClick={handleSave} disabled={saving} className={`print:hidden ${BRAND.buttonClass}`}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
