"use client";

import { UnfoldHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ExplodeControls({
  className,
  compact = false,
}: {
  className?: string;
  /** Tighter layout for the floating viewport chip */
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
          ? "rounded-xl border border-white/10 bg-neutral-950/80 p-3 text-white shadow-xl backdrop-blur-md"
          : "",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className={cn(
              "font-medium",
              compact ? "text-xs text-white" : "text-xs text-muted-foreground",
            )}
          >
            Exploded view
          </p>
          {!compact && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Separate anatomical parts in the viewport
            </p>
          )}
        </div>
        <Button
          type="button"
          size={compact ? "xs" : "sm"}
          variant={exploded ? "secondary" : compact ? "ghost" : "outline"}
          className={cn(
            "shrink-0 gap-1.5",
            compact &&
              !exploded &&
              "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white",
          )}
          onClick={toggleExplode}
          aria-pressed={exploded}
        >
          <UnfoldHorizontal className="size-3.5" />
          {exploded ? "Assemble" : "Explode"}
        </Button>
      </div>

      <label className="flex items-center gap-2">
        <span className="sr-only">Explode amount</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explodeAmount}
          onChange={(e) => setExplodeAmount(Number(e.target.value))}
          className={cn(
            "h-1.5 w-full cursor-pointer appearance-none rounded-full",
            compact
              ? "bg-white/20 accent-sky-400"
              : "bg-muted accent-sky-600",
          )}
        />
        <span
          className={cn(
            "w-8 text-right tabular-nums",
            compact ? "text-[11px] text-white/70" : "text-[11px] text-muted-foreground",
          )}
        >
          {Math.round(explodeAmount * 100)}%
        </span>
      </label>
    </div>
  );
}
