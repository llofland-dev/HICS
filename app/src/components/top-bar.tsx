import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// Shared navy brand bar used at the top of every page shell (home, admin,
// staff, incident detail). Keeping this in one place is what makes the app
// read as one product instead of a pile of ad-hoc pages.
export function TopBar({
  title,
  subtitle,
  backHref,
  backLabel = "Home",
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="bg-[#00274c] px-6 py-4 print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0 rounded-lg">
            <Image src="/icon-mark.png" alt="" width={36} height={36} priority />
          </Link>
          <div className="min-w-0">
            {backHref && (
              <Link
                href={backHref}
                className="block text-xs text-blue-200/80 hover:text-white hover:underline"
              >
                ← {backLabel}
              </Link>
            )}
            <h1 className="truncate text-lg font-semibold text-white">{title}</h1>
            {subtitle && <div className="text-sm text-blue-100/80">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-4">{actions}</div>}
      </div>
    </header>
  );
}
