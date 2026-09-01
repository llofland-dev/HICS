"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function sections(incidentId: string) {
  return [
    { href: `/incidents/${incidentId}`, label: "Org Chart" },
    { href: `/incidents/${incidentId}/ics201`, label: "HICS 201" },
    { href: `/incidents/${incidentId}/ics203`, label: "HICS 203" },
    { href: `/incidents/${incidentId}/ics204`, label: "HICS 204" },
    { href: `/incidents/${incidentId}/communications`, label: "HICS 205A" },
    { href: `/incidents/${incidentId}/messages`, label: "HICS 213" },
    { href: `/incidents/${incidentId}/unit-logs`, label: "HICS 214" },
    { href: `/incidents/${incidentId}/ics215a`, label: "HICS 215A" },
    { href: `/incidents/${incidentId}/aar`, label: "AAR" },
    { href: `/incidents/${incidentId}/import-playbook`, label: "Import from Playbook" },
  ];
}

export function IncidentNav({ incidentId }: { incidentId: string }) {
  const pathname = usePathname();
  const rootHref = `/incidents/${incidentId}`;

  return (
    <nav className="overflow-x-auto border-b border-black/10 bg-white px-6 print:hidden dark:border-white/10 dark:bg-zinc-950">
      <div className="flex w-max gap-x-1 text-sm sm:w-auto sm:flex-wrap">
        {sections(incidentId).map((s) => {
          const active = s.href === rootHref ? pathname === rootHref : pathname.startsWith(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={
                active
                  ? "shrink-0 whitespace-nowrap border-b-2 border-[#00274c] px-3 py-3 font-medium text-[#00274c] dark:border-[#7ba6d6] dark:text-[#7ba6d6]"
                  : "shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
