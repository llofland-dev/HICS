"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
    >
      Print
    </button>
  );
}
