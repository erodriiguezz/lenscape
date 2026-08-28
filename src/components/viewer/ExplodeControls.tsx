"use client";

import { UnfoldHorizontal, Scan } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ExplodeControls({
  className,
  compact = false,
}: {
  className?: string;
  /** Glass HUD chip floating over the viewport, vs. inline in the Inspector */
  compact?: boolean;
}) {
  const explodeAmount = useEditorStore((s) => s.explodeAmount);
  const setExplodeAmount = useEditorStore((s) => s.setExplodeAmount);
  const toggleExplode = useEditorStore((s) => s.toggleExplode);
  const exploded = explodeAmount > 0.02;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        compact
          ? "rounded-studio-lg border border-studio-border-subtle bg-studio-surface-overlay p-3 text-studio-on-surface shadow-lg backdrop-blur-xl"
          : "",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "font-studio-heading font-medium",
            compact
              ? "text-studio-label-md text-studio-on-surface"
              : "text-studio-label-sm text-studio-text-muted",
          )}
        >
          Exploded view
        </p>
        <button
          type="button"
          onClick={toggleExplode}
          aria-pressed={exploded}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-studio px-2.5 py-1 font-studio-heading text-studio-label-sm transition-colors",
            exploded
              ? "bg-studio-primary text-studio-on-primary"
              : "border border-studio-outline-variant bg-studio-surface-variant/40 text-studio-on-surface hover:bg-studio-surface-variant",
          )}
        >
          <UnfoldHorizontal className="size-3.5" />
          {exploded ? "Assemble" : "Explode"}
        </button>
      </div>

      <label className="flex items-center gap-3">
        <span className="sr-only">Explode amount</span>
        <Scan className="size-[18px] shrink-0 text-studio-text-functional" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explodeAmount}
          onChange={(e) => setExplodeAmount(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-studio-full bg-studio-surface-muted accent-studio-tertiary"
        />
        <span className="w-8 shrink-0 text-right font-studio-mono text-studio-mono text-studio-text-muted">
          {Math.round(explodeAmount * 100)}%
        </span>
      </label>
    </div>
  );
}
