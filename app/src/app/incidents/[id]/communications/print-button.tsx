"use client";

import { BRAND } from "@/lib/brand";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className={`print:hidden ${BRAND.secondaryButtonClassSm}`}>
      Print
    </button>
  );
}
