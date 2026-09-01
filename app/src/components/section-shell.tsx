// Shared card wrapper for form sections (ICS 201/203/215A, AAR). Was
// previously copy-pasted per-file; consolidated here so every form gets the
// same visual treatment (numbered badge, left accent) from one place.
const NUMBERED_TITLE = /^(\d+)\.\s*(.*)$/;

export function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  const match = title.match(NUMBERED_TITLE);

  return (
    <section className="space-y-3 rounded-lg border border-l-4 border-black/10 border-l-[#00274c] bg-white p-4 print:break-inside-avoid print:border-none print:bg-transparent print:p-0 dark:border-white/10 dark:border-l-[#7ba6d6] dark:bg-zinc-950">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-black dark:text-zinc-50 print:text-black">
        {match && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#00274c] text-xs font-bold text-white print:bg-transparent print:text-black dark:bg-[#7ba6d6] dark:text-[#00131f]">
            {match[1]}
          </span>
        )}
        <span>{match ? match[2] : title}</span>
      </h2>
      {children}
    </section>
  );
}
