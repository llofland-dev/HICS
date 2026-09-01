"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PlaybookIncident {
  id: string;
  name: string;
  status: "active" | "closed";
  started_at: string;
  closed_at: string | null;
}

interface ImportPlaybookPanelProps {
  incidentId: string;
  orgId: string | null;
  playbookOrgCode: string | null;
  playbookIncidentId: string | null;
  isSystemAdmin: boolean;
  canEdit: boolean;
}

const fieldClass =
  "w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#00274c] dark:border-white/10 dark:focus:border-[#7ba6d6]";

export function ImportPlaybookPanel({
  incidentId,
  orgId,
  playbookOrgCode,
  playbookIncidentId,
  isSystemAdmin,
  canEdit,
}: ImportPlaybookPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [codeDraft, setCodeDraft] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const [incidents, setIncidents] = useState<PlaybookIncident[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(playbookIncidentId ?? "");
  const [changingLink, setChangingLink] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!playbookOrgCode) return;
    fetch("/api/playbook-incidents")
      .then((res) => res.json())
      .then((body) => {
        if (body.error) {
          setLoadError(body.error);
          return;
        }
        setIncidents(body.incidents ?? []);
      })
      .catch(() => setLoadError("Could not load Playbook incidents"));
  }, [playbookOrgCode]);

  const linkedIncident = incidents?.find((incident) => incident.id === playbookIncidentId) ?? null;

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !codeDraft.trim()) return;
    setConnecting(true);
    setConnectError(null);

    const { error } = await supabase
      .from("organizations")
      .update({ playbook_org_code: codeDraft.trim().toUpperCase() })
      .eq("id", orgId);

    setConnecting(false);

    if (error) {
      setConnectError(error.message);
      return;
    }

    router.refresh();
  }

  async function handleImport() {
    if (!selectedId) return;
    setImporting(true);
    setImportError(null);
    setImportedCount(null);

    const res = await fetch("/api/playbook-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId, playbookIncidentId: selectedId }),
    });
    const body = await res.json();

    setImporting(false);

    if (!res.ok) {
      setImportError(body.error ?? "Import failed");
      return;
    }

    setImportedCount(body.importedCount);
    setChangingLink(false);
    router.refresh();
  }

  if (!playbookOrgCode) {
    if (!isSystemAdmin) {
      return (
        <p className="text-sm text-zinc-500">
          This facility isn&apos;t connected to a Playbook org yet. Ask a system admin to connect it
          here before you can import.
        </p>
      );
    }

    return (
      <form onSubmit={handleConnect} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="playbook-code" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Playbook org code
          </label>
          <input
            id="playbook-code"
            value={codeDraft}
            onChange={(e) => setCodeDraft(e.target.value)}
            placeholder="e.g. ADVENTIST"
            className={fieldClass}
          />
        </div>
        <button
          type="submit"
          disabled={connecting}
          className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Connect"}
        </button>
        {connectError && <p className="w-full text-sm text-red-600 dark:text-red-400">{connectError}</p>}
      </form>
    );
  }

  if (!canEdit) {
    return <p className="text-sm text-zinc-500">Only the incident&apos;s own facility can import here.</p>;
  }

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>;
  }

  if (!incidents) {
    return <p className="text-sm text-zinc-500">Loading Playbook incidents...</p>;
  }

  if (incidents.length === 0) {
    return <p className="text-sm text-zinc-500">No incidents found in Playbook for this org yet.</p>;
  }

  if (playbookIncidentId && !changingLink) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-black/10 bg-black/[.02] p-3 text-sm dark:border-white/10 dark:bg-white/[.03]">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Linked Playbook incident</p>
          {linkedIncident ? (
            <p className="font-medium text-black dark:text-zinc-50">
              {linkedIncident.name} ({linkedIncident.status},{" "}
              {new Date(linkedIncident.started_at).toLocaleDateString()})
            </p>
          ) : (
            <p className="text-zinc-500">Not found in Playbook (it may have been deleted).</p>
          )}
          <button
            onClick={() => setChangingLink(true)}
            className="mt-2 text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Change linked incident
          </button>
        </div>

        <button
          onClick={handleImport}
          disabled={importing}
          className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
        >
          {importing ? "Importing..." : "Import latest activity"}
        </button>
        <p className="text-xs text-zinc-500">
          Each import adds a new HICS 214 unit log entry batch — re-importing doesn&apos;t remove
          what a previous import already added.
        </p>

        {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
        {importedCount !== null && (
          <p className="text-sm text-zinc-500">
            Imported {importedCount} {importedCount === 1 ? "entry" : "entries"}. View them under{" "}
            <a href={`/incidents/${incidentId}/unit-logs`} className="underline">
              HICS 214
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="playbook-incident" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Playbook incident
          </label>
          <select
            id="playbook-incident"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select an incident...</option>
            {incidents.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.name} ({incident.status}, {new Date(incident.started_at).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleImport}
          disabled={!selectedId || importing}
          className="rounded-md bg-[#00274c] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#001a35] disabled:opacity-50"
        >
          {importing ? "Importing..." : "Link & import"}
        </button>
        {playbookIncidentId && (
          <button
            onClick={() => {
              setChangingLink(false);
              setSelectedId(playbookIncidentId);
            }}
            className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
        )}
      </div>

      {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
      {importedCount !== null && (
        <p className="text-sm text-zinc-500">
          Imported {importedCount} {importedCount === 1 ? "entry" : "entries"}. View them under{" "}
          <a href={`/incidents/${incidentId}/unit-logs`} className="underline">
            HICS 214
          </a>
          .
        </p>
      )}
    </div>
  );
}
