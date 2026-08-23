"use client";

import { useMemo, useState } from "react";
import type { Contact } from "@/lib/supabase/types";
import { PhoneIcon, MailIcon, SearchIcon } from "@/components/icons";
import { BRAND } from "@/lib/palette";

export function ContactsList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.role_title, c.category].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [contacts, query]);

  const grouped = new Map<string, Contact[]>();
  for (const contact of filtered) {
    const key = contact.category ?? "Contacts";
    grouped.set(key, [...(grouped.get(key) ?? []), contact]);
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts"
          className={`w-full rounded-full border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none dark:border-white/10 dark:bg-zinc-950 ${BRAND.focusBorder}`}
        />
      </div>

      {filtered.length === 0 && <p className="text-center text-sm text-zinc-500">No contacts found.</p>}

      {[...grouped.entries()].map(([category, list]) => (
        <section key={category} className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{category}</h2>
          <div className="space-y-2">
            {list.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-950"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{contact.name}</p>
                  {contact.role_title && (
                    <p className="truncate text-xs text-zinc-500">{contact.role_title}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      aria-label={`Email ${contact.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-white dark:bg-zinc-600"
                    >
                      <MailIcon className="h-5 w-5" />
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      aria-label={`Call ${contact.name}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${BRAND.button}`}
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
