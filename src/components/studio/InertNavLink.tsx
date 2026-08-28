"use client";

/**
 * Top-nav label used across the Lenscape Studio screens (editor, dashboard).
 * `active` renders the current section; inactive links are visual-only
 * placeholders for sections that don't exist yet.
 */
export function InertNavLink({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  if (active) {
    return (
      <span className="border-b-2 border-studio-primary pb-1 font-studio-heading text-studio-label-md font-bold text-studio-primary">
        {label}
      </span>
    );
  }
  // TODO: these sections aren't implemented yet.
  return (
    <span
      title="Coming soon"
      className="cursor-not-allowed rounded px-2 py-1 font-studio-heading text-studio-label-md font-medium text-studio-on-surface-variant/50"
    >
      {label}
    </span>
  );
}
