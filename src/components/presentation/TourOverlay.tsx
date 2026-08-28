"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TourOverlay() {
  const mode = useEditorStore((s) => s.mode);
  const hotspots = useEditorStore((s) => s.hotspots);
  const currentStepIndex = useEditorStore((s) => s.currentStepIndex);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const isNarrating = useEditorStore((s) => s.isNarrating);
  const playTour = useEditorStore((s) => s.playTour);
  const pauseTour = useEditorStore((s) => s.pauseTour);
  const nextStep = useEditorStore((s) => s.nextStep);
  const prevStep = useEditorStore((s) => s.prevStep);
  const stopTour = useEditorStore((s) => s.stopTour);
  const goToStep = useEditorStore((s) => s.goToStep);
  const hotspot = useCurrentHotspot();

  if (mode !== "present" || !hotspot) return null;

  const progress = ((currentStepIndex + 1) / hotspots.length) * 100;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-4 md:p-6">
      <div className="lenscape-studio pointer-events-auto mx-auto w-full max-w-2xl overflow-hidden rounded-studio-lg border border-studio-border-subtle bg-studio-surface-overlay text-studio-on-surface shadow-2xl backdrop-blur-md">
        <div className="h-0.5 bg-studio-surface-muted">
          <div
            className="h-full bg-studio-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-studio-heading text-studio-label-sm tracking-[0.18em] text-studio-primary uppercase">
                Step {currentStepIndex + 1} of {hotspots.length}
              </p>
              <h2 className="font-studio-heading text-studio-headline-md text-studio-on-surface md:text-studio-headline-lg">
                {hotspot.title}
              </h2>
            </div>
            {isNarrating && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-studio-full bg-studio-primary/15 px-2.5 py-1 font-studio-heading text-studio-label-sm text-studio-primary">
                <Volume2 className="size-3.5 animate-pulse" />
                Narrating
              </span>
            )}
          </div>

          <p className="max-h-28 overflow-y-auto font-studio-body text-studio-body-md leading-relaxed text-studio-on-surface-variant md:max-h-32">
            {hotspot.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                aria-label="Previous step"
                className="flex size-7 items-center justify-center rounded-studio text-studio-on-surface transition-colors hover:bg-studio-surface-variant disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>

              {isPlaying ? (
                <button
                  type="button"
                  onClick={pauseTour}
                  className="flex items-center gap-1.5 rounded-studio bg-studio-surface-variant px-2.5 py-1.5 font-studio-heading text-studio-label-md text-studio-on-surface transition-colors hover:bg-studio-surface-container-highest"
                >
                  <Pause className="size-3.5" />
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={playTour}
                  className="flex items-center gap-1.5 rounded-studio bg-studio-surface-variant px-2.5 py-1.5 font-studio-heading text-studio-label-md text-studio-on-surface transition-colors hover:bg-studio-surface-container-highest"
                >
                  <Play className="size-3.5" />
                  {currentStepIndex === hotspots.length - 1 && !isNarrating
                    ? "Replay"
                    : "Play"}
                </button>
              )}

              <button
                type="button"
                onClick={nextStep}
                disabled={currentStepIndex >= hotspots.length - 1}
                aria-label="Next step"
                className="flex size-7 items-center justify-center rounded-studio text-studio-on-surface transition-colors hover:bg-studio-surface-variant disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={stopTour}
              className="flex items-center gap-1.5 rounded-studio px-2.5 py-1.5 font-studio-heading text-studio-label-md text-studio-on-surface-variant transition-colors hover:bg-studio-surface-variant hover:text-studio-on-surface"
            >
              <Square className="size-3" />
              Exit tour
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto pt-1">
            {hotspots.map((h, i) => (
              <button
                key={h.id}
                type="button"
                title={h.title}
                onClick={() => goToStep(i, { speak: true })}
                className={cn(
                  "h-1.5 w-6 shrink-0 rounded-studio-full transition-colors",
                  i === currentStepIndex
                    ? "bg-studio-primary"
                    : i < currentStepIndex
                      ? "bg-studio-outline-variant"
                      : "bg-studio-surface-variant hover:bg-studio-outline-variant",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
