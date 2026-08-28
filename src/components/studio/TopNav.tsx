"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared shell for every top nav in the app — same logo, size, height,
 * and border everywhere. Pages only supply what differs: the nav/breadcrumb
 * content next to the logo, and the right-side actions.
 */
export function TopNav({
  nav,
  actions,
}: {
  /** Rendered right after the logo (nav links, a breadcrumb, or nothing). */
  nav?: ReactNode;
  /** Right-aligned actions (search, buttons, avatar, …). */
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-studio-border-subtle bg-studio-surface px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="shrink-0 font-studio-heading text-studio-headline-md font-bold tracking-tight text-studio-primary transition-opacity hover:opacity-80"
        >
          Lenscape
        </Link>
        {nav}
      </div>
      <div className="flex shrink-0 items-center gap-4">{actions}</div>
    </header>
  );
}
